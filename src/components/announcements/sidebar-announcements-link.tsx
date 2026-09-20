'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Megaphone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getUnreadAnnouncementCount } from '@/lib/announcements/queries'

export function SidebarAnnouncementsLink({
  href,
  label = 'Announcements',
}: {
  href: string
  label?: string
}) {
  const pathname = usePathname()
  const supabase = createClient()
  const [unread, setUnread] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)

  const active = pathname.startsWith(href)

  useEffect(() => {
    let mounted = true
    getUnreadAnnouncementCount().then((count) => {
      if (mounted) setUnread(count)
    })
    return () => {
      mounted = false
    }
  }, [pathname])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [supabase])

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`sidebar-ann-count-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'announcement_recipients',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          getUnreadAnnouncementCount().then((count) => setUnread(count))
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'announcement_recipients',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          getUnreadAnnouncementCount().then((count) => setUnread(count))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
        active
          ? 'bg-slate-800 text-white'
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
      }`}
    >
      {active && (
        <span
          aria-hidden="true"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-full"
        />
      )}
      <Megaphone
        aria-hidden="true"
        className="w-[18px] h-[18px] flex-shrink-0"
      />
      <span className="flex-1">{label}</span>
      {unread > 0 && (
        <span className="bg-blue-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1.5">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </Link>
  )
}