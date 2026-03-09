/**
 * generator.js
 * Core QR generation engine wrapping qr-code-styling.
 */

import _QRCodeStyling from 'qr-code-styling'
import { triggerDownload } from '../utils/download.js'
import { jsPDF } from 'jspdf'

// Handle CJS/ESM interop: the package exports class as .default in some bundlers
const QRCodeStyling = _QRCodeStyling?.default ?? _QRCodeStyling

let qrInstance = null
let currentOptions = {}

/** Default QR options */
const DEFAULT_OPTIONS = {
  width: 300,
  height: 300,
  type: 'canvas',
  data: 'https://example.com',
  qrOptions: {
    errorCorrectionLevel: 'M',
  },
  dotsOptions: {
    type: 'square',
    color: '#000000',
  },
  cornersSquareOptions: {
    type: 'square',
    color: '#000000',
  },
  cornersDotOptions: {
    type: 'square',
    color: '#000000',
  },
  backgroundOptions: {
    color: '#ffffff',
  },
  imageOptions: {
    hideBackgroundDots: true,
    imageSize: 0.3,
    margin: 5,
  },
}

/**
 * Initialize or update the QR code
 * @param {string} data - Encoded payload
 * @param {Object} opts - Rendering options from UI state
 */
export function renderQR(data, opts = {}) {
  console.log('[QR Generator] Rendering with data:', data.substring(0, 50) + (data.length > 50 ? '...' : ''));
  if (!data?.trim()) {
    console.log('[QR Generator] Empty data, clearing');
    clearQR()
    return
  }

  const container = document.getElementById('qrCanvas')
  const placeholder = document.getElementById('previewPlaceholder')

  if (!container) {
    console.error('[QR Generator] qrCanvas not found!');
    return;
  }

  // Build qr-code-styling options
  const qrOpts = buildQROptions(data, opts)
  currentOptions = qrOpts
  console.log('[QR Generator] Raw options:', qrOpts);

  try {
    console.log('[QR Generator] Creating new instance');
    if (typeof QRCodeStyling !== 'function') {
      console.error('[QR Generator] QRCodeStyling is not a constructor!', QRCodeStyling);
      return;
    }
    
    // Create new instance instead of updating to prevent sticky deeply-merged properties (like gradient)
    qrInstance = new QRCodeStyling(qrOpts)
    container.innerHTML = ''
    qrInstance.append(container)
    console.log('[QR Generator] Appended to container');

    placeholder.classList.add('hidden')
    console.log('[QR Generator] Render complete');
  } catch (err) {
    console.error('[QR Generator] Error during rendering:', err);
  }
}

export function clearQR() {
  const container = document.getElementById('qrCanvas')
  const placeholder = document.getElementById('previewPlaceholder')
  container.innerHTML = ''
  qrInstance = null
  placeholder.classList.remove('hidden')
}

function buildQROptions(data, opts) {
  const {
    fgColor = '#000000',
    bgColor = '#ffffff',
    transparent = false,
    dotStyle = 'square',
    eyeStyle = 'square',
    ecLevel = 'M',
    gradient = null,
    logo = null,
    logoSize = 0.3,
    logoMargin = 5,
    previewSize = 300,
  } = opts

  const bgColorFinal = transparent ? 'transparent' : bgColor

  // Build dot options (with or without gradient)
  let dotsOptions
  if (gradient && gradient.enabled) {
    dotsOptions = {
      type: dotStyle,
      gradient: {
        type: gradient.type === 'radial' ? 'radial' : 'linear',
        rotation: (gradient.angle * Math.PI) / 180,
        colorStops: [
          { offset: 0, color: gradient.color1 },
          { offset: 1, color: gradient.color2 },
        ],
      },
    }
  } else {
    dotsOptions = { type: dotStyle, color: fgColor }
  }

  // Eye shape mapping
  const eyeSquareType = eyeStyle === 'square' ? 'square' : eyeStyle === 'extra-rounded' ? 'extra-rounded' : 'dot'
  const eyeDotType   = eyeStyle === 'dot' ? 'dot' : eyeStyle === 'extra-rounded' ? 'dot' : 'square'

  return {
    width: previewSize,
    height: previewSize,
    type: 'canvas',
    data,
    qrOptions: {
      errorCorrectionLevel: ecLevel,
    },
    dotsOptions,
    cornersSquareOptions: {
      type: eyeSquareType,
      color: fgColor,
    },
    cornersDotOptions: {
      type: eyeDotType,
      color: fgColor,
    },
    backgroundOptions: {
      color: bgColorFinal,
    },
    image: logo || undefined,
    imageOptions: logo
      ? {
          hideBackgroundDots: true,
          imageSize: logoSize,
          margin: logoMargin,
          crossOrigin: 'anonymous',
        }
      : undefined,
  }
}

/**
 * Export QR as PNG
 */
export async function exportPNG(size, data, opts) {
  if (!qrInstance) return
  const exportInstance = new QRCodeStyling({ ...buildQROptions(data, opts), width: size, height: size, type: 'canvas' })
  exportInstance.download({ name: 'qr-code', extension: 'png' })
}

/**
 * Export QR as SVG
 */
export async function exportSVG(size, data, opts) {
  if (!qrInstance) return
  const exportInstance = new QRCodeStyling({ ...buildQROptions(data, opts), width: size, height: size, type: 'svg' })
  exportInstance.download({ name: 'qr-code', extension: 'svg' })
}

/**
 * Export QR as JPG (canvas → blob → download)
 */
export async function exportJPG(size, data, opts) {
  if (!qrInstance) return
  const exportInstance = new QRCodeStyling({ ...buildQROptions(data, opts), width: size, height: size, type: 'canvas' })
  const rawData = await exportInstance.getRawData('png')
  if (!rawData) return

  // Convert PNG blob → canvas → JPEG blob
  const img = new Image()
  const url = URL.createObjectURL(rawData)
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = opts.bgColor || '#ffffff'
    ctx.fillRect(0, 0, size, size)
    ctx.drawImage(img, 0, 0)
    URL.revokeObjectURL(url)
    canvas.toBlob(blob => {
      const blobUrl = URL.createObjectURL(blob)
      triggerDownload(blobUrl, 'qr-code.jpg')
      URL.revokeObjectURL(blobUrl)
    }, 'image/jpeg', 0.95)
  }
  img.src = url
}

/**
 * Export QR as WebP
 */
export async function exportWebP(size, data, opts) {
  if (!qrInstance) return
  const exportInstance = new QRCodeStyling({ ...buildQROptions(data, opts), width: size, height: size, type: 'canvas' })
  const rawData = await exportInstance.getRawData('png')
  if (!rawData) return

  const img = new Image()
  const url = URL.createObjectURL(rawData)
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = opts.bgColor || '#ffffff'
    ctx.fillRect(0, 0, size, size)
    ctx.drawImage(img, 0, 0)
    URL.revokeObjectURL(url)
    canvas.toBlob(blob => {
      const blobUrl = URL.createObjectURL(blob)
      triggerDownload(blobUrl, 'qr-code.webp')
      URL.revokeObjectURL(blobUrl)
    }, 'image/webp', 0.95)
  }
  img.src = url
}

/**
 * Export QR as PDF via jsPDF
 */
export async function exportPDF(size, data, opts) {
  if (!qrInstance) return
  const exportInstance = new QRCodeStyling({ ...buildQROptions(data, opts), width: size, height: size, type: 'canvas' })
  const rawData = await exportInstance.getRawData('png')
  if (!rawData) return

  const imgUrl = await new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(rawData)
  })

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = 210
  const pageH = 297
  const qrMM = Math.min(pageW - 40, 150) // max 150mm centered
  const x = (pageW - qrMM) / 2
  const y = (pageH - qrMM) / 2

  pdf.setFillColor(255, 255, 255)
  pdf.rect(0, 0, pageW, pageH, 'F')
  pdf.addImage(imgUrl, 'PNG', x, y, qrMM, qrMM)
  pdf.save('qr-code.pdf')
}
