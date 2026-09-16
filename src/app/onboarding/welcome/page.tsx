import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Welcome — HERMAN Intern Hub',
}

export default async function OnboardingWelcomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, status')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="text-4xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}!
        </h1>
        <p className="text-slate-600 mt-3">
          Your account is ready. We're going to guide you through a quick
          onboarding so we can set up your internship properly.
        </p>

        <div className="mt-6 space-y-3 text-sm">
          <Step n={1} label="Complete your profile" active />
          <Step n={2} label="Choose your tech stack" />
          <Step n={3} label="Sign the internship agreement" />
          <Step n={4} label="Wait for your mentor to be assigned" />
        </div>

        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
          ⚠️ <strong>Session 3D coming soon.</strong> For now, this is a
          placeholder. The full onboarding wizard will live here.
        </div>

        <p className="text-xs text-slate-400 mt-6">
          Your status: <code>{profile?.status}</code>
        </p>
      </div>
    </div>
  )
}

function Step({
  n,
  label,
  active,
}: {
  n: number
  label: string
  active?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
          active
            ? 'bg-slate-900 text-white'
            : 'bg-slate-100 text-slate-500'
        }`}
      >
        {n}
      </div>
      <span
        className={active ? 'text-slate-900 font-medium' : 'text-slate-500'}
      >
        {label}
      </span>
    </div>
  )
}