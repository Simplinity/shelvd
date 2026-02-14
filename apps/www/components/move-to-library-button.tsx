'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  bookId: string
  libraryCollectionId: string
  wishlistCollectionId: string
}

export default function MoveToLibraryButton({ bookId, libraryCollectionId, wishlistCollectionId }: Props) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleMove = async () => {
    setLoading(true)
    try {
      // Add to Library + remove from Wishlist in parallel
      const [addResult, removeResult] = await Promise.all([
        supabase
          .from('book_collections')
          .upsert({ book_id: bookId, collection_id: libraryCollectionId }, { onConflict: 'book_id,collection_id' }),
        supabase
          .from('book_collections')
          .delete()
          .eq('book_id', bookId)
          .eq('collection_id', wishlistCollectionId),
      ])

      if (addResult.error) throw addResult.error
      if (removeResult.error) throw removeResult.error

      setDone(true)
      router.refresh()
    } catch (err) {
      console.error('Move to Library failed:', err)
      toast.error('Failed to move book to Library')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <Button variant="outline" disabled className="gap-2 text-green-600 border-green-200">
        <Check className="w-4 h-4" />
        Moved to Library
      </Button>
    )
  }

  return (
    <Button variant="outline" onClick={handleMove} disabled={loading} className="gap-2">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
      Move to Library
    </Button>
  )
}
