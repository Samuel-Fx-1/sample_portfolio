// back-end/server.js
//
// Standalone Express backend for the portfolio.
// Serves the API routes that the React app calls (e.g. /api/chat,
// /api/send-message) using the shared engine in front-end/api/_ai-core.js.
//
// Run it with:  npm run server        (from the project root)
// or:           node back-end/server.js
//
// Then either:
//   - let the front-end proxy to it:  VITE_API_TARGET=http://localhost:3001 npm run dev   (in front-end/)
//   - or hit it directly:             http://localhost:3001/api/chat

const path = require('node:path');
const fs = require('node:fs');
const { pathToFileURL } = require('node:url');
const express = require('express');

const ROOT = path.join(__dirname, '..');

// --- Minimal .env loader (no dotenv dependency needed at the repo root) -----
function loadEnvFile(file) {
  try {
    const text = fs.readFileSync(file, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    /* file may not exist - fine */
  }
}

for (const rel of ['.env', '.env.local', 'front-end/.env', 'front-end/.env.local']) {
  loadEnvFile(path.join(ROOT, rel));
}

// --- Route -> handler module mapping ---------------------------------------
const ROUTES = {
  '/api/chat': path.join(ROOT, 'front-end', 'api', 'chat.js'),
  '/api/send-message': path.join(ROOT, 'front-end', 'api', 'send-message.js'),
};

const modules = new Map(); // file -> handler function

async function loadHandler(file) {
  if (!fs.existsSync(file)) return null;
  if (!modules.has(file)) {
    const mod = await import(pathToFileURL(file).href);
    modules.set(file, mod.default || mod.handler || null);
  }
  return modules.get(file);
}

function decorate(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (payload) => {
    if (!res.headersSent) res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(payload));
    return res;
  };
  res.send = (payload) => {
    if (payload !== undefined && !res.headersSent) res.setHeader('Content-Type', 'text/plain');
    res.end(payload === undefined ? '' : String(payload));
    return res;
  };
  return res;
}

const app = express();
app.set('trust proxy', true);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'samport-backend',
    providers: ['deepseek?', 'vireonix', 'pollinations', 'llm7', 'ovh', 'offline-kb', 'cache'],
    time: new Date().toISOString(),
  });
});

for (const [route, file] of Object.entries(ROUTES)) {
  app.all(route, async (req, res) => {
    decorate(res);
    try {
      const handler = await loadHandler(file);
      if (!handler) return res.status(404).json({ error: `No handler for ${route}` });
      await handler(req, res);
    } catch (error) {
      console.error(`[backend] ${route} failed:`, error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error', detail: error.message });
      } else {
        res.end();
      }
    }
  });
}

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`\n🐺 Samport backend running on http://localhost:${PORT}`);
  console.log(`   Routes: ${Object.keys(ROUTES).join(', ')}, /api/health`);
  console.log(`   DeepSeek key: ${process.env.DEEPSEEK_API_KEY ? 'set ✅' : 'not set (using free keyless providers)'}\n`);
});

function shutdown(signal) {
  console.log(`\n${signal} received, shutting down...`);
  server.close(() => process.exit(0));
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
