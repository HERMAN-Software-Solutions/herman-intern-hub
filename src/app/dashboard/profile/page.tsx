import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from './profile-form'

export const metadata = { title: 'Profile — HERMAN Intern Hub' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      `full_name, email, phone, bio, university, course, year_of_study,
       avatar_url, start_date, end_date, status, directory_visible,
       mentor:mentor_id (full_name, email)`
    )
    .eq('id', user.id)
    .single()

  if (!profile) return null

  const mentorRaw = (profile as any).mentor
  const mentor = Array.isArray(mentorRaw) ? mentorRaw[0] : mentorRaw

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Profile
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Manage your internship profile and contact details.
        </p>
      </div>

      <ProfileForm
        initial={{
          full_name: profile.full_name ?? '',
          phone: profile.phone ?? '',
          bio: profile.bio ?? '',
          university: profile.university ?? '',
          course: profile.course ?? '',
          year_of_study: profile.year_of_study ?? '',
          directory_visible: profile.directory_visible ?? false,
        }}
        email={profile.email}
        mentorName={mentor?.full_name ?? mentor?.email ?? null}
      />
    </div>
  )
}