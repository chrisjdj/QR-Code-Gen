/**
 * customizer.js
 * Design controls (style, colors, gradient, logo settings): reading,
 * serialising, restoring and wiring change events.
 */

const $ = id => document.getElementById(id)

/**
 * Every persisted/shared design input. Serialise, restore and reset are all
 * driven from this one list – add a control here and it just works.
 */
const DESIGN_FIELDS = [
  'fgColor', 'bgColor', 'transparentBg',
  'ecLevel', 'qrVersion',
  'enableGradient', 'gradientType', 'gradientAngle', 'gradientColor1', 'gradientColor2',
  'logoSize', 'logoMargin', 'logoRounded', 'logoShadow', 'logoBgColor',
]

/** Paired color pickers: swatch id → hex text input id */
const COLOR_PAIRS = ['fgColor', 'bgColor', 'gradientColor1', 'gradientColor2', 'logoBgColor']

/** Range inputs with a live value label */
const RANGE_LABELS = { gradientAngle: 'gradientAngleVal', logoSize: 'logoSizeVal', logoMargin: 'logoMarginVal' }

const HEX_RE = /^#[0-9A-Fa-f]{6}$/

const activeStyle = attr => document.querySelector(`[data-${attr}].active`)?.dataset?.[attr]

function setActiveStyle(attr, value) {
  const btns = document.querySelectorAll(`[data-${attr}]`)
  if (![...btns].some(b => b.dataset[attr] === value)) return
  btns.forEach(b => {
    const on = b.dataset[attr] === value
    b.classList.toggle('active', on)
    b.setAttribute('aria-checked', String(on))
    b.tabIndex = on ? 0 : -1
  })
}

/** Snapshot of the design controls, in the shape the QR engine consumes */
export function getDesignOptions(logo) {
  const transparent = $('transparentBg')?.checked || false
  return {
    fgColor:     $('fgColor')?.value || '#000000',
    bgColor:     transparent ? 'transparent' : ($('bgColor')?.value || '#ffffff'),
    transparent,
    dotStyle:    activeStyle('dot') || 'square',
    eyeStyle:    activeStyle('eye') || 'square',
    ecLevel:     $('ecLevel')?.value || 'M',
    qrVersion:   parseInt($('qrVersion')?.value || '0', 10) || 0,
    gradient: $('enableGradient')?.checked
      ? {
          enabled: true,
          type:   $('gradientType')?.value || 'linear',
          angle:  parseInt($('gradientAngle')?.value || '0', 10),
          color1: $('gradientColor1')?.value || '#6366f1',
          color2: $('gradientColor2')?.value || '#a855f7',
        }
      : { enabled: false },
    logo,
    logoSize:    parseFloat($('logoSize')?.value || '30') / 100,
    logoMargin:  parseInt($('logoMargin')?.value || '5', 10),
    logoBgColor: $('logoBgColor')?.value || '#ffffff',
    logoRounded: $('logoRounded')?.checked || false,
    logoShadow:  $('logoShadow')?.checked || false,
  }
}

/** Raw control values, for persistence and share links */
export function serializeDesign() {
  const out = { dotStyle: activeStyle('dot'), eyeStyle: activeStyle('eye') }
  for (const id of DESIGN_FIELDS) {
    const el = $(id)
    if (el) out[id] = el.type === 'checkbox' ? el.checked : el.value
  }
  return out
}

/** Apply a serialised design back onto the controls (unknown/invalid values are ignored) */
export function applyDesign(design = {}) {
  if (design.dotStyle) setActiveStyle('dot', design.dotStyle)
  if (design.eyeStyle) setActiveStyle('eye', design.eyeStyle)
  for (const id of DESIGN_FIELDS) {
    const el = $(id)
    const val = design[id]
    if (!el || val === undefined || val === null) continue
    if (el.type === 'checkbox') el.checked = !!val
    else if (el.type === 'color' && !HEX_RE.test(val)) continue
    else el.value = val
  }
  syncDependentUI()
}

/** Keep derived UI (hex text, labels, disabled/hidden groups) in sync with control values */
function syncDependentUI() {
  for (const id of COLOR_PAIRS) {
    const text = $(`${id}Text`)
    if (text && $(id)) text.value = $(id).value
  }
  for (const [id, labelId] of Object.entries(RANGE_LABELS)) {
    if ($(id) && $(labelId)) $(labelId).textContent = $(id).value
  }
  const transparent = $('transparentBg')?.checked
  if ($('bgColor'))     $('bgColor').disabled = transparent
  if ($('bgColorText')) $('bgColorText').disabled = transparent
  $('gradientControls')?.classList.toggle('hidden', !$('enableGradient')?.checked)
  $('gradientAngleGroup')?.classList.toggle('hidden', $('gradientType')?.value === 'radial')
}

/** Radio-group semantics + arrow-key navigation for style button grids */
function initStyleGroup(attr, onChange) {
  const btns = [...document.querySelectorAll(`[data-${attr}]`)]
  btns.forEach((btn, i) => {
    btn.setAttribute('role', 'radio')
    btn.removeAttribute('aria-pressed')
    btn.addEventListener('click', () => { setActiveStyle(attr, btn.dataset[attr]); onChange() })
    btn.addEventListener('keydown', e => {
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
      if (!step) return
      e.preventDefault()
      const next = btns[(i + step + btns.length) % btns.length]
      next.focus()
      next.click()
    })
  })
  setActiveStyle(attr, activeStyle(attr) || btns[0]?.dataset[attr])
}

/**
 * Wire every design control.
 * @param {() => void} onChange – called on any change (callers should debounce)
 */
export function initDesignControls(onChange) {
  // Populate QR version dropdown
  const versionSel = $('qrVersion')
  if (versionSel && versionSel.options.length <= 1) {
    for (let v = 1; v <= 40; v++) versionSel.add(new Option(`Version ${v}`, String(v)))
  }

  initStyleGroup('dot', onChange)
  initStyleGroup('eye', onChange)

  // Color swatch ↔ hex text
  for (const id of COLOR_PAIRS) {
    const swatch = $(id)
    const text = $(`${id}Text`)
    if (!swatch || !text) continue
    swatch.addEventListener('input', () => { text.value = swatch.value; onChange() })
    text.addEventListener('input', () => {
      let v = text.value.trim()
      if (!v.startsWith('#')) v = `#${v}`
      if (/^#[0-9A-Fa-f]{3}$/.test(v)) v = '#' + [...v.slice(1)].map(c => c + c).join('')
      const valid = HEX_RE.test(v)
      text.classList.toggle('invalid', !valid && text.value.length > 0)
      text.setAttribute('aria-invalid', String(!valid))
      if (valid) { swatch.value = v.toLowerCase(); onChange() }
    })
    text.addEventListener('blur', () => { text.value = swatch.value; text.classList.remove('invalid'); text.removeAttribute('aria-invalid') })
  }

  // Everything else: selects, checkboxes, ranges
  const others = DESIGN_FIELDS.filter(id => !COLOR_PAIRS.includes(id))
  for (const id of others) {
    const el = $(id)
    if (!el) continue
    el.addEventListener(el.type === 'range' ? 'input' : 'change', () => { syncDependentUI(); onChange() })
  }

  syncDependentUI()
}
