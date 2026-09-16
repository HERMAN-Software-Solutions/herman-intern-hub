'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { approveApplication } from './actions'

type Mentor = { id: string; full_name: string | null; email: string }

export function ApproveModal({
  applicationId,
  applicantName,
  applicantEmail,
  mentors,
  onClose,
}: {
  applicationId: string
  applicantName: string
  applicantEmail: string
  mentors: Mentor[]
  onClose: () => void
}) {
  const router = useRouter()
  const [startDate, setStartDate] = useState(defaultStart())
  const [endDate, setEndDate] = useState(defaultEnd())
  const [mentorId, setMentorId] = useState<string>('')
  const [welcome, setWelcome] = useState(
    `Hi ${applicantName}, welcome to HERMAN Software Solutions. We're excited to have you on board.`
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [invitationLink, setInvitationLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function handleApprove() {
    setError(null)
    startTransition(async () => {
      const res = await approveApplication({
        applicationId,
        startDate,
        endDate,
        mentorId: mentorId || null,
        welcomeMessage: welcome,
      })

      if (res.error) {
        setError(res.error)
        return
      }

      const url = `${window.location.origin}/invite/${res.invitationToken}`
      setInvitationLink(url)
      router.refresh()
    })
  }

  function copyLink() {
    if (!invitationLink) return
    navigator.clipboard.writeText(invitationLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">
            Approve {applicantName}
          </h2>
          <p className="text-sm text-slate-500 mt-1">{applicantEmail}</p>
        </div>

        {invitationLink ? (
          <div className="p-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800 font-medium">
                ✅ Invitation created
              </p>
            </div>
            <p className="text-sm text-slate-600 mb-3">
              Share this link with the applicant. It expires in 7 days.
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 break-all text-xs font-mono text-slate-700 mb-4">
              {invitationLink}
            </div>
            <button
              onClick={copyLink}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {copied ? '✓ Copied' : 'Copy invitation link'}
            </button>
            <button
              onClick={onClose}
              className="w-full text-slate-500 hover:text-slate-900 text-sm mt-3"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start date">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="End date">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Mentor (optional — can assign later)">
              <select
                value={mentorId}
                onChange={(e) => setMentorId(e.target.value)}
                className={inputClass}
              >
                <option value="">— Select mentor —</option>
                {mentors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name ?? m.email}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Welcome message">
              <textarea
                value={welcome}
                onChange={(e) => setWelcome(e.target.value)}
                rows={3}
                className={inputClass}
              />
            </Field>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={onClose}
                className="flex-1 border border-slate-300 hover:border-slate-500 text-slate-700 font-medium py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={isPending}
                className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium py-2.5 rounded-lg transition-colors"
              >
                {isPending ? 'Creating…' : 'Send invitation →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm'

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}

function defaultStart() {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  return d.toISOString().slice(0, 10)
}

function defaultEnd() {
  const d = new Date()
  d.setDate(d.getDate() + 7)
  d.setMonth(d.getMonth() + 3)
  return d.toISOString().slice(0, 10)
}