# Project Roadmap

This document outlines the planned features and long-term vision for QR Code Gen. As a 100% client-side application, all future features must respect the constraint of zero server dependency.

---

## ✅ Completed

Features shipped in the current release:

- **PWA Support** — Service Worker (`sw.js`) and Web App Manifest (`manifest.json`) for offline installation and asset caching
- **Responsive Layout** — Full mobile and tablet responsiveness across sidebar and preview panels
- **Custom DPI Export** — Configurable resolution output (72–600 DPI) via `dpi.js`
- **SEO Optimization** — Open Graph tags, JSON-LD structured data, `sitemap.xml`, `robots.txt`, and `og-image.png` for GitHub Pages
- **Dark Mode** — Light/dark theme with CSS variable system; QR canvas background preserved correctly in dark mode
- **UI Redesign (v1.6.0)** — Clean product UI on the shared design system, a System / Light / Dark switch that follows the OS by default, mobile-first layout, WCAG 2.2 AA contrast in both themes
- **Error Correction & QR Version Controls** — User-selectable error correction (L/M/Q/H) and manual QR version (1–40)
- **Shareable Links** — Content + design encoded (base64url) in the URL fragment
- **Persistence & Reset** — Content and design remembered in localStorage, one-click reset
- **Scannability Warnings** — Contrast, inverted-colour and logo-size checks
- **Copy Image to Clipboard**

---

## 🚀 Short-Term Goals

Features planned for the immediate future:

- **Preset System** — Save, load, and manage named design presets via localStorage
- **Batch QR Generation** — CSV upload, multi-code generation and ZIP download
- **QR Code Scanner** — Utilize the WebRTC camera API and browser-based scanning libraries (e.g., ZXing-js) to scan codes directly in-app
- **Preset Import/Export** — Export saved presets as JSON and import them, enabling cross-device sharing of custom designs
- **High-Contrast Accessibility Mode** — A dedicated high-contrast theme beyond the WCAG 2.2 AA baseline (`forced-colors` is already respected)
- **Mobile Mini-Preview** — Keep a compact QR preview visible while scrolling the controls on phones

---

## 🌟 Medium-Term Goals

Features planned for upcoming major updates:

- **Animated QR Codes** — Frame-based SVG animations (e.g., gradient pulsing, logo rotation) while maintaining scannability
- **Print Layout Generator** — Auto-arrange multiple QR codes onto an A4 grid and output as a print-ready PDF using jsPDF
- **Custom QR Shape Masks** — Apply masks to the QR module layer to create non-square QR codes (e.g., circular, hexagonal dot placement)

---

## 🔭 Long-Term Vision

Exploratory ideas requiring advanced client-side processing:

- **AI-Assisted QR Styling** — A purely client-side system (leveraging WebGL or local ONNX models) to generate stylistic QR backgrounds without compromising scan reliability
- **Figma-Style Canvas Editor** — A drag-and-drop builder for layering text, borders, and QR codes into a single downloadable asset
- **Advanced Payload Types** — Deep linking profiles, custom app schemas, and extended mobile payload formats

---

## ❌ Out of Scope

To remain true to the privacy-first, serverless architecture, the following will **never** be added:

- Dynamic QR Codes (which require redirect servers)
- Scan analytics / tracking dashboards
- Cloud storage for user assets
- Paid subscription walls reliant on server authentication
