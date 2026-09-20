import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ChevronLeft, Megaphone } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getAnnouncement } from '@/lib/announcements/queries'
import { markAnnouncementRead } from '@/lib/announcements/actions'

export const dynamic = 'force-dynamic'

export default async function InternAnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const ann = await getAnnouncement(id)
  if (!ann) notFound()

  // Mark read on view (fire and forget)
  markAnnouncementRead(id).catch(() => {})

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <Link
        href="/dashboard/announcements"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        All announcements
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
            <Megaphone className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
              Announcement
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              {ann.subject}
            </h1>
            <div className="text-xs text-slate-500 mt-1">
              from {ann.senderName} ·{' '}
              {new Date(ann.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="prose prose-slate max-w-none">
          <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
            {ann.body}
          </p>
        </div>
      </div>
    </div>
  )
}