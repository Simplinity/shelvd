'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { resetPassword } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2, CheckCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(!!code)

  // Exchange the recovery code for a session (client-side)
  useEffect(() => {
    if (!code) {
      setReady(true)
      return
    }

    const supabase = createClient()
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setError(`Recovery link expired or already used. Please request a new password reset.`)
        console.error('Code exchange error:', error.message)
      } else {
        setReady(true)
      }
      setLoading(false)
    })
  }, [code])

  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    setSaving(true)
    const result = await resetPassword(formData)
    setSaving(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h2 className="text-2xl font-bold tracking-tight">Password updated</h2>
        </div>
        <p className="text-muted-foreground text-sm">
          Your password has been changed. You can now sign in with your new password.
        </p>
        <a href="/login">
          <Button className="w-full h-11 text-sm font-semibold uppercase tracking-wide">
            Go to login
          </Button>
        </a>
      </div>
    )
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

      {ready && (
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

          <Button 
            type="submit" 
            className="w-full h-11 text-sm font-semibold uppercase tracking-wide" 
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Password'
            )}
          </Button>
        </form>
      )}

      {!ready && !error && (
        <p className="text-sm text-muted-foreground">
          <a href="/forgot-password" className="underline">Request a new password reset link</a>
        </p>
      )}
    </div>
  )
}
