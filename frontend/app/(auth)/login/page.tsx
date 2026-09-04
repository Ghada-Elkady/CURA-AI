'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { authApi } from '@/lib/api/auth'
import { usersApi } from '@/lib/api/users'
import { useAuthStore } from '@/lib/stores/authStore'
import { showToast } from '@/components/ui/ToastProvider'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const tokens = await authApi.login(data.email, data.password)
      // Fetch user profile
      localStorage.setItem('access_token', tokens.access_token)
      const user = await usersApi.getMe()
      login(user, tokens.access_token, tokens.refresh_token)
      showToast('Welcome back!', 'success')
      router.replace('/home')
    } catch (err: any) {
      showToast(err?.response?.data?.detail ?? 'Invalid email or password', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 px-6 py-10">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-navy-900 flex items-center justify-center shadow-lg mb-4">
          <span className="text-white text-2xl font-bold">C</span>
        </div>
        <h1 className="text-2xl font-bold text-cura-text">Welcome Back 👋</h1>
        <p className="text-cura-muted text-sm mt-1">Sign in to continue to CURA</p>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        {/* Email */}
        <div>
          <label className="text-sm font-medium text-cura-text mb-1.5 block">Email Address</label>
          <div className="relative">
            <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-cura-muted" />
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className="input-field pl-11"
              autoComplete="email"
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="text-sm font-medium text-cura-text mb-1.5 block">Password</label>
          <div className="relative">
            <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-cura-muted" />
            <input
              {...register('password')}
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              className="input-field pl-11 pr-11"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-cura-muted"
              aria-label={showPass ? 'Hide password' : 'Show password'}
            >
              {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        {/* Forgot password */}
        <div className="text-right">
          <button
            type="button"
            onClick={() => router.push('/forgot-password')}
            className="text-primary-500 text-sm font-medium"
          >
            Forgot Password?
          </button>
        </div>

        {/* Sign In */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-4 text-base mt-2"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        {/* Social login divider */}
        <div className="flex items-center gap-3 my-1">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-cura-muted">or continue with</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Social buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => showToast('Google login coming soon!', 'info')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-medium text-cura-text hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg">G</span> Google
          </button>
          <button
            type="button"
            onClick={() => showToast('Apple login coming soon!', 'info')}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-medium text-cura-text hover:bg-gray-50 transition-colors"
          >
            <span className="text-lg">🍎</span> Apple
          </button>
        </div>
      </motion.form>

      {/* Sign up link */}
      <p className="text-center text-sm text-cura-muted mt-8">
        Don&apos;t have an account?{' '}
        <button
          onClick={() => router.push('/signup')}
          className="text-primary-500 font-semibold"
        >
          Sign Up
        </button>
      </p>
    </div>
  )
}
