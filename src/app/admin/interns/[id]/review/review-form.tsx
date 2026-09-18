'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { savePerformanceReview } from './actions'
import { Button } from '@/components/ui/button'

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
        <label
          htmlFor="mentor-rating-group"
          className="block text-sm font-medium text-slate-700 mb-3"
        >
          Overall mentor rating <span className="text-red-500">*</span>
        </label>
        <RatingPicker
          id="mentor-rating-group"
          value={mentorRating}
          onChange={setMentorRating}
          name="Mentor rating"
        />
        <p className="text-xs text-slate-500 mt-3">
          1 = Needs improvement · 3 = Meets expectations · 5 = Outstanding
        </p>
      </div>

      {/* Peer rating */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <label
          htmlFor="peer-rating-group"
          className="block text-sm font-medium text-slate-700 mb-3"
        >
          Peer feedback rating <span className="text-slate-400">(optional)</span>
        </label>
        <RatingPicker
          id="peer-rating-group"
          value={peerRating}
          onChange={setPeerRating}
          allowNone
          name="Peer rating"
        />
      </div>

      {/* Strengths */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <label
          htmlFor="review-strengths"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Key strengths
        </label>
        <textarea
          id="review-strengths"
          value={strengths}
          onChange={(e) => setStrengths(e.target.value)}
          rows={3}
          placeholder="e.g. Fast learner, strong problem-solving, collaborative…"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm"
        />
      </div>

      {/* Areas for improvement */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <label
          htmlFor="review-improvements"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Areas for improvement
        </label>
        <textarea
          id="review-improvements"
          value={improvements}
          onChange={(e) => setImprovements(e.target.value)}
          rows={3}
          placeholder="e.g. Test coverage, time estimation…"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm"
        />
      </div>

      {/* Additional comments */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <label
          htmlFor="review-comments"
          className="block text-sm font-medium text-slate-700 mb-2"
        >
          Additional comments
        </label>
        <textarea
          id="review-comments"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={4}
          placeholder="Anything else you'd like to add…"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3"
        >
          ✅ Review saved
        </div>
      )}

      <Button
        type="button"
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleSubmit}
        loading={isPending}
      >
        {isPending ? 'Saving…' : 'Save performance review'}
      </Button>
    </div>
  )
}

// ─── Rating picker ─────────────────────────────────────

function RatingPicker({
  id,
  name,
  value,
  onChange,
  allowNone,
}: {
  id?: string
  name?: string
  value: number
  onChange: (v: number) => void
  allowNone?: boolean
}) {
  return (
    <div
      id={id}
      role="radiogroup"
      aria-label={name ?? 'Rating'}
      className="flex gap-2 flex-wrap"
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const selected = value === n
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`Rate ${n} out of 5`}
            onClick={() => onChange(n)}
            className={`w-12 h-12 rounded-lg border-2 text-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${
              selected
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
            }`}
          >
            {n}
          </button>
        )
      })}
      {allowNone && value > 0 && (
        <button
          type="button"
          onClick={() => onChange(0)}
          aria-label={`Clear ${name ?? 'rating'}`}
          className="ml-2 text-xs text-slate-500 hover:text-slate-900 transition-colors self-center"
        >
          Clear
        </button>
      )}
    </div>
  )
}