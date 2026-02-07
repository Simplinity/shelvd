'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

type Collection = {
  id: string
  name: string
  isMember: boolean
}

type Props = {
  bookId: string
  collections: Collection[]
}

export default function CollectionChips({ bookId, collections: initial }: Props) {
  const [collections, setCollections] = useState(initial)
  const [toggling, setToggling] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleToggle = async (colId: string, currentlyMember: boolean) => {
    setToggling(colId)
    try {
      if (currentlyMember) {
        await supabase
          .from('book_collections')
          .delete()
          .eq('book_id', bookId)
          .eq('collection_id', colId)
      } else {
        await supabase
          .from('book_collections')
          .insert({ book_id: bookId, collection_id: colId })
      }
      setCollections(prev =>
        prev.map(c => c.id === colId ? { ...c, isMember: !currentlyMember } : c)
      )
      router.refresh()
    } catch (err) {
      console.error('Failed to toggle collection:', err)
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="flex gap-1.5 mt-3 flex-wrap">
      {collections.map(col => (
        <button
          key={col.id}
          onClick={() => handleToggle(col.id, col.isMember)}
          disabled={toggling === col.id}
          className={`text-xs px-2 py-0.5 border transition-colors ${
            col.isMember
              ? 'bg-foreground text-background border-foreground hover:bg-foreground/80'
              : 'bg-background text-muted-foreground border-border hover:border-foreground hover:text-foreground'
          } ${toggling === col.id ? 'opacity-50' : 'cursor-pointer'}`}
          title={col.isMember ? `Remove from ${col.name}` : `Add to ${col.name}`}
        >
          {toggling === col.id ? (
            <Loader2 className="w-3 h-3 animate-spin inline" />
          ) : (
            col.name
          )}
        </button>
      ))}
    </div>
  )
}
