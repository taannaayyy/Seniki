# Seniki

A bridge between me and AI me.

The goal is to digitalize my life — calendar, tasks, journal, money, health,
people — in one place I own, so an AI can learn from it and actually live
alongside me instead of guessing from a chat window. Every section here exists
to feed it more real context.

Nothing about the AI layer is built yet. This is the data foundation.

## Working now

**Calendar** — backed by my real iCloud calendar over CalDAV, so anything I
add here shows up in Apple Calendar everywhere else.

- Day and week as a 24-hour timeline; overlapping events sit side by side
- Month grid with ISO week numbers
- Create, edit and delete events with start/end times and a colour

Everything else in the sidebar is a placeholder.

## Next

- **Journal** — the richest signal, and the reason the rest exists
- To-Do, Finance, Health, People
- The AI layer that reads all of it

## Setup

Needs Node 20+, Python 3.11+, and an
[app-specific password](https://appleid.apple.com) for your Apple ID.

```sh
python3 bootstrap.py            # venv, deps, Desktop shortcuts — no sudo
cp app/.env.example app/.env    # add your Apple ID + app password
```

Then double-click **Seniki** on the Desktop, or run it by hand:

```sh
cd app && .venv/bin/python -m seniki   # API  :8000
cd web && npm run dev                  # UI   :5173
```

## How it works

React + Vite talk to a FastAPI backend, which talks to iCloud. `app/seniki/icloud.py`
is the only file that knows about CalDAV — it turns calendar events into flat
JSON, and back. `useTasks` is the only thing the UI knows about storage, so
swapping what's behind it is a one-file change.

MIT — see [LICENSE](LICENSE).
