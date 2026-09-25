// HERMAN Intern Hub — Service Worker
// Handles: cache fallback + push notifications + notification clicks

const CACHE_NAME = 'herman-hub-v2'
const OFFLINE_URLS = ['/', '/login']

// ─── Install: pre-cache minimal shell ──────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(OFFLINE_URLS).catch(() => {}))
  )
})

// ─── Activate: clean old caches ────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ─── Fetch: network-first for pages, cache-first for static ──
self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return
  if (url.pathname.startsWith('/_next/')) return
  if (
    url.pathname.startsWith('/dashboard') ||
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/mentor')
  ) {
    return
  }

  if (/\.(png|jpg|jpeg|svg|webp|ico|woff2?|css|js)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((res) => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          }
          return res
        })
      })
    )
  }
})

// ─── Push: show notification instantly, never batch ────
self.addEventListener('push', (event) => {
  // Default payload
  let data = {
    title: 'HERMAN Intern Hub',
    body: 'You have a new notification',
    url: '/dashboard',
    tag: 'herman',
    priority: 'normal',
  }

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() }
    }
  } catch (err) {
    // Non-JSON payload — try text
    try {
      const text = event.data?.text()
      if (text) data.body = text
    } catch (_) {
      // ignore
    }
  }

  // Unique tag per notification so they stack instead of replacing
  // each other. Prevents Android/Chrome from batching.
  const uniqueTag = `${data.tag || 'herman'}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`

  const isHighPriority =
    data.priority === 'high' ||
    data.tag === 'task_assigned' ||
    data.tag === 'message' ||
    data.tag === 'announcement' ||
    data.tag === 'certificate_issued'

  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    image: data.image || undefined,
    data: {
      url: data.url || '/dashboard',
      tag: data.tag,
      timestamp: Date.now(),
    },
    // Unique tag — prevents batching and replacement
    tag: uniqueTag,
    renotify: true,
    // High-priority notifications stay on screen until dismissed
    requireInteraction: isHighPriority,
    // Vibrate pattern — longer for high priority
    vibrate: isHighPriority ? [200, 100, 200, 100, 200] : [100, 50, 100],
    // Silent = false ensures sound plays
    silent: false,
    // High urgency hint to the OS (supported by some browsers)
    timestamp: Date.now(),
  }

  // Show notification immediately. Android will fire it right away
  // instead of batching with other notifications.
  event.waitUntil(
    (async () => {
      try {
        await self.registration.showNotification(data.title, options)
      } catch (err) {
        // Fallback: minimal notification if the rich one fails
        await self.registration.showNotification(data.title, {
          body: data.body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          tag: uniqueTag,
        })
      }
    })()
  )
})

// ─── Notification click: open or focus the app ─────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/dashboard'
  const fullUrl = new URL(urlToOpen, self.location.origin).href

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if (client.url.startsWith(self.location.origin) && 'focus' in client) {
            client.navigate(fullUrl)
            return client.focus()
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow(fullUrl)
      })
  )
})

// ─── Notification close: analytics or cleanup (optional) ─
self.addEventListener('notificationclose', (event) => {
  // Could log dismissals later
  event.notification.data?.tag
})