import type { TaskColorId } from './taskColors'
import { minutesOfDay } from './calendar'

export type Task = {
  id: string
  title: string
  date: string // ISO YYYY-MM-DD
  time: string // 24-hour HH:MM, local — start
  endTime: string // 24-hour HH:MM, local — end, same day
  color: string
}

/** The editable fields of a task, as the add and edit forms collect them. */
export type TaskInput = {
  title: string
  date: string
  time: string
  endTime: string
  colorId: TaskColorId
}

/** Chronological within a day; ties fall back to the title so order is stable. */
export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) => minutesOfDay(a.time) - minutesOfDay(b.time) || a.title.localeCompare(b.title),
  )
}
