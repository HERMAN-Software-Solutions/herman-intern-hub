'use client'

import { useEffect } from 'react'
import { MessageList } from './message-list'
import { MessageComposer } from './message-composer'
import { markThreadRead } from '@/lib/messaging/actions'
import type { Message } from '@/lib/messaging/queries'

type Props = {
  threadId: string
  initialMessages: Message[]
  currentUserId: string
}

export function ThreadView({
  threadId,
  initialMessages,
  currentUserId,
}: Props) {
  // Mark as read when the thread is opened
  useEffect(() => {
    markThreadRead(threadId).catch(() => {
      // Silent — best-effort
    })
  }, [threadId])

  return (
    <div className="flex flex-col h-full">
      <MessageList
        threadId={threadId}
        initialMessages={initialMessages}
        currentUserId={currentUserId}
      />
      <MessageComposer threadId={threadId} />
    </div>
  )
}