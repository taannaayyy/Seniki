import { useEffect, useRef } from 'react'
import TaskBlock from './TaskBlock'
import type { TaskFormValues } from './TaskForm'
import { DAY_MINUTES, formatMinutes, HOURS } from '../lib/calendar'
import type { CalendarCell } from '../lib/calendar'
import { formatHour, formatWeekdayShort } from '../lib/locale'
import { placeSpans, taskSpan } from '../lib/timeline'
import type { Task } from '../lib/tasks'
import './TimeGrid.css'

type TimeGridProps = {
  /** One day for the day view, seven for the week view. */
  days: CalendarCell[]
  tasksByDay: Map<string, Task[]>
  todayIso: string
  /** Ticks each minute, positioning the current-time line. */
  now: Date
  locale: string
  onUpdate: (id: string, values: TaskFormValues) => void
  onDelete: (id: string) => void
}

/** Height of one hour row, in pixels. The whole day is 24 of these. */
const HOUR_HEIGHT = 44
/** Below this height a block only has room for its title. */
const COMPACT_HEIGHT = 30
/** Where the view opens when the day holds no tasks. */
const DEFAULT_SCROLL_HOUR = 8

function TimeGrid({ days, tasksByDay, todayIso, now, locale, onUpdate, onDelete }: TimeGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isWeek = days.length > 1
  const dayHeight = HOURS.length * HOUR_HEIGHT

  const firstStart = Math.min(
    ...days.flatMap((day) => (tasksByDay.get(day.iso) ?? []).map((task) => taskSpan(task).start)),
  )
  // Math.min() of an empty list is Infinity, which means "no tasks in range".
  const scrollTo = Number.isFinite(firstStart)
    ? (firstStart / 60) * HOUR_HEIGHT
    : DEFAULT_SCROLL_HOUR * HOUR_HEIGHT
  const rangeKey = days.map((day) => day.iso).join()

  // Open on the first task rather than at midnight, which is otherwise several
  // screens of empty hours away from anything.
  useEffect(() => {
    const container = scrollRef.current
    if (container) container.scrollTop = Math.max(0, scrollTo - HOUR_HEIGHT / 2)
  }, [rangeKey, scrollTo])

  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const showNow = days.some((day) => day.iso === todayIso)

  return (
    <div className="time-grid-wrap">
      {isWeek && (
        <div className="time-grid-head">
          <div className="time-gutter-head" />
          {days.map((day) => (
            <div
              key={day.iso}
              className={
                day.iso === todayIso ? 'time-day-head time-day-head-today' : 'time-day-head'
              }
            >
              <span className="time-day-name">{formatWeekdayShort(day.date, locale)}</span>
              <span className="time-day-num">{day.date.getDate()}</span>
            </div>
          ))}
        </div>
      )}

      <div className="time-grid-scroll" ref={scrollRef}>
        <div
          className={isWeek ? 'time-grid time-grid-week' : 'time-grid'}
          style={{ height: dayHeight }}
        >
          <div className="time-gutter">
            {HOURS.map((hour) => (
              <div className="time-gutter-hour" key={hour} style={{ height: HOUR_HEIGHT }}>
                <span>{formatHour(hour, locale)}</span>
              </div>
            ))}
          </div>

          {days.map((day) => {
            const placed = placeSpans(tasksByDay.get(day.iso) ?? [], taskSpan)
            return (
              <div className="time-day" key={day.iso}>
                {HOURS.map((hour) => (
                  <div className="time-hour-line" key={hour} style={{ height: HOUR_HEIGHT }} />
                ))}

                {placed.map(({ item, start, end, lane, lanes }) => {
                  const height = ((end - start) / DAY_MINUTES) * dayHeight
                  return (
                    <TaskBlock
                      key={item.id}
                      task={item}
                      compact={height < COMPACT_HEIGHT}
                      style={{
                        top: (start / DAY_MINUTES) * dayHeight,
                        height,
                        // Overlapping tasks share the column, side by side.
                        left: `calc(${(lane / lanes) * 100}% + 2px)`,
                        width: `calc(${100 / lanes}% - 4px)`,
                      }}
                      onUpdate={onUpdate}
                      onDelete={onDelete}
                    />
                  )
                })}

                {showNow && day.iso === todayIso && (
                  <div
                    className="time-now"
                    style={{ top: (nowMinutes / DAY_MINUTES) * dayHeight }}
                    aria-hidden="true"
                  >
                    <span className="time-now-label">{formatMinutes(nowMinutes)}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default TimeGrid
