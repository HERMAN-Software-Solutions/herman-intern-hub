'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upsertLog(input: {
  date: string
  hours: number
  description: string
}) {
  if (!input.date) return { error: 'Date is required' }
  if (input.hours <= 0 || input.hours > 24)
    return { error: 'Hours must be between 0 and 24' }
  if (!input.description?.trim() || input.description.length < 5)
    return { error: 'Description must be at least 5 characters' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('daily_logs').upsert(
    {
      intern_id: user.id,
      date: input.date,
      hours_worked: input.hours,
      description: input.description.trim(),
    },
    { onConflict: 'intern_id,date' }
  )

  if (error) return { error: error.message }

  revalidatePath('/dashboard/logs')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteLog(logId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('daily_logs')
    .delete()
    .eq('id', logId)
    .eq('intern_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/logs')
  revalidatePath('/dashboard')
  return { success: true }
}