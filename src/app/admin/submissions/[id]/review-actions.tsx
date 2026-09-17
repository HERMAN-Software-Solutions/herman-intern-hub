'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { approveSubmission, requestRevision } from './actions'

export function ReviewActions({
  submissionId,
  currentStatus,
}: {
  submissionId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [feedback, setFeedback] = useState('')
  const [mode, setMode] = useState<'idle' | 'approve' | 'revision'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleApprove() {
    setError(null)
    startTransition(async () => {
      const res = await approveSubmission(submissionId, feedback)
      if (res.error) {
        setError(res.error)
        toast.error(res.error)
      } else {
        setMode('idle')
        setFeedback('')
        toast.success('Submission approved', {
          description: 'Task marked as complete. The intern has been notified.',
        })
        router.refresh()
      }
    })
  }

  function handleRequestRevision() {
    setError(null)
    if (feedback.trim().length < 10) {
      const msg = 'Please provide clear feedback (min 10 characters)'
      setError(msg)
      toast.error(msg)
      return
    }
    startTransition(async () => {
      const res = await requestRevision(submissionId, feedback)
      if (res.error) {
        setError(res.error)
        toast.error(res.error)
      } else {
        setMode('idle')
        setFeedback('')
        toast.success('Revision requested', {
          description: 'The intern has been notified.',
        })
        router.refresh()
      }
    })
  }

  // Already resolved — show status
  if (currentStatus === 'approved') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-sm text-green-800">
        ✅ This submission was approved. Task marked as done.
      </div>
    )
  }

  if (currentStatus === 'needs_revision') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <p className="text-sm text-red-800 mb-3">
          ⚠️ Revisions were requested. Waiting for the intern to resubmit.
        </p>
        <button
          onClick={() => setMode('approve')}
          className="text-xs text-red-700 hover:text-red-900 font-medium"
        >
          Actually, approve this submission →
        </button>

        {mode === 'approve' && (
          <div className="mt-4">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Optional note…"
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setMode('idle')}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={isPending}
                className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded"
              >
                {isPending ? 'Approving…' : 'Confirm approval'}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
        Review this submission
      </h2>

      {mode === 'idle' && (
        <div className="flex gap-3">
          <button
            onClick={() => setMode('approve')}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
          >
            ✅ Approve
          </button>
          <button
            onClick={() => setMode('revision')}
            className="flex-1 border border-red-300 hover:border-red-500 text-red-600 font-medium py-2.5 rounded-lg transition-colors text-sm"
          >
            ⚠️ Request revision
          </button>
        </div>
      )}

      {mode === 'approve' && (
        <div>
          <p className="text-sm text-slate-600 mb-3">
            Approve this submission and mark the task as done.
          </p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Optional note for the intern…"
            rows={3}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm"
          />
          <div className="flex gap-3 mt-3">
            <button
              onClick={() => setMode('idle')}
              className="flex-1 border border-slate-300 text-slate-700 font-medium py-2 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              disabled={isPending}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-medium py-2 rounded-lg text-sm transition-colors"
            >
              {isPending ? 'Approving…' : 'Confirm approval'}
            </button>
          </div>
        </div>
      )}

      {mode === 'revision' && (
        <div>
          <p className="text-sm text-slate-600 mb-3">
            Explain what needs to change. The intern will see this.
          </p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="e.g. Please add error handling to the login flow…"
            rows={5}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm"
          />
          <div className="flex gap-3 mt-3">
            <button
              onClick={() => setMode('idle')}
              className="flex-1 border border-slate-300 text-slate-700 font-medium py-2 rounded-lg text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleRequestRevision}
              disabled={isPending}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium py-2 rounded-lg text-sm transition-colors"
            >
              {isPending ? 'Sending…' : 'Request revision'}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}
    </div>
  )
}