/**
 * Locale-aware formatting utilities.
 * 
 * All formatting is driven by a single locale string (e.g. 'en-GB', 'nl-BE', 'de-DE').
 * Uses the Intl API for consistent, standards-based formatting.
 */

export interface LocaleOption {
  code: string
  label: string
  dateExample: string
  numberExample: string
}

export const SUPPORTED_LOCALES: LocaleOption[] = [
  { code: 'en-GB', label: 'English (UK)', dateExample: '31/01/2026', numberExample: '1,234.56' },
  { code: 'en-US', label: 'English (US)', dateExample: '01/31/2026', numberExample: '1,234.56' },
  { code: 'nl-BE', label: 'Nederlands (België)', dateExample: '31/01/2026', numberExample: '1.234,56' },
  { code: 'nl-NL', label: 'Nederlands (Nederland)', dateExample: '31-01-2026', numberExample: '1.234,56' },
  { code: 'fr-FR', label: 'Français (France)', dateExample: '31/01/2026', numberExample: '1 234,56' },
  { code: 'fr-BE', label: 'Français (Belgique)', dateExample: '31/01/2026', numberExample: '1.234,56' },
  { code: 'de-DE', label: 'Deutsch (Deutschland)', dateExample: '31.01.2026', numberExample: '1.234,56' },
  { code: 'de-AT', label: 'Deutsch (Österreich)', dateExample: '31.01.2026', numberExample: '1 234,56' },
  { code: 'it-IT', label: 'Italiano', dateExample: '31/01/2026', numberExample: '1.234,56' },
  { code: 'es-ES', label: 'Español', dateExample: '31/1/2026', numberExample: '1.234,56' },
  { code: 'pt-PT', label: 'Português', dateExample: '31/01/2026', numberExample: '1 234,56' },
  { code: 'sv-SE', label: 'Svenska', dateExample: '2026-01-31', numberExample: '1 234,56' },
  { code: 'da-DK', label: 'Dansk', dateExample: '31.01.2026', numberExample: '1.234,56' },
  { code: 'ja-JP', label: '日本語', dateExample: '2026/01/31', numberExample: '1,234' },
]

const DEFAULT_LOCALE = 'en-GB'

/**
 * Format a date string according to the user's locale.
 * Returns null for null/invalid input.
 */
export function formatDate(dateStr: string | null | undefined, locale?: string | null): string | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return new Intl.DateTimeFormat(locale || DEFAULT_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

/**
 * Format a date with time according to the user's locale.
 */
export function formatDateTime(dateStr: string | null | undefined, locale?: string | null): string | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return new Intl.DateTimeFormat(locale || DEFAULT_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * Format a date in a human-readable long format (e.g. "31 January 2026").
 */
export function formatDateLong(dateStr: string | null | undefined, locale?: string | null): string | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return new Intl.DateTimeFormat(locale || DEFAULT_LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

/**
 * Format a number according to the user's locale.
 */
export function formatNumber(value: number | null | undefined, locale?: string | null, options?: Intl.NumberFormatOptions): string {
  if (value == null) return '—'
  return new Intl.NumberFormat(locale || DEFAULT_LOCALE, options).format(value)
}

/**
 * Format a number as integer (no decimals) according to the user's locale.
 */
export function formatInteger(value: number | null | undefined, locale?: string | null): string {
  if (value == null) return '—'
  return new Intl.NumberFormat(locale || DEFAULT_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Format a currency amount according to the user's locale.
 * Uses the currency code for the symbol (EUR → €, USD → $, etc.).
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency?: string | null,
  locale?: string | null,
  options?: { compact?: boolean; decimals?: boolean }
): string {
  if (amount == null) return '—'
  const curr = currency || 'EUR'
  return new Intl.NumberFormat(locale || DEFAULT_LOCALE, {
    style: 'currency',
    currency: curr,
    minimumFractionDigits: options?.decimals === false ? 0 : undefined,
    maximumFractionDigits: options?.decimals === false ? 0 : undefined,
    notation: options?.compact ? 'compact' : undefined,
  }).format(amount)
}

/**
 * Format a percentage according to the user's locale.
 */
export function formatPercent(value: number | null | undefined, locale?: string | null): string {
  if (value == null) return '—'
  return new Intl.NumberFormat(locale || DEFAULT_LOCALE, {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value / 100)
}
