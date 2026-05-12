import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/usuarios': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
      '/api/admin/menu': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/categorias': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/menu': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/pedidos': {
        target: 'http://localhost:8083',
        changeOrigin: true,
      },
      '/api/reservas': {
        target: 'http://localhost:8084',
        changeOrigin: true,
      },
      '/api/contacto': {
        target: 'http://localhost:8085',
        changeOrigin: true,
      },
    },
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
  },
})
