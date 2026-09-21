'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { issueCertificate } from './actions'

const COMMON_TECHS = [
  'React',
  'Next.js',
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
  'Tailwind CSS',
  'Full-Stack Development',
  'Software Development',
]

export function IssueButton({
  internId,
  defaultTech = 'Software Development',
}: {
  internId: string
  defaultTech?: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [tech, setTech] = useState(defaultTech)
  const [customTech, setCustomTech] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleOpen() {
    setOpen(true)
    setError(null)
    setSuccess(null)
  }

  function handleClose() {
    if (isPending) return
    setOpen(false)
    setError(null)
  }

  function handleIssue() {
    setError(null)

    const finalTech = tech === 'custom' ? customTech.trim() : tech
    if (!finalTech) {
      setError('Please select or enter a tech stack')
      return
    }

    startTransition(async () => {
      const res = await issueCertificate({
        internId,
        techStack: finalTech,
        notes: notes.trim() || null,
      })
      if ('error' in res) {
        setError(res.error)
        return
      }
      setSuccess(`Certificate ${res.certificateId} issued (${res.score}/5.0)`)
      setTimeout(() => {
        setOpen(false)
        router.refresh()
      }, 1200)
    })
  }

  return (
    <div>
      <button
        onClick={handleOpen}
        className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
      >
        🎓 Issue certificate
      </button>

      {success && !open && (
        <div className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
          ✅ {success}
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose()
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">
                Issue certificate
              </h3>
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-slate-600">
                Confirm the details that will appear on the certificate and
                experience letter.
              </p>

              {/* Tech stack */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Tech stack the intern worked on
                </label>
                <select
                  value={tech}
                  onChange={(e) => setTech(e.target.value)}
                  disabled={isPending}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 disabled:bg-slate-50"
                >
                  {COMMON_TECHS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                  <option value="custom">Other (specify below)</option>
                </select>
              </div>

              {tech === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-1.5">
                    Custom tech stack
                  </label>
                  <input
                    type="text"
                    value={customTech}
                    onChange={(e) => setCustomTech(e.target.value)}
                    placeholder="e.g. Vue.js + Firebase"
                    disabled={isPending}
                    className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 disabled:bg-slate-50"
                  />
                </div>
              )}

              {/* Optional notes for highlights */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Additional highlights (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Optional: add custom highlights or achievements. If left blank, the system uses the intern's completed tasks marked as 'highlight'."
                  disabled={isPending}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 disabled:bg-slate-50"
                />
                <p className="text-xs text-slate-500 mt-1">
                  One per line. These appear under "Key Contributions" on the
                  certificate.
                </p>
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                  ✅ {success}
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end p-5 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleIssue}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white rounded-lg transition-colors"
              >
                {isPending ? 'Generating PDFs…' : 'Issue certificate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}