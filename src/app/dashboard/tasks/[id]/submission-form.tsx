'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { submitTaskWork, updateTaskStatus } from './actions'

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25 MB
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
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      {currentStatus === 'todo' && (
        <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <div className="font-medium text-blue-900">
            Starting this task?
          </div>
          <p className="text-xs text-blue-700 mt-1 mb-3">
            Mark it as in progress so your mentor knows you're on it.
          </p>
          <button
            onClick={handleMarkInProgress}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-xs font-medium px-3 py-1.5 rounded transition-colors"
          >
            {isPending ? 'Updating…' : 'Mark as in progress'}
          </button>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          What did you do?
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          placeholder="Describe the work you completed, decisions you made, links to resources…"
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none text-sm"
        />
        <div className="text-xs text-slate-400 mt-1">
          {content.length} characters (min 10)
        </div>
      </div>

      <div className="mt-5">
        <label
          htmlFor="submission-file"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Attach a file (optional)
        </label>
        <input
          id="submission-file"
          type="file"
          onChange={handleFileChange}
          accept={ACCEPT}
          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-900 file:text-white file:font-medium file:text-sm hover:file:bg-slate-800 file:cursor-pointer cursor-pointer"
        />
        {file && (
          <div className="text-xs text-slate-500 mt-2">
            Selected: <strong>{file.name}</strong> (
            {(file.size / 1024).toFixed(0)} KB)
          </div>
        )}
        <p className="text-xs text-slate-400 mt-2">
          Images, PDFs, ZIPs, or docs · Max 25 MB
        </p>
      </div>

      {error && (
        <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="mt-5 w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-medium py-2.5 rounded-lg transition-colors"
      >
        {isPending ? 'Submitting…' : 'Submit work for review'}
      </button>
    </div>
  )
}