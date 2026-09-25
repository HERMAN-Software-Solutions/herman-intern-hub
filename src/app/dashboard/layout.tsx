import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InternSidebar } from './_components/intern-sidebar'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { DrawerLayout } from '@/components/layout/drawer-layout'
import { AnnouncementPopup } from '@/components/announcements/announcement-popup'
import { getNewestUnreadAnnouncement } from '@/lib/announcements/queries'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { PushManager } from '@/components/pwa/push-manager'

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

  // 🔒 Role guard: only interns can access /dashboard
  if (profile.role !== 'intern') {
    if (profile.role === 'mentor') redirect('/mentor')
    if (profile.role === 'admin' || profile.role === 'super_admin') {
      redirect('/admin')
    }
    redirect('/login')
  }

  // Onboarding gate
  if (profile.status === 'onboarding') redirect('/onboarding')

  // Fetch unread announcement for popup
  const unreadAnnouncement = await getNewestUnreadAnnouncement()

  return (
    <>
      <AnnouncementPopup
        initialUnread={unreadAnnouncement}
        viewBasePath="/dashboard/announcements"
      />
      <InstallPrompt />
      <PushManager />
      <DrawerLayout
        sidebar={
          <InternSidebar internName={profile.full_name ?? profile.email} />
        }
        headerRight={<NotificationBell />}
      >
        {children}
      </DrawerLayout>
    </>
  )
}