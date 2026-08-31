# Stops the backend + frontend processes started by start.ps1.

# This script lives in app\scripts\, so the project root is two levels up.
$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$runDir = Join-Path $root ".run"

foreach ($name in "backend", "frontend") {
    $pidFile = Join-Path $runDir "$name.pid"
    if (Test-Path $pidFile) {
        $procId = Get-Content $pidFile -ErrorAction SilentlyContinue
        if ($procId -and (Get-Process -Id $procId -ErrorAction SilentlyContinue)) {
            taskkill /PID $procId /T /F | Out-Null
        }
        Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
    }
}
