import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // build: {
  //   commonjsOptions: {
  //     include: ['./src/app/constants/downloadStates']
  //   }
  // },
  // optimizeDeps: {
  //   entries: ['./src/app/constants/downloadStates']
  // },
  css: {
    devSourcemap: true
  },
  plugins: [
    react()
  ]
})
