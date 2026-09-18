'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveTechStacks(
  selections: { tech_stack_id: string; proficiency: string; is_primary: boolean }[]
) {
  if (!selections || selections.length === 0) {
    return { error: 'Select at least one tech stack' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // 🔒 Only interns in 'onboarding' status can save tech stacks here
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single()

  if (!profile) return { error: 'Profile not found' }
  if (profile.role !== 'intern') {
    return { error: 'Only interns can complete onboarding' }
  }
  if (profile.status !== 'onboarding') {
    return { error: 'Onboarding is already complete' }
  }

  // Delete existing and re-insert
  await supabase.from('intern_tech_stacks').delete().eq('intern_id', user.id)

  const rows = selections.map((s) => ({
    intern_id: user.id,
    tech_stack_id: s.tech_stack_id,
    proficiency: s.proficiency,
    is_primary: s.is_primary,
  }))

  const { error } = await supabase.from('intern_tech_stacks').insert(rows)

  if (error) return { error: error.message }

  revalidatePath('/onboarding')
  return { success: true }
}