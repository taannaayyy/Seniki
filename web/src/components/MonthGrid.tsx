import TaskChip from './TaskChip'
import type { TaskFormValues } from './TaskForm'
import type { CalendarCell } from '../lib/calendar'
import { formatMonthShort, formatWeekdayShort, isoWeek } from '../lib/locale'
import type { Task } from '../lib/tasks'
import './MonthGrid.css'

type MonthGridProps = {
  weeks: CalendarCell[][]
  tasksByDay: Map<string, Task[]>
  todayIso: string
  locale: string
  onUpdate: (id: string, values: TaskFormValues) => void
  onDelete: (id: string) => void
}

/** "1" normally, "Sep 1" on the day a month turns over. */
function dayLabel(date: Date, locale: string): string {
  const day = date.getDate()
  return day === 1 ? `${formatMonthShort(date, locale)} ${day}` : String(day)
}

function MonthGrid({ weeks, tasksByDay, todayIso, locale, onUpdate, onDelete }: MonthGridProps) {
  return (
    <div className="month-wrap">
      <div className="month-inner">
        <div className="month-head">
          <div className="month-week-head" />
          {weeks[0].map((cell) => (
            <div key={cell.iso} className="month-weekday">
              {formatWeekdayShort(cell.date, locale)}
            </div>
          ))}
        </div>

        {weeks.map((week) => (
          <div className="month-week" key={week[0].iso}>
            <div className="month-week-num">{isoWeek(week[0].date)}</div>

            {week.map((cell) => (
              <div
                key={cell.iso}
                className={cell.inCurrentMonth ? 'month-cell' : 'month-cell month-cell-outside'}
              >
                <div className="month-daynum-row">
                  <span
                    className={
                      cell.iso === todayIso ? 'month-daynum month-daynum-today' : 'month-daynum'
                    }
                  >
                    {dayLabel(cell.date, locale)}
                  </span>
                </div>

                <div className="month-cell-tasks">
                  {(tasksByDay.get(cell.iso) ?? []).map((task) => (
                    <TaskChip key={task.id} task={task} onUpdate={onUpdate} onDelete={onDelete} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default MonthGrid
