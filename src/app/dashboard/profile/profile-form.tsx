'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateProfile } from './actions'

export function ProfileForm({
  initial,
  email,
  mentorName,
}: {
  initial: {
    full_name: string
    phone: string
    bio: string
    university: string
    course: string
    year_of_study: string
    directory_visible: boolean
  }
  email: string
  mentorName: string | null
}) {
  const router = useRouter()
  const [data, setData] = useState(initial)
  const [isPending, startTransition] = useTransition()

  function update<K extends keyof typeof data>(key: K, value: (typeof data)[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await updateProfile(data)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success('Profile updated')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Read-only info */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm">
        <div className="flex justify-between py-1">
          <span className="text-slate-500">Email</span>
          <span className="text-slate-900">{email}</span>
        </div>
        {mentorName && (
          <div className="flex justify-between py-1 border-t border-slate-200 mt-1 pt-2">
            <span className="text-slate-500">Mentor</span>
            <span className="text-slate-900">{mentorName}</span>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <Field label="Full name" required>
          <input
            type="text"
            required
            value={data.full_name}
            onChange={(e) => update('full_name', e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Phone">
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => update('phone', e.target.value)}
            className={inputClass}
            placeholder="+256 700 000 000"
          />
        </Field>

        <Field label="Bio">
          <textarea
            value={data.bio}
            onChange={(e) => update('bio', e.target.value)}
            rows={3}
            className={inputClass}
            placeholder="A short introduction…"
          />
        </Field>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Academic
        </h2>

        <Field label="University">
          <input
            type="text"
            value={data.university}
            onChange={(e) => update('university', e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Course">
          <input
            type="text"
            value={data.course}
            onChange={(e) => update('course', e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Year of study">
          <select
            value={data.year_of_study}
            onChange={(e) => update('year_of_study', e.target.value)}
            className={inputClass}
          >
            <option value="">Select…</option>
            {['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Graduate'].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.directory_visible}
            onChange={(e) => update('directory_visible', e.target.checked)}
            className="mt-1 w-4 h-4"
          />
          <div>
            <div className="text-sm font-medium text-slate-900">
              Show my profile in the public intern directory
            </div>
            <p className="text-xs text-slate-500 mt-1">
              When enabled, your name, university, and tech stack appear at
              /interns. You can disable anytime.
            </p>
          </div>
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

const inputClass =
  'w-full px-3.5 py-2.5 border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-colors text-sm'

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}