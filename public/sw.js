// HERMAN Intern Hub — Service Worker
// Handles: cache fallback + push notifications + notification clicks

const CACHE_NAME = 'herman-hub-v1'
const OFFLINE_URLS = ['/', '/login', '/dashboard']

// ─── Install: pre-cache minimal shell ──────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting()
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(OFFLINE_URLS).catch(() => {}))
  )
})

// ─── Activate: clean old caches ────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// ─── Fetch: network-first for pages, cache-first for static ──
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Only GET requests
  if (request.method !== 'GET') return

  // Skip Supabase, APIs, and cross-origin
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.startsWith('/api/')) return
  if (url.pathname.startsWith('/_next/')) return
  if (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/admin') || url.pathname.startsWith('/mentor')) {
    // Don't cache authed pages — always hit network
    return
  }

  // Static assets: cache-first
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
    return
  }
})

// ─── Push: show notification ───────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'HERMAN Intern Hub', body: 'You have a new notification' }
  try {
    if (event.data) data = { ...data, ...event.data.json() }
  } catch (err) {
    // ignore
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: data.url || '/dashboard' },
    tag: data.tag || 'herman-default',
    renotify: true,
    vibrate: [100, 50, 100],
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// ─── Notification click: open or focus the app ─────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const urlToOpen = event.notification.data?.url || '/dashboard'
  const fullUrl = new URL(urlToOpen, self.location.origin).href

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // If the app is already open, focus it and navigate
      for (const client of clients) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          client.navigate(fullUrl)
          return client.focus()
        }
      }
      // Otherwise, open a new window
      if (self.clients.openWindow) return self.clients.openWindow(fullUrl)
    })
  )
})