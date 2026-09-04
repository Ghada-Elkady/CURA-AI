import { create } from 'zustand'
import type { Doctor, TimeSlot } from '@/lib/types'

interface BookingState {
  selectedDoctor: Doctor | null
  selectedDate: Date | null
  selectedSlot: TimeSlot | null
  consultationType: 'in_person' | 'online'
  notes: string
  currentStep: number
  lastBookedAppointmentId: string | null

  setDoctor: (doctor: Doctor) => void
  setDate: (date: Date) => void
  setSlot: (slot: TimeSlot) => void
  setConsultationType: (type: 'in_person' | 'online') => void
  setNotes: (notes: string) => void
  setStep: (step: number) => void
  setLastBookedAppointmentId: (id: string) => void
  reset: () => void
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedDoctor: null,
  selectedDate: null,
  selectedSlot: null,
  consultationType: 'in_person',
  notes: '',
  currentStep: 1,
  lastBookedAppointmentId: null,

  setDoctor: (doctor) => set({ selectedDoctor: doctor }),
  setDate: (date) => set({ selectedDate: date, selectedSlot: null }),
  setSlot: (slot) => set({ selectedSlot: slot }),
  setConsultationType: (type) => set({ consultationType: type }),
  setNotes: (notes) => set({ notes }),
  setStep: (step) => set({ currentStep: step }),
  setLastBookedAppointmentId: (id) => set({ lastBookedAppointmentId: id }),
  reset: () =>
    set({
      selectedDoctor: null,
      selectedDate: null,
      selectedSlot: null,
      consultationType: 'in_person',
      notes: '',
      currentStep: 1,
      lastBookedAppointmentId: null,
    }),
}))
