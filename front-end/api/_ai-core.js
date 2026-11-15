// frontend/api/_ai-core.js
//
// Shared AI engine used by:
//   - front-end/api/chat.js        (Vercel serverless function + local Vite plugin)
//   - back-end/server.js           (standalone Express backend)
//
// It answers with the best available provider, in this order:
//   1. DeepSeek        - only when DEEPSEEK_API_KEY is set (highest quality)
//   2. Vireonix        - free, keyless
//   3. Pollinations    - free, keyless
//   4. LLM7            - free, keyless
//   5. OVHcloud AI     - free, keyless
//   6. Pollinations-fast - free, keyless
//   7. Offline knowledge base - common questions, works with no network
//
// Successful answers are cached (memory + best-effort disk) so repeat questions
// keep working even when every provider is rate-limited or offline.

import fs from 'node:fs';
import path from 'node:path';

export const SYSTEM_PROMPT = `You are SI AI, a helpful, knowledgeable assistant for Samuel Fx, the portfolio of IZABAYO Samuel (si-ai), a full-stack developer from Rwanda.

About IZABAYO Samuel (SI AI):
- Full-Stack Developer specializing in React, Node.js, Express, MongoDB, MySQL
- Projects: Samuel_Fx AI, Islamic Knowledge Hub, Intruder App, Web Blocker, E-commerce Website, Samuel Fx
- Skills: React, Node.js, JavaScript, HTML5, CSS3, Express, MongoDB, MySQL, Git, Docker
- Location: Rwanda (based in Kigali)
- Availability: Open for freelance, collaboration, and full-time opportunities
- Contact: samuelislegend8@gmail.com, GitHub: github.com/Samuel_Fx_1

Your role:
- Be friendly, professional, and conversational
- Answer questions truthfully and directly, including current affairs, politics, history, and science
- Provide accurate, factual information; if unsure, say so rather than inventing facts
- Keep responses concise but informative
- Use emojis occasionally to be engaging`;

// Free, keyless, OpenAI chat-completions compatible providers.
const KEYLESS_PROVIDERS = [
  {
    name: 'vireonix',
    url: 'https://vireonix.ai/v1/chat/completions',
    model: 'auto',
  },
  {
    name: 'pollinations',
    url: 'https://text.pollinations.ai/openai',
    model: 'openai',
  },
  {
    name: 'llm7',
    url: 'https://api.llm7.io/v1/chat/completions',
    model: 'turbo',
  },
  {
    name: 'ovh',
    url: 'https://oai.endpoints.kepler.ai.cloud.ovh.net/v1/chat/completions',
    model: 'Meta-Llama-3_3-70B-Instruct',
  },
  {
    name: 'pollinations-fast',
    url: 'https://text.pollinations.ai/openai',
    model: 'openai-fast',
  },
];

const REQUEST_TIMEOUT_MS = 15000;
const PROVIDER_ATTEMPTS = 2;
const TOTAL_BUDGET_MS = 28000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function providerBody(provider, messages) {
  return {
    model: provider.model,
    messages,
    temperature: 0.8,
    max_tokens: 800,
    stream: false,
  };
}

async function postJSON(url, payload, headers = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const raw = await response.text();
    let data = null;
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }

    if (!response.ok) {
      const detail =
        (data && (data.error?.message || data.error || data.message)) ||
        raw.slice(0, 200) ||
        `HTTP ${response.status}`;
      throw new Error(`${new URL(url).host} -> ${response.status}: ${detail}`);
    }

    return data;
  } finally {
    clearTimeout(timer);
  }
}

function extractContent(data) {
  if (!data) return '';
  if (typeof data === 'string') return data.trim();
  const content =
    data.choices?.[0]?.message?.content ??
    data.choices?.[0]?.text ??
    data.content ??
    '';
  return typeof content === 'string' ? content.trim() : '';
}

// ---------------------------------------------------------------------------
// Cache (memory + best-effort disk)
// ---------------------------------------------------------------------------

const memoryCache = new Map();
const CACHE_FILE = path.join(process.cwd(), '.ai-cache.json');
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // one week

let diskCacheLoaded = false;
function loadDiskCache() {
  if (diskCacheLoaded) return;
  diskCacheLoaded = true;
  try {
    const parsed = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    for (const [key, value] of Object.entries(parsed || {})) {
      if (value && typeof value.content === 'string') memoryCache.set(key, value);
    }
  } catch {
    /* no cache yet - fine */
  }
}

function cacheKey(text) {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function readCache(text) {
  loadDiskCache();
  const entry = memoryCache.get(cacheKey(text));
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) return null;
  return entry;
}

function writeCache(text, content, provider) {
  const entry = { content, provider, ts: Date.now() };
  memoryCache.set(cacheKey(text), entry);
  // Best-effort persistence; ignore read-only filesystems (e.g. Vercel).
  try {
    const obj = Object.fromEntries(memoryCache);
    fs.writeFile(CACHE_FILE, JSON.stringify(obj), () => {});
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Offline knowledge base - answers common questions with no network at all
// ---------------------------------------------------------------------------

const CAPITALS = {
  rwanda: 'Kigali',
  uganda: 'Kampala',
  kenya: 'Nairobi',
  tanzania: 'Dodoma',
  burundi: 'Gitega',
  'south africa': 'Pretoria',
  nigeria: 'Abuja',
  ghana: 'Accra',
  ethiopia: 'Addis Ababa',
  france: 'Paris',
  germany: 'Berlin',
  italy: 'Rome',
  spain: 'Madrid',
  portugal: 'Lisbon',
  'united kingdom': 'London',
  uk: 'London',
  'united states': 'Washington, D.C.',
  usa: 'Washington, D.C.',
  canada: 'Ottawa',
  japan: 'Tokyo',
  china: 'Beijing',
  india: 'New Delhi',
  brazil: 'Brasília',
  australia: 'Canberra',
  russia: 'Moscow',
  egypt: 'Cairo',
  'saudi arabia': 'Riyadh',
  uae: 'Abu Dhabi',
  qatar: 'Doha',
  turkey: 'Ankara',
};

function tryMath(q) {
  const m = q.match(/^[\s\S]*?([-+0-9.()*/x×\s]{3,})[\s\S]*$/i);
  if (!m) return null;
  let expr = m[1].replace(/x|×/gi, '*').trim();
  if (!/^[-+*/().\d\s]+$/.test(expr)) return null;
  if (!/\d/.test(expr) || !/[-+*/]/.test(expr)) return null;
  try {
    const value = Function(`"use strict"; return (${expr});`)();
    if (typeof value === 'number' && Number.isFinite(value)) {
      return `🧮 The answer is **${value}**.`;
    }
  } catch {
    /* not a math expression */
  }
  return null;
}

export function offlineAnswer(question) {
  const q = (question || '').toLowerCase().trim();

  const capitalMatch = q.match(/capital(?:\s+\w+)*?\s+of\s+([a-z\s]+)/);
  if (capitalMatch) {
    const country = capitalMatch[1].trim();
    const capital = CAPITALS[country];
    if (capital) return `🌍 The capital of ${country.replace(/\b\w/g, (c) => c.toUpperCase())} is **${capital}**.`;
  }

  if (q.includes('president of rwanda') || q.includes('rwanda president') || q.includes('rwandan president')) {
    return '🇷🇼 The President of Rwanda is **Paul Kagame**. He has led the country since 2000.';
  }

  const mathAnswer = tryMath(q);
  if (mathAnswer) return mathAnswer;

  if (q.includes('who is') && (q.includes('samuel') || q.includes('izabayo') || q.includes('si ai'))) {
    return "👨‍💻 **IZABAYO Samuel (SI AI)** is a Full-Stack Developer specializing in React, Node.js, and modern web technologies. Based in Rwanda, he builds real-world web applications and backend systems. He's available for freelance opportunities!";
  }

  if (q.includes('project') || q.includes('built')) {
    return '💼 IZABAYO Samuel has built: SI AI, Forex Trading Platform, webApp, System Web Blocker, E-commerce Website, and SamuelPort portfolio!';
  }

  if (/^(hi|hey|hello|yo|hiya|good (morning|afternoon|evening))\b/.test(q)) {
    return "👋 Hello! I'm **SI AI**. Ask me about politics, history, science, or IZABAYO Samuel's work!";
  }

  return null;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Generate a reply for a conversation.
 * @param {Array<{role:string, content:string}>} messages
 * @returns {Promise<{content:string, provider:string, cached?:boolean}>}
 */
export async function generateReply(messages) {
  const last = messages[messages.length - 1]?.content || '';

  const cached = readCache(last);
  if (cached) {
    return { content: cached.content, provider: `${cached.provider}-cache`, cached: true };
  }

  const conversation = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.slice(-10),
  ];

  const deadline = Date.now() + TOTAL_BUDGET_MS;
  let lastError = null;

  // 1. DeepSeek (only when configured)
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
  if (DEEPSEEK_API_KEY) {
    try {
      const data = await postJSON(
        'https://api.deepseek.com/v1/chat/completions',
        { model: 'deepseek-chat', messages: conversation, temperature: 0.8, max_tokens: 800, stream: false },
        { Authorization: `Bearer ${DEEPSEEK_API_KEY}` }
      );
      const content = extractContent(data)?.replace(/^SI AI:\s*/i, '');
      if (content) {
        writeCache(last, content, 'deepseek');
        return { content, provider: 'deepseek' };
      }
    } catch (error) {
      lastError = error;
      console.error('❌ DeepSeek failed, using keyless providers:', error.message);
    }
  }

  // 2-6. Keyless providers, retried once each, within the overall time budget.
  for (const provider of KEYLESS_PROVIDERS) {
    for (let attempt = 1; attempt <= PROVIDER_ATTEMPTS; attempt++) {
      if (Date.now() > deadline) break;
      try {
        const data = await postJSON(provider.url, providerBody(provider, conversation));
        const content = extractContent(data)?.replace(/^SI AI:\s*/i, '');
        if (content) {
          writeCache(last, content, provider.name);
          return { content, provider: provider.name };
        }
        lastError = new Error(`${provider.name}: empty response`);
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ ${provider.name} attempt ${attempt} failed: ${error.message}`);
        if (attempt < PROVIDER_ATTEMPTS) await sleep(400);
      }
    }
  }

  // 7. Offline knowledge base
  const offline = offlineAnswer(last);
  if (offline) {
    return { content: offline, provider: 'offline' };
  }

  if (lastError) console.error('❌ All AI providers failed:', lastError.message);
  throw lastError || new Error('All AI providers failed');
}

export function fallbackMessage() {
  return `🤖 I'm having trouble reaching my AI backend right now. Please try again in a moment.

Try asking me:
• "Who is IZABAYO Samuel?"
• "What is the capital of Rwanda?"
• "Tell me a joke"`;
}
