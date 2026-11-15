// vite-api-plugin.js
//
// Runs the Vercel serverless functions found in ./api (chat.js, send-message.js)
// inside the Vite dev server. This means `npm run dev` serves both the React app
// AND the /api routes locally, so there is no need for a separate backend server
// on port 3001 (which was the cause of the ECONNREFUSED proxy errors).
//
// In production, Vercel keeps running these same handlers on its own.

import { config as loadEnv } from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';

// Load .env / .env.local so server-only vars (DEEPSEEK_API_KEY, FORMSPREE_ENDPOINT)
// are available on process.env inside the handlers.
loadEnv({ path: path.resolve(process.cwd(), '.env') });
loadEnv({ path: path.resolve(process.cwd(), '.env.local'), override: true });

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      // Guard against huge payloads.
      if (raw.length > 1_000_000) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) return resolve(undefined);
      const type = req.headers['content-type'] || '';
      if (type.includes('application/json')) {
        try {
          return resolve(JSON.parse(raw));
        } catch {
          return resolve(raw);
        }
      }
      resolve(raw);
    });
    req.on('error', reject);
  });
}

// Add the handful of Express-style helpers the handlers rely on.
function decorateResponse(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    if (!res.headersSent) {
      res.setHeader('Content-Type', 'application/json');
    }
    res.end(JSON.stringify(payload));
    return res;
  };
  res.send = (payload) => {
    if (payload !== undefined && !res.headersSent) {
      res.setHeader('Content-Type', 'text/plain');
    }
    res.end(payload === undefined ? '' : String(payload));
    return res;
  };
  return res;
}

export default function apiPlugin() {
  return {
    name: 'local-vercel-api',

    configureServer(server) {
      server.middlewares.use('/api', async (req, res) => {
        decorateResponse(res);

        const urlPath = (req.url || '/').split('?')[0];

        // Only allow simple /api/<name> routes -> api/<name>.js (no traversal).
        const name = urlPath.replace(/^\/+/, '').replace(/\/+$/, '');
        if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
          return res.status(404).json({ error: 'Not found' });
        }

        const handlerFile = path.resolve(process.cwd(), 'api', `${name}.js`);
        if (!fs.existsSync(handlerFile)) {
          return res.status(404).json({ error: `No API handler for /api/${name}` });
        }

        try {
          if (req.method !== 'GET' && req.method !== 'HEAD' && req.body === undefined) {
            req.body = await readRequestBody(req);
          }

          // Load through Vite so edits to the handler hot-reload.
          const mod = await server.ssrLoadModule(`/api/${name}.js`);
          const handler = mod.default || mod.handler;
          if (typeof handler !== 'function') {
            return res.status(500).json({ error: `api/${name}.js has no default export` });
          }

          await handler(req, res);
        } catch (err) {
          server.config.logger.error(`[local-api] /api/${name} failed: ${err.stack || err}`);
          if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error', detail: err.message });
          } else {
            res.end();
          }
        }
      });
    },
  };
}
