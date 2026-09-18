'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Copy, Check, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { inviteMentor } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

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

export function InviteForm() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [techStack, setTechStack] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [invitationLink, setInvitationLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  function toggleTech(name: string) {
    setTechStack((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    )
  }

  function handleSubmit() {
    setError(null)

    if (!fullName.trim()) {
      setError('Full name is required')
      return
    }
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    startTransition(async () => {
      const res = await inviteMentor({
        fullName,
        email,
        bio,
        techStack,
      })

      if (res.error) {
        setError(res.error)
        toast.error(res.error)
        return
      }

      const url = `${window.location.origin}/invite/${res.invitationToken}`
      setInvitationLink(url)
      toast.success(
        res.alreadyExisted ? 'Invitation already exists' : 'Invitation sent',
        {
          description: res.alreadyExisted
            ? 'A pending invitation already exists for this email.'
            : 'The mentor will receive an email shortly.',
        }
      )
      router.refresh()
    })
  }

  function copyLink() {
    if (!invitationLink) return
    navigator.clipboard.writeText(invitationLink)
    setCopied(true)
    toast.success('Link copied')
    setTimeout(() => setCopied(false), 2000)
  }

  // ─── Success state ─────────────────────────────────
  if (invitationLink) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-5 flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-green-800 font-medium">
              Invitation created
            </p>
            <p className="text-xs text-green-700 mt-0.5">
              Email sent. You can also share this link directly.
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 mb-3">
          Share this link with the mentor. It expires in 7 days.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 break-all text-xs font-mono text-slate-700 mb-4">
          {invitationLink}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={copyLink}
            className="flex-1"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy link
              </>
            )}
          </Button>

          <Link
            href="/admin/mentors"
            className="flex-1 text-center border border-slate-300 hover:border-slate-400 text-slate-700 font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
          >
            Back to mentors
          </Link>
        </div>
      </div>
    )
  }

  // ─── Form state ────────────────────────────────────
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
      <Input
        name="fullName"
        label="Full name"
        required
        placeholder="John Doe"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />

      <Input
        name="email"
        type="email"
        label="Email"
        required
        placeholder="mentor@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <Textarea
        name="bio"
        label="Short bio (optional)"
        rows={3}
        placeholder="A brief introduction about their experience and expertise…"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Areas of expertise (optional)
        </label>
        <p className="text-xs text-slate-500 mb-3">
          Select technologies this mentor can guide interns on.
        </p>
        <div className="flex flex-wrap gap-2">
          {TECH_STACKS.map((tech) => {
            const selected = techStack.includes(tech)
            return (
              <button
                key={tech}
                type="button"
                onClick={() => toggleTech(tech)}
                className={`px-3.5 py-2 rounded-full text-sm border transition-all ${
                  selected
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500 hover:bg-slate-50'
                }`}
              >
                {tech}
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Link
          href="/admin/mentors"
          className="flex-1 text-center border border-slate-300 hover:border-slate-400 text-slate-700 font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
        >
          Cancel
        </Link>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={handleSubmit}
          loading={isPending}
          className="flex-1"
        >
          {isPending ? 'Sending…' : 'Send invitation'}
        </Button>
      </div>
    </div>
  )
}