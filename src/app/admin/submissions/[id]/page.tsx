import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, Paperclip, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { ReviewActions } from './review-actions'

const SUBMISSION_VARIANTS: Record<string, 'success' | 'warning' | 'danger'> = {
  pending: 'warning',
  approved: 'success',
  needs_revision: 'danger',
}

const SUBMISSION_LABELS: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  needs_revision: 'Needs revision',
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
       intern:intern_id (id, full_name, email, avatar_url),
       task:task_id (
         id, title, description,
         project:project_id (id, title)
       )`
    )
    .eq('id', id)
    .maybeSingle()

  if (!subRaw) notFound()

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

  const { data: feedback } = await supabase
    .from('feedback')
    .select(
      `id, content, created_at,
       mentor:mentor_id (full_name, email)`
    )
    .eq('submission_id', id)
    .order('created_at', { ascending: true })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <Link
        href="/admin/submissions"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to submissions
      </Link>

      <PageHeader
        title={sub.task?.title ?? 'Submission'}
        description={
          <span>
            {sub.intern?.full_name ?? sub.intern?.email ?? 'Unknown intern'}
            {sub.project?.title && (
              <>
                {' · '}
                <span className="text-slate-400">{sub.project.title}</span>
              </>
            )}
          </span>
        }
        action={
          <Badge variant={SUBMISSION_VARIANTS[sub.status] ?? 'default'}>
            {SUBMISSION_LABELS[sub.status] ?? sub.status}
          </Badge>
        }
      />

      <p className="text-xs text-slate-400 -mt-4 mb-6">
        Submitted {new Date(sub.submitted_at).toLocaleString()}
      </p>

      {/* Intern info card */}
      {sub.intern && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <Avatar
              name={sub.intern.full_name}
              src={sub.intern.avatar_url}
              size="md"
            />
            <div className="min-w-0">
              <div className="text-xs text-slate-500">Submitted by</div>
              <div className="font-medium text-slate-900 truncate">
                {sub.intern.full_name ?? sub.intern.email}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task context */}
      {sub.task?.description && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Task description
          </h2>
          <p className="text-sm text-slate-700 whitespace-pre-wrap">
            {sub.task.description}
          </p>
        </div>
      )}

      {/* Submission content */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 mb-6">
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
            <Paperclip className="w-4 h-4" />
            Download attached file
          </a>
        )}
      </div>

      {/* Feedback thread */}
      {feedback && feedback.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5" />
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
                  <div className="flex items-center justify-between mb-2 gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar
                        name={mentor?.full_name ?? mentor?.email}
                        size="xs"
                      />
                      <div className="text-sm font-medium text-slate-900 truncate">
                        {mentor?.full_name ?? mentor?.email ?? 'Mentor'}
                      </div>
                    </div>
                    <div className="text-xs text-slate-400 whitespace-nowrap">
                      {new Date(fb.created_at).toLocaleDateString()}
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
      <ReviewActions submissionId={sub.id} currentStatus={sub.status} />
    </div>
  )
}