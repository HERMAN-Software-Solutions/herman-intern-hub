'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { createTask } from './task-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'

export function NewTaskForm({
  projectId,
  assignedInterns,
}: {
  projectId: string
  assignedInterns: { id: string; full_name: string | null; email: string }[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [assignedTo, setAssignedTo] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [isHighlight, setIsHighlight] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    setError(null)

    if (!title.trim()) {
      setError('Title is required')
      toast.error('Title is required')
      return
    }

    if (!assignedTo) {
      setError('Please select an intern to assign this task to')
      toast.error('Please select an intern')
      return
    }

    startTransition(async () => {
      const res = await createTask({
        projectId,
        assignedTo,
        title,
        description,
        dueDate,
        isHighlight,
      })

      if (res.error) {
        setError(res.error)
        toast.error(res.error)
        return
      }

      toast.success('Task created')
      setTitle('')
      setDescription('')
      setDueDate('')
      setAssignedTo('')
      setIsHighlight(false)
      setOpen(false)
      router.refresh()
    })
  }

  // If no interns assigned yet, show a disabled state
  if (assignedInterns.length === 0) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex items-center gap-2 bg-slate-200 text-slate-400 text-sm font-medium px-4 py-2.5 rounded-lg cursor-not-allowed"
      >
        <Plus className="w-4 h-4" />
        New task
      </button>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        New task
      </button>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
      <h3 className="font-semibold text-slate-900">New task</h3>

      <Input
        name="title"
        label="Title"
        required
        placeholder="e.g. Build the landing page hero"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <Textarea
        name="description"
        label="Description"
        rows={3}
        placeholder="What needs to be done?"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          name="assignedTo"
          label="Assign to"
          required
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
        >
          <option value="">— Select intern —</option>
          {assignedInterns.map((i) => (
            <option key={i.id} value={i.id}>
              {i.full_name ?? i.email}
            </option>
          ))}
        </Select>

        <Input
          name="dueDate"
          type="date"
          label="Due date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isHighlight}
          onChange={(e) => setIsHighlight(e.target.checked)}
          className="mt-1 w-4 h-4"
        />
        <div>
          <div className="text-sm font-medium text-slate-900">
            Mark as highlight
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Highlighted tasks appear in the intern&apos;s certificate as a key
            contribution.
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

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setOpen(false)
            setError(null)
          }}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={!assignedTo || !title.trim()}
          loading={isPending}
        >
          Create task
        </Button>
      </div>
    </div>
  )
}