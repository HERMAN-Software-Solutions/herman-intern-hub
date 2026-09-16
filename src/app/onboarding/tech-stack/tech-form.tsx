'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveTechStacks } from './actions'

type TechStack = { id: string; name: string; category: string }
type Selection = { proficiency: string; is_primary: boolean }

const PROFICIENCY = ['beginner', 'intermediate', 'advanced']

export function TechForm({
  techStacks,
  initialSelections,
}: {
  techStacks: TechStack[]
  initialSelections: Record<string, Selection>
}) {
  const router = useRouter()
  const [selections, setSelections] =
    useState<Record<string, Selection>>(initialSelections)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function toggle(id: string) {
    setSelections((prev) => {
      const next = { ...prev }
      if (next[id]) {
        delete next[id]
      } else {
        next[id] = { proficiency: 'beginner', is_primary: false }
      }
      return next
    })
    setError(null)
  }

  function setProficiency(id: string, proficiency: string) {
    setSelections((prev) => ({
      ...prev,
      [id]: { ...prev[id], proficiency },
    }))
  }

  function setPrimary(id: string) {
    setSelections((prev) => {
      const next: Record<string, Selection> = {}
      for (const k of Object.keys(prev)) {
        next[k] = { ...prev[k], is_primary: k === id }
      }
      return next
    })
  }

  const grouped = techStacks.reduce<Record<string, TechStack[]>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = []
    acc[t.category].push(t)
    return acc
  }, {})

  function handleSubmit() {
    const list = Object.entries(selections).map(([id, s]) => ({
      tech_stack_id: id,
      proficiency: s.proficiency,
      is_primary: s.is_primary,
    }))

    if (list.length === 0) {
      setError('Select at least one tech stack')
      return
    }

    startTransition(async () => {
      const res = await saveTechStacks(list)
      if (res.error) {
        setError(res.error)
        return
      }
      router.push('/onboarding/pending')
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, stacks]) => (
        <div key={category}>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            {category}
          </h3>
          <div className="space-y-2">
            {stacks.map((tech) => {
              const selected = !!selections[tech.id]
              const s = selections[tech.id]
              return (
                <div
                  key={tech.id}
                  className={`border rounded-lg p-3 transition-colors ${
                    selected
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggle(tech.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-slate-900">
                        {tech.name}
                      </span>
                    </label>

                    {selected && (
                      <div className="flex items-center gap-2">
                        <select
                          value={s.proficiency}
                          onChange={(e) =>
                            setProficiency(tech.id, e.target.value)
                          }
                          className="text-xs border border-slate-300 rounded px-2 py-1 bg-white"
                        >
                          {PROFICIENCY.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                        <label className="flex items-center gap-1 text-xs text-slate-600 cursor-pointer">
                          <input
                            type="radio"
                            name="primary"
                            checked={s.is_primary}
                            onChange={() => setPrimary(tech.id)}
                          />
                          Primary
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium py-2.5 rounded-lg transition-colors"
      >
        {isPending ? 'Saving…' : 'Save & continue →'}
      </button>
    </div>
  )
}