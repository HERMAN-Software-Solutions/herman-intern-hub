'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function ForgotForm() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Please enter your email')
      return
    }

    startTransition(async () => {
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${appUrl}/auth/callback?next=/reset-password`,
        }
      )

      if (resetError) {
        setError(resetError.message)
        toast.error(resetError.message)
        return
      }

      setSent(true)
      toast.success('Check your email', {
        description: 'We sent you a password reset link.',
      })
    })
  }

  // ─── Success state ─────────────────────────────────
  if (sent) {
    return (
      <div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-green-800 font-medium">
            ✅ Reset link sent
          </p>
          <p className="text-xs text-green-700 mt-1">
            We sent a password reset link to <strong>{email}</strong>.
          </p>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          Check your inbox (and spam folder). The link expires in 1 hour.
        </p>

        <button
          type="button"
          onClick={() => {
            setSent(false)
            setEmail('')
          }}
          className="mt-4 text-xs text-slate-500 hover:text-slate-900 transition-colors"
        >
          Didn&apos;t receive it? Try again
        </button>
      </div>
    )
  }

  // ─── Form state ────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="email"
        type="email"
        label="Email"
        required
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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
        {isPending ? 'Sending…' : 'Send reset link'}
      </Button>
    </form>
  )
}