import { useState } from 'react'
import type { FormEvent } from 'react'
import { formatMinutes, minutesOfDay } from '../lib/calendar'
import { TASK_COLORS } from '../lib/taskColors'
import type { TaskInput } from '../lib/tasks'
import { MIN_DURATION } from '../lib/timeline'
import './TaskForm.css'

export type TaskFormValues = TaskInput

type TaskFormProps = {
  initial: TaskFormValues
  submitLabel: string
  onSubmit: (values: TaskFormValues) => void
  onCancel: () => void
}

/**
 * The task fields themselves, with no opinion on how they are presented —
 * the add popover anchors this to the toolbar, the edit dialog centres it.
 */
function TaskForm({ initial, submitLabel, onSubmit, onCancel }: TaskFormProps) {
  const [values, setValues] = useState(initial)

  const set = <K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  /** Moving the start carries the end with it, keeping the duration. */
  const setStart = (time: string) => {
    setValues((current) => {
      const duration = Math.max(MIN_DURATION, minutesOfDay(current.endTime) - minutesOfDay(current.time))
      return { ...current, time, endTime: formatMinutes(minutesOfDay(time) + duration) }
    })
  }

  /** An end at or before the start is nudged forward rather than rejected. */
  const setEnd = (endTime: string) => {
    setValues((current) => {
      const start = minutesOfDay(current.time)
      const end = minutesOfDay(endTime)
      return { ...current, endTime: end > start ? endTime : formatMinutes(start + MIN_DURATION) }
    })
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const title = values.title.trim()
    if (!title) return
    onSubmit({ ...values, title })
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <label className="task-field">
        <span>Title</span>
        <input
          type="text"
          value={values.title}
          onChange={(event) => set('title', event.target.value)}
          placeholder="Task name"
          autoFocus
        />
      </label>

      <label className="task-field">
        <span>Date</span>
        <input
          type="date"
          value={values.date}
          onChange={(event) => set('date', event.target.value)}
        />
      </label>

      <div className="task-field-row">
        <label className="task-field">
          <span>Starts</span>
          <input
            type="time"
            value={values.time}
            onChange={(event) => setStart(event.target.value)}
          />
        </label>

        <label className="task-field">
          <span>Ends</span>
          <input
            type="time"
            value={values.endTime}
            onChange={(event) => setEnd(event.target.value)}
          />
        </label>
      </div>

      <div className="task-field">
        <span>Color</span>
        <div className="task-swatches">
          {TASK_COLORS.map((color) => (
            <button
              key={color.id}
              type="button"
              className={
                color.id === values.colorId ? 'task-swatch task-swatch-active' : 'task-swatch'
              }
              style={{ background: color.value }}
              aria-label={color.label}
              aria-pressed={color.id === values.colorId}
              onClick={() => set('colorId', color.id)}
            />
          ))}
        </div>
      </div>

      <div className="task-form-actions">
        <button type="button" className="task-form-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="task-form-submit" disabled={!values.title.trim()}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}

export default TaskForm
