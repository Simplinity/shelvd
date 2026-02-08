/**
 * Name utilities for contributor name handling.
 * 
 * Standard format: "Family, Given" (e.g., "Tolkien, J.R.R.")
 * Lookup providers return: "Given Family" (e.g., "J.R.R. Tolkien")
 * 
 * This module handles parsing, normalization, and comparison.
 */

export interface ParsedName {
  family_name: string
  given_names: string
  canonical_name: string  // "Family, Given"
  sort_name: string       // Same as canonical for persons
  display_name: string    // Same as canonical for consistency
  type: 'person' | 'organization'
}

// Common name prefixes that are part of the family name (lowercased)
const FAMILY_PREFIXES = new Set([
  'van', 'von', 'de', 'del', 'della', 'di', 'du', 'des', 'le', 'la', 'les',
  'den', 'der', 'het', 'ten', 'ter', 'op', 'te',
  'el', 'al', 'bin', 'ibn',
  'st', 'st.', 'saint',
])

// Words that suggest an organization rather than a person
const ORG_INDICATORS = [
  'university', 'press', 'museum', 'institute', 'society', 'association',
  'foundation', 'library', 'council', 'committee', 'department', 'ministry',
  'company', 'corporation', 'inc', 'ltd', 'llc', 'gmbh', 'bv', 'nv',
  'editions', 'éditions', 'uitgeverij', 'verlag', 'editorial',
]

/**
 * Detect if a name looks like an organization rather than a person.
 */
function isOrganization(name: string): boolean {
  const words = name.toLowerCase().split(/\s+/)
  return ORG_INDICATORS.some(ind => words.some(w => w === ind || w === ind + '.' || w === ind + ','))
}

/**
 * Parse a name from any format into structured parts.
 * 
 * Handles:
 * - "Tolkien, J.R.R." → passthrough (already correct)
 * - "J.R.R. Tolkien" → "Tolkien, J.R.R."
 * - "Gabriel García Márquez" → "García Márquez, Gabriel"
 * - "Van Houcke, Alfons" → passthrough
 * - "Oxford University Press" → organization (no split)
 * - "Voltaire" → single name, no comma
 */
export function parseName(rawName: string): ParsedName {
  const name = rawName.trim()

  if (!name) {
    return { family_name: '', given_names: '', canonical_name: '', sort_name: '', display_name: '', type: 'person' }
  }

  // Organization detection
  if (isOrganization(name)) {
    return {
      family_name: name, given_names: '',
      canonical_name: name, sort_name: name, display_name: name,
      type: 'organization',
    }
  }

  // Already in "Last, First" format — passthrough, just clean up
  if (name.includes(',')) {
    const commaIdx = name.indexOf(',')
    const family = name.substring(0, commaIdx).trim()
    const given = name.substring(commaIdx + 1).trim()
    const canonical = given ? `${family}, ${given}` : family
    return {
      family_name: family, given_names: given,
      canonical_name: canonical, sort_name: canonical, display_name: canonical,
      type: 'person',
    }
  }

  // "First Last" format — need to split
  const parts = name.split(/\s+/)

  if (parts.length === 1) {
    // Single name (e.g., "Voltaire")
    return {
      family_name: parts[0], given_names: '',
      canonical_name: parts[0], sort_name: parts[0], display_name: parts[0],
      type: 'person',
    }
  }

  // Find where given names end and family name begins.
  // The last word is always part of the family name.
  // Walk backwards to collect family prefixes (van, de, von, ...).
  let familyStartIdx = parts.length - 1
  for (let i = parts.length - 2; i >= 1; i--) {
    const lower = parts[i].toLowerCase().replace(/[.]/g, '')
    if (FAMILY_PREFIXES.has(lower)) {
      familyStartIdx = i
    } else {
      break
    }
  }

  const given = parts.slice(0, familyStartIdx).join(' ')
  const family = parts.slice(familyStartIdx).join(' ')
  const canonical = given ? `${family}, ${given}` : family

  return {
    family_name: family, given_names: given,
    canonical_name: canonical, sort_name: canonical, display_name: canonical,
    type: 'person',
  }
}

/**
 * Normalize a name for comparison purposes.
 * Strips punctuation, lowercases, and sorts word parts so that
 * "Tolkien, J.R.R." and "J.R.R. Tolkien" produce the same key.
 */
export function normalizeNameForComparison(rawName: string): string {
  const name = rawName.trim().toLowerCase()
  if (!name) return ''

  // Remove all punctuation except spaces
  const cleaned = name.replace(/[^a-z0-9\s\u00C0-\u024F]/g, ' ').replace(/\s+/g, ' ').trim()

  // Split into words, sort alphabetically, rejoin
  return cleaned.split(' ').filter(Boolean).sort().join(' ')
}

/**
 * Check if two author names refer to the same person.
 * Handles format differences like "First Last" vs "Last, First".
 * 
 * Examples that return true:
 * - "Tolkien, J.R.R." vs "J.R.R. Tolkien"
 * - "Van Houcke, Alfons" vs "Alfons Van Houcke"
 * - "García Márquez, Gabriel" vs "Gabriel García Márquez"
 */
export function isSameAuthor(nameA: string, nameB: string): boolean {
  if (!nameA || !nameB) return false
  return normalizeNameForComparison(nameA) === normalizeNameForComparison(nameB)
}

/**
 * Convert a provider-format name ("First Last") to catalog format ("Last, First").
 * If already in "Last, First" format, cleans it up.
 */
export function toCatalogFormat(rawName: string): string {
  return parseName(rawName).canonical_name
}
