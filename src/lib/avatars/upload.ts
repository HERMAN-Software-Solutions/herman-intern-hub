'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

const MAX_BYTES = 2 * 1024 * 1024 // 2 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function uploadAvatar(
  formData: FormData
): Promise<{ success: true; url: string } | { error: string }> {
  const file = formData.get('file') as File | null
  if (!file) return { error: 'No file provided' }
  if (file.size === 0) return { error: 'File is empty' }
  if (file.size > MAX_BYTES) {
    return { error: `Image is too large (max ${MAX_BYTES / 1024 / 1024} MB)` }
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: `Only JPEG, PNG, and WebP are allowed` }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Path: {user_id}/avatar.{ext}  — overwrites any previous avatar
  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${user.id}/avatar.${ext}`

  // Upload via user client (RLS applies)
  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    console.error('uploadAvatar error:', uploadError)
    return { error: uploadError.message }
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)

  // Cache-bust: append a version query so browsers pick up the new file
  const version = Date.now()
  const publicUrl = `${urlData.publicUrl}?v=${version}`

  // Update the profile
  const admin = createAdminClient()
  const { error: profileError } = await admin
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id)

  if (profileError) {
    console.error('Avatar profile update error:', profileError)
    return { error: profileError.message }
  }

  // Revalidate relevant pages
  revalidatePath('/dashboard/profile')
  revalidatePath('/mentor/profile')
  revalidatePath('/dashboard/messages')
  revalidatePath('/mentor/messages')

  return { success: true, url: publicUrl }
}

export async function removeAvatar(): Promise<
  { success: true } | { error: string }
> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  // List and remove any files in the user's folder
  const { data: files } = await supabase.storage
    .from('avatars')
    .list(user.id)

  if (files && files.length > 0) {
    const paths = files.map((f) => `${user.id}/${f.name}`)
    await supabase.storage.from('avatars').remove(paths)
  }

  // Clear avatar_url on the profile
  const { error } = await admin
    .from('profiles')
    .update({ avatar_url: null })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/profile')
  revalidatePath('/mentor/profile')

  return { success: true }
}