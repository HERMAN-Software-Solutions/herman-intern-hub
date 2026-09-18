import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/ui/page-header'
import { NotificationList } from './list'

export const metadata = { title: 'Notifications — HERMAN Intern Hub' }

export default async function NotificationsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, type, title, body, link, read_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <PageHeader
        title="Notifications"
        description="Updates about your internship."
      />

      <NotificationList notifications={notifications ?? []} />
    </div>
  )
}