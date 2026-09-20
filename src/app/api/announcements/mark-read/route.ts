import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const announcementId = body?.announcementId as string | undefined
  if (!announcementId) {
    return NextResponse.json({ error: 'Missing announcementId' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('announcement_recipients')
    .update({ read_at: new Date().toISOString() })
    .eq('announcement_id', announcementId)
    .eq('user_id', user.id)
    .is('read_at', null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}