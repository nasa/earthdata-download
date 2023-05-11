import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'
// eslint-disable-next-line import/no-extraneous-dependencies
import { VitePluginFonts } from 'vite-plugin-fonts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePluginFonts({
      google: {
        families: ['Inter']
      }
    })
  ],
  css: {
    devSourcemap: true
  }
})
