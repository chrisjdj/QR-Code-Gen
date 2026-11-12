/**
 * logo-handler.js
 * Reads user images and composites them onto a padded (optionally rounded /
 * shadowed) background tile before they are embedded in the QR code.
 */

import { loadImage } from '../utils/download.js'

const MAX_LOGO_BYTES = 5 * 1024 * 1024

/** Read an image File into a data URL. Rejects non-images and very large files. */
export function readImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith('image/')) return reject(new Error('Please choose an image file (PNG, JPG, SVG, WebP).'))
    if (file.size > MAX_LOGO_BYTES) return reject(new Error('Image is larger than 5 MB. Please use a smaller logo.'))
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not read the image file.'))
    reader.readAsDataURL(file)
  })
}

function roundRectPath(ctx, x, y, size, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + size, y, x + size, y + size, r)
  ctx.arcTo(x + size, y + size, x, y + size, r)
  ctx.arcTo(x, y + size, x, y, r)
  ctx.arcTo(x, y, x + size, y, r)
  ctx.closePath()
}

async function composeLogo(src, bgColor, rounded, shadow) {
  let img
  try { img = await loadImage(src) } catch { return src }

  const LOGO = 800
  const TILE = 1000
  const pad = shadow ? 80 : 0
  const aspect = (img.width || 1) / (img.height || 1)
  const drawW = aspect > 1 ? LOGO : LOGO * aspect
  const drawH = aspect > 1 ? LOGO / aspect : LOGO

  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = TILE + pad * 2
  const ctx = canvas.getContext('2d')
  const c = canvas.width / 2
  const x = c - TILE / 2
  const transparent = !bgColor || bgColor === 'transparent'

  if (!transparent) {
    if (shadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)'
      ctx.shadowBlur = 30
      ctx.shadowOffsetY = 15
    }
    ctx.fillStyle = bgColor
    if (rounded) { roundRectPath(ctx, x, x, TILE, TILE * 0.2); ctx.fill() }
    else ctx.fillRect(x, x, TILE, TILE)
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
    ctx.shadowOffsetY = 0
  }

  ctx.save()
  if (rounded) { roundRectPath(ctx, x, x, TILE, TILE * 0.2); ctx.clip() }
  ctx.drawImage(img, c - drawW / 2, c - drawH / 2, drawW, drawH)
  ctx.restore()

  return canvas.toDataURL('image/png')
}

// Memoise: re-compositing a 1000px+ canvas on every slider tick is the
// single most expensive part of a re-render. Only the last result is kept.
let cache = { src: null, key: '', promise: null }

export function processLogo(src, bgColor, rounded, shadow) {
  const key = `${bgColor}|${rounded ? 1 : 0}|${shadow ? 1 : 0}`
  if (cache.src === src && cache.key === key) return cache.promise
  const promise = composeLogo(src, bgColor, rounded, shadow)
  cache = { src, key, promise }
  return promise
}
