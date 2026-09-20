'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Megaphone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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

  async function fetchCount() {
    try {
      const res = await fetch('/api/announcements/unread-count', {
        cache: 'no-store',
      })
      if (!res.ok) return
      const data = await res.json()
      if (typeof data.count === 'number') setUnread(data.count)
    } catch {
      // silent
    }
  }

  useEffect(() => {
    fetchCount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [supabase])

  useEffect(() => {
    if (!userId) return

    const channelName = `sidebar-ann-count-${userId}`

    // Remove any lingering channel with the same name BEFORE creating a new one.
    const existing = supabase
      .getChannels()
      .find((c) => c.topic === `realtime:${channelName}`)
    if (existing) {
      supabase.removeChannel(existing)
    }

    const channel = supabase.channel(channelName)

    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'announcement_recipients',
        filter: `user_id=eq.${userId}`,
      },
      () => fetchCount()
    )

    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'announcement_recipients',
        filter: `user_id=eq.${userId}`,
      },
      () => fetchCount()
    )

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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