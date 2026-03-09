/**
 * error-handler.js
 * Displays validation alerts in the preview panel alert area.
 */

const ALERT_SVG = {
  warning: `<svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,
  danger:  `<svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,
  success: `<svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>`,
  info:    `<svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`,
}

let alerts = []

/** Show an alert in the alert area */
export function showAlert(id, type, message) {
  const area = document.getElementById('alertArea')
  if (!area) return

  // Remove existing alert with same id
  clearAlert(id)

  const div = document.createElement('div')
  div.className = `alert alert-${type}`
  div.setAttribute('data-alert-id', id)
  div.innerHTML = `${ALERT_SVG[type] || ''} <span>${message}</span>`
  area.appendChild(div)
  alerts.push(id)
}

/** Remove a specific alert by id */
export function clearAlert(id) {
  const area = document.getElementById('alertArea')
  if (!area) return
  const existing = area.querySelector(`[data-alert-id="${id}"]`)
  if (existing) {
    area.removeChild(existing)
    alerts = alerts.filter(a => a !== id)
  }
}

/** Clear all alerts */
export function clearAllAlerts() {
  const area = document.getElementById('alertArea')
  if (area) area.innerHTML = ''
  alerts = []
}

/** Validate payload and show relevant errors/warnings */
export function validateAndAlert(payload, opts = {}) {
  clearAllAlerts()

  if (!payload) return

  // Data length warning
  const len = payload.length
  if (len > 2953) {
    showAlert('capacity', 'danger', `Data too large (${len} chars). Maximum QR capacity is ~2953 characters for alphanumeric data.`)
    return false
  }
  if (len > 2000) {
    showAlert('length-warn', 'warning', `Long payload (${len} chars). Consider reducing content for better scan reliability.`)
  }

  // Low contrast warning
  if (opts.fgColor && opts.bgColor && !opts.transparent) {
    const { getContrastRatio } = window.__colorUtils || {}
    if (getContrastRatio) {
      const ratio = getContrastRatio(opts.fgColor, opts.bgColor)
      if (ratio < 3) {
        showAlert('contrast', 'warning', `Low color contrast (${ratio.toFixed(1)}:1). QR code may be hard to scan. Recommended minimum: 3:1.`)
      }
    }
  }

  return true
}
