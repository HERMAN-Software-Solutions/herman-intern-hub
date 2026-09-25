'use client'

import { useEffect, useState } from 'react'
import { X, Download } from 'lucide-react'

const DISMISS_KEY = 'herman-install-dismissed-until'

export function InstallPrompt() {
  const [visible, setVisible] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Don't show if dismissed recently
    const dismissedUntil = localStorage.getItem(DISMISS_KEY)
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) return

    // Don't show if already installed (standalone mode)
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      // @ts-ignore — iOS Safari
      window.navigator.standalone === true
    ) {
      return
    }

    // Capture the browser's install prompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // iOS doesn't fire beforeinstallprompt — fallback timer
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    let iosTimer: any
    if (isIOS) {
      iosTimer = setTimeout(() => setVisible(true), 3000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      if (iosTimer) clearTimeout(iosTimer)
    }
  }, [])

  async function handleInstall() {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice?.outcome === 'accepted') {
        setVisible(false)
      }
      setDeferredPrompt(null)
    } else {
      // iOS: show instructions
      alert(
        'To install:\n\n1. Tap the Share button (square with arrow)\n2. Scroll and tap "Add to Home Screen"\n3. Tap "Add"'
      )
      handleDismiss()
    }
  }

  function handleDismiss() {
    const thirtyDays = Date.now() + 30 * 24 * 60 * 60 * 1000
    localStorage.setItem(DISMISS_KEY, String(thirtyDays))
    setVisible(false)
  }

  if (!visible) return null

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