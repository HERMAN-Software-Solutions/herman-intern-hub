import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from './_components/admin-sidebar'

export default async function AdminLayout({
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

  if (
    !profile ||
    (profile.role !== 'admin' && profile.role !== 'super_admin')
  ) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar adminName={profile.full_name ?? profile.email} />
      <main className="flex-1 overflow-x-auto">{children}</main>
    </div>
  )
}