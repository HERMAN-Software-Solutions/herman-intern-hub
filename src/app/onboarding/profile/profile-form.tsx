'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveProfile } from './actions'

const YEARS = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Graduate']

export function ProfileForm({
  initial,
}: {
  initial: {
    full_name: string
    phone: string
    university: string
    course: string
    year_of_study: string
    bio: string
  }
}) {
  const router = useRouter()
  const [data, setData] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function update<K extends keyof typeof data>(key: K, value: string) {
    setData((prev) => ({ ...prev, [key]: value }))
    setError(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const res = await saveProfile(data)
      if (res.error) {
        setError(res.error)
        return
      }
      router.push('/onboarding/tech-stack')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>
          Full name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={data.full_name}
          onChange={(e) => update('full_name', e.target.value)}
          className={inputClass}
          placeholder="Jane Nakato"
        />
      </div>

      <div>
        <label className={labelClass}>
          Phone <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          required
          value={data.phone}
          onChange={(e) => update('phone', e.target.value)}
          className={inputClass}
          placeholder="+256 700 000 000"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>
            University <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={data.university}
            onChange={(e) => update('university', e.target.value)}
            className={inputClass}
            placeholder="Makerere University"
          />
        </div>
        <div>
          <label className={labelClass}>
            Course <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={data.course}
            onChange={(e) => update('course', e.target.value)}
            className={inputClass}
            placeholder="BSc Computer Science"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Year of study <span className="text-red-500">*</span>
        </label>
        <select
          required
          value={data.year_of_study}
          onChange={(e) => update('year_of_study', e.target.value)}
          className={inputClass}
        >
          <option value="">Select…</option>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>
          Short bio <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          value={data.bio}
          onChange={(e) => update('bio', e.target.value)}
          rows={3}
          className={inputClass}
          placeholder="Tell us a bit about yourself…"
        />
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium py-2.5 rounded-lg transition-colors"
      >
        {isPending ? 'Saving…' : 'Save & continue →'}
      </button>
    </form>
  )
}

const labelClass = 'block text-sm font-medium text-slate-700 mb-1'
const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm'