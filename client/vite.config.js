import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  // port 3000
  server: {
    port: 3000,
  },
  // /api to http://localhost:5000/api
  proxy: {
    '/api': 'http://localhost:5000/api',
    '/static': 'http://localhost:5000/static',
  },
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
  ],
});
