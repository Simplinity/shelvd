'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { resetPassword } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" className="w-full h-11 text-sm font-semibold uppercase tracking-wide" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await resetPassword(formData)
    if (result?.error) {
      setError(result.error)
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
    </div>
  )
}
