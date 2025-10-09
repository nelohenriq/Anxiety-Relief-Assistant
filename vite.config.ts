import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '^/api/ollama': {
            target: env.OLLAMA_API_URL || 'http://127.0.0.1:11434',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/ollama/, '/api'),
            configure: (proxy, _options) => {
              proxy.on('error', (err, _req, _res) => {
                console.log('Ollama proxy error:', err);
              });
              proxy.on('proxyReq', (proxyReq, req, _res) => {
                console.log('Ollama request proxied:', req.method, req.url, '->', proxyReq.getHeader('host'));
                // Add CORS headers for Ollama
                proxyReq.setHeader('Origin', 'http://localhost:3000');
              });
              proxy.on('proxyRes', (proxyRes, req, _res) => {
                console.log('Ollama response:', proxyRes.statusCode, req.url);
                // Add CORS headers to response
                proxyRes.headers['Access-Control-Allow-Origin'] = '*';
                proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
                proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
              });
            },
          }
        }
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.OLLAMA_API_URL': JSON.stringify(env.OLLAMA_API_URL || 'http://127.0.0.1:11434')
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      assetsInclude: ['**/*.json']
    };
});
