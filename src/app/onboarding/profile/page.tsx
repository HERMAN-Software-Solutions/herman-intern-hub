import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingProgress } from '../_components/progress'
import { ProfileForm } from './profile-form'

export const metadata = {
  title: 'Your profile — HERMAN Intern Hub',
}

export default async function ProfileStep() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, university, course, year_of_study, bio, status')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  if (profile.status === 'active') redirect('/dashboard')

  return (
    <div>
      <OnboardingProgress current="profile" />

      <h2 className="text-xl font-bold text-slate-900 mb-1">
        Complete your profile
      </h2>
      <p className="text-sm text-slate-500 mb-6">
        This information appears on your intern record and your public profile
        (if you choose to be listed).
      </p>

      <ProfileForm
        initial={{
          full_name: profile.full_name ?? '',
          phone: profile.phone ?? '',
          university: profile.university ?? '',
          course: profile.course ?? '',
          year_of_study: profile.year_of_study ?? '',
          bio: profile.bio ?? '',
        }}
      />
    </div>
  )
}