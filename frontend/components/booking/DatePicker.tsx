'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addDays, startOfWeek, isBefore, startOfDay, isSameDay } from 'date-fns'

interface DatePickerProps {
  selectedDate: Date | null
  onSelect: (date: Date) => void
}

export function DatePicker({ selectedDate, onSelect }: DatePickerProps) {
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )

  const today = startOfDay(new Date())
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const prevWeek = () => setWeekStart((d) => addDays(d, -7))
  const nextWeek = () => setWeekStart((d) => addDays(d, 7))

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
      {/* Month + navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevWeek}
          className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          aria-label="Previous week"
        >
          <ChevronLeft size={18} className="text-cura-muted" />
        </button>
        <span className="text-sm font-semibold text-cura-text">
          {format(weekStart, 'MMMM yyyy')}
        </span>
        <button
          onClick={nextWeek}
          className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          aria-label="Next week"
        >
          <ChevronRight size={18} className="text-cura-muted" />
        </button>
      </div>

      {/* Days row */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isPast = isBefore(startOfDay(day), today)
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
          const isToday = isSameDay(day, today)

          return (
            <button
              key={day.toISOString()}
              onClick={() => !isPast && onSelect(day)}
              disabled={isPast}
              className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all ${
                isSelected
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
                  : isToday
                  ? 'bg-primary-50 text-primary-600'
                  : isPast
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-cura-text hover:bg-primary-50'
              }`}
              aria-label={format(day, 'EEEE, MMMM d')}
              aria-pressed={isSelected}
            >
              <span className="text-[10px] font-medium">{format(day, 'EEE')}</span>
              <span className="text-sm font-bold mt-0.5">{format(day, 'd')}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
