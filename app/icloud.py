"""CalDAV bridge to iCloud calendars.

Translates between iCloud's CalDAV/iCalendar events and the plain
{id, title, date, time, endTime, colorId} shape the frontend uses. This is
the only module that imports `caldav`/`icalendar` — callers in main.py just
deal with dicts.
"""

from __future__ import annotations

import os
import uuid
from datetime import datetime, timedelta

import caldav
from icalendar import Calendar as ICalendar
from icalendar import Event as ICalEvent

ICLOUD_URL = "https://caldav.icloud.com"
DEFAULT_COLOR_ID = "accent"
COLOR_PROPERTY = "X-SENIKI-COLOR"

# Fixed rolling read window: how far back and forward to fetch events from.
FETCH_PAST_DAYS = 31
FETCH_FUTURE_DAYS = 183


class ICloudError(Exception):
    """Raised for CalDAV connection/auth/lookup failures. Message is safe to show the user."""


def _client() -> caldav.DAVClient:
    username = os.environ.get("ICLOUD_USERNAME")
    password = os.environ.get("ICLOUD_APP_PASSWORD")
    if not username or not password:
        raise ICloudError(
            "ICLOUD_USERNAME / ICLOUD_APP_PASSWORD are not set. "
            "Copy app/.env.example to app/.env and fill them in."
        )
    return caldav.DAVClient(url=ICLOUD_URL, username=username, password=password)


def _all_calendars() -> list[caldav.Calendar]:
    try:
        calendars = _client().principal().get_calendars()
    except ICloudError:
        raise
    except Exception as exc:  # network/auth failures from caldav/niquests
        raise ICloudError(f"Could not reach iCloud: {exc}") from exc

    if not calendars:
        raise ICloudError("No calendars found on this iCloud account.")
    return calendars


def _target_calendars() -> list[caldav.Calendar]:
    """Calendars to read from, per ICLOUD_CALENDAR_NAME (all, if unset)."""
    calendars = _all_calendars()
    name = os.environ.get("ICLOUD_CALENDAR_NAME", "").strip() or None
    if not name:
        return calendars

    # Calendar display names can carry stray leading/trailing whitespace
    # (easy to introduce by accident when naming one), so compare trimmed.
    matches = [c for c in calendars if (c.get_display_name() or "").strip() == name]
    if not matches:
        raise ICloudError(f'No calendar named "{name}" found.')
    return matches


def _write_calendar() -> caldav.Calendar:
    """The single calendar new/edited tasks are written to."""
    return _target_calendars()[0]


def _event_to_task(event: caldav.CalendarObjectResource) -> dict | None:
    vevents = event.icalendar_instance.walk("VEVENT")
    if not vevents:
        return None
    vevent = vevents[0]

    dtstart = vevent.get("DTSTART")
    if dtstart is None:
        return None
    start = dtstart.dt

    # All-day events carry a `date`, not a `datetime` — there's no all-day
    # row in the UI yet, so these are skipped for now rather than mis-shown.
    if not isinstance(start, datetime):
        return None

    dtend = vevent.get("DTEND")
    end = dtend.dt if dtend is not None else start

    uid = vevent.get("UID")
    if uid is None:
        return None

    return {
        "id": str(uid),
        "title": str(vevent.get("SUMMARY", "")),
        "date": start.strftime("%Y-%m-%d"),
        "time": start.strftime("%H:%M"),
        "endTime": end.strftime("%H:%M"),
        "colorId": str(vevent.get(COLOR_PROPERTY, DEFAULT_COLOR_ID)),
    }


def list_tasks() -> list[dict]:
    now = datetime.now()
    start = now - timedelta(days=FETCH_PAST_DAYS)
    end = now + timedelta(days=FETCH_FUTURE_DAYS)

    tasks: list[dict] = []
    for calendar in _target_calendars():
        try:
            events = calendar.search(start=start, end=end, event=True, expand=True)
        except Exception as exc:
            raise ICloudError(f"Could not fetch events: {exc}") from exc
        for event in events:
            task = _event_to_task(event)
            if task is not None:
                tasks.append(task)

    tasks.sort(key=lambda t: (t["date"], t["time"]))
    return tasks


def _build_ical(uid: str, task_input: dict) -> str:
    date = task_input["date"]
    start = datetime.strptime(f"{date} {task_input['time']}", "%Y-%m-%d %H:%M")
    end = datetime.strptime(f"{date} {task_input['endTime']}", "%Y-%m-%d %H:%M")

    cal = ICalendar()
    cal.add("prodid", "-//Seniki//caldav sync//EN")
    cal.add("version", "2.0")

    vevent = ICalEvent()
    vevent.add("uid", uid)
    vevent.add("summary", task_input["title"])
    vevent.add("dtstart", start)
    vevent.add("dtend", end)
    vevent.add("dtstamp", datetime.utcnow())
    vevent.add(COLOR_PROPERTY, task_input.get("colorId") or DEFAULT_COLOR_ID)
    cal.add_component(vevent)

    return cal.to_ical().decode("utf-8")


def _task_result(uid: str, task_input: dict) -> dict:
    return {
        "id": uid,
        "title": task_input["title"],
        "date": task_input["date"],
        "time": task_input["time"],
        "endTime": task_input["endTime"],
        "colorId": task_input.get("colorId") or DEFAULT_COLOR_ID,
    }


def create_task(task_input: dict) -> dict:
    uid = f"{uuid.uuid4()}@seniki.local"
    try:
        _write_calendar().add_event(_build_ical(uid, task_input))
    except Exception as exc:
        raise ICloudError(f"Could not create event: {exc}") from exc
    return _task_result(uid, task_input)


def _find_event(uid: str) -> caldav.CalendarObjectResource:
    # Deliberately not calendar.get_event_by_uid(): that issues a server-side
    # REPORT filtered on UID, which iCloud's CalDAV server rejects with a 412
    # for reasons that aren't clear from the response. The date-range search
    # used by list_tasks() is known-good against iCloud, so reuse it and
    # match the UID client-side instead.
    now = datetime.now()
    start = now - timedelta(days=FETCH_PAST_DAYS)
    end = now + timedelta(days=FETCH_FUTURE_DAYS)

    for calendar in _target_calendars():
        try:
            events = calendar.search(start=start, end=end, event=True, expand=True)
        except Exception as exc:
            raise ICloudError(f"Could not look up event: {exc}") from exc
        for event in events:
            vevents = event.icalendar_instance.walk("VEVENT")
            if vevents and str(vevents[0].get("UID")) == uid:
                return event

    raise ICloudError(f"No event found with id {uid}.")


def update_task(uid: str, task_input: dict) -> dict:
    event = _find_event(uid)
    try:
        event.data = _build_ical(uid, task_input)
        event.save()
    except Exception as exc:
        raise ICloudError(f"Could not update event: {exc}") from exc
    return _task_result(uid, task_input)


def delete_task(uid: str) -> None:
    event = _find_event(uid)
    try:
        event.delete()
    except Exception as exc:
        raise ICloudError(f"Could not delete event: {exc}") from exc
