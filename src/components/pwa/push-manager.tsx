'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff, X } from 'lucide-react'

const DISMISS_KEY = 'herman-push-dismissed-until'

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const buffer = new ArrayBuffer(rawData.length)
  const outputArray = new Uint8Array(buffer)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function PushManager() {
  const [visible, setVisible] = useState(false)
  const [pending, setPending] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    // Don't show if dismissed recently
    const dismissedUntil = localStorage.getItem(DISMISS_KEY)
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) return

    // Don't show if already subscribed
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) {
          setSubscribed(true)
          return
        }
        setVisible(true)
      })
    })
  }, [])

  async function handleEnable() {
    setPending(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setPending(false)
        handleDismiss()
        return
      }

      const reg = await navigator.serviceWorker.ready

      // Fetch VAPID public key
      const keyRes = await fetch('/api/pwa/vapid')
      const { publicKey } = await keyRes.json()
      if (!publicKey) {
        console.error('No VAPID public key')
        setPending(false)
        return
      }

            const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      })

      // Save to server
      await fetch('/api/pwa/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })

      setSubscribed(true)
      setVisible(false)
    } catch (err) {
      console.error('Push subscribe failed:', err)
    } finally {
      setPending(false)
    }
  }

  function handleDismiss() {
    const thirtyDays = Date.now() + 30 * 24 * 60 * 60 * 1000
    localStorage.setItem(DISMISS_KEY, String(thirtyDays))
    setVisible(false)
  }

  if (!visible || subscribed) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 flex items-start gap-3">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
        <Bell className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-slate-900 text-sm">
          Turn on notifications
        </div>
        <p className="text-xs text-slate-600 mt-0.5">
          Get notified when you have a new task, message, or announcement.
        </p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleEnable}
            disabled={pending}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-medium transition-colors"
          >
            {pending ? 'Enabling…' : 'Enable'}
          </button>
          <button
            onClick={handleDismiss}
            disabled={pending}
            className="px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        disabled={pending}
        className="text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0"
        aria-label="Close"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}