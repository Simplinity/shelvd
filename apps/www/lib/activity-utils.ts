/**
 * Helper: compute a JSON diff between old and new objects.
 * Returns only changed fields with { old, new } values.
 */
export function computeDiff(
  oldObj: Record<string, unknown>,
  newObj: Record<string, unknown>,
  fields?: string[]
): Record<string, { old: unknown; new: unknown }> {
  const diff: Record<string, { old: unknown; new: unknown }> = {}
  const keys = fields ?? [...new Set([...Object.keys(oldObj), ...Object.keys(newObj)])]

  for (const key of keys) {
    const oldVal = oldObj[key] ?? null
    const newVal = newObj[key] ?? null
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diff[key] = { old: oldVal, new: newVal }
    }
  }

  return diff
}

/**
 * Helper: build a human-readable entity label for a book.
 */
export function bookLabel(title: string, year?: string | number | null): string {
  if (year) return `${title} (${year})`
  return title
}
