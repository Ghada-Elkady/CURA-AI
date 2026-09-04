'use client'

import { useRouter } from 'next/navigation'
import { MapPin, Video, Building2 } from 'lucide-react'
import { StarRating } from '@/components/ui/StarRating'
import type { Doctor } from '@/lib/types'

interface DoctorCardProps {
  doctor: Doctor
  variant?: 'horizontal' | 'vertical'
}

/** Resolves name from both DoctorListItem (flat) and DoctorResponse (nested) shapes */
function getDoctorName(doctor: Doctor): string {
  return doctor.user?.full_name ?? doctor.full_name ?? 'Unknown Doctor'
}

function getDoctorAvatar(doctor: Doctor): string {
  const seed = doctor.id
  return doctor.user?.avatar_url ?? doctor.avatar_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
}

function getSpecialtyName(doctor: Doctor): string {
  return doctor.specialty?.name ?? doctor.specialty_name ?? 'General'
}

export function DoctorCard({ doctor, variant = 'vertical' }: DoctorCardProps) {
  const router = useRouter()
  const name = getDoctorName(doctor)
  const avatar = getDoctorAvatar(doctor)
  const specialty = getSpecialtyName(doctor)

  const handleClick = () => router.push(`/doctors/${doctor.id}`)

  if (variant === 'horizontal') {
    return (
      <button
        onClick={handleClick}
        className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm border border-gray-50 w-full text-left hover:shadow-md transition-shadow active:scale-[0.99]"
        aria-label={`View ${name}'s profile`}
      >
        {/* Avatar */}
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-primary-100 flex-shrink-0">
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-cura-text truncate">{name}</p>
          <p className="text-xs text-primary-500 font-medium truncate">{specialty}</p>
          <div className="flex items-center gap-2 mt-1">
            <StarRating value={doctor.rating_avg} size="sm" showValue />
            <span className="text-xs text-cura-muted">({doctor.review_count})</span>
          </div>
        </div>

        {/* Fee */}
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-cura-text">${doctor.consultation_fee}</p>
          <p className="text-[10px] text-cura-muted">per visit</p>
          <div className="flex gap-1 mt-1 justify-end">
            {doctor.is_in_person_available && <Building2 size={12} className="text-primary-500" />}
            {doctor.is_online_available && <Video size={12} className="text-primary-500" />}
          </div>
        </div>
      </button>
    )
  }

  // Vertical (card for carousel)
  return (
    <button
      onClick={handleClick}
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 w-44 flex-shrink-0 text-left hover:shadow-md transition-shadow active:scale-[0.99]"
      aria-label={`View ${name}'s profile`}
    >
      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary-100 mx-auto mb-3">
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      </div>
      <p className="font-semibold text-xs text-cura-text text-center truncate">{name}</p>
      <p className="text-[11px] text-primary-500 font-medium text-center truncate mt-0.5">{specialty}</p>
      <div className="flex justify-center mt-1.5">
        <StarRating value={doctor.rating_avg} size="sm" showValue={false} />
      </div>
      <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
        <span className="text-xs font-bold text-cura-text">${doctor.consultation_fee}</span>
        <div className="flex gap-1">
          {doctor.is_in_person_available && <Building2 size={11} className="text-primary-400" />}
          {doctor.is_online_available && <Video size={11} className="text-primary-400" />}
        </div>
      </div>
    </button>
  )
}
