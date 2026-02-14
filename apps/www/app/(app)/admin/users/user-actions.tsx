'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { MoreHorizontal, Ban, Clock, CheckCircle, Trash2 } from 'lucide-react'

interface UserActionsProps {
  userId: string
  currentStatus: string
  isAdmin: boolean
}

export function UserActions({ userId, currentStatus, isAdmin }: UserActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleStatusChange = async (newStatus: string, reason?: string) => {
    setIsLoading(true)
    const supabase = createClient()
    
    const { error } = await supabase
      .from('user_profiles')
      .update({ 
        status: newStatus,
        status_reason: reason || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
    
    if (error) {
      toast.error('Error updating user: ' + error.message)
    } else {
      router.refresh()
    }
    
    setIsLoading(false)
    setIsOpen(false)
  }

  const handleSuspend = () => {
    const reason = prompt('Reason for suspension (optional):')
    handleStatusChange('suspended', reason || undefined)
  }

  const handleBan = () => {
    const reason = prompt('Reason for ban (optional):')
    if (confirm('Are you sure you want to ban this user? They will not be able to access the platform.')) {
      handleStatusChange('banned', reason || undefined)
    }
  }

  const handleActivate = () => {
    handleStatusChange('active')
  }

  const handleDelete = async () => {
    const confirmation = prompt('Type "DELETE" to permanently delete this user and all their data:')
    if (confirmation !== 'DELETE') {
      return
    }

    setIsLoading(true)
    
    // Delete via API route (needs to handle cascade delete properly)
    const response = await fetch('/api/admin/users/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    })

    if (!response.ok) {
      const data = await response.json()
      toast.error('Error deleting user: ' + (data.error || 'Unknown error'))
    } else {
      router.refresh()
    }

    setIsLoading(false)
    setIsOpen(false)
  }

  // Don't show actions for admin users (protect admins)
  if (isAdmin) {
    return <span className="text-xs text-muted-foreground">Protected</span>
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="p-1 hover:bg-muted rounded disabled:opacity-50"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 w-48 bg-background border shadow-lg z-20">
            {currentStatus === 'active' && (
              <>
                <button
                  onClick={handleSuspend}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                >
                  <Clock className="w-4 h-4 text-amber-600" />
                  Suspend User
                </button>
                <button
                  onClick={handleBan}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
                >
                  <Ban className="w-4 h-4 text-red-600" />
                  Ban User
                </button>
              </>
            )}
            
            {(currentStatus === 'suspended' || currentStatus === 'banned') && (
              <button
                onClick={handleActivate}
                className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-green-600" />
                Reactivate User
              </button>
            )}

            <div className="border-t my-1" />
            
            <button
              onClick={handleDelete}
              className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete User
            </button>
          </div>
        </>
      )}
    </div>
  )
}
