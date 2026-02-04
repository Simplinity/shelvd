'use client'

import { useState } from 'react'
import { Check, X, ExternalLink, Plus } from 'lucide-react'
import {
  updateProfile,
  updatePassword,
  updatePreferences,
  updateAddress,
  deleteAccount,
} from '@/lib/actions/settings'
import type { SettingsResult } from '@/lib/actions/settings'
import { addCustomLinkType, deleteCustomLinkType } from '@/lib/actions/external-links'

interface LinkType {
  id: string
  slug: string
  label: string
  domain: string | null
  category: string
  sort_order: number
  is_system: boolean
  user_id: string | null
}

interface Props {
  tab: string
  email: string
  lastSignIn: string | null
  profile: any
  linkTypes: LinkType[]
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

export function SettingsForm({ tab, email, lastSignIn, profile, linkTypes }: Props) {
  if (tab === 'configuration') {
    return (
      <div className="space-y-10">
        <ConfigurationSection profile={profile} />
        <ExternalLinkTypesSection linkTypes={linkTypes} />
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

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/01/2026)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (01/31/2026)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2026-01-31)' },
  { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY (31.01.2026)' },
]

const LIST_VIEW_OPTIONS = [
  { value: '25', label: '25' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
  { value: '200', label: '200' },
  { value: '500', label: '500' },
]

const GRID_VIEW_OPTIONS = [
  { value: '12', label: '12' },
  { value: '25', label: '25' },
  { value: '50', label: '50' },
  { value: '100', label: '100' },
]

// ============================================
// EXTERNAL LINK TYPES
// ============================================

const CATEGORY_LABELS: Record<string, string> = {
  'bibliographic': 'Bibliographic & Authority',
  'short-title-catalog': 'Short Title Catalogs',
  'national-catalog': 'National & Regional Catalogs',
  'digital-library': 'Digital Libraries',
  'provenance': 'Provenance & Specialist',
  'marketplace': 'Antiquarian & Marketplaces',
  'auction': 'Auction Houses & Prices',
  'community': 'Community',
  'other': 'Other',
  'custom': 'Custom',
}

const CATEGORY_ORDER = [
  'bibliographic', 'short-title-catalog', 'national-catalog',
  'digital-library', 'provenance', 'marketplace', 'auction',
  'community', 'other', 'custom',
]

function FaviconImg({ domain }: { domain: string | null }) {
  if (!domain) return <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
      alt=""
      width={16}
      height={16}
      className="flex-shrink-0"
      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
    />
  )
}

type LinkTypeResult = { error?: string; success?: boolean; message?: string }

function ExternalLinkTypesSection({ linkTypes }: { linkTypes: LinkType[] }) {
  const [showAdd, setShowAdd] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [addResult, setAddResult] = useState<LinkTypeResult | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => {
    // Start all categories collapsed
    const init: Record<string, boolean> = {}
    CATEGORY_ORDER.forEach(c => { init[c] = true })
    return init
  })

  // Group by category
  const grouped = linkTypes.reduce<Record<string, LinkType[]>>((acc, lt) => {
    const cat = lt.is_system ? lt.category : 'custom'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(lt)
    return acc
  }, {})

  const customTypes = linkTypes.filter(lt => !lt.is_system)
  const systemCount = linkTypes.filter(lt => lt.is_system).length

  const handleAdd = async (formData: FormData) => {
    setAddLoading(true)
    setAddResult(null)
    const res = await addCustomLinkType(formData)
    setAddResult(res)
    setAddLoading(false)
    if (res.success) {
      setShowAdd(false)
      setAddResult(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this custom link type?')) return
    setDeletingId(id)
    await deleteCustomLinkType(id)
    setDeletingId(null)
  }

  const toggleCategory = (cat: string) => {
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }))
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-1 pb-2 border-b flex items-center gap-2">
        <ExternalLink className="w-5 h-5" />
        External Link Types
      </h2>
      <p className="text-xs text-muted-foreground mb-6">
        {systemCount} built-in types available. Add custom types for resources not in the default list.
      </p>

      {/* System types grouped by category */}
      <div className="space-y-2 mb-8">
        {CATEGORY_ORDER.filter(cat => cat !== 'custom' && grouped[cat]?.length).map(cat => (
          <div key={cat} className="border border-border">
            <button
              type="button"
              onClick={() => toggleCategory(cat)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm font-medium">
                {CATEGORY_LABELS[cat] || cat}
                <span className="text-xs text-muted-foreground ml-2">({grouped[cat].length})</span>
              </span>
              <span className="text-xs text-muted-foreground">
                {collapsed[cat] ? '▸' : '▾'}
              </span>
            </button>
            {!collapsed[cat] && (
              <div className="border-t border-border px-4 py-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                  {grouped[cat].map(lt => (
                    <div key={lt.id} className="flex items-center gap-2 py-1 text-sm text-muted-foreground">
                      <FaviconImg domain={lt.domain} />
                      <span className="truncate">{lt.label}</span>
                      {lt.domain && (
                        <span className="text-[10px] text-muted-foreground/60 hidden sm:inline">
                          {lt.domain}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Custom types */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3">Your Custom Types</h3>
        {customTypes.length === 0 ? (
          <p className="text-xs text-muted-foreground italic mb-4">No custom link types yet.</p>
        ) : (
          <div className="space-y-1 mb-4">
            {customTypes.map(lt => (
              <div key={lt.id} className="flex items-center gap-3 py-2 px-3 border border-border group">
                <FaviconImg domain={lt.domain} />
                <span className="text-sm flex-1 truncate">{lt.label}</span>
                {lt.domain && (
                  <span className="text-xs text-muted-foreground hidden sm:inline">{lt.domain}</span>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(lt.id)}
                  disabled={deletingId === lt.id}
                  className="text-muted-foreground hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add form */}
        {showAdd ? (
          <form action={handleAdd} className="border border-border p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Label *</label>
                <input
                  type="text"
                  name="label"
                  required
                  placeholder="e.g. Bibliopolis"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Domain (for favicon)</label>
                <input
                  type="text"
                  name="domain"
                  placeholder="e.g. bibliopolis.nl"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={addLoading}
                className="h-9 px-5 bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {addLoading ? 'Adding...' : 'Add Type'}
              </button>
              <button
                type="button"
                onClick={() => { setShowAdd(false); setAddResult(null) }}
                className="h-9 px-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              {addResult?.error && <p className="text-sm text-red-600">{addResult.error}</p>}
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 h-9 px-4 text-sm border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Custom Link Type
          </button>
        )}
      </div>
    </section>
  )
}

function ConfigurationSection({ profile }: { profile: any }) {
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
      <h2 className="text-lg font-semibold mb-4 pb-2 border-b">Application Settings</h2>
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
          <div>
            <label className={labelClass}>Date Format</label>
            <select name="date_format" defaultValue={profile?.date_format || 'DD/MM/YYYY'} className={inputClass}>
              {DATE_FORMATS.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Items Per Page (List View)</label>
            <select name="items_per_page_list" defaultValue={String(profile?.items_per_page_list || 50)} className={inputClass}>
              {LIST_VIEW_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Items Per Page (Grid View)</label>
            <select name="items_per_page_grid" defaultValue={String(profile?.items_per_page_grid || 25)} className={inputClass}>
              {GRID_VIEW_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
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
