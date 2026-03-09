/**
 * payload-builder.js
 * Builds correctly formatted QR payload strings for each QR type.
 */

/**
 * Build QR payload from type and form data
 * @param {string} type - QR type key
 * @param {Object} data - Form field values
 * @returns {{ payload: string, error: string|null }}
 */
export function buildPayload(type, data) {
  try {
    const payload = builders[type]?.(data)
    if (!payload) return { payload: '', error: null }
    return { payload, error: null }
  } catch (err) {
    return { payload: '', error: err.message }
  }
}

const builders = {
  url({ url }) {
    if (!url) return ''
    const trimmed = url.trim()
    if (!isValidUrl(trimmed)) throw new Error('Please enter a valid URL (include https://)')
    return trimmed
  },

  text({ text }) {
    return (text || '').trim()
  },

  email({ to, subject, body }) {
    if (!to) return ''
    const params = new URLSearchParams()
    if (subject) params.set('subject', subject)
    if (body) params.set('body', body)
    const qs = params.toString()
    return `mailto:${to}${qs ? '?' + qs : ''}`
  },

  phone({ phone }) {
    if (!phone) return ''
    return `tel:${phone.trim()}`
  },

  sms({ phone, message }) {
    if (!phone) return ''
    const body = message ? `?body=${encodeURIComponent(message)}` : ''
    return `sms:${phone.trim()}${body}`
  },

  whatsapp({ phone, message }) {
    if (!phone) return ''
    const num = phone.replace(/\D/g, '')
    const text = message ? `?text=${encodeURIComponent(message)}` : ''
    return `https://wa.me/${num}${text}`
  },

  wifi({ ssid, password, security, hidden }) {
    if (!ssid) return ''
    const sec = security || 'WPA'
    const pass = password ? password : ''
    const hiddenFlag = hidden ? 'true' : 'false'
    return `WIFI:T:${sec};S:${escapeWifi(ssid)};P:${escapeWifi(pass)};H:${hiddenFlag};;`
  },

  vcard({ firstName, lastName, org, title, phone, email, url, address }) {
    if (!firstName && !lastName) return ''
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${[firstName, lastName].filter(Boolean).join(' ')}`,
      `N:${lastName || ''};${firstName || ''};;;`,
    ]
    if (org)     lines.push(`ORG:${org}`)
    if (title)   lines.push(`TITLE:${title}`)
    if (phone)   lines.push(`TEL;TYPE=CELL:${phone}`)
    if (email)   lines.push(`EMAIL:${email}`)
    if (url)     lines.push(`URL:${url}`)
    if (address) lines.push(`ADR:;;${address};;;;`)
    lines.push('END:VCARD')
    return lines.join('\n')
  },

  location({ lat, lon, query }) {
    if (query) return `geo:0,0?q=${encodeURIComponent(query)}`
    if (!lat || !lon) return ''
    return `geo:${lat},${lon}`
  },

  calendar({ title, start, end, location, description }) {
    if (!title || !start) return ''
    const fmt = (dt) => dt.replace(/[-:]/g, '').replace('T', 'T').slice(0, 15)
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//QR Code Gen//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`,
      `DTSTART:${fmt(start)}`,
    ]
    if (end)         lines.push(`DTEND:${fmt(end)}`)
    if (location)    lines.push(`LOCATION:${location}`)
    if (description) lines.push(`DESCRIPTION:${description}`)
    lines.push('END:VEVENT', 'END:VCALENDAR')
    return lines.join('\n')
  },

  crypto({ coin, address, amount, label }) {
    if (!address) return ''
    const coinMap = { BTC: 'bitcoin', ETH: 'ethereum', LTC: 'litecoin' }
    const scheme = coinMap[coin] || coin?.toLowerCase() || 'bitcoin'
    const params = new URLSearchParams()
    if (amount) params.set('amount', amount)
    if (label)  params.set('label', label)
    const qs = params.toString()
    return `${scheme}:${address}${qs ? '?' + qs : ''}`
  },

  raw({ payload }) {
    return (payload || '').trim()
  },
}

function isValidUrl(str) {
  try {
    const url = new URL(str)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function escapeWifi(str) {
  return str.replace(/[\\;,":]/g, c => '\\' + c)
}
