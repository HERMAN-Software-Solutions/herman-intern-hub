import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { InviteForm } from './invite-form'

export const metadata = { title: 'Invite Mentor — HERMAN Admin' }

export default function InviteMentorPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <Link
        href="/admin/mentors"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to mentors
      </Link>

      <PageHeader
        title="Invite a mentor"
        description="They'll receive an email with a link to set their password and join."
      />

      <InviteForm />
    </div>
  )
}