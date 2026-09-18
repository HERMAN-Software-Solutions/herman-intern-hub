'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { UserCheck, UserX, AlertTriangle } from 'lucide-react'
import { assignMentor, unassignMentor } from './actions'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

type Mentor = { id: string; full_name: string | null; email: string }

export function MentorAssignment({
  internId,
  currentMentor,
  mentors,
  canActivate,
}: {
  internId: string
  currentMentor: Mentor | null
  mentors: Mentor[]
  canActivate: boolean
}) {
  const router = useRouter()
  const [selected, setSelected] = useState(currentMentor?.id ?? '')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleAssign() {
    setError(null)
    setSuccess(false)

    if (!selected) {
      setError('Please select a mentor')
      toast.error('Please select a mentor')
      return
    }

    startTransition(async () => {
      const res = await assignMentor(internId, selected)
      if (res.error) {
        setError(res.error)
        toast.error(res.error)
        return
      }
      setSuccess(true)
      toast.success(
        canActivate
          ? 'Mentor assigned — intern is now active'
          : 'Mentor assigned',
        {
          description: canActivate
            ? 'They can now access their full dashboard.'
            : 'You can change this later.',
        }
      )
      router.refresh()
    })
  }

  function handleUnassign() {
    if (!confirm('Remove mentor assignment? This may also affect activation.'))
      return

    setError(null)
    startTransition(async () => {
      const res = await unassignMentor(internId)
      if (res.error) {
        setError(res.error)
        toast.error(res.error)
      } else {
        setSelected('')
        toast.success('Mentor removed')
        router.refresh()
      }
    })
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
        Mentor assignment
      </h2>

      {currentMentor ? (
        <div className="flex items-center justify-between mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
              {(currentMentor.full_name ?? currentMentor.email)
                .charAt(0)
                .toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="font-medium text-slate-900 text-sm truncate">
                {currentMentor.full_name ?? currentMentor.email}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {currentMentor.email}
              </div>
            </div>
          </div>
          <button
            onClick={handleUnassign}
            disabled={isPending}
            className="text-slate-400 hover:text-red-600 transition-colors flex-shrink-0 ml-2"
            aria-label="Remove mentor"
          >
            <UserX className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4 text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-amber-800">
            No mentor assigned. Assign one to activate the intern.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <Select
          name="mentorId"
          label={currentMentor ? 'Change mentor' : 'Select mentor'}
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">— Select mentor —</option>
          {mentors.map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name ?? m.email}
            </option>
          ))}
        </Select>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        {success && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            <span>
              Mentor assigned
              {canActivate ? ' — intern is now active!' : ''}
            </span>
          </div>
        )}

        <Button
          type="button"
          variant="primary"
          size="md"
          fullWidth
          onClick={handleAssign}
          disabled={!selected || selected === currentMentor?.id}
          loading={isPending}
        >
          {isPending
            ? 'Saving…'
            : currentMentor
              ? 'Change mentor'
              : 'Assign mentor & activate'}
        </Button>
      </div>
    </div>
  )
}