'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { savePerformanceReview } from './actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function ReviewForm({
  internId,
  initial,
}: {
  internId: string
  initial: {
    mentorRating: number | null
    peerRating: number | null
    strengths: string
    improvements: string
    comments: string
  }
}) {
  const router = useRouter()
  const [mentorRating, setMentorRating] = useState(initial.mentorRating ?? 0)
  const [peerRating, setPeerRating] = useState(initial.peerRating ?? 0)
  const [strengths, setStrengths] = useState(initial.strengths)
  const [improvements, setImprovements] = useState(initial.improvements)
  const [comments, setComments] = useState(initial.comments)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    setError(null)
    setSuccess(false)

    if (mentorRating < 1) {
      setError('Please provide a mentor rating (1–5)')
      toast.error('Mentor rating is required')
      return
    }

    startTransition(async () => {
      const res = await savePerformanceReview({
        internId,
        mentorRating,
        peerRating: peerRating > 0 ? peerRating : null,
        strengths,
        improvements,
        comments,
      })

      if (res.error) {
        setError(res.error)
        toast.error(res.error)
        return
      }

      setSuccess(true)
      toast.success('Performance review saved')
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {/* Mentor rating */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Overall mentor rating <span className="text-red-500">*</span>
        </label>
        <RatingPicker value={mentorRating} onChange={setMentorRating} />
        <p className="text-xs text-slate-500 mt-3">
          1 = Needs improvement · 3 = Meets expectations · 5 = Outstanding
        </p>
      </div>

      {/* Peer rating */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Peer feedback rating{' '}
          <span className="text-slate-400">(optional)</span>
        </label>
        <RatingPicker value={peerRating} onChange={setPeerRating} allowNone />
      </div>

      {/* Strengths */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <Textarea
          name="strengths"
          label="Key strengths"
          rows={3}
          placeholder="e.g. Fast learner, strong problem-solving, collaborative…"
          value={strengths}
          onChange={(e) => setStrengths(e.target.value)}
        />
      </div>

      {/* Improvements */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <Textarea
          name="improvements"
          label="Areas for improvement"
          rows={3}
          placeholder="e.g. Test coverage, time estimation…"
          value={improvements}
          onChange={(e) => setImprovements(e.target.value)}
        />
      </div>

      {/* Comments */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <Textarea
          name="comments"
          label="Additional comments"
          rows={4}
          placeholder="Anything else you'd like to add…"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      {success && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
          ✅ Review saved
        </div>
      )}

      <Button
        type="button"
        variant="primary"
        size="md"
        fullWidth
        onClick={handleSubmit}
        loading={isPending}
      >
        {isPending ? 'Saving…' : 'Save performance review'}
      </Button>
    </div>
  )
}

function RatingPicker({
  value,
  onChange,
  allowNone,
}: {
  value: number
  onChange: (v: number) => void
  allowNone?: boolean
}) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`w-12 h-12 rounded-lg border-2 text-lg font-semibold transition-all ${
            value === n
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
          }`}
        >
          {n}
        </button>
      ))}
      {allowNone && value > 0 && (
        <button
          type="button"
          onClick={() => onChange(0)}
          className="ml-2 text-xs text-slate-500 hover:text-slate-900"
        >
          Clear
        </button>
      )}
    </div>
  )
}