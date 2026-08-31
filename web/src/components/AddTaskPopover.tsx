import { useRef } from 'react'
import { useOutsideClick } from '../hooks/useOutsideClick'
import TaskForm from './TaskForm'
import type { TaskFormValues } from './TaskForm'
import { TASK_COLORS } from '../lib/taskColors'
import './AddTaskPopover.css'

type AddTaskPopoverProps = {
  defaultDate: string
  onAdd: (values: TaskFormValues) => void
  onClose: () => void
}

/** A new task defaults to a one-hour slot in the working morning. */
const DEFAULT_TIME = '09:00'
const DEFAULT_END_TIME = '10:00'

function AddTaskPopover({ defaultDate, onAdd, onClose }: AddTaskPopoverProps) {
  const ref = useRef<HTMLDivElement>(null)

  useOutsideClick(ref, onClose)

  return (
    <div className="add-task-popover" ref={ref}>
      <TaskForm
        initial={{
          title: '',
          date: defaultDate,
          time: DEFAULT_TIME,
          endTime: DEFAULT_END_TIME,
          colorId: TASK_COLORS[0].id,
        }}
        submitLabel="Add task"
        onSubmit={onAdd}
        onCancel={onClose}
      />
    </div>
  )
}

export default AddTaskPopover
