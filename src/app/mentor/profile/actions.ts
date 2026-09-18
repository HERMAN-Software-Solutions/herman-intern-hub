'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateMentorProfile(input: {
  fullName: string
  bio: string
  phone: string
}) {
  if (!input.fullName?.trim()) return { error: 'Full name is required' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: input.fullName.trim(),
      bio: input.bio?.trim() || null,
      phone: input.phone?.trim() || null,
    })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/mentor')
  revalidatePath('/mentor/profile')
  return { success: true }
}