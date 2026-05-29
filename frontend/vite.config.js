import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'

// On Cloud Run the dev server is served over HTTPS on a single port, so Vite's
// HMR websocket can never stay connected and the client keeps forcing full page
// reloads. Vite keeps that websocket alive even with `hmr: false`, so the only
// reliable way to stop it on the deployed dev server is to not load the HMR
// client script at all. Nobody live-edits the deployed app, so that is safe.
const isHmrDisabled = process.env.VITE_DISABLE_HMR === 'true'

const removeHmrClientPlugin = {
  name: 'remove-hmr-client',
  apply: 'serve',
  enforce: 'post',
  transformIndexHtml(html) {
    return html.replace(/\s*<script\b[^>]*src="\/@vite\/client"[^>]*><\/script>/g, '')
  },
}

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
    ...(isHmrDisabled ? [removeHmrClientPlugin] : []),
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
