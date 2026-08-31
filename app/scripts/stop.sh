#!/usr/bin/env bash
# Stops the backend + frontend processes started by start.sh.

# This script lives in app/scripts/, so the project root is two levels up.
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
run_dir="$root/.run"

# Background subshells are not process-group leaders, so walk the tree and
# kill children (npm -> vite, python) before the parent.
kill_tree() {
    local procId="$1" child
    for child in $(pgrep -P "$procId" 2>/dev/null); do
        kill_tree "$child"
    done
    kill "$procId" 2>/dev/null
}

for name in backend frontend; do
    pid_file="$run_dir/$name.pid"
    [ -f "$pid_file" ] || continue
    procId="$(cat "$pid_file" 2>/dev/null)"
    if [ -n "$procId" ] && kill -0 "$procId" 2>/dev/null; then
        kill_tree "$procId"
    fi
    rm -f "$pid_file"
done
