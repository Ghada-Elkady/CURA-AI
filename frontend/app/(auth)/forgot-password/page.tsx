'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { authApi } from '@/lib/api/auth'
import { showToast } from '@/components/ui/ToastProvider'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleStep1 = async () => {
    if (!email) return
    setLoading(true)
    try {
      await authApi.forgotPassword(email)
      showToast('Reset link sent! Check your email.', 'success')
      setStep(2)
    } catch {
      showToast('Email not found', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleStep2 = () => {
    if (otp.length !== 6) { showToast('Enter the 6-digit code', 'error'); return }
    setStep(3)
  }

  const handleStep3 = async () => {
    if (newPassword.length < 8) { showToast('Password must be at least 8 characters', 'error'); return }
    setLoading(true)
    try {
      await authApi.resetPassword(email, newPassword)
      showToast('Password reset successfully!', 'success')
      router.push('/login')
    } catch {
      showToast('Failed to reset password', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 px-6 py-8">
      <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="mb-6 p-2 -ml-2 w-fit">
        <ArrowLeft size={22} className="text-cura-text" />
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-cura-text">Reset Password 🔑</h1>
        <p className="text-cura-muted text-sm mt-1">
          {step === 1 && "Enter your email to receive a reset link"}
          {step === 2 && "Enter the 6-digit code sent to your email"}
          {step === 3 && "Set your new password"}
        </p>
        {/* Step indicator */}
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary-500' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-cura-text mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-cura-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field pl-11"
                />
              </div>
            </div>
            <button onClick={handleStep1} disabled={loading || !email} className="btn-primary w-full py-4 text-base">
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-cura-text mb-1.5 block">6-Digit Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="input-field text-center text-2xl tracking-widest font-bold"
                maxLength={6}
              />
              <p className="text-xs text-cura-muted mt-2 text-center">Enter any 6 digits (demo mode)</p>
            </div>
            <button onClick={handleStep2} disabled={otp.length !== 6} className="btn-primary w-full py-4 text-base">
              Verify Code
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-cura-text mb-1.5 block">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
              />
            </div>
            <button onClick={handleStep3} disabled={loading || newPassword.length < 8} className="btn-primary w-full py-4 text-base">
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
