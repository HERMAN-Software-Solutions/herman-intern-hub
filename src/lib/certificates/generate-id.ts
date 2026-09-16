import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

export async function generateCertificateId(): Promise<string> {
  const supabase = createAdminClient()

  const { data, error } = await supabase.rpc('next_certificate_id')

  if (error || !data) {
    throw new Error(`Failed to generate certificate ID: ${error?.message}`)
  }

  return data as string
}