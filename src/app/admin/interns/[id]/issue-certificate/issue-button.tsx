'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { issueCertificate } from './actions'

export function IssueButton({ internId }: { internId: string }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleIssue() {
    if (
      !confirm(
        'Issue certificate for this intern? This generates a PDF and cannot be undone.'
      )
    )
      return

    setError(null)
    setSuccess(null)

    startTransition(async () => {
      const res = await issueCertificate(internId)
      if (res.error) {
        setError(res.error)
        return
      }
      setSuccess(`Certificate ${res.certificateId} issued (${res.score}/5.0)`)
      router.refresh()
    })
  }

  return (
    <div>
      <button
        onClick={handleIssue}
        disabled={isPending}
        className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        {isPending ? 'Generating PDFs…' : '🎓 Issue certificate'}
      </button>

      {error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
          ✅ {success}
        </div>
      )}
    </div>
  )
}