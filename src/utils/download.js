/**
 * download.js – File download helpers
 */

/** Trigger a browser file download */
export function triggerDownload(url, filename) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
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
