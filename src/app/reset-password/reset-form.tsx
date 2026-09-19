'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function ResetForm({ email }: { email: string }) {
  const router = useRouter()
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    startTransition(async () => {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        setError(updateError.message)
        toast.error(updateError.message)
        return
      }

      toast.success('Password updated', {
        description: 'You can now sign in with your new password.',
      })

      // Sign the user out so they log in fresh with the new password
      await supabase.auth.signOut()

      setTimeout(() => {
        router.push('/login')
        router.refresh()
      }, 800)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="email"
        type="email"
        label="Email"
        value={email}
        disabled
        hint="You're resetting the password for this account"
      />

      <Input
        name="password"
        type="password"
        label="New password"
        required
        autoComplete="new-password"
        placeholder="At least 8 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isPending}
      />

      <Input
        name="confirm"
        type="password"
        label="Confirm new password"
        required
        autoComplete="new-password"
        placeholder="Re-enter your password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        disabled={isPending}
      />

      {error && (
        <div
          role="alert"
          className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"
        >
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="md"
        fullWidth
        loading={isPending}
      >
        {isPending ? 'Updating…' : 'Update password'}
      </Button>
    </form>
  )
}