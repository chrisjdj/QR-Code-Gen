import { describe, it, expect } from 'vitest'
import { encodeConfig, decodeConfig, readConfigToken } from '../src/utils/share.js'
import { makeFilename } from '../src/utils/download.js'
import { checkScannability } from '../src/qr-engine/scannability.js'
import { buildQrOptions } from '../src/qr-engine/qr-options.js'

describe('share config', () => {
  const config = { v: 2, type: 'wifi', form: { ssid: 'Café ☕', password: '>>>???' }, design: { fgColor: '#000000' } }

  it('round-trips unicode', () => expect(decodeConfig(encodeConfig(config))).toEqual(config))

  it('produces URL-safe tokens (no + / =)', () => {
    // '>>>???' is chosen because standard base64 of it contains + and /
    expect(encodeConfig(config)).toMatch(/^[A-Za-z0-9_-]+$/)
  })

  it('survives a trip through URLSearchParams', () => {
    const token = encodeConfig(config)
    const parsed = new URLSearchParams(`config=${token}`).get('config')
    expect(decodeConfig(parsed)).toEqual(config)
  })

  it('decodes legacy standard-base64 links even when + became a space', () => {
    const legacy = btoa(unescape(encodeURIComponent(JSON.stringify(config))))
    expect(legacy).toMatch(/[+/]/)
    const mangled = new URLSearchParams(`config=${legacy}`).get('config')
    expect(decodeConfig(mangled)).toEqual(config)
  })

  it('reads token from hash first, then query', () => {
    expect(readConfigToken({ hash: '#config=abc', search: '?config=zzz' })).toBe('abc')
    expect(readConfigToken({ hash: '', search: '?config=zzz' })).toBe('zzz')
    expect(readConfigToken({ hash: '', search: '' })).toBeNull()
  })
})

describe('makeFilename', () => {
  it('uses hostname for URLs', () => expect(makeFilename('url', { url: 'https://www.example.com/x' })).toBe('qr-url-www.example.com'))
  it('slugifies names', () => expect(makeFilename('vcard', { firstName: 'José', lastName: 'Núñez' })).toBe('qr-vcard-Jose-Nunez'))
  it('falls back to type', () => expect(makeFilename('text', { text: 'secret' })).toBe('qr-text'))
})

const base = {
  fgColor: '#000000', bgColor: '#ffffff', transparent: false, dotStyle: 'square', eyeStyle: 'square',
  ecLevel: 'M', qrVersion: 0, gradient: { enabled: false }, logo: null, logoSize: 0.3, logoMargin: 5,
}

describe('checkScannability', () => {
  it('passes black on white', () => expect(checkScannability(base)).toEqual([]))
  it('flags low contrast', () => expect(checkScannability({ ...base, fgColor: '#cccccc' })[0]).toMatch(/Low contrast/))
  it('flags inverted colors', () => {
    expect(checkScannability({ ...base, fgColor: '#ffffff', bgColor: '#000000' }).join(' ')).toMatch(/inverted/)
  })
  it('checks both gradient stops', () => {
    const g = { enabled: true, color1: '#000000', color2: '#eeeeee' }
    expect(checkScannability({ ...base, gradient: g })[0]).toMatch(/Low contrast/)
  })
  it('flags big logo with low EC', () => {
    expect(checkScannability({ ...base, logo: 'data:', logoSize: 0.35, ecLevel: 'Q' })[0]).toMatch(/Use H/)
    expect(checkScannability({ ...base, logo: 'data:', logoSize: 0.35, ecLevel: 'H' })).toEqual([])
  })
})

describe('buildQrOptions', () => {
  it('maps eye styles', () => {
    const o = buildQrOptions('x', { ...base, eyeStyle: 'extra-rounded' })
    expect(o.cornersSquareOptions.type).toBe('extra-rounded')
    expect(o.cornersDotOptions.type).toBe('dot')
  })
  it('builds gradients and version', () => {
    const o = buildQrOptions('x', { ...base, qrVersion: 7, gradient: { enabled: true, type: 'radial', angle: 90, color1: '#111111', color2: '#222222' } })
    expect(o.qrOptions).toEqual({ errorCorrectionLevel: 'M', typeNumber: 7 })
    expect(o.dotsOptions.gradient.type).toBe('radial')
    expect(o.dotsOptions.color).toBeUndefined()
  })
  it('scales logo margin with export size', () => {
    const o = buildQrOptions('x', { ...base, logo: 'data:', logoMargin: 6 }, { size: 1200 })
    expect(o.imageOptions.margin).toBe(24)
    expect(o.width).toBe(1200)
  })
})
