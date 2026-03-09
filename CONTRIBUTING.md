# Contributing Guide

Thank you for your interest in contributing to QR Code Gen! This is a fully client-side project — contributions of any kind are welcome.

---

## 🧰 Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm v9+
- Basic knowledge of Vanilla JavaScript, HTML, and SCSS

---

## 🚀 Local Development Setup

```bash
# 1. Clone the repository
git clone https://github.com/chrisjdj/qr-code-gen.git
cd qr-code-gen

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The app runs at `http://localhost:5173`.

---

## 📁 Where to Make Changes

| Area                  | Location                              |
|-----------------------|---------------------------------------|
| QR type input forms   | `src/components/input-forms.js`       |
| Style customizer UI   | `src/components/customizer.js`        |
| Error/validation logic| `src/components/error-handler.js`     |
| QR rendering          | `src/qr-engine/generator.js`          |
| Payload formatting    | `src/qr-engine/payload-builder.js`    |
| Logo handling         | `src/qr-engine/logo-handler.js`       |
| Export (download)     | `src/utils/download.js`               |
| DPI / resolution      | `src/utils/dpi.js`                    |
| Colors & gradients    | `src/utils/color-utils.js`            |
| Global styles         | `src/styles/`                         |
| App entry point       | `src/main.js`                         |
| HTML shell            | `index.html`                          |
| PWA manifest          | `public/manifest.json`                |
| Service worker        | `public/sw.js`                        |

---

## 🎨 Styling Rules

> **IMPORTANT:** All styles must be written in **SCSS** (`.scss` files only).  
> Do **not** write or modify any `.css` files directly.

- Design tokens (colors, spacing, typography) live in `src/styles/_variables.scss`
- Component styles have their own partial files (e.g., `_forms.scss`, `_buttons.scss`, `_footer.scss`)
- Import new partials via `src/styles/main.scss`

---

## 🔁 Contribution Workflow

1. **Fork** the repository
2. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** — code + SCSS only, no CSS edits
4. **Test manually** in your browser using `npm run dev`
5. **Commit** with a clear, conventional message:
   ```
   feat: add QR animation export
   fix: resolve logo sizing on hi-res screens
   docs: update README with new QR types
   ```
6. **Open a Pull Request** against the `main` branch

---

## ✅ Commit Message Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix      | When to use                               |
|-------------|-------------------------------------------|
| `feat:`     | New feature                               |
| `fix:`      | Bug fix                                   |
| `docs:`     | Documentation changes only                |
| `style:`    | SCSS / formatting changes (no logic)      |
| `refactor:` | Code restructuring without behavior change|
| `chore:`    | Build config, deps, tooling, gitignore    |

---

## 🚫 Out of Scope

The following are **intentionally not supported** (they require a backend):

- Dynamic QR codes / redirect tracking
- Scan analytics
- Expiring or password-protected QR codes
- Cloud storage of codes or presets

Please don't open PRs adding these features.

---

## 🐛 Reporting Bugs

Open a GitHub Issue with:
- Browser name & version
- Steps to reproduce
- Expected vs. actual behavior
- Screenshot or screen recording (if applicable)

---

## 💡 Suggesting Features

Open a GitHub Issue with the label **enhancement** and describe:
- The use case
- How it fits into the client-side-only constraint
- Any library or API you'd suggest using

---

Thank you for keeping this project serverless, private, and fast! 🚀
