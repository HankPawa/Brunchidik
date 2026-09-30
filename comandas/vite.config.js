import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const API = 'http://localhost:8080'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5174,
    // Escucha en toda la red: el personal entra desde su celular por el WiFi.
    host: true,
    proxy: {
      '/api': { target: API, changeOrigin: true },
      '/ws': { target: API, ws: true, changeOrigin: true },
    },
  },
})
