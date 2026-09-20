import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAttachmentSignedUrl } from '@/lib/messaging/upload'

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path')
  if (!path) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 })
  }

  // Verify auth + thread access
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Path shape: {threadId}/{uuid}.{ext}
  const threadId = path.split('/')[0]
  if (!threadId) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: membership } = await admin.rpc('is_thread_member_for_user', {
    p_thread_id: threadId,
    p_user_id: user.id,
  })
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const signedUrl = await getAttachmentSignedUrl(path, 60 * 60)
  if (!signedUrl) {
    return NextResponse.json(
      { error: 'Could not generate URL' },
      { status: 500 }
    )
  }

  // Redirect the browser to the signed Supabase URL
  return NextResponse.redirect(signedUrl)
}