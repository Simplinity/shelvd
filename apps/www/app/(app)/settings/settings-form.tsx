'use client'

import { useState } from 'react'
import { User, Lock, Globe, MapPin, CreditCard, Trash2, Check } from 'lucide-react'
import {
  updateProfile,
  updatePassword,
  updatePreferences,
  updateAddress,
  deleteAccount,
} from '@/lib/actions/settings'
import type { SettingsResult } from '@/lib/actions/settings'

interface Props {
  email: string
  lastSignIn: string | null
  profile: any
}

const CURRENCIES = [
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'CHF', label: 'CHF' },
  { value: 'SEK', label: 'SEK (kr)' },
  { value: 'NOK', label: 'NOK (kr)' },
  { value: 'DKK', label: 'DKK (kr)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'CAD', label: 'CAD ($)' },
  { value: 'AUD', label: 'AUD ($)' },
]

export function SettingsForm({ email, lastSignIn, profile }: Props) {
  return (
    <div className="space-y-8">
      <ProfileSection profile={profile} email={email} />
      <SecuritySection lastSignIn={lastSignIn} />
      <PreferencesSection profile={profile} />
      <AddressSection profile={profile} />
      <SubscriptionSection profile={profile} />
      <DangerSection />
    </div>
  )
}

// --- Reusable feedback ---
function Feedback({ result }: { result: SettingsResult | null }) {
  if (!result) return null
  if (result.error) return <p className="text-sm text-red-600 mt-2">{result.error}</p>
  if (result.success) return <p className="text-sm text-green-600 mt-2 flex items-center gap-1"><Check className="w-3 h-3" /> {result.message}</p>
  return null
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b">
      {icon}
      <h2 className="text-sm font-bold uppercase tracking-wider">{title}</h2>
    </div>
  )
}

function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="px-4 py-2 bg-foreground text-background text-sm font-medium disabled:opacity-50"
    >
      {loading ? 'Saving...' : label}
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputClass = "w-full px-3 py-2 border text-sm bg-background"
const selectClass = "w-full px-3 py-2 border text-sm bg-background"

// --- 1. PROFILE ---
function ProfileSection({ profile, email }: { profile: any; email: string }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SettingsResult | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setResult(null)
    const res = await updateProfile(formData)
    setResult(res)
    setLoading(false)
  }

  return (
    <section>
      <SectionHeader icon={<User className="w-4 h-4" />} title="Profile" />
      <form action={handleSubmit} className="space-y-4">
        <Field label="Email">
          <input type="text" value={email} disabled className={`${inputClass} bg-muted text-muted-foreground`} />
        </Field>
        <Field label="Display Name">
          <input type="text" name="display_name" defaultValue={profile?.display_name || ''} className={inputClass} />
        </Field>
        <Field label="Full Name">
          <input type="text" name="full_name" defaultValue={profile?.full_name || ''} className={inputClass} placeholder="For invoices and correspondence" />
        </Field>
        <div className="flex items-center gap-3">
          <SubmitButton loading={loading} label="Save Profile" />
          <Feedback result={result} />
        </div>
      </form>
    </section>
  )
}

// --- 2. SECURITY ---
function SecuritySection({ lastSignIn }: { lastSignIn: string | null }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SettingsResult | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setResult(null)
    const res = await updatePassword(formData)
    setResult(res)
    setLoading(false)
    if (res.success) {
      // Clear form
      const form = document.querySelector('#password-form') as HTMLFormElement
      form?.reset()
    }
  }

  return (
    <section>
      <SectionHeader icon={<Lock className="w-4 h-4" />} title="Security" />
      {lastSignIn && (
        <p className="text-xs text-muted-foreground mb-4">
          Last sign in: {new Date(lastSignIn).toLocaleString()}
        </p>
      )}
      <form id="password-form" action={handleSubmit} className="space-y-4">
        <Field label="New Password">
          <input type="password" name="password" className={inputClass} placeholder="Minimum 8 characters" autoComplete="new-password" />
        </Field>
        <Field label="Confirm Password">
          <input type="password" name="confirm_password" className={inputClass} placeholder="Repeat password" autoComplete="new-password" />
        </Field>
        <div className="flex items-center gap-3">
          <SubmitButton loading={loading} label="Update Password" />
          <Feedback result={result} />
        </div>
      </form>
    </section>
  )
}

// --- 3. PREFERENCES ---
function PreferencesSection({ profile }: { profile: any }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SettingsResult | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setResult(null)
    const res = await updatePreferences(formData)
    setResult(res)
    setLoading(false)
  }

  return (
    <section>
      <SectionHeader icon={<Globe className="w-4 h-4" />} title="Preferences" />
      <form action={handleSubmit} className="space-y-4">
        <Field label="Default Currency">
          <select name="default_currency" defaultValue={profile?.default_currency || 'EUR'} className={selectClass}>
            {CURRENCIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </Field>
        <div className="flex items-center gap-3">
          <SubmitButton loading={loading} label="Save Preferences" />
          <Feedback result={result} />
        </div>
      </form>
    </section>
  )
}

// --- 4. ADDRESS ---
function AddressSection({ profile }: { profile: any }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SettingsResult | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setLoading(true)
    setResult(null)
    const res = await updateAddress(formData)
    setResult(res)
    setLoading(false)
  }

  return (
    <section>
      <SectionHeader icon={<MapPin className="w-4 h-4" />} title="Address" />
      <form action={handleSubmit} className="space-y-4">
        <Field label="Street &amp; Number">
          <input type="text" name="street_address" defaultValue={profile?.street_address || ''} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Postal Code">
            <input type="text" name="postal_code" defaultValue={profile?.postal_code || ''} className={inputClass} />
          </Field>
          <Field label="City">
            <input type="text" name="city" defaultValue={profile?.city || ''} className={inputClass} />
          </Field>
        </div>
        <Field label="Country">
          <input type="text" name="country" defaultValue={profile?.country || ''} className={inputClass} />
        </Field>
        <Field label="VAT Number">
          <input type="text" name="vat_number" defaultValue={profile?.vat_number || ''} className={inputClass} placeholder="Optional, for EU businesses" />
        </Field>
        <div className="flex items-center gap-3">
          <SubmitButton loading={loading} label="Save Address" />
          <Feedback result={result} />
        </div>
      </form>
    </section>
  )
}

// --- 5. SUBSCRIPTION ---
function SubscriptionSection({ profile }: { profile: any }) {
  const tier = profile?.membership_tier || 'free'
  const isLifetime = profile?.is_lifetime_free

  return (
    <section>
      <SectionHeader icon={<CreditCard className="w-4 h-4" />} title="Subscription" />
      <div className="flex items-center gap-3">
        <span className="px-3 py-1 bg-foreground text-background text-sm font-medium capitalize">
          {tier}
        </span>
        {isLifetime && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium">
            Lifetime Free
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground mt-3">
        Subscription management coming soon.
      </p>
    </section>
  )
}

// --- 6. DANGER ZONE ---
function DangerSection() {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    const first = prompt('This will permanently delete your account and ALL your books. Type "DELETE" to confirm:')
    if (first !== 'DELETE') return

    const second = confirm('Are you absolutely sure? This cannot be undone.')
    if (!second) return

    setLoading(true)
    const res = await deleteAccount()
    if (res.error) {
      alert('Error: ' + res.error)
      setLoading(false)
    } else {
      window.location.href = '/login'
    }
  }

  return (
    <section>
      <SectionHeader icon={<Trash2 className="w-4 h-4 text-red-600" />} title="Danger Zone" />
      <div className="border border-red-200 p-4">
        <p className="text-sm mb-3">
          Permanently delete your account and all data. This action cannot be undone.
        </p>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Deleting...' : 'Delete My Account'}
        </button>
      </div>
    </section>
  )
}
