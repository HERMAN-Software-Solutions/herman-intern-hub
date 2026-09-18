import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/ui/page-header'
import { MentorProfileForm } from './profile-form'

export const metadata = { title: 'My Profile — HERMAN Mentor Panel' }

export default async function MentorProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, phone, bio, role')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
      <PageHeader
        title="My profile"
        description="Update your mentor profile information."
      />

      <MentorProfileForm
        initial={{
          fullName: profile.full_name ?? '',
          bio: profile.bio ?? '',
          phone: profile.phone ?? '',
        }}
        email={profile.email}
      />
    </div>
  )
}