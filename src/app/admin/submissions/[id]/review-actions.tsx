'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Check, X, RotateCcw, AlertTriangle } from 'lucide-react'
import { approveSubmission, requestRevision } from './actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

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

  // Already resolved
  if (currentStatus === 'approved') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-3">
        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-green-900 font-medium">
            Submission approved
          </p>
          <p className="text-xs text-green-700 mt-0.5">
            Task marked as done. The intern has been notified.
          </p>
        </div>
      </div>
    )
  }

  if (currentStatus === 'needs_revision') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-900 font-medium">
              Revisions requested
            </p>
            <p className="text-xs text-red-700 mt-0.5">
              Waiting for the intern to resubmit.
            </p>
          </div>
        </div>

        <button
          onClick={() => setMode('approve')}
          className="text-xs text-red-700 hover:text-red-900 font-medium underline-offset-2 hover:underline transition-colors"
        >
          Actually, approve this submission →
        </button>

        {mode === 'approve' && (
          <div className="mt-4 space-y-3">
            <Textarea
              name="feedback"
              label="Optional note"
              rows={3}
              placeholder="Any note for the intern…"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setMode('idle')}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="success"
                size="sm"
                onClick={handleApprove}
                loading={isPending}
              >
                <Check className="w-3.5 h-3.5" />
                Confirm approval
              </Button>
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
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="success"
            size="md"
            onClick={() => setMode('approve')}
            className="flex-1"
          >
            <Check className="w-4 h-4" />
            Approve
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            onClick={() => setMode('revision')}
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4" />
            Request revision
          </Button>
        </div>
      )}

      {mode === 'approve' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Approve this submission and mark the task as done.
          </p>

          <Textarea
            name="feedback"
            label="Optional note for the intern"
            rows={3}
            placeholder="e.g. Great work on the login flow!"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setMode('idle')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="success"
              size="md"
              onClick={handleApprove}
              loading={isPending}
              className="flex-1"
            >
              {isPending ? 'Approving…' : 'Confirm approval'}
            </Button>
          </div>
        </div>
      )}

      {mode === 'revision' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Explain what needs to change. The intern will see this.
          </p>

          <Textarea
            name="feedback"
            label="Feedback"
            required
            rows={5}
            placeholder="e.g. Please add error handling to the login flow…"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            hint={`${feedback.length} characters (min 10)`}
          />

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setMode('idle')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={handleRequestRevision}
              loading={isPending}
              className="flex-1"
            >
              {isPending ? 'Sending…' : 'Request revision'}
            </Button>
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