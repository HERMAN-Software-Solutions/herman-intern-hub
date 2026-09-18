import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Mentor Dashboard — HERMAN Intern Hub' }

export default async function MentorDashboardPage() {
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

  if (!profile || (profile.role !== 'mentor' && profile.role !== 'admin' && profile.role !== 'super_admin')) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900">
          Welcome, {profile.full_name ?? profile.email}
        </h1>
        <p className="text-slate-500 mt-2">
          Your mentor dashboard is coming soon. In the meantime, use the
          admin panel to manage your interns.
        </p>

        <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-900 mb-3">
            Quick links
          </h2>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="/admin/interns"
                className="text-blue-600 hover:underline"
              >
                View assigned interns →
              </a>
            </li>
            <li>
              <a
                href="/admin/submissions"
                className="text-blue-600 hover:underline"
              >
                Review submissions →
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}