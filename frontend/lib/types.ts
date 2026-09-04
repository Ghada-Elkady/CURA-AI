// ─── Core User & Auth ─────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  full_name: string
  phone?: string | null
  avatar_url?: string | null
  role: 'patient' | 'doctor' | 'admin'
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

// ─── Specialties ──────────────────────────────────────────────────────────────

export interface Specialty {
  id: string
  name: string
  icon?: string | null
  color_hex?: string | null
  created_at?: string
}

// ─── Doctors ──────────────────────────────────────────────────────────────────

/** Returned from GET /doctors (list/search) — flat shape from backend */
export interface Doctor {
  id: string
  // List fields (from DoctorListItem)
  full_name?: string
  avatar_url?: string | null
  specialty_name?: string | null
  specialty_icon?: string | null
  // Profile fields (from DoctorResponse) - nested
  user?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string | null
  }
  specialty?: Specialty | null
  bio?: string | null
  experience_years: number
  consultation_fee: number
  clinic_name?: string | null
  clinic_address?: string | null
  clinic_lat?: number | null
  clinic_lng?: number | null
  rating_avg: number
  review_count: number
  gender?: 'male' | 'female' | null
  is_online_available: boolean
  is_in_person_available: boolean
  created_at?: string
  // Convenience: used by DoctorCard for both list/profile shapes
  email?: string
}

// ─── Time Slots ───────────────────────────────────────────────────────────────

export interface TimeSlot {
  id: string
  doctor_id?: string
  slot_datetime: string
  duration_minutes: number
  is_booked: boolean
}

// ─── Appointments ─────────────────────────────────────────────────────────────

export type ConsultationType = 'in_person' | 'online'
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  slot_id: string
  consultation_type: ConsultationType
  status: AppointmentStatus
  notes?: string | null
  created_at: string
  updated_at?: string
  // Loaded relations (from backend eager-load)
  patient?: User
  doctor?: Doctor
  slot?: TimeSlot
  review?: Review | null
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface Review {
  id: string
  appointment_id: string
  patient_id: string
  doctor_id: string
  rating: number
  comment?: string | null
  created_at: string
  patient_name?: string | null
  patient?: User
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: string
  title: string
  body: string
  notification_type?: string
  is_read: boolean
  created_at: string
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

export interface ApiError {
  detail?: string
  message?: string
  [key: string]: unknown
}
