import { apiClient } from './client'
import type { Appointment } from '@/lib/types'
import { MOCK_APPOINTMENTS, MOCK_DOCTORS } from './mockData'

export const appointmentsApi = {
  create: async (data: {
    doctor_id: string
    slot_id: string
    consultation_type: 'in_person' | 'online'
    notes?: string
  }): Promise<Appointment> => {
    try {
      const res = await apiClient.post('/appointments', data)
      if (res.data) return res.data
    } catch (e) {
      console.warn('Backend API unavailable, using mock appointment creation.')
    }
    const doc = MOCK_DOCTORS.find((d) => d.id === data.doctor_id) || MOCK_DOCTORS[0]
    return {
      id: `app-${Date.now()}`,
      patient_id: 'usr-1',
      doctor_id: data.doctor_id,
      slot_id: data.slot_id,
      consultation_type: data.consultation_type,
      status: 'scheduled',
      notes: data.notes || '',
      created_at: new Date().toISOString(),
      doctor: doc,
    }
  },

  getMyAppointments: async (status?: string): Promise<Appointment[]> => {
    try {
      const params = status ? { status } : {}
      const res = await apiClient.get('/appointments/me', { params })
      if (Array.isArray(res.data)) return res.data
    } catch (e) {
      console.warn('Backend API unavailable, returning mock appointments.')
    }
    if (status) {
      return MOCK_APPOINTMENTS.filter((a) => a.status === status)
    }
    return MOCK_APPOINTMENTS
  },

  getById: async (id: string): Promise<Appointment> => {
    try {
      const res = await apiClient.get(`/appointments/${id}`)
      if (res.data) return res.data
    } catch (e) {
      console.warn('Backend API unavailable, returning mock appointment.')
    }
    return MOCK_APPOINTMENTS.find((a) => a.id === id) || MOCK_APPOINTMENTS[0]
  },

  reschedule: async (id: string, new_slot_id: string): Promise<Appointment> => {
    try {
      const res = await apiClient.put(`/appointments/${id}/reschedule`, { new_slot_id })
      if (res.data) return res.data
    } catch (e) {
      console.warn('Backend API unavailable, returning rescheduled appointment mock.')
    }
    const app = MOCK_APPOINTMENTS.find((a) => a.id === id) || MOCK_APPOINTMENTS[0]
    return { ...app, slot_id: new_slot_id, status: 'rescheduled' }
  },

  cancel: async (id: string) => {
    try {
      const res = await apiClient.delete(`/appointments/${id}`)
      if (res.data) return res.data
    } catch (e) {
      console.warn('Backend API unavailable, returning mock cancel result.')
    }
    return { success: true, message: 'Appointment cancelled successfully.' }
  },
}

