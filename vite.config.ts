import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { viteRequire } from 'vite-require'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const isServe = command === 'serve'
  const isBuild = command === 'build'
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG

  return {
    logLevel: 'info',
    css: {
      devSourcemap: true
    },
    plugins: [
      react(),
      electron([
        {
          // Main-Process entry file of the Electron App.
          entry: 'src/main/main.ts',
          vite: {
            plugins: [
              // TODO this is only required for the test downloads json files, remove it after we are getting real downloads from EDSC
              viteRequire()
            ],
            build: {
              rollupOptions: {
                external: [
                  'sqlite3',
                  'knex'
                ]
              },
              sourcemap,
              minify: isBuild
            }
          }
        },
        {
          entry: 'src/main/preload.ts',
          vite: {
            build: {
              minify: isBuild
            }
          },
          onstart(options) {
            // Notify the Renderer-Process to reload the page when the Preload-Scripts build is complete,
            // instead of restarting the entire Electron App.
            options.reload()
          }
        }
      ]),
      renderer()
    ]
  }
})
