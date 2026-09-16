'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveProfile(input: {
  full_name: string
  phone: string
  university: string
  course: string
  year_of_study: string
  bio: string
}) {
  if (!input.full_name?.trim()) return { error: 'Full name is required' }
  if (!input.phone?.trim()) return { error: 'Phone is required' }
  if (!input.university?.trim()) return { error: 'University is required' }
  if (!input.course?.trim()) return { error: 'Course is required' }
  if (!input.year_of_study?.trim()) return { error: 'Year of study is required' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: input.full_name.trim(),
      phone: input.phone.trim(),
      university: input.university.trim(),
      course: input.course.trim(),
      year_of_study: input.year_of_study.trim(),
      bio: input.bio?.trim() || null,
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/onboarding')
  return { success: true }
}