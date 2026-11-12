/**
 * generator.js
 * Thin wrapper over qr-code-styling for preview rendering, export and copy.
 */

import _QRCodeStyling from 'qr-code-styling'
import { buildQrOptions } from './qr-options.js'
import { setPngDpi, setJpegDpi } from '../utils/dpi.js'
import { triggerBlobDownload, blobToDataUrl, canvasToBlob, loadImage } from '../utils/download.js'

// CJS/ESM interop: the package exports the class as .default in some bundlers
const QRCodeStyling = _QRCodeStyling?.default ?? _QRCodeStyling

/**
 * Render a preview into `container`. Throws on encoding errors (e.g. overflow).
 * A fresh instance is created each time so removed options (e.g. gradient)
 * don't stick around through qr-code-styling's deep-merge.
 */
export function renderPreview(container, data, design, image) {
  const instance = new QRCodeStyling(buildQrOptions(data, design, { size: 300, image }))
  const tmp = document.createElement('div')
  instance.append(tmp)           // render off-DOM first so a failure keeps the old preview
  container.replaceChildren(...tmp.childNodes)
  return instance
}

async function getPng(data, design, size, image) {
  const instance = new QRCodeStyling(buildQrOptions(data, design, { size, image }))
  const blob = await instance.getRawData('png')
  if (!blob) throw new Error('Failed to render image')
  return blob
}

/**
 * Export and download a QR code.
 * @param {'png'|'svg'|'jpg'|'webp'|'pdf'} format
 */
export async function exportQr({ format, data, design, image, size, dpi, filename }) {
  if (format === 'svg') {
    const instance = new QRCodeStyling(buildQrOptions(data, design, { size, type: 'svg', image }))
    const blob = await instance.getRawData('svg')
    if (!blob) throw new Error('Failed to render SVG')
    triggerBlobDownload(blob, `${filename}.svg`)
    return
  }

  const png = await getPng(data, design, size, image)

  if (format === 'png') {
    triggerBlobDownload(await setPngDpi(png, dpi), `${filename}.png`)
    return
  }

  if (format === 'pdf') {
    // jsPDF is large and rarely used – load it on demand
    const { jsPDF } = await import('jspdf')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const qrMM = 150
    const x = (210 - qrMM) / 2
    const y = (297 - qrMM) / 2
    pdf.addImage(await blobToDataUrl(png), 'PNG', x, y, qrMM, qrMM)
    pdf.save(`${filename}.pdf`)
    return
  }

  // JPG / WebP: re-encode via canvas
  const url = URL.createObjectURL(png)
  try {
    const img = await loadImage(url)
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')
    // JPEG has no alpha – a transparent background would turn black
    if (format === 'jpg' || !design.transparent) {
      ctx.fillStyle = design.transparent ? '#ffffff' : design.bgColor
      ctx.fillRect(0, 0, size, size)
    }
    ctx.drawImage(img, 0, 0, size, size)
    const mime = format === 'jpg' ? 'image/jpeg' : 'image/webp'
    let blob = await canvasToBlob(canvas, mime, 0.95)
    if (!blob) throw new Error(`Your browser cannot encode ${format.toUpperCase()}`)
    if (format === 'jpg') blob = await setJpegDpi(blob, dpi)
    // WebP has no standard DPI metadata field – downloaded as-is
    triggerBlobDownload(blob, `${filename}.${format}`)
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Copy the QR code as a PNG image to the clipboard */
export async function copyQrToClipboard({ data, design, image, size = 1024 }) {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    throw new Error('Copying images is not supported in this browser.')
  }
  // Pass a promise so Safari keeps the user-activation context
  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': getPng(data, design, size, image) }),
  ])
}
