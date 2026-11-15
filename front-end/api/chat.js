// frontend/api/chat.js - Vercel serverless handler for the AI chat.
//
// All provider logic lives in ./_ai-core.js so the same engine powers the
// Vercel function, the local dev server, and the standalone back-end/server.js.

import { generateReply, fallbackMessage } from './_ai-core.js';

// Allow the function to run long enough for provider failover on Vercel.
export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body || {};

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const { content, provider, cached } = await generateReply(messages);

    res.json({
      success: true,
      content,
      provider,
      cached: Boolean(cached),
      usedDeepSeek: provider === 'deepseek',
    });
  } catch (error) {
    console.error('❌ AI Error:', error);
    // Graceful, non-technical response for the user.
    res.json({
      success: true,
      content: fallbackMessage(),
      provider: 'fallback',
      usedDeepSeek: false,
    });
  }
}
