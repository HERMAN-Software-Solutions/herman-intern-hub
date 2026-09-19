'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  ChevronDown,
  X,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react'
import { updateInternStatus, type InternStatus } from './actions'
import { Button } from '@/components/ui/button'

const STATUS_LABEL: Record<InternStatus, string> = {
  onboarding: 'Onboarding',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  withdrawn: 'Withdrawn',
}

type ActionDef = {
  value: InternStatus
  label: string
  icon: React.ComponentType<{ className?: string }>
  confirmTitle: string
  confirmBody: (name: string) => string
  confirmButton: string
  danger?: boolean
}

// Actions offered for a given current status
function actionsFor(current: InternStatus): ActionDef[] {
  const ALL: ActionDef[] = [
    {
      value: 'active',
      label: 'Set active',
      icon: Play,
      confirmTitle: 'Set intern active?',
      confirmBody: (n) =>
        `${n} will regain full dashboard access. This should only be done if they are currently working.`,
      confirmButton: 'Set active',
    },
    {
      value: 'paused',
      label: 'Pause internship',
      icon: Pause,
      confirmTitle: 'Pause this internship?',
      confirmBody: (n) =>
        `${n} will lose access to their dashboard until reactivated. Their data stays intact.`,
      confirmButton: 'Pause',
    },
    {
      value: 'completed',
      label: 'Mark completed',
      icon: CheckCircle2,
      confirmTitle: 'Mark internship as completed?',
      confirmBody: (n) =>
        `${n} will become an alumnus. You can issue a certificate and experience letter after this.`,
      confirmButton: 'Mark completed',
    },
    {
      value: 'withdrawn',
      label: 'Mark withdrawn',
      icon: XCircle,
      confirmTitle: 'Mark as withdrawn?',
      confirmBody: (n) =>
        `${n} will be recorded as having left the program early. No certificate will be issued.`,
      confirmButton: 'Mark withdrawn',
      danger: true,
    },
    {
      value: 'onboarding',
      label: 'Revert to onboarding',
      icon: RotateCcw,
      confirmTitle: 'Revert to onboarding?',
      confirmBody: (n) =>
        `${n} will be sent back to the onboarding flow. Use this only to correct a mistake.`,
      confirmButton: 'Revert',
      danger: true,
    },
  ]

  // Which actions make sense from the current status
  switch (current) {
    case 'onboarding':
      // onboarding → active is NOT offered here; it happens via mentor assignment
      return ALL.filter((a) => a.value === 'withdrawn')
    case 'active':
      return ALL.filter((a) =>
        ['paused', 'completed', 'withdrawn'].includes(a.value)
      )
    case 'paused':
      return ALL.filter((a) =>
        ['active', 'completed', 'withdrawn'].includes(a.value)
      )
    case 'completed':
      return ALL.filter((a) => ['onboarding'].includes(a.value))
    case 'withdrawn':
      return ALL.filter((a) => ['onboarding'].includes(a.value))
  }
}

export function StatusControl({
  internId,
  internName,
  currentStatus,
}: {
  internId: string
  internName: string
  currentStatus: InternStatus
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState<ActionDef | null>(null)
  const [isPending, startTransition] = useTransition()

  const actions = actionsFor(currentStatus)

  function handleConfirm() {
    if (!pending) return
    startTransition(async () => {
      const res = await updateInternStatus(internId, pending.value)
      if ('error' in res) {
        toast.error(res.error)
        return
      }
      toast.success(`Status set to ${STATUS_LABEL[pending.value]}`)
      setPending(null)
      router.refresh()
    })
  }

  if (actions.length === 0) {
    return null
  }

  return (
    <>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center gap-1.5 text-sm bg-slate-900 hover:bg-slate-800 text-white font-medium px-3.5 py-2 rounded-lg transition-colors"
        >
          Change status
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[200px]">
              {actions.map((a) => {
                const Icon = a.icon
                return (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      setPending(a)
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                      a.danger
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    {a.label}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>

      {pending && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isPending) setPending(null)
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">
                {pending.confirmTitle}
              </h3>
              <button
                type="button"
                onClick={() => setPending(null)}
                disabled={isPending}
                className="text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                  {STATUS_LABEL[currentStatus]}
                </span>
                <span className="text-slate-400">→</span>
                <span
                  className={`px-2 py-0.5 rounded-full font-medium ${
                    pending.danger
                      ? 'bg-red-100 text-red-700'
                      : 'bg-slate-900 text-white'
                  }`}
                >
                  {STATUS_LABEL[pending.value]}
                </span>
              </div>

              <p className="text-sm text-slate-700">
                {pending.confirmBody(internName)}
              </p>
            </div>

            <div className="flex gap-2 justify-end p-5 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPending(null)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant={pending.danger ? 'danger' : 'primary'}
                size="sm"
                onClick={handleConfirm}
                loading={isPending}
              >
                {pending.confirmButton}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}