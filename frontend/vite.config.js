import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'

// On Cloud Run the dev server is reachable only over HTTPS on a single port,
// so its HMR websocket can't connect and keeps forcing full page reloads.
// Nobody live-edits the deployed app, so HMR is simply turned off there.
const isHmrDisabled = process.env.VITE_DISABLE_HMR === 'true'

const localHmr = {
  host: 'localhost',
  protocol: 'ws',
  clientPort: 5173,
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // vueDevTools(),
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: true,
    hmr: isHmrDisabled ? false : localHmr,
    // Bind-mounted source on macOS Docker doesn't deliver native fs events
    // reliably; polling makes file watching (and thus HMR) work consistently.
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
