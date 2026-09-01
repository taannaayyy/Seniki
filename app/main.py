"""Seniki backend: exposes the user's iCloud calendar over a small JSON API.

Run directly (`python main.py`) — this is what app/scripts/start.ps1 and
start.sh already invoke.
"""

from __future__ import annotations

from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

import icloud

load_dotenv(Path(__file__).resolve().parent / ".env")

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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
