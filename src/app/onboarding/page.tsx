import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function OnboardingIndex() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, university, course, mentor_id, status')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')
  if (profile.status === 'active') redirect('/dashboard')

  // Figure out which step they're on
  const hasProfileInfo =
    profile.full_name && profile.university && profile.course && profile.phone

  if (!hasProfileInfo) redirect('/onboarding/profile')

  const { count: stackCount } = await supabase
    .from('intern_tech_stacks')
    .select('*', { count: 'exact', head: true })
    .eq('intern_id', user.id)

  if (!stackCount || stackCount === 0) redirect('/onboarding/tech-stack')

  // Everything done except mentor — send to pending
  redirect('/onboarding/pending')
}