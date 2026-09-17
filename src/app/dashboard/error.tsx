'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="p-8 max-w-2xl">
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
        <div className="text-3xl mb-4">⚠️</div>
        <h1 className="text-lg font-bold text-amber-900">
          Something went wrong
        </h1>
        <p className="text-sm text-amber-700 mt-2">
          We couldn&apos;t load this page. Try again or come back later.
        </p>
        {error.digest && (
          <p className="text-xs text-amber-600 mt-2 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={reset}
            className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="text-sm text-amber-700 hover:text-amber-900"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}