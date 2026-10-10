import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    watch: {
      // Wait for saves to finish so HMR does not cache a temporarily empty stylesheet.
      awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 50 },
    },
    proxy: {
      '/api': 'http://127.0.0.1:8787',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Keep Vite's shared lazy-loading helper out of the optional editor bundle.
          if (id.includes('vite/preload-helper')) {
            return 'vendor'
          }

          if (!id.includes('node_modules')) {
            return
          }

          if (id.includes('monaco-editor')) {
            return 'code-editor'
          }

          if (id.includes('react-router')) {
            return 'router'
          }

          if (id.includes('motion')) {
            return 'motion'
          }

          if (id.includes('lucide-react')) {
            return 'icons'
          }

          return 'vendor'
        },
      },
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
