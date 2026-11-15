// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import apiPlugin from './vite-api-plugin.js';

// By default the dev server runs the ./api serverless handlers in-process, so
// `npm run dev` works on its own (no separate backend on :3001 needed).
//
// To route /api to the standalone backend instead, start it with:
//   npm run server              (from the project root)
// then run the dev server with:
//   VITE_API_TARGET=http://localhost:3001 npm run dev
const apiTarget = process.env.VITE_API_TARGET;

export default defineConfig({
  plugins: [react(), ...(apiTarget ? [] : [apiPlugin()])],
  server: {
    port: 5173,
    proxy: apiTarget
      ? {
          '/api': {
            target: apiTarget,
            changeOrigin: true,
          },
        }
      : undefined,
  },
});
