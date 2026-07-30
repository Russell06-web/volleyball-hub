import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this project from https://russell06-web.github.io/volleyball-hub/
// so every asset URL must be prefixed with /volleyball-hub/ in production.
export default defineConfig({
  plugins: [react()],
  base: '/volleyball-hub/',
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
  },
})
