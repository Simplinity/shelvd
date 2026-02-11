'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { logActivity } from '@/lib/actions/activity-log'

type DeleteBookButtonProps = {
  bookId: string
  bookTitle: string
}

export default function DeleteBookButton({ bookId, bookTitle }: DeleteBookButtonProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (confirmText.toLowerCase() !== 'delete') return

    setDeleting(true)
    setError(null)

    try {
      const supabase = createClient()
      
      // First delete book_contributors (foreign key constraint)
      const { error: contributorsError } = await supabase
        .from('book_contributors')
        .delete()
        .eq('book_id', bookId)

      if (contributorsError) {
        throw new Error(`Failed to delete contributors: ${contributorsError.message}`)
      }

      // Then delete the book
      const { error: bookError } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId)

      if (bookError) {
        throw new Error(`Failed to delete book: ${bookError.message}`)
      }

      // Activity log (fire-and-forget)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        void logActivity({
          userId: user.id,
          action: 'book.deleted',
          category: 'book',
          entityType: 'book',
          entityId: bookId,
          entityLabel: bookTitle,
        })
      }

      // Redirect to books list
      router.push('/books')
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete book'
      setError(message)
      setDeleting(false)
    }
  }

  const isConfirmValid = confirmText.toLowerCase() === 'delete'

  return (
    <>
      <Button 
        variant="outline" 
        onClick={() => setShowModal(true)}
        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </Button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => !deleting && setShowModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-background border border-border shadow-lg p-6 w-full max-w-md mx-4">
            <button
              onClick={() => !deleting && setShowModal(false)}
              disabled={deleting}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold">Delete Book</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-2">
              You are about to permanently delete:
            </p>
            <p className="text-sm font-medium mb-4 p-2 bg-muted">
              {bookTitle}
            </p>

            <p className="text-sm text-muted-foreground mb-4">
              This action <strong>cannot be undone</strong>. All data associated with this book will be permanently removed.
            </p>

            <p className="text-sm mb-2">
              Type <strong className="font-mono bg-muted px-1">delete</strong> to confirm:
            </p>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type 'delete' to confirm"
              disabled={deleting}
              className="w-full h-10 px-3 py-2 text-sm border border-border bg-background focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 mb-4 disabled:opacity-50"
              autoFocus
            />

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={!isConfirmValid || deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Permanently
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
