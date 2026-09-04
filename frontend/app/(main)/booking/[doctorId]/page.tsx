'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { format } from 'date-fns'
import { CheckCircle, Building2, Video } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { doctorsApi } from '@/lib/api/doctors'
import { appointmentsApi } from '@/lib/api/appointments'
import { useBookingStore } from '@/lib/stores/bookingStore'
import { DatePicker } from '@/components/booking/DatePicker'
import { TimeSlotGrid } from '@/components/booking/TimeSlotGrid'
import { TopBar } from '@/components/layout/TopBar'
import { showToast } from '@/components/ui/ToastProvider'
import type { Doctor, TimeSlot } from '@/lib/types'

const STEPS = ['Date', 'Time', 'Review', 'Confirm']

export default function BookingPage() {
  const router = useRouter()
  const params = useParams()
  const doctorId = params.doctorId as string

  const { selectedDoctor, selectedDate, selectedSlot, consultationType,
          notes, currentStep, setDoctor, setDate, setSlot,
          setConsultationType, setNotes, setStep, reset } = useBookingStore()

  const [doctor, setDoctorState] = useState<Doctor | null>(selectedDoctor)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [booking, setBooking] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  // Load doctor if not in store
  useEffect(() => {
    if (!doctor) {
      doctorsApi.getById(doctorId).then((d) => { setDoctorState(d); setDoctor(d) })
    }
  }, [doctorId, doctor, setDoctor])

  // Load slots when date changes
  useEffect(() => {
    if (selectedDate) {
      setLoadingSlots(true)
      const dateStr = format(selectedDate, 'yyyy-MM-dd')
      doctorsApi.getSlots(doctorId, dateStr)
        .then(setSlots)
        .finally(() => setLoadingSlots(false))
    }
  }, [selectedDate, doctorId])

  const handleConfirm = async () => {
    if (!selectedSlot) return
    setBooking(true)
    try {
      await appointmentsApi.create({
        doctor_id: doctorId,
        slot_id: selectedSlot.id,
        consultation_type: consultationType,
        notes: notes || undefined,
      })
      setConfirmed(true)
      setStep(4)
      reset()
    } catch (err: any) {
      showToast(err?.response?.data?.detail ?? 'Booking failed. Please try again.', 'error')
    } finally {
      setBooking(false)
    }
  }

  const canNext = () => {
    if (currentStep === 1) return !!selectedDate
    if (currentStep === 2) return !!selectedSlot
    return true
  }

  const doctorName = doctor?.user?.full_name ?? doctor?.full_name ?? 'Doctor'

  if (confirmed || currentStep === 4) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-emerald-500" />
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h1 className="text-2xl font-bold text-cura-text mb-2">Booking Confirmed! 🎉</h1>
          <p className="text-cura-muted text-sm mb-8">
            Your appointment has been successfully booked. You&apos;ll receive a reminder notification.
          </p>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 mb-6 text-left">
            <p className="text-xs text-cura-muted mb-2">Appointment Summary</p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-100 overflow-hidden">
                <img
                  src={doctor?.user?.avatar_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctorId}`}
                  alt={doctorName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-semibold text-sm text-cura-text">{doctorName}</p>
                <p className="text-xs text-primary-500">{doctor?.specialty?.name ?? 'General'}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <button onClick={() => router.push('/appointments')} className="btn-primary w-full py-3.5">
              View My Appointments
            </button>
            <button onClick={() => router.push('/search')} className="btn-secondary w-full py-3.5">
              Book Another
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar title={`Book — ${doctorName}`} />

      {/* Step indicator */}
      <div className="bg-white px-5 pb-4 border-b border-gray-50">
        <div className="flex items-center gap-0">
          {STEPS.map((label, i) => {
            const stepNum = i + 1
            const isActive = currentStep === stepNum
            const isDone = currentStep > stepNum
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    isDone ? 'bg-primary-500 text-white' : isActive ? 'bg-primary-100 text-primary-600 border-2 border-primary-500' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {isDone ? '✓' : stepNum}
                  </div>
                  <span className={`text-[9px] mt-1 font-medium ${isActive ? 'text-primary-500' : 'text-gray-400'}`}>{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-4 mx-1 ${isDone ? 'bg-primary-400' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-base font-semibold text-cura-text mb-4">Select a Date</h2>
              <DatePicker selectedDate={selectedDate} onSelect={setDate} />
              {selectedDate && (
                <p className="text-center text-sm text-primary-500 mt-3 font-medium">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </p>
              )}
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-base font-semibold text-cura-text mb-1">Select a Time</h2>
              <p className="text-xs text-cura-muted mb-4">{selectedDate && format(selectedDate, 'EEEE, MMMM d')}</p>
              {loadingSlots
                ? <div className="grid grid-cols-3 gap-2">{[...Array(9)].map((_, i) => <div key={i} className="skeleton h-10 rounded-xl" />)}</div>
                : <TimeSlotGrid slots={slots} selectedSlot={selectedSlot} onSelect={setSlot} />
              }
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-base font-semibold text-cura-text mb-4">Review Appointment</h2>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex flex-col gap-4">
                {/* Doctor */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-primary-100">
                    <img src={doctor?.user?.avatar_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctorId}`} alt={doctorName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-cura-text">{doctorName}</p>
                    <p className="text-xs text-primary-500">{doctor?.specialty?.name}</p>
                  </div>
                </div>
                <div className="border-t border-gray-50" />
                {/* Details */}
                <div className="flex flex-col gap-2 text-sm">
                  {[
                    { label: 'Date', value: selectedDate ? format(selectedDate, 'MMMM d, yyyy') : '-' },
                    { label: 'Time', value: selectedSlot ? format(new Date(selectedSlot.slot_datetime), 'h:mm a') : '-' },
                    { label: 'Duration', value: '30 minutes' },
                    { label: 'Fee', value: `$${doctor?.consultation_fee ?? 0}` },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-cura-muted">{label}</span>
                      <span className="font-medium text-cura-text">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-50" />
                {/* Consultation type */}
                <div className="flex gap-2">
                  {doctor?.is_in_person_available && (
                    <button onClick={() => setConsultationType('in_person')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all ${consultationType === 'in_person' ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-cura-muted border-gray-200'}`}>
                      <Building2 size={13} /> In-Person
                    </button>
                  )}
                  {doctor?.is_online_available && (
                    <button onClick={() => setConsultationType('online')} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all ${consultationType === 'online' ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-cura-muted border-gray-200'}`}>
                      <Video size={13} /> Online
                    </button>
                  )}
                </div>
                {/* Notes */}
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes for the doctor (optional)..."
                  className="input-field resize-none h-20 text-sm"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav buttons */}
      <div className="px-4 py-4 bg-white border-t border-gray-50 flex gap-3">
        {currentStep > 1 && (
          <button onClick={() => setStep(currentStep - 1)} className="btn-secondary flex-1 py-3.5">
            Back
          </button>
        )}
        {currentStep < 3 ? (
          <button onClick={() => setStep(currentStep + 1)} disabled={!canNext()} className="btn-primary flex-1 py-3.5">
            Next
          </button>
        ) : (
          <button onClick={handleConfirm} disabled={booking} className="btn-primary flex-1 py-3.5">
            {booking ? 'Confirming…' : 'Confirm Booking'}
          </button>
        )}
      </div>
    </div>
  )
}
