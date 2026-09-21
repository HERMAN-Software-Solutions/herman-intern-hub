import 'server-only'
import { createClient } from '@/lib/supabase/server'

/**
 * Returns real (non-demo), active interns.
 * Use this everywhere you need an intern list in admin/mentor panels.
 */
export async function getRealActiveInterns() {
  const supabase = await createClient()
  return supabase
    .from('profiles')
    .select('id, full_name, email, avatar_url, status')
    .eq('role', 'intern')
    .eq('status', 'active')
    .eq('is_demo', false)
    .order('full_name')
}