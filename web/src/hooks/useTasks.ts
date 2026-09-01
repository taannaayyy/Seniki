import { useCallback, useEffect, useRef, useState } from 'react'
import * as api from '../lib/api'
import type { Task, TaskInput } from '../lib/tasks'

/**
 * Task state for the calendar, backed by the user's iCloud calendar over the
 * backend's CalDAV bridge (see app/icloud.py).
 *
 * This is the single seam between the UI and wherever tasks are stored: the
 * components below it only ever see `tasks`, `loading`, `error`, and these
 * three operations.
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // A mutation's own refresh can resolve before (or after) the initial
  // mount fetch, or two refreshes can race each other. Only the response to
  // the most recently *started* request is allowed to win.
  const requestId = useRef(0)

  const refresh = useCallback(() => {
    const id = ++requestId.current
    return api
      .fetchTasks()
      .then((fetched) => {
        if (id === requestId.current) setTasks(fetched)
      })
      .catch((err: unknown) => {
        if (id === requestId.current) setError(err instanceof Error ? err.message : String(err))
      })
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const addTask = (input: TaskInput) => {
    api
      .createTask(input)
      .then(() => refresh())
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
  }

  const updateTask = (id: string, input: TaskInput) => {
    api
      .updateTask(id, input)
      .then(() => refresh())
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
  }

  const deleteTask = (id: string) => {
    api
      .deleteTask(id)
      .then(() => refresh())
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
  }

  return { tasks, loading, error, addTask, updateTask, deleteTask }
}
