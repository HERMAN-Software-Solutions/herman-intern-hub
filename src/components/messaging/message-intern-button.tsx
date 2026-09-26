'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { MessageSquare } from 'lucide-react'
import { ensureThreadForIntern } from '@/lib/messaging/ensure-thread-for-intern'

export function MessageInternButton({
  internId,
  label = 'Message intern',
}: {
  internId: string
  label?: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const res = await ensureThreadForIntern(internId)
      if ('error' in res) {
        toast.error(res.error)
        return
      }
      router.push(`/mentor/messages/${res.threadId}`)
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 disabled:bg-slate-100 disabled:cursor-not-allowed text-slate-700 border border-slate-300 hover:border-slate-400 font-medium px-4 py-2.5 rounded-lg transition-colors text-sm"
    >
      <MessageSquare className="w-4 h-4" />
      {isPending ? 'Opening…' : label}
    </button>
  )
}