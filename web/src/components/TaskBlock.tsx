import type { CSSProperties } from 'react'
import TaskActions from './TaskActions'
import type { TaskFormValues } from './TaskForm'
import type { Task } from '../lib/tasks'
import './TaskBlock.css'

type TaskBlockProps = {
  task: Task
  /** Absolute placement within the day column, as percentages of the day. */
  style: CSSProperties
  /** Below this height there is only room for a single line. */
  compact: boolean
  onUpdate: (id: string, values: TaskFormValues) => void
  onDelete: (id: string) => void
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="task-block-clock">
      <circle cx="12" cy="12" r="8.25" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.75V12l3 1.75" fill="none" stroke="currentColor" strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** A task on the day/week timeline, sized by its start and end times. */
function TaskBlock({ task, style, compact, onUpdate, onDelete }: TaskBlockProps) {
  return (
    <div
      className={compact ? 'task-block task-block-compact' : 'task-block'}
      style={{ ...style, '--task-color': task.color } as CSSProperties}
    >
      <div className="task-block-head">
        <span className="task-block-title">{task.title}</span>
        <TaskActions task={task} onUpdate={onUpdate} onDelete={onDelete} />
      </div>
      <div className="task-block-time">
        <ClockIcon />
        {task.time} – {task.endTime}
      </div>
    </div>
  )
}

export default TaskBlock
