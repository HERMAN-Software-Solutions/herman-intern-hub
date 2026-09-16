import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InternSidebar } from './_components/intern-sidebar'

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

  // If not an intern, maybe an admin visiting — allow
  // (Admins use /admin, but they can see /dashboard too)

  return (
    <div className="flex min-h-screen bg-slate-50">
      <InternSidebar internName={profile.full_name ?? profile.email} />
      <main className="flex-1 overflow-x-auto">{children}</main>
    </div>
  )
}