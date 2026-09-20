import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { AdminAnnouncementsClient } from './client'

export const metadata = { title: 'Announcements — HERMAN Admin' }
export const dynamic = 'force-dynamic'

export default async function AdminAnnouncementsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    redirect('/dashboard')
  }

  // Fetch recipients for the "specific" dropdown
  const { data: users } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, is_demo')
    .in('role', ['intern', 'mentor'])
    .eq('status', 'active')
    .order('full_name')

  const { data: announcements } = await supabase
    .from('announcements')
    .select(
      `id, subject, body, audience, sent_via_email, recipient_count,
       email_sent_count, created_at`
    )
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
      <PageHeader
        title="Announcements"
        description="Send a message to everyone, or to specific groups. In-app by default; optional email too."
      />

      <AdminAnnouncementsClient
        users={(users ?? []).map((u) => ({
          id: u.id,
          name: u.full_name ?? u.email,
          email: u.email,
          role: u.role,
        }))}
        announcements={announcements ?? []}
      />
    </div>
  )
}