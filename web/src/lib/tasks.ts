import { taskColorValue } from './taskColors'
import { toISODate } from './calendar'

export type Assignee = {
  initial: string
  color: string
}

export type Task = {
  id: string
  title: string
  date: string // ISO YYYY-MM-DD
  color: string
  comments: number
  attachments: number
  assignees: Assignee[]
}

/** Placeholder team, standing in until the app has real accounts. */
export const TEAM: Assignee[] = [
  { initial: 'T', color: 'var(--accent)' },
  { initial: 'A', color: '#5b8def' },
  { initial: 'M', color: '#4caf7d' },
  { initial: 'S', color: '#9575cd' },
  { initial: 'D', color: '#e0a13d' },
]

/**
 * Seed data anchored to whatever month the calendar first opens in, so it
 * never opens empty. Kept in-memory only — there's no backend yet.
 */
export function buildInitialTasks(today: Date): Task[] {
  const year = today.getFullYear()
  const month = today.getMonth()
  const onDay = (day: number) => toISODate(new Date(year, month, day))

  return [
    {
      id: 'seed-1',
      title: 'Branding Aviro Discussion',
      date: onDay(3),
      color: taskColorValue('purple'),
      comments: 16,
      attachments: 2,
      assignees: [TEAM[1], TEAM[2]],
    },
    {
      id: 'seed-2',
      title: 'UX Planning for Architecture - Payment Application',
      date: onDay(10),
      color: taskColorValue('accent'),
      comments: 21,
      attachments: 8,
      assignees: [TEAM[1], TEAM[4], TEAM[2]],
    },
    {
      id: 'seed-3',
      title: 'Kickoff Meeting',
      date: onDay(18),
      color: taskColorValue('green'),
      comments: 21,
      attachments: 8,
      assignees: [TEAM[0], TEAM[1]],
    },
    {
      id: 'seed-4',
      title: 'Build Event Registration Page',
      date: onDay(24),
      color: taskColorValue('blue'),
      comments: 21,
      attachments: 8,
      assignees: [TEAM[1], TEAM[4], TEAM[2]],
    },
  ]
}
