'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ShieldAlert, ShieldCheck } from 'lucide-react'
import { revokeDocument, restoreDocument } from './actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function DocumentActions({
  documentId,
  verified,
  type,
}: {
  documentId: string
  verified: boolean
  type: string
}) {
  const router = useRouter()
  const [showRevokeForm, setShowRevokeForm] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleRevoke() {
    setError(null)
    if (reason.trim().length < 5) {
      setError('Please provide a reason (min 5 characters)')
      toast.error('Reason required')
      return
    }

    startTransition(async () => {
      const res = await revokeDocument(documentId, reason)
      if (res.error) {
        setError(res.error)
        toast.error(res.error)
        return
      }
      toast.success('Document revoked', {
        description: 'It will show as unverified when checked.',
      })
      setShowRevokeForm(false)
      setReason('')
      router.refresh()
    })
  }

  function handleRestore() {
    if (!confirm('Restore this document as verified?')) return

    startTransition(async () => {
      const res = await restoreDocument(documentId)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Document restored')
        router.refresh()
      }
    })
  }

  // Already revoked — show restore button
  if (!verified) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <div className="flex items-start gap-3 mb-4">
          <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-red-900 text-sm">
              This document has been revoked
            </div>
            <p className="text-xs text-red-700 mt-0.5">
              Public verification will show it as invalid. The record is kept
              for audit purposes.
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleRestore}
          loading={isPending}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Restore as verified
        </Button>
      </div>
    )
  }

  // Active document — show revoke form
  if (!showRevokeForm) {
    return (
      <Button
        type="button"
        variant="danger"
        size="md"
        onClick={() => setShowRevokeForm(true)}
      >
        <ShieldAlert className="w-4 h-4" />
        Revoke {type === 'certificate' ? 'certificate' : 'document'}
      </Button>
    )
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-medium text-red-900 text-sm">
            Revoke this document?
          </div>
          <p className="text-xs text-red-700 mt-0.5">
            This will mark the document as unverified. Public verification
            (via QR code or URL) will show it as invalid.
          </p>
        </div>
      </div>

      <Textarea
        name="reason"
        label="Reason (recorded in audit log)"
        required
        rows={3}
        placeholder="e.g. Issued in error, intern withdrew before completion…"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />

      {error && (
        <div className="mt-3 text-sm text-red-600">{error}</div>
      )}

      <div className="flex gap-2 mt-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setShowRevokeForm(false)
            setReason('')
            setError(null)
          }}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={handleRevoke}
          loading={isPending}
        >
          Confirm revoke
        </Button>
      </div>
    </div>
  )
}