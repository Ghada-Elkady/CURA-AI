'use client'

import { useState, useEffect, useCallback } from 'react'
import { appointmentsApi } from '@/lib/api/appointments'
import { AppointmentCard } from '@/components/appointments/AppointmentCard'
import type { Appointment } from '@/lib/types'

type Tab = 'scheduled' | 'completed' | 'cancelled'

const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: 'scheduled',  label: 'Upcoming',  emoji: '📅' },
  { key: 'completed',  label: 'Past',      emoji: '✅' },
  { key: 'cancelled',  label: 'Cancelled', emoji: '❌' },
]

function EmptyState({ tab }: { tab: Tab }) {
  const msgs: Record<Tab, { emoji: string; title: string; sub: string }> = {
    scheduled:  { emoji: '📭', title: 'No upcoming appointments',     sub: 'Book your first appointment today!' },
    completed:  { emoji: '📋', title: 'No completed appointments yet', sub: 'Your appointment history will appear here.' },
    cancelled:  { emoji: '🚫', title: 'No cancelled appointments',    sub: "That's great! Keep your appointments." },
  }
  const m = msgs[tab]
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <span className="text-5xl mb-4">{m.emoji}</span>
      <p className="font-semibold text-cura-text">{m.title}</p>
      <p className="text-cura-muted text-sm mt-1">{m.sub}</p>
    </div>
  )
}

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('scheduled')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await appointmentsApi.getMyAppointments(activeTab)
      setAppointments(data)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => { load() }, [load])

  return (
    <div className="flex flex-col min-h-screen bg-cura-bg">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-0 sticky top-0 z-20 shadow-sm">
        <h1 className="text-xl font-bold text-cura-text mb-4">My Appointments</h1>

        {/* Tab bar */}
        <div className="flex border-b border-gray-100">
          {TABS.map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 pb-3 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border-b-2 -mb-px ${
                activeTab === key
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-cura-muted'
              }`}
            >
              <span>{emoji}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-4">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-36 rounded-2xl" />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <div className="flex flex-col gap-3">
            {appointments.map((appt) => (
              <AppointmentCard key={appt.id} appointment={appt} onRefresh={load} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
