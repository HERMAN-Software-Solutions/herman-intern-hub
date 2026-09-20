import Link from 'next/link'
import { Megaphone } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Card } from '@/components/ui/card'
import { getMyAnnouncements } from '@/lib/announcements/queries'

export const metadata = { title: 'Announcements — HERMAN Intern Hub' }
export const dynamic = 'force-dynamic'

export default async function InternAnnouncementsPage() {
  const items = await getMyAnnouncements()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <PageHeader
        title="Announcements"
        description="Messages from the HERMAN team."
      />

      {items.length === 0 ? (
        <EmptyState
          icon="📢"
          title="No announcements yet"
          description="When the HERMAN team posts an update, it will appear here."
        />
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <Link
              key={a.id}
              href={`/dashboard/announcements/${a.id}`}
              className="block"
            >
              <Card padding="sm" hover>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {!a.read_at && (
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                      )}
                      <div
                        className={`truncate ${
                          a.read_at
                            ? 'font-medium text-slate-700'
                            : 'font-semibold text-slate-900'
                        }`}
                      >
                        {a.subject}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {a.body}
                    </p>
                    <div className="text-[11px] text-slate-400 mt-2">
                      {a.senderName} · {timeAgo(a.created_at)}
                    </div>
                  </div>
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
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(date).toLocaleDateString()
}