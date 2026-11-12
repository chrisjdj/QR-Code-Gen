/**
 * main.js – QR Code Gen application entry point.
 * Owns app state and wires the UI modules together.
 */

import '@fontsource-variable/inter'
import './styles/main.scss'
import { initThemeSwitch } from './components/theme.js'
import { FORMS, renderForm, getFormValues, updateCharCount } from './components/input-forms.js'
import { getDesignOptions, serializeDesign, applyDesign, initDesignControls } from './components/customizer.js'
import { showAlert, clearAlert } from './components/error-handler.js'
import { buildPayload } from './qr-engine/payload-builder.js'
import { processLogo, readImageFile } from './qr-engine/logo-handler.js'
import { renderPreview, exportQr, copyQrToClipboard } from './qr-engine/generator.js'
import { checkScannability } from './qr-engine/scannability.js'
import { encodeConfig, decodeConfig, readConfigToken } from './utils/share.js'
import { makeFilename } from './utils/download.js'

const $ = id => document.getElementById(id)

// ─── State ───────────────────────────────────────────────────────────────────
const state = {
  type: 'url',
  payload: '',
  logo: null,          // data URL of the uploaded logo
  renderSeq: 0,        // guards against out-of-order async renders
  lastWarnings: '',
  defaultDesign: null, // snapshot used by "Reset design"
}

// ─── Storage (may throw in private mode / with blocked storage) ──────────────
const store = {
  get(key) { try { return JSON.parse(localStorage.getItem(key)) } catch { return null } },
  set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} },
  remove(key) { try { localStorage.removeItem(key) } catch {} },
}
const FORM_KEY = type => `qr_${type}`
const DESIGN_KEY = 'qr_design'

// ─── Render pipeline ─────────────────────────────────────────────────────────
let renderTimer = null
/** Debounced render. Form typing uses a longer delay than slider/colour drags. */
function scheduleRender(delay = 60) {
  clearTimeout(renderTimer)
  renderTimer = setTimeout(render, delay)
}

async function render() {
  clearTimeout(renderTimer)
  const seq = ++state.renderSeq
  const payload = buildPayload(state.type, getFormValues(state.type))

  if (!payload) {
    clearPreview(payload === null ? 'That doesn’t look valid yet – check your input.' : undefined)
    return
  }

  const design = getDesignOptions(state.logo)
  const image = design.logo
    ? await processLogo(design.logo, design.logoBgColor, design.logoRounded, design.logoShadow)
    : undefined
  if (seq !== state.renderSeq) return // a newer render started while we awaited

  try {
    renderPreview($('qrCanvas'), payload, design, image)
    state.payload = payload
    $('previewPlaceholder')?.classList.add('hidden')
    setExportEnabled(true)
    clearAlert('render-error')
    updateWarnings(design)
  } catch (err) {
    console.error('[QR] render error:', err)
    const msg = String(err?.message || err)
    showAlert(
      msg.includes('code length overflow')
        ? 'Content is too long for the selected QR version / error correction. Shorten it, lower error correction, or set the version to Auto.'
        : 'Failed to render QR code. Please check your inputs.',
      'warning',
      { id: 'render-error' },
    )
  }
}

function clearPreview(message) {
  state.renderSeq++
  state.payload = ''
  $('qrCanvas')?.replaceChildren()
  const ph = $('previewPlaceholder')
  ph?.classList.remove('hidden')
  const text = $('previewPlaceholderText')
  if (text) text.textContent = message || 'Enter content to generate QR code'
  setExportEnabled(false)
  clearAlert('render-error')
  updateWarnings(null)
}

function updateWarnings(design) {
  const warnings = design ? checkScannability(design) : []
  const text = warnings.join(' ')
  if (text === state.lastWarnings) return
  state.lastWarnings = text
  if (text) showAlert(text, 'warning', { id: 'scannability', timeout: 0 })
  else clearAlert('scannability')
}

function setExportEnabled(on) {
  document.querySelectorAll('[data-export], #copyImageBtn, #shareLinkBtn').forEach(b => { b.disabled = !on })
}

// ─── Content form ────────────────────────────────────────────────────────────
function mountForm(type, values) {
  const container = $('dynamicForm')
  if (!container) return
  renderForm(container, type, values ?? store.get(FORM_KEY(type)) ?? {})
}

function initForm() {
  const container = $('dynamicForm')
  if (!container) return
  // Delegated once – re-rendering the form must not stack listeners
  const onInput = e => {
    updateCharCount(e.target)
    store.set(FORM_KEY(state.type), getFormValues(state.type))
    scheduleRender(e.type === 'input' ? 200 : 0)
  }
  container.addEventListener('input', onInput)
  container.addEventListener('change', onInput)
}

function setType(type, values) {
  if (!FORMS[type]) return
  state.type = type
  document.querySelectorAll('.type-btn').forEach(b => {
    const on = b.dataset.type === type
    b.classList.toggle('active', on)
    b.setAttribute('aria-pressed', String(on))
  })
  mountForm(type, values)
  render()
}

function initTypeSelector() {
  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => { if (btn.dataset.type !== state.type) setType(btn.dataset.type) })
  })
}

// ─── Design ──────────────────────────────────────────────────────────────────
function onDesignChange() {
  store.set(DESIGN_KEY, serializeDesign())
  scheduleRender(60)
}

function initResetDesign() {
  $('resetDesignBtn')?.addEventListener('click', () => {
    applyDesign(state.defaultDesign)
    store.remove(DESIGN_KEY)
    render()
    showAlert('Design reset to defaults.', 'info', { id: 'reset' })
  })
}

// ─── Collapsibles ────────────────────────────────────────────────────────────
function initCollapsibles() {
  document.querySelectorAll('.section-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true'
      btn.setAttribute('aria-expanded', String(!open))
      $(btn.getAttribute('aria-controls'))?.classList.toggle('hidden', open)
    })
  })
}

// ─── Logo ────────────────────────────────────────────────────────────────────
function initLogoHandler() {
  const dropZone  = $('logoDropZone')
  const fileInput = $('logoInput')
  if (!dropZone || !fileInput) return

  const updateLogoUI = () => {
    const has = !!state.logo
    $('logoPreviewWrap')?.classList.toggle('hidden', !has)
    $('logoControls')?.classList.toggle('hidden', !has)
    $('logoWarning')?.classList.toggle('hidden', !has)
    dropZone.classList.toggle('hidden', has)
    if (has && $('logoPreviewImg')) $('logoPreviewImg').src = state.logo
  }

  const setLogo = async file => {
    try {
      state.logo = await readImageFile(file)
    } catch (err) {
      showAlert(err.message, 'danger', { id: 'logo' })
      return
    }
    clearAlert('logo')
    // Logos hide modules – bump error correction so the code stays scannable
    const ec = $('ecLevel')
    if (ec && ec.value !== 'H' && ec.value !== 'Q') {
      ec.value = 'H'
      store.set(DESIGN_KEY, serializeDesign())
    }
    updateLogoUI()
    render()
  }

  dropZone.addEventListener('click', e => { if (e.target !== fileInput) fileInput.click() })
  dropZone.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInput.click() }
  })
  fileInput.addEventListener('change', () => { if (fileInput.files[0]) setLogo(fileInput.files[0]) })
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over') })
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'))
  dropZone.addEventListener('drop', e => {
    e.preventDefault()
    dropZone.classList.remove('drag-over')
    if (e.dataTransfer?.files[0]) setLogo(e.dataTransfer.files[0])
  })
  document.addEventListener('paste', e => {
    const items = [...(e.clipboardData?.items || [])]
    const item = items.find(i => i.type.startsWith('image/'))
    if (!item) return
    // Rich content pasted into a text field (e.g. from Word) carries an image too – let the text through
    const t = e.target
    const editable = t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA)$/.test(t.tagName))
    if (editable && items.some(i => i.type === 'text/plain')) return
    e.preventDefault()
    setLogo(item.getAsFile())
  })
  $('removeLogo')?.addEventListener('click', () => {
    state.logo = null
    fileInput.value = ''
    updateLogoUI()
    dropZone.focus()
    render()
  })
}

// ─── Export ──────────────────────────────────────────────────────────────────
function getExportSize() {
  const sel = $('exportSize')
  const raw = sel?.value === 'custom' ? $('customSize')?.value : sel?.value
  const n = parseInt(raw, 10)
  return Number.isFinite(n) ? Math.min(Math.max(n, 100), 5000) : 1024
}

async function exportContext() {
  const design = getDesignOptions(state.logo)
  const image = design.logo
    ? await processLogo(design.logo, design.logoBgColor, design.logoRounded, design.logoShadow)
    : undefined
  return { data: state.payload, design, image }
}

async function withBusy(btn, fn) {
  if (!state.payload || btn.getAttribute('aria-busy') === 'true') return
  btn.setAttribute('aria-busy', 'true')
  try { await fn() }
  catch (err) {
    console.error('[Export]', err)
    showAlert(err?.message || 'Export failed.', 'danger', { id: 'export' })
  } finally {
    btn.removeAttribute('aria-busy')
  }
}

function initExport() {
  $('exportSize')?.addEventListener('change', e => {
    $('customSizeInputs')?.classList.toggle('hidden', e.target.value !== 'custom')
  })

  document.querySelectorAll('[data-export]').forEach(btn => {
    btn.addEventListener('click', () => withBusy(btn, async () => {
      document.querySelectorAll('[data-export]').forEach(b => b.classList.toggle('active', b === btn))
      await exportQr({
        ...(await exportContext()),
        format: btn.dataset.export,
        size: getExportSize(),
        dpi: parseInt($('exportDpi')?.value || '300', 10),
        filename: makeFilename(state.type, getFormValues(state.type)),
      })
    }))
  })

  const copyBtn = $('copyImageBtn')
  copyBtn?.addEventListener('click', () => withBusy(copyBtn, async () => {
    await copyQrToClipboard({ ...(await exportContext()), size: getExportSize() })
    showAlert('QR code image copied to clipboard.', 'success', { id: 'copy' })
  }))
}

// ─── Share links ─────────────────────────────────────────────────────────────
function initShare() {
  const btn = $('shareLinkBtn')
  btn?.addEventListener('click', () => withBusy(btn, async () => {
    const form = getFormValues(state.type)
    const token = encodeConfig({ v: 2, type: state.type, form, design: serializeDesign(), hasLogo: !!state.logo })
    // Fragment (#) – never sent to any server, unlike a query string
    const url = new URL(window.location.href)
    url.search = ''
    url.hash = `config=${token}`
    try {
      await navigator.clipboard.writeText(url.toString())
    } catch {
      throw new Error('Could not access the clipboard. Please allow clipboard permissions and try again.')
    }
    showAlert('Shareable link copied to clipboard!', 'success', { id: 'share' })
    if (state.type === 'wifi' && form.password) {
      showAlert('Heads-up: this link contains the WiFi password in plain form. Only share it with people you trust.', 'warning', { id: 'share-secret', timeout: 8000 })
    }
    if (state.logo) {
      showAlert('Your logo isn’t included in the link (too large) – the recipient will need to upload it.', 'info', { id: 'share-logo' })
    }
  }))
}

/** Restore state from a `#config=` (or legacy `?config=`) link. Returns true if applied. */
function applySharedConfig() {
  const token = readConfigToken()
  if (!token) return false

  // Strip the token so a refresh or bookmark doesn't keep re-applying it
  const clean = new URL(window.location.href)
  clean.searchParams.delete('config')
  clean.hash = ''
  window.history.replaceState(null, '', clean.pathname + clean.search)

  try {
    const config = decodeConfig(token)
    if (config.design) {
      applyDesign(config.design)
      store.set(DESIGN_KEY, serializeDesign())
    }
    if (FORMS[config.type]) {
      state.type = config.type
      if (config.form) store.set(FORM_KEY(config.type), config.form)
    }
    if (config.hasLogo) {
      showAlert('This shared design included a custom logo. Upload it again to fully restore it.', 'info', { id: 'shared-logo', timeout: 8000 })
    }
    return true
  } catch (err) {
    console.error('[Share] restore error:', err)
    showAlert('Failed to load the shared configuration – the link may be incomplete or corrupted.', 'danger')
    return false
  }
}

// ─── PWA ─────────────────────────────────────────────────────────────────────
function registerSW() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(err => {
      console.warn('[SW] registration failed:', err)
    })
  })
}

// ─── Boot ────────────────────────────────────────────────────────────────────
function init() {
  // The stored theme is applied before first paint by the inline script in <head>
  initThemeSwitch()
  initDesignControls(onDesignChange)
  state.defaultDesign = serializeDesign()
  const saved = store.get(DESIGN_KEY)
  if (saved) applyDesign(saved)

  initCollapsibles()
  initForm()
  initTypeSelector()
  initLogoHandler()
  initExport()
  initShare()
  initResetDesign()

  applySharedConfig()
  setType(state.type)

  registerSW()
}

if (import.meta.env.DEV) {
  window.__qrCodeGen = { state, render, getFormValues: () => getFormValues(state.type) }
}

init()
