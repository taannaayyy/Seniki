# Starts the Seniki backend + frontend in the background and opens the app
# in the default browser. Designed to be launched hidden (no console window)
# from the desktop shortcut created by create-shortcut.ps1.

$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
$runDir = Join-Path $root ".run"
$appDir = Join-Path $root "app"
$webDir = Join-Path $root "web"
$venvPython = Join-Path $appDir ".venv\Scripts\python.exe"
$frontendUrl = "http://localhost:5173"
$logFile = Join-Path $runDir "start.log"

New-Item -ItemType Directory -Path $runDir -Force | Out-Null

function Log($msg) {
    "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  $msg" | Add-Content -Path $logFile
}

function Test-ProcessAlive([string]$pidFile) {
    if (-not (Test-Path $pidFile)) { return $false }
    $procId = Get-Content $pidFile -ErrorAction SilentlyContinue
    if (-not $procId) { return $false }
    return [bool](Get-Process -Id $procId -ErrorAction SilentlyContinue)
}

$backendPidFile = Join-Path $runDir "backend.pid"
$frontendPidFile = Join-Path $runDir "frontend.pid"

try {
    if (Test-ProcessAlive $frontendPidFile) {
        Log "Frontend already running."
    } else {
        Log "Starting frontend."
        $frontend = Start-Process -FilePath "cmd.exe" -ArgumentList '/c "npm run dev"' `
            -WorkingDirectory $webDir -WindowStyle Hidden -PassThru `
            -RedirectStandardOutput (Join-Path $runDir "frontend.log") `
            -RedirectStandardError (Join-Path $runDir "frontend.err.log")
        $frontend.Id | Set-Content $frontendPidFile
    }

    if (Test-Path $venvPython) {
        if (Test-ProcessAlive $backendPidFile) {
            Log "Backend already running."
        } else {
            Log "Starting backend."
            $backend = Start-Process -FilePath $venvPython -ArgumentList "main.py" `
                -WorkingDirectory $appDir -WindowStyle Hidden -PassThru `
                -RedirectStandardOutput (Join-Path $runDir "backend.log") `
                -RedirectStandardError (Join-Path $runDir "backend.err.log")
            $backend.Id | Set-Content $backendPidFile
        }
    } else {
        Log "Skipping backend: $venvPython not found. Run setup.py first."
    }

    Log "Waiting for dev server to come up."
    $ready = $false
    for ($i = 0; $i -lt 30; $i++) {
        try {
            Invoke-WebRequest -Uri $frontendUrl -UseBasicParsing -TimeoutSec 1 | Out-Null
            $ready = $true
            break
        } catch {
            Start-Sleep -Seconds 1
        }
    }

    Log "Ready: $ready. Opening browser."
    Start-Process $frontendUrl
} catch {
    Log "ERROR: $_"
}
