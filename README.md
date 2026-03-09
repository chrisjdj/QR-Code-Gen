# QR Code Gen  ![Deploy](https://github.com/chrisjdj/QR-Code-Gen/actions/workflows/deploy.yml/badge.svg)

A **100% client-side**, privacy-first QR Code Generator built with **Vanilla JS**, **SCSS**, and **Vite**. No backend. No tracking. No data leaves your browser.

**Live Demo:** [https://chrisjdj.github.io/QR-Code-Gen/](https://chrisjdj.github.io/QR-Code-Gen/)

---

https://github.com/user-attachments/assets/a26d9442-5e54-48c6-90f8-db8e69c7df37

---


## ✨ Features

- **12 QR types** — URL, Text, Email, Phone, SMS, WhatsApp, WiFi, vCard, Location, Calendar, Crypto, and raw payloads
- **Full style customization** — dot shapes, eye patterns, foreground/background colors, gradients
- **Logo embedding** — upload PNG/SVG/JPG logos processed entirely via FileReader + Canvas API
- **Multiple export formats** — PNG, SVG, JPG, WebP, PDF (via jsPDF)
- **Custom DPI export** — high-resolution output with configurable DPI (72–600)
- **Real-time preview** — debounced rendering at 200ms for instant visual feedback
- **Batch QR generation** — upload CSV, generate multiple codes, download as ZIP
- **Preset system** — save/load design presets via localStorage
- **Dark Mode** — built-in support for light and dark themes
- **PWA-ready** — service worker + manifest for offline installation and caching
- **SEO-optimized** — Open Graph tags, sitemap, robots.txt, structured data
- **Zero telemetry** — no API calls, cookies, or analytics

---

## 🛠️ Tech Stack

| Layer       | Technology                  |
|-------------|------------------------------|
| Bundler     | [Vite](https://vitejs.dev/) v5 |
| Styles      | SCSS (Sass)                 |
| QR Engine   | [qr-code-styling](https://github.com/kozakdenys/qr-code-styling) v1.6 |
| PDF Export  | [jsPDF](https://github.com/parallax/jsPDF) v2.5 |
| Core        | Vanilla HTML5 / JavaScript  |

---

## 📁 Project Structure

```
qr-code-gen/
├── public/
│   ├── favicon.svg           # App favicon
│   ├── og-image.png          # Open Graph social preview image
│   ├── manifest.json         # PWA web app manifest
│   ├── sw.js                 # Service worker for offline support
│   ├── robots.txt            # Search engine crawl directives
│   ├── sitemap.xml           # XML sitemap for SEO
│   └── icons/                # PWA icon set (192x192, 512x512)
├── src/
│   ├── components/
│   │   ├── customizer.js     # Handles style & color customization UI
│   │   ├── error-handler.js  # Validation alerts and error display
│   │   └── input-forms.js    # QR type-specific input form rendering
│   ├── qr-engine/
│   │   ├── generator.js      # Core QR generation and rendering
│   │   ├── logo-handler.js   # Logo upload, positioning, sizing
│   │   └── payload-builder.js# Builds type-specific QR payloads
│   ├── utils/
│   │   ├── color-utils.js    # Gradient and color helper functions
│   │   ├── debounce.js       # Debounce utility for input throttling
│   │   ├── download.js       # Export helpers (PNG, SVG, PDF, etc.)
│   │   └── dpi.js            # High-resolution/DPI export logic
│   ├── styles/
│   │   ├── _variables.scss   # Design tokens (colors, spacing, fonts)
│   │   ├── _reset.scss       # CSS reset / base styles
│   │   ├── _layout.scss      # Two-panel layout
│   │   ├── _sidebar.scss     # Left panel / control sidebar styles
│   │   ├── _forms.scss       # Input form styles
│   │   ├── _buttons.scss     # Button component styles
│   │   ├── _preview.scss     # Right panel / QR preview styles
│   │   ├── _footer.scss      # Footer styles
│   │   └── main.scss         # SCSS entry point (imports all partials)
│   └── main.js               # Application entry point
├── index.html                # Single-page HTML shell
├── vite.config.js            # Vite build configuration
├── package.json
├── ARCHITECTURE.md           # Technical architecture and data flow
├── CHANGELOG.md              # Version history
├── CONTRIBUTING.md           # Contribution guidelines
├── README.md                 # Project overview
├── requirement.md            # Product Requirements Specification
├── ROADMAP.md                # Planned future features
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm v9+

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173` by default.

### Build for Production

```bash
npm run build
```

Output is placed in the `dist/` folder — ready to deploy to any static host (GitHub Pages, Netlify, Vercel, etc.).

### Preview Production Build

```bash
npm run preview
```

---

## 🎨 QR Types Supported

| Type          | Format Example                             |
|---------------|---------------------------------------------|
| URL           | `https://example.com`                      |
| Text          | `Hello World`                              |
| Email         | `mailto:user@example.com`                  |
| Phone         | `tel:+1234567890`                          |
| SMS           | `sms:+1234567890?body=Hello`               |
| WhatsApp      | `https://wa.me/1234567890`                 |
| WiFi          | `WIFI:S:MyNetwork;T:WPA;P:password;;`      |
| vCard         | `BEGIN:VCARD...END:VCARD`                  |
| Location      | `geo:37.7749,-122.4194`                    |
| Calendar      | `.ics` formatted inline event              |
| Cryptocurrency| `bitcoin:address?amount=0.001`             |
| Raw           | Any custom payload string                  |

---

## 📦 Export Formats

| Format | Method                  |
|--------|--------------------------|
| PNG    | `canvas.toDataURL()`    |
| SVG    | Native SVG blob         |
| JPG    | `canvas.toDataURL()`    |
| WebP   | `canvas.toDataURL()`    |
| PDF    | jsPDF (client-side)     |

> All exports support configurable DPI (72–600) via the built-in DPI selector.

---

## 🔒 Privacy

- **No network requests** are ever made after initial page load
- **No data is sent** to any server
- **No cookies or tracking** of any kind
- Fully functional **offline** once cached via service worker

---

## 📚 Documentation

- [`README.md`](./README.md) — Project overview and quick start
- [`requirement.md`](./requirement.md) — Full Product Requirements Specification
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — Client-side Architecture and Data Flow
- [`ROADMAP.md`](./ROADMAP.md) — Planned features and future enhancements
- [`CHANGELOG.md`](./CHANGELOG.md) — Version history
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — Guidelines for contributing

---

## 📄 License

This project is licensed under the **Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License**.

You are free to use, modify, and share this project for **non-commercial purposes** with appropriate credit. Commercial use is not permitted. See the [LICENSE](./LICENSE) file for details.
