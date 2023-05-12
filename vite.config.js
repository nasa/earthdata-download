import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'
// eslint-disable-next-line import/no-unresolved
import Unfonts from 'unplugin-fonts/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    Unfonts({
      display: 'swap',
      google: {
        families: [{
          name: 'Inter',
          styles: 'wght@300;400;500;600;700'
        }]
      }
    })
  ],
  css: {
    devSourcemap: true
  }
})
