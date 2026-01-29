'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { signup } from '@/lib/actions/auth'
import { Button, Input, Alert } from '@/components/ui'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" fullWidth loading={pending}>
      Account aanmaken
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-h2 font-bold mb-2">Check je inbox</h2>
        <p className="text-gray-600 mb-8">
          We hebben een bevestigingslink gestuurd naar je emailadres. 
          Klik op de link om je account te activeren.
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
      <h2 className="text-h2 font-bold mb-2">Account aanmaken</h2>
      <p className="text-gray-600 mb-8">
        Start met het beheren van je collectie
      </p>

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <form action={handleSubmit} className="space-y-6">
        <Input
          name="fullName"
          type="text"
          label="Naam"
          placeholder="Je volledige naam"
          autoComplete="name"
        />
        
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
          placeholder="Minimaal 8 tekens"
          autoComplete="new-password"
          helperText="Minimaal 8 tekens"
          required
        />

        <SubmitButton />
      </form>

      <div className="mt-8 pt-8 border-t border-gray-200">
        <p className="text-center text-gray-600">
          Al een account?{' '}
          <Link
            href="/login"
            className="text-black font-semibold hover:text-swiss-red transition-colors"
          >
            Log hier in
          </Link>
        </p>
      </div>
    </div>
  )
}
