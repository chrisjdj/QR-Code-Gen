/**
 * customizer.js
 * Reads all customization control values from the DOM.
 */

/** Initialize QR version dropdown (versions 1-40) */
export function initVersionDropdown() {
  const sel = document.getElementById('qrVersion')
  for (let v = 1; v <= 40; v++) {
    const opt = document.createElement('option')
    opt.value = v
    opt.textContent = `Version ${v}`
    sel.appendChild(opt)
  }
}

/** Initialize all collapsible sections */
export function initCollapsibles() {
  document.querySelectorAll('.section-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('aria-controls')
      const content = document.getElementById(targetId)
      const expanded = btn.getAttribute('aria-expanded') === 'true'
      btn.setAttribute('aria-expanded', String(!expanded))
      content.classList.toggle('hidden', expanded)
    })
  })
}

/** Read all current customization options from DOM */
export function getCustomizerState() {
  const fgColor     = document.getElementById('fgColor').value
  const bgColor     = document.getElementById('bgColor').value
  const transparent = document.getElementById('transparentBg').checked
  const dotStyle    = document.querySelector('[data-dot].active')?.dataset.dot || 'square'
  const eyeStyle    = document.querySelector('[data-eye].active')?.dataset.eye || 'square'
  const ecLevel     = document.getElementById('ecLevel').value
  const hasLogo     = !!document.getElementById('logoInput')?.__logoData
  const logoSize    = parseFloat(document.getElementById('logoSize')?.value || 30) / 100
  const logoMargin  = parseInt(document.getElementById('logoMargin')?.value || 5)

  // Gradient
  const gradEnabled = document.getElementById('enableGradient').checked
  const gradient = gradEnabled ? {
    enabled: true,
    type:   document.getElementById('gradientType').value,
    angle:  parseInt(document.getElementById('gradientAngle').value),
    color1: document.getElementById('gradientColor1').value,
    color2: document.getElementById('gradientColor2').value,
  } : { enabled: false }

  return {
    fgColor,
    bgColor,
    transparent,
    dotStyle,
    eyeStyle,
    ecLevel,
    gradient,
    logoSize,
    logoMargin,
    previewSize: 300,
  }
}

/** Initialize dot style button group */
export function initDotStyleSelector(onChange) {
  document.querySelectorAll('[data-dot]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-dot]').forEach(b => {
        b.classList.remove('active')
        b.setAttribute('aria-pressed', 'false')
      })
      btn.classList.add('active')
      btn.setAttribute('aria-pressed', 'true')
      onChange()
    })
  })
}

/** Initialize eye style button group */
export function initEyeStyleSelector(onChange) {
  document.querySelectorAll('[data-eye]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-eye]').forEach(b => {
        b.classList.remove('active')
        b.setAttribute('aria-pressed', 'false')
      })
      btn.classList.add('active')
      btn.setAttribute('aria-pressed', 'true')
      onChange()
    })
  })
}

/** Initialize color pair: swatch ↔ text input */
export function initColorPair(swatchId, textId, onChange) {
  const swatch = document.getElementById(swatchId)
  const text   = document.getElementById(textId)
  if (!swatch || !text) return

  swatch.addEventListener('input', () => {
    text.value = swatch.value
    onChange()
  })

  text.addEventListener('input', () => {
    if (/^#[0-9A-Fa-f]{6}$/.test(text.value)) {
      swatch.value = text.value
      onChange()
    }
  })
}

/** Initialize gradient toggle + controls */
export function initGradient(onChange) {
  const toggle   = document.getElementById('enableGradient')
  const controls = document.getElementById('gradientControls')
  const typeEl   = document.getElementById('gradientType')
  const angleEl  = document.getElementById('gradientAngle')
  const angleVal = document.getElementById('gradientAngleVal')
  const angleGroup = document.getElementById('gradientAngleGroup')

  if (!toggle || !controls) return

  toggle.addEventListener('change', () => {
    controls.classList.toggle('hidden', !toggle.checked)
    onChange()
  })

  typeEl?.addEventListener('change', () => {
    angleGroup.style.display = typeEl.value === 'radial' ? 'none' : ''
    onChange()
  })

  angleEl?.addEventListener('input', () => {
    if (angleVal) angleVal.textContent = angleEl.value
    onChange()
  })

  initColorPair('gradientColor1', 'gradientColor1Text', onChange)
  initColorPair('gradientColor2', 'gradientColor2Text', onChange)
}

/** Initialize logo controls (size, margin) */
export function initLogoControls(onChange) {
  const sizeEl   = document.getElementById('logoSize')
  const sizeVal  = document.getElementById('logoSizeVal')
  const marginEl = document.getElementById('logoMargin')
  const marginVal= document.getElementById('logoMarginVal')

  sizeEl?.addEventListener('input', () => {
    if (sizeVal) sizeVal.textContent = sizeEl.value
    onChange()
  })

  marginEl?.addEventListener('input', () => {
    if (marginVal) marginVal.textContent = marginEl.value
    onChange()
  })

  document.getElementById('logoRounded')?.addEventListener('change', onChange)
  document.getElementById('logoShadow')?.addEventListener('change', onChange)
  initColorPair('logoBgColor', 'logoBgColorText', onChange)
}
