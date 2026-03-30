import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Different from main app (3000)
    proxy: {
      '/api': 'http://localhost:3000' // Proxy to the main Next.js backend
    }
  }
})
