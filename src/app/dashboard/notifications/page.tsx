import { createClient } from '@/lib/supabase/server'
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
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
        <p className="text-slate-500 mt-1">
          Updates about your internship.
        </p>
      </div>

      <NotificationList notifications={notifications ?? []} />
    </div>
  )
}