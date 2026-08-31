import { useEffect, useState } from 'react'
import { formatMinutes, minutesOfDay } from '../lib/calendar'
import { taskColorValue } from '../lib/taskColors'
import { buildInitialTasks, TEAM } from '../lib/tasks'
import type { Task, TaskInput } from '../lib/tasks'

export const TASKS_KEY = 'seniki-tasks'

/**
 * Stored tasks are user data from an earlier session, so they are checked
 * field by field rather than trusted: a half-written or outdated entry should
 * cost one task, not the whole calendar.
 */
function isTask(value: unknown): value is Omit<Task, 'endTime'> & { endTime?: unknown } {
  if (typeof value !== 'object' || value === null) return false
  const task = value as Record<string, unknown>
  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.date === 'string' &&
    typeof task.time === 'string' &&
    typeof task.color === 'string' &&
    typeof task.comments === 'number' &&
    typeof task.attachments === 'number' &&
    Array.isArray(task.assignees)
  )
}

/** Default span for a task stored before end times existed. */
const DEFAULT_DURATION = 60

/**
 * Tasks saved before this field existed have no end time. They are given a
 * default span rather than discarded — dropping them would silently delete
 * the user's data on upgrade.
 */
function withEndTime(task: Omit<Task, 'endTime'> & { endTime?: unknown }): Task {
  const stored = typeof task.endTime === 'string' ? task.endTime : null
  const endTime =
    stored && minutesOfDay(stored) > minutesOfDay(task.time)
      ? stored
      : formatMinutes(minutesOfDay(task.time) + DEFAULT_DURATION)
  return { ...task, endTime }
}

/**
 * Returns null when nothing is stored, or when storage is unavailable
 * (private windows and blocked site data throw on access) — matching
 * `useTheme`, which persists the same way.
 */
function readStored(): Task[] | null {
  try {
    const raw = localStorage.getItem(TASKS_KEY)
    if (raw === null) return null
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    return parsed.filter(isTask).map(withEndTime)
  } catch {
    return null
  }
}

/** Returns false when the tasks couldn't be persisted, which is not fatal. */
function writeStored(tasks: Task[]): boolean {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
    return true
  } catch {
    return false
  }
}

function newTaskId(): string {
  // randomUUID needs a secure context; localhost qualifies, but a plain-http
  // host on the LAN would not, so keep a fallback.
  try {
    return crypto.randomUUID()
  } catch {
    return `task-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  }
}

/**
 * Task state for the calendar, persisted per browser.
 *
 * This is the single seam between the UI and wherever tasks are stored: the
 * components below it only ever see `tasks` and these three operations, so
 * moving to a real backend is a change to this file alone.
 */
export function useTasks() {
  // Seeds only on a genuinely first run. An empty stored array is a user who
  // deleted everything, and must not be re-seeded.
  const [tasks, setTasks] = useState<Task[]>(() => readStored() ?? buildInitialTasks(new Date()))

  useEffect(() => {
    writeStored(tasks)
  }, [tasks])

  const addTask = (input: TaskInput) => {
    setTasks((current) => [
      ...current,
      {
        id: newTaskId(),
        title: input.title,
        date: input.date,
        time: input.time,
        endTime: input.endTime,
        color: taskColorValue(input.colorId),
        comments: 0,
        attachments: 0,
        assignees: [TEAM[0]],
      },
    ])
  }

  const updateTask = (id: string, input: TaskInput) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              title: input.title,
              date: input.date,
              time: input.time,
              endTime: input.endTime,
              color: taskColorValue(input.colorId),
            }
          : task,
      ),
    )
  }

  const deleteTask = (id: string) => {
    setTasks((current) => current.filter((task) => task.id !== id))
  }

  return { tasks, addTask, updateTask, deleteTask }
}
