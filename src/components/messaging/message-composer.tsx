'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { sendMessage } from '@/lib/messaging/actions'
import { toast } from 'sonner'

export function MessageComposer({ threadId }: { threadId: string }) {
  const [body, setBody] = useState('')
  const [isPending, startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow the textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [body])

  function handleSend() {
    const text = body.trim()
    if (!text || isPending) return

    startTransition(async () => {
      const res = await sendMessage({ threadId, body: text })
      if ('error' in res) {
        toast.error(res.error)
        return
      }
      setBody('')
      // Refocus
      textareaRef.current?.focus()
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-slate-200 bg-white p-3 flex items-end gap-2">
      <textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
        rows={1}
        disabled={isPending}
        className="flex-1 resize-none border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 disabled:bg-slate-50 max-h-40"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={!body.trim() || isPending}
        className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white flex items-center justify-center transition-colors"
        aria-label="Send message"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  )
}