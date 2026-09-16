'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { acceptInvitation } from './actions'

export function AcceptForm({
  token,
  email,
  fullName,
}: {
  token: string
  email: string
  fullName: string | null
}) {
  const router = useRouter()
  const supabase = createClient()

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
      // 1. Server action: create user + profile
      const result = await acceptInvitation({
        token,
        password,
        agreementAccepted: true,
      })

      if (!result.success) {
        setError(result.error)
        return
      }

      // 2. Sign in on the client with the password just set
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        // Account created but auto-login failed — send to login
        router.push('/login')
        return
      }

      // 3. Go to onboarding
      router.push(result.redirectTo)
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
          type="email"
          value={email}
          disabled
          className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          placeholder="At least 8 characters"
          autoComplete="new-password"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Confirm password
        </label>
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputClass}
          placeholder="Re-enter your password"
          autoComplete="new-password"
        />
      </div>

      {/* Agreement */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-h-48 overflow-y-auto text-xs text-slate-600 leading-relaxed">
        <p className="font-semibold text-slate-900 mb-2">
          HERMAN Internship Agreement v1.0
        </p>
        <p className="mb-2">
          By accepting this invitation, you agree to:
        </p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Behave professionally and respectfully toward all team members</li>
          <li>Keep client and company information confidential</li>
          <li>Work the hours agreed with your mentor</li>
          <li>Log your work daily in the portal</li>
          <li>Not share your account credentials with anyone</li>
          <li>
            Acknowledge that this is an unpaid learning opportunity unless
            otherwise agreed in writing for client projects
          </li>
          <li>Give reasonable notice if you must withdraw</li>
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
          I have read and agree to the terms above
        </span>
      </label>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium py-2.5 rounded-lg transition-colors"
      >
        {isPending ? 'Creating your account…' : 'Create account →'}
      </button>
    </form>
  )
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm'