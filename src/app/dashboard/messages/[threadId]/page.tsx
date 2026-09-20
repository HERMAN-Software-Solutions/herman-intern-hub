import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import {
  getThreadById,
  getThreadMessages,
} from '@/lib/messaging/queries'
import { ThreadView } from '@/components/messaging/thread-view'

export const dynamic = 'force-dynamic'

export default async function InternThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>
}) {
  const { threadId } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const thread = await getThreadById(threadId)
  if (!thread) notFound()

  const messages = await getThreadMessages(threadId)

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200">
        <div className="px-4 sm:px-6 py-3">
          <Link
            href="/dashboard/messages"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors mb-1.5"
          >
            <ChevronLeft className="w-3 h-3" />
            All messages
          </Link>
          <h1 className="font-semibold text-slate-900 truncate">
            {thread.title}
          </h1>
          {thread.type === 'mentor_team' && (
            <p className="text-xs text-slate-500 mt-0.5">
              Team chat · messages visible to everyone on the team
            </p>
          )}
        </div>
      </div>

      {/* Thread */}
      <ThreadView
        threadId={threadId}
        initialMessages={messages}
        currentUserId={user.id}
      />
    </div>
  )
}