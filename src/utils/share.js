/**
 * share.js – Encode/decode app config for shareable links.
 *
 * Uses UTF-8 + base64url (RFC 4648 §5) so the token is safe inside a URL:
 * plain base64 contains `+`, which query-string parsers turn into a space.
 */

export function encodeConfig(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj))
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeConfig(token) {
  // Accept both base64url and legacy standard base64 (incl. `+` mangled to space)
  let b64 = String(token).trim().replace(/ /g, '+').replace(/-/g, '+').replace(/_/g, '/')
  while (b64.length % 4) b64 += '='
  const bin = atob(b64)
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0))
  return JSON.parse(new TextDecoder().decode(bytes))
}

/** Read a config token from `#config=…` (current) or `?config=…` (legacy links) */
export function readConfigToken(location = window.location) {
  const hash = new URLSearchParams(location.hash.replace(/^#/, ''))
  return hash.get('config') || new URLSearchParams(location.search).get('config')
}
