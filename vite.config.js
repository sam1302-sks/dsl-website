import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cesium from 'vite-plugin-cesium'

export default defineConfig({
  plugins: [react(), cesium()],
  server: {
    port: 3000,
    host: true
  },
  optimizeDeps: {
    exclude: ['cesium'],
    include: ['urijs']
  },
  define: {
    CESIUM_BASE_URL: JSON.stringify('/cesium/')
  },
  resolve: {
    alias: {
      // Fix multiple module import issues
      'mersenne-twister': 'mersenne-twister/src/mersenne-twister.js',
      'urijs': 'urijs/src/URI.js'
    }
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        globals: {}
      }
    }
  }
})
