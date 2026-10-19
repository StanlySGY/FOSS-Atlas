#!/usr/bin/env node
/**
 * GitHub Pages serves 404.html for any unknown path. Copying the built
 * index.html there lets client-side routes (/wiki/:id, /graph) deep-link
 * correctly instead of 404ing.
 */
import { copyFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const index = resolve(root, 'dist/index.html')
const fallback = resolve(root, 'dist/404.html')

if (!existsSync(index)) {
  console.error('dist/index.html not found — run `vite build` first.')
  process.exit(1)
}
copyFileSync(index, fallback)
console.log('SPA fallback written: dist/404.html')
