'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to console (works on desktop)
    console.error('App error:', error)

    // Report to server (works on mobile — readable in Vercel Logs)
    try {
      fetch('/api/log-client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: 'app-error-boundary',
          message: error?.message ?? 'Unknown',
          digest: error?.digest ?? null,
          stack: error?.stack ?? null,
          url: typeof window !== 'undefined' ? window.location.href : null,
          userAgent:
            typeof navigator !== 'undefined' ? navigator.userAgent : null,
          timestamp: new Date().toISOString(),
        }),
        keepalive: true,
      }).catch(() => {
        // Silent — we don't want the logger to cause another error
      })
    } catch {
      // Silent
    }
  }, [error])

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⚠️</span>
        </div>

        <h1 className="text-xl font-bold text-slate-900">
          Something went wrong
        </h1>
        <p className="text-sm text-slate-600 mt-3">
          An unexpected error occurred. We&apos;ve been notified.
        </p>

        {error.digest && (
          <p className="text-xs text-slate-400 mt-2 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={reset}
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  )
}