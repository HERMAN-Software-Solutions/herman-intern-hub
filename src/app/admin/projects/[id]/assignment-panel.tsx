'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { UserPlus, X } from 'lucide-react'
import {
  assignInternToProject,
  removeInternFromProject,
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
  const [selectedIntern, setSelectedIntern] = useState('')
  const [role, setRole] = useState<'lead' | 'contributor'>('contributor')
  const [compType, setCompType] = useState<'unpaid' | 'paid'>('unpaid')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleAdd() {
    setError(null)
    if (!selectedIntern) {
      setError('Please select an intern')
      return
    }

    startTransition(async () => {
      const res = await assignInternToProject({
        projectId,
        internId: selectedIntern,
        role,
        compensationType: compType,
      })

      if (res.error) {
        setError(res.error)
        toast.error(res.error)
        return
      }

      toast.success('Intern assigned')
      setShowAdd(false)
      setSelectedIntern('')
      setRole('contributor')
      setCompType('unpaid')
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
            Assign intern
          </button>
        )}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
          <Select
            name="intern"
            label="Intern"
            value={selectedIntern}
            onChange={(e) => setSelectedIntern(e.target.value)}
          >
            <option value="">— Select intern —</option>
            {availableInterns.map((i) => (
              <option key={i.id} value={i.id}>
                {i.full_name ?? i.email}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Select
              name="role"
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'lead' | 'contributor')}
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
            >
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid (agreement required)</option>
            </Select>
          </div>

          {error && (
            <div className="text-xs text-red-600">{error}</div>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowAdd(false)
                setError(null)
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleAdd}
              loading={isPending}
            >
              Assign
            </Button>
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