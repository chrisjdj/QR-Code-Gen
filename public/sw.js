/**
 * sw.js – QR Code Gen Service Worker
 *
 * - HTML / navigations: network-first (users get new releases immediately),
 *   falling back to the cached shell when offline.
 * - Hashed build assets (/assets/*): cache-first (immutable).
 * - Everything else same-origin: stale-while-revalidate.
 *
 * All paths are relative to the SW scope, so this works under any base path.
 * __BUILD_ID__ is replaced at build time (see vite.config.js) so each deploy
 * gets a fresh cache and old ones are purged on activate.
 */

const CACHE_NAME = 'qr-code-gen-__BUILD_ID__'
const scoped = path => new URL(path, self.registration.scope).href
const SHELL = () => [scoped('./'), scoped('manifest.json'), scoped('favicon.svg')]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL())).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('qr-code-gen-') && k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(scoped('./'), response.clone())
    return response
  } catch {
    return (await cache.match(scoped('./'))) || Response.error()
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (response.ok) (await caches.open(CACHE_NAME)).put(request, response.clone())
  return response
}

async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)
  const update = fetch(request)
    .then(response => { if (response.ok) cache.put(request, response.clone()); return response })
    .catch(() => cached)
  if (cached) { event.waitUntil(update); return cached }
  return update
}

self.addEventListener('fetch', event => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request))
  } else if (url.pathname.includes('/assets/')) {
    event.respondWith(cacheFirst(request))
  } else {
    event.respondWith(staleWhileRevalidate(request, event))
  }
})
