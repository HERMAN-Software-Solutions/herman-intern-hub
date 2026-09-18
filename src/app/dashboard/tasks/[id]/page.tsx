import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Star, Paperclip, Check, AlertTriangle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
import { SubmissionForm } from './submission-form'

const STATUS_VARIANTS: Record<
  string,
  'default' | 'info' | 'warning' | 'success'
> = {
  todo: 'default',
  in_progress: 'info',
  review: 'warning',
  done: 'success',
}

const SUBMISSION_VARIANTS: Record<
  string,
  'success' | 'warning' | 'danger'
> = {
  pending: 'warning',
  approved: 'success',
  needs_revision: 'danger',
}

const SUBMISSION_LABELS: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  needs_revision: 'Needs revision',
}

type Project = { id: string; title: string }

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: taskRaw } = await supabase
    .from('tasks')
    .select(
      `id, title, description, status, due_date, is_highlight,
       project:project_id (id, title)`
    )
    .eq('id', id)
    .eq('assigned_to', user.id)
    .maybeSingle()

  if (!taskRaw) notFound()

  const projectRaw = taskRaw.project as Project | Project[] | null
  const project: Project | null = Array.isArray(projectRaw)
    ? projectRaw[0] ?? null
    : projectRaw

  const task = {
    id: taskRaw.id,
    title: taskRaw.title,
    description: taskRaw.description,
    status: taskRaw.status,
    due_date: taskRaw.due_date,
    is_highlight: taskRaw.is_highlight,
    project,
  }

  const { data: submissions } = await supabase
    .from('submissions')
    .select(
      `id, content, file_url, status, submitted_at,
       feedback (id, content, created_at, mentor_id)`
    )
    .eq('task_id', id)
    .eq('intern_id', user.id)
    .order('submitted_at', { ascending: false })

  const hasPending = submissions?.some((s: any) => s.status === 'pending')
  const needsRevision = submissions?.some(
    (s: any) => s.status === 'needs_revision'
  )

  const isLocked = task.status === 'done' || hasPending

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <Link
        href="/dashboard/tasks"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to tasks
      </Link>

      <PageHeader
        title={task.title}
        description={
          project ? (
            <>
              Project:{' '}
              <Link
                href={`/dashboard/projects/${project.id}`}
                className="text-blue-600 hover:underline"
              >
                {project.title}
              </Link>
              {task.due_date && (
                <>
                  {' · '}Due{' '}
                  {new Date(task.due_date).toLocaleDateString()}
                </>
              )}
            </>
          ) : undefined
        }
        action={
          <div className="flex items-center gap-2">
            {task.is_highlight && (
              <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                <Star className="w-3 h-3 fill-current" />
                Highlight
              </span>
            )}
            <Badge variant={STATUS_VARIANTS[task.status] ?? 'default'}>
              {task.status.replace('_', ' ')}
            </Badge>
          </div>
        }
      />

      {task.description && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 mb-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Description
          </h2>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">
            {task.description}
          </p>
        </div>
      )}

      {needsRevision && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-red-900 text-sm">
              Your mentor requested revisions
            </div>
            <p className="text-xs text-red-700 mt-1">
              Review the feedback below and submit again.
            </p>
          </div>
        </div>
      )}

      {hasPending && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-amber-900 text-sm">
              Waiting for mentor review
            </div>
            <p className="text-xs text-amber-700 mt-1">
              You&apos;ll be notified when your submission is reviewed.
            </p>
          </div>
        </div>
      )}

      {submissions && submissions.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">
            Submission history
          </h2>
          <div className="space-y-3">
            {submissions.map((sub: any) => (
              <div
                key={sub.id}
                className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <Badge
                    variant={SUBMISSION_VARIANTS[sub.status] ?? 'default'}
                  >
                    {SUBMISSION_LABELS[sub.status] ?? sub.status}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    {new Date(sub.submitted_at).toLocaleString()}
                  </span>
                </div>

                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                  {sub.content}
                </p>

                {sub.file_url && (
                  <a
                    href={sub.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-3 text-xs text-blue-600 hover:underline"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                    View attached file
                  </a>
                )}

                {sub.feedback && sub.feedback.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Mentor feedback
                    </div>
                    <div className="space-y-2">
                      {sub.feedback.map((fb: any) => (
                        <div
                          key={fb.id}
                          className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3"
                        >
                          <p className="whitespace-pre-wrap">{fb.content}</p>
                          <div className="text-xs text-slate-400 mt-2">
                            {new Date(fb.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLocked ? (
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-3">
            {needsRevision ? 'Resubmit your work' : 'Submit your work'}
          </h2>
          <SubmissionForm taskId={task.id} currentStatus={task.status} />
        </div>
      ) : task.status === 'done' ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-start gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-medium text-green-900 text-sm">
              Task complete
            </div>
            <p className="text-xs text-green-700 mt-0.5">Great work!</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}