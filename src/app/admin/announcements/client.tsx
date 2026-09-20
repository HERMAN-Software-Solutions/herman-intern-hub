'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Megaphone, Send, Trash2, Users } from 'lucide-react'
import {
  sendAnnouncement,
  deleteAnnouncement,
  type Audience,
} from '@/lib/announcements/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type UserOption = { id: string; name: string; email: string; role: string }

type AnnouncementRow = {
  id: string
  subject: string
  body: string
  audience: string
  sent_via_email: boolean
  recipient_count: number
  email_sent_count: number
  created_at: string
}

const AUDIENCE_LABELS: Record<string, string> = {
  everyone: 'Everyone',
  interns: 'All interns',
  mentors: 'All mentors',
  specific: 'Specific people',
}

export function AdminAnnouncementsClient({
  users,
  announcements,
}: {
  users: UserOption[]
  announcements: AnnouncementRow[]
}) {
  const router = useRouter()
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState<Audience>('everyone')
  const [specificIds, setSpecificIds] = useState<string[]>([])
  const [sendEmail, setSendEmail] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function toggleSpecific(id: string) {
    setSpecificIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function handleSend() {
    setError(null)
    if (!subject.trim()) {
      setError('Subject is required')
      return
    }
    if (!body.trim()) {
      setError('Message is required')
      return
    }
    if (audience === 'specific' && specificIds.length === 0) {
      setError('Select at least one person')
      return
    }

    startTransition(async () => {
      const res = await sendAnnouncement({
        subject,
        body,
        audience,
        specificUserIds: specificIds,
        sendEmail,
      })

      if ('error' in res) {
        setError(res.error)
        toast.error(res.error)
        return
      }

      toast.success(
        `Announcement sent to ${res.recipientCount} ${
          res.recipientCount === 1 ? 'person' : 'people'
        }`
      )
      setSubject('')
      setBody('')
      setSpecificIds([])
      setSendEmail(false)
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this announcement? This cannot be undone.')) return
    startTransition(async () => {
      const res = await deleteAnnouncement(id)
      if ('error' in res) {
        toast.error(res.error)
        return
      }
      toast.success('Announcement deleted')
      router.refresh()
    })
  }

  const recipientPreview =
    audience === 'everyone'
      ? users.length + 2 // rough: interns + mentors + admins
      : audience === 'interns'
        ? users.filter((u) => u.role === 'intern').length
        : audience === 'mentors'
          ? users.filter((u) => u.role === 'mentor').length
          : specificIds.length

  return (
    <div className="space-y-10">
      {/* Compose */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Megaphone className="w-4 h-4 text-slate-400" />
          <h2 className="font-semibold text-slate-900">
            New announcement
          </h2>
        </div>

        <div className="space-y-4">
          <Input
            name="subject"
            label="Subject"
            required
            placeholder="e.g. Welcome to HERMAN Intern Hub"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isPending}
          />

          <Textarea
            name="body"
            label="Message"
            required
            rows={10}
            placeholder="Write your message here. Line breaks are preserved."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={isPending}
            hint={`${body.length} characters`}
          />

          <Select
            name="audience"
            label="Audience"
            required
            value={audience}
            onChange={(e) => setAudience(e.target.value as Audience)}
            disabled={isPending}
          >
            <option value="everyone">Everyone (interns, mentors, admins)</option>
            <option value="interns">All interns only</option>
            <option value="mentors">All mentors only</option>
            <option value="specific">Specific people</option>
          </Select>

          {audience === 'specific' && (
            <div className="border border-slate-200 rounded-lg max-h-64 overflow-y-auto">
              {users.length === 0 ? (
                <p className="p-4 text-sm text-slate-500">
                  No users to select from.
                </p>
              ) : (
                users.map((u) => (
                  <label
                    key={u.id}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                  >
                    <input
                      type="checkbox"
                      checked={specificIds.includes(u.id)}
                      onChange={() => toggleSpecific(u.id)}
                      disabled={isPending}
                      className="w-4 h-4 accent-slate-900"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-900 truncate">
                        {u.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {u.email}
                      </div>
                    </div>
                    <Badge variant={u.role === 'mentor' ? 'info' : 'default'} size="sm">
                      {u.role}
                    </Badge>
                  </label>
                ))
              )}
            </div>
          )}

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              disabled={isPending}
              className="mt-1 w-4 h-4"
            />
            <div>
              <div className="text-sm font-medium text-slate-900">
                Also send as email
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Sends one email per recipient via Brevo. Use for important
                messages — interns get in-app notifications either way.
              </p>
            </div>
          </label>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="text-xs text-slate-500 inline-flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Will reach ~{recipientPreview}{' '}
              {recipientPreview === 1 ? 'person' : 'people'}
            </div>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleSend}
              loading={isPending}
              disabled={!subject.trim() || !body.trim()}
            >
              <Send className="w-4 h-4" />
              Send
            </Button>
          </div>

          {error && (
            <div
              role="alert"
              className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3"
            >
              {error}
            </div>
          )}
        </div>
      </Card>

      {/* Sent list */}
      <div>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
          Sent
        </h2>

        {announcements.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
            <p className="text-sm text-slate-500">
              No announcements yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => {
              const canDelete =
                Date.now() - new Date(a.created_at).getTime() < 60 * 60 * 1000
              return (
                <Card key={a.id} padding="sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center flex-shrink-0">
                      <Megaphone className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-medium text-slate-900 truncate">
                          {a.subject}
                        </div>
                        <Badge variant="info" size="sm">
                          {AUDIENCE_LABELS[a.audience] ?? a.audience}
                        </Badge>
                        {a.sent_via_email && (
                          <Badge variant="success" size="sm">
                            📧 {a.email_sent_count} emailed
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {a.body}
                      </p>
                      <div className="text-[11px] text-slate-400 mt-2">
                        {a.recipient_count} recipient
                        {a.recipient_count === 1 ? '' : 's'} ·{' '}
                        {timeAgo(a.created_at)}
                      </div>
                    </div>
                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => handleDelete(a.id)}
                        disabled={isPending}
                        className="text-slate-400 hover:text-red-600 transition-colors flex-shrink-0 p-1 disabled:opacity-50"
                        aria-label="Delete announcement"
                        title="Delete (within 1 hour)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
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