'use client'

import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type TagItem = { id: string; name: string; color: string }

type Props = {
  bookId?: string
  selectedTags: TagItem[]
  onTagsChange: (tags: TagItem[]) => void
}

export default function TagInput({ bookId, selectedTags, onTagsChange }: Props) {
  const [input, setInput] = useState('')
  const [allUserTags, setAllUserTags] = useState<TagItem[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Fetch all user tags for suggestions
  useEffect(() => {
    const fetchTags = async () => {
      const { data } = await supabase
        .from('tags')
        .select('id, name, color')
        .order('name', { ascending: true })
      if (data) setAllUserTags(data as TagItem[])
    }
    fetchTags()
  }, [])

  const selectedNames = new Set(selectedTags.map(t => t.name.toLowerCase()))

  const filtered = allUserTags
    .filter(t => t.name.toLowerCase().includes(input.toLowerCase()) && !selectedNames.has(t.name.toLowerCase()))
    .slice(0, 8)

  const showCreateOption = input.trim() &&
    !allUserTags.some(t => t.name.toLowerCase() === input.trim().toLowerCase()) &&
    !selectedNames.has(input.trim().toLowerCase())

  const addExistingTag = (tag: TagItem) => {
    onTagsChange([...selectedTags, tag])
    setInput('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const createAndAddTag = async (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('tags')
      .insert({ user_id: user.id, name: trimmed })
      .select('id, name, color')
      .single()

    if (data) {
      const newTag = data as TagItem
      setAllUserTags(prev => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)))
      onTagsChange([...selectedTags, newTag])
    }
    setInput('')
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const removeTag = (tagId: string) => {
    onTagsChange(selectedTags.filter(t => t.id !== tagId))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault()
      // If exact match exists in suggestions, add it; otherwise create new
      const match = allUserTags.find(t => t.name.toLowerCase() === input.trim().toLowerCase())
      if (match && !selectedNames.has(match.name.toLowerCase())) {
        addExistingTag(match)
      } else if (showCreateOption) {
        createAndAddTag(input)
      }
    } else if (e.key === 'Backspace' && !input && selectedTags.length > 0) {
      removeTag(selectedTags[selectedTags.length - 1].id)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex flex-wrap gap-1.5 p-2 border border-border bg-background min-h-[38px]">
        {selectedTags.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 text-xs px-2 py-0.5 text-white"
            style={{ backgroundColor: tag.color || '#6b7280' }}
          >
            {tag.name}
            <button type="button" onClick={() => removeTag(tag.id)} className="hover:opacity-70">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => { setInput(e.target.value); setShowSuggestions(true) }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length === 0 ? 'Add tag...' : ''}
          className="flex-1 min-w-[80px] text-sm bg-transparent outline-none"
        />
      </div>
      {showSuggestions && input && (filtered.length > 0 || showCreateOption) && (
        <div className="absolute z-10 w-full mt-1 border border-border bg-background shadow-sm max-h-40 overflow-y-auto">
          {filtered.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => addExistingTag(t)}
              className="w-full text-left text-sm px-3 py-1.5 hover:bg-muted flex items-center gap-2"
            >
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: t.color || '#6b7280' }} />
              {t.name}
            </button>
          ))}
          {showCreateOption && (
            <button
              type="button"
              onClick={() => createAndAddTag(input)}
              className="w-full text-left text-sm px-3 py-1.5 hover:bg-muted text-muted-foreground"
            >
              Create &ldquo;{input.trim()}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  )
}
