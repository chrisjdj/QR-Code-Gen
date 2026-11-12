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

- Read [DESIGN.md](./DESIGN.md) first. Tokens live in `src/styles/_tokens.scss` and the indigo accent in `_accent.scss`.
- Use semantic tokens (`var(--surface)`, `var(--text-muted)`, `var(--accent)`…). Never hard-code colours.
- Reuse the shared components (`.btn`, `.card`, `.field`, `.select`, `.badge`, `.alert`…) from `_components.scss`. `_tokens`, `_theme`, `_base`, `_components` and `_shell` are shared with the other tools, so copy any change to those repos too.
- QR-specific styles go in `_app.scss`. Import new partials via `src/styles/main.scss`.
- Write mobile-first (`@include t.up(md)`), put hover styles inside `@include t.hover`, and check 320px, 768px and 1280px in both light and dark themes.
- Keep the element IDs, `data-*` attributes and state classes that the JS uses. `DESIGN_FIELDS` IDs are part of share links.

---

## 🔁 Contribution Workflow

1. **Fork** the repository
2. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** — code + SCSS only, no CSS edits
4. **Run the unit tests** with `npm test` and **test manually** in your browser using `npm run dev`
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
- Screenshot or screen recording (if applicable), and whether you were using the light or dark theme

---

## 💡 Suggesting Features

Open a GitHub Issue with the label **enhancement** and describe:
- The use case
- How it fits into the client-side-only constraint
- Any library or API you'd suggest using

---

Thank you for keeping this project serverless, private, and fast! 🚀
