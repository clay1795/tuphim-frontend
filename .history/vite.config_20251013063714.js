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
      host: '0.0.0.0', // Allow external connections
      port: 5173,
      proxy: {
        '/api': {
          target: process.env.VITE_API_BASE_URL || 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('proxy error', err);
              // Fallback to localhost if Dev Tunnel fails
              if (err.code === 'ECONNREFUSED' && options.target !== 'http://localhost:3001') {
                console.log('Dev Tunnel failed, falling back to localhost:3001');
                proxy.options.target = 'http://localhost:3001';
              }
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
