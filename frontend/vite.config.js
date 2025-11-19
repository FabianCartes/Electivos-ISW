import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Use Vite default dev port to avoid colliding with backend
    port: 5173,
    proxy: {
      '/api': {
        // backend runs on port 3000 by default (see backend/.env)
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
