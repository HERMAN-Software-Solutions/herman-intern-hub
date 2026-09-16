import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function OnboardingLayout({
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
    .select('status')
    .eq('id', user.id)
    .single()

  // If already active, send them to the real dashboard
  if (profile?.status === 'active') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            HERMAN Intern Hub
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Onboarding
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {children}
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Need help? Email{' '}
          <a
            href="mailto:infohermansoftware@gmail.com"
            className="text-blue-600 hover:underline"
          >
            infohermansoftware@gmail.com
          </a>
        </p>
      </div>
    </div>
  )
}