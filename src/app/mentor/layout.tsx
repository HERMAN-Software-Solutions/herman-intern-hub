import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MentorSidebar } from '@/components/layout/mentor-sidebar'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { DrawerLayout } from '@/components/layout/drawer-layout'
import { AnnouncementPopup } from '@/components/announcements/announcement-popup'
import { getNewestUnreadAnnouncement } from '@/lib/announcements/queries'

export default async function MentorLayout({
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
    .select('full_name, email, role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const allowedRoles = ['mentor', 'admin', 'super_admin']
  if (!allowedRoles.includes(profile.role)) {
    redirect('/dashboard')
  }

  const isAdmin = profile.role === 'admin' || profile.role === 'super_admin'

  // Fetch unread announcement for the popup
  const unreadAnnouncement = await getNewestUnreadAnnouncement()

  return (
    <>
      <AnnouncementPopup
        initialUnread={unreadAnnouncement}
        viewBasePath="/mentor/announcements"
      />
      <DrawerLayout
        sidebar={
          <MentorSidebar
            mentorName={profile.full_name ?? profile.email}
            isAdmin={isAdmin}
          />
        }
        headerRight={<NotificationBell />}
      >
        {children}
      </DrawerLayout>
    </>
  )
}