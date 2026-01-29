'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { login } from '@/lib/actions/auth'
import { Button, Input, Alert } from '@/components/ui'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" fullWidth loading={pending}>
      Inloggen
    </Button>
  )
}

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
    }
  }

  return (
    <div>
      <h2 className="text-h2 font-bold mb-2">Welkom terug</h2>
      <p className="text-gray-600 mb-8">
        Log in om je collectie te beheren
      </p>

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <form action={handleSubmit} className="space-y-6">
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="je@email.com"
          autoComplete="email"
          required
        />
        
        <Input
          name="password"
          type="password"
          label="Wachtwoord"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-small text-gray-600 hover:text-black transition-colors"
          >
            Wachtwoord vergeten?
          </Link>
        </div>

        <SubmitButton />
      </form>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <p className="text-center text-gray-600">
          Nog geen account?{' '}
          <Link
            href="/signup"
            className="text-black font-semibold hover:text-swiss-red transition-colors"
          >
            Registreer hier
          </Link>
        </p>
      </div>
    </div>
  )
}
