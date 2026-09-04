import type { ReactNode } from 'react'
import { BottomNav } from '@/components/layout/BottomNav'

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-cura-bg">
      <main className="flex-1 bottom-nav-safe">{children}</main>
      <BottomNav />
    </div>
  )
}
