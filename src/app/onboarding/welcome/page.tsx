import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Welcome — HERMAN Intern Hub',
}

export default async function WelcomePage() {
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

  // Already done — send them to the router which handles routing
  if (profile?.status === 'active') redirect('/dashboard')

  return (
    <div>
      <div className="text-4xl mb-4">🎉</div>

      <h2 className="text-2xl font-bold text-slate-900">
        Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}!
      </h2>

      <p className="text-slate-600 mt-3">
        Your account is ready. Next, we'll guide you through a short setup so
        your internship can start smoothly.
      </p>

      <div className="mt-8 space-y-3 text-sm">
        <Step n={1} label="Complete your profile" hint="~2 min" />
        <Step n={2} label="Choose your tech stack" hint="~1 min" />
        <Step n={3} label="Wait for mentor assignment" hint="1–2 days" />
      </div>

      <div className="mt-8">
        <Link
          href="/onboarding"
          className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          Let's start →
        </Link>
      </div>
    </div>
  )
}

function Step({
  n,
  label,
  hint,
}: {
  n: number
  label: string
  hint?: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold bg-slate-100 text-slate-700">
        {n}
      </div>
      <div className="flex-1">
        <span className="text-slate-900 font-medium">{label}</span>
      </div>
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </div>
  )
}