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
    rollupOptions: {
      output: {
        /*
         * Vendor splitting for cache stability. The app itself changes on every
         * data curation commit; these libraries almost never do. Splitting them
         * out means a reader's second visit (and every deploy that only touches
         * data) re-downloads only the small app chunk. The markdown stack is
         * wiki-only but needed during hydration of the prerendered pages, so it
         * ships as its own parallel chunk rather than being folded into the
         * entry; ECharts already loads behind the lazy GraphView chunk.
         */
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (/[\\/](react-markdown|remark-gfm|remark|unified|mdast|micromark|hast|unist|vfile|decode-named-character-reference|character-entities|bail|trough|zwitch)/.test(id)) return 'markdown'
          if (/[\\/](echarts|zrender)[\\/]/.test(id)) return 'echarts'
          if (/[\\/](@react|react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) return 'react'
          return undefined
        },
      },
    },
  },
})
