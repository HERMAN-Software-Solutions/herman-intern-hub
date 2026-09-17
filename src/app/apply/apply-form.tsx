'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { submitApplication } from './actions'

type TechStack = {
  id: string
  name: string
  category: string
}

type FormData = {
  name: string
  email: string
  phone: string
  university: string
  course: string
  year_of_study: string
  tech_stack_interest: string[]
  portfolio_url: string
  message: string
}

const INITIAL: FormData = {
  name: '',
  email: '',
  phone: '',
  university: '',
  course: '',
  year_of_study: '',
  tech_stack_interest: [],
  portfolio_url: '',
  message: '',
}

const TECH_STACKS: TechStack[] = [
  { id: 'React', name: 'React', category: 'frontend' },
  { id: 'Next.js', name: 'Next.js', category: 'frontend' },
  { id: 'Tailwind CSS', name: 'Tailwind CSS', category: 'frontend' },
  { id: 'Node.js', name: 'Node.js', category: 'backend' },
  { id: 'Express', name: 'Express', category: 'backend' },
  { id: 'Python', name: 'Python', category: 'backend' },
  { id: 'Django', name: 'Django', category: 'backend' },
  { id: 'PostgreSQL', name: 'PostgreSQL', category: 'database' },
  { id: 'MongoDB', name: 'MongoDB', category: 'database' },
  { id: 'React Native', name: 'React Native', category: 'mobile' },
  { id: 'Flutter', name: 'Flutter', category: 'mobile' },
  { id: 'Docker', name: 'Docker', category: 'devops' },
  { id: 'AWS', name: 'AWS', category: 'devops' },
]

const YEARS = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Graduate']

export function ApplyForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<FormData>(INITIAL)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function update<K extends keyof FormData>(key: K, value: FormData[K]) {
    setData((prev) => ({ ...prev, [key]: value }))
    setError(null)
  }

  function toggleTech(name: string) {
    setData((prev) => ({
      ...prev,
      tech_stack_interest: prev.tech_stack_interest.includes(name)
        ? prev.tech_stack_interest.filter((t) => t !== name)
        : [...prev.tech_stack_interest, name],
    }))
  }

  function validateStep(current: number): string | null {
    if (current === 1) {
      if (!data.name.trim()) return 'Please enter your full name'
      if (!data.email.trim()) return 'Please enter your email'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        return 'Please enter a valid email'
    }
    if (current === 2) {
      if (!data.university.trim()) return 'Please enter your university'
      if (!data.course.trim()) return 'Please enter your course'
      if (!data.year_of_study) return 'Please select your year of study'
    }
    if (current === 3) {
      if (data.tech_stack_interest.length === 0)
        return 'Please select at least one tech stack'
    }
    if (current === 4) {
      if (!data.message.trim() || data.message.trim().length < 20)
        return 'Please write at least 20 characters'
    }
    return null
  }

  function next() {
    const err = validateStep(step)
    if (err) {
      setError(err)
      return
    }
    setStep((s) => Math.min(s + 1, 5))
  }

  function back() {
    setError(null)
    setStep((s) => Math.max(s - 1, 1))
  }

  function handleSubmit() {
    const err = validateStep(4)
    if (err) {
      setError(err)
      return
    }

    startTransition(async () => {
      const result = await submitApplication(data)
      if (result.error) {
        setError(result.error)
        toast.error(result.error)
        return
      }
      toast.success('Application submitted!', {
        description: "We'll review it within 5 working days.",
      })
      router.push('/apply/success')
    })
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>Step {step} of 5</span>
          <span>
            {step === 1 && 'Personal details'}
            {step === 2 && 'Academic info'}
            {step === 3 && 'Tech interests'}
            {step === 4 && 'About you'}
            {step === 5 && 'Review & submit'}
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-slate-900 transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1 — Personal */}
      {step === 1 && (
        <div className="space-y-4">
          <Field label="Full name" required>
            <input
              type="text"
              value={data.name}
              onChange={(e) => update('name', e.target.value)}
              className={inputClass}
              placeholder="Jane Nakato"
            />
          </Field>
          <Field label="Email" required>
            <input
              type="email"
              value={data.email}
              onChange={(e) => update('email', e.target.value)}
              className={inputClass}
              placeholder="jane@example.com"
            />
          </Field>
          <Field label="Phone (optional)">
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => update('phone', e.target.value)}
              className={inputClass}
              placeholder="+256 700 000 000"
            />
          </Field>
        </div>
      )}

      {/* Step 2 — Academic */}
      {step === 2 && (
        <div className="space-y-4">
          <Field label="University" required>
            <input
              type="text"
              value={data.university}
              onChange={(e) => update('university', e.target.value)}
              className={inputClass}
              placeholder="Makerere University"
            />
          </Field>
          <Field label="Course" required>
            <input
              type="text"
              value={data.course}
              onChange={(e) => update('course', e.target.value)}
              className={inputClass}
              placeholder="BSc Computer Science"
            />
          </Field>
          <Field label="Year of study" required>
            <select
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
          </Field>
        </div>
      )}

      {/* Step 3 — Tech stack */}
      {step === 3 && (
        <div>
          <p className="text-sm text-slate-600 mb-4">
            Select all the technologies you'd like to work with. You can learn
            as you go — no need to be an expert.
          </p>
          <div className="flex flex-wrap gap-2">
            {TECH_STACKS.map((tech) => {
              const selected = data.tech_stack_interest.includes(tech.name)
              return (
                <button
                  key={tech.id}
                  type="button"
                  onClick={() => toggleTech(tech.name)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    selected
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500'
                  }`}
                >
                  {tech.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Step 4 — About */}
      {step === 4 && (
        <div className="space-y-4">
          <Field label="Portfolio / GitHub (optional)">
            <input
              type="url"
              value={data.portfolio_url}
              onChange={(e) => update('portfolio_url', e.target.value)}
              className={inputClass}
              placeholder="https://github.com/yourhandle"
            />
          </Field>
          <Field label="Why do you want to intern with us?" required>
            <textarea
              value={data.message}
              onChange={(e) => update('message', e.target.value)}
              rows={5}
              className={inputClass}
              placeholder="Tell us about your goals, what you want to learn, and why HERMAN…"
            />
            <p className="text-xs text-slate-500 mt-1">
              {data.message.length} characters
            </p>
          </Field>
        </div>
      )}

      {/* Step 5 — Review */}
      {step === 5 && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600 mb-4">
            Review your application before submitting.
          </p>
          <ReviewRow label="Name" value={data.name} />
          <ReviewRow label="Email" value={data.email} />
          <ReviewRow label="Phone" value={data.phone || '—'} />
          <ReviewRow label="University" value={data.university} />
          <ReviewRow label="Course" value={data.course} />
          <ReviewRow label="Year" value={data.year_of_study} />
          <ReviewRow
            label="Tech interests"
            value={data.tech_stack_interest.join(', ')}
          />
          <ReviewRow label="Portfolio" value={data.portfolio_url || '—'} />
          <ReviewRow label="Message" value={data.message} multiline />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={back}
          disabled={step === 1}
          className="text-sm text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Back
        </button>

        {step < 5 ? (
          <button
            type="button"
            onClick={next}
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Continue →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            {isPending ? 'Submitting…' : 'Submit application'}
          </button>
        )}
      </div>
    </div>
  )
}

// — Small helpers —

const inputClass =
  'w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none text-slate-900'

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
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}

function ReviewRow({
  label,
  value,
  multiline,
}: {
  label: string
  value: string
  multiline?: boolean
}) {
  return (
    <div className="grid grid-cols-3 gap-4 py-2 border-b border-slate-100 last:border-0">
      <div className="text-sm text-slate-500">{label}</div>
      <div
        className={`col-span-2 text-sm text-slate-900 ${
          multiline ? 'whitespace-pre-wrap' : ''
        }`}
      >
        {value}
      </div>
    </div>
  )
}