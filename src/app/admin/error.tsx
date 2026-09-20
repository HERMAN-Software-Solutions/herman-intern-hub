'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin error:', error)

    try {
      fetch('/api/log-client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: 'admin-error-boundary',
          message: error?.message ?? 'Unknown',
          digest: error?.digest ?? null,
          stack: error?.stack ?? null,
          url: typeof window !== 'undefined' ? window.location.href : null,
          userAgent:
            typeof navigator !== 'undefined' ? navigator.userAgent : null,
          timestamp: new Date().toISOString(),
        }),
        keepalive: true,
      }).catch(() => {})
    } catch {
      // Silent
    }
  }, [error])

  return (
    <div className="p-8 max-w-2xl">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
        <div className="text-3xl mb-4">⚠️</div>
        <h1 className="text-lg font-bold text-red-900">
          Admin panel error
        </h1>
        <p className="text-sm text-red-700 mt-2">
          Something failed while loading this page.
        </p>
        {error.digest && (
          <p className="text-xs text-red-500 mt-2 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={reset}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            Try again
          </button>
          <Link
            href="/admin"
            className="text-sm text-red-700 hover:text-red-900"
          >
            Back to overview
          </Link>
        </div>
      </div>
    </div>
  )
}