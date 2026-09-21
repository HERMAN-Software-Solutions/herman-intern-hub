'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Camera, Loader2, Trash2, User } from 'lucide-react'
import { uploadAvatar, removeAvatar } from '@/lib/avatars/upload'
import { Button } from '@/components/ui/button'

export function AvatarUploader({
  currentUrl,
  name,
}: {
  currentUrl: string | null
  name: string
}) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [pending, setPending] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleFile(file: File) {
    // Local preview immediately
    const localUrl = URL.createObjectURL(file)
    setPreview(localUrl)
    setPending(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await uploadAvatar(formData)

      if ('error' in res) {
        toast.error(res.error)
        setPreview(currentUrl) // revert
        return
      }

      setPreview(res.url)
      toast.success('Profile photo updated')
      router.refresh()
    } catch (err: any) {
      toast.error(err?.message ?? 'Upload failed')
      setPreview(currentUrl)
    } finally {
      setPending(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  function handleRemove() {
    if (!confirm('Remove your profile photo?')) return
    startTransition(async () => {
      const res = await removeAvatar()
      if ('error' in res) {
        toast.error(res.error)
        return
      }
      setPreview(null)
      toast.success('Profile photo removed')
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
      <div className="relative flex-shrink-0">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center">
          {preview ? (
            <img
              src={preview}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-10 h-10 text-slate-400" />
          )}
        </div>

        {(pending || isPending) && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div>
          <h3 className="font-semibold text-slate-900">Profile photo</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            JPEG, PNG, or WebP — up to 2 MB. This shows in messages and your
            profile.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileRef.current?.click()}
            disabled={pending || isPending}
          >
            <Camera className="w-3.5 h-3.5" />
            {preview ? 'Change photo' : 'Upload photo'}
          </Button>

          {preview && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={pending || isPending}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}