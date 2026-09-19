'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, X } from 'lucide-react'
import { mentorCreateTask, mentorCreateProject } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'

type Project = {
  id: string
  title: string
  status: string
  is_client_project: boolean
}

export function NewTaskForm({
  internId,
  projects: initialProjects,
}: {
  internId: string
  projects: Project[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [showNewProject, setShowNewProject] = useState(false)

  // Task fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [isHighlight, setIsHighlight] = useState(false)

  // New project fields
  const [newProjectTitle, setNewProjectTitle] = useState('')
  const [newProjectDesc, setNewProjectDesc] = useState('')
  const [newProjectClient, setNewProjectClient] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleCreateTask() {
    setError(null)

    if (!title.trim()) {
      setError('Task title is required')
      toast.error('Task title is required')
      return
    }

    startTransition(async () => {
      const res = await mentorCreateTask({
        internId,
        projectId: projectId || null,
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

      toast.success('Task created', {
        description: 'The intern has been notified.',
      })

      // Reset
      setTitle('')
      setDescription('')
      setProjectId('')
      setDueDate('')
      setIsHighlight(false)
      setOpen(false)
      router.refresh()
    })
  }

  function handleCreateProject() {
    setError(null)

    if (!newProjectTitle.trim()) {
      setError('Project title is required')
      return
    }

    startTransition(async () => {
      const res = await mentorCreateProject({
        internId,
        title: newProjectTitle,
        description: newProjectDesc,
        isClientProject: newProjectClient,
      })

      if (res.error) {
        setError(res.error)
        toast.error(res.error)
        return
      }

      if (res.project) {
        // Add to local list
        setProjects((prev) =>
          [...prev, res.project as Project].sort((a, b) =>
            a.title.localeCompare(b.title)
          )
        )
        // Auto-select
        setProjectId(res.project.id)

        toast.success('Project created', {
          description: 'Now visible to all mentors.',
        })

        // Reset project form
        setNewProjectTitle('')
        setNewProjectDesc('')
        setNewProjectClient(false)
        setShowNewProject(false)
      }
    })
  }

  if (!open) {
    return (
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Plus className="w-4 h-4" />
        New task
      </Button>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">New task</h3>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setShowNewProject(false)
            setError(null)
          }}
          className="text-slate-400 hover:text-slate-700 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!showNewProject ? (
        <>
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
            <div>
              <Select
                name="projectId"
                label="Project (optional)"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              >
                <option value="">— No project —</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                    {p.is_client_project ? ' (client)' : ''}
                  </option>
                ))}
              </Select>
              <button
                type="button"
                onClick={() => setShowNewProject(true)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1.5 inline-flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Create new project
              </button>
            </div>

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
                Highlighted tasks appear on the intern&apos;s certificate as a
                key contribution.
              </p>
            </div>
          </label>
        </>
      ) : (
        <>
          {/* New project form */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900">
                New project
              </h4>
              <button
                type="button"
                onClick={() => setShowNewProject(false)}
                className="text-xs text-slate-500 hover:text-slate-900"
              >
                ← Back to task
              </button>
            </div>

            <Input
              name="projectTitle"
              label="Project title"
              required
              placeholder="e.g. Jinja School Website Redesign"
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
            />

            <Textarea
              name="projectDesc"
              label="Description (optional)"
              rows={2}
              placeholder="What is this project about?"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
            />

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={newProjectClient}
                onChange={(e) => setNewProjectClient(e.target.checked)}
                className="mt-1 w-4 h-4"
              />
              <div>
                <div className="text-sm font-medium text-slate-900">
                  This is a client project
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Client projects can optionally be compensated.
                </p>
              </div>
            </label>

            <p className="text-xs text-slate-500">
              ℹ️ Once created, this project is visible to all mentors.
            </p>
          </div>
        </>
      )}

      {error && (
        <div
          role="alert"
          className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"
        >
          {error}
        </div>
      )}

      <div className="flex gap-2 justify-end pt-2">
        {showNewProject ? (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleCreateProject}
            loading={isPending}
          >
            Create & select project
          </Button>
        ) : (
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleCreateTask}
            loading={isPending}
            disabled={!title.trim()}
          >
            Create task
          </Button>
        )}
      </div>
    </div>
  )
}