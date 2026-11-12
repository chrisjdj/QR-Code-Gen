/**
 * error-handler.js
 * Toast-style alerts in the preview panel (#alertArea, aria-live="polite").
 */

const ICONS = {
  success: '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>',
  warning: '<path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>',
  danger:  '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>',
  info:    '<path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>',
}

function dismiss(el) {
  if (!el?.isConnected) return
  el.classList.add('alert-leaving')
  setTimeout(() => el.remove(), 300)
}

/**
 * Show an alert. Messages are inserted as text (never HTML).
 * @param {string} message
 * @param {'info'|'success'|'warning'|'danger'} [type]
 * @param {{ id?: string, timeout?: number }} [opts] – `id` replaces an existing alert with the same id;
 *   `timeout: 0` keeps it until cleared.
 */
export function showAlert(message, type = 'info', { id, timeout = 5000 } = {}) {
  const area = document.getElementById('alertArea')
  if (!area) return null
  if (id) clearAlert(id)

  const el = document.createElement('div')
  el.className = `alert alert-${type}`
  if (id) el.dataset.alertId = id
  el.innerHTML = `<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16" aria-hidden="true">${ICONS[type] || ICONS.info}</svg><span></span>`
  el.querySelector('span').textContent = message
  area.appendChild(el)

  if (timeout > 0) setTimeout(() => dismiss(el), timeout)
  return el
}

export function clearAlert(id) {
  document.querySelectorAll(`#alertArea [data-alert-id="${CSS.escape(id)}"]`).forEach(el => el.remove())
}
