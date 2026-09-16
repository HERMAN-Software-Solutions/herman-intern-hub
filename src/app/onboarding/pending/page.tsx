import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingProgress } from '../_components/progress'

export const metadata = {
  title: 'Waiting for mentor — HERMAN Intern Hub',
}

export default async function PendingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, mentor_id, status, start_date')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  if (profile.status === 'active') redirect('/dashboard')

  return (
    <div>
      <OnboardingProgress current="pending" />

      <div className="text-center py-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">✅</span>
        </div>

        <h2 className="text-xl font-bold text-slate-900">
          Setup complete!
        </h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
          {profile.full_name ? `Nice work, ${profile.full_name}. ` : ''}
          We're now assigning your mentor. This usually takes 1–2 business
          days. You'll get an email as soon as you're ready to go.
        </p>
      </div>

      <div className="mt-8 bg-slate-50 border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          What happens next
        </h3>
        <ul className="space-y-2 text-sm">
          <Check done label="Profile complete" />
          <Check done label="Tech stack selected" />
          <Check done label="Agreement signed" />
          <Check label="Mentor assignment" />
          <Check label="Full dashboard access" />
        </ul>
      </div>

      <div className="mt-6 text-xs text-slate-500 text-center">
        Questions? Email{' '}
        <a
          href="mailto:infohermansoftware@gmail.com"
          className="text-blue-600 hover:underline"
        >
          infohermansoftware@gmail.com
        </a>
      </div>
    </div>
  )
}

function Check({ done, label }: { done?: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
          done ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-400'
        }`}
      >
        {done ? '✓' : ''}
      </span>
      <span className={done ? 'text-slate-700' : 'text-slate-500'}>
        {label}
      </span>
    </li>
  )
}