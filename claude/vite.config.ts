import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer'),
      '@components': path.resolve(__dirname, './src/renderer/components'),
      '@styles': path.resolve(__dirname, './src/renderer/styles'),
      '@hooks': path.resolve(__dirname, './src/renderer/hooks'),
      '@types': path.resolve(__dirname, './src/renderer/types'),
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})
