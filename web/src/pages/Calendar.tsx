import { useMemo, useState } from 'react'
import { CalendarIcon, TodoIcon } from '../components/NavIcons'
import AddTaskPopover from '../components/AddTaskPopover'
import TaskCard from '../components/TaskCard'
import { useNow } from '../hooks/useNow'
import { addMonths, getMonthGrid, toISODate } from '../lib/calendar'
import { formatMonthYear, resolvePlace } from '../lib/locale'
import { taskColorValue } from '../lib/taskColors'
import { buildInitialTasks, TEAM } from '../lib/tasks'
import type { Task } from '../lib/tasks'
import './Calendar.css'

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

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

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const mountDate = new Date()
    return new Date(mountDate.getFullYear(), mountDate.getMonth(), 1)
  })
  const [tasks, setTasks] = useState<Task[]>(() => buildInitialTasks(new Date()))
  const [addingTask, setAddingTask] = useState(false)

  const weeks = useMemo(() => getMonthGrid(visibleMonth), [visibleMonth])

  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>()
    for (const task of tasks) {
      const list = map.get(task.date)
      if (list) list.push(task)
      else map.set(task.date, [task])
    }
    return map
  }, [tasks])

  const addTask = (input: { title: string; date: string; colorId: string }) => {
    setTasks((current) => [
      ...current,
      {
        id: `task-${Date.now()}`,
        title: input.title,
        date: input.date,
        color: taskColorValue(input.colorId),
        comments: 0,
        attachments: 0,
        assignees: [TEAM[0]],
      },
    ])
    setAddingTask(false)
  }

  const deleteTask = (id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id))
  }

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
              defaultDate={todayIso}
              onAdd={addTask}
              onClose={() => setAddingTask(false)}
            />
          )}
        </div>

        <div className="calendar-nav">
          <button
            type="button"
            className="calendar-today-btn"
            onClick={() => {
              const current = new Date()
              setVisibleMonth(new Date(current.getFullYear(), current.getMonth(), 1))
            }}
          >
            Today
          </button>
          <button
            type="button"
            className="calendar-nav-arrow"
            onClick={() => setVisibleMonth((month) => addMonths(month, -1))}
            aria-label="Previous month"
          >
            <ChevronLeftIcon />
          </button>
          <span className="calendar-month-label">{formatMonthYear(visibleMonth, locale)}</span>
          <button
            type="button"
            className="calendar-nav-arrow"
            onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
            aria-label="Next month"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      <div className="calendar-grid-wrap">
        <div className="calendar-grid-inner">
          <div className="calendar-weekdays">
            {WEEKDAYS.map((day) => (
              <div key={day} className="calendar-weekday">
                {day}
              </div>
            ))}
          </div>

          <div className="calendar-grid">
            {weeks.map((week) => (
              <div className="calendar-week" key={week[0].iso}>
                {week.map((cell) => (
                  <div
                    key={cell.iso}
                    className={[
                      'calendar-cell',
                      cell.inCurrentMonth ? '' : 'calendar-cell-outside',
                      cell.iso === todayIso ? 'calendar-cell-today' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <span className="calendar-daynum">{cell.date.getDate()}</span>
                    <div className="calendar-cell-tasks">
                      {(tasksByDay.get(cell.iso) ?? []).map((task) => (
                        <TaskCard key={task.id} task={task} onDelete={deleteTask} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calendar
