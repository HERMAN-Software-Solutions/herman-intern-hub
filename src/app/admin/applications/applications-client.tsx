'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ChevronRight, X } from 'lucide-react'
import { StatusBadge } from '../_components/status-badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { bulkRejectApplications } from './bulk-actions'

type App = {
  id: string
  name: string
  email: string
  university: string | null
  course: string | null
  tech_stack_interest: string[] | null
  status: string
  submitted_at: string
}

export function ApplicationsClient({ applications }: { applications: App[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirming, setConfirming] = useState(false)
  const [reason, setReason] = useState('')
  const [isPending, startTransition] = useTransition()

  const selectableIds = applications
    .filter((a) => a.status !== 'rejected' && a.status !== 'accepted')
    .map((a) => a.id)

  const allSelected =
    selectableIds.length > 0 && selectableIds.every((id) => selected.has(id))
  const someSelected = selected.size > 0

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected(() => {
      if (allSelected) return new Set()
      return new Set(selectableIds)
    })
  }

  function clear() {
    setSelected(new Set())
    setConfirming(false)
    setReason('')
  }

  function handleConfirm() {
    const ids = Array.from(selected)
    startTransition(async () => {
      const res = await bulkRejectApplications(ids, reason)
      if ('error' in res) {
        toast.error(res.error)
        return
      }
      toast.success(
        `${res.rejected} application${res.rejected === 1 ? '' : 's'} rejected` +
          (res.skipped > 0 ? ` · ${res.skipped} skipped` : '')
      )
      clear()
      router.refresh()
    })
  }

  return (
    <>
      {/* Mobile: cards */}
      <div className="sm:hidden space-y-3">
        {applications.map((app) => {
          const selectable =
            app.status !== 'rejected' && app.status !== 'accepted'
          const isSelected = selected.has(app.id)
          return (
            <div
              key={app.id}
              className={`relative bg-white border rounded-xl p-4 transition-colors ${
                isSelected
                  ? 'border-blue-400 bg-blue-50/40'
                  : 'border-slate-200'
              }`}
            >
              {selectable && (
                <label className="absolute top-3 right-3 z-10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(app.id)}
                    className="w-5 h-5 accent-slate-900"
                    aria-label={`Select ${app.name}`}
                  />
                </label>
              )}
              <Link
                href={`/admin/applications/${app.id}`}
                className="block pr-8"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <div className="font-medium text-slate-900 truncate">
                      {app.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {app.email}
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  {app.university}
                  {app.course && ` · ${app.course}`}
                </div>
                <div className="text-[11px] text-slate-400 mt-2">
                  {new Date(app.submitted_at).toLocaleDateString()}
                </div>
              </Link>
            </div>
          )
        })}
      </div>

      {/* Desktop: table */}
      <Card padding="none" className="hidden sm:block overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-left text-xs uppercase tracking-wider">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  disabled={selectableIds.length === 0}
                  className="w-4 h-4 accent-slate-900 cursor-pointer disabled:cursor-not-allowed"
                  aria-label="Select all"
                />
              </th>
              <th className="px-4 py-3">Applicant</th>
              <th className="px-4 py-3">University</th>
              <th className="px-4 py-3">Tech interest</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => {
              const selectable =
                app.status !== 'rejected' && app.status !== 'accepted'
              const isSelected = selected.has(app.id)
              const techCount = app.tech_stack_interest?.length ?? 0
              const techList = app.tech_stack_interest ?? []
              return (
                <tr
                  key={app.id}
                  className={`border-t border-slate-100 transition-colors ${
                    isSelected ? 'bg-blue-50/40' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="px-4 py-3">
                    {selectable ? (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggle(app.id)}
                        className="w-4 h-4 accent-slate-900 cursor-pointer"
                        aria-label={`Select ${app.name}`}
                      />
                    ) : (
                      <span className="inline-block w-4 h-4" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/applications/${app.id}`}
                      className="font-medium text-slate-900 hover:text-blue-600 transition-colors"
                    >
                      {app.name}
                    </Link>
                    <div className="text-xs text-slate-500">{app.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {app.university}
                    <div className="text-xs text-slate-400">{app.course}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {techList.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                        >
                          {t}
                        </span>
                      ))}
                      {techCount > 3 && (
                        <span className="text-xs text-slate-400">
                          +{techCount - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {new Date(app.submitted_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-slate-300">
                    <Link href={`/admin/applications/${app.id}`}>
                      <ChevronRight className="w-4 h-4 hover:text-slate-500 transition-colors" />
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>

      {/* Floating bulk bar */}
      {someSelected && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-800 px-4 py-3 flex items-center gap-4">
          <span className="text-sm">
            <strong>{selected.size}</strong> selected
          </span>
          <button
            type="button"
            onClick={clear}
            className="text-xs text-slate-300 hover:text-white transition-colors"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-3.5 py-1.5 rounded-lg transition-colors"
          >
            Reject selected
          </button>
        </div>
      )}

      {/* Confirm modal */}
      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isPending) setConfirming(false)
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">
                Reject {selected.size} application
                {selected.size === 1 ? '' : 's'}?
              </h3>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={isPending}
                className="text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-sm text-slate-700">
                Each applicant will receive a rejection email. This cannot be
                undone from here.
              </p>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                  Reason (internal only)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Optional — not shown to applicants"
                  disabled={isPending}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none text-sm disabled:bg-slate-50"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end p-5 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirming(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleConfirm}
                loading={isPending}
              >
                Reject {selected.size}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}