'use server'

import { createClient } from '@/lib/supabase/server'

export async function getSignedUrl(storagePath: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(storagePath, 60 * 60) // 1 hour

  if (error || !data) {
    return { error: 'Could not generate download link' }
  }

  return { url: data.signedUrl }
}