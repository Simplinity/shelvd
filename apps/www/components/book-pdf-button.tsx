'use client'

import { useState, useRef, useEffect } from 'react'
import { FileText, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BookPdfButtonProps {
  bookId: string
}

const SHEET_SIZES = [
  { value: 'a4', label: 'A4' },
  { value: 'a5', label: 'A5' },
  { value: 'a6', label: 'A6' },
  { value: 'us-letter', label: 'US Letter' },
  { value: 'us-legal', label: 'US Legal' },
  { value: 'us-half-letter', label: 'US Half Letter' },
]

export default function BookPdfButton({ bookId }: BookPdfButtonProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function openPdf(type: string, size?: string) {
    const params = new URLSearchParams({ type })
    if (size) params.set('size', size)
    window.open(`/api/books/${bookId}/pdf?${params}`, '_blank')
    setOpen(false)
  }

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-1.5"
      >
        <FileText className="w-4 h-4" />
        Print Insert
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-background border border-border shadow-lg z-50">
          {/* Catalog Card */}
          <button
            onClick={() => openPdf('catalog-card')}
            className="w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors border-b border-border"
          >
            <span className="text-sm font-medium">Catalog Card</span>
            <span className="block text-xs text-muted-foreground mt-0.5">3×5″ vintage library card</span>
          </button>

          {/* Catalog Sheet sizes */}
          <div className="px-3 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Full Catalog Sheet</span>
          </div>
          {SHEET_SIZES.map(s => (
            <button
              key={s.value}
              onClick={() => openPdf('catalog-sheet', s.value)}
              className="w-full text-left px-3 py-1.5 hover:bg-muted/50 transition-colors text-sm"
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
