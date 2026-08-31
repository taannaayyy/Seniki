import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, RefObject } from 'react'
import { createPortal } from 'react-dom'
import { useOutsideClick } from '../hooks/useOutsideClick'
import TaskEditDialog from './TaskEditDialog'
import type { TaskFormValues } from './TaskForm'
import type { Task } from '../lib/tasks'
import './TaskActions.css'

type TaskActionsProps = {
  task: Task
  onUpdate: (id: string, values: TaskFormValues) => void
  onDelete: (id: string) => void
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

type TaskMenuProps = {
  /** Viewport rect of the button the menu hangs off. */
  anchor: DOMRect
  menuRef: RefObject<HTMLDivElement | null>
  onEdit: () => void
  onDelete: () => void
}

/** Gap between the kebab button and the menu. */
const MENU_OFFSET = 4

/**
 * Rendered into <body> rather than beside the button: tasks sit inside the
 * calendar's scrolling grids, so a menu positioned within one would be
 * clipped before it was ever seen.
 */
function TaskMenu({ anchor, menuRef, onEdit, onDelete }: TaskMenuProps) {
  // Hidden for the first paint only — the menu has to be in the DOM before it
  // can be measured, and an unmeasured menu would flash in the wrong place.
  const [style, setStyle] = useState<CSSProperties>({
    position: 'fixed',
    top: anchor.bottom + MENU_OFFSET,
    left: anchor.right,
    transform: 'translateX(-100%)',
    visibility: 'hidden',
  })

  useLayoutEffect(() => {
    const element = menuRef.current
    if (!element) return

    const { height, width } = element.getBoundingClientRect()
    // Open upwards when there isn't room below, e.g. a task late in the day.
    const below = anchor.bottom + MENU_OFFSET
    const flipUp = below + height > window.innerHeight
    setStyle({
      position: 'fixed',
      top: flipUp ? Math.max(MENU_OFFSET, anchor.top - MENU_OFFSET - height) : below,
      // Right-aligned to the button, but kept on screen at the left edge.
      left: Math.max(width + MENU_OFFSET, anchor.right),
      transform: 'translateX(-100%)',
    })
  }, [anchor, menuRef])

  return createPortal(
    <div className="task-menu" role="menu" ref={menuRef} style={style}>
      <button type="button" role="menuitem" className="task-menu-item" onClick={onEdit}>
        Edit task
      </button>
      <button
        type="button"
        role="menuitem"
        className="task-menu-item task-menu-item-danger"
        onClick={onDelete}
      >
        Delete
      </button>
    </div>,
    document.body,
  )
}

/** The kebab button, its menu, and the edit dialog it opens. */
function TaskActions({ task, onUpdate, onDelete }: TaskActionsProps) {
  // The button's rect at the moment it was pressed; null means closed.
  const [anchor, setAnchor] = useState<DOMRect | null>(null)
  const [editing, setEditing] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const menuOpen = anchor !== null
  const closeMenu = () => setAnchor(null)

  useOutsideClick([buttonRef, menuRef], closeMenu)

  // A fixed menu can't follow its button, so dismiss it rather than let it
  // drift. `capture` catches the calendar's own scroll containers too.
  useEffect(() => {
    if (!menuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu()
    }

    window.addEventListener('scroll', closeMenu, true)
    window.addEventListener('resize', closeMenu)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('scroll', closeMenu, true)
      window.removeEventListener('resize', closeMenu)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={menuOpen ? 'task-actions-btn task-actions-btn-open' : 'task-actions-btn'}
        onClick={() => {
          // Measured here, not inside the updater: React clears the synthetic
          // event's currentTarget once the handler returns, and the updater
          // runs later, during render.
          const rect = buttonRef.current?.getBoundingClientRect() ?? null
          setAnchor((current) => (current ? null : rect))
        }}
        aria-label="Task actions"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        <KebabIcon />
      </button>

      {anchor && (
        <TaskMenu
          anchor={anchor}
          menuRef={menuRef}
          onEdit={() => {
            setEditing(true)
            closeMenu()
          }}
          onDelete={() => {
            onDelete(task.id)
            closeMenu()
          }}
        />
      )}

      {editing && (
        <TaskEditDialog
          task={task}
          onSave={(values) => {
            onUpdate(task.id, values)
            setEditing(false)
          }}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  )
}

export default TaskActions
