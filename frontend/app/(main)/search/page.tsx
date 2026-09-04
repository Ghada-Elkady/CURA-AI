'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { doctorsApi } from '@/lib/api/doctors'
import { DoctorCard } from '@/components/doctors/DoctorCard'
import type { Doctor, Specialty } from '@/lib/types'

function SearchContent() {
  const router = useRouter()
  const params = useSearchParams()
  const [query, setQuery] = useState('')
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)
  const [minRating, setMinRating] = useState(0)
  const [gender, setGender] = useState<string>('')
  const [sortBy, setSortBy] = useState('rating')

  useEffect(() => {
    doctorsApi.getSpecialties().then(setSpecialties)
    const initialQuery = params.get('q') || ''
    if (initialQuery) setQuery(initialQuery)
  }, [params])

  const doSearch = useCallback(async () => {
    setLoading(true)
    try {
      const results = await doctorsApi.list({
        search: query || undefined,
        specialty_id: selectedSpecialty ?? undefined,
        min_rating: minRating > 0 ? minRating : undefined,
        gender: gender || undefined,
        sort_by: sortBy,
        limit: 30,
      })
      setDoctors(results)
    } finally {
      setLoading(false)
    }
  }, [query, selectedSpecialty, minRating, gender, sortBy])

  useEffect(() => { doSearch() }, [doSearch])

  return (
    <div className="flex flex-col min-h-screen bg-cura-bg">
      {/* Search bar header */}
      <div className="bg-white px-4 pt-12 pb-4 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-cura-muted" aria-label="Back">
            <X size={20} />
          </button>
          <div className="flex-1 relative">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-cura-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search doctors, specialties..."
              className="input-field pl-9 py-2.5 text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl transition-colors ${showFilters ? 'bg-primary-500 text-white' : 'bg-gray-100 text-cura-muted'}`}
            aria-label="Filters"
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-4 flex flex-col gap-3 pb-2">
            {/* Specialties */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {specialties.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSpecialty(selectedSpecialty === s.id ? null : s.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedSpecialty === s.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-cura-muted'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
            {/* Rating & Gender */}
            <div className="flex gap-2">
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="flex-1 text-xs py-2 px-3 rounded-xl border border-gray-200 bg-white text-cura-text"
              >
                <option value={0}>Any Rating</option>
                <option value={4}>4+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
              </select>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="flex-1 text-xs py-2 px-3 rounded-xl border border-gray-200 bg-white text-cura-text"
              >
                <option value="">Any Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 text-xs py-2 px-3 rounded-xl border border-gray-200 bg-white text-cura-text"
              >
                <option value="rating">By Rating</option>
                <option value="experience">By Experience</option>
                <option value="fee">By Fee</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 px-4 py-4">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-24 rounded-2xl" />
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">🔍</span>
            <p className="text-cura-text font-semibold">No doctors found</p>
            <p className="text-cura-muted text-sm mt-1">Try different filters or search terms</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-cura-muted">{doctors.length} doctors found</p>
            {doctors.map((d) => <DoctorCard key={d.id} doctor={d} variant="horizontal" />)}
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-4"><div className="skeleton h-24 rounded-2xl" /></div>}>
      <SearchContent />
    </Suspense>
  )
}

