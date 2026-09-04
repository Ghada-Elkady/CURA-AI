'use client'

import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Calendar, Clock, Video, Building2 } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { appointmentsApi } from '@/lib/api/appointments'
import { showToast } from '@/components/ui/ToastProvider'
import type { Appointment } from '@/lib/types'

interface AppointmentCardProps {
  appointment: Appointment
  onRefresh?: () => void
}

export function AppointmentCard({ appointment, onRefresh }: AppointmentCardProps) {
  const router = useRouter()
  const { doctor, slot, status, consultation_type } = appointment

  const doctorName = doctor?.user?.full_name ?? 'Doctor'
  const doctorAvatar = doctor?.user?.avatar_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor?.id}`
  const specialty = doctor?.specialty?.name ?? 'General'
  const slotDate = slot?.slot_datetime ? new Date(slot.slot_datetime) : null

  const handleCancel = async () => {
    if (!confirm('Cancel this appointment?')) return
    try {
      await appointmentsApi.cancel(appointment.id)
      showToast('Appointment cancelled', 'success')
      onRefresh?.()
    } catch {
      showToast('Failed to cancel appointment', 'error')
    }
  }

  const handleReschedule = () => {
    router.push(`/booking/${doctor?.id}?reschedule=${appointment.id}`)
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
      {/* Doctor row */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-primary-100 flex-shrink-0">
          <img src={doctorAvatar} alt={doctorName} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-cura-text truncate">{doctorName}</p>
          <p className="text-xs text-primary-500 font-medium">{specialty}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Time + type */}
      <div className="flex items-center gap-4 py-2.5 border-t border-b border-gray-50">
        {slotDate && (
          <>
            <div className="flex items-center gap-1.5 text-xs text-cura-muted">
              <Calendar size={13} className="text-primary-400" />
              <span>{format(slotDate, 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-cura-muted">
              <Clock size={13} className="text-primary-400" />
              <span>{format(slotDate, 'h:mm a')}</span>
            </div>
          </>
        )}
        <div className="flex items-center gap-1.5 text-xs text-cura-muted ml-auto">
          {consultation_type === 'online' ? (
            <><Video size={13} className="text-primary-400" /><span>Online</span></>
          ) : (
            <><Building2 size={13} className="text-primary-400" /><span>In-Person</span></>
          )}
        </div>
      </div>

      {/* Actions for scheduled */}
      {status === 'scheduled' && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleReschedule}
            className="flex-1 py-2 rounded-xl border border-primary-200 text-primary-600 text-xs font-semibold hover:bg-primary-50 transition-colors"
          >
            Reschedule
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 py-2 rounded-xl border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Join button for online completed-not-yet */}
      {status === 'scheduled' && consultation_type === 'online' && (
        <button
          onClick={() => showToast('Video consultation feature coming soon!', 'info')}
          className="w-full mt-2 py-2 rounded-xl bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors"
        >
          Join Online Consultation
        </button>
      )}
    </div>
  )
}
