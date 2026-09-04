'use client'

import { format } from 'date-fns'
import type { TimeSlot } from '@/lib/types'

interface TimeSlotGridProps {
  slots: TimeSlot[]
  selectedSlot: TimeSlot | null
  onSelect: (slot: TimeSlot) => void
}

export function TimeSlotGrid({ slots, selectedSlot, onSelect }: TimeSlotGridProps) {
  if (slots.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-3xl mb-2">📅</p>
        <p className="text-cura-muted text-sm">No available slots for this date.</p>
        <p className="text-cura-muted text-xs mt-1">Please select another day.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((slot) => {
        const isSelected = selectedSlot?.id === slot.id
        const time = format(new Date(slot.slot_datetime), 'h:mm a')

        return (
          <button
            key={slot.id}
            onClick={() => !slot.is_booked && onSelect(slot)}
            disabled={slot.is_booked}
            className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all border ${
              isSelected
                ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-200'
                : slot.is_booked
                ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                : 'bg-white text-cura-text border-gray-200 hover:border-primary-300 hover:bg-primary-50'
            }`}
            aria-label={`${time} ${slot.is_booked ? '(booked)' : ''}`}
            aria-pressed={isSelected}
          >
            {time}
          </button>
        )
      })}
    </div>
  )
}
