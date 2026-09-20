'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { Send, Paperclip, X, Loader2 } from 'lucide-react'
import { sendMessage } from '@/lib/messaging/actions'
import { uploadMessageAttachment } from '@/lib/messaging/upload'
import { toast } from 'sonner'

type Pending = {
  name: string
  size: number
  type: string
  path: string
}

export function MessageComposer({ threadId }: { threadId: string }) {
  const [body, setBody] = useState('')
  const [pending, setPending] = useState<Pending | null>(null)
  const [uploading, setUploading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [body])

  async function handleFile(file: File) {
    if (uploading) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('threadId', threadId)

      const res = await uploadMessageAttachment(formData)
      if ('error' in res) {
        toast.error(res.error)
        return
      }
      setPending({
        name: res.name,
        size: res.size,
        type: res.type,
        path: res.path,
      })
    } catch (err: any) {
      toast.error(err?.message ?? 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  function handlePaste(e: React.ClipboardEvent) {
    const item = Array.from(e.clipboardData.items).find((i) =>
      i.type.startsWith('image/')
    )
    if (item) {
      const file = item.getAsFile()
      if (file) {
        e.preventDefault()
        handleFile(file)
      }
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  function handleSend() {
    const text = body.trim()
    if ((!text && !pending) || isPending || uploading) return

    startTransition(async () => {
      const res = await sendMessage({
        threadId,
        body: text || (pending ? `📎 ${pending.name}` : ''),
        fileUrl: pending?.path ?? null,
        fileName: pending?.name ?? null,
      })

      if ('error' in res) {
        toast.error(res.error)
        return
      }
      setBody('')
      setPending(null)
      textareaRef.current?.focus()
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const canSend = (body.trim() || pending) && !isPending && !uploading

  return (
    <div
      className="border-t border-slate-200 bg-white p-3"
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* Pending attachment preview */}
      {pending && (
        <div className="mb-2 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          {pending.type.startsWith('image/') ? (
            <span className="text-lg">🖼️</span>
          ) : (
            <span className="text-lg">📎</span>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm text-slate-900 truncate">
              {pending.name}
            </div>
            <div className="text-xs text-slate-500">
              {(pending.size / 1024).toFixed(0)} KB
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPending(null)}
            className="text-slate-400 hover:text-red-600 transition-colors"
            aria-label="Remove attachment"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || isPending}
          className="flex-shrink-0 w-10 h-10 rounded-xl border border-slate-300 hover:border-slate-500 disabled:opacity-50 text-slate-600 flex items-center justify-center transition-colors"
          aria-label="Attach file"
          title="Attach file"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Paperclip className="w-4 h-4" />
          )}
        </button>

        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Type a message… (Enter to send, Shift+Enter for newline. Paste or drop a file to attach.)"
          rows={1}
          disabled={isPending}
          className="flex-1 resize-none border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 disabled:bg-slate-50 max-h-40"
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white flex items-center justify-center transition-colors"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}