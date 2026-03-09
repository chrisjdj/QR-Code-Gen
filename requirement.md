# 📄 Product Requirements Specification (PRS)

## Project: QR Code Gen

## Type: 100% Client-Side Web Application

## Deployment: Static Hosting (GitHub Pages, Netlify, Vercel, etc.)

---

# 1. Overview

## 1.1 Purpose

Develop a **privacy-first QR Code Generator** that:

- Runs entirely in the browser
- Requires no backend/server
- Does not transmit user data anywhere
- Supports advanced customization
- Allows embedded logos/images
- Exports high-quality QR codes in multiple formats

## 1.2 Goals

- Zero server infrastructure
- Offline-capable (PWA-ready)
- No user tracking or analytics
- Fast generation (<100ms)
- High-quality export (SVG + PNG + PDF + DPI-configurable raster)
- Fully customizable design
- SEO-optimized for static hosting

---

# 2. Technical Architecture

## 2.1 High-Level Architecture

```
User Input
   ↓
QR Generation Engine (JavaScript)
   ↓
Canvas/SVG Renderer
   ↓
Preview + Export (PNG / SVG / JPG / WebP / PDF)
```

## 2.2 Technology Stack

### Frontend

- HTML5
- SCSS (compiled via Vite + Sass)
- Vanilla JS (ES Modules)
- Canvas API
- SVG generation

### Build Tool

- [Vite](https://vitejs.dev/) v5

### QR Engine

- [`qr-code-styling`](https://github.com/kozakdenys/qr-code-styling) v1.6 (bundled locally)

### Export

- [`jsPDF`](https://github.com/parallax/jsPDF) v2.5 (bundled locally, client-side PDF generation)

> All libraries must work offline, have no network dependencies, and be bundled locally (no CDN required).

---

# 3. Core Functional Requirements

## 3.1 QR Code Types Supported

The application supports generating QR codes for 12 data types:

| # | Type             | Payload Format                          |
|---|------------------|------------------------------------------|
| 1 | URL              | `https://example.com`                   |
| 2 | Plain Text       | Raw string                              |
| 3 | Email            | `mailto:user@example.com?subject=...`   |
| 4 | Phone            | `tel:+1234567890`                       |
| 5 | SMS              | `sms:+1234567890?body=Hello`            |
| 6 | WhatsApp         | `https://wa.me/1234567890`              |
| 7 | WiFi             | `WIFI:S:SSID;T:WPA;P:password;;`        |
| 8 | vCard (Contact)  | `BEGIN:VCARD...END:VCARD`               |
| 9 | Location         | `geo:lat,lng`                           |
| 10| Calendar Event   | `.ics` content inline                   |
| 11| Cryptocurrency   | `bitcoin:address?amount=0.001`          |
| 12| Custom / Raw     | Any arbitrary string payload            |

All QR codes encode **data only** — no dynamic redirect tracking.

---

## 3.2 QR Customization Options

### 3.2.1 Basic Settings

- QR Version: Auto or Manual (1–40)
- Error Correction Level: L (7%), M (15%), Q (25%), H (30%)

### 3.2.2 Module (Pixel) Style

- Square, Rounded, Dot, Extra Rounded, Classy, Diamond

### 3.2.3 Eye (Finder Pattern) Style

- Square, Rounded, Circular, Custom shapes

### 3.2.4 Color Customization

- Foreground color
- Background color (with transparent option)
- Gradient fill: Linear, Radial, with configurable angle
- Eye color (independent from module color)

---

## 3.3 Logo / Image Embedding

### 3.3.1 Upload Formats

- PNG, SVG, JPG via file picker or paste

### 3.3.2 Processing (Client-Side Only)

- FileReader API for file parsing
- Canvas API for resize, crop, and embed
- SVG embedding support

### 3.3.3 Logo Controls

- Centered placement (default)
- Adjustable size (as a percentage of QR size)
- Rounded logo background
- Logo padding and background color
- Drop shadow toggle

### 3.3.4 Safety Constraints

- Automatically suggest increasing error correction to Q or H when a logo is in use
- Display scannability warning if logo area is too large

---

## 3.4 Export & Download

### Formats

| Format | Method                        |
|--------|-------------------------------|
| PNG    | `canvas.toDataURL('image/png')` |
| JPG    | `canvas.toDataURL('image/jpeg')` |
| WebP   | `canvas.toDataURL('image/webp')` |
| SVG    | Native SVG blob               |
| PDF    | jsPDF (client-side rendering) |

### DPI / Resolution

- Configurable DPI: 72, 96, 150, 300, 600
- High-resolution canvas scaling handled by `src/utils/dpi.js`
- Preset export sizes: 512×512, 1024×1024, 2048×2048

---

## 3.5 Batch QR Generation

- Upload CSV file (parsed client-side via JS)
- Generate one QR code per row
- Package all outputs as a ZIP download (JSZip)
- No server required

---

# 4. UI/UX Requirements

## 4.1 Layout

### Left Panel (Control Sidebar)
- QR type selector
- Dynamic input form (rendered per type)
- Design / customization controls
- Always-visible scrollbar for discoverability

### Right Panel (Preview)
- Live QR code preview
- Download buttons (PNG, SVG, JPG, WebP, PDF)
- DPI selector
- Batch generation section

### Footer
- Project links
- Attribution (MIT license)

## 4.2 Real-Time Rendering

- Debounced input (200ms delay)
- Instant visual updates on all changes
- No page reload required

## 4.3 Theme Support

- Light mode (default)
- Dark mode toggle
- QR code canvas background preserved correctly in dark mode (does not invert)

## 4.4 Responsive Design

- Fully responsive across mobile, tablet, and desktop
- Single-column layout on small screens
- Two-panel layout on desktop (≥768px)

## 4.5 Accessibility

- WCAG 2.1 compliant target
- Keyboard accessible controls
- ARIA labels on interactive elements
- High-contrast mode consideration

---

# 5. PWA & Offline Capability

| Requirement        | Implementation                 |
|--------------------|--------------------------------|
| Service Worker     | `public/sw.js` — caches static assets |
| Web App Manifest   | `public/manifest.json`         |
| Installable as PWA | Yes — meets installability criteria |
| Offline operation  | Full functionality after first load |
| Icons              | `public/icons/` (192×192, 512×512) |

---

# 6. SEO Requirements

| Element              | Implementation                              |
|----------------------|----------------------------------------------|
| Title & meta desc    | `<title>` and `<meta name="description">` in `index.html` |
| Open Graph tags      | `og:title`, `og:image`, `og:type`, etc.     |
| Twitter Card         | `twitter:card`, `twitter:image`, etc.       |
| Structured data      | JSON-LD — WebApplication schema             |
| Sitemap              | `public/sitemap.xml`                        |
| Robots               | `public/robots.txt`                         |
| Social image         | `public/og-image.png`                       |

---

# 7. Privacy & Security Requirements

- No API calls after initial page load
- No cookies required
- No analytics or tracking
- No data transmitted to any external service
- `localStorage` used only for optional design presets
- SVG content sanitized to prevent XSS injection

---

# 8. Performance Requirements

| Metric               | Target        |
|----------------------|---------------|
| Initial bundle size  | < 1MB         |
| QR generation time   | < 100ms       |
| Logo rendering time  | < 200ms       |
| Time to interactive  | < 2s          |
| Memory               | No leaks      |

---

# 9. Non-Functional Requirements

| Category      | Requirement                      |
|---------------|----------------------------------|
| Hosting       | Static files only                |
| Compatibility | Chrome, Firefox, Safari, Edge    |
| Mobile        | Fully responsive                 |
| Security      | No XSS via SVG injection         |
| Licensing     | MIT-compatible libraries only    |
| Build Tool    | Vite (ES module bundler)         |

---

# 10. Features NOT Supported (Server Required)

The following features are **out of scope** for this client-side application:

- Dynamic QR codes with redirect tracking
- Scan analytics dashboard
- Expiring or time-limited QR codes
- Password-protected QR codes
- Cloud storage of assets or presets
- User accounts or authentication

---

# 11. Development Phases

## Phase 1 – MVP ✅
- Basic QR generation (URL, Text)
- PNG export
- Color customization

## Phase 2 – Advanced Styling ✅
- Logo embedding
- Eye styles and dot shapes
- Gradients
- SVG, JPG, WebP, PDF export
- All 12 QR types

## Phase 3 – Power Features ✅
- Batch generation from CSV
- Design preset system
- PWA (service worker + manifest)
- Dark mode
- Error correction and QR version controls
- DPI-configurable export
- SEO + Open Graph + structured data
- Responsive layout
- Footer

## Phase 4 – (Planned)
- QR code scanner (WebRTC + ZXing-js)
- Preset JSON import/export
- Print layout generator
- Animated SVG export

---

# 12. Acceptance Criteria

- ✅ Works fully offline after first load (via service worker)
- ✅ No network requests made after initial page load
- ✅ Logo can be embedded safely with QR remaining scannable
- ✅ Exports production-quality SVG and PNG
- ✅ Mobile responsive across all breakpoints
- ✅ QR canvas background unaffected by dark mode
- ✅ < 2s load time on a standard connection
