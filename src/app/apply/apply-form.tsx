'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { submitApplication } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'

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

const TECH_STACKS = [
  'React',
  'Next.js',
  'Tailwind CSS',
  'Node.js',
  'Express',
  'Python',
  'Django',
  'PostgreSQL',
  'MongoDB',
  'React Native',
  'Flutter',
  'Docker',
  'AWS',
]

const YEARS = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Graduate']

const STEP_LABELS = [
  'Personal details',
  'Academic info',
  'Tech interests',
  'About you',
  'Review & submit',
]

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
    setError(null)
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
      router.push('/apply/success?submitted=1')
    })
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <span>Step {step} of 5</span>
          <span>{STEP_LABELS[step - 1]}</span>
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
          <Input
            name="name"
            label="Full name"
            required
            placeholder="Jane Nakato"
            value={data.name}
            onChange={(e) => update('name', e.target.value)}
            autoComplete="name"
          />
          <Input
            name="email"
            type="email"
            label="Email"
            required
            placeholder="jane@example.com"
            value={data.email}
            onChange={(e) => update('email', e.target.value)}
            autoComplete="email"
          />
          <Input
            name="phone"
            type="tel"
            label="Phone (optional)"
            placeholder="+256 700 000 000"
            value={data.phone}
            onChange={(e) => update('phone', e.target.value)}
            autoComplete="tel"
          />
        </div>
      )}

      {/* Step 2 — Academic */}
      {step === 2 && (
        <div className="space-y-4">
          <Input
            name="university"
            label="University"
            required
            placeholder="Makerere University"
            value={data.university}
            onChange={(e) => update('university', e.target.value)}
          />
          <Input
            name="course"
            label="Course"
            required
            placeholder="BSc Computer Science"
            value={data.course}
            onChange={(e) => update('course', e.target.value)}
          />
          <Select
            name="year_of_study"
            label="Year of study"
            required
            value={data.year_of_study}
            onChange={(e) => update('year_of_study', e.target.value)}
          >
            <option value="">Select…</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </div>
      )}

      {/* Step 3 — Tech stack */}
      {step === 3 && (
        <div>
          <p className="text-sm text-slate-600 mb-4">
            Select all the technologies you&apos;d like to work with. You can
            learn as you go — no need to be an expert.
          </p>
          <div className="flex flex-wrap gap-2">
            {TECH_STACKS.map((tech) => {
              const selected = data.tech_stack_interest.includes(tech)
              return (
                <button
                  key={tech}
                  type="button"
                  onClick={() => toggleTech(tech)}
                  className={`px-3.5 py-2 rounded-full text-sm border transition-all ${
                    selected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {tech}
                </button>
              )
            })}
          </div>
          {data.tech_stack_interest.length > 0 && (
            <p className="text-xs text-slate-500 mt-4">
              Selected {data.tech_stack_interest.length}{' '}
              {data.tech_stack_interest.length === 1 ? 'stack' : 'stacks'}
            </p>
          )}
        </div>
      )}

      {/* Step 4 — About */}
      {step === 4 && (
        <div className="space-y-4">
          <Input
            name="portfolio_url"
            type="url"
            label="Portfolio / GitHub (optional)"
            placeholder="https://github.com/yourhandle"
            value={data.portfolio_url}
            onChange={(e) => update('portfolio_url', e.target.value)}
          />
          <Textarea
            name="message"
            label="Why do you want to intern with us?"
            required
            rows={5}
            placeholder="Tell us about your goals, what you want to learn, and why HERMAN…"
            value={data.message}
            onChange={(e) => update('message', e.target.value)}
            hint={`${data.message.length} characters (min 20)`}
          />
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
      <div className="mt-8 flex items-center justify-between gap-3">
        {step > 1 ? (
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={back}
            disabled={isPending}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={next}
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleSubmit}
            loading={isPending}
          >
            {isPending ? 'Submitting…' : 'Submit application'}
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Review row ───────────────────────────────────────

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
    <div className="grid grid-cols-3 gap-4 py-3 border-b border-slate-100 last:border-0">
      <div className="text-sm text-slate-500">{label}</div>
      <div
        className={`col-span-2 text-sm text-slate-900 ${
          multiline ? 'whitespace-pre-wrap' : ''
        }`}
      >
        {value || '—'}
      </div>
    </div>
  )
}