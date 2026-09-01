"""Entry point: `python -m seniki`, which is what app/scripts/start.* invoke."""

from __future__ import annotations

import uvicorn

from .api import app

# Localhost only. There is no authentication in front of these routes, and
# they can read and write the user's real calendar.
HOST = "127.0.0.1"
PORT = 8000


def main() -> None:
    uvicorn.run(app, host=HOST, port=PORT)


if __name__ == "__main__":
    main()
