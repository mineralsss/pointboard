import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Handle both public API and authenticated API
      '/api': {
        target: 'http://localhost:3000', // Your backend server URL
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
