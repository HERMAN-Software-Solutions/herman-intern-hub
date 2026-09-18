'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateMentorProfile } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function MentorProfileForm({
  initial,
  email,
}: {
  initial: {
    fullName: string
    bio: string
    phone: string
  }
  email: string
}) {
  const router = useRouter()
  const [data, setData] = useState(initial)
  const [isPending, startTransition] = useTransition()

  function update<K extends keyof typeof data>(key: K, value: string) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const res = await updateMentorProfile(data)
      if (res.error) {
        toast.error(res.error)
        return
      }
      toast.success('Profile updated')
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Read-only info */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm">
        <div className="flex justify-between py-1">
          <span className="text-slate-500">Email</span>
          <span className="text-slate-900">{email}</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <Input
          name="fullName"
          label="Full name"
          required
          value={data.fullName}
          onChange={(e) => update('fullName', e.target.value)}
        />

        <Input
          name="phone"
          type="tel"
          label="Phone"
          placeholder="+256 700 000 000"
          value={data.phone}
          onChange={(e) => update('phone', e.target.value)}
        />

        <Textarea
          name="bio"
          label="Bio"
          rows={5}
          placeholder="Tell us about your experience and areas of expertise…"
          value={data.bio}
          onChange={(e) => update('bio', e.target.value)}
          hint="This appears on your mentor profile. Interns will see it."
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" size="md" loading={isPending}>
          {isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  )
}