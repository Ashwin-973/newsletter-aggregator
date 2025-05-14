import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"
//why tf should I modify vite config for build process
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss()
  ],
  resolve:{
    alias:{
      "@":"/src"
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true, // Recommended to clean dist before builds
    rollupOptions: {
      input: {
        popup: 'index.html', // Entry for your popup
        background: 'src/background.js' // Entry for your service worker
      },
      output: {
        format: 'es', // Crucial: ES module format for service worker
        entryFileNames: (chunkInfo) => {
          // Output background.js with a predictable name
          if (chunkInfo.name === 'background') {
            return 'background.js';
          }
          // Default naming for other entry points like popup
          // Vite usually handles assets for HTML entries well by default,
          // but explicit naming can be added if needed.
          // For JS files linked from HTML (like main.jsx for popup):
          if (chunkInfo.name === 'popup' || chunkInfo.facadeModuleId?.includes('main.jsx')) {
             return 'assets/[name]-[hash].js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
})
