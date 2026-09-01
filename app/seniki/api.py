"""HTTP routes: the user's iCloud calendar as a small JSON API.

Kept free of CalDAV specifics — every call goes through `icloud`, which deals
in plain dicts. Served by `python -m seniki` (see __main__.py).
"""

from __future__ import annotations

from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from . import icloud

# .env sits beside the package, at app/.env.
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

app = FastAPI(title="Seniki")


class TaskInput(BaseModel):
    title: str
    date: str
    time: str
    endTime: str
    colorId: str


def _as_http_error(exc: icloud.ICloudError) -> HTTPException:
    return HTTPException(status_code=503, detail=str(exc))


@app.get("/api/tasks")
def list_tasks() -> list[dict]:
    try:
        return icloud.list_tasks()
    except icloud.ICloudError as exc:
        raise _as_http_error(exc) from exc


@app.post("/api/tasks", status_code=201)
def create_task(task: TaskInput) -> dict:
    try:
        return icloud.create_task(task.model_dump())
    except icloud.ICloudError as exc:
        raise _as_http_error(exc) from exc


@app.put("/api/tasks/{task_id}")
def update_task(task_id: str, task: TaskInput) -> dict:
    try:
        return icloud.update_task(task_id, task.model_dump())
    except icloud.ICloudError as exc:
        raise _as_http_error(exc) from exc


@app.delete("/api/tasks/{task_id}", status_code=204)
def delete_task(task_id: str) -> None:
    try:
        icloud.delete_task(task_id)
    except icloud.ICloudError as exc:
        raise _as_http_error(exc) from exc
