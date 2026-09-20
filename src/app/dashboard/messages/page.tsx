import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Card } from '@/components/ui/card'
import { getMyThreads } from '@/lib/messaging/queries'

export const metadata = { title: 'Messages — HERMAN Intern Hub' }
export const dynamic = 'force-dynamic'

export default async function InternMessagesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const threads = await getMyThreads()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <PageHeader
        title="Messages"
        description="Chat with your mentor and team."
      />

      {threads.length === 0 ? (
        <EmptyState
          icon="💬"
          title="No conversations yet"
          description="Once a mentor is assigned, your chat will appear here."
        />
      ) : (
        <div className="space-y-3">
          {threads.map((t) => (
            <Link
              key={t.id}
              href={`/dashboard/messages/${t.id}`}
              className="block"
            >
              <Card padding="sm" hover>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-slate-900 truncate">
                        {t.title}
                      </div>
                      {t.unreadCount > 0 && (
                        <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 flex-shrink-0">
                          {t.unreadCount > 9 ? '9+' : t.unreadCount}
                        </span>
                      )}
                    </div>
                    {t.subtitle && (
                      <div className="text-xs text-slate-500 mt-0.5">
                        {t.subtitle}
                      </div>
                    )}
                    {t.lastMessagePreview ? (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {t.lastMessagePreview}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 mt-1 italic">
                        No messages yet
                      </p>
                    )}
                  </div>
                  {t.lastMessageAt && (
                    <div className="text-[10px] text-slate-400 flex-shrink-0">
                      {timeAgo(t.lastMessageAt)}
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
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