import { addDays, addMonths, format, isSameDay, startOfMonth, subMonths } from 'date-fns'
import clsx from 'clsx'

type Props = {
  month: Date
  selectedDay: Date
  onMonthChange: (next: Date) => void
  onSelectDay: (day: Date) => void
  markedDays?: Date[]
}

export function Calendar({ month, selectedDay, onMonthChange, onSelectDay, markedDays = [] }: Props) {
  const start = startOfMonth(month)

  // Monday-based grid
  const startWeekday = (start.getDay() + 6) % 7
  const firstCell = addDays(start, -startWeekday)

  const days: Date[] = []
  for (let i = 0; i < 42; i++) days.push(addDays(firstCell, i))

  return (
    <div className="border border-white/10 bg-[#0a0a0a]">
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <button
          type="button"
          onClick={() => onMonthChange(subMonths(month, 1))}
          className="text-white/40 hover:text-white transition-colors font-[var(--font-serif)] tracking-widest uppercase text-xs"
        >
          Predošlý
        </button>
        <div className="font-[var(--font-display)] text-white text-xl">
          {format(month, 'LLLL yyyy')}
        </div>
        <button
          type="button"
          onClick={() => onMonthChange(addMonths(month, 1))}
          className="text-white/40 hover:text-white transition-colors font-[var(--font-serif)] tracking-widest uppercase text-xs"
        >
          Ďalší
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-white/10">
        {['Po', 'Ut', 'St', 'Št', 'Pi', 'So', 'Ne'].map((d) => (
          <div
            key={d}
            className="bg-[#0a0a0a] px-3 py-3 text-[10px] text-white/40 uppercase tracking-widest font-[var(--font-serif)]"
          >
            {d}
          </div>
        ))}

        {days.map((day) => {
          const inMonth = day.getMonth() === month.getMonth()
          const selected = isSameDay(day, selectedDay)
          const marked = markedDays.some((m) => isSameDay(m, day))

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDay(day)}
              className={clsx(
                'bg-[#0a0a0a] px-3 py-4 text-left relative group transition-colors',
                inMonth ? 'text-white/80' : 'text-white/20',
                selected && 'outline outline-1 outline-[#d6a4a4] -outline-offset-1',
                'hover:bg-white/5',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-[var(--font-serif)] text-sm">{format(day, 'd')}</span>
                {marked ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#d6a4a4] opacity-90" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

