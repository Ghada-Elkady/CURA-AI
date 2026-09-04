'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import './globals.css'
import { ToastProvider } from '@/components/ui/ToastProvider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  )

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0ABDE3" />
        <title>CURA - Your Health, Our Priority</title>
        <meta name="description" content="Book doctor appointments easily with CURA" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-cura-bg font-sans antialiased">
        <QueryClientProvider client={queryClient}>
          <div className="relative min-h-screen max-w-[430px] mx-auto bg-white shadow-sm overflow-hidden">
            {children}
          </div>
          <ToastProvider />
        </QueryClientProvider>
      </body>
    </html>
  )
}
