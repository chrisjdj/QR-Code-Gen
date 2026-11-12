# QR Code Gen  ![CI](https://github.com/chrisjdj/QR-Code-Gen/actions/workflows/ci.yml/badge.svg)

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
- **Real-time preview** — debounced rendering (200ms while typing, ~60ms for design tweaks)
- **Scannability warnings** — flags low contrast, inverted colours and oversized logos
- **Copy to clipboard** — copy the QR image straight into docs, chats or design tools
- **Shareable links** — design + content encoded in the URL fragment (never sent to a server)
- **Remembers your work** — content and design persist in localStorage, with one-click reset
- **Dark Mode** — follows your system theme, with a manual light/dark toggle
- **PWA-ready** — service worker + manifest for offline installation and caching
- **SEO-optimized** — Open Graph tags, sitemap, robots.txt, structured data
- **Zero telemetry** — no API calls, cookies, or analytics

---

## 🛠️ Tech Stack

| Layer       | Technology                  |
|-------------|------------------------------|
| Bundler     | [Vite](https://vitejs.dev/) v5 |
| Styles      | SCSS (Sass)                 |
| QR Engine   | [qr-code-styling](https://github.com/kozakdenys/qr-code-styling) v1.9 |
| PDF Export  | [jsPDF](https://github.com/parallax/jsPDF) v2.5 (lazy-loaded) |
| Tests       | [Vitest](https://vitest.dev/) |
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
│   │   ├── input-forms.js    # Field definitions per QR type + dynamic form renderer
│   │   ├── customizer.js     # Design controls: read, serialise, restore, wire events
│   │   └── error-handler.js  # Toast alerts (aria-live)
│   ├── qr-engine/
│   │   ├── payload-builder.js # Pure: form values → QR payload strings
│   │   ├── qr-options.js     # Pure: design state → qr-code-styling options
│   │   ├── scannability.js   # Pure: contrast / logo-size warnings
│   │   ├── generator.js      # Preview rendering, exports, copy-to-clipboard
│   │   └── logo-handler.js   # Logo reading + memoised canvas compositing
│   ├── utils/
│   │   ├── color-utils.js    # WCAG luminance / contrast helpers
│   │   ├── download.js       # Blob download, filenames, image helpers
│   │   ├── dpi.js            # PNG pHYs / JPEG JFIF DPI injection
│   │   └── share.js          # base64url share-link encode/decode
│   ├── styles/               # SCSS partials (see ARCHITECTURE.md)
│   └── main.js               # Entry point: state + wiring
├── tests/                    # Vitest unit tests for the pure modules
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

### Run Tests

```bash
npm test
```

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
| PNG    | Canvas blob + pHYs DPI chunk |
| SVG    | Native SVG blob (vector) |
| JPG    | Canvas re-encode + JFIF DPI (transparent → white) |
| WebP   | Canvas re-encode (keeps transparency) |
| PDF    | jsPDF, loaded on demand |

> PNG and JPG embed the selected DPI (72–600). SVG is resolution-independent; WebP has no standard DPI field.

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
