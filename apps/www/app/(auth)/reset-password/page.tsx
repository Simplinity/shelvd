'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, BookOpen, CheckCircle } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" className="w-full h-11 text-sm font-semibold uppercase tracking-wide" disabled={pending}>
      {pending ? (
        <>
          <BookOpen className="mr-2 h-4 w-4 animate-book-pulse" />
          Loading...
        </>
      ) : (
        'Save Password'
      )}
    </Button>
  )
}

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const password = formData.get('password') as string
    
    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      if (error.message.toLowerCase().includes('session') || error.message.toLowerCase().includes('not authenticated')) {
        setError('Recovery link expired or already used. Please request a new password reset.')
      } else {
        setError(error.message)
      }
    } else {
      setSuccess(true)
      setTimeout(() => {
        window.location.href = '/books'
      }, 2000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">New password</h2>
        <p className="text-muted-foreground text-sm">
          Choose a new password for your account
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Password updated! Redirecting to your library...</AlertDescription>
        </Alert>
      )}

      {!success && (
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide">
              New Password
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              required
              className="h-11"
            />
            <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
          </div>

          <SubmitButton />
        </form>
      )}
    </div>
  )
}
