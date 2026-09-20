'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Megaphone, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { markAnnouncementRead } from '@/lib/announcements/actions'
import { Button } from '@/components/ui/button'

type UnreadAnnouncement = {
  id: string
  subject: string
  body: string
  senderName: string
  created_at: string
}

export function AnnouncementPopup({
  initialUnread,
  viewBasePath = '/dashboard/announcements',
}: {
  initialUnread: UnreadAnnouncement | null
  viewBasePath?: string
}) {
  const router = useRouter()
  const supabase = createClient()
  const [current, setCurrent] = useState<UnreadAnnouncement | null>(
    initialUnread
  )
  const [pending, setPending] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [supabase])

  // Watch for new announcements arriving via Realtime
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`ann-popup-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'announcement_recipients',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          const annId = (payload.new as any).announcement_id
          if (!annId) return

          // Fetch the announcement details
          const { data: ann } = await supabase
            .from('announcements')
            .select(
              'id, subject, body, created_at, sender:sender_id (full_name, email)'
            )
            .eq('id', annId)
            .single()

          if (!ann) return

          const sRaw = (ann as any).sender
          const s = Array.isArray(sRaw) ? sRaw[0] : sRaw

          setCurrent({
            id: ann.id,
            subject: ann.subject,
            body: ann.body,
            senderName: s?.full_name ?? s?.email ?? 'HERMAN',
            created_at: ann.created_at,
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  async function handleDismiss() {
    if (!current || pending) return
    setPending(true)
    await markAnnouncementRead(current.id)
    setCurrent(null)
    setPending(false)
    router.refresh()
  }

  async function handleOpen() {
    if (!current || pending) return
    setPending(true)
    const id = current.id
    await markAnnouncementRead(id)
    setCurrent(null)
    setPending(false)
    router.push(`${viewBasePath}/${id}`)
  }

  if (!current) return null

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) handleDismiss()
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-3 p-5 border-b border-slate-100">
          <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
            <Megaphone className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
              New announcement
            </div>
            <h3 className="font-semibold text-slate-900 mt-0.5 truncate">
              {current.subject}
            </h3>
            <div className="text-xs text-slate-500 mt-0.5">
              from {current.senderName} · {timeAgo(current.created_at)}
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            disabled={pending}
            className="text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50 flex-shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap line-clamp-[12]">
            {current.body}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end p-5 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            disabled={pending}
          >
            Dismiss
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleOpen}
            loading={pending}
          >
            Read full →
          </Button>
        </div>
      </div>
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