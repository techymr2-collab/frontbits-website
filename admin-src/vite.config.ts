import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

// This app builds into ../admin (a sibling of this directory, at the root
// of the Frontbits New Website static site) and is served at /admin on the
// live site. base must match that path so built asset URLs resolve
// correctly; outDir points there so Netlify's single publish directory
// picks it up automatically alongside the static HTML.
// https://vite.dev/config/
export default defineConfig({
  base: '/admin/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: '../admin',
    emptyOutDir: true,
  },
})
