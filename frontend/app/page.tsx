'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuthStore } from '@/lib/stores/authStore'

export default function SplashPage() {
  const router = useRouter()
  const { accessToken, initialize } = useAuthStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initialize()
    const timer = setTimeout(() => {
      setReady(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [initialize])

  useEffect(() => {
    if (ready) {
      if (accessToken) {
        router.replace('/home')
      } else {
        router.replace('/login')
      }
    }
  }, [ready, accessToken, router])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center gap-4"
      >
        {/* Logo Icon */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500 to-navy-900 flex items-center justify-center shadow-lg"
        >
          <span className="text-white text-4xl font-bold">C</span>
        </motion.div>

        {/* CURA text */}
        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-5xl font-bold gradient-text tracking-wider"
        >
          CURA
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="text-cura-muted text-base font-medium tracking-wide"
        >
          Your Health, Our Priority
        </motion.p>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex gap-2 mt-8"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-primary-500 loading-dot" />
          <span className="w-2.5 h-2.5 rounded-full bg-primary-500 loading-dot" />
          <span className="w-2.5 h-2.5 rounded-full bg-primary-500 loading-dot" />
        </motion.div>
      </motion.div>

      {/* Bottom tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="absolute bottom-10 text-xs text-cura-muted"
      >
        © 2024 CURA Health Technologies
      </motion.p>
    </div>
  )
}
