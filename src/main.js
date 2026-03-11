/**
 * main.js – QR Code Gen Application Entry Point
 */

import './styles/main.scss'
import _QRCodeStyling from 'qr-code-styling'
import { jsPDF } from 'jspdf'
import { setPngDpi, setJpegDpi } from './utils/dpi.js'

// CJS/ESM interop
const QRCodeStyling = _QRCodeStyling?.default ?? _QRCodeStyling

// ─── State ───────────────────────────────────────────────────────────────────
const state = {
  type: 'url',
  payload: '',
  logo: null,
  qrInstance: null,
}

// ─── QR Type Forms ───────────────────────────────────────────────────────────
const FORMS = {
  url: {
    fields: [
      { id: 'url', label: 'Website URL', type: 'url', placeholder: 'https://example.com', required: true, maxLength: 2000 },
    ],
  },
  text: {
    fields: [
      { id: 'text', label: 'Text Content', type: 'textarea', placeholder: 'Enter any text...', required: true, maxLength: 2953 },
    ],
  },
  email: {
    fields: [
      { id: 'to',      label: 'To (Email Address)', type: 'email',    placeholder: 'hello@example.com', required: true },
      { id: 'subject', label: 'Subject',             type: 'text',     placeholder: 'Subject (optional)' },
      { id: 'body',    label: 'Message',             type: 'textarea', placeholder: 'Body (optional)' },
    ],
  },
  phone: {
    fields: [{ id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1 234 567 8900', required: true }],
  },
  sms: {
    fields: [
      { id: 'phone',   label: 'Phone Number', type: 'tel',      placeholder: '+1 234 567 8900', required: true },
      { id: 'message', label: 'Message',       type: 'textarea', placeholder: 'SMS message (optional)' },
    ],
  },
  whatsapp: {
    fields: [
      { id: 'phone',   label: 'Phone Number (with country code)', type: 'tel',      placeholder: '+1 234 567 8900', required: true },
      { id: 'message', label: 'Pre-filled Message',               type: 'textarea', placeholder: 'Message (optional)' },
    ],
  },
  wifi: {
    fields: [
      { id: 'ssid',     label: 'Network Name (SSID)', type: 'text',     placeholder: 'MyWiFiNetwork',  required: true },
      { id: 'password', label: 'Password',             type: 'password', placeholder: 'Network password' },
      { id: 'security', label: 'Security Type',        type: 'select',   options: ['WPA', 'WEP', 'nopass'] },
      { id: 'hidden',   label: 'Hidden Network',       type: 'checkbox' },
    ],
  },
  vcard: {
    fields: [
      { id: 'firstName', label: 'First Name', type: 'text',  placeholder: 'John', required: true },
      { id: 'lastName',  label: 'Last Name',  type: 'text',  placeholder: 'Doe' },
      { id: 'org',       label: 'Company',    type: 'text',  placeholder: 'Acme Corp' },
      { id: 'title',     label: 'Job Title',  type: 'text',  placeholder: 'Software Engineer' },
      { id: 'phone',     label: 'Phone',      type: 'tel',   placeholder: '+1 234 567 8900' },
      { id: 'email',     label: 'Email',      type: 'email', placeholder: 'john@acme.com' },
      { id: 'url',       label: 'Website',    type: 'url',   placeholder: 'https://acme.com' },
      { id: 'address',   label: 'Address',    type: 'text',  placeholder: '123 Main St, City' },
    ],
  },
  location: {
    fields: [
      { id: 'query', label: 'Search Query (or lat/lon below)', type: 'text',   placeholder: 'Eiffel Tower, Paris' },
      { id: 'lat',   label: 'Latitude',  type: 'number', placeholder: '48.8584', step: 'any' },
      { id: 'lon',   label: 'Longitude', type: 'number', placeholder: '2.2945',  step: 'any' },
    ],
  },
  calendar: {
    fields: [
      { id: 'title',       label: 'Event Title',     type: 'text',           placeholder: 'Team Meeting', required: true, maxLength: 100 },
      { id: 'start',       label: 'Start Date/Time', type: 'datetime-local', required: true },
      { id: 'end',         label: 'End Date/Time',   type: 'datetime-local' },
      { id: 'location',    label: 'Location',        type: 'text',           placeholder: 'Conference Room A', maxLength: 100 },
      { id: 'description', label: 'Description',     type: 'textarea',       placeholder: 'Event details...', maxLength: 1000 },
    ],
  },
  crypto: {
    fields: [
      { id: 'coin',    label: 'Currency',          type: 'select',  options: ['BTC', 'ETH', 'LTC', 'USDT', 'BNB', 'XRP'] },
      { id: 'address', label: 'Wallet Address',    type: 'text',    placeholder: 'bc1q...', required: true },
      { id: 'amount',  label: 'Amount (optional)', type: 'number',  placeholder: '0.001', step: 'any' },
      { id: 'label',   label: 'Label (optional)',  type: 'text',    placeholder: 'Payment #123' },
    ],
  },
  raw: {
    fields: [
      { id: 'payload', label: 'Raw QR Payload', type: 'textarea', placeholder: 'Enter any raw data...', required: true, maxLength: 2953 },
    ],
  },
}

// ─── Payload Builders ────────────────────────────────────────────────────────
function buildPayload(type, values) {
  try {
    switch (type) {
      case 'url': {
        const url = (values.url || '').trim()
        if (!url) return ''
        try { new URL(url) } catch { return null } // invalid
        return url
      }
      case 'text':
        return (values.text || '').trim()
      case 'email': {
        if (!values.to) return ''
        const p = new URLSearchParams()
        if (values.subject) p.set('subject', values.subject)
        if (values.body)    p.set('body', values.body)
        const qs = p.toString()
        return `mailto:${values.to}${qs ? '?' + qs : ''}`
      }
      case 'phone':
        return values.phone ? `tel:${values.phone.trim()}` : ''
      case 'sms': {
        if (!values.phone) return ''
        const body = values.message ? `?body=${encodeURIComponent(values.message)}` : ''
        return `sms:${values.phone.trim()}${body}`
      }
      case 'whatsapp': {
        if (!values.phone) return ''
        const num = values.phone.replace(/\D/g, '')
        const text = values.message ? `?text=${encodeURIComponent(values.message)}` : ''
        return `https://wa.me/${num}${text}`
      }
      case 'wifi': {
        if (!values.ssid) return ''
        const esc = s => String(s).replace(/[\\;,":]/g, c => '\\' + c)
        const sec  = values.security || 'WPA'
        const pass = values.password || ''
        const hid  = values.hidden ? 'true' : 'false'
        return `WIFI:T:${sec};S:${esc(values.ssid)};P:${esc(pass)};H:${hid};;`
      }
      case 'vcard': {
        if (!values.firstName && !values.lastName) return ''
        const lines = [
          'BEGIN:VCARD', 'VERSION:3.0',
          `FN:${[values.firstName, values.lastName].filter(Boolean).join(' ')}`,
          `N:${values.lastName || ''};${values.firstName || ''};;;`,
        ]
        if (values.org)     lines.push(`ORG:${values.org}`)
        if (values.title)   lines.push(`TITLE:${values.title}`)
        if (values.phone)   lines.push(`TEL;TYPE=CELL:${values.phone}`)
        if (values.email)   lines.push(`EMAIL:${values.email}`)
        if (values.url)     lines.push(`URL:${values.url}`)
        if (values.address) lines.push(`ADR:;;${values.address};;;;`)
        lines.push('END:VCARD')
        return lines.join('\n')
      }
      case 'location':
        if (values.query) return `geo:0,0?q=${encodeURIComponent(values.query)}`
        if (!values.lat || !values.lon) return ''
        return `geo:${values.lat},${values.lon}`
      case 'calendar': {
        if (!values.title || !values.start) return ''
        const fmt = dt => dt.replace(/[-:]/g, '').replace('T', 'T').slice(0, 15)
        const lines = [
          'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//QR Code Gen//EN',
          'BEGIN:VEVENT', `SUMMARY:${values.title}`, `DTSTART:${fmt(values.start)}`,
        ]
        if (values.end)         lines.push(`DTEND:${fmt(values.end)}`)
        if (values.location)    lines.push(`LOCATION:${values.location}`)
        if (values.description) lines.push(`DESCRIPTION:${values.description}`)
        lines.push('END:VEVENT', 'END:VCALENDAR')
        return lines.join('\n')
      }
      case 'crypto': {
        if (!values.address) return ''
        const map = { BTC: 'bitcoin', ETH: 'ethereum', LTC: 'litecoin' }
        const scheme = map[values.coin] || (values.coin || 'bitcoin').toLowerCase()
        const p = new URLSearchParams()
        if (values.amount) p.set('amount', values.amount)
        if (values.label)  p.set('label', values.label)
        const qs = p.toString()
        return `${scheme}:${values.address}${qs ? '?' + qs : ''}`
      }
      case 'raw':
        return (values.payload || '').trim()
      default:
        return ''
    }
  } catch (err) {
    console.error('[buildPayload] error:', err)
    return null
  }
}

// ─── Form Rendering ───────────────────────────────────────────────────────────
function escHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function getFormValues() {
  const config = FORMS[state.type]
  if (!config) return {}
  const values = {}
  config.fields.forEach(f => {
    const el = document.getElementById(`field_${f.id}`)
    if (!el) return
    values[f.id] = f.type === 'checkbox' ? el.checked : el.value
  })
  return values
}

function renderForm(type) {
  const container = document.getElementById('dynamicForm')
  if (!container) { console.error('dynamicForm not found'); return }

  const config = FORMS[type]
  if (!config) { container.innerHTML = ''; return }

  // Try to restore saved values
  let saved = {}
  try { saved = JSON.parse(localStorage.getItem(`qr_${type}`)) || {} } catch {}

  container.innerHTML = config.fields.map(f => buildFieldHtml(f)).join('')

  // Hydrate with saved values
  config.fields.forEach(f => {
    const el = document.getElementById(`field_${f.id}`)
    if (!el) return
    if (f.type === 'checkbox') {
      if (saved[f.id] !== undefined) el.checked = saved[f.id]
    } else {
      if (saved[f.id] !== undefined && saved[f.id] !== null) el.value = saved[f.id]
    }
  })

  // Single delegated listener on the form container
  container.addEventListener('input',  onFormChange)
  container.addEventListener('change', onFormChange)

  // Trigger render if we have saved values
  if (Object.keys(saved).length > 0) {
    requestAnimationFrame(triggerRender)
  }
}

function buildFieldHtml(f) {
  const id  = `field_${f.id}`
  const req  = f.required ? '<span class="required-dot" aria-label="required">*</span>' : ''
  let input = ''

  if (f.type === 'textarea') {
    input = `<textarea id="${id}" name="${f.id}" class="control-input" placeholder="${escHtml(f.placeholder)}" rows="3" ${f.maxLength ? `maxlength="${f.maxLength}"` : ''} aria-label="${escHtml(f.label)}"></textarea>`
  } else if (f.type === 'select') {
    const opts = (f.options || []).map(o => `<option value="${o}">${o}</option>`).join('')
    input = `<select id="${id}" name="${f.id}" class="control-select" aria-label="${escHtml(f.label)}">${opts}</select>`
  } else if (f.type === 'checkbox') {
    return `<label class="checkbox-label form-field">
      <input type="checkbox" id="${id}" name="${f.id}" aria-label="${escHtml(f.label)}" />
      <span class="checkbox-custom"></span>
      ${escHtml(f.label)}
    </label>`
  } else {
    input = `<input type="${f.type}" id="${id}" name="${f.id}" class="control-input" placeholder="${escHtml(f.placeholder || '')}" ${f.step ? `step="${f.step}"` : ''} ${f.maxLength ? `maxlength="${f.maxLength}"` : ''} aria-label="${escHtml(f.label)}" />`
  }

  const counter = f.maxLength ? `<span class="char-count" id="char_${f.id}">0 / ${f.maxLength}</span>` : ''

  return `<div class="form-field">
    <label class="field-label" for="${id}">${escHtml(f.label)}${req}</label>
    ${input}${counter}
  </div>`
}

let renderTimer = null
function onFormChange(e) {
  // Update char counter if applicable
  const el = e.target
  const fieldId = el.name
  if (fieldId) {
    const counter = document.getElementById(`char_${fieldId}`)
    if (counter && el.maxLength > 0) {
      counter.textContent = `${el.value.length} / ${el.maxLength}`
    }
  }
  // Save to localStorage
  try {
    localStorage.setItem(`qr_${state.type}`, JSON.stringify(getFormValues()))
  } catch {}
  // Debounce render
  clearTimeout(renderTimer)
  renderTimer = setTimeout(triggerRender, 200)
}

// ─── Render Core ─────────────────────────────────────────────────────────────
async function triggerRender() {
  const values  = getFormValues()
  const payload = buildPayload(state.type, values)

  if (!payload) {
    clearPreview()
    return
  }

  const opts = getDesignOptions()
  if (opts.logo) {
    opts.processedLogo = await processLogo(opts.logo, opts.logoBgColor, opts.logoRounded, opts.logoShadow)
  }
  renderQR(payload, opts)
}

function getDesignOptions() {
  const fgColor     = document.getElementById('fgColor')?.value   || '#000000'
  const bgColor     = document.getElementById('bgColor')?.value   || '#ffffff'
  const transparent = document.getElementById('transparentBg')?.checked || false
  const dotStyle    = document.querySelector('[data-dot].active')?.dataset?.dot || 'square'
  const eyeStyle    = document.querySelector('[data-eye].active')?.dataset?.eye || 'square'
  const ecLevel     = document.getElementById('ecLevel')?.value   || 'M'
  const qrVersion   = parseInt(document.getElementById('qrVersion')?.value || 0)
  const gradEnabled = document.getElementById('enableGradient')?.checked || false

  const gradient = gradEnabled ? {
    enabled: true,
    type:    document.getElementById('gradientType')?.value  || 'linear',
    angle:   parseInt(document.getElementById('gradientAngle')?.value || 0),
    color1:  document.getElementById('gradientColor1')?.value || '#6366f1',
    color2:  document.getElementById('gradientColor2')?.value || '#a855f7',
  } : { enabled: false }

  return {
    fgColor,
    bgColor: transparent ? 'transparent' : bgColor,
    transparent,
    dotStyle,
    eyeStyle,
    ecLevel,
    qrVersion,
    gradient,
    logo: state.logo,
    logoSize:   parseFloat(document.getElementById('logoSize')?.value   || 30) / 100,
    logoMargin: parseInt(document.getElementById('logoMargin')?.value || 5),
    logoBgColor: document.getElementById('logoBgColor')?.value || '#ffffff',
    logoRounded: document.getElementById('logoRounded')?.checked || false,
    logoShadow: document.getElementById('logoShadow')?.checked || false,
  }
}

// ─── Logo Processing ─────────────────────────────────────────────────────────
function processLogo(src, bgColor, rounded, shadow) {
  return new Promise(resolve => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const aspect = img.width / img.height
      let drawW, drawH
      if (aspect > 1) {
        drawW = 800
        drawH = 800 / aspect
      } else {
        drawH = 800
        drawW = 800 * aspect
      }

      const bgSize = 1000
      const padding = shadow ? 80 : 0
      canvas.width = bgSize + padding * 2
      canvas.height = bgSize + padding * 2
      
      const ctx = canvas.getContext('2d')
      const cx = canvas.width / 2
      const cy = canvas.height / 2

      if (shadow) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.25)'
        ctx.shadowBlur = 30
        ctx.shadowOffsetY = 15
      }

      if (bgColor !== 'transparent') {
        ctx.fillStyle = bgColor
      } else {
        ctx.fillStyle = 'rgba(0,0,0,0)'
      }

      const bgX = cx - bgSize / 2
      const bgY = cy - bgSize / 2

      if (rounded) {
        const r = bgSize * 0.2
        ctx.beginPath()
        ctx.moveTo(bgX + r, bgY)
        ctx.arcTo(bgX + bgSize, bgY, bgX + bgSize, bgY + bgSize, r)
        ctx.arcTo(bgX + bgSize, bgY + bgSize, bgX, bgY + bgSize, r)
        ctx.arcTo(bgX, bgY + bgSize, bgX, bgY, r)
        ctx.arcTo(bgX, bgY, bgX + bgSize, bgY, r)
        ctx.closePath()
        ctx.fill()
        
        if (bgColor === 'transparent' || !bgColor) {
           ctx.save()
           ctx.beginPath()
           ctx.moveTo(bgX + r, bgY)
           ctx.arcTo(bgX + bgSize, bgY, bgX + bgSize, bgY + bgSize, r)
           ctx.arcTo(bgX + bgSize, bgY + bgSize, bgX, bgY + bgSize, r)
           ctx.arcTo(bgX, bgY + bgSize, bgX, bgY, r)
           ctx.arcTo(bgX, bgY, bgX + bgSize, bgY, r)
           ctx.closePath()
           ctx.clip()
           ctx.drawImage(img, cx - drawW / 2, cy - drawH / 2, drawW, drawH)
           ctx.restore()
           resolve(canvas.toDataURL('image/png'))
           return
        }
      } else {
        ctx.fillRect(bgX, bgY, bgSize, bgSize)
      }

      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0

      ctx.drawImage(img, cx - drawW / 2, cy - drawH / 2, drawW, drawH)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => resolve(src)
    img.src = src
  })
}

function renderQR(data, opts) {
  const container   = document.getElementById('qrCanvas')
  const placeholder = document.getElementById('previewPlaceholder')
  if (!container) return

  // Build dot options
  let dotsOptions
  if (opts.gradient?.enabled) {
    dotsOptions = {
      type: opts.dotStyle,
      gradient: {
        type:       opts.gradient.type === 'radial' ? 'radial' : 'linear',
        rotation:   (opts.gradient.angle * Math.PI) / 180,
        colorStops: [
          { offset: 0, color: opts.gradient.color1 },
          { offset: 1, color: opts.gradient.color2 },
        ],
      },
    }
  } else {
    dotsOptions = { type: opts.dotStyle, color: opts.fgColor }
  }

  const eyeSquareType = opts.eyeStyle === 'square' ? 'square' : opts.eyeStyle === 'extra-rounded' ? 'extra-rounded' : 'dot'
  const eyeDotType    = opts.eyeStyle === 'dot'    ? 'dot'    : opts.eyeStyle === 'extra-rounded' ? 'dot'           : 'square'

  const qrOpts = {
    width:  300,
    height: 300,
    type:   'canvas',
    data,
    qrOptions: {
      errorCorrectionLevel: opts.ecLevel,
      ...(opts.qrVersion ? { typeNumber: opts.qrVersion } : {}),
    },
    dotsOptions,
    cornersSquareOptions: { type: eyeSquareType, color: opts.fgColor },
    cornersDotOptions:    { type: eyeDotType,    color: opts.fgColor },
    backgroundOptions:    { color: opts.bgColor },
    image: opts.processedLogo || opts.logo || undefined,
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: opts.logo ? opts.logoSize : 0.3,
      margin:    opts.logo ? opts.logoMargin : 5,
      crossOrigin: 'anonymous',
    },
  }

  try {
    // Recreate instance fully to prevent sticky properties like gradient being deeply merged when removed
    state.qrInstance = new QRCodeStyling(qrOpts)
    container.innerHTML = ''
    state.qrInstance.append(container)
    
    state.payload = data
    placeholder?.classList.add('hidden')
  } catch (err) {
    console.error('[QR] render error:', err)
    const msg = String(err.message || err)
    if (msg.includes('code length overflow')) {
      showAlert('Content too long for the selected QR Version or settings. Try reducing text, lowering Error Correction, or using Auto Version.', 'warning')
    } else {
      showAlert('Failed to render QR Code. Please check your inputs.', 'danger')
    }
  }
}

function clearPreview() {
  const container   = document.getElementById('qrCanvas')
  const placeholder = document.getElementById('previewPlaceholder')
  if (container) container.innerHTML = ''
  placeholder?.classList.remove('hidden')
  state.qrInstance = null
  state.payload    = ''
}

// ─── Type Selector ────────────────────────────────────────────────────────────
function initTypeSelector() {
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')
      state.type = btn.dataset.type
      clearPreview()
      renderForm(state.type)
    })
  })
}

// ─── Design Controls ─────────────────────────────────────────────────────────
function initDesignControls() {
  // Dot style
  document.querySelectorAll('[data-dot]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-dot]').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false') })
      btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true')
      triggerRender()
    })
  })

  // Eye style
  document.querySelectorAll('[data-eye]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-eye]').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false') })
      btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true')
      triggerRender()
    })
  })

  // Version + EC level
  document.getElementById('qrVersion')?.addEventListener('change', triggerRender)
  document.getElementById('ecLevel')?.addEventListener('change', triggerRender)

  // Colors
  function syncColorPair(swatchId, textId) {
    const swatch = document.getElementById(swatchId)
    const text   = document.getElementById(textId)
    if (!swatch || !text) return
    swatch.addEventListener('input', () => { text.value = swatch.value; triggerRender() })
    text.addEventListener('input', () => {
      if (/^#[0-9A-Fa-f]{6}$/.test(text.value)) { swatch.value = text.value; triggerRender() }
    })
  }
  syncColorPair('fgColor', 'fgColorText')
  syncColorPair('bgColor', 'bgColorText')

  // Transparent bg
  document.getElementById('transparentBg')?.addEventListener('change', (e) => {
    document.getElementById('bgColor').disabled    = e.target.checked
    document.getElementById('bgColorText').disabled = e.target.checked
    triggerRender()
  })

  // Gradient
  const gradToggle   = document.getElementById('enableGradient')
  const gradControls = document.getElementById('gradientControls')
  gradToggle?.addEventListener('change', () => {
    gradControls?.classList.toggle('hidden', !gradToggle.checked)
    triggerRender()
  })
  document.getElementById('gradientType')?.addEventListener('change', () => {
    const angleGroup = document.getElementById('gradientAngleGroup')
    if (angleGroup) angleGroup.style.display = document.getElementById('gradientType').value === 'radial' ? 'none' : ''
    triggerRender()
  })
  document.getElementById('gradientAngle')?.addEventListener('input', (e) => {
    const val = document.getElementById('gradientAngleVal')
    if (val) val.textContent = e.target.value
    triggerRender()
  })
  syncColorPair('gradientColor1', 'gradientColor1Text')
  syncColorPair('gradientColor2', 'gradientColor2Text')

  // Logo controls
  document.getElementById('logoSize')?.addEventListener('input', (e) => {
    const v = document.getElementById('logoSizeVal'); if (v) v.textContent = e.target.value
    triggerRender()
  })
  document.getElementById('logoMargin')?.addEventListener('input', (e) => {
    const v = document.getElementById('logoMarginVal'); if (v) v.textContent = e.target.value
    triggerRender()
  })
  document.getElementById('logoRounded')?.addEventListener('change', triggerRender)
  document.getElementById('logoShadow')?.addEventListener('change', triggerRender)
  syncColorPair('logoBgColor', 'logoBgColorText')

  // QR Version dropdown population
  const versionSel = document.getElementById('qrVersion')
  if (versionSel) {
    for (let v = 1; v <= 40; v++) {
      const opt = document.createElement('option'); opt.value = v; opt.textContent = `Version ${v}`
      versionSel.appendChild(opt)
    }
  }
}

// ─── Collapsibles ─────────────────────────────────────────────────────────────
function initCollapsibles() {
  document.querySelectorAll('.section-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const id      = btn.getAttribute('aria-controls')
      const content = document.getElementById(id)
      const open    = btn.getAttribute('aria-expanded') === 'true'
      btn.setAttribute('aria-expanded', String(!open))
      content?.classList.toggle('hidden', open)
    })
  })
}

// ─── Logo Handler ─────────────────────────────────────────────────────────────
function initLogoHandler() {
  const dropZone  = document.getElementById('logoDropZone')
  const fileInput = document.getElementById('logoInput')
  const removeBtn = document.getElementById('removeLogo')
  if (!dropZone || !fileInput) return

  const processFile = (file) => {
    if (!file?.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => {
      state.logo = e.target.result
      updateLogoUI()
      // Auto-upgrade EC to H when logo added
      const ecEl = document.getElementById('ecLevel')
      if (ecEl && ecEl.value !== 'H' && ecEl.value !== 'Q') ecEl.value = 'H'
      triggerRender()
    }
    reader.readAsDataURL(file)
  }

  dropZone.addEventListener('click',   (e) => { if (e.target !== fileInput) fileInput.click() })
  dropZone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click() } })
  fileInput.addEventListener('change', (e) => { if (e.target.files[0]) processFile(e.target.files[0]) })
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag-over') })
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'))
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault(); dropZone.classList.remove('drag-over')
    processFile(e.dataTransfer?.files[0])
  })
  document.addEventListener('paste', (e) => {
    for (const item of e.clipboardData?.items || []) {
      if (item.type.startsWith('image/')) { processFile(item.getAsFile()); break }
    }
  })
  removeBtn?.addEventListener('click', () => {
    state.logo = null; fileInput.value = ''; updateLogoUI(); triggerRender()
  })

  function updateLogoUI() {
    const wrap    = document.getElementById('logoPreviewWrap')
    const img     = document.getElementById('logoPreviewImg')
    const controls= document.getElementById('logoControls')
    const warning = document.getElementById('logoWarning')
    const hasLogo = !!state.logo
    wrap?.classList.toggle('hidden', !hasLogo)
    controls?.classList.toggle('hidden', !hasLogo)
    warning?.classList.toggle('hidden', !hasLogo)
    dropZone.classList.toggle('hidden', hasLogo)
    if (img && state.logo) img.src = state.logo
  }
}

// ─── Scan Mode ────────────────────────────────────────────────────────────────
function initScanMode() {
  document.getElementById('lightMode')?.addEventListener('click', () => {
    document.getElementById('previewPanel')?.classList.remove('dark-scan-mode')
    document.body.classList.add('light-mode')
    document.getElementById('lightMode')?.classList.add('active')
    document.getElementById('darkMode')?.classList.remove('active')
    localStorage.setItem('theme', 'light')
  })
  document.getElementById('darkMode')?.addEventListener('click', () => {
    document.getElementById('previewPanel')?.classList.add('dark-scan-mode')
    document.body.classList.remove('light-mode')
    document.getElementById('darkMode')?.classList.add('active')
    document.getElementById('lightMode')?.classList.remove('active')
    localStorage.setItem('theme', 'dark')
  })

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.getElementById('darkMode')?.click();
  } else if (savedTheme === 'light') {
    document.getElementById('lightMode')?.click();
  }
}

// ─── Export ───────────────────────────────────────────────────────────────────
function getExportSize() {
  const sel = document.getElementById('exportSize')
  if (sel?.value === 'custom') {
    const w = parseInt(document.getElementById('customWidth')?.value || 1200)
    const h = parseInt(document.getElementById('customHeight')?.value || 1200)
    return Math.max(w, h)
  }
  return parseInt(sel?.value || 1024)
}

function buildExportOptions(size) {
  const opts = getDesignOptions()
  return { ...opts, width: size, height: size }
}

function getExportDpi() {
  return parseInt(document.getElementById('exportDpi')?.value || 300)
}

async function exportAs(format) {
  if (!state.payload) return
  const size = getExportSize()
  const dpi  = getExportDpi()
  const opts = buildExportOptions(size)

  if (opts.logo) {
    opts.processedLogo = await processLogo(opts.logo, opts.logoBgColor, opts.logoRounded, opts.logoShadow)
  }

  let dotsOptions
  if (opts.gradient?.enabled) {
    dotsOptions = {
      type: opts.dotStyle,
      gradient: {
        type:       opts.gradient.type === 'radial' ? 'radial' : 'linear',
        rotation:   (opts.gradient.angle * Math.PI) / 180,
        colorStops: [{ offset: 0, color: opts.gradient.color1 }, { offset: 1, color: opts.gradient.color2 }],
      },
    }
  } else {
    dotsOptions = { type: opts.dotStyle, color: opts.fgColor }
  }

  const eyeSquareType = opts.eyeStyle === 'square' ? 'square' : opts.eyeStyle === 'extra-rounded' ? 'extra-rounded' : 'dot'
  const eyeDotType    = opts.eyeStyle === 'dot'    ? 'dot'    : opts.eyeStyle === 'extra-rounded' ? 'dot'           : 'square'

  const qrOpts = {
    width: size, height: size, type: format === 'svg' ? 'svg' : 'canvas',
    data: state.payload,
    qrOptions: {
      errorCorrectionLevel: opts.ecLevel,
      ...(opts.qrVersion ? { typeNumber: opts.qrVersion } : {}),
    },
    dotsOptions,
    cornersSquareOptions: { type: eyeSquareType, color: opts.fgColor },
    cornersDotOptions:    { type: eyeDotType,    color: opts.fgColor },
    backgroundOptions:    { color: opts.bgColor },
    image: opts.processedLogo || opts.logo || undefined,
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: opts.logo ? opts.logoSize : 0.3,
      margin:    opts.logo ? opts.logoMargin : 5,
      crossOrigin: 'anonymous',
    },
  }

  const instance = new QRCodeStyling(qrOpts)

  // SVG export — DPI not applicable (vector format)
  if (format === 'svg') {
    instance.download({ name: 'qr-code-gen', extension: 'svg' })
    return
  }

  // PNG export — inject pHYs DPI chunk
  if (format === 'png') {
    const rawBlob = await instance.getRawData('png')
    if (!rawBlob) return
    const dpiBlob = await setPngDpi(rawBlob, dpi)
    triggerBlobDownload(dpiBlob, 'qr-code-gen.png')
    return
  }

  // PDF export — DPI handled by mm-based layout
  const blob = await instance.getRawData('png')
  if (!blob) return

  if (format === 'pdf') {
    const dataUrl = await blobToDataUrl(blob)
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const qrMM = Math.min(170, 150)
    const x = (210 - qrMM) / 2
    const y = (297 - qrMM) / 2
    pdf.setFillColor(255, 255, 255); pdf.rect(0, 0, 210, 297, 'F')
    pdf.addImage(dataUrl, 'PNG', x, y, qrMM, qrMM)
    pdf.save('qr-code-gen.pdf')
    return
  }

  // JPG / WebP export — re-encode via canvas then inject DPI
  const mimeMap = { jpg: 'image/jpeg', webp: 'image/webp' }
  const mime    = mimeMap[format] || 'image/png'
  const img     = new Image()
  const blobUrl = URL.createObjectURL(blob)
  img.onload = async () => {
    const canvas = document.createElement('canvas')
    canvas.width = size; canvas.height = size
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = opts.bgColor || '#ffffff'
    ctx.fillRect(0, 0, size, size)
    ctx.drawImage(img, 0, 0)
    URL.revokeObjectURL(blobUrl)
    canvas.toBlob(async b => {
      let finalBlob = b
      if (format === 'jpg') {
        finalBlob = await setJpegDpi(b, dpi)
      }
      // WebP has no standard DPI metadata field — downloaded as-is
      triggerBlobDownload(finalBlob, `qr-code-gen.${format}`)
    }, mime, 0.95)
  }
  img.src = blobUrl
}

/** Helper to download a Blob */
function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function blobToDataUrl(blob) {
  return new Promise(res => {
    const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob)
  })
}

function initExportButtons() {
  document.getElementById('exportSize')?.addEventListener('change', (e) => {
    document.getElementById('customSizeInputs')?.classList.toggle('hidden', e.target.value !== 'custom')
  })

  const exportBtns = document.querySelectorAll('.export-btn')
  
  const setActiveFormat = (btn) => {
    exportBtns.forEach(b => b.classList.remove('active'))
    btn.classList.add('active')
  }

  document.getElementById('exportPng')?.addEventListener('click',  (e) => {
    setActiveFormat(e.currentTarget)
    exportAs('png')
  })
  document.getElementById('exportSvg')?.addEventListener('click',  (e) => {
    setActiveFormat(e.currentTarget)
    exportAs('svg')
  })
  document.getElementById('exportJpg')?.addEventListener('click',  (e) => {
    setActiveFormat(e.currentTarget)
    exportAs('jpg')
  })
  document.getElementById('exportWebp')?.addEventListener('click', (e) => {
    setActiveFormat(e.currentTarget)
    exportAs('webp')
  })
  document.getElementById('exportPdf')?.addEventListener('click',  (e) => {
    setActiveFormat(e.currentTarget)
    exportAs('pdf')
  })
}

// ─── Alerts ───────────────────────────────────────────────────────────────────
function showAlert(message, type = 'info') {
  const container = document.getElementById('alertArea')
  if (!container) return
  const alert = document.createElement('div')
  alert.className = `alert alert-${type}`
  
  let icon = ''
  if (type === 'success') icon = '<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>'
  else if (type === 'warning') icon = '<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>'
  else if (type === 'danger') icon = '<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>'
  else icon = '<svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>'

  alert.innerHTML = `${icon}<span>${message}</span>`
  container.appendChild(alert)
  
  setTimeout(() => {
    alert.style.opacity = '0'
    alert.style.transform = 'translateY(-6px)'
    alert.style.transition = 'all 0.3s'
    setTimeout(() => alert.remove(), 300)
  }, 5000)
}

// ─── Share Configuration ──────────────────────────────────────────────────────
function initShareConfig() {
  document.getElementById('shareLinkBtn')?.addEventListener('click', async () => {
    try {
      const config = {
        type: state.type,
        form: getFormValues(),
        design: {
          fgColor: document.getElementById('fgColor')?.value,
          bgColor: document.getElementById('bgColor')?.value,
          transparentBg: document.getElementById('transparentBg')?.checked,
          dotStyle: document.querySelector('[data-dot].active')?.dataset?.dot,
          eyeStyle: document.querySelector('[data-eye].active')?.dataset?.eye,
          ecLevel: document.getElementById('ecLevel')?.value,
          qrVersion: document.getElementById('qrVersion')?.value,
          enableGradient: document.getElementById('enableGradient')?.checked,
          gradientType: document.getElementById('gradientType')?.value,
          gradientAngle: document.getElementById('gradientAngle')?.value,
          gradientColor1: document.getElementById('gradientColor1')?.value,
          gradientColor2: document.getElementById('gradientColor2')?.value,
          logoSize: document.getElementById('logoSize')?.value,
          logoMargin: document.getElementById('logoMargin')?.value,
          logoRounded: document.getElementById('logoRounded')?.checked,
          logoShadow: document.getElementById('logoShadow')?.checked,
          logoBgColor: document.getElementById('logoBgColor')?.value,
        },
        hasLogo: !!state.logo
      }
      
      const hash = btoa(unescape(encodeURIComponent(JSON.stringify(config))))
      const url = new URL(window.location.href)
      url.search = `?config=${hash}`
      
      await navigator.clipboard.writeText(url.toString())
      showAlert('Shareable link copied to clipboard!', 'success')
      if (state.logo) {
        showAlert('Your custom logo is not included in the shareable link due to size limits. It will need to be re-uploaded.', 'warning')
      }
    } catch (err) {
      console.error('[Share] Failed to copy link:', err)
      showAlert('Failed to copy shareable link.', 'danger')
    }
  })
}

function applySharedConfig() {
  const params = new URLSearchParams(window.location.search)
  const configHash = params.get('config')
  if (!configHash) return false

  try {
    const config = JSON.parse(decodeURIComponent(escape(atob(configHash))))
    
    // 1. Set type and prepare form values for rendering
    if (config.type) {
      state.type = config.type
      
      document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'))
      const activeBtn = document.querySelector(`[data-type="${config.type}"]`)
      if (activeBtn) activeBtn.classList.add('active')
      
      if (config.form) {
        localStorage.setItem(`qr_${config.type}`, JSON.stringify(config.form))
      }
    }

    // 2. Map design values back to DOM
    if (config.design) {
      const setVal = (id, val) => {
        const el = document.getElementById(id)
        if (el && val !== undefined) {
          if (el.type === 'checkbox') el.checked = val
          else el.value = val
          
          const textEl = document.getElementById(`${id}Text`)
          if (textEl && el.type === 'color') textEl.value = val
        }
      }

      setVal('fgColor', config.design.fgColor)
      setVal('bgColor', config.design.bgColor)
      setVal('transparentBg', config.design.transparentBg)
      
      if (config.design.dotStyle) {
        document.querySelectorAll('[data-dot]').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false') })
        const btn = document.querySelector(`[data-dot="${config.design.dotStyle}"]`)
        if (btn) { btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true') }
      }

      if (config.design.eyeStyle) {
        document.querySelectorAll('[data-eye]').forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false') })
        const btn = document.querySelector(`[data-eye="${config.design.eyeStyle}"]`)
        if (btn) { btn.classList.add('active'); btn.setAttribute('aria-pressed', 'true') }
      }

      setVal('ecLevel', config.design.ecLevel)
      setVal('qrVersion', config.design.qrVersion)
      setVal('enableGradient', config.design.enableGradient)
      setVal('gradientType', config.design.gradientType)
      setVal('gradientAngle', config.design.gradientAngle)
      setVal('gradientColor1', config.design.gradientColor1)
      setVal('gradientColor2', config.design.gradientColor2)
      setVal('logoSize', config.design.logoSize)
      setVal('logoMargin', config.design.logoMargin)
      setVal('logoRounded', config.design.logoRounded)
      setVal('logoShadow', config.design.logoShadow)
      setVal('logoBgColor', config.design.logoBgColor)

      // Sync specific interdependent UI groups
      document.getElementById('bgColor').disabled = !!config.design.transparentBg
      document.getElementById('bgColorText').disabled = !!config.design.transparentBg
      const gradControls = document.getElementById('gradientControls')
      if (gradControls) gradControls.classList.toggle('hidden', !config.design.enableGradient)
      const angleGroup = document.getElementById('gradientAngleGroup')
      if (angleGroup && config.design.gradientType) angleGroup.style.display = config.design.gradientType === 'radial' ? 'none' : ''
      const angleVal = document.getElementById('gradientAngleVal')
      if (angleVal && config.design.gradientAngle !== undefined) angleVal.textContent = config.design.gradientAngle
      const logoSizeVal = document.getElementById('logoSizeVal')
      if (logoSizeVal && config.design.logoSize !== undefined) logoSizeVal.textContent = config.design.logoSize
      const logoMarginVal = document.getElementById('logoMarginVal')
      if (logoMarginVal && config.design.logoMargin !== undefined) logoMarginVal.textContent = config.design.logoMargin
    }

    // Clean up URL to avoid a persistent massive hash that users might save by accident
    window.history.replaceState({}, document.title, window.location.pathname)

    // Alert about logo missing if applicable immediately after load
    if (config.hasLogo) {
      setTimeout(() => {
        showAlert('The shared QR code originally included a custom logo. Please upload it again to fully restore the configuration.', 'warning')
      }, 500)
    }
    
    return true
  } catch (err) {
    console.error('[Share] restore error:', err)
    showAlert('Failed to load shared configuration. The link might be invalid.', 'danger')
    return false
  }
}

// ─── PWA ─────────────────────────────────────────────────────────────────────
function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    })
  }
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
function init() {
  initTypeSelector()
  initDesignControls()
  initCollapsibles()
  initLogoHandler()
  initScanMode()
  initExportButtons()
  initShareConfig()
  
  const didRestore = applySharedConfig()
  
  renderForm(state.type)  // Mount default URL form, or the restored type

  if (didRestore) {
    // Slight delay to ensure DOM bindings and inputs are 100% applied
    setTimeout(triggerRender, 150)
  }
  
  registerSW()
}

// Expose for debugging
window.__qrCodeGen = { state, triggerRender, getFormValues }

init()
