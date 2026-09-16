'use client'

import { useState, useTransition } from 'react'
import { checkApplicationStatus } from '../actions'

type Status = {
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'withdrawn'
  submitted_at: string
  name: string
} | null

export function StatusForm() {
  const [email, setEmail] = useState('')
  const [result, setResult] = useState<Status>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setResult(null)

    startTransition(async () => {
      const res = await checkApplicationStatus(email)
      if (res.error) {
        setError(res.error)
        return
      }
      setResult(res.data ?? null)
    })
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none"
          placeholder="you@example.com"
        />
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          {isPending ? 'Checking…' : 'Check status'}
        </button>
      </form>

      {error && (
        <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 border-t border-slate-100 pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Status</span>
            <StatusBadge status={result.status} />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">Submitted</span>
            <span className="text-sm text-slate-900">
              {new Date(result.submitted_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-4">
            {statusMessage(result.status)}
          </p>
        </div>
      )}
    </>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    reviewing: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    withdrawn: 'bg-slate-100 text-slate-600',
  }
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
        styles[status] ?? 'bg-slate-100 text-slate-600'
      }`}
    >
      {status}
    </span>
  )
}

function statusMessage(status: string): string {
  switch (status) {
    case 'pending':
      return "Your application is waiting to be reviewed. We'll email you when there's an update."
    case 'reviewing':
      return 'We are currently reviewing your application. Hang tight!'
    case 'accepted':
      return "Congratulations! We've accepted your application. Check your email for next steps."
    case 'rejected':
      return 'Unfortunately, we are unable to offer you a position at this time. We encourage you to apply again in the future.'
    case 'withdrawn':
      return 'This application was withdrawn.'
    default:
      return ''
  }
}