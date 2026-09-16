'use server'

import { createClient } from '@/lib/supabase/server'
import { generateCertificate } from '@/lib/certificates/generate-pdf'
import { revalidatePath } from 'next/cache'

export async function issueCertificate(internId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const result = await generateCertificate(internId, user.id)

  if (!result.success) return { error: result.error }

  revalidatePath(`/admin/interns/${internId}`)
  revalidatePath('/dashboard/documents')

  return {
    success: true,
    certificateId: result.certificateId,
    score: result.score,
  }
}