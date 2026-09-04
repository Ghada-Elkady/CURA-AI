'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  User, Phone, Mail, Shield, Bell, HelpCircle,
  ChevronRight, LogOut, Edit2, CheckCircle, X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '@/lib/stores/authStore'
import { usersApi } from '@/lib/api/users'
import { authApi } from '@/lib/api/auth'
import { showToast } from '@/components/ui/ToastProvider'
import type { User as UserType } from '@/lib/types'

function MenuItem({
  icon: Icon,
  label,
  sublabel,
  onClick,
  danger = false,
}: {
  icon: React.ElementType
  label: string
  sublabel?: string
  onClick?: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 w-full px-4 py-3.5 bg-white hover:bg-gray-50 transition-colors active:bg-gray-100 ${danger ? 'text-red-500' : 'text-cura-text'}`}
    >
      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-50' : 'bg-primary-50'}`}>
        <Icon size={18} className={danger ? 'text-red-500' : 'text-primary-500'} />
      </div>
      <div className="flex-1 text-left">
        <p className={`text-sm font-medium ${danger ? 'text-red-500' : 'text-cura-text'}`}>{label}</p>
        {sublabel && <p className="text-xs text-cura-muted mt-0.5">{sublabel}</p>}
      </div>
      {!danger && <ChevronRight size={16} className="text-gray-300" />}
    </button>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, setUser, logout } = useAuthStore()
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState(user?.full_name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await usersApi.updateMe({ full_name: fullName, phone })
      setUser(updated)
      setEditing(false)
      showToast('Profile updated!', 'success')
    } catch {
      showToast('Failed to update profile', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch { /* ignore */ }
    logout()
    router.replace('/login')
  }

  const avatarUrl = user?.avatar_url
    ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-gradient-to-b from-primary-500 to-primary-600 pt-14 pb-8 px-5 flex flex-col items-center text-white relative">
        {/* Edit button */}
        <button
          onClick={() => setEditing(!editing)}
          className="absolute top-12 right-5 p-2 bg-white/20 rounded-xl backdrop-blur-sm"
          aria-label={editing ? 'Cancel editing' : 'Edit profile'}
        >
          {editing ? <X size={18} /> : <Edit2 size={18} />}
        </button>

        {/* Avatar */}
        <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white shadow-xl mb-4">
          <img src={avatarUrl} alt={user?.full_name} className="w-full h-full object-cover" />
        </div>

        {/* Name / role */}
        {editing ? (
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="text-center bg-white/20 text-white placeholder:text-white/60 border border-white/30 rounded-xl px-3 py-1.5 text-base font-bold w-full max-w-xs mb-1"
            placeholder="Full name"
          />
        ) : (
          <h1 className="text-xl font-bold">{user?.full_name}</h1>
        )}
        <span className="text-primary-100 text-xs font-medium capitalize mt-1 bg-white/10 px-3 py-1 rounded-full">
          {user?.role}
        </span>
      </div>

      {/* Edit phone (when editing) */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-white border-b border-gray-100 px-5 py-4"
          >
            <label className="text-xs font-medium text-cura-muted block mb-1.5">Phone Number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field text-sm"
              placeholder="+1 555 000 0000"
              type="tel"
            />
            <div className="flex gap-3 mt-3">
              <button onClick={() => setEditing(false)} className="btn-secondary flex-1 py-2.5 text-sm">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-2.5 text-sm">
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info chips */}
      <div className="px-4 py-4 grid grid-cols-2 gap-3">
        {[
          { icon: Mail, label: 'Email', value: user?.email ?? '-' },
          { icon: Phone, label: 'Phone', value: user?.phone ?? 'Not set' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-50">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={13} className="text-primary-400" />
              <span className="text-[10px] text-cura-muted font-medium uppercase tracking-wide">{label}</span>
            </div>
            <p className="text-xs font-semibold text-cura-text truncate">{value}</p>
          </div>
        ))}
      </div>

      {/* Menu groups */}
      <div className="px-4 flex flex-col gap-3 pb-8">
        {/* Account */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-50 divide-y divide-gray-50">
          <p className="text-[10px] font-semibold text-cura-muted uppercase tracking-widest px-4 pt-3 pb-1">Account</p>
          <MenuItem icon={User} label="Personal Info" sublabel="Update your profile" onClick={() => setEditing(true)} />
          <MenuItem icon={Shield} label="Privacy & Security" sublabel="Password, security settings" onClick={() => showToast('Coming soon!', 'info')} />
          <MenuItem icon={Bell} label="Notifications" sublabel="Manage notification preferences" onClick={() => showToast('Coming soon!', 'info')} />
        </div>

        {/* Support */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-50 divide-y divide-gray-50">
          <p className="text-[10px] font-semibold text-cura-muted uppercase tracking-widest px-4 pt-3 pb-1">Support</p>
          <MenuItem icon={HelpCircle} label="Help & Support" sublabel="FAQs, contact us" onClick={() => showToast('Coming soon!', 'info')} />
          <MenuItem icon={CheckCircle} label="Rate CURA" sublabel="Leave us a review" onClick={() => showToast('Thank you! ❤️', 'success')} />
        </div>

        {/* Logout */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-50">
          <MenuItem icon={LogOut} label="Sign Out" danger onClick={handleLogout} />
        </div>

        <p className="text-center text-[10px] text-cura-muted mt-2">CURA v1.0.0 · © 2024 CURA Health Technologies</p>
      </div>
    </div>
  )
}
