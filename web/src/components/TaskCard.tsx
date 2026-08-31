import { useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useOutsideClick } from '../hooks/useOutsideClick'
import type { Task } from '../lib/tasks'
import './TaskCard.css'

type TaskCardProps = {
  task: Task
  onDelete: (id: string) => void
}

function CommentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 5.5h16v11H9l-4 3.5v-3.5H4z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function AttachmentIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M16.5 7.5 9 15a2.5 2.5 0 0 0 3.5 3.5l7-7a4.5 4.5 0 1 0-6.4-6.4l-7 7A6.5 6.5 0 0 0 15.4 21"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function KebabIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="5.5" r="1.4" fill="currentColor" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
      <circle cx="12" cy="18.5" r="1.4" fill="currentColor" />
    </svg>
  )
}

function TaskCard({ task, onDelete }: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  useOutsideClick(menuRef, () => setMenuOpen(false))

  return (
    <div className="task-card" style={{ '--task-color': task.color } as CSSProperties}>
      <div className="task-card-bar" />
      <div className="task-card-title">{task.title}</div>

      <div className="task-card-footer">
        <div className="task-card-meta">
          <span className="task-meta-item">
            <CommentIcon />
            {task.comments}
          </span>
          <span className="task-meta-item">
            <AttachmentIcon />
            {task.attachments}
          </span>
        </div>

        <div className="task-card-right">
          <div className="avatar-stack">
            {task.assignees.map((assignee, index) => (
              <span
                key={index}
                className="mini-avatar"
                style={{ background: assignee.color }}
              >
                {assignee.initial}
              </span>
            ))}
          </div>

          <div className="task-menu-wrap" ref={menuRef}>
            <button
              type="button"
              className="task-menu-btn"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label="Task actions"
              aria-expanded={menuOpen}
            >
              <KebabIcon />
            </button>

            {menuOpen && (
              <div className="task-menu" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  className="task-menu-item task-menu-item-danger"
                  onClick={() => {
                    onDelete(task.id)
                    setMenuOpen(false)
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskCard
