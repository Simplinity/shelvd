'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { signup } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

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
        'Create Account'
      )}
    </Button>
  )
}

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await signup(formData)
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
          <CheckCircle2 className="w-7 h-7 text-green-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Check your inbox</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We've sent a confirmation link to your email address. 
            Click the link to activate your account.
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
        <h2 className="text-2xl font-bold tracking-tight">Create account</h2>
        <p className="text-muted-foreground text-sm">
          Start managing your collection today
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
          <Label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wide">
            Name
          </Label>
          <Input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Your full name"
            autoComplete="name"
            className="h-11"
          />
        </div>
        
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
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide">
            Password
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

      <div className="pt-6 border-t">
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-foreground hover:text-primary transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
}
