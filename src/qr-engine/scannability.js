/**
 * scannability.js
 * Heuristic checks that flag designs likely to fail with real scanners.
 */

import { getContrastRatio, getLuminance } from '../utils/color-utils.js'

const EC_RANK = { L: 0, M: 1, Q: 2, H: 3 }

/**
 * @param {object} design – result of getDesignOptions()
 * @returns {string[]} human-readable warnings (empty = looks fine)
 */
export function checkScannability(design) {
  const warnings = []

  // Colors that matter: fg (or both gradient stops) against bg
  const fgColors = design.gradient?.enabled
    ? [design.gradient.color1, design.gradient.color2]
    : [design.fgColor]

  if (!design.transparent) {
    const minRatio = Math.min(...fgColors.map(c => getContrastRatio(c, design.bgColor)))
    if (minRatio < 3) {
      warnings.push(`Low contrast (${minRatio.toFixed(1)}:1) between modules and background — many scanners need at least 3:1, ideally 7:1.`)
    }
    const darkestFg = Math.min(...fgColors.map(getLuminance))
    if (darkestFg > getLuminance(design.bgColor)) {
      warnings.push('Modules are lighter than the background (inverted). Some scanners cannot read inverted QR codes.')
    }
  } else if (fgColors.some(c => getLuminance(c) > 0.5)) {
    warnings.push('Light modules on a transparent background may be unreadable when placed on a light surface.')
  }

  if (design.logo) {
    const ec = EC_RANK[design.ecLevel] ?? 1
    if (design.logoSize > 0.25 && ec < EC_RANK.H) {
      warnings.push(`Logo covers ${Math.round(design.logoSize * 100)}% with error correction ${design.ecLevel}. Use H or shrink the logo below 25%.`)
    } else if (design.logoSize > 0.4) {
      warnings.push('Very large logo — test-scan before printing.')
    }
  }

  return warnings
}
