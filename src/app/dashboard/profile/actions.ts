'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(input: {
  full_name: string
  phone: string
  bio: string
  university: string
  course: string
  year_of_study: string
  directory_visible: boolean
}) {
  if (!input.full_name?.trim()) return { error: 'Full name is required' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: input.full_name.trim(),
      phone: input.phone.trim() || null,
      bio: input.bio.trim() || null,
      university: input.university.trim() || null,
      course: input.course.trim() || null,
      year_of_study: input.year_of_study.trim() || null,
      directory_visible: input.directory_visible,
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/profile')
  return { success: true }
}