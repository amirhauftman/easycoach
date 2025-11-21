import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/cloudfront': {
        target: 'https://dn3dopmbo1yw3.cloudfront.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cloudfront/, ''),
      },
    },
  },
})
