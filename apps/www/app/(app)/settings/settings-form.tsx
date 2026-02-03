'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import {
  updateProfile,
  updatePassword,
  updatePreferences,
  updateAddress,
  deleteAccount,
} from '@/lib/actions/settings'
import type { SettingsResult } from '@/lib/actions/settings'

interface Props {
  tab: string
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

const inputClass = "w-full h-10 px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
const labelClass = "block text-xs uppercase tracking-wide text-muted-foreground mb-1"

export function SettingsForm({ tab, email, lastSignIn, profile }: Props) {
  if (tab === 'configuration') {
    return (
      <div className="space-y-10">
        <CurrencySection profile={profile} />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <ProfileSection profile={profile} email={email} />
      <SecuritySection lastSignIn={lastSignIn} />
      <AddressSection profile={profile} />
      <SubscriptionSection profile={profile} />
      <DangerSection />
    </div>
  )
}

// --- Feedback ---
function Feedback({ result }: { result: SettingsResult | null }) {
  if (!result) return null
  if (result.error) return <p className="text-sm text-red-600">{result.error}</p>
  if (result.success) return <p className="text-sm text-green-600 flex items-center gap-1"><Check className="w-3 h-3" />{result.message}</p>
  return null
}

function SaveButton({ loading, label = 'Save' }: { loading: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="h-10 px-6 bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {loading ? 'Saving...' : label}
    </button>
  )
}

// ============================================
// ACCOUNT TAB
// ============================================

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
      <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Profile</h2>
      <form action={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Email</label>
            <input type="text" value={email} disabled className={`${inputClass} bg-muted text-muted-foreground cursor-not-allowed`} />
          </div>
          <div>
            <label className={labelClass}>Display Name</label>
            <input type="text" name="display_name" defaultValue={profile?.display_name || ''} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Full Name</label>
            <input type="text" name="full_name" defaultValue={profile?.full_name || ''} className={inputClass} placeholder="For invoices and correspondence" />
          </div>
        </div>
        <div className="flex items-center gap-4 mt-6">
          <SaveButton loading={loading} />
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
      const form = document.querySelector('#password-form') as HTMLFormElement
      form?.reset()
    }
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Security</h2>
      {lastSignIn && (
        <p className="text-xs text-muted-foreground mb-4">
          Last sign in: {new Date(lastSignIn).toLocaleString()}
        </p>
      )}
      <form id="password-form" action={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>New Password</label>
            <input type="password" name="password" className={inputClass} placeholder="Minimum 8 characters" autoComplete="new-password" />
          </div>
          <div>
            <label className={labelClass}>Confirm Password</label>
            <input type="password" name="confirm_password" className={inputClass} placeholder="Repeat password" autoComplete="new-password" />
          </div>
        </div>
        <div className="flex items-center gap-4 mt-6">
          <SaveButton loading={loading} label="Update Password" />
          <Feedback result={result} />
        </div>
      </form>
    </section>
  )
}

// --- 3. ADDRESS ---
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
      <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Address</h2>
      <form action={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Street &amp; Number</label>
            <input type="text" name="street_address" defaultValue={profile?.street_address || ''} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Postal Code</label>
            <input type="text" name="postal_code" defaultValue={profile?.postal_code || ''} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>City</label>
            <input type="text" name="city" defaultValue={profile?.city || ''} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Country</label>
            <input type="text" name="country" defaultValue={profile?.country || ''} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>VAT Number</label>
            <input type="text" name="vat_number" defaultValue={profile?.vat_number || ''} className={inputClass} placeholder="Optional, for EU businesses" />
          </div>
        </div>
        <div className="flex items-center gap-4 mt-6">
          <SaveButton loading={loading} />
          <Feedback result={result} />
        </div>
      </form>
    </section>
  )
}

// --- 4. SUBSCRIPTION ---
function SubscriptionSection({ profile }: { profile: any }) {
  const tier = profile?.membership_tier || 'free'
  const isLifetime = profile?.is_lifetime_free

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Subscription</h2>
      <div className="flex items-center gap-3">
        <span className="h-10 px-4 bg-foreground text-background text-sm font-medium inline-flex items-center capitalize">
          {tier}
        </span>
        {isLifetime && (
          <span className="h-10 px-3 bg-green-50 text-green-700 text-sm font-medium border border-green-200 inline-flex items-center">
            Lifetime Free
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-4">
        Subscription management coming soon.
      </p>
    </section>
  )
}

// --- 5. DANGER ZONE ---
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
      <h2 className="text-lg font-semibold mb-4 pb-2 border-b text-red-600">Danger Zone</h2>
      <div className="border border-red-200 p-6">
        <p className="text-sm text-muted-foreground mb-4">
          Permanently delete your account and all associated data including your entire book collection. This action cannot be undone.
        </p>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="h-10 px-6 bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? 'Deleting...' : 'Delete My Account'}
        </button>
      </div>
    </section>
  )
}

// ============================================
// CONFIGURATION TAB
// ============================================

function CurrencySection({ profile }: { profile: any }) {
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
      <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Currency</h2>
      <form action={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Default Currency</label>
            <select name="default_currency" defaultValue={profile?.default_currency || 'EUR'} className={inputClass}>
              {CURRENCIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Used as default when adding book values and for statistics.
        </p>
        <div className="flex items-center gap-4 mt-6">
          <SaveButton loading={loading} />
          <Feedback result={result} />
        </div>
      </form>
    </section>
  )
}
