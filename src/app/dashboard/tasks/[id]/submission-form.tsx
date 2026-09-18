'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Paperclip, X } from 'lucide-react'
import { submitTaskWork, updateTaskStatus } from './actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

const MAX_FILE_SIZE = 25 * 1024 * 1024
const ACCEPT =
  'image/*,.pdf,.zip,.doc,.docx,.txt,.md,application/pdf,application/zip'

export function SubmissionForm({
  taskId,
  currentStatus,
}: {
  taskId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setError(null)

    if (f && f.size > MAX_FILE_SIZE) {
      setError('File must be under 25 MB')
      toast.error('File too large', {
        description: 'Maximum file size is 25 MB.',
      })
      setFile(null)
      e.target.value = ''
      return
    }
    setFile(f)
  }

  async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  function handleSubmit() {
    setError(null)

    if (!content.trim() || content.trim().length < 10) {
      const msg = 'Please describe your work (min 10 characters)'
      setError(msg)
      toast.error(msg)
      return
    }

    startTransition(async () => {
      let fileBase64: string | null = null

      if (file) {
        try {
          fileBase64 = await fileToBase64(file)
        } catch {
          const msg = 'Could not read file. Try a smaller one.'
          setError(msg)
          toast.error(msg)
          return
        }
      }

      const res = await submitTaskWork({
        taskId,
        content,
        fileName: file?.name ?? null,
        fileSize: file?.size ?? null,
        fileType: file?.type ?? null,
        fileBase64,
      })

      if (res.error) {
        setError(res.error)
        toast.error(res.error)
        return
      }

      setContent('')
      setFile(null)
      toast.success('Work submitted for review', {
        description: 'Your mentor will review it shortly.',
      })
      router.refresh()
    })
  }

  function handleMarkInProgress() {
    startTransition(async () => {
      const res = await updateTaskStatus(taskId, 'in_progress')
      if (res.error) {
        setError(res.error)
        toast.error(res.error)
      } else {
        toast.success('Task marked as in progress')
        router.refresh()
      }
    })
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
      {currentStatus === 'todo' && (
        <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <div className="font-medium text-blue-900">Starting this task?</div>
          <p className="text-xs text-blue-700 mt-1 mb-3">
            Mark it as in progress so your mentor knows you&apos;re on it.
          </p>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleMarkInProgress}
            disabled={isPending}
          >
            {isPending ? 'Updating…' : 'Mark as in progress'}
          </Button>
        </div>
      )}

      <Textarea
        name="content"
        label="What did you do?"
        rows={6}
        placeholder="Describe the work you completed, decisions you made, links to resources…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        hint={`${content.length} characters (min 10)`}
      />

      <div className="mt-5">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Attach a file (optional)
        </label>

        {file ? (
          <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <Paperclip className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <span className="text-sm text-slate-700 truncate">
                {file.name}
              </span>
              <span className="text-xs text-slate-400 flex-shrink-0">
                ({(file.size / 1024).toFixed(0)} KB)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="text-slate-400 hover:text-slate-700 transition-colors"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label
            htmlFor="submission-file"
            className="block border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-lg p-5 text-center cursor-pointer transition-colors"
          >
            <Paperclip className="w-5 h-5 text-slate-400 mx-auto mb-2" />
            <div className="text-sm text-slate-600">
              <span className="font-medium">Click to upload</span> or drag and
              drop
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Images, PDFs, ZIPs, or docs · Max 25 MB
            </p>
            <input
              id="submission-file"
              type="file"
              onChange={handleFileChange}
              accept={ACCEPT}
              className="sr-only"
            />
          </label>
        )}
      </div>

      {error && (
        <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      <Button
        type="button"
        variant="primary"
        size="md"
        fullWidth
        onClick={handleSubmit}
        loading={isPending}
        className="mt-5"
      >
        {isPending ? 'Submitting…' : 'Submit work for review'}
      </Button>
    </div>
  )
}