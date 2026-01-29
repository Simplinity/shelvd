'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { resetPassword } from '@/lib/actions/auth'
import { Button, Input, Alert } from '@/components/ui'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" fullWidth loading={pending}>
      Wachtwoord opslaan
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
    // On success, the server action redirects to /books
  }

  return (
    <div>
      <h2 className="text-h2 font-bold mb-2">Nieuw wachtwoord</h2>
      <p className="text-gray-600 mb-8">
        Kies een nieuw wachtwoord voor je account
      </p>

      {error && (
        <Alert variant="error" className="mb-6">
          {error}
        </Alert>
      )}

      <form action={handleSubmit} className="space-y-6">
        <Input
          name="password"
          type="password"
          label="Nieuw wachtwoord"
          placeholder="Minimaal 8 tekens"
          autoComplete="new-password"
          helperText="Minimaal 8 tekens"
          required
        />

        <SubmitButton />
      </form>
    </div>
  )
}
