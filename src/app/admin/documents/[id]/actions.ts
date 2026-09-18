'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

/**
 * Revoke a document (certificate or letter).
 * Only admins/super_admins can revoke.
 */
export async function revokeDocument(documentId: string, reason: string) {
  if (!reason?.trim() || reason.trim().length < 5) {
    return { error: 'Please provide a reason (min 5 characters)' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: actor } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!actor || (actor.role !== 'admin' && actor.role !== 'super_admin')) {
    return { error: 'Only admins can revoke documents' }
  }

  const admin = createAdminClient()

  // Fetch document to confirm it exists
  const { data: doc } = await admin
    .from('documents')
    .select('id, intern_id, type, certificate_id')
    .eq('id', documentId)
    .single()

  if (!doc) return { error: 'Document not found' }

  // Mark as unverified + record reason in metadata
  const { error } = await admin
    .from('documents')
    .update({
      verified: false,
    })
    .eq('id', documentId)

  if (error) return { error: error.message }

  // Audit log
  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: 'document.revoked',
    entity: 'documents',
    entity_id: documentId,
    metadata: {
      internId: doc.intern_id,
      type: doc.type,
      certificateId: doc.certificate_id,
      reason: reason.trim(),
    },
  })

  revalidatePath('/admin/documents')
  revalidatePath(`/admin/documents/${documentId}`)

  return { success: true }
}

/**
 * Restore a previously revoked document.
 */
export async function restoreDocument(documentId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: actor } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!actor || (actor.role !== 'admin' && actor.role !== 'super_admin')) {
    return { error: 'Only admins can restore documents' }
  }

  const admin = createAdminClient()

  const { error } = await admin
    .from('documents')
    .update({ verified: true })
    .eq('id', documentId)

  if (error) return { error: error.message }

  await admin.from('audit_log').insert({
    actor_id: user.id,
    action: 'document.restored',
    entity: 'documents',
    entity_id: documentId,
  })

  revalidatePath('/admin/documents')
  revalidatePath(`/admin/documents/${documentId}`)

  return { success: true }
}