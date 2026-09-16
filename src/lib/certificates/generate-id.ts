import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Generates a unique certificate ID: HRM-YYYY-NNNN
 * Uses the certificate_id_seq sequence from Postgres.
 */
export async function generateCertificateId(): Promise<string> {
  const supabase = createAdminClient()

  const { data, error } = await supabase.rpc('next_certificate_id')

  if (error || !data) {
    throw new Error(`Failed to generate certificate ID: ${error?.message}`)
  }

  return data as string
}