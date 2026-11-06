#!/usr/bin/env python3
"""Start, inspect, or stop the local Agresti.3D catalog editor."""

import os
import signal
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SERVER = ROOT / "tools" / "catalogo" / "servidor.py"
URL = "http://127.0.0.1:8766/tools/catalogo/"
PID_FILE = Path(tempfile.gettempdir()) / f"agresti3d-editor-{os.getuid()}.pid"
LOG_FILE = Path(tempfile.gettempdir()) / f"agresti3d-editor-{os.getuid()}.log"


def process_command(pid):
    try:
        result = subprocess.run(
            ["/bin/ps", "-p", str(pid), "-o", "command="],
            check=False,
            capture_output=True,
            text=True,
            timeout=3,
        )
    except (OSError, subprocess.TimeoutExpired):
        return ""
    return result.stdout.strip() if result.returncode == 0 else ""


def managed_pid():
    try:
        pid = int(PID_FILE.read_text().strip())
    except (OSError, ValueError):
        return None

    command = process_command(pid)
    if str(SERVER) not in command:
        PID_FILE.unlink(missing_ok=True)
        return None
    return pid


def editor_responds():
    try:
        with urllib.request.urlopen(URL, timeout=1) as response:
            return response.status == 200
    except (OSError, urllib.error.URLError):
        return False


def status():
    pid = managed_pid()
    if (pid and editor_responds()) or editor_responds():
        print("running")
    elif pid:
        print("starting")
    else:
        print("stopped")


def start():
    pid = managed_pid()
    if pid:
        if editor_responds():
            print("running")
            return
        deadline = time.monotonic() + 15
        while time.monotonic() < deadline:
            if editor_responds():
                print("running")
                return
            time.sleep(0.25)
        raise RuntimeError("El servidor ya está iniciado, pero el editor no responde.")

    if editor_responds():
        print("running")
        return

    with LOG_FILE.open("ab") as log:
        process = subprocess.Popen(
            [sys.executable, str(SERVER)],
            cwd=ROOT,
            stdin=subprocess.DEVNULL,
            stdout=log,
            stderr=subprocess.STDOUT,
            start_new_session=True,
            close_fds=True,
        )
    PID_FILE.write_text(f"{process.pid}\n")

    deadline = time.monotonic() + 20
    while time.monotonic() < deadline:
        if process.poll() is not None:
            PID_FILE.unlink(missing_ok=True)
            raise RuntimeError(f"No se pudo iniciar el editor. Revisá el registro: {LOG_FILE}")
        if editor_responds():
            print("running")
            return
        time.sleep(0.25)

    stop()
    raise RuntimeError(f"El editor no respondió. Revisá el registro: {LOG_FILE}")


def stop():
    pid = managed_pid()
    if not pid:
        if editor_responds():
            raise RuntimeError(
                "Hay otro servidor usando el puerto. No lo apagué para no cerrar otro proceso."
            )
        print("stopped")
        return

    os.kill(pid, signal.SIGTERM)
    deadline = time.monotonic() + 8
    while time.monotonic() < deadline and process_command(pid):
        time.sleep(0.1)

    if process_command(pid):
        raise RuntimeError("El servidor no se apagó; no forcé el cierre del proceso.")

    PID_FILE.unlink(missing_ok=True)
    print("stopped")


def main():
    commands = {"status": status, "start": start, "stop": stop}
    if len(sys.argv) != 2 or sys.argv[1] not in commands:
        raise SystemExit("Uso: control-editor.py status|start|stop")
    try:
        commands[sys.argv[1]]()
    except (OSError, RuntimeError) as error:
        print(str(error), file=sys.stderr)
        raise SystemExit(1) from error


if __name__ == "__main__":
    main()
