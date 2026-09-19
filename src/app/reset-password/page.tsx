import { redirect } from 'next/navigation'
import { StandaloneLayout } from '@/components/layout/standalone-layout'
import { createClient } from '@/lib/supabase/server'
import { ResetForm } from './reset-form'

export const metadata = {
  title: 'Reset password — HERMAN Intern Hub',
}

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no session (invalid/expired link), send them to forgot-password
  if (!user) {
    redirect('/forgot-password?error=expired_link')
  }

  return (
    <StandaloneLayout showBreadcrumbs={false}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900">
              Set a new password
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Choose a strong password you haven&apos;t used before.
            </p>
          </div>

          <ResetForm email={user.email ?? ''} />
        </div>
      </div>
    </StandaloneLayout>
  )
}