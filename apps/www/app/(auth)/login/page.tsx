'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { login } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, BookOpen } from 'lucide-react'

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
        'Sign In'
      )}
    </Button>
  )
}

export default function LoginPage() {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const urlError = params?.get('error')
  const [error, setError] = useState<string | null>(urlError || null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
        <p className="text-muted-foreground text-sm">
          Sign in to manage your collection
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
        
        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            className="h-11"
          />
        </div>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <SubmitButton />
      </form>

      <div className="pt-6 border-t">
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link
            href="/signup"
            className="font-semibold text-foreground hover:text-primary transition-colors"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  )
}
