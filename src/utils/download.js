/**
 * download.js – File download helpers
 */

/** Download a Blob as a file */
export function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoking synchronously can cancel the download in Safari/Firefox
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

/** Convert blob to data URL */
export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/** Convert canvas to blob */
export function canvasToBlob(canvas, type = 'image/png', quality = 1) {
  return new Promise(resolve => canvas.toBlob(resolve, type, quality))
}

/** Load a Blob/URL into an HTMLImageElement */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/** Build a short, filesystem-safe filename stem from the QR type and content */
export function makeFilename(type, values = {}) {
  const hint = {
    url: () => { try { return new URL(/^[a-z]+:/i.test(values.url) ? values.url : `https://${values.url}`).hostname } catch { return '' } },
    wifi: () => values.ssid,
    vcard: () => [values.firstName, values.lastName].filter(Boolean).join('-'),
    calendar: () => values.title,
    email: () => values.to,
    phone: () => values.phone,
    sms: () => values.phone,
    whatsapp: () => values.phone,
    crypto: () => values.coin,
  }[type]?.() || ''
  const slug = String(hint)
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9.@+-]+/g, '-').replace(/^-+|-+$/g, '')
    .slice(0, 40)
  return ['qr', type, slug].filter(Boolean).join('-')
}
