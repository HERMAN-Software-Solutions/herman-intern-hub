'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { assignMentor, unassignMentor } from './actions'

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
        canActivate ? 'Mentor assigned — intern is now active' : 'Mentor assigned',
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
    if (!confirm('Remove mentor assignment? This may also affect activation.')) return

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
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-medium text-slate-900">
              {currentMentor.full_name ?? currentMentor.email}
            </div>
            <div className="text-xs text-slate-500">{currentMentor.email}</div>
          </div>
          <button
            onClick={handleUnassign}
            disabled={isPending}
            className="text-xs text-red-600 hover:text-red-700 font-medium"
          >
            Remove
          </button>
        </div>
      ) : (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
          ⚠ No mentor assigned. Assign one to activate the intern.
        </p>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {currentMentor ? 'Change mentor' : 'Select mentor'}
          </label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none"
          >
            <option value="">— Select mentor —</option>
            {mentors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.full_name ?? m.email}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        {success && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
            ✅ Mentor assigned{canActivate ? ' — intern is now active!' : ''}
          </div>
        )}

        <button
          onClick={handleAssign}
          disabled={isPending || !selected || selected === currentMentor?.id}
          className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          {isPending
            ? 'Saving…'
            : currentMentor
              ? 'Change mentor'
              : 'Assign mentor & activate'}
        </button>
      </div>
    </div>
  )
}