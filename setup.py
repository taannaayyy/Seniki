#!/usr/bin/env python3
"""Initial project setup: creates the backend virtualenv and installs
Python + frontend dependencies.

Usage:
    python setup.py
"""

from __future__ import annotations

import os
import plistlib
import shutil
import stat
import subprocess
import sys
import venv
from pathlib import Path

ROOT = Path(__file__).resolve().parent
APP_DIR = ROOT / "app"
WEB_DIR = ROOT / "web"
VENV_DIR = APP_DIR / ".venv"
REQUIREMENTS = APP_DIR / "requirements.txt"
SCRIPTS_DIR = APP_DIR / "scripts"
APP_NAME = "Seniki"

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


def desktop_dir() -> Path:
    """Best-effort location of the user's Desktop."""
    if sys.platform == "win32":
        try:
            import winreg

            key = r"Software\Microsoft\Windows\CurrentVersion\Explorer\Shell Folders"
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, key) as handle:
                value, _ = winreg.QueryValueEx(handle, "Desktop")
            return Path(os.path.expandvars(value))
        except OSError:
            pass
    return Path.home() / "Desktop"


def create_windows_shortcut(desktop: Path) -> None:
    """Create a .lnk that runs start.ps1 without a console window."""
    shortcut = desktop / f"{APP_NAME}.lnk"
    target = SCRIPTS_DIR / "start.ps1"
    if not target.exists():
        print(f"{target} not found, skipping desktop shortcut.")
        return

    icon = ROOT / "assets" / "icon.ico"
    icon_line = f'$s.IconLocation = "{icon}"' if icon.exists() else ""
    script = f"""
$w = New-Object -ComObject WScript.Shell
$s = $w.CreateShortcut("{shortcut}")
$s.TargetPath = "powershell.exe"
$s.Arguments = '-NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -File "{target}"'
$s.WorkingDirectory = "{ROOT}"
$s.Description = "Start {APP_NAME}"
{icon_line}
$s.Save()
"""
    subprocess.run(
        ["powershell.exe", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", script],
        check=True,
    )
    print(f"Created desktop shortcut: {shortcut}")


def create_macos_shortcut(desktop: Path) -> None:
    """Create a minimal .app bundle on the Desktop that runs start.sh."""
    target = SCRIPTS_DIR / "start.sh"
    if not target.exists():
        print(f"{target} not found, skipping desktop shortcut.")
        return

    bundle = desktop / f"{APP_NAME}.app"
    macos_dir = bundle / "Contents" / "MacOS"
    resources_dir = bundle / "Contents" / "Resources"
    macos_dir.mkdir(parents=True, exist_ok=True)
    resources_dir.mkdir(parents=True, exist_ok=True)

    launcher = macos_dir / APP_NAME
    launcher.write_text(f'#!/bin/sh\nexec "{target}"\n')
    launcher.chmod(launcher.stat().st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)

    info = {
        "CFBundleName": APP_NAME,
        "CFBundleDisplayName": APP_NAME,
        "CFBundleIdentifier": f"local.{APP_NAME.lower()}.launcher",
        "CFBundleExecutable": APP_NAME,
        "CFBundlePackageType": "APPL",
        "CFBundleVersion": "1.0",
        "CFBundleShortVersionString": "1.0",
        # No Dock icon or menu bar: this bundle only kicks off start.sh.
        "LSUIElement": True,
    }

    icon = ROOT / "assets" / "icon.icns"
    if icon.exists():
        shutil.copyfile(icon, resources_dir / "icon.icns")
        info["CFBundleIconFile"] = "icon.icns"

    with (bundle / "Contents" / "Info.plist").open("wb") as handle:
        plistlib.dump(info, handle)

    # Nudge Finder to pick up the rebuilt bundle rather than a cached one.
    subprocess.run(["touch", str(bundle)], check=False)
    print(f"Created desktop shortcut: {bundle}")


def setup_shortcut() -> None:
    print("\n== Desktop shortcut ==")
    desktop = desktop_dir()
    if not desktop.is_dir():
        print(f"{desktop} not found, skipping desktop shortcut.")
        return

    try:
        if sys.platform == "win32":
            create_windows_shortcut(desktop)
        elif sys.platform == "darwin":
            create_macos_shortcut(desktop)
        else:
            print(f"No desktop shortcut support for platform {sys.platform!r}, skipping.")
    except (OSError, subprocess.CalledProcessError) as exc:
        # A missing shortcut should not fail an otherwise-successful setup.
        print(f"Could not create desktop shortcut: {exc}", file=sys.stderr)


def main() -> None:
    setup_backend()
    setup_frontend()
    setup_shortcut()

    print("\nSetup complete.")
    activate = (
        r"app\.venv\Scripts\activate" if sys.platform == "win32" else "source app/.venv/bin/activate"
    )
    print(f"Activate the backend venv with:\n  {activate}")
    print("Start the frontend dev server with:\n  cd web && npm run dev")
    if sys.platform in ("win32", "darwin"):
        print(f"Or launch everything from the {APP_NAME} icon on your Desktop.")


if __name__ == "__main__":
    main()
