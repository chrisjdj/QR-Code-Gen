/**
 * color-utils.js – Color helper functions
 */

/** Validate a hex color string */
export function isValidHex(hex) {
  return /^#([0-9A-Fa-f]{3}){1,2}$/.test(hex)
}

/** Get relative luminance of a hex color (WCAG) */
export function getLuminance(hex) {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Calculate contrast ratio between two hex colors */
export function getContrastRatio(hex1, hex2) {
  const lum1 = getLuminance(hex1)
  const lum2 = getLuminance(hex2)
  const lighter = Math.max(lum1, lum2)
  const darker  = Math.min(lum1, lum2)
  return (lighter + 0.05) / (darker + 0.05)
}

/** Convert hex to { r, g, b } */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null
}

/** Ensure hex always starts with # */
export function normalizeHex(value) {
  if (!value) return '#000000'
  return value.startsWith('#') ? value : '#' + value
}
