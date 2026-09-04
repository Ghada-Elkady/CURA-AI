'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell } from 'lucide-react'
import { doctorsApi } from '@/lib/api/doctors'
import { useAuthStore } from '@/lib/stores/authStore'
import { DoctorCard } from '@/components/doctors/DoctorCard'
import { SpecialtyChip } from '@/components/doctors/SpecialtyChip'
import type { Doctor, Specialty } from '@/lib/types'

function LoadingSkeleton() {
  return (
    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="w-44 flex-shrink-0 bg-white rounded-2xl p-4 shadow-sm">
          <div className="skeleton w-16 h-16 rounded-2xl mx-auto mb-3" />
          <div className="skeleton h-3 rounded w-3/4 mx-auto mb-2" />
          <div className="skeleton h-2 rounded w-1/2 mx-auto" />
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [featuredDoctors, setFeaturedDoctors] = useState<Doctor[]>([])
  const [nearbyDoctors, setNearbyDoctors] = useState<Doctor[]>([])
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  useEffect(() => {
    async function load() {
      try {
        const [specs, featured, nearby] = await Promise.all([
          doctorsApi.getSpecialties(),
          doctorsApi.list({ sort_by: 'rating', limit: 8 }),
          doctorsApi.list({ limit: 10 }),
        ])
        setSpecialties(specs)
        setFeaturedDoctors(featured)
        setNearbyDoctors(nearby)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSpecialtyFilter = async (specId: string) => {
    const newId = selectedSpecialty === specId ? null : specId
    setSelectedSpecialty(newId)
    const docs = await doctorsApi.list({ specialty_id: newId ?? undefined, limit: 10 })
    setNearbyDoctors(docs)
  }

  const firstName = user?.full_name?.split(' ')[0] ?? 'there'

  return (
    <div className="flex flex-col gap-6 page-wrapper">
      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-sm text-cura-muted">{greeting()},</p>
            <h1 className="text-xl font-bold text-cura-text">{firstName} 👋</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2.5 bg-primary-50 rounded-2xl" aria-label="Notifications">
              <Bell size={20} className="text-primary-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-primary-100 overflow-hidden">
              <img
                src={user?.avatar_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                alt={user?.full_name ?? 'Profile'}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Search bar */}
        <button
          onClick={() => router.push('/search')}
          className="flex items-center gap-3 w-full bg-gray-50 rounded-2xl px-4 py-3.5 border border-gray-100 text-left"
          aria-label="Search for doctors"
        >
          <Search size={18} className="text-cura-muted flex-shrink-0" />
          <span className="text-cura-muted text-sm">Search doctors, specialties...</span>
        </button>
      </div>

      {/* Specialties */}
      <section className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">Categories</h2>
          <button onClick={() => router.push('/search')} className="text-primary-500 text-sm font-medium">
            See All
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {loading
            ? [...Array(5)].map((_, i) => <div key={i} className="skeleton w-[72px] h-20 rounded-2xl flex-shrink-0" />)
            : specialties.map((s) => (
                <SpecialtyChip
                  key={s.id}
                  specialty={s}
                  selected={selectedSpecialty === s.id}
                  onClick={() => handleSpecialtyFilter(s.id)}
                />
              ))}
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">Top Doctors</h2>
          <button onClick={() => router.push('/search?sort=rating')} className="text-primary-500 text-sm font-medium">
            See All
          </button>
        </div>
        {loading ? <LoadingSkeleton /> : (
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
            {featuredDoctors.map((d) => <DoctorCard key={d.id} doctor={d} variant="vertical" />)}
          </div>
        )}
      </section>

      {/* Nearby / All Doctors */}
      <section className="px-5 pb-4">
        <h2 className="section-title mb-3">Doctors For You</h2>
        {loading
          ? [...Array(3)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl mb-3" />)
          : (
            <div className="flex flex-col gap-3">
              {nearbyDoctors.map((d) => <DoctorCard key={d.id} doctor={d} variant="horizontal" />)}
            </div>
          )}
      </section>
    </div>
  )
}
