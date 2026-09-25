'use client'

import { useEffect, useState } from 'react'
import { X, Download, Share, Plus } from 'lucide-react'

const DISMISS_KEY = 'herman-install-dismissed-until'
const DISMISS_DAYS = 7 // shorter — they can always dismiss again

type Platform = 'android' | 'ios' | 'desktop' | 'unknown'

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'unknown'
  const ua = navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'desktop'
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  // @ts-expect-error — iOS Safari
  if (window.navigator.standalone === true) return true
  return false
}

export function InstallPrompt() {
  const [visible, setVisible] = useState(false)
  const [platform, setPlatform] = useState<Platform>('unknown')
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showIOSInstructions, setShowIOSInstructions] = useState(false)

  useEffect(() => {
    // Already installed → don't show
    if (isStandalone()) return

    // Dismissed recently → don't show
    const dismissedUntil = localStorage.getItem(DISMISS_KEY)
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) return

    const detectedPlatform = detectPlatform()
    setPlatform(detectedPlatform)

    // Capture Chrome's native prompt if it fires — we prefer it
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Always show our own banner after 5 seconds
    const timer = setTimeout(() => setVisible(true), 5000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      clearTimeout(timer)
    }
  }, [])

  async function handleInstall() {
    // Native prompt available (Android Chrome)
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice?.outcome === 'accepted') {
        setVisible(false)
        localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_DAYS * 86400000))
      }
      setDeferredPrompt(null)
      return
    }

    // iOS → show instructions
    if (platform === 'ios') {
      setShowIOSInstructions(true)
      return
    }

    // Other platforms — show best-effort instructions
    alert(
      'To install this app:\n\n' +
        '• On Android Chrome: Tap the ⋮ menu → "Install app" or "Add to Home screen"\n' +
        '• On iPhone Safari: Tap Share → "Add to Home Screen"\n' +
        '• On desktop Chrome: Look for the install icon in the address bar'
    )
  }

  function handleDismiss() {
    const until = Date.now() + DISMISS_DAYS * 86400000
    localStorage.setItem(DISMISS_KEY, String(until))
    setVisible(false)
    setShowIOSInstructions(false)
  }

  if (!visible) return null

  // iOS instruction modal
  if (showIOSInstructions) {
    return (
      <div
        className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowIOSInstructions(false)
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">
              Install on iPhone
            </h3>
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="text-slate-400 hover:text-slate-700"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                1
              </div>
              <div>
                <div className="font-medium text-slate-900 flex items-center gap-1.5">
                  Tap the Share button
                  <Share className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-sm text-slate-600 mt-0.5">
                  It's at the bottom of Safari, or top if you're on iPad.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                2
              </div>
              <div>
                <div className="font-medium text-slate-900 flex items-center gap-1.5">
                  Scroll and tap "Add to Home Screen"
                  <Plus className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-sm text-slate-600 mt-0.5">
                  It's near the bottom of the share sheet.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 font-semibold text-sm">
                3
              </div>
              <div>
                <div className="font-medium text-slate-900">
                  Tap "Add"
                </div>
                <p className="text-sm text-slate-600 mt-0.5">
                  The HERMAN Intern Hub icon will appear on your home screen.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleDismiss}
              className="px-4 py-2 text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-lg"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 flex items-start gap-3">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
        <Download className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-900 text-sm">
          Install HERMAN Intern Hub
        </div>
        <p className="text-xs text-slate-600 mt-0.5">
          Add it to your home screen for quick access and notifications.
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className="text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}