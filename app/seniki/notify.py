"""Push notifications to the user's phone.

Telegram today. Everything else in the app only calls `send()`, so moving to
another channel is a change to this file — the same containment `icloud`
gives CalDAV.
"""

from __future__ import annotations

import os

import httpx

API_ROOT = "https://api.telegram.org"
TIMEOUT_SECONDS = 15
# Telegram rejects anything longer; leave room for the truncation marker.
MAX_MESSAGE = 4096
TRUNCATION = "\n…"


class NotifyError(Exception):
    """Raised for configuration or delivery failures. Safe to show the user."""


def _token() -> str:
    token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
    if not token:
        raise NotifyError(
            "TELEGRAM_BOT_TOKEN is not set. Create a bot with @BotFather, then "
            "put the token in app/.env."
        )
    return token


def _chat_id() -> str:
    chat_id = os.environ.get("TELEGRAM_CHAT_ID", "").strip()
    if not chat_id:
        raise NotifyError(
            "TELEGRAM_CHAT_ID is not set. Message your bot once, then run "
            "`python -m seniki.notify` to look the id up."
        )
    return chat_id


def _call(method: str, payload: dict | None = None) -> dict:
    url = f"{API_ROOT}/bot{_token()}/{method}"
    try:
        response = httpx.post(url, json=payload or {}, timeout=TIMEOUT_SECONDS)
    except httpx.HTTPError as exc:
        raise NotifyError(f"Could not reach Telegram: {exc}") from exc

    try:
        body = response.json()
    except ValueError:
        raise NotifyError(f"Telegram returned a non-JSON response ({response.status_code}).") from None

    if not body.get("ok"):
        # Telegram puts the useful part in `description`; the bot token is in
        # the URL, never in the body, so this is safe to surface.
        raise NotifyError(body.get("description") or f"Telegram rejected the request ({response.status_code}).")
    return body["result"]


def send(text: str) -> None:
    """Deliver a plain-text message. Raises NotifyError on any failure."""
    if len(text) > MAX_MESSAGE:
        text = text[: MAX_MESSAGE - len(TRUNCATION)] + TRUNCATION

    _call("sendMessage", {"chat_id": _chat_id(), "text": text})


def recent_chats() -> list[dict]:
    """Chats that have messaged the bot, for finding your own chat id.

    Telegram only reveals a chat id once that chat has written to the bot,
    so this is empty until you send it a message.
    """
    updates = _call("getUpdates")
    chats: dict[str, dict] = {}
    for update in updates:
        message = update.get("message") or update.get("channel_post") or {}
        chat = message.get("chat")
        if chat:
            chats[str(chat["id"])] = chat
    return list(chats.values())


def main() -> None:
    """`python -m seniki.notify` — print the chat ids the bot can see."""
    try:
        chats = recent_chats()
    except NotifyError as exc:
        raise SystemExit(f"error: {exc}")

    if not chats:
        raise SystemExit(
            "No chats yet. Open Telegram, send your bot any message, then run this again."
        )

    print("Add one of these to app/.env as TELEGRAM_CHAT_ID:\n")
    for chat in chats:
        name = chat.get("username") or chat.get("first_name") or chat.get("title") or "?"
        print(f"  {chat['id']}    {name}  ({chat.get('type', 'unknown')})")


if __name__ == "__main__":
    main()
