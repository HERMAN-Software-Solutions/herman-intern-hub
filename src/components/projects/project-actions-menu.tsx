'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  MoreHorizontal,
  Pencil,
  Archive,
  ArchiveRestore,
  Trash2,
  X,
} from 'lucide-react'
import {
  deleteProject,
  archiveProject,
  unarchiveProject,
} from '@/lib/projects/mutations'
import { Button } from '@/components/ui/button'
import {
  ProjectEditModal,
  type EditableProject,
} from './project-edit-modal'

export function ProjectActionsMenu({
  project,
  taskCount = 0,
}: {
  project: EditableProject
  taskCount?: number
}) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [confirming, setConfirming] = useState<null | 'archive' | 'delete'>(
    null
  )
  const [isPending, startTransition] = useTransition()

  const isArchived = project.status === 'archived'
  const canDelete = taskCount === 0

  function handleArchiveToggle() {
    startTransition(async () => {
      const res = isArchived
        ? await unarchiveProject(project.id)
        : await archiveProject(project.id)

      if ('error' in res) {
        toast.error(res.error)
        return
      }
      toast.success(isArchived ? 'Project restored' : 'Project archived')
      setConfirming(null)
      router.refresh()
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteProject(project.id)
      if ('error' in res) {
        toast.error(res.error)
        return
      }
      toast.success('Project deleted')
      setConfirming(null)
      router.refresh()
    })
  }

  return (
    <>
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setMenuOpen((o) => !o)
          }}
          className="p-1.5 rounded-md text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Project actions"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-slate-200 rounded-lg shadow-lg py-1 min-w-[170px]">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setMenuOpen(false)
                  setEditing(true)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setMenuOpen(false)
                  setConfirming('archive')
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {isArchived ? (
                  <>
                    <ArchiveRestore className="w-3.5 h-3.5" />
                    Unarchive
                  </>
                ) : (
                  <>
                    <Archive className="w-3.5 h-3.5" />
                    Archive
                  </>
                )}
              </button>

              {canDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setMenuOpen(false)
                    setConfirming('delete')
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {editing && (
        <ProjectEditModal
          project={project}
          onClose={() => setEditing(false)}
        />
      )}

      {confirming && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isPending) setConfirming(null)
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900">
                {confirming === 'archive'
                  ? isArchived
                    ? 'Unarchive project?'
                    : 'Archive project?'
                  : 'Delete project?'}
              </h3>
              <button
                type="button"
                onClick={() => setConfirming(null)}
                disabled={isPending}
                className="text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5">
              {confirming === 'archive' ? (
                <p className="text-sm text-slate-700">
                  {isArchived
                    ? `Restore "${project.title}" to active? It will appear in normal project lists again.`
                    : `Archive "${project.title}"? It will be hidden from active lists but preserved.`}
                </p>
              ) : (
                <p className="text-sm text-slate-700">
                  Permanently delete <strong>{project.title}</strong>? This
                  cannot be undone.
                </p>
              )}
            </div>

            <div className="flex gap-2 justify-end p-5 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirming(null)}
                disabled={isPending}
              >
                Cancel
              </Button>
              {confirming === 'archive' ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleArchiveToggle}
                  loading={isPending}
                >
                  {isArchived ? 'Unarchive' : 'Archive'}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
                  loading={isPending}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}