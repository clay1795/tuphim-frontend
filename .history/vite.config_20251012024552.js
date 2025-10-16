import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  
  return {
    plugins: [react()],
    
    // Build optimization
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: !isDev ? false : true,
      minify: isDev ? false : 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['@heroicons/react', 'react-modal', 'react-multi-carousel']
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },

    // Development server
    server: isDev ? {
      host: true, // Allow external connections
      allowedHosts: [
        'localhost',
        '.ngrok.io',
        '.ngrok-free.dev',
        'amani-reserved-cateringly.ngrok-free.dev'
      ],
      proxy: {
        '/api': {
          target: 'https://phimapi.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Sending Request to the Target:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
            });
          },
        }
      }
    } : undefined,

    // Environment variables
    define: {
      __DEV__: isDev
    }
  }
})
