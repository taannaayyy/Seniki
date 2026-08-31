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
