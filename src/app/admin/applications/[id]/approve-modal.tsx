'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Copy, Check, X } from 'lucide-react'
import { approveApplication } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'

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

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Lock body scroll while modal is open
  useEffect(() => {
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [])

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
        toast.error(res.error)
        return
      }

      const url = `${window.location.origin}/invite/${res.invitationToken}`
      setInvitationLink(url)
      toast.success(
        res.alreadyExisted ? 'Invitation already exists' : 'Invitation sent',
        {
          description: res.alreadyExisted
            ? 'A pending invitation was already created for this applicant.'
            : 'The applicant will receive an email shortly.',
        }
      )
      router.refresh()
    })
  }

  function copyLink() {
    if (!invitationLink) return
    navigator.clipboard.writeText(invitationLink)
    setCopied(true)
    toast.success('Link copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="approve-modal-title"
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
      onClick={(e) => {
        // Close when clicking the backdrop (not the modal content)
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <h2
              id="approve-modal-title"
              className="text-xl font-bold text-slate-900"
            >
              Approve {applicantName}
            </h2>
            <p className="text-sm text-slate-500 mt-1">{applicantEmail}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors -mt-1"
            aria-label="Close dialog"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {invitationLink ? (
          <div className="p-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-800 font-medium">
                  Invitation created
                </p>
                <p className="text-xs text-green-700 mt-0.5">
                  Email sent. You can also share this link directly.
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-3">
              Share this link with the applicant. It expires in 7 days.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 break-all text-xs font-mono text-slate-700 mb-4">
              {invitationLink}
            </div>

            <Button
              type="button"
              variant="primary"
              size="md"
              fullWidth
              onClick={copyLink}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy invitation link
                </>
              )}
            </Button>

            <button
              onClick={onClose}
              className="w-full text-slate-500 hover:text-slate-900 text-sm mt-3 transition-colors"
              type="button"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                name="startDate"
                type="date"
                label="Start date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                name="endDate"
                type="date"
                label="End date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <Select
              name="mentorId"
              label="Mentor (optional — can assign later)"
              value={mentorId}
              onChange={(e) => setMentorId(e.target.value)}
            >
              <option value="">— Select mentor —</option>
              {mentors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name ?? m.email}
                </option>
              ))}
            </Select>

            <Textarea
              name="welcome"
              label="Welcome message"
              rows={3}
              value={welcome}
              onChange={(e) => setWelcome(e.target.value)}
            />

            {error && (
              <div
                role="alert"
                className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"
              >
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleApprove}
                loading={isPending}
                className="flex-1"
              >
                {isPending ? 'Creating…' : 'Send invitation'}
              </Button>
            </div>
          </div>
        )}
      </div>
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