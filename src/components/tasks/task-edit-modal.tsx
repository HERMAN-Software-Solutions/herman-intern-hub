'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { updateTask } from '@/lib/tasks/mutations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'

export type EditableTask = {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'review' | 'done'
  due_date: string | null
  project_id: string
  is_highlight: boolean
}

export type AvailableProject = {
  id: string
  title: string
}

const STATUSES: { value: EditableTask['status']; label: string }[] = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'review', label: 'In review' },
  { value: 'done', label: 'Done' },
]

export function TaskEditModal({
  task,
  availableProjects,
  onClose,
}: {
  task: EditableTask
  availableProjects: AvailableProject[]
  onClose: () => void
}) {
  const router = useRouter()
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [status, setStatus] = useState<EditableTask['status']>(task.status)
  const [dueDate, setDueDate] = useState(task.due_date ?? '')
  const [projectId, setProjectId] = useState(task.project_id)
  const [isHighlight, setIsHighlight] = useState(task.is_highlight)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    setError(null)

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    startTransition(async () => {
      const res = await updateTask({
        taskId: task.id,
        title,
        description,
        dueDate,
        status,
        projectId,
        isHighlight,
      })

      if ('error' in res) {
        setError(res.error)
        toast.error(res.error)
        return
      }

      toast.success('Task updated')
      onClose()
      router.refresh()
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose()
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Edit task</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <Input
            name="title"
            label="Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
          />

          <Textarea
            name="description"
            label="Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              name="projectId"
              label="Project"
              required
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={isPending}
              hint="Only projects this intern is assigned to"
            >
              {availableProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Select>

            <Select
              name="status"
              label="Status"
              required
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as EditableTask['status'])
              }
              disabled={isPending}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>

          <Input
            name="dueDate"
            type="date"
            label="Due date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isPending}
          />

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isHighlight}
              onChange={(e) => setIsHighlight(e.target.checked)}
              disabled={isPending}
              className="mt-1 w-4 h-4"
            />
            <div>
              <div className="text-sm font-medium text-slate-900">
                Mark as highlight
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Highlighted tasks appear on the intern&apos;s certificate.
              </p>
            </div>
          </label>

          {error && (
            <div
              role="alert"
              className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"
            >
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-end p-5 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            loading={isPending}
            disabled={!title.trim() || !projectId}
          >
            Save changes
          </Button>
        </div>
      </div>
    </div>
  )
}