import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  optimizeDeps: {
    include: ['sweetalert2']
  },
  server: {
    force: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          recharts: ['recharts'],
          ui: ['framer-motion', 'lucide-react', 'react-icons'],
          alerts: ['sweetalert2']
        }
      }
    }
  }
})
