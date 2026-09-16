import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InternSidebar } from './_components/intern-sidebar'
import { NotificationBell } from '@/components/notifications/notification-bell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role, status')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // If intern hasn't finished onboarding, send them there
  if (profile.status === 'onboarding') redirect('/onboarding')

  return (
    <div className="flex min-h-screen bg-slate-50">
      <InternSidebar internName={profile.full_name ?? profile.email} />
      <main className="flex-1 overflow-x-auto flex flex-col">
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200 px-6 py-3 flex items-center justify-end">
          <NotificationBell />
        </div>
        <div className="flex-1">{children}</div>
      </main>
    </div>
  )
}