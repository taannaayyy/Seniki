import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import TaskForm from './TaskForm'
import type { TaskFormValues } from './TaskForm'
import { taskColorId } from '../lib/taskColors'
import type { Task } from '../lib/tasks'
import './TaskEditDialog.css'

type TaskEditDialogProps = {
  task: Task
  onSave: (values: TaskFormValues) => void
  onClose: () => void
}

/**
 * A centred dialog rather than a popover anchored to the task.
 *
 * Rendered into <body>: the trigger lives inside a month chip, whose actions
 * are hidden until hover, and inside a timeline block, which clips its
 * overflow — either would swallow a dialog nested under it.
 */
function TaskEditDialog({ task, onSave, onClose }: TaskEditDialogProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return createPortal(
    <div
      className="task-dialog-overlay"
      // Only a press that both starts and ends on the backdrop closes it, so
      // a drag that ends outside the panel doesn't discard the edit.
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="task-dialog" role="dialog" aria-modal="true" aria-label="Edit task">
        <div className="task-dialog-title">Edit task</div>
        <TaskForm
          initial={{
            title: task.title,
            date: task.date,
            time: task.time,
            endTime: task.endTime,
            colorId: taskColorId(task.color),
          }}
          submitLabel="Save changes"
          onSubmit={onSave}
          onCancel={onClose}
        />
      </div>
    </div>,
    document.body,
  )
}

export default TaskEditDialog
