'use client'

import { useState } from 'react'
import { FeatureGate } from '@/components/feature-gate'
import type { CollectionAuditResult, AuditCategory, AuditBook } from '@/lib/actions/audit'
import {
  Hash,
  Users,
  Image,
  ShieldCheck,
  Building2,
  Calendar,
  ScrollText,
  TrendingUp,
  Languages,
  MapPin,
  ChevronDown,
  ChevronUp,
  Check,
  Pencil,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  no_identifiers: Hash,
  no_contributors: Users,
  no_cover: Image,
  no_condition: ShieldCheck,
  no_publisher: Building2,
  no_year: Calendar,
  no_provenance: ScrollText,
  no_valuation: TrendingUp,
  no_language: Languages,
  no_location: MapPin,
}

const SEVERITY_STYLES: Record<string, { dot: string; border: string }> = {
  high: { dot: 'bg-red-600', border: 'border-red-600' },
  medium: { dot: 'bg-neutral-400', border: 'border-neutral-300' },
  low: { dot: 'bg-neutral-300', border: 'border-neutral-200' },
}

function getScoreColor(score: number): string {
  if (score >= 90) return 'text-black'
  if (score >= 70) return 'text-neutral-700'
  return 'text-red-600'
}

function getScoreBarColor(score: number): string {
  if (score >= 90) return 'bg-black'
  if (score >= 70) return 'bg-neutral-500'
  return 'bg-red-600'
}

export function AuditClient({ audit }: { audit: CollectionAuditResult }) {
  return (
    <FeatureGate feature="collection_audit">
      <AuditContent audit={audit} />
    </FeatureGate>
  )
}

function AuditContent({ audit }: { audit: CollectionAuditResult }) {
  const { totalBooks, score, totalIssues, categories, error } = audit

  if (error) {
    return (
      <div className="border border-border p-6 text-center">
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  // Count categories with issues
  const categoriesWithIssues = categories.filter(c => c.count > 0).length

  if (totalBooks === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Collection Audit</h1>
          <p className="text-sm text-muted-foreground">
            Data quality overview for your library
          </p>
        </div>
        <div className="border border-dashed border-border px-6 py-16 text-center max-w-md mx-auto">
          <p className="text-base text-muted-foreground italic">
            Can&apos;t audit what doesn&apos;t exist. Add some books first and we&apos;ll tell you what&apos;s missing.
          </p>
          <a
            href="/books/new"
            className="inline-block mt-4 px-4 py-2 text-sm font-medium border border-border hover:bg-accent transition-colors"
          >
            + Add your first book
          </a>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Collection Audit</h1>
        <p className="text-sm text-muted-foreground">
          Data quality overview for your library
        </p>
      </div>

      {/* Health Score */}
      <div className="border border-border p-6 mb-8">
        <div className="flex items-start gap-8">
          {/* Score number */}
          <div className="flex-shrink-0">
            <div className={`text-5xl font-bold tabular-nums ${getScoreColor(score)}`}>
              {score}%
            </div>
            <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
              Complete
            </div>
          </div>

          {/* Score bar + details */}
          <div className="flex-1 min-w-0 pt-2">
            {/* Progress bar */}
            <div className="h-2 bg-neutral-100 w-full mb-4">
              <div
                className={`h-full transition-all duration-500 ${getScoreBarColor(score)}`}
                style={{ width: `${score}%` }}
              />
            </div>

            {/* Summary stats */}
            <div className="flex gap-6 text-sm">
              <div>
                <span className="font-semibold">{totalBooks.toLocaleString()}</span>
                <span className="text-muted-foreground"> books</span>
              </div>
              {totalIssues > 0 && (
                <div>
                  <span className="font-semibold text-red-600">{totalIssues.toLocaleString()}</span>
                  <span className="text-muted-foreground"> issues across </span>
                  <span className="font-semibold">{categoriesWithIssues}</span>
                  <span className="text-muted-foreground"> {categoriesWithIssues === 1 ? 'category' : 'categories'}</span>
                </div>
              )}
              {totalIssues === 0 && (
                <div className="text-muted-foreground">
                  No issues found — your catalog is in excellent shape.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category cards — 2 column grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map(category => (
          <CategoryCard key={category.key} category={category} totalBooks={totalBooks} />
        ))}
      </div>
    </div>
  )
}

function CategoryCard({ category, totalBooks }: { category: AuditCategory; totalBooks: number }) {
  const [expanded, setExpanded] = useState(false)
  const Icon = CATEGORY_ICONS[category.key] || Hash
  const severity = SEVERITY_STYLES[category.severity]
  const hasIssues = category.count > 0
  const percentage = totalBooks > 0 ? Math.round(((totalBooks - category.count) / totalBooks) * 100) : 100

  return (
    <div className={`border ${hasIssues ? severity.border : 'border-border'} transition-colors`}>
      {/* Card header — clickable if issues exist */}
      <button
        type="button"
        onClick={() => hasIssues && setExpanded(!expanded)}
        disabled={!hasIssues}
        className={`w-full text-left p-4 flex items-center gap-3 ${hasIssues ? 'cursor-pointer hover:bg-neutral-50' : 'cursor-default'}`}
      >
        {/* Icon */}
        <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center ${hasIssues ? '' : 'text-muted-foreground/40'}`}>
          {hasIssues ? (
            <Icon className="w-4 h-4" />
          ) : (
            <Check className="w-4 h-4 text-neutral-400" />
          )}
        </div>

        {/* Label + count */}
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-medium ${hasIssues ? '' : 'text-muted-foreground'}`}>
            {category.label}
          </div>
          <div className="text-xs text-muted-foreground">
            {hasIssues ? (
              <>
                <span className={category.severity === 'high' ? 'text-red-600 font-semibold' : 'font-semibold'}>
                  {category.count.toLocaleString()}
                </span>
                {' '}
                {category.count === 1 ? 'book' : 'books'} — {percentage}% complete
              </>
            ) : (
              'All books pass this check'
            )}
          </div>
        </div>

        {/* Severity dot + expand arrow */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasIssues && (
            <>
              <span className={`w-2 h-2 rounded-full ${severity.dot}`} />
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </>
          )}
        </div>
      </button>

      {/* Expanded book list */}
      {expanded && hasIssues && (
        <div className="border-t border-border">
          <div className="divide-y divide-border">
            {category.books.map(book => (
              <BookRow key={book.id} book={book} category={category} />
            ))}
          </div>
          {category.count > category.books.length && (
            <div className="px-4 py-2 text-xs text-muted-foreground border-t border-border">
              Showing {category.books.length} of {category.count.toLocaleString()} books
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BookRow({ book, category }: { book: AuditBook; category: AuditCategory }) {
  const isEnrich = category.fixType === 'enrich'
  const href = isEnrich
    ? `/books/${book.id}/edit?enrich=true`
    : `/books/${book.id}/edit`

  return (
    <div className="flex items-center justify-between px-4 py-2 hover:bg-neutral-50">
      <Link
        href={`/books/${book.id}`}
        className="text-sm truncate flex-1 min-w-0 hover:underline"
      >
        {book.title}
      </Link>
      <Link
        href={href}
        className="flex-shrink-0 ml-3 inline-flex items-center gap-1 text-xs font-medium hover:underline"
      >
        {isEnrich ? (
          <>
            <Sparkles className="w-3 h-3" />
            Enrich
          </>
        ) : (
          <>
            <Pencil className="w-3 h-3" />
            Edit
          </>
        )}
      </Link>
    </div>
  )
}
