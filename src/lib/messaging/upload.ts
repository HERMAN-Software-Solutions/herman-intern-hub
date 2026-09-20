'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const MAX_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

/**
 * Upload a file to the message-attachments bucket.
 * Storage path: {threadId}/{uuid}.{ext}
 * Returns the storage path (used later to generate signed URLs).
 */
export async function uploadMessageAttachment(
  formData: FormData
): Promise<
  | { success: true; path: string; name: string; size: number; type: string }
  | { error: string }
> {
  const file = formData.get('file') as File | null
  const threadId = formData.get('threadId') as string | null

  if (!file || !threadId) return { error: 'Missing file or thread' }
  if (file.size === 0) return { error: 'File is empty' }
  if (file.size > MAX_BYTES) {
    return { error: `File is too large (max ${MAX_BYTES / 1024 / 1024} MB)` }
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: `File type not allowed: ${file.type || 'unknown'}` }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const admin = createAdminClient()

  // Verify membership before we touch storage
  const { data: membership } = await admin.rpc('is_thread_member_for_user', {
    p_thread_id: threadId,
    p_user_id: user.id,
  })
  if (!membership) return { error: 'You do not have access to this thread' }

  // Build a safe path: {threadId}/{uuid}.{ext}
  const ext = file.name.includes('.')
    ? file.name.split('.').pop()!.toLowerCase()
    : 'bin'
  const uuid = crypto.randomUUID()
  const path = `${threadId}/${uuid}.${ext}`

  // Upload via the user's client so Storage RLS applies
  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from('message-attachments')
    .upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    console.error('uploadMessageAttachment error:', uploadError)
    return { error: uploadError.message }
  }

  return {
    success: true,
    path,
    name: file.name,
    size: file.size,
    type: file.type,
  }
}

/**
 * Generate a short-lived signed URL for a stored attachment.
 * Called from server components when rendering messages.
 * Client-side rendering uses the API route instead.
 */
export async function getAttachmentSignedUrl(
  path: string,
  expiresIn = 60 * 60 // 1 hour
): Promise<string | null> {
  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from('message-attachments')
    .createSignedUrl(path, expiresIn)

  if (error || !data) {
    console.error('getAttachmentSignedUrl error:', error)
    return null
  }
  return data.signedUrl
}