import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useOutsideClick } from '../hooks/useOutsideClick'
import { TASK_COLORS } from '../lib/taskColors'
import type { TaskColorId } from '../lib/taskColors'
import './AddTaskPopover.css'

type AddTaskPopoverProps = {
  defaultDate: string
  onAdd: (input: { title: string; date: string; colorId: TaskColorId }) => void
  onClose: () => void
}

function AddTaskPopover({ defaultDate, onAdd, onClose }: AddTaskPopoverProps) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(defaultDate)
  const [colorId, setColorId] = useState<TaskColorId>(TASK_COLORS[0].id)
  const ref = useRef<HTMLFormElement>(null)

  useOutsideClick(ref, onClose)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    onAdd({ title: trimmed, date, colorId })
  }

  return (
    <form className="add-task-popover" ref={ref} onSubmit={handleSubmit}>
      <label className="add-task-field">
        <span>Title</span>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Task name"
          autoFocus
        />
      </label>

      <label className="add-task-field">
        <span>Date</span>
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </label>

      <div className="add-task-field">
        <span>Color</span>
        <div className="add-task-swatches">
          {TASK_COLORS.map((color) => (
            <button
              key={color.id}
              type="button"
              className={color.id === colorId ? 'add-task-swatch add-task-swatch-active' : 'add-task-swatch'}
              style={{ background: color.value }}
              aria-label={color.label}
              aria-pressed={color.id === colorId}
              onClick={() => setColorId(color.id)}
            />
          ))}
        </div>
      </div>

      <div className="add-task-actions">
        <button type="button" className="add-task-cancel" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="add-task-submit" disabled={!title.trim()}>
          Add task
        </button>
      </div>
    </form>
  )
}

export default AddTaskPopover
