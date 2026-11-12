/**
 * input-forms.js
 * Field definitions per QR type and the dynamic form renderer.
 */

export const FORMS = {
  url: [
    { id: 'url', label: 'Website URL', type: 'url', placeholder: 'https://example.com', required: true, maxLength: 2000 },
  ],
  text: [
    { id: 'text', label: 'Text Content', type: 'textarea', placeholder: 'Enter any text...', required: true, maxLength: 2953 },
  ],
  email: [
    { id: 'to',      label: 'To (Email Address)', type: 'email',    placeholder: 'hello@example.com', required: true },
    { id: 'subject', label: 'Subject',            type: 'text',     placeholder: 'Subject (optional)' },
    { id: 'body',    label: 'Message',            type: 'textarea', placeholder: 'Body (optional)' },
  ],
  phone: [
    { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+1 234 567 8900', required: true },
  ],
  sms: [
    { id: 'phone',   label: 'Phone Number', type: 'tel',      placeholder: '+1 234 567 8900', required: true },
    { id: 'message', label: 'Message',      type: 'textarea', placeholder: 'SMS message (optional)' },
  ],
  whatsapp: [
    { id: 'phone',   label: 'Phone Number (with country code)', type: 'tel',      placeholder: '+1 234 567 8900', required: true },
    { id: 'message', label: 'Pre-filled Message',               type: 'textarea', placeholder: 'Message (optional)' },
  ],
  wifi: [
    { id: 'ssid',     label: 'Network Name (SSID)', type: 'text',     placeholder: 'MyWiFiNetwork', required: true },
    { id: 'password', label: 'Password',            type: 'password', placeholder: 'Network password' },
    { id: 'security', label: 'Security Type',       type: 'select',   options: [['WPA', 'WPA/WPA2/WPA3'], ['WEP', 'WEP'], ['nopass', 'None (open)']] },
    { id: 'hidden',   label: 'Hidden Network',      type: 'checkbox' },
  ],
  vcard: [
    { id: 'firstName', label: 'First Name', type: 'text',  placeholder: 'John', required: true },
    { id: 'lastName',  label: 'Last Name',  type: 'text',  placeholder: 'Doe' },
    { id: 'org',       label: 'Company',    type: 'text',  placeholder: 'Acme Corp' },
    { id: 'title',     label: 'Job Title',  type: 'text',  placeholder: 'Software Engineer' },
    { id: 'phone',     label: 'Phone',      type: 'tel',   placeholder: '+1 234 567 8900' },
    { id: 'email',     label: 'Email',      type: 'email', placeholder: 'john@acme.com' },
    { id: 'url',       label: 'Website',    type: 'url',   placeholder: 'https://acme.com' },
    { id: 'address',   label: 'Address',    type: 'text',  placeholder: '123 Main St, City' },
  ],
  location: [
    { id: 'query', label: 'Search Query (or lat/lon below)', type: 'text', placeholder: 'Eiffel Tower, Paris' },
    { id: 'lat',   label: 'Latitude',  type: 'number', placeholder: '48.8584', step: 'any', min: -90,  max: 90 },
    { id: 'lon',   label: 'Longitude', type: 'number', placeholder: '2.2945',  step: 'any', min: -180, max: 180 },
  ],
  calendar: [
    { id: 'title',       label: 'Event Title',     type: 'text',           placeholder: 'Team Meeting', required: true, maxLength: 100 },
    { id: 'start',       label: 'Start Date/Time', type: 'datetime-local', required: true },
    { id: 'end',         label: 'End Date/Time',   type: 'datetime-local' },
    { id: 'location',    label: 'Location',        type: 'text',           placeholder: 'Conference Room A', maxLength: 100 },
    { id: 'description', label: 'Description',     type: 'textarea',       placeholder: 'Event details...', maxLength: 1000 },
  ],
  crypto: [
    { id: 'coin',    label: 'Currency',          type: 'select', options: ['BTC', 'ETH', 'LTC', 'USDT', 'BNB', 'XRP'] },
    { id: 'address', label: 'Wallet Address',    type: 'text',   placeholder: 'bc1q...', required: true },
    { id: 'amount',  label: 'Amount (optional)', type: 'number', placeholder: '0.001', step: 'any', min: 0 },
    { id: 'label',   label: 'Label (optional)',  type: 'text',   placeholder: 'Payment #123' },
  ],
  raw: [
    { id: 'payload', label: 'Raw QR Payload', type: 'textarea', placeholder: 'Enter any raw data...', required: true, maxLength: 2953 },
  ],
}

export function escHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const attr = (name, val) => (val === undefined || val === null || val === '' ? '' : ` ${name}="${escHtml(val)}"`)

function buildFieldHtml(f) {
  const id = `field_${f.id}`

  if (f.type === 'checkbox') {
    return `<label class="checkbox checkbox-label form-field">
      <input type="checkbox" id="${id}" name="${f.id}" />
      ${escHtml(f.label)}
    </label>`
  }

  const common = `id="${id}" name="${f.id}"${f.required ? ' required aria-required="true"' : ''}`
  let input
  if (f.type === 'textarea') {
    input = `<textarea ${common} class="textarea control-input" rows="3"${attr('placeholder', f.placeholder)}${attr('maxlength', f.maxLength)}></textarea>`
  } else if (f.type === 'select') {
    const opts = (f.options || []).map(o => {
      const [value, label] = Array.isArray(o) ? o : [o, o]
      return `<option value="${escHtml(value)}">${escHtml(label)}</option>`
    }).join('')
    input = `<select ${common} class="select control-select">${opts}</select>`
  } else {
    input = `<input type="${f.type}" ${common} class="input control-input"${attr('placeholder', f.placeholder)}${attr('step', f.step)}${attr('min', f.min)}${attr('max', f.max)}${attr('maxlength', f.maxLength)} />`
  }

  const req = f.required ? '<span class="required-dot" aria-hidden="true">*</span>' : ''
  const counter = f.maxLength ? `<span class="field__hint char-count" id="char_${f.id}" aria-live="off">0 / ${f.maxLength}</span>` : ''

  return `<div class="field form-field">
    <label class="field__label field-label" for="${id}">${escHtml(f.label)}${req}</label>
    ${input}${counter}
  </div>`
}

/** Read current values for the given type from the DOM */
export function getFormValues(type) {
  const values = {}
  for (const f of FORMS[type] || []) {
    const el = document.getElementById(`field_${f.id}`)
    if (el) values[f.id] = f.type === 'checkbox' ? el.checked : el.value
  }
  return values
}

/** Update the character counter for one field element */
export function updateCharCount(el) {
  const counter = el?.name && document.getElementById(`char_${el.name}`)
  if (counter && el.maxLength > 0) counter.textContent = `${el.value.length} / ${el.maxLength}`
}

/**
 * Render the form for `type` into `container` and hydrate with `saved` values.
 * Event listeners are NOT attached here – the caller delegates once on the container.
 */
export function renderForm(container, type, saved = {}) {
  const fields = FORMS[type] || []
  container.innerHTML = fields.map(buildFieldHtml).join('')

  for (const f of fields) {
    const el = document.getElementById(`field_${f.id}`)
    const v = saved[f.id]
    if (!el || v === undefined || v === null) continue
    if (f.type === 'checkbox') el.checked = !!v
    else el.value = v
    updateCharCount(el)
  }
}
