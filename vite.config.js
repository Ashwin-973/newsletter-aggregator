import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"
import path from 'path'
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
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        reader: path.resolve(__dirname, 'src/reader-entry.jsx'), // CHANGED: JS entry point
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'reader' ? 'reader.js' : '[name].js'
        }
      }
    }
  }
})
