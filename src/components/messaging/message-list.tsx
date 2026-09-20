'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar } from '@/components/ui/avatar'
import type { Message } from '@/lib/messaging/queries'

type Props = {
  threadId: string
  initialMessages: Message[]
  currentUserId: string
}

export function MessageList({
  threadId,
  initialMessages,
  currentUserId,
}: Props) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  useEffect(() => {
    const channel = supabase
      .channel(`thread-${threadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('messages')
            .select(
              `id, thread_id, sender_id, body, file_url, file_name, created_at, deleted_at,
               sender:sender_id (id, full_name, email, avatar_url)`
            )
            .eq('id', payload.new.id)
            .single()

          if (data) {
            const senderRaw = (data as any).sender
            const sender = Array.isArray(senderRaw) ? senderRaw[0] : senderRaw
            const enriched = { ...data, sender } as Message

            setMessages((prev) => {
              if (prev.some((m) => m.id === enriched.id)) return prev
              return [...prev, enriched]
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === payload.new.id
                ? { ...m, deleted_at: payload.new.deleted_at }
                : m
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div>
          <div className="text-4xl mb-3">💬</div>
          <p className="text-sm text-slate-500">
            No messages yet. Say hi 👋
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((m) => {
        const isMe = m.sender_id === currentUserId
        const isDeleted = !!m.deleted_at
        const isImage =
          m.file_url &&
          /\.(png|jpe?g|gif|webp)$/i.test(m.file_url) &&
          m.file_name

        // Use the API route for auth-gated access
        const attachmentHref = m.file_url
          ? `/api/messaging/attachment?path=${encodeURIComponent(m.file_url)}`
          : null

        return (
          <div
            key={m.id}
            className={`flex items-start gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
          >
            <Avatar
              name={m.sender?.full_name ?? m.sender?.email}
              src={m.sender?.avatar_url}
              size="sm"
            />
            <div
              className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}
            >
              <div
                className={`rounded-2xl text-sm leading-relaxed ${
                  isDeleted
                    ? 'bg-slate-100 text-slate-400 italic px-3.5 py-2'
                    : isMe
                      ? 'bg-slate-900 text-white px-3.5 py-2'
                      : 'bg-slate-100 text-slate-900 px-3.5 py-2'
                }`}
              >
                {isDeleted ? (
                  'This message was deleted'
                ) : (
                  <>
                    {/* Attachment preview */}
                    {m.file_url && isImage && attachmentHref && (
                      <a
                        href={attachmentHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mb-2 -mx-1 -mt-1"
                      >
                        <img
                          src={attachmentHref}
                          alt={m.file_name ?? 'Attachment'}
                          className="max-w-full max-h-64 rounded-lg object-cover"
                        />
                      </a>
                    )}

                    {m.file_url && !isImage && attachmentHref && (
                      <a
                        href={attachmentHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 mb-1.5 text-xs px-2.5 py-1.5 rounded-lg ${
                          isMe
                            ? 'bg-white/10 text-white hover:bg-white/20'
                            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                        } transition-colors`}
                      >
                        📎 {m.file_name ?? 'Attachment'}
                      </a>
                    )}

                    {m.body && m.body.trim() && (
                      <p className="whitespace-pre-wrap break-words">
                        {m.body}
                      </p>
                    )}
                  </>
                )}
              </div>
              <div
                className={`text-[10px] text-slate-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}
              >
                {timeAgo(m.created_at)}
              </div>
            </div>
          </div>
        )
      })}
      <div ref={bottomRef} />
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