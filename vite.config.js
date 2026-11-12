import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

/** Stamp public/sw.js with a unique build id so each deploy busts the SW cache */
function swBuildId() {
  let outDir = 'dist'
  return {
    name: 'sw-build-id',
    apply: 'build',
    configResolved(config) { outDir = config.build.outDir },
    closeBundle() {
      const file = resolve(outDir, 'sw.js')
      if (!existsSync(file)) return
      const id = Date.now().toString(36)
      writeFileSync(file, readFileSync(file, 'utf8').replaceAll('__BUILD_ID__', id))
    },
  }
}

export default defineConfig({
  base: '/web-tools/QR-Code-Gen/',
  root: '.',
  publicDir: 'public',
  plugins: [
    swBuildId(),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'esbuild',
    cssMinify: 'esbuild',
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
})
