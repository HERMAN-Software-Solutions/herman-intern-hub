'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ApproveModal } from './approve-modal'
import { rejectApplication, markAsReviewing } from './actions'

type Mentor = { id: string; full_name: string | null; email: string }

export function ApplicationActions({
  applicationId,
  applicantName,
  applicantEmail,
  currentStatus,
  mentors,
  hasInvitation,
}: {
  applicationId: string
  applicantName: string
  applicantEmail: string
  currentStatus: string
  mentors: Mentor[]
  hasInvitation: boolean
}) {
  const router = useRouter()
  const [showApprove, setShowApprove] = useState(false)
  const [showReject, setShowReject] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleMarkReviewing() {
    startTransition(async () => {
      const res = await markAsReviewing(applicationId)
      if (res.error) setError(res.error)
      else router.refresh()
    })
  }

  function handleReject() {
    startTransition(async () => {
      const res = await rejectApplication(applicationId, rejectReason)
      if (res.error) setError(res.error)
      else {
        setShowReject(false)
        router.refresh()
      }
    })
  }

  const isFinal = currentStatus === 'accepted' || currentStatus === 'rejected'

  return (
    <div className="mt-8 border-t border-slate-200 pt-6">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
        Actions
      </h2>

      {isFinal ? (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600">
          This application is <strong>{currentStatus}</strong>. No further
          action needed.
        </div>
      ) : (
        <div className="flex gap-3">
          {currentStatus === 'pending' && (
            <button
              onClick={handleMarkReviewing}
              disabled={isPending}
              className="border border-slate-300 hover:border-slate-500 text-slate-700 font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              Mark as reviewing
            </button>
          )}

          <button
            onClick={() => setShowReject(true)}
            disabled={isPending}
            className="border border-red-300 hover:border-red-500 text-red-600 font-medium px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            Reject
          </button>

          <button
            onClick={() => setShowApprove(true)}
            disabled={isPending}
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 ml-auto"
          >
            {hasInvitation ? 'View invitation' : 'Approve & invite →'}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      {showApprove && (
        <ApproveModal
          applicationId={applicationId}
          applicantName={applicantName}
          applicantEmail={applicantEmail}
          mentors={mentors}
          onClose={() => setShowApprove(false)}
        />
      )}

      {showReject && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-slate-900">
              Reject application
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              This is internal only — the applicant won't see it.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              placeholder="Reason (optional)…"
              className="w-full mt-4 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowReject(false)}
                className="flex-1 border border-slate-300 text-slate-700 font-medium py-2.5 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                {isPending ? 'Rejecting…' : 'Reject application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}