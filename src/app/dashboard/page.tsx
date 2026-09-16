import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, status')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome, {profile?.full_name ?? user.email}
        </h1>
        <p className="text-slate-500 mt-2">
          Role: <span className="font-mono">{profile?.role}</span> · Status:{' '}
          <span className="font-mono">{profile?.status}</span>
        </p>
      </div>
    </div>
  )
}