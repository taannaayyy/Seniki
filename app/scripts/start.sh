#!/usr/bin/env bash
# Starts the Seniki backend + frontend in the background and opens the app
# in the default browser. Designed to be launched from the desktop shortcut
# created by setup.py (macOS/Linux counterpart of start.ps1).

set -u

# This script lives in app/scripts/, so the project root is two levels up.
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
run_dir="$root/.run"
app_dir="$root/app"
web_dir="$root/web"
venv_python="$app_dir/.venv/bin/python"
frontend_url="http://localhost:5173"
log_file="$run_dir/start.log"

mkdir -p "$run_dir"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S')  $1" >> "$log_file"
}

process_alive() {
    local pid_file="$1"
    [ -f "$pid_file" ] || return 1
    local procId
    procId="$(cat "$pid_file" 2>/dev/null)"
    [ -n "$procId" ] || return 1
    kill -0 "$procId" 2>/dev/null
}

open_url() {
    if command -v open >/dev/null 2>&1; then
        open "$1"
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$1"
    else
        log "No opener found; browse to $1 manually."
    fi
}

# Launched from Finder there is no console to read, so surface hard failures
# in a dialog instead of only in the log.
alert() {
    log "$1"
    if command -v osascript >/dev/null 2>&1; then
        osascript -e "display dialog \"$1\" with title \"Seniki\" buttons {\"OK\"} default button 1 with icon caution" >/dev/null 2>&1
    fi
}

# A Finder-launched .app inherits a minimal PATH (/usr/bin:/bin:/usr/sbin:/sbin),
# so Homebrew/nvm/volta node is invisible even though it works in a terminal.
ensure_npm_on_path() {
    command -v npm >/dev/null 2>&1 && return 0

    local dir
    for dir in /opt/homebrew/bin /usr/local/bin "$HOME/.volta/bin" "$HOME/.asdf/shims" "$HOME/.local/bin"; do
        if [ -x "$dir/npm" ]; then
            PATH="$dir:$PATH"
            return 0
        fi
    done

    # nvm keeps node under a versioned directory; take the highest one present.
    local nvm_dir="${NVM_DIR:-$HOME/.nvm}"
    if [ -d "$nvm_dir/versions/node" ]; then
        dir="$(find "$nvm_dir/versions/node" -maxdepth 2 -type f -name npm -perm -u+x 2>/dev/null |
            sort -V | tail -n 1)"
        if [ -n "$dir" ]; then
            PATH="$(dirname "$dir"):$PATH"
            return 0
        fi
    fi

    # Last resort: ask the login shell, which sources the user's profile.
    local login_npm
    login_npm="$("${SHELL:-/bin/sh}" -lic 'command -v npm' 2>/dev/null | tail -n 1)"
    if [ -n "$login_npm" ] && [ -x "$login_npm" ]; then
        PATH="$(dirname "$login_npm"):$PATH"
        return 0
    fi

    return 1
}

backend_pid_file="$run_dir/backend.pid"
frontend_pid_file="$run_dir/frontend.pid"

if ! ensure_npm_on_path; then
    alert "Node.js (npm) was not found. Install Node.js, then run setup.py again."
    exit 1
fi
log "Using npm at $(command -v npm)."

if process_alive "$frontend_pid_file"; then
    log "Frontend already running."
else
    log "Starting frontend."
    (cd "$web_dir" && npm run dev >"$run_dir/frontend.log" 2>"$run_dir/frontend.err.log") &
    echo $! > "$frontend_pid_file"
fi

if [ -x "$venv_python" ]; then
    if process_alive "$backend_pid_file"; then
        log "Backend already running."
    else
        log "Starting backend."
        (cd "$app_dir" && "$venv_python" main.py >"$run_dir/backend.log" 2>"$run_dir/backend.err.log") &
        echo $! > "$backend_pid_file"
    fi
else
    log "Skipping backend: $venv_python not found. Run setup.py first."
fi

log "Waiting for dev server to come up."
ready=false
for _ in $(seq 1 30); do
    if curl -sf -m 1 "$frontend_url" >/dev/null 2>&1; then
        ready=true
        break
    fi
    sleep 1
done

if [ "$ready" = true ]; then
    log "Ready. Opening browser."
    open_url "$frontend_url"
else
    alert "The dev server did not come up in 30s. See .run/frontend.err.log for details."
fi
