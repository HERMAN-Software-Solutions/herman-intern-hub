'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { acceptInvitation } from './actions'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function AcceptForm({
  token,
  email,
  fullName,
  role,
}: {
  token: string
  email: string
  fullName: string | null
  role: string
}) {
  const router = useRouter()
  const supabase = createClient()

  const isMentor = role === 'mentor'

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agree, setAgree] = useState(false)
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
    if (!agree) {
      setError('You must accept the agreement')
      return
    }

    startTransition(async () => {
      const result = await acceptInvitation({
        token,
        password,
        agreementAccepted: true,
      })

      if (!result.success) {
        setError(result.error)
        return
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        router.push('/login')
        return
      }

      router.push(result.redirectTo)
      router.refresh()
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
      />

      <Input
        name="password"
        type="password"
        label="Password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="At least 8 characters"
        autoComplete="new-password"
      />

      <Input
        name="confirm"
        type="password"
        label="Confirm password"
        required
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Re-enter your password"
        autoComplete="new-password"
      />

      {/* Agreement */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-h-48 overflow-y-auto text-xs text-slate-600 leading-relaxed">
        <p className="font-semibold text-slate-900 mb-2">
          {isMentor
            ? 'HERMAN Mentor Agreement v1.0'
            : 'HERMAN Internship Agreement v1.0'}
        </p>
        <p className="mb-2">By accepting this invitation, you agree to:</p>
        <ul className="list-disc pl-4 space-y-1">
          {isMentor ? (
            <>
              <li>
                Provide honest, constructive feedback to assigned interns
              </li>
              <li>
                Review submissions and respond within a reasonable timeframe
              </li>
              <li>
                Track intern progress through the intern management system
              </li>
              <li>
                Keep client, company, and intern information confidential
              </li>
              <li>
                Represent HERMAN Software Solutions professionally at all times
              </li>
              <li>Not share your account credentials with anyone</li>
              <li>
                Notify the admin promptly if you can no longer mentor an
                assigned intern
              </li>
            </>
          ) : (
            <>
              <li>
                Behave professionally and respectfully toward all team members
              </li>
              <li>Keep client and company information confidential</li>
              <li>Work the hours agreed with your mentor</li>
              <li>Log your work daily in the portal</li>
              <li>Not share your account credentials with anyone</li>
              <li>
                Acknowledge that this is an unpaid learning opportunity unless
                otherwise agreed in writing for client projects
              </li>
              <li>Give reasonable notice if you must withdraw</li>
            </>
          )}
        </ul>
      </div>

      <label className="flex items-start gap-3 text-sm text-slate-700 cursor-pointer">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
          className="mt-0.5 w-4 h-4"
        />
        <span>
          {isMentor
            ? 'I have read and agree to the mentor terms above'
            : 'I have read and agree to the terms above'}
        </span>
      </label>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
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
        {isPending
          ? 'Creating your account…'
          : isMentor
            ? 'Create mentor account'
            : 'Create account'}
      </Button>
    </form>
  )
}