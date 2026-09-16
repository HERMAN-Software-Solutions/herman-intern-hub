'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25 MB
const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'text/plain',
  'text/markdown',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export async function submitTaskWork(input: {
  taskId: string
  content: string
  fileName?: string | null
  fileSize?: number | null
  fileType?: string | null
  fileBase64?: string | null
}) {
  if (!input.content?.trim() || input.content.trim().length < 10) {
    return { error: 'Please describe your work (min 10 characters)' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Verify the task belongs to this intern
  const { data: task } = await supabase
    .from('tasks')
    .select('id, assigned_to, status')
    .eq('id', input.taskId)
    .eq('assigned_to', user.id)
    .maybeSingle()

  if (!task) return { error: 'Task not found or not assigned to you' }

  let fileUrl: string | null = null

  // Handle file upload
  if (input.fileBase64 && input.fileName && input.fileType) {
    if (input.fileSize && input.fileSize > MAX_FILE_SIZE) {
      return { error: 'File must be under 25 MB' }
    }
    if (!ALLOWED_TYPES.includes(input.fileType)) {
      return { error: 'File type not allowed. Use images, PDF, ZIP, or docs.' }
    }

    const buffer = Buffer.from(input.fileBase64, 'base64')
    const ext = input.fileName.split('.').pop() ?? 'bin'
    const path = `${user.id}/${input.taskId}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('submissions')
      .upload(path, buffer, {
        contentType: input.fileType,
        upsert: false,
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return { error: 'Failed to upload file. Try again.' }
    }

    const { data: signed } = await supabase.storage
      .from('submissions')
      .createSignedUrl(path, 60 * 60 * 24 * 365) // 1 year

    fileUrl = signed?.signedUrl ?? path
  }

  // Insert submission
  const { error: insertError } = await supabase.from('submissions').insert({
    task_id: input.taskId,
    intern_id: user.id,
    content: input.content.trim(),
    file_url: fileUrl,
    status: 'pending',
  })

  if (insertError) return { error: insertError.message }

  // Move task to 'review'
  await supabase
    .from('tasks')
    .update({ status: 'review' })
    .eq('id', input.taskId)
    .eq('assigned_to', user.id)

  revalidatePath(`/dashboard/tasks/${input.taskId}`)
  revalidatePath('/dashboard/tasks')
  revalidatePath('/dashboard')

  return { success: true }
}

export async function updateTaskStatus(
  taskId: string,
  status: 'todo' | 'in_progress' | 'review' | 'done'
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Interns can only set 'todo', 'in_progress', 'review' — not 'done'
  // 'done' is set by mentor approval (Session 4D)
  if (status === 'done') {
    return { error: 'Only a mentor can mark a task as done' }
  }

  const { error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)
    .eq('assigned_to', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/tasks/${taskId}`)
  revalidatePath('/dashboard/tasks')
  return { success: true }
}