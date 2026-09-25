import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendPushToUser } from '@/lib/push/send'

/**
 * Internal endpoint to send a push notification to a user.
 * Requires an authenticated admin or service token.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body?.userId || !body?.title) {
    return NextResponse.json(
      { error: 'Missing userId or title' },
      { status: 400 }
    )
  }

  const result = await sendPushToUser(body.userId, {
    title: body.title,
    body: body.body ?? '',
    url: body.url,
    tag: body.tag,
  })

  return NextResponse.json(result)
}