import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReviewActions } from './review-actions'

const SUBMISSION_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  needs_revision: 'bg-red-100 text-red-800',
}

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: subRaw } = await supabase
    .from('submissions')
    .select(
      `id, content, file_url, status, submitted_at,
       intern:intern_id (id, full_name, email),
       task:task_id (
         id, title, description,
         project:project_id (id, title)
       )`
    )
    .eq('id', id)
    .maybeSingle()

  if (!subRaw) notFound()

  // Normalize relations
  const internRaw = subRaw.intern as any
  const intern = Array.isArray(internRaw) ? internRaw[0] : internRaw

  const taskRaw = subRaw.task as any
  const task = Array.isArray(taskRaw) ? taskRaw[0] : taskRaw

  const projectRaw = task?.project
  const project = Array.isArray(projectRaw) ? projectRaw[0] : projectRaw

  const sub = {
    id: subRaw.id,
    content: subRaw.content,
    file_url: subRaw.file_url,
    status: subRaw.status,
    submitted_at: subRaw.submitted_at,
    intern,
    task,
    project,
  }

  // Feedback thread
  const { data: feedback } = await supabase
    .from('feedback')
    .select(
      `id, content, created_at,
       mentor:mentor_id (full_name, email)`
    )
    .eq('submission_id', id)
    .order('created_at', { ascending: true })

  return (
    <div className="p-8 max-w-4xl">
      <Link
        href="/admin/submissions"
        className="text-sm text-slate-500 hover:text-slate-900"
      >
        ← Back to submissions
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {sub.task?.title ?? 'Submission'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {sub.intern?.full_name ?? sub.intern?.email ?? 'Unknown intern'}
            {sub.project?.title && <> · {sub.project.title}</>}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Submitted {new Date(sub.submitted_at).toLocaleString()}
          </p>
        </div>

        <span
          className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap ${
            SUBMISSION_COLORS[sub.status] ?? 'bg-slate-100 text-slate-600'
          }`}
        >
          {sub.status.replace('_', ' ')}
        </span>
      </div>

      {/* Task context */}
      {sub.task?.description && (
        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-5">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Task description
          </h2>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">
            {sub.task.description}
          </p>
        </div>
      )}

      {/* Submission content */}
      <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Submitted work
        </h2>
        <p className="text-sm text-slate-700 whitespace-pre-wrap">
          {sub.content}
        </p>

        {sub.file_url && (
          <a
            href={sub.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-sm text-blue-600 hover:underline"
          >
            📎 Download attached file
          </a>
        )}
      </div>

      {/* Feedback thread */}
      {feedback && feedback.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Feedback thread
          </h2>
          <div className="space-y-3">
            {feedback.map((fb: any) => {
              const mentorRaw = fb.mentor
              const mentor = Array.isArray(mentorRaw) ? mentorRaw[0] : mentorRaw

              return (
                <div
                  key={fb.id}
                  className="bg-white border border-slate-200 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-slate-900">
                      {mentor?.full_name ?? mentor?.email ?? 'Mentor'}
                    </div>
                    <div className="text-xs text-slate-400">
                      {new Date(fb.created_at).toLocaleString()}
                    </div>
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {fb.content}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Review actions */}
      <div className="mt-8">
        <ReviewActions
          submissionId={sub.id}
          currentStatus={sub.status}
        />
      </div>
    </div>
  )
}