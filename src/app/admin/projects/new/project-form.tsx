'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createProject } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'

export function ProjectForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<
    'planning' | 'active' | 'review' | 'completed' | 'archived'
  >('planning')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [isClientProject, setIsClientProject] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    setError(null)

    if (!title.trim()) {
      setError('Title is required')
      toast.error('Title is required')
      return
    }

    startTransition(async () => {
      const res = await createProject({
        title,
        description,
        status,
        startDate,
        dueDate,
        isClientProject,
      })

      if (res.error) {
        setError(res.error)
        toast.error(res.error)
        return
      }

      toast.success('Project created')
      router.push(`/admin/projects/${res.projectId}`)
      router.refresh()
    })
  }

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <Input
          name="title"
          label="Project title"
          required
          placeholder="e.g. Jinja School Website Redesign"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Textarea
          name="description"
          label="Description"
          rows={4}
          placeholder="What is this project about? What are the goals?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Select
          name="status"
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
        >
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="review">Review</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </Select>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Schedule
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            name="startDate"
            type="date"
            label="Start date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            name="dueDate"
            type="date"
            label="Due date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isClientProject}
            onChange={(e) => setIsClientProject(e.target.checked)}
            className="mt-1 w-4 h-4"
          />
          <div>
            <div className="text-sm font-medium text-slate-900">
              This is a client project
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Interns assigned to client projects can optionally be
              compensated (requires a signed agreement).
            </p>
          </div>
        </label>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={handleSubmit}
          loading={isPending}
        >
          {isPending ? 'Creating…' : 'Create project'}
        </Button>
      </div>
    </div>
  )
}