'use client'

import { useRouter, usePathname } from 'next/navigation'
import { Home, Search, Calendar, User } from 'lucide-react'

const tabs = [
  { label: 'Home',         icon: Home,     href: '/home' },
  { label: 'Search',       icon: Search,   href: '/search' },
  { label: 'Appointments', icon: Calendar, href: '/appointments' },
  { label: 'Profile',      icon: User,     href: '/profile' },
]

export function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 z-40 shadow-lg">
      <div className="flex items-center justify-around py-2 pb-safe">
        {tabs.map(({ label, icon: Icon, href }) => {
          const isActive = pathname.startsWith(href)
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-all"
              aria-label={label}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-primary-50' : ''
                }`}
              >
                <Icon
                  size={22}
                  className={isActive ? 'text-primary-500' : 'text-gray-400'}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              </div>
              <span
                className={`text-[10px] font-medium leading-none ${
                  isActive ? 'text-primary-500' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
