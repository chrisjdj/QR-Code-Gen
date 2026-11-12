# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.6.0] - 2026-11-12

### Changed
- **Redesigned UI** on the design system shared by all the tools in the suite (see [DESIGN.md](./DESIGN.md)). The look is a clean product UI: neutral surfaces, an indigo accent, cards, subtle borders and shadows. Gradients and glow effects are gone.
- **Theme switch.** A System / Light / Dark control in the header replaces the light/dark toggle in the preview panel.
  - System is the default. It follows the OS setting and updates live when that setting changes.
  - On phones the switch is a single button that cycles through the three modes.
  - The choice is stored under `theme-preference` and shared with the other tools on the same origin. The old `theme` key is removed, so everyone starts on System once.
- **Layout.**
  - The whole page now scrolls as one; the panels no longer scroll separately, and the footer is reachable.
  - On desktop (1024px and up) the preview is a sticky column beside the controls.
  - On phones the preview comes first. Every layout works from 320px up with no horizontal scrolling.
- **Preview.** The QR sits on a neutral checkerboard, so transparent and dark backgrounds read correctly. QR colours are still never themed.
- **Alerts.** Alerts are floating, dismissible toasts: at the bottom on phones, top-right on desktop.
- **Forms.** Form fields, selects, checkboxes, sliders, buttons and the logo dropzone use the shared components. All element IDs and share-link fields are unchanged.
- **Font.** Inter Variable is self-hosted through Fontsource.
- **Manifest.** The PWA manifest uses the new background and theme colours.

### Fixed
- A Google Fonts `@import` made a third-party request on every load for a font that was never used.
- The preview canvas overflowed the screen on phones narrower than about 356px.
- Sliders had no visible keyboard focus, and the gradient and logo colour inputs showed no focus ring.
- In light mode, the sidebar scrollbar, select chevron and placeholder icon were hard-coded light colours.
- Accent and status colours were compile-time Sass variables, so they could not adapt to the theme. They are now tokens checked for WCAG 2.2 AA contrast in both themes.
- Touch targets were too small: the colour swatches are now 40px and the remove-logo button is 44px on touch devices.
- The privacy badge hid its text with `font-size: 0`.
- There was no skip link.

## [1.5.0] - 2026-11-12

### Fixed
- Form listeners stacked up on every QR-type switch, causing repeated renders/saves per keystroke
- Share links failed to load when the base64 token contained `+` (now base64url, in the URL fragment; old links still work)
- Calendar QR codes produced invalid iCalendar times (missing seconds); text fields are now escaped and lines use CRLF
- vCard values with commas/semicolons/newlines broke the card
- Email subject/body and crypto labels showed `+` instead of spaces
- JPG export with a transparent background came out black
- WiFi codes for open networks no longer include a password field
- Service worker registered at the wrong path and cached forever; it now uses relative paths, network-first HTML and per-build cache names
- Downloads could be cancelled in Safari/Firefox because the blob URL was revoked immediately
- Out-of-order async renders could overwrite a newer preview
- PDF export would have broken under obfuscation (dynamic import specifier was string-arrayed)

### Changed
- ~80% smaller initial JS (495 kB → 102 kB): jsPDF is loaded on demand
- Removed the JavaScript obfuscator (smaller, faster bundle)
- Design changes are debounced and the logo canvas is memoised (smooth slider/colour dragging)
- Refactored `main.js` into the `components/`, `qr-engine/` and `utils/` modules; removed dead duplicates
- Theme follows the system preference and is applied before first paint
- System font stack (no Inter reference that was never loaded; note: a leftover Google Fonts import remained until 1.6.0)
- Custom export size is a single square size; logo margin scales with export size
- Downloads are named after their content (e.g. `qr-wifi-MyNetwork.png`)
- Canonical/OG/sitemap URLs point at the standalone site `/QR-Code-Gen/`

### Added
- Scannability warnings (low contrast, inverted colours, oversized logo)
- Copy image to clipboard
- Design persistence + "Reset design to defaults"
- Shareable-link warning when it contains a WiFi password
- PNG PWA icons (192, 512, maskable) and apple-touch-icon
- Keyboard arrow navigation and radio semantics for style pickers; focus-visible styles
- Vitest unit tests (`npm test`) and a CI workflow

---

## [1.4.0] - 2026-03-09

### Changed
- Moved export section in the left sidebar to appear immediately after the content section for improved workflow
- Removed highlight color for PNG exports
- Added download icon for WebP exports

### Added
- WiFi SVG icon for the WiFi QR type
- Demo link added to README

---

## [1.3.0] - 2026-03-09

### Changed
- Renamed project from **QR Studio** to **QR Code Gen** across all files, metadata, and HTML

### Added
- Updated Open Graph image (`og-image.png`) to reflect new project name

---

## [1.2.0] - 2026-03-09

### Fixed
- QR code background no longer changes to black when dark mode is enabled
- Dark mode CSS variables scoped to prevent unintended QR canvas color overrides

### Added
- `_footer.scss` — dedicated SCSS partial for footer styles
- Footer section with project links rendered in HTML

---

## [1.1.0] - 2026-03-04

### Added
- **SEO optimizations** for GitHub Pages deployment:
  - Open Graph and Twitter Card meta tags in `index.html`
  - JSON-LD structured data (WebApplication schema)
  - `robots.txt` for search crawler configuration
  - `sitemap.xml` for SEO indexing
  - `og-image.png` social preview image
- **PWA support** — service worker (`sw.js`) and `manifest.json` for offline installation
- **Responsive layout** — full mobile and tablet responsiveness across all panels
- **Custom DPI export** (`src/utils/dpi.js`) — configurable resolution output (72–600 DPI)
- Error Correction Level and QR Version controls in the Design tab
- Scrollbar always-visible in left sidebar for improved UX discoverability

---

## [1.0.0] - 2026-03-03

### Added
- Initial release of the QR Code Generator
- Support for 12 QR code types: URL, Text, Email, Phone, SMS, WhatsApp, WiFi, vCard, Location, Calendar, Cryptocurrency, Custom
- Real-time QR preview with 200ms debounced rendering
- Full style customization: dot shapes, eye patterns, colors, gradients
- Logo/image embedding via FileReader and Canvas API (PNG, SVG, JPG)
- Export in multiple formats: PNG, SVG, JPG, WebP, PDF (via jsPDF)
- Batch QR generation from CSV upload
- Design preset save/load system (localStorage)
- Error handling: input validation, over-capacity warnings, contrast checks
- SCSS-based styling with design token system and dark/light theme support
- Vite build toolchain with hot module replacement
- `.gitignore` configured to exclude `node_modules` and `dist`
- Product Requirements Specification document (`requirement.md`)
