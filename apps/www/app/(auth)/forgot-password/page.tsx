'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { forgotPassword } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Mail, Loader2 } from 'lucide-react'

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
        'Send Reset Link'
      )}
    </Button>
  )
}

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await forgotPassword(formData)
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="w-14 h-14 bg-green-100 flex items-center justify-center">
          <Mail className="w-7 h-7 text-green-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Check your inbox</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            If an account exists with this email address, you will receive a link 
            to reset your password.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-block text-sm font-semibold text-foreground hover:text-primary transition-colors"
        >
          ← Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Forgot password?</h2>
        <p className="text-muted-foreground text-sm">
          No problem. Enter your email and we'll send you a reset link.
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
          <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            className="h-11"
          />
        </div>

        <SubmitButton />
      </form>

      <div className="pt-2">
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to sign in
        </Link>
      </div>
    </div>
  )
}
