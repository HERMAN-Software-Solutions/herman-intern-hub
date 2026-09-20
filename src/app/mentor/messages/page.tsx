import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Card } from '@/components/ui/card'
import { getMyThreads } from '@/lib/messaging/queries'

export const metadata = { title: 'Messages — HERMAN Mentor' }
export const dynamic = 'force-dynamic'

export default async function MentorMessagesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const threads = await getMyThreads()

  // Group: 1-on-1s first, then team threads
  const oneOnOne = threads.filter((t) => t.type === 'mentor_intern')
  const teamThreads = threads.filter((t) => t.type === 'mentor_team')
  const mentorRoom = threads.filter((t) => t.type === 'mentor_admin')

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <PageHeader
        title="Messages"
        description="Chat with your interns and coordinate with other mentors."
      />

      {threads.length === 0 ? (
        <EmptyState
          icon="💬"
          title="No conversations yet"
          description="Once you have interns assigned, your chats will appear here."
        />
      ) : (
        <div className="space-y-8">
          {mentorRoom.length > 0 && (
            <Section title="Mentor room" subtitle="Mentors + admins only">
              {mentorRoom.map((t) => (
                <ThreadRow key={t.id} thread={t} hrefPrefix="/mentor/messages" />
              ))}
            </Section>
          )}

          {oneOnOne.length > 0 && (
            <Section title="My interns">
              {oneOnOne.map((t) => (
                <ThreadRow key={t.id} thread={t} hrefPrefix="/mentor/messages" />
              ))}
            </Section>
          )}

          {teamThreads.length > 0 && (
            <Section title="Team chats">
              {teamThreads.map((t) => (
                <ThreadRow key={t.id} thread={t} hrefPrefix="/mentor/messages" />
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  )
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="mb-3">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function ThreadRow({
  thread,
  hrefPrefix,
}: {
  thread: any
  hrefPrefix: string
}) {
  return (
    <Link href={`${hrefPrefix}/${thread.id}`} className="block">
      <Card padding="sm" hover>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="font-medium text-slate-900 truncate">
                {thread.title}
              </div>
              {thread.unreadCount > 0 && (
                <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 flex-shrink-0">
                  {thread.unreadCount > 9 ? '9+' : thread.unreadCount}
                </span>
              )}
            </div>
            {thread.lastMessagePreview ? (
              <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                {thread.lastMessagePreview}
              </p>
            ) : (
              <p className="text-xs text-slate-400 mt-1 italic">
                No messages yet
              </p>
            )}
          </div>
          {thread.lastMessageAt && (
            <div className="text-[10px] text-slate-400 flex-shrink-0">
              {timeAgo(thread.lastMessageAt)}
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}

function timeAgo(date: string): string {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return 'now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`
  return new Date(date).toLocaleDateString()
}