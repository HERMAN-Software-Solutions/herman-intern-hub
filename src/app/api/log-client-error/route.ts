import { NextResponse, type NextRequest } from 'next/server'
import { sendClientErrorAlert } from '@/lib/email/send'

// ─── Rate limit state ────────────────────────────────────
// Keyed by error signature; value is the last time we emailed.
// Cleared automatically by process restarts (fine for our volume).
const recentAlerts = new Map<string, number>()
const ALERT_WINDOW_MS = 30 * 60 * 1000 // 30 minutes

function signature(input: {
  label?: string
  message?: string
  url?: string
}): string {
  // Collapse the signature: ignore query strings and stack
  const url = (input.url ?? '').split('?')[0]
  return `${input.label ?? ''}|${input.message ?? ''}|${url}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      message,
      digest,
      stack,
      url,
      userAgent,
      timestamp,
      label,
    } = body ?? {}

    // 1. Always log to Vercel Logs (searchable)
    console.error(
      `[client-error][${label ?? 'unknown'}] ${message ?? 'unknown error'}`,
      JSON.stringify(
        {
          message,
          digest,
          url,
          userAgent,
          timestamp,
          stack: stack?.slice?.(0, 2000),
        },
        null,
        2
      )
    )

    // 2. Decide whether to also email
    const sig = signature({ label, message, url })
    const now = Date.now()
    const lastAlert = recentAlerts.get(sig)

    if (lastAlert && now - lastAlert < ALERT_WINDOW_MS) {
      // Skip — same error alerted recently
      return NextResponse.json({ ok: true, emailed: false, reason: 'rate-limited' })
    }

    recentAlerts.set(sig, now)

    // 3. Send the alert email (fire and forget — don't block the response)
    sendClientErrorAlert({
      label: label ?? 'unknown',
      message: message ?? 'Unknown error',
      url: url ?? null,
      userAgent: userAgent ?? null,
      stack: stack ?? null,
      digest: digest ?? null,
      timestamp: timestamp ?? new Date().toISOString(),
    }).catch((err) => {
      console.error('[client-error] alert email failed:', err)
    })

    return NextResponse.json({ ok: true, emailed: true })
  } catch (err) {
    console.error('[client-error] failed to parse payload:', err)
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}