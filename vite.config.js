import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// GitHub Pages project site lives at /<repo>/. Override with VITE_BASE for
// user/org pages or custom domains.
const base = process.env.VITE_BASE ?? '/FOSS-Atlas/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1200,
  },
})
