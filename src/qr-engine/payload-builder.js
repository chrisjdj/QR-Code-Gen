/**
 * payload-builder.js
 * Pure functions that turn form values into standard QR payload strings.
 *
 * Return contract for buildPayload():
 *   ''   – not enough input yet (show placeholder)
 *   null – input present but invalid (show placeholder)
 *   str  – encodable payload
 */

const CRLF = '\r\n'

/** Escape text for vCard 3.0 property values (RFC 2426 §5) */
export function escVcard(s) {
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/([,;])/g, '\\$1')
}

/** Escape text for iCalendar TEXT values (RFC 5545 §3.3.11) */
export function escIcal(s) {
  return String(s)
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/([,;])/g, '\\$1')
}

/** Escape WIFI: field values (ZXing spec) */
export function escWifi(s) {
  return String(s).replace(/[\\;,":]/g, c => '\\' + c)
}

/** `2026-11-12T09:30` or `2026-11-12T09:30:15` → `20261112T093000` / `20261112T093015` */
export function formatIcalDate(dt) {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(String(dt || ''))
  if (!m) return null
  const [, y, mo, d, h, mi, s = '00'] = m
  return `${y}${mo}${d}T${h}${mi}${s}`
}

/** Build a query string with %20 for spaces (mailto:/crypto URIs must not use `+`) */
function query(params) {
  const parts = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && String(v) !== '')
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
  return parts.length ? '?' + parts.join('&') : ''
}

const stripSpaces = s => String(s || '').replace(/\s+/g, '')
const trim = s => String(s ?? '').trim()

const CRYPTO_SCHEMES = { BTC: 'bitcoin', ETH: 'ethereum', LTC: 'litecoin' }

export function buildPayload(type, values = {}) {
  switch (type) {
    case 'url': {
      let url = trim(values.url)
      if (!url) return ''
      // Accept bare domains like "example.com" by assuming https
      if (!/^[a-z][a-z0-9+.-]*:/i.test(url)) url = `https://${url}`
      try {
        const u = new URL(url)
        if ((u.protocol === 'http:' || u.protocol === 'https:') && !u.hostname.includes('.') && u.hostname !== 'localhost') return null
      } catch { return null }
      return url
    }

    case 'text':
      return trim(values.text)

    case 'email': {
      const to = trim(values.to)
      if (!to) return ''
      return `mailto:${to}${query({ subject: values.subject, body: values.body })}`
    }

    case 'phone': {
      const phone = stripSpaces(values.phone)
      return phone ? `tel:${phone}` : ''
    }

    case 'sms': {
      const phone = stripSpaces(values.phone)
      if (!phone) return ''
      return `sms:${phone}${query({ body: values.message })}`
    }

    case 'whatsapp': {
      const num = String(values.phone || '').replace(/\D/g, '')
      if (!num) return ''
      return `https://wa.me/${num}${query({ text: values.message })}`
    }

    case 'wifi': {
      if (!values.ssid) return ''
      const sec = values.security || 'WPA'
      const parts = [`T:${sec}`, `S:${escWifi(values.ssid)}`]
      if (sec !== 'nopass' && values.password) parts.push(`P:${escWifi(values.password)}`)
      if (values.hidden) parts.push('H:true')
      return `WIFI:${parts.join(';')};;`
    }

    case 'vcard': {
      const first = trim(values.firstName)
      const last = trim(values.lastName)
      if (!first && !last) return ''
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${escVcard(last)};${escVcard(first)};;;`,
        `FN:${escVcard([first, last].filter(Boolean).join(' '))}`,
      ]
      if (values.org)     lines.push(`ORG:${escVcard(values.org)}`)
      if (values.title)   lines.push(`TITLE:${escVcard(values.title)}`)
      if (values.phone)   lines.push(`TEL;TYPE=CELL:${stripSpaces(values.phone)}`)
      if (values.email)   lines.push(`EMAIL:${trim(values.email)}`)
      if (values.url)     lines.push(`URL:${trim(values.url)}`)
      if (values.address) lines.push(`ADR:;;${escVcard(values.address)};;;;`)
      lines.push('END:VCARD')
      return lines.join(CRLF)
    }

    case 'location': {
      const q = trim(values.query)
      if (q) return `geo:0,0?q=${encodeURIComponent(q)}`
      if (values.lat === '' || values.lon === '' || values.lat == null || values.lon == null) return ''
      const lat = Number(values.lat)
      const lon = Number(values.lon)
      if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) return null
      return `geo:${lat},${lon}`
    }

    case 'calendar': {
      const title = trim(values.title)
      if (!title || !values.start) return ''
      const start = formatIcalDate(values.start)
      if (!start) return null
      const end = formatIcalDate(values.end)
      const lines = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//QR Code Gen//EN',
        'BEGIN:VEVENT',
        `SUMMARY:${escIcal(title)}`,
        `DTSTART:${start}`,
      ]
      // Ignore an end time that is not after the start
      if (end && end > start) lines.push(`DTEND:${end}`)
      if (values.location)    lines.push(`LOCATION:${escIcal(values.location)}`)
      if (values.description) lines.push(`DESCRIPTION:${escIcal(values.description)}`)
      lines.push('END:VEVENT', 'END:VCALENDAR')
      return lines.join(CRLF)
    }

    case 'crypto': {
      const address = trim(values.address)
      if (!address) return ''
      const coin = values.coin || 'BTC'
      const scheme = CRYPTO_SCHEMES[coin] || coin.toLowerCase()
      return `${scheme}:${address}${query({ amount: values.amount, label: values.label })}`
    }

    case 'raw': {
      // Raw payloads are encoded verbatim (no trimming) unless whitespace-only
      const s = String(values.payload ?? '')
      return s.trim() ? s : ''
    }

    default:
      return ''
  }
}
