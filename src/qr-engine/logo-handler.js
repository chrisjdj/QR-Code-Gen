/**
 * logo-handler.js
 * Handles logo upload, FileReader processing, and logo state management.
 */

export class LogoHandler {
  constructor() {
    this.logoDataUrl = null
    this.onChange = null // callback when logo changes
  }

  /** Initialize DOM event listeners */
  init(onChange) {
    this.onChange = onChange
    const dropZone  = document.getElementById('logoDropZone')
    const fileInput  = document.getElementById('logoInput')
    const removeBtn  = document.getElementById('removeLogo')

    // Click to open file picker
    dropZone.addEventListener('click', (e) => {
      if (e.target !== fileInput) fileInput.click()
    })

    // File selected
    fileInput.addEventListener('change', (e) => {
      if (e.target.files[0]) this._processFile(e.target.files[0])
    })

    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault()
      dropZone.classList.add('drag-over')
    })

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over')
    })

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault()
      dropZone.classList.remove('drag-over')
      const file = e.dataTransfer?.files[0]
      if (file && file.type.startsWith('image/')) this._processFile(file)
    })

    // Keyboard accessibility
    dropZone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        fileInput.click()
      }
    })

    // Paste support
    document.addEventListener('paste', (e) => {
      const items = e.clipboardData?.items
      if (!items) return
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) {
            this._processFile(file)
            break
          }
        }
      }
    })

    // Remove logo
    removeBtn.addEventListener('click', () => this.removeLogo())
  }

  _processFile(file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      this.logoDataUrl = e.target.result
      this._updateUI()
      this.onChange?.(this.logoDataUrl)
    }
    reader.readAsDataURL(file)
  }

  _updateUI() {
    const wrap    = document.getElementById('logoPreviewWrap')
    const img     = document.getElementById('logoPreviewImg')
    const controls= document.getElementById('logoControls')
    const warning = document.getElementById('logoWarning')
    const dropZone= document.getElementById('logoDropZone')

    if (this.logoDataUrl) {
      img.src = this.logoDataUrl
      wrap.classList.remove('hidden')
      controls.classList.remove('hidden')
      warning.classList.remove('hidden')
      dropZone.classList.add('hidden')
    } else {
      wrap.classList.add('hidden')
      controls.classList.add('hidden')
      warning.classList.add('hidden')
      dropZone.classList.remove('hidden')
    }
  }

  removeLogo() {
    this.logoDataUrl = null
    document.getElementById('logoInput').value = ''
    this._updateUI()
    this.onChange?.(null)
  }

  getLogo() {
    return this.logoDataUrl
  }
}
