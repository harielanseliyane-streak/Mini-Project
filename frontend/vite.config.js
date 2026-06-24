import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Local dev proxy – NOT used in Vercel production (VITE_API_URL handles that)
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    // Ensure assets are correctly referenced from the root
    assetsDir: 'assets',
    sourcemap: false,
  },
})
