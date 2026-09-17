import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InternSidebar } from './_components/intern-sidebar'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { DrawerLayout } from '@/components/layout/drawer-layout'

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

  if (profile.status === 'onboarding') redirect('/onboarding')

  return (
    <DrawerLayout
      sidebar={
        <InternSidebar internName={profile.full_name ?? profile.email} />
      }
      headerRight={<NotificationBell />}
    >
      {children}
    </DrawerLayout>
  )
}