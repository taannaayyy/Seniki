import { useMemo } from 'react'
import { formatDate, formatTime, isoWeek, resolvePlace } from '../lib/locale'
import './Clock.css'

type ClockProps = {
  now: Date
}

function Clock({ now }: ClockProps) {
  // The locale doesn't change between ticks; resolve it once.
  const locale = useMemo(() => resolvePlace(new Date()).locale, [])

  return (
    <div className="clock">
      <time className="clock-time" dateTime={now.toISOString()}>
        {formatTime(now, locale)}
      </time>
      <span className="clock-date">{formatDate(now, locale)}</span>
      <span className="clock-week">Week {isoWeek(now)}</span>
    </div>
  )
}

export default Clock
