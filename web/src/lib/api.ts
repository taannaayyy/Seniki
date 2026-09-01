import { taskColorValue } from './taskColors'
import type { Task, TaskInput } from './tasks'

/** Wire shape: what the backend sends/accepts (colorId, not the CSS `color` value). */
type WireTask = {
  id: string
  title: string
  date: string
  time: string
  endTime: string
  colorId: string
}

function fromWire(task: WireTask): Task {
  const { colorId, ...rest } = task
  return { ...rest, color: taskColorValue(colorId) }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail ?? `Request to ${path} failed (${response.status})`)
  }
  return response.status === 204 ? (undefined as T) : response.json()
}

export async function fetchTasks(): Promise<Task[]> {
  const tasks = await request<WireTask[]>('/api/tasks')
  return tasks.map(fromWire)
}

export async function createTask(input: TaskInput): Promise<Task> {
  const task = await request<WireTask>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return fromWire(task)
}

export async function updateTask(id: string, input: TaskInput): Promise<Task> {
  const task = await request<WireTask>(`/api/tasks/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
  return fromWire(task)
}

export async function deleteTask(id: string): Promise<void> {
  await request<void>(`/api/tasks/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
