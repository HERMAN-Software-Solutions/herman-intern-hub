'use client'

import { useState, useTransition, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { X, Plus, Check } from 'lucide-react'
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
  'Git',
  'TypeScript',
  'JavaScript',
]

export function IssueButton({
  internId,
  defaultTech,
}: {
  internId: string
  defaultTech?: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  // Tech: multi-select from common + custom
  const [selected, setSelected] = useState<string[]>(
    defaultTech ? [defaultTech] : []
  )
  const [customInput, setCustomInput] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

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

  function toggleTech(tech: string) {
    setSelected((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    )
  }

  function addCustomTech() {
    const value = customInput.trim()
    if (!value) return
    if (!selected.includes(value)) {
      setSelected((prev) => [...prev, value])
    }
    setCustomInput('')
    setShowCustomInput(false)
  }

  function handleCustomKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCustomTech()
    } else if (e.key === 'Escape') {
      setCustomInput('')
      setShowCustomInput(false)
    }
  }

  function removeTech(tech: string) {
    setSelected((prev) => prev.filter((t) => t !== tech))
  }

  // Custom techs = selected ones that are NOT in COMMON_TECHS
  const customTechs = selected.filter((t) => !COMMON_TECHS.includes(t))

  function handleIssue() {
    setError(null)

    if (selected.length === 0) {
      setError('Select at least one tech stack')
      return
    }

    const techStack = selected.join(', ')

    startTransition(async () => {
      const res = await issueCertificate({
        internId,
        techStack,
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
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl max-h-[90vh] overflow-y-auto">
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

            <div className="p-5 space-y-5">
              <p className="text-sm text-slate-600">
                Confirm the details that will appear on the certificate and
                experience letter.
              </p>

              {/* Selected chips */}
              {selected.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  {selected.map((tech) => (
                    <span
                      key={tech}
                      className="inline-flex items-center gap-1 bg-slate-900 text-white text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-full"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTech(tech)}
                        disabled={isPending}
                        className="w-4 h-4 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-50"
                        aria-label={`Remove ${tech}`}
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Common tech chips */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Tech stack the intern worked on
                  <span className="text-slate-500 font-normal ml-1">
                    (select all that apply)
                  </span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_TECHS.map((tech) => {
                    const isSelected = selected.includes(tech)
                    return (
                      <button
                        key={tech}
                        type="button"
                        onClick={() => toggleTech(tech)}
                        disabled={isPending}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:opacity-50 ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        {tech}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Custom tech section */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Add a custom tech
                </label>

                {customTechs.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {customTechs.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs font-medium pl-2.5 pr-1.5 py-1 rounded-full"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => removeTech(tech)}
                          disabled={isPending}
                          className="w-4 h-4 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-50"
                          aria-label={`Remove ${tech}`}
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {showCustomInput ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyDown={handleCustomKeyDown}
                      placeholder="e.g. Vue.js + Firebase — press Enter to add"
                      disabled={isPending}
                      autoFocus
                      className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 disabled:bg-slate-50"
                    />
                    <button
                      type="button"
                      onClick={addCustomTech}
                      disabled={!customInput.trim() || isPending}
                      className="px-3 py-2 text-sm bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-lg transition-colors"
                    >
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCustomInput(true)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add custom tech
                  </button>
                )}
              </div>

              {/* Highlights */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-1.5">
                  Additional highlights (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Optional: add custom highlights or achievements. One per line."
                  disabled={isPending}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 disabled:bg-slate-50"
                />
                <p className="text-xs text-slate-500 mt-1">
                  One per line. These appear under "Key Contributions".
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
                disabled={isPending || selected.length === 0}
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