import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    devSourcemap: true
  },
  plugins: [
    react()
  ]
})
