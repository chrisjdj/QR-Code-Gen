/**
 * input-forms.js
 * Renders the dynamic input form for each QR type.
 */

const FORMS = {
  url: {
    label: 'URL',
    fields: [
      { id: 'url', label: 'Website URL', type: 'url', placeholder: 'https://example.com', required: true, maxLength: 2000 },
    ],
  },
  text: {
    label: 'Text',
    fields: [
      { id: 'text', label: 'Text Content', type: 'textarea', placeholder: 'Enter any text...', required: true, maxLength: 2953 },
    ],
  },
  email: {
    label: 'Email',
    fields: [
      { id: 'to',      label: 'To (Email Address)', type: 'email',  placeholder: 'hello@example.com', required: true },
      { id: 'subject', label: 'Subject',             type: 'text',   placeholder: 'Email subject (optional)' },
      { id: 'body',    label: 'Message',             type: 'textarea', placeholder: 'Email body (optional)' },
    ],
  },
  phone: {
    label: 'Phone',
    fields: [
      { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1 234 567 8900', required: true },
    ],
  },
  sms: {
    label: 'SMS',
    fields: [
      { id: 'phone',   label: 'Phone Number', type: 'tel',      placeholder: '+1 234 567 8900', required: true },
      { id: 'message', label: 'Message',       type: 'textarea', placeholder: 'SMS message (optional)' },
    ],
  },
  whatsapp: {
    label: 'WhatsApp',
    fields: [
      { id: 'phone',   label: 'Phone Number (with country code)', type: 'tel',      placeholder: '+1 234 567 8900', required: true },
      { id: 'message', label: 'Pre-filled Message',               type: 'textarea', placeholder: 'Type a message (optional)' },
    ],
  },
  wifi: {
    label: 'WiFi',
    fields: [
      { id: 'ssid',     label: 'Network Name (SSID)', type: 'text',   placeholder: 'MyWiFiNetwork',  required: true },
      { id: 'password', label: 'Password',             type: 'password', placeholder: 'Network password' },
      { id: 'security', label: 'Security Type',        type: 'select', options: ['WPA', 'WEP', 'nopass'] },
      { id: 'hidden',   label: 'Hidden Network',       type: 'checkbox' },
    ],
  },
  vcard: {
    label: 'vCard',
    fields: [
      { id: 'firstName', label: 'First Name', type: 'text',  placeholder: 'John', required: true },
      { id: 'lastName',  label: 'Last Name',  type: 'text',  placeholder: 'Doe' },
      { id: 'org',       label: 'Company',    type: 'text',  placeholder: 'Acme Corp' },
      { id: 'title',     label: 'Job Title',  type: 'text',  placeholder: 'Software Engineer' },
      { id: 'phone',     label: 'Phone',      type: 'tel',   placeholder: '+1 234 567 8900' },
      { id: 'email',     label: 'Email',      type: 'email', placeholder: 'john@acme.com' },
      { id: 'url',       label: 'Website',    type: 'url',   placeholder: 'https://acme.com' },
      { id: 'address',   label: 'Address',    type: 'text',  placeholder: '123 Main St, City, Country' },
    ],
  },
  location: {
    label: 'Location',
    fields: [
      { id: 'query', label: 'Search Query (or use lat/lon below)', type: 'text', placeholder: 'Eiffel Tower, Paris' },
      { id: 'lat',   label: 'Latitude',  type: 'number', placeholder: '48.8584', step: 'any' },
      { id: 'lon',   label: 'Longitude', type: 'number', placeholder: '2.2945',  step: 'any' },
    ],
  },
  calendar: {
    label: 'Calendar Event',
    fields: [
      { id: 'title',       label: 'Event Title',   type: 'text',           placeholder: 'Team Meeting', required: true },
      { id: 'start',       label: 'Start Date/Time', type: 'datetime-local', required: true },
      { id: 'end',         label: 'End Date/Time',   type: 'datetime-local' },
      { id: 'location',    label: 'Location',       type: 'text',           placeholder: 'Conference Room A' },
      { id: 'description', label: 'Description',    type: 'textarea',       placeholder: 'Event details...' },
    ],
  },
  crypto: {
    label: 'Cryptocurrency',
    fields: [
      { id: 'coin',    label: 'Currency',        type: 'select',  options: ['BTC', 'ETH', 'LTC', 'USDT', 'BNB', 'XRP'] },
      { id: 'address', label: 'Wallet Address',  type: 'text',    placeholder: 'bc1q...', required: true },
      { id: 'amount',  label: 'Amount (optional)', type: 'number', placeholder: '0.001', step: 'any' },
      { id: 'label',   label: 'Label (optional)', type: 'text',   placeholder: 'Payment for invoice #123' },
    ],
  },
  raw: {
    label: 'Raw Payload',
    fields: [
      { id: 'payload', label: 'Raw QR Payload', type: 'textarea', placeholder: 'Enter any raw data...', required: true, maxLength: 2953 },
    ],
  },
}

/**
 * Render the form for a given QR type and return a value-getter function
 * @param {string} type
 * @param {Function} onChange - called whenever any field changes
 * @returns {{ getValues: () => Object }}
 */
export function renderForm(type, onChange) {
  const container = document.getElementById('dynamicForm')
  const config = FORMS[type]
  if (!config) return { getValues: () => ({}) }

  container.innerHTML = config.fields.map(field => buildField(field)).join('')

  // Populate existing values from localStorage if any
  const saved = getSavedValues(type)

  // Attach listeners
  config.fields.forEach(field => {
    if (field.type === 'checkbox') {
      const el = document.getElementById(`field_${field.id}`)
      if (saved[field.id] !== undefined) el.checked = saved[field.id]
      el.addEventListener('change', () => { saveValues(type, getValues(config)); onChange() })
    } else if (field.type === 'select' || field.type === 'textarea' || field.type !== 'checkbox') {
      const el = document.getElementById(`field_${field.id}`)
      if (el) {
        if (saved[field.id]) el.value = saved[field.id]
        el.addEventListener('input', () => {
          updateCharCount(field)
          saveValues(type, getValues(config))
          onChange()
        })
      }
    }
  })

  // Trigger initial render if saved values exist
  if (Object.keys(saved).length > 0) onChange()

  return { getValues: () => getValues(config) }
}

function buildField(field) {
  const id = `field_${field.id}`
  const required = field.required ? '<span class="required-dot" aria-label="required">*</span>' : ''
  let inputHtml = ''

  switch (field.type) {
    case 'textarea':
      inputHtml = `<textarea
        id="${id}" name="${field.id}"
        class="control-input"
        placeholder="${escHtml(field.placeholder || '')}"
        rows="3"
        ${field.maxLength ? `maxlength="${field.maxLength}"` : ''}
        aria-label="${escHtml(field.label)}"
      ></textarea>`
      break

    case 'select':
      const opts = (field.options || []).map(o => `<option value="${o}">${o}</option>`).join('')
      inputHtml = `<select id="${id}" name="${field.id}" class="control-select" aria-label="${escHtml(field.label)}">${opts}</select>`
      break

    case 'checkbox':
      return `<label class="checkbox-label form-field" style="padding-top:4px">
        <input type="checkbox" id="${id}" name="${field.id}" aria-label="${escHtml(field.label)}" />
        <span class="checkbox-custom"></span>
        ${escHtml(field.label)}
      </label>`

    default:
      inputHtml = `<input
        type="${field.type}"
        id="${id}" name="${field.id}"
        class="control-input"
        placeholder="${escHtml(field.placeholder || '')}"
        ${field.step ? `step="${field.step}"` : ''}
        ${field.maxLength ? `maxlength="${field.maxLength}"` : ''}
        aria-label="${escHtml(field.label)}"
      />`
  }

  const charCount = field.maxLength
    ? `<span class="char-count" id="char_${field.id}" aria-live="polite">0 / ${field.maxLength}</span>`
    : ''

  return `<div class="form-field">
    <label class="field-label" for="${id}">${escHtml(field.label)}${required}</label>
    ${inputHtml}
    ${charCount}
  </div>`
}

function updateCharCount(field) {
  if (!field.maxLength) return
  const el = document.getElementById(`field_${field.id}`)
  const counter = document.getElementById(`char_${field.id}`)
  if (!el || !counter) return
  const len = el.value.length
  counter.textContent = `${len} / ${field.maxLength}`
  counter.className = 'char-count' + (len > field.maxLength * 0.9 ? ' warning' : '') + (len >= field.maxLength ? ' danger' : '')
}

function getValues(config) {
  const values = {}
  config.fields.forEach(field => {
    const el = document.getElementById(`field_${field.id}`)
    if (!el) return
    values[field.id] = field.type === 'checkbox' ? el.checked : el.value
  })
  return values
}

function saveValues(type, values) {
  try { localStorage.setItem(`qr_form_${type}`, JSON.stringify(values)) } catch {}
}

function getSavedValues(type) {
  try { return JSON.parse(localStorage.getItem(`qr_form_${type}`)) || {} } catch { return {} }
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
