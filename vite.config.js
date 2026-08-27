import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Ignore large or locked files (e.g., PDFs) from Vite's file watcher to avoid EBUSY crashes
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7025',
        secure: false
      }
    },
    watch: {
      // ignore all pdf files in the project
      ignored: ['**/*.pdf', '**/.vs/**']
    }
  }
})
