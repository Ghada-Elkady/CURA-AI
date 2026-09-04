'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import type { ReactNode } from 'react'

interface TopBarProps {
  title?: string
  showBack?: boolean
  rightAction?: ReactNode
  onBack?: () => void
  transparent?: boolean
}

export function TopBar({ title, showBack = true, rightAction, onBack, transparent = false }: TopBarProps) {
  const router = useRouter()

  return (
    <header
      className={`flex items-center justify-between px-4 py-3 ${
        transparent ? 'absolute top-0 left-0 right-0 z-10' : 'bg-white border-b border-gray-50'
      }`}
    >
      <div className="w-10">
        {showBack && (
          <button
            onClick={onBack ?? (() => router.back())}
            className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft
              size={20}
              className={transparent ? 'text-white' : 'text-cura-text'}
            />
          </button>
        )}
      </div>
      {title && (
        <h1
          className={`text-base font-semibold ${transparent ? 'text-white' : 'text-cura-text'}`}
        >
          {title}
        </h1>
      )}
      <div className="w-10 flex justify-end">{rightAction}</div>
    </header>
  )
}
