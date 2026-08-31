export type CalendarCell = {
  date: Date
  iso: string
  inCurrentMonth: boolean
}

/** `YYYY-MM-DD` in local time, used as the key that ties tasks to days. */
export function toISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1)
}

/**
 * Always 6 Monday-start weeks (42 days), padded with the leading/trailing
 * days of the neighbouring months, so the grid height never changes as the
 * user pages between months.
 */
export function getMonthGrid(monthDate: Date): CalendarCell[][] {
  const year = monthDate.getFullYear()
  const month = monthDate.getMonth()
  const firstOfMonth = new Date(year, month, 1)
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7 // Mon = 0 … Sun = 6

  const cursor = new Date(year, month, 1 - firstWeekday)
  const weeks: CalendarCell[][] = []

  for (let w = 0; w < 6; w++) {
    const week: CalendarCell[] = []
    for (let d = 0; d < 7; d++) {
      week.push({
        date: new Date(cursor),
        iso: toISODate(cursor),
        inCurrentMonth: cursor.getMonth() === month,
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }

  return weeks
}

export function addDays(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta)
}

/** Monday of the week the given date falls in, at local midnight. */
export function startOfWeek(date: Date): Date {
  const weekday = (date.getDay() + 6) % 7 // Mon = 0 … Sun = 6
  return addDays(date, -weekday)
}

function toCell(date: Date, monthOf: Date): CalendarCell {
  return {
    date,
    iso: toISODate(date),
    inCurrentMonth: date.getMonth() === monthOf.getMonth(),
  }
}

/** The seven Monday-start days around `date`, for the week view. */
export function getWeekDays(date: Date): CalendarCell[] {
  const monday = startOfWeek(date)
  return Array.from({ length: 7 }, (_, index) => toCell(addDays(monday, index), date))
}

/** A single day, so the day view can share the week view's layout. */
export function getDay(date: Date): CalendarCell[] {
  return [toCell(date, date)]
}

/** 0 … 23, the row spine of the day and week views. */
export const HOURS = Array.from({ length: 24 }, (_, hour) => hour)

/** Hour slot a `HH:MM` time belongs to; out-of-range values land in hour 0. */
export function hourOf(time: string): number {
  const hour = Number(time.slice(0, 2))
  return Number.isInteger(hour) && hour >= 0 && hour <= 23 ? hour : 0
}

/** Minutes since midnight, used to order same-day tasks. */
export function minutesOfDay(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return 0
  return hours * 60 + minutes
}

export const DAY_MINUTES = 24 * 60

/** `HH:MM` for a minutes-since-midnight value, clamped to the day. */
export function formatMinutes(minutes: number): string {
  const clamped = Math.max(0, Math.min(DAY_MINUTES - 1, Math.round(minutes)))
  const hours = String(Math.floor(clamped / 60)).padStart(2, '0')
  return `${hours}:${String(clamped % 60).padStart(2, '0')}`
}
