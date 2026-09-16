import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SubmissionForm } from './submission-form'

const STATUS_COLORS: Record<string, string> = {
  todo: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-700',
  review: 'bg-amber-100 text-amber-700',
  done: 'bg-green-100 text-green-700',
}

const SUBMISSION_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  needs_revision: 'bg-red-100 text-red-800',
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

  // Normalize Supabase relation (arrays)
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

  // Submissions for this task
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
    <div className="p-8 max-w-4xl">
      <Link
        href="/dashboard/tasks"
        className="text-sm text-slate-500 hover:text-slate-900"
      >
        ← Back to tasks
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            {task.is_highlight && (
              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                ★ Highlight
              </span>
            )}
            <h1 className="text-3xl font-bold text-slate-900">{task.title}</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {project && (
              <>
                Project:{' '}
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {project.title}
                </Link>
                {task.due_date && (
                  <> · Due {new Date(task.due_date).toLocaleDateString()}</>
                )}
              </>
            )}
          </p>
        </div>

        <span
          className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap ${
            STATUS_COLORS[task.status] ?? 'bg-slate-100 text-slate-600'
          }`}
        >
          {task.status.replace('_', ' ')}
        </span>
      </div>

      {task.description && (
        <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Description
          </h2>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">
            {task.description}
          </p>
        </div>
      )}

      {/* Revision banner */}
      {needsRevision && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="font-medium text-red-900 text-sm">
            ⚠️ Your mentor requested revisions
          </div>
          <p className="text-xs text-red-700 mt-1">
            Review the feedback below and submit again.
          </p>
        </div>
      )}

      {/* Pending banner */}
      {hasPending && (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="font-medium text-amber-900 text-sm">
            ⏳ Waiting for mentor review
          </div>
          <p className="text-xs text-amber-700 mt-1">
            You&apos;ll be notified when your submission is reviewed.
          </p>
        </div>
      )}

      {/* Submission history */}
      {submissions && submissions.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            Submission history
          </h2>
          <div className="space-y-3">
            {submissions.map((sub: any) => (
              <div
                key={sub.id}
                className="bg-white border border-slate-200 rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      SUBMISSION_COLORS[sub.status] ??
                      'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {sub.status.replace('_', ' ')}
                  </span>
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
                    📎 View attached file
                  </a>
                )}

                {/* Feedback thread */}
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

      {/* Submission form */}
      {!isLocked ? (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            {needsRevision ? 'Resubmit your work' : 'Submit your work'}
          </h2>
          <SubmissionForm taskId={task.id} currentStatus={task.status} />
        </div>
      ) : task.status === 'done' ? (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-5 text-sm text-green-800">
          ✅ This task is complete. Great work!
        </div>
      ) : null}
    </div>
  )
}