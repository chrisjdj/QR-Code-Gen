/**
 * debounce.js – Debounce utility
 */
export function debounce(fn, delay = 200) {
  let timer
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}
