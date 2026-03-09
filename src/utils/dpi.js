/**
 * dpi.js – Inject DPI metadata into image blobs (PNG, JPEG)
 *
 * PNG:  Inserts/replaces a pHYs chunk with pixels-per-meter resolution.
 * JPEG: Patches the JFIF APP0 marker with X/Y density in DPI.
 */

const INCHES_PER_METER = 39.3701

// PNG signature bytes
const PNG_SIGNATURE = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]

// ─── PNG DPI ──────────────────────────────────────────────────────────────────

/**
 * Insert a pHYs chunk into a PNG blob. Returns a new Blob with DPI metadata.
 * @param {Blob} blob – Original PNG blob
 * @param {number} dpi – Target DPI (e.g. 300)
 * @returns {Promise<Blob>}
 */
export async function setPngDpi(blob, dpi) {
  const buffer = await blob.arrayBuffer()
  const src = new Uint8Array(buffer)

  // Validate PNG signature
  const isPng = PNG_SIGNATURE.every((b, i) => src[i] === b)
  if (!isPng) {
    return blob
  }

  // Parse the PNG into chunks
  const chunks = parsePngChunks(src)

  // Remove any existing pHYs chunks
  const filtered = chunks.filter(c => c.name !== 'pHYs')

  // Build the new pHYs chunk
  const phys = buildPHYsChunkData(dpi)

  // Insert pHYs right after IHDR (should be index 0 in chunks)
  const ihdrIndex = filtered.findIndex(c => c.name === 'IHDR')
  if (ihdrIndex === -1) {
    return blob
  }

  // Splice the pHYs chunk after IHDR
  filtered.splice(ihdrIndex + 1, 0, { name: 'pHYs', data: phys })

  // Reassemble the PNG
  const output = assemblePng(filtered)

  return new Blob([output], { type: 'image/png' })
}

/**
 * Parse a PNG file into an array of chunk objects.
 * Each chunk has: { name, rawBytes (the full chunk including length+type+data+CRC) }
 */
function parsePngChunks(data) {
  const chunks = []
  let offset = 8 // skip the 8-byte PNG signature

  while (offset < data.length) {
    const view = new DataView(data.buffer, data.byteOffset + offset)
    const dataLen = view.getUint32(0)
    const chunkTotalSize = 4 + 4 + dataLen + 4 // length + type + data + CRC



    const name = String.fromCharCode(
      data[offset + 4], data[offset + 5], data[offset + 6], data[offset + 7]
    )

    // Store the raw bytes of the chunk
    const rawBytes = data.slice(offset, offset + chunkTotalSize)
    chunks.push({ name, rawBytes })

    offset += chunkTotalSize

    // Stop after IEND
    if (name === 'IEND') break
  }

  return chunks
}

/**
 * Build just the 9-byte pHYs data section for the given DPI.
 */
function buildPHYsChunkData(dpi) {
  const ppm = Math.round(dpi * INCHES_PER_METER)
  const data = new Uint8Array(9)
  const view = new DataView(data.buffer)
  view.setUint32(0, ppm)  // X pixels per unit (big-endian)
  view.setUint32(4, ppm)  // Y pixels per unit (big-endian)
  data[8] = 1             // unit = meter
  return data
}

/**
 * Assemble a PNG file from an array of chunk objects.
 * Chunks with rawBytes are written as-is; chunks with data get a fresh wrapper.
 */
function assemblePng(chunks) {
  const parts = []

  // PNG signature
  parts.push(new Uint8Array(PNG_SIGNATURE))

  for (const chunk of chunks) {
    if (chunk.rawBytes) {
      // Existing chunk — already has length + type + data + CRC
      parts.push(chunk.rawBytes)
    } else {
      // New chunk (like our pHYs) — must build length + type + data + CRC
      const nameBytes = new Uint8Array([
        chunk.name.charCodeAt(0), chunk.name.charCodeAt(1),
        chunk.name.charCodeAt(2), chunk.name.charCodeAt(3),
      ])
      const dataLen = chunk.data.length
      const full = new Uint8Array(4 + 4 + dataLen + 4)
      const view = new DataView(full.buffer)

      // Length
      view.setUint32(0, dataLen)

      // Type
      full.set(nameBytes, 4)

      // Data
      full.set(chunk.data, 8)

      // CRC over type + data
      const crcInput = new Uint8Array(4 + dataLen)
      crcInput.set(nameBytes, 0)
      crcInput.set(chunk.data, 4)
      const crc = crc32(crcInput)
      view.setUint32(4 + 4 + dataLen, crc)

      parts.push(full)
    }
  }

  // Concatenate all parts
  const totalLen = parts.reduce((s, p) => s + p.length, 0)
  const result = new Uint8Array(totalLen)
  let pos = 0
  for (const p of parts) {
    result.set(p, pos)
    pos += p.length
  }
  return result
}

// ─── JPEG DPI ─────────────────────────────────────────────────────────────────

/**
 * Patch DPI into a JPEG blob's JFIF APP0 header.
 * If no JFIF header exists, one is inserted after the SOI marker.
 * @param {Blob} blob – Original JPEG blob
 * @param {number} dpi – Target DPI
 * @returns {Promise<Blob>}
 */
export async function setJpegDpi(blob, dpi) {
  const buffer = await blob.arrayBuffer()
  const src = new Uint8Array(buffer)

  // JFIF APP0 layout (from start of file):
  // Byte 0-1:   SOI (FF D8)
  // Byte 2-3:   APP0 marker (FF E0)
  // Byte 4-5:   Segment length
  // Byte 6-10:  "JFIF\0" identifier (5 bytes)
  // Byte 11:    Major version
  // Byte 12:    Minor version
  // Byte 13:    Density units (0=no units, 1=DPI, 2=dots/cm)
  // Byte 14-15: X density (big-endian uint16)
  // Byte 16-17: Y density (big-endian uint16)

  // Look for the JFIF APP0 marker (FF E0) right after SOI (FF D8)
  if (src[0] === 0xFF && src[1] === 0xD8 && src[2] === 0xFF && src[3] === 0xE0) {
    // JFIF header found — patch density fields in-place
    const patched = new Uint8Array(buffer.slice(0))
    const view = new DataView(patched.buffer)

    // Byte 13: density units (1 = DPI)
    patched[13] = 1

    // Bytes 14-15: X density
    view.setUint16(14, dpi)

    // Bytes 16-17: Y density
    view.setUint16(16, dpi)

    return new Blob([patched], { type: 'image/jpeg' })
  }

  // No JFIF header — insert a minimal one after SOI
  const jfif = new Uint8Array(18)
  const jView = new DataView(jfif.buffer)
  jfif[0] = 0xFF; jfif[1] = 0xE0       // APP0 marker
  jView.setUint16(2, 16)                // Length (16 bytes after marker)
  // "JFIF\0"
  jfif[4] = 0x4A; jfif[5] = 0x46; jfif[6] = 0x49; jfif[7] = 0x46; jfif[8] = 0x00
  jfif[9] = 1; jfif[10] = 1             // Version 1.1
  jfif[11] = 1                          // Units = DPI
  jView.setUint16(12, dpi)              // X density
  jView.setUint16(14, dpi)              // Y density
  jfif[16] = 0; jfif[17] = 0           // No thumbnail

  const result = new Uint8Array(2 + jfif.length + src.length - 2)
  result.set(src.subarray(0, 2), 0)          // SOI
  result.set(jfif, 2)                        // JFIF APP0
  result.set(src.subarray(2), 2 + jfif.length) // rest

  return new Blob([result], { type: 'image/jpeg' })
}

// ─── CRC32 ────────────────────────────────────────────────────────────────────

/** CRC32 for PNG chunks (per PNG spec, using reflected polynomial 0xEDB88320) */
function crc32(data) {
  let crc = 0xFFFFFFFF
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0)
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0
}
