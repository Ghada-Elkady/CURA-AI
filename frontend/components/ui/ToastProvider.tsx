'use client'

import { useState, useCallback } from 'react'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

let toastListeners: ((toasts: Toast[]) => void)[] = []
let currentToasts: Toast[] = []

export function showToast(message: string, type: Toast['type'] = 'info') {
  const id = Math.random().toString(36).slice(2)
  currentToasts = [...currentToasts, { id, message, type }]
  toastListeners.forEach((fn) => fn(currentToasts))
  setTimeout(() => {
    currentToasts = currentToasts.filter((t) => t.id !== id)
    toastListeners.forEach((fn) => fn(currentToasts))
  }, 4000)
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const subscribe = useCallback((fn: (t: Toast[]) => void) => {
    toastListeners.push(fn)
    return () => { toastListeners = toastListeners.filter((l) => l !== fn) }
  }, [])

  useState(() => {
    const unsub = subscribe(setToasts)
    return unsub
  })

  const colorMap = {
    success: 'bg-emerald-500',
    error: 'bg-red-500',
    info: 'bg-primary-500',
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[90vw] max-w-[380px]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${colorMap[t.type]} text-white px-4 py-3 rounded-2xl shadow-lg text-sm font-medium animate-fade-in`}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
