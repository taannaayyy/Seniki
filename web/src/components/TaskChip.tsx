import type { CSSProperties } from 'react'
import TaskActions from './TaskActions'
import type { TaskFormValues } from './TaskForm'
import type { Task } from '../lib/tasks'
import './TaskChip.css'

type TaskChipProps = {
  task: Task
  onUpdate: (id: string, values: TaskFormValues) => void
  onDelete: (id: string) => void
}

/** One line in a month cell: title on the left, start time on the right. */
function TaskChip({ task, onUpdate, onDelete }: TaskChipProps) {
  return (
    <div className="task-chip" style={{ '--task-color': task.color } as CSSProperties}>
      <span className="task-chip-title">{task.title}</span>
      <span className="task-chip-time">{task.time}</span>
      <span className="task-chip-actions">
        <TaskActions task={task} onUpdate={onUpdate} onDelete={onDelete} />
      </span>
    </div>
  )
}

export default TaskChip
