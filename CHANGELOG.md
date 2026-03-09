# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
