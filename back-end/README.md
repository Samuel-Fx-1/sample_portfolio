# Backend

Standalone Express backend for the portfolio. It serves the API routes the
React app calls and reuses the same AI engine as the Vercel function
(`front-end/api/_ai-core.js`).

## Run

```bash
# from the project root
npm run server        # or: node back-end/server.js
```

The server listens on `http://localhost:3001` (override with `PORT`).

## Routes

| Route | Purpose |
|-------|---------|
| `POST /api/chat` | AI chat (see provider chain below) |
| `POST /api/send-message` | Contact form |
| `GET  /api/health` | Health check |

## AI providers

`_ai-core.js` tries these in order and returns the first that works:

1. **DeepSeek** — only if `DEEPSEEK_API_KEY` is set (best quality)
2. **Vireonix** — free, no key
3. **Pollinations** — free, no key
4. **LLM7** — free, no key
5. **OVHcloud AI** — free, no key
6. **Pollinations-fast** — free, no key
7. **Offline knowledge base** — capitals, simple math, greetings, about Samuel

Successful answers are cached in memory and (best-effort) to `.ai-cache.json`,
so repeated questions keep working even when every provider is rate-limited.

> The keyless providers are public community services — great for a portfolio,
> but rate-limited. For production reliability, set `DEEPSEEK_API_KEY`
> (or add any OpenAI-compatible key) in `front-end/.env`.

## Using it from the front-end

The Vite dev server runs the same handlers in-process by default, so a separate
backend is optional. To route `/api` to this backend instead:

```bash
# terminal 1
npm run server

# terminal 2
cd front-end
VITE_API_TARGET=http://localhost:3001 npm run dev
```
