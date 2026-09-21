'use client'

import { useState, useTransition, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { UserPlus, X, Check, Search } from 'lucide-react'
import {
  assignInternToProject,
  removeInternFromProject,
  bulkAssignInternsToProject,
} from './task-actions'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

type Intern = {
  id: string
  full_name: string | null
  email: string
  avatar_url: string | null
  status: string
}

type Assignment = {
  id: string
  intern_id: string
  role: string
  compensation_type: string
  intern: Intern | null
}

export function AssignmentPanel({
  projectId,
  assignments,
  availableInterns,
}: {
  projectId: string
  assignments: Assignment[]
  availableInterns: Intern[]
}) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [role, setRole] = useState<'lead' | 'contributor'>('contributor')
  const [compType, setCompType] = useState<'unpaid' | 'paid'>('unpaid')
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Filter by search
  const filteredInterns = useMemo(() => {
    if (!search.trim()) return availableInterns
    const q = search.toLowerCase()
    return availableInterns.filter(
      (i) =>
        (i.full_name ?? '').toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q)
    )
  }, [availableInterns, search])

  const allSelected =
    filteredInterns.length > 0 &&
    filteredInterns.every((i) => selectedIds.includes(i.id))

  function toggleOne(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function selectAll() {
    setSelectedIds(filteredInterns.map((i) => i.id))
  }

  function clearSelection() {
    setSelectedIds([])
  }

  function handleAssign() {
    setError(null)
    if (selectedIds.length === 0) {
      setError('Select at least one intern')
      return
    }

    startTransition(async () => {
      // Single intern → use the existing single action (faster, simpler)
      if (selectedIds.length === 1) {
        const res = await assignInternToProject({
          projectId,
          internId: selectedIds[0],
          role,
          compensationType: compType,
        })
        if (res.error) {
          setError(res.error)
          toast.error(res.error)
          return
        }
        toast.success('Intern assigned')
      } else {
        const res = await bulkAssignInternsToProject({
          projectId,
          internIds: selectedIds,
          role,
          compensationType: compType,
        })
        if ('error' in res) {
          setError(res.error)
          toast.error(res.error)
          return
        }
        toast.success(
          `${res.assigned} intern${res.assigned === 1 ? '' : 's'} assigned` +
            (res.skipped > 0 ? ` · ${res.skipped} skipped` : '')
        )
      }

      setShowAdd(false)
      setSelectedIds([])
      setRole('contributor')
      setCompType('unpaid')
      setSearch('')
      router.refresh()
    })
  }

  function handleRemove(internId: string, name: string) {
    if (!confirm(`Remove ${name} from this project?`)) return

    startTransition(async () => {
      const res = await removeInternFromProject(projectId, internId)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Intern removed')
        router.refresh()
      }
    })
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Assigned interns
        </h2>
        {!showAdd && availableInterns.length > 0 && (
          <button
            onClick={() => setShowAdd(true)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
          >
            <UserPlus className="w-3 h-3" />
            Assign interns
          </button>
        )}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
          {/* Search */}
          {availableInterns.length > 4 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search interns…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                disabled={isPending}
              />
            </div>
          )}

          {/* Bulk select actions */}
          {filteredInterns.length > 1 && (
            <div className="flex items-center justify-between text-xs">
              <div className="text-slate-600">
                <strong>{selectedIds.length}</strong> of{' '}
                {filteredInterns.length} selected
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  disabled={isPending || allSelected}
                  className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Select all
                </button>
                {selectedIds.length > 0 && (
                  <>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={clearSelection}
                      disabled={isPending}
                      className="text-slate-500 hover:text-slate-700 font-medium"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Intern list with checkboxes */}
          <div className="border border-slate-200 rounded-lg max-h-64 overflow-y-auto bg-white">
            {filteredInterns.length === 0 ? (
              <p className="p-4 text-sm text-slate-500 text-center">
                No interns match your search.
              </p>
            ) : (
              filteredInterns.map((intern) => {
                const checked = selectedIds.includes(intern.id)
                return (
                  <label
                    key={intern.id}
                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer border-b border-slate-100 last:border-0 transition-colors ${
                      checked ? 'bg-blue-50/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleOne(intern.id)}
                      disabled={isPending}
                      className="w-4 h-4 accent-slate-900 flex-shrink-0"
                    />
                    <Avatar
                      name={intern.full_name}
                      src={intern.avatar_url}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {intern.full_name ?? intern.email}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {intern.email}
                      </div>
                    </div>
                  </label>
                )
              })
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              name="role"
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'lead' | 'contributor')}
              disabled={isPending}
            >
              <option value="contributor">Contributor</option>
              <option value="lead">Lead</option>
            </Select>

            <Select
              name="compensation"
              label="Compensation"
              value={compType}
              onChange={(e) =>
                setCompType(e.target.value as 'unpaid' | 'paid')
              }
              disabled={isPending}
            >
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid (agreement required)</option>
            </Select>
          </div>

          {error && (
            <div className="text-xs text-red-600">{error}</div>
          )}

          <div className="flex gap-2 pt-1 justify-between items-center">
            <div className="text-xs text-slate-500">
              {selectedIds.length > 0 && (
                <>
                  <Check className="w-3 h-3 inline-block mr-1 text-green-600" />
                  Ready to assign {selectedIds.length}
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAdd(false)
                  setError(null)
                  setSelectedIds([])
                  setSearch('')
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleAssign}
                loading={isPending}
                disabled={selectedIds.length === 0}
              >
                {selectedIds.length > 1
                  ? `Assign ${selectedIds.length}`
                  : 'Assign'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Existing assignments */}
      {assignments.length === 0 ? (
        <p className="text-sm text-slate-500">
          No interns assigned to this project yet.
        </p>
      ) : (
        <ul className="space-y-2">
          {assignments.map((a) => (
            <li
              key={a.id}
              className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0"
            >
              <Avatar
                name={a.intern?.full_name}
                src={a.intern?.avatar_url}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">
                  {a.intern?.full_name ?? a.intern?.email ?? 'Unknown'}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge
                    variant={a.role === 'lead' ? 'info' : 'default'}
                    size="sm"
                  >
                    {a.role}
                  </Badge>
                  {a.compensation_type === 'paid' && (
                    <Badge variant="success" size="sm">
                      Paid
                    </Badge>
                  )}
                </div>
              </div>
              <button
                onClick={() =>
                  handleRemove(
                    a.intern_id,
                    a.intern?.full_name ?? a.intern?.email ?? 'this intern'
                  )
                }
                disabled={isPending}
                className="text-slate-400 hover:text-red-600 transition-colors"
                aria-label="Remove intern"
              >
                <X className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}