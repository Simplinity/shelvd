'use client'

import { useState, useRef, useEffect } from 'react'

type BisacCode = {
  code: string
  subject: string
}

type Props = {
  label: string
  value: string | null
  onChange: (value: string | null) => void
  options: BisacCode[]
  placeholder?: string
}

export default function BisacCombobox({ label, value, onChange, options, placeholder = "Search BISAC codes..." }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Find the selected option to display
  const selectedOption = options.find(o => o.code === value)

  // Filter options based on search (search in both code and subject)
  const filteredOptions = search.trim() === ''
    ? options.slice(0, 50) // Show first 50 when no search
    : options.filter(o => 
        o.code.toLowerCase().includes(search.toLowerCase()) ||
        o.subject.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 50) // Limit to 50 results

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement
      if (item) {
        item.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [highlightedIndex, isOpen])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(i => Math.min(i + 1, filteredOptions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(i => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (filteredOptions[highlightedIndex]) {
          onChange(filteredOptions[highlightedIndex].code)
          setIsOpen(false)
          setSearch('')
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSearch('')
        break
    }
  }

  const handleSelect = (code: string) => {
    onChange(code)
    setIsOpen(false)
    setSearch('')
  }

  const handleClear = () => {
    onChange(null)
    setSearch('')
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs uppercase tracking-wide text-muted-foreground mb-1">
        {label}
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? search : (selectedOption ? `${selectedOption.code} - ${selectedOption.subject}` : '')}
          onChange={e => {
            setSearch(e.target.value)
            setHighlightedIndex(0)
            if (!isOpen) setIsOpen(true)
          }}
          onFocus={() => {
            setIsOpen(true)
            setSearch('')
          }}
          onKeyDown={handleKeyDown}
          placeholder={selectedOption ? '' : placeholder}
          className="w-full h-10 px-3 py-2 pr-8 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
        />
        
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-background border border-border shadow-lg"
        >
          {filteredOptions.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              No results found
            </li>
          ) : (
            filteredOptions.map((option, index) => (
              <li
                key={option.code}
                onClick={() => handleSelect(option.code)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`px-3 py-2 text-sm cursor-pointer ${
                  index === highlightedIndex ? 'bg-muted' : ''
                } ${option.code === value ? 'font-medium' : ''}`}
              >
                <span className="font-mono text-xs text-muted-foreground mr-2">
                  {option.code}
                </span>
                <span>{option.subject}</span>
              </li>
            ))
          )}
          {search.trim() !== '' && filteredOptions.length === 50 && (
            <li className="px-3 py-1 text-xs text-muted-foreground border-t">
              Showing first 50 results. Type more to narrow down.
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
