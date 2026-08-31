export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Night'

/** Time-of-day bucket for the greeting, based on the visitor's own clock. */
export function timeOfDay(date: Date): TimeOfDay {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) return 'Morning'
  if (hour >= 12 && hour < 17) return 'Afternoon'
  if (hour >= 17 && hour < 22) return 'Evening'
  return 'Night'
}

export type ResolvedPlace = {
  /** IANA zone, e.g. "Europe/Istanbul" */
  timeZone: string
  /** Last zone segment, e.g. "Istanbul" */
  city: string
  /** Leading zone segment, e.g. "Europe" */
  region: string
  /** e.g. "GMT+3" */
  offset: string
  /** BCP 47 tag the browser is running under, e.g. "en-GB" */
  locale: string
}

/**
 * Where the app is running, inferred from the browser's own settings.
 * No network call and no permission prompt: the IANA time zone is set by
 * the operating system, so it is accurate to the city level.
 *
 * Location comes only from the time zone. `locale` is a *language* preference
 * (a machine in Istanbul can well be set to en-US), so it is used for
 * formatting only and never to infer a place.
 */
export function resolvePlace(date: Date): ResolvedPlace {
  const options = Intl.DateTimeFormat().resolvedOptions()
  const timeZone = options.timeZone || 'UTC'
  const locale = options.locale || 'en'

  const segments = timeZone.split('/')
  const city = (segments.at(-1) ?? timeZone).replace(/_/g, ' ')
  const region = segments.length > 1 ? segments[0].replace(/_/g, ' ') : ''

  const offset =
    new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
      .formatToParts(date)
      .find((part) => part.type === 'timeZoneName')?.value ?? ''

  return { timeZone, city, region, offset, locale }
}

/**
 * Intl formatters are costly to construct and these are used on every tick of
 * the clock, so build each one once and reuse it.
 */
const formatters = new Map<string, Intl.DateTimeFormat>()

function formatter(
  locale: string,
  key: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const cacheKey = `${locale}:${key}`
  let cached = formatters.get(cacheKey)
  if (!cached) {
    cached = new Intl.DateTimeFormat(locale, options)
    formatters.set(cacheKey, cached)
  }
  return cached
}

/**
 * Local wall-clock time on a 24-hour clock, seconds included.
 * `hourCycle: 'h23'` states the 00-23 cycle outright, rather than leaving
 * `hour12: false` to be resolved against the locale's own preference.
 */
export function formatTime(date: Date, locale: string): string {
  return formatter(locale, 'time', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).format(date)
}

export function formatDate(date: Date, locale: string): string {
  return formatter(locale, 'date', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
}

export function formatMonthYear(date: Date, locale: string): string {
  return formatter(locale, 'monthYear', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/**
 * ISO 8601 week number (1-53). Weeks start Monday, and week 1 is the one
 * containing the first Thursday of the year — so early January can fall in
 * week 52/53 of the previous week-year.
 */
export function isoWeek(date: Date): number {
  // Normalise to UTC midnight so DST shifts can't move the day.
  const target = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  )
  const dayOfWeek = target.getUTCDay() || 7 // Mon = 1 … Sun = 7
  // Step to the Thursday of this week; its year is the ISO week-year.
  target.setUTCDate(target.getUTCDate() + 4 - dayOfWeek)
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1))
  const days = (target.getTime() - yearStart.getTime()) / 86_400_000
  return Math.floor(days / 7) + 1
}
