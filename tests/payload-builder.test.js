import { describe, it, expect } from 'vitest'
import { buildPayload, formatIcalDate, escVcard } from '../src/qr-engine/payload-builder.js'

describe('url', () => {
  it('returns empty for no input', () => expect(buildPayload('url', { url: '  ' })).toBe(''))
  it('keeps valid URLs', () => expect(buildPayload('url', { url: 'https://example.com/a?b=c' })).toBe('https://example.com/a?b=c'))
  it('adds https:// to bare domains', () => expect(buildPayload('url', { url: 'example.com' })).toBe('https://example.com'))
  it('rejects garbage', () => expect(buildPayload('url', { url: 'not a url' })).toBeNull())
})

describe('email', () => {
  it('encodes spaces as %20, never +', () => {
    expect(buildPayload('email', { to: ' a@b.co ', subject: 'Hello there', body: 'Line 1\nA+B' }))
      .toBe('mailto:a@b.co?subject=Hello%20there&body=Line%201%0AA%2BB')
  })
  it('omits empty params', () => expect(buildPayload('email', { to: 'a@b.co', subject: '' })).toBe('mailto:a@b.co'))
})

describe('phone / sms / whatsapp', () => {
  it('strips whitespace from tel:', () => expect(buildPayload('phone', { phone: '+1 234 567' })).toBe('tel:+1234567'))
  it('sms body is encoded', () => expect(buildPayload('sms', { phone: '+1 2', message: 'hi there' })).toBe('sms:+12?body=hi%20there'))
  it('whatsapp keeps digits only', () => expect(buildPayload('whatsapp', { phone: '+1 (234) 5', message: 'yo' })).toBe('https://wa.me/12345?text=yo'))
  it('whatsapp without digits is empty', () => expect(buildPayload('whatsapp', { phone: '+' })).toBe(''))
})

describe('wifi', () => {
  it('escapes special characters', () => {
    expect(buildPayload('wifi', { ssid: 'My;Net', password: 'p:a"s,s\\', security: 'WPA' }))
      .toBe('WIFI:T:WPA;S:My\\;Net;P:p\\:a\\"s\\,s\\\\;;')
  })
  it('omits password for open networks', () => {
    expect(buildPayload('wifi', { ssid: 'Cafe', password: 'ignored', security: 'nopass' })).toBe('WIFI:T:nopass;S:Cafe;;')
  })
  it('adds H:true for hidden networks', () => {
    expect(buildPayload('wifi', { ssid: 'X', security: 'WPA', hidden: true })).toBe('WIFI:T:WPA;S:X;H:true;;')
  })
})

describe('vcard', () => {
  it('escapes , ; \\ and newlines', () => {
    expect(escVcard('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne')
  })
  it('builds a CRLF vCard 3.0', () => {
    const v = buildPayload('vcard', { firstName: 'Jane', lastName: 'Doe', org: 'Acme, Inc.', address: '1 Main St; Apt 2' })
    expect(v.split('\r\n')).toEqual([
      'BEGIN:VCARD', 'VERSION:3.0', 'N:Doe;Jane;;;', 'FN:Jane Doe', 'ORG:Acme\\, Inc.', 'ADR:;;1 Main St\\; Apt 2;;;;', 'END:VCARD',
    ])
  })
  it('needs a name', () => expect(buildPayload('vcard', { org: 'Acme' })).toBe(''))
})

describe('location', () => {
  it('prefers query', () => expect(buildPayload('location', { query: 'Eiffel Tower', lat: '1', lon: '2' })).toBe('geo:0,0?q=Eiffel%20Tower'))
  it('uses lat/lon', () => expect(buildPayload('location', { lat: '48.85', lon: '2.29' })).toBe('geo:48.85,2.29'))
  it('accepts 0 coordinates', () => expect(buildPayload('location', { lat: '0', lon: '0' })).toBe('geo:0,0'))
  it('rejects out-of-range', () => expect(buildPayload('location', { lat: '91', lon: '0' })).toBeNull())
  it('is empty with one coordinate', () => expect(buildPayload('location', { lat: '1', lon: '' })).toBe(''))
})

describe('calendar', () => {
  it('formats datetime-local with seconds', () => {
    expect(formatIcalDate('2026-11-12T09:30')).toBe('20261112T093000')
    expect(formatIcalDate('2026-11-12T09:30:15')).toBe('20261112T093015')
    expect(formatIcalDate('bad')).toBeNull()
  })
  it('builds a valid VEVENT with escaping', () => {
    const c = buildPayload('calendar', {
      title: 'Sync; weekly', start: '2026-11-12T09:30', end: '2026-11-12T10:00', location: 'Room A, 2F', description: 'Line1\nLine2',
    })
    expect(c.split('\r\n')).toEqual([
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//QR Code Gen//EN', 'BEGIN:VEVENT',
      'SUMMARY:Sync\\; weekly', 'DTSTART:20261112T093000', 'DTEND:20261112T100000',
      'LOCATION:Room A\\, 2F', 'DESCRIPTION:Line1\\nLine2', 'END:VEVENT', 'END:VCALENDAR',
    ])
  })
  it('drops an end before the start', () => {
    expect(buildPayload('calendar', { title: 'X', start: '2026-11-12T09:30', end: '2026-11-12T08:00' })).not.toContain('DTEND')
  })
})

describe('crypto', () => {
  it('uses BIP21 scheme with encoded label', () => {
    expect(buildPayload('crypto', { coin: 'BTC', address: 'bc1qxyz', amount: '0.5', label: 'Order #1 A+B' }))
      .toBe('bitcoin:bc1qxyz?amount=0.5&label=Order%20%231%20A%2BB')
  })
})

describe('text / raw', () => {
  it('trims text', () => expect(buildPayload('text', { text: '  hi  ' })).toBe('hi'))
  it('keeps raw verbatim', () => expect(buildPayload('raw', { payload: ' a\nb ' })).toBe(' a\nb '))
  it('raw whitespace-only is empty', () => expect(buildPayload('raw', { payload: '   ' })).toBe(''))
  it('unknown type is empty', () => expect(buildPayload('nope', {})).toBe(''))
})
