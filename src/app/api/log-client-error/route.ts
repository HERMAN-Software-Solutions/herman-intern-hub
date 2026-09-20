import { NextResponse, type NextRequest } from 'next/server'

/**
 * Receives client-side error reports from error boundaries.
 * Logs them to Vercel Runtime Logs so we can debug mobile-only issues
 * without needing DevTools on the device.
 */
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

    // Log a single structured line — searchable in Vercel Logs
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

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[client-error] failed to parse payload:', err)
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}