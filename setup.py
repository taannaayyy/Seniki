#!/usr/bin/env python3
"""Initial project setup: creates the backend virtualenv and installs
Python + frontend dependencies.

Usage:
    python setup.py
"""

from __future__ import annotations

import shutil
import subprocess
import sys
import venv
from pathlib import Path

ROOT = Path(__file__).resolve().parent
APP_DIR = ROOT / "app"
WEB_DIR = ROOT / "web"
VENV_DIR = APP_DIR / ".venv"
REQUIREMENTS = APP_DIR / "requirements.txt"

def run(cmd: list[str], cwd: Path) -> None:
    print(f"$ {' '.join(cmd)}  (in {cwd})")
    subprocess.run(cmd, cwd=cwd, check=True)


def venv_python(venv_dir: Path) -> Path:
    if sys.platform == "win32":
        return venv_dir / "Scripts" / "python.exe"
    return venv_dir / "bin" / "python"


def setup_backend() -> None:
    print("\n== Backend (Python) ==")
    if not VENV_DIR.exists():
        print(f"Creating virtual environment at {VENV_DIR}")
        venv.EnvBuilder(with_pip=True).create(VENV_DIR)
    else:
        print(f"Virtual environment already exists at {VENV_DIR}")

    python = venv_python(VENV_DIR)
    run([str(python), "-m", "pip", "install", "--upgrade", "pip"], cwd=APP_DIR)

    if REQUIREMENTS.exists() and REQUIREMENTS.read_text().strip():
        run([str(python), "-m", "pip", "install", "-r", str(REQUIREMENTS)], cwd=APP_DIR)
    else:
        print(f"{REQUIREMENTS} is empty, skipping dependency install.")


def setup_frontend() -> None:
    print("\n== Frontend (web) ==")
    if not WEB_DIR.exists():
        print(f"{WEB_DIR} not found, skipping frontend setup.")
        return

    npm = shutil.which("npm")
    if npm is None:
        print("npm not found on PATH. Install Node.js and re-run this script.", file=sys.stderr)
        sys.exit(1)

    run([npm, "install"], cwd=WEB_DIR)


def main() -> None:
    setup_backend()
    setup_frontend()

    print("\nSetup complete.")
    activate = (
        r"app\.venv\Scripts\activate" if sys.platform == "win32" else "source app/.venv/bin/activate"
    )
    print(f"Activate the backend venv with:\n  {activate}")
    print("Start the frontend dev server with:\n  cd web && npm run dev")


if __name__ == "__main__":
    main()
