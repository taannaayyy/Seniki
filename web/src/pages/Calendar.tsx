import { useMemo, useState } from 'react'
import { CalendarIcon, TodoIcon } from '../components/NavIcons'
import AddTaskPopover from '../components/AddTaskPopover'
import MonthGrid from '../components/MonthGrid'
import TimeGrid from '../components/TimeGrid'
import type { TaskFormValues } from '../components/TaskForm'
import { useNow } from '../hooks/useNow'
import { useTasks } from '../hooks/useTasks'
import {
  addDays,
  addMonths,
  getDay,
  getMonthGrid,
  getWeekDays,
  startOfWeek,
  toISODate,
} from '../lib/calendar'
import {
  formatDayLabel,
  formatMonthYear,
  formatWeekRange,
  resolvePlace,
} from '../lib/locale'
import { sortTasks } from '../lib/tasks'
import type { Task } from '../lib/tasks'
import './Calendar.css'

type CalendarView = 'day' | 'week' | 'month'

const VIEWS: { id: CalendarView; label: string }[] = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
]

const shared = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

function OverviewIcon() {
  return (
    <svg {...shared}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13" y="3.5" width="7.5" height="4.5" rx="1.5" />
      <rect x="13" y="10.5" width="7.5" height="10" rx="1.5" />
      <rect x="3.5" y="13.5" width="7.5" height="7" rx="1.5" />
    </svg>
  )
}

function BoardIcon() {
  return (
    <svg {...shared}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <path d="M9.2 4.5v15M14.8 4.5v15" />
    </svg>
  )
}

function TimelineIcon() {
  return (
    <svg {...shared}>
      <path d="M4 6h9M4 12h14M4 18h6" />
    </svg>
  )
}

function MessagesIcon() {
  return (
    <svg {...shared}>
      <path d="M4 5.5h16v11H9l-4 3.5v-3.5H4z" />
    </svg>
  )
}

function FilesIcon() {
  return (
    <svg {...shared}>
      <path d="M6 3.5h8l4 4V20A1.5 1.5 0 0 1 16.5 21.5h-9A1.5 1.5 0 0 1 6 20z" />
      <path d="M14 3.5V8h4" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg {...shared}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg {...shared}>
      <path d="M15 5.5 8.5 12l6.5 6.5" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg {...shared}>
      <path d="M9 5.5 15.5 12 9 18.5" />
    </svg>
  )
}

const TABS = [
  { id: 'overview', label: 'Overview', Icon: OverviewIcon },
  { id: 'list', label: 'List', Icon: TodoIcon },
  { id: 'board', label: 'Board', Icon: BoardIcon },
  { id: 'timeline', label: 'Timeline', Icon: TimelineIcon },
  { id: 'calendar', label: 'Calendar', Icon: CalendarIcon },
  { id: 'messages', label: 'Messages', Icon: MessagesIcon },
  { id: 'files', label: 'Files', Icon: FilesIcon },
]

function Calendar() {
  // Ticks slowly just to catch a day (or locale) change while the tab is open.
  const now = useNow(60_000)
  const todayIso = toISODate(now)
  const locale = useMemo(() => resolvePlace(now).locale, [now])

  const [view, setView] = useState<CalendarView>('month')
  // Any day inside the visible range; each view derives its own span from it.
  const [anchor, setAnchor] = useState(() => new Date())
  const { tasks, addTask, updateTask, deleteTask } = useTasks()
  const [addingTask, setAddingTask] = useState(false)

  const weeks = useMemo(() => getMonthGrid(anchor), [anchor])
  const days = useMemo(
    () => (view === 'week' ? getWeekDays(anchor) : getDay(anchor)),
    [view, anchor],
  )

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const task of sortTasks(tasks)) {
      const list = map.get(task.date)
      if (list) list.push(task)
      else map.set(task.date, [task])
    }
    return map
  }, [tasks])

  const handleAdd = (values: TaskFormValues) => {
    addTask(values)
    setAddingTask(false)
  }

  // Paging moves by whatever unit is on screen.
  const step = (delta: number) => {
    setAnchor((current) => {
      if (view === 'month') return addMonths(current, delta)
      return addDays(current, view === 'week' ? delta * 7 : delta)
    })
  }

  const rangeLabel =
    view === 'month'
      ? formatMonthYear(anchor, locale)
      : view === 'week'
        ? formatWeekRange(days[0].date, days[6].date, locale)
        : formatDayLabel(anchor, locale)

  // A new task lands on today when today is in view, and on the start of the
  // visible range otherwise — never on a day the user cannot see.
  const rangeStart =
    view === 'month'
      ? weeks[0][0].date
      : view === 'week'
        ? startOfWeek(anchor)
        : anchor
  const rangeEnd = view === 'month' ? weeks[5][6].date : days[days.length - 1].date
  const todayInRange = todayIso >= toISODate(rangeStart) && todayIso <= toISODate(rangeEnd)
  const defaultTaskDate = todayInRange ? todayIso : toISODate(rangeStart)

  return (
    <div className="calendar-page">
      <div className="calendar-tabs" role="tablist" aria-label="Project views">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            className={tab.id === 'calendar' ? 'calendar-tab calendar-tab-active' : 'calendar-tab'}
            aria-selected={tab.id === 'calendar'}
            disabled={tab.id !== 'calendar'}
            title={tab.id === 'calendar' ? undefined : 'Coming soon'}
          >
            <tab.Icon className="calendar-tab-icon" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="calendar-toolbar">
        <div className="add-task-wrap">
          <button type="button" className="add-task-btn" onClick={() => setAddingTask((open) => !open)}>
            <PlusIcon />
            Add Task
          </button>
          {addingTask && (
            <AddTaskPopover
              defaultDate={defaultTaskDate}
              onAdd={handleAdd}
              onClose={() => setAddingTask(false)}
            />
          )}
        </div>

        <div className="calendar-nav">
          <div className="calendar-views" role="group" aria-label="Calendar view">
            {VIEWS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={
                  option.id === view
                    ? 'calendar-view-btn calendar-view-btn-active'
                    : 'calendar-view-btn'
                }
                aria-pressed={option.id === view}
                onClick={() => setView(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* One pill: step back, jump to today, step forward. */}
          <div className="calendar-steps">
            <button
              type="button"
              className="calendar-step"
              onClick={() => step(-1)}
              aria-label={`Previous ${view}`}
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              className="calendar-step calendar-step-today"
              onClick={() => setAnchor(new Date())}
              disabled={todayInRange}
              title={todayInRange ? 'Already showing today' : 'Jump to today'}
            >
              Today
            </button>
            <button
              type="button"
              className="calendar-step"
              onClick={() => step(1)}
              aria-label={`Next ${view}`}
            >
              <ChevronRightIcon />
            </button>
          </div>

          <span className="calendar-range-label">{rangeLabel}</span>
        </div>
      </div>

      {view === 'month' ? (
        <MonthGrid
          weeks={weeks}
          tasksByDay={tasksByDay}
          todayIso={todayIso}
          locale={locale}
          onUpdate={updateTask}
          onDelete={deleteTask}
        />
      ) : (
        <TimeGrid
          days={days}
          tasksByDay={tasksByDay}
          todayIso={todayIso}
          now={now}
          locale={locale}
          onUpdate={updateTask}
          onDelete={deleteTask}
        />
      )}
    </div>
  )
}

export default Calendar
