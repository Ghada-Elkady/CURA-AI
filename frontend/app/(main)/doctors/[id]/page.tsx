'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { format } from 'date-fns'
import { MapPin, Video, Building2, Star, Clock, Award, ChevronRight } from 'lucide-react'
import { doctorsApi } from '@/lib/api/doctors'
import { useBookingStore } from '@/lib/stores/bookingStore'
import { StarRating } from '@/components/ui/StarRating'
import { TopBar } from '@/components/layout/TopBar'
import type { Doctor, Review } from '@/lib/types'

type TabType = 'about' | 'reviews' | 'clinic'

export default function DoctorProfilePage() {
  const router = useRouter()
  const params = useParams()
  const doctorId = params.id as string
  const { setDoctor } = useBookingStore()

  const [doctor, setDoctorState] = useState<Doctor | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabType>('about')
  const [consultationType, setConsultationType] = useState<'in_person' | 'online'>('in_person')

  useEffect(() => {
    async function load() {
      try {
        const [doc, revs] = await Promise.all([
          doctorsApi.getById(doctorId),
          doctorsApi.getReviews(doctorId),
        ])
        setDoctorState(doc)
        setReviews(revs)
        if (doc.is_online_available && !doc.is_in_person_available) setConsultationType('online')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [doctorId])

  if (loading) {
    return (
      <div className="flex flex-col">
        <div className="skeleton h-64 w-full" />
        <div className="p-5 flex flex-col gap-3">
          <div className="skeleton h-6 rounded w-2/3" />
          <div className="skeleton h-4 rounded w-1/3" />
          <div className="skeleton h-20 rounded" />
        </div>
      </div>
    )
  }

  if (!doctor) return <div className="p-5 text-center text-cura-muted">Doctor not found</div>

  const handleBook = () => {
    setDoctor(doctor)
    router.push(`/booking/${doctor.id}`)
  }

  return (
    <div className="flex flex-col pb-28">
      {/* Hero */}
      <div className="relative h-52 bg-gradient-to-br from-primary-500 to-navy-900">
        <TopBar showBack transparent />
        <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end gap-4">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white border-2 border-white shadow-lg">
            <img
              src={doctor.user?.avatar_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.id}`}
              alt={doctor.user?.full_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-white">
            <h1 className="text-lg font-bold">{doctor.user?.full_name}</h1>
            <p className="text-primary-200 text-sm">{doctor.specialty?.name}</p>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="bg-white mx-4 -mt-5 relative z-10 rounded-2xl shadow-sm p-4 flex justify-around border border-gray-50">
        {[
          { label: 'Patients', value: doctor.review_count * 12 + 50, icon: '👥' },
          { label: 'Experience', value: `${doctor.experience_years}yr`, icon: '🏅' },
          { label: 'Rating', value: doctor.rating_avg.toFixed(1), icon: '⭐' },
          { label: 'Reviews', value: doctor.review_count, icon: '💬' },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1">
            <span className="text-lg">{stat.icon}</span>
            <span className="text-sm font-bold text-cura-text">{stat.value}</span>
            <span className="text-[10px] text-cura-muted">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Fee & consultation type */}
      <div className="mx-4 mt-4 bg-white rounded-2xl p-4 border border-gray-50 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-cura-muted">Consultation Fee</p>
            <p className="text-xl font-bold text-cura-text">${doctor.consultation_fee}</p>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={13} className="text-cura-muted" />
            <span className="text-xs text-cura-muted">30 min</span>
          </div>
        </div>
        {/* Type toggles */}
        <div className="flex gap-2">
          {doctor.is_in_person_available && (
            <button
              onClick={() => setConsultationType('in_person')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border transition-all ${
                consultationType === 'in_person'
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-white text-cura-muted border-gray-200'
              }`}
            >
              <Building2 size={14} /> In-Person
            </button>
          )}
          {doctor.is_online_available && (
            <button
              onClick={() => setConsultationType('online')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold border transition-all ${
                consultationType === 'online'
                  ? 'bg-primary-500 text-white border-primary-500'
                  : 'bg-white text-cura-muted border-gray-200'
              }`}
            >
              <Video size={14} /> Online
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-4 mt-4">
        <div className="flex bg-gray-100 rounded-2xl p-1 mb-4">
          {(['about', 'reviews', 'clinic'] as TabType[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                tab === t ? 'bg-white text-primary-500 shadow-sm' : 'text-cura-muted'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'about' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
            <h3 className="font-semibold text-sm text-cura-text mb-2">About</h3>
            <p className="text-sm text-cura-muted leading-relaxed">{doctor.bio ?? 'No bio available.'}</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-cura-muted">
              <Award size={14} className="text-primary-400" />
              <span>{doctor.experience_years} years of experience</span>
            </div>
          </div>
        )}

        {tab === 'reviews' && (
          <div className="flex flex-col gap-3">
            {reviews.length === 0 ? (
              <p className="text-center text-cura-muted text-sm py-8">No reviews yet</p>
            ) : reviews.map((r) => (
              <div key={r.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-primary-100 overflow-hidden">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${r.patient_id}`}
                      alt="Patient"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-cura-text">{r.patient_name ?? 'Patient'}</p>
                    <StarRating value={r.rating} size="sm" showValue={false} />
                  </div>
                  <span className="text-[10px] text-cura-muted">
                    {format(new Date(r.created_at), 'MMM d')}
                  </span>
                </div>
                {r.comment && <p className="text-xs text-cura-muted">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}

        {tab === 'clinic' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
            <h3 className="font-semibold text-sm text-cura-text mb-1">{doctor.clinic_name ?? 'Clinic'}</h3>
            <div className="flex items-start gap-2 text-xs text-cura-muted">
              <MapPin size={13} className="text-primary-400 mt-0.5 flex-shrink-0" />
              <span>{doctor.clinic_address ?? 'Address not available'}</span>
            </div>
            {/* Map placeholder */}
            <div className="mt-3 h-32 bg-primary-50 rounded-xl flex items-center justify-center">
              <span className="text-primary-300 text-sm">🗺️ Map view</span>
            </div>
          </div>
        )}
      </div>

      {/* Book button */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 z-30">
        <button onClick={handleBook} className="btn-primary w-full py-4 text-base shadow-lg shadow-primary-200">
          Book Appointment — ${doctor.consultation_fee}
        </button>
      </div>
    </div>
  )
}
