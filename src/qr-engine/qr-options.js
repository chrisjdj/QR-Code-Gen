/**
 * qr-options.js
 * Maps the app's design state onto qr-code-styling options.
 * Single source of truth for both the live preview and exports.
 */

const EYE_MAP = {
  // eyeStyle → [cornersSquare type, cornersDot type]
  'square':        ['square',        'square'],
  'extra-rounded': ['extra-rounded', 'dot'],
  'dot':           ['dot',           'dot'],
}

/**
 * @param {string} data – encoded payload
 * @param {object} design – result of getDesignOptions()
 * @param {{ size?: number, type?: 'canvas'|'svg', image?: string }} [extra]
 */
export function buildQrOptions(data, design, { size = 300, type = 'canvas', image } = {}) {
  const dotsOptions = design.gradient?.enabled
    ? {
        type: design.dotStyle,
        gradient: {
          type: design.gradient.type === 'radial' ? 'radial' : 'linear',
          rotation: (design.gradient.angle * Math.PI) / 180,
          colorStops: [
            { offset: 0, color: design.gradient.color1 },
            { offset: 1, color: design.gradient.color2 },
          ],
        },
      }
    : { type: design.dotStyle, color: design.fgColor }

  const [squareType, dotType] = EYE_MAP[design.eyeStyle] || EYE_MAP.square
  const hasLogo = !!(image || design.logo)

  return {
    width: size,
    height: size,
    type,
    data,
    qrOptions: {
      errorCorrectionLevel: design.ecLevel,
      ...(design.qrVersion ? { typeNumber: design.qrVersion } : {}),
    },
    dotsOptions,
    cornersSquareOptions: { type: squareType, color: design.fgColor },
    cornersDotOptions:    { type: dotType,    color: design.fgColor },
    backgroundOptions:    { color: design.bgColor },
    image: image || design.logo || undefined,
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: hasLogo ? design.logoSize : 0.3,
      // Margin is in px at the 300px preview size; scale it so exports look identical
      margin: Math.round((hasLogo ? design.logoMargin : 5) * (size / 300)),
      crossOrigin: 'anonymous',
    },
  }
}
