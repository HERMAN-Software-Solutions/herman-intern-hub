'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Cookie, X } from 'lucide-react'

const STORAGE_KEY = 'herman_cookie_consent'
const CONSENT_VERSION = '1' // bump this to re-prompt everyone after a policy change

type Consent = {
  version: string
  analytics: boolean
  decidedAt: string
}

function getConsent(): Consent | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Consent
    if (parsed.version !== CONSENT_VERSION) return null
    return parsed
  } catch {
    return null
  }
}

function saveConsent(analytics: boolean) {
  const consent: Consent = {
    version: CONSENT_VERSION,
    analytics,
    decidedAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(consent))

  // Fire actual side effects here
  if (analytics) {
    enableAnalytics()
  } else {
    disableAnalytics()
  }
}

// ─────────────────────────────────────────────
// Analytics gating — pluggable
// ─────────────────────────────────────────────

function enableAnalytics() {
  if (typeof window === 'undefined') return
  // Dispatch a custom event so any analytics script can listen
  window.dispatchEvent(
    new CustomEvent('herman:cookie-consent', {
      detail: { analytics: true },
    })
  )

  // Example: if using Vercel Analytics or Plausible, initialize here.
  // Uncomment when ready:
  //
  // import('@vercel/analytics').then(({ inject }) => inject())
  //
  // Or for Plausible:
  // const s = document.createElement('script')
  // s.src = 'https://plausible.io/js/script.js'
  // s.setAttribute('data-domain', 'herman-intern-hub.vercel.app')
  // document.head.appendChild(s)
}

function disableAnalytics() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent('herman:cookie-consent', {
      detail: { analytics: false },
    })
  )
  // Remove any analytics cookies if they were set
  // Example: document.cookie = '_ga=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
}

// ─────────────────────────────────────────────

export function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Small delay so the banner doesn't flash on first paint
    const t = setTimeout(() => {
      const existing = getConsent()
      if (!existing) setVisible(true)
    }, 500)
    return () => clearTimeout(t)
  }, [])

  function handleAcceptAll() {
    saveConsent(true)
    setVisible(false)
  }

  function handleRejectOptional() {
    saveConsent(false)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[200] p-4 sm:p-6 pointer-events-none"
    >
      <div className="max-w-3xl mx-auto bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 pointer-events-auto overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-green-500" />

        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Cookie className="w-5 h-5 text-blue-300" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold text-base">
                  We use cookies
                </h2>
                <button
                  onClick={handleRejectOptional}
                  className="text-slate-400 hover:text-white transition-colors -mt-1"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">
                We use strictly necessary cookies to run the Service. We
                would also like to use optional analytics cookies to
                understand how the site is used. You can accept or reject
                these.{' '}
                <Link
                  href="/cookies"
                  className="underline hover:text-white"
                >
                  Learn more
                </Link>
              </p>

              {showDetails && (
                <div className="mt-4 space-y-3 text-sm bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-white">
                        Strictly necessary
                      </div>
                      <div className="text-slate-400 text-xs mt-0.5">
                        Required for login, security, and remembering your
                        cookie preference. Always on.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-white">Analytics</div>
                      <div className="text-slate-400 text-xs mt-0.5">
                        Helps us understand how the site is used. Never tied
                        to your identity. Optional.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center">
                <button
                  onClick={handleAcceptAll}
                  className="bg-white hover:bg-slate-100 text-slate-900 font-medium text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  Accept all
                </button>
                <button
                  onClick={handleRejectOptional}
                  className="border border-white/20 hover:border-white/40 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors"
                >
                  Reject optional
                </button>
                <button
                  onClick={() => setShowDetails((s) => !s)}
                  className="text-slate-400 hover:text-white text-sm underline sm:ml-2 self-start sm:self-auto"
                >
                  {showDetails ? 'Hide details' : 'Show details'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}