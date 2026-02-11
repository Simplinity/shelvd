'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { InviteCode } from '@/lib/actions/invite-codes'
import { createInviteCode, toggleInviteCode } from '@/lib/actions/invite-codes'
import { Plus, X, Copy, Check, ChevronRight } from 'lucide-react'

const SOURCE_TYPES = [
  { value: 'blogger', label: 'Blogger' },
  { value: 'event', label: 'Event' },
  { value: 'social', label: 'Social Media' },
  { value: 'personal', label: 'Personal' },
  { value: 'campaign', label: 'Campaign' },
]

const BENEFIT_TYPES = [
  { value: 'none', label: 'None (attribution only)' },
  { value: 'trial_days', label: 'Free trial (days)' },
  { value: 'lifetime_free', label: 'Lifetime free' },
]

function relativeDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const parts = [
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join(''),
  ]
  return `SHELVD-${parts.join('-')}`
}

export function InviteCodesClient({ initialCodes }: { initialCodes: InviteCode[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showCreate, setShowCreate] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [benefitType, setBenefitType] = useState('none')
  const [codeValue, setCodeValue] = useState('')

  const codes = initialCodes

  async function handleCreate(formData: FormData) {
    setError(null)
    const result = await createInviteCode(formData)
    if (result.error) {
      setError(result.error)
    } else {
      setShowCreate(false)
      setCodeValue('')
      setBenefitType('none')
      startTransition(() => router.refresh())
    }
  }

  async function handleToggle(codeId: string, newActive: boolean) {
    await toggleInviteCode(codeId, newActive)
    startTransition(() => router.refresh())
  }

  function copySignupUrl(code: string) {
    const url = `${window.location.origin}/signup?code=${code}`
    navigator.clipboard.writeText(url)
    setCopiedId(code)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className={isPending ? 'opacity-60 transition-opacity' : ''}>
      {/* Create button */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted-foreground tabular-nums">
          {codes.length} {codes.length === 1 ? 'code' : 'codes'}
        </p>
        <button
          onClick={() => { setShowCreate(!showCreate); if (!showCreate && !codeValue) setCodeValue(generateCode()) }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border hover:bg-muted transition-colors"
        >
          {showCreate ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          {showCreate ? 'Cancel' : 'Create Code'}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form action={handleCreate} className="border bg-muted/20 p-4 mb-6 space-y-4">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 border border-red-200">{error}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Code *</label>
              <div className="flex gap-1">
                <input
                  name="code"
                  value={codeValue}
                  onChange={e => setCodeValue(e.target.value.toUpperCase())}
                  required
                  className="flex-1 px-3 py-1.5 text-sm border border-border bg-background uppercase font-mono focus:outline-none focus:ring-1 focus:ring-foreground"
                />
                <button
                  type="button"
                  onClick={() => setCodeValue(generateCode())}
                  className="px-2 py-1.5 text-[10px] border border-border hover:bg-muted transition-colors"
                  title="Generate random code"
                >
                  Auto
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Label</label>
              <input
                name="label"
                placeholder="Jane's Book Blog - Feb 2026"
                className="w-full px-3 py-1.5 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Source Type</label>
              <select name="sourceType" className="w-full px-3 py-1.5 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground">
                {SOURCE_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Source Name</label>
              <input
                name="sourceName"
                placeholder="janereads.com"
                className="w-full px-3 py-1.5 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Benefit</label>
              <select
                name="benefitType"
                value={benefitType}
                onChange={e => setBenefitType(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
              >
                {BENEFIT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {benefitType === 'trial_days' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Trial Days</label>
                <input
                  name="benefitDays"
                  type="number"
                  min="1"
                  defaultValue="30"
                  className="w-full px-3 py-1.5 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Max Uses</label>
              <input
                name="maxUses"
                type="number"
                min="1"
                placeholder="Unlimited"
                className="w-full px-3 py-1.5 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Expires At</label>
              <input
                name="expiresAt"
                type="date"
                className="w-full px-3 py-1.5 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wide bg-foreground text-background hover:bg-foreground/90 transition-colors"
            >
              Create Code
            </button>
          </div>
        </form>
      )}

      {/* Codes table */}
      {codes.length > 0 ? (
        <div className="border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="text-left px-3 py-2 font-medium">Code</th>
                <th className="text-left px-3 py-2 font-medium">Label</th>
                <th className="text-left px-3 py-2 font-medium">Source</th>
                <th className="text-left px-3 py-2 font-medium">Benefit</th>
                <th className="text-left px-3 py-2 font-medium w-24">Uses</th>
                <th className="text-left px-3 py-2 font-medium w-20">Status</th>
                <th className="text-left px-3 py-2 font-medium w-24">Created</th>
                <th className="w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {codes.map(code => (
                <tr key={code.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-medium">{code.code}</span>
                      <button
                        onClick={() => copySignupUrl(code.code)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                        title="Copy signup URL"
                      >
                        {copiedId === code.code
                          ? <Check className="w-3 h-3 text-green-600" />
                          : <Copy className="w-3 h-3 text-muted-foreground" />
                        }
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground max-w-[200px] truncate">
                    {code.label || '—'}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <span className="text-muted-foreground">{code.source_type}</span>
                    {code.source_name && (
                      <span className="text-foreground ml-1">{code.source_name}</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    {code.benefit_type === 'none' && <span className="text-muted-foreground">—</span>}
                    {code.benefit_type === 'lifetime_free' && <span className="text-green-700 font-medium">Lifetime free</span>}
                    {code.benefit_type === 'trial_days' && <span className="text-blue-700 font-medium">{code.benefit_days}d trial</span>}
                  </td>
                  <td className="px-3 py-2 text-xs tabular-nums">
                    <span className="font-medium">{code.times_used}</span>
                    {code.max_uses != null && (
                      <span className="text-muted-foreground"> / {code.max_uses}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => handleToggle(code.id, !code.is_active)}
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 transition-colors ${
                        code.is_active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {code.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-[11px] text-muted-foreground tabular-nums">
                    {relativeDate(code.created_at)}
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/invite-codes/${code.id}`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="border border-dashed px-4 py-12 text-center">
          <p className="text-sm text-muted-foreground">No invite codes yet.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Create one to start tracking signups.</p>
        </div>
      )}
    </div>
  )
}
