'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { forgotPassword } from '@/lib/actions/auth'
import { Button, Input, Alert } from '@/components/ui'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" fullWidth loading={pending}>
      Verstuur reset link
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
      <div>
        <div className="w-16 h-16 bg-green-100 flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h2 className="text-h2 font-bold mb-2">Check je inbox</h2>
        <p className="text-gray-600 mb-8">
          Als er een account bestaat met dit emailadres, ontvang je een link 
          om je wachtwoord te resetten.
        </p>
        <Link
          href="/login"
          className="text-black font-semibold hover:text-swiss-red transition-colors"
        >
          ← Terug naar inloggen
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-h2 font-bold mb-2">Wachtwoord vergeten?</h2>
      <p className="text-gray-600 mb-8">
        Geen probleem. Vul je email in en we sturen je een reset link.
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

        <SubmitButton />
      </form>

      <div className="mt-8">
        <Link
          href="/login"
          className="text-gray-600 hover:text-black transition-colors"
        >
          ← Terug naar inloggen
        </Link>
      </div>
    </div>
  )
}
