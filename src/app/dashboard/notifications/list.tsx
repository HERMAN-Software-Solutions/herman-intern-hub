'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { markAllRead, markOneRead } from '@/app/_actions/notifications'
import { EmptyState } from '@/components/ui/empty-state'

type N = {
  id: string
  type: string
  title: string
  body: string | null
  link: string | null
  read_at: string | null
  created_at: string
}

export function NotificationList({ notifications }: { notifications: N[] }) {
  const router = useRouter()
  const [items, setItems] = useState(notifications)
  const [, startTransition] = useTransition()

  function handleClick(n: N) {
    if (!n.read_at) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === n.id ? { ...i, read_at: new Date().toISOString() } : i
        )
      )
      startTransition(async () => {
        await markOneRead(n.id)
      })
    }
    if (n.link) router.push(n.link)
  }

  function handleMarkAll() {
    setItems((prev) =>
      prev.map((i) => ({ ...i, read_at: i.read_at ?? new Date().toISOString() }))
    )
    startTransition(async () => {
      await markAllRead()
    })
  }

  const unreadCount = items.filter((i) => !i.read_at).length

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-slate-500">
          {unreadCount > 0
            ? `${unreadCount} unread`
            : `${items.length} total · all read`}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Mark all read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
           icon="🔔"
           title="No notifications yet"
           description="You'll be notified when tasks are assigned, submissions are reviewed, or your certificate is issued."
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => handleClick(n)}
              className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-start gap-3 ${
                !n.read_at ? 'bg-blue-50/30' : ''
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {!n.read_at && (
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0" />
                  )}
                  <div className="font-medium text-slate-900 text-sm">
                    {n.title}
                  </div>
                </div>
                {n.body && (
                  <p className="text-xs text-slate-500 mt-1">{n.body}</p>
                )}
                <div className="text-[11px] text-slate-400 mt-1.5">
                  {new Date(n.created_at).toLocaleString()}
                </div>
              </div>
              {n.link && <span className="text-slate-400">→</span>}
            </button>
          ))}
        </div>
      )}
    </>
  )
}