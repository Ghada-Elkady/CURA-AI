'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { authApi } from '@/lib/api/auth'
import { usersApi } from '@/lib/api/users'
import { useAuthStore } from '@/lib/stores/authStore'
import { showToast } from '@/components/ui/ToastProvider'

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirmPassword: z.string(),
  terms: z.boolean().refine((v) => v, 'You must accept the terms'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})
type FormData = z.infer<typeof schema>

export default function SignupPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const password = watch('password', '')
  const strength = [/[A-Z]/, /[a-z]/, /[0-9]/, /.{8}/].filter((r) => r.test(password)).length

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const tokens = await authApi.register({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        phone: data.phone,
      })
      localStorage.setItem('access_token', tokens.access_token)
      const user = await usersApi.getMe()
      login(user, tokens.access_token, tokens.refresh_token)
      showToast('Account created successfully!', 'success')
      router.replace('/home')
    } catch (err: any) {
      showToast(err?.response?.data?.detail ?? 'Registration failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col flex-1 px-6 py-8">
      <button onClick={() => router.back()} className="mb-6 p-2 -ml-2 w-fit">
        <ArrowLeft size={22} className="text-cura-text" />
      </button>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-bold text-cura-text">Create Account ✨</h1>
        <p className="text-cura-muted text-sm mt-1">Join CURA and book your first appointment</p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {/* Full Name */}
        <div>
          <label className="text-sm font-medium text-cura-text mb-1.5 block">Full Name</label>
          <div className="relative">
            <User size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-cura-muted" />
            <input {...register('full_name')} placeholder="John Doe" className="input-field pl-11" />
          </div>
          {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium text-cura-text mb-1.5 block">Email</label>
          <div className="relative">
            <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-cura-muted" />
            <input {...register('email')} type="email" placeholder="you@example.com" className="input-field pl-11" />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="text-sm font-medium text-cura-text mb-1.5 block">Phone (optional)</label>
          <div className="relative">
            <Phone size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-cura-muted" />
            <input {...register('phone')} type="tel" placeholder="+1 555 000 0000" className="input-field pl-11" />
          </div>
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
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-cura-muted">
              {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {/* Strength bar */}
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${strength >= i ? ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500'][i - 1] : 'bg-gray-200'}`} />
            ))}
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="text-sm font-medium text-cura-text mb-1.5 block">Confirm Password</label>
          <div className="relative">
            <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-cura-muted" />
            <input {...register('confirmPassword')} type="password" placeholder="••••••••" className="input-field pl-11" />
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        {/* Terms */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input {...register('terms')} type="checkbox" className="mt-0.5 rounded accent-primary-500" />
          <span className="text-xs text-cura-muted leading-relaxed">
            I agree to the{' '}
            <span className="text-primary-500 font-medium">Terms of Service</span> and{' '}
            <span className="text-primary-500 font-medium">Privacy Policy</span>
          </span>
        </label>
        {errors.terms && <p className="text-red-500 text-xs -mt-2">{errors.terms.message}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base mt-2">
          {loading ? 'Creating Account…' : 'Create Account'}
        </button>
      </form>

      <p className="text-center text-sm text-cura-muted mt-6">
        Already have an account?{' '}
        <button onClick={() => router.push('/login')} className="text-primary-500 font-semibold">
          Sign In
        </button>
      </p>
    </div>
  )
}
