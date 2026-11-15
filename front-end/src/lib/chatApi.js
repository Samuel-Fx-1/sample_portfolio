// src/lib/chatApi.js
// Request contract for the AI chat: POST { messages } to /api/chat, read data.content.

const CHAT_ENDPOINT = '/api/chat';
const HISTORY_LIMIT = 10;
const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 1000;

export const CHAT_FALLBACK_TEXT =
  'I am having trouble reaching my AI brain right now. Please try again in a moment, or reach out directly at **samuelislegend8@gmail.com**.';

/** Converts visible chat messages plus the new user text into the API history shape. */
export function buildHistory(messages, userText) {
  const recent = messages
    .filter((message) => message.sender !== 'error')
    .slice(-HISTORY_LIMIT)
    .map((message) => ({
      role: message.sender === 'user' ? 'user' : 'assistant',
      content: message.text,
    }));
  return [...recent, { role: 'user', content: userText }];
}

async function postChat(history) {
  const response = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: history }),
  });
  if (!response.ok) {
    throw new Error(`Chat request failed with status ${response.status}`);
  }
  const data = await response.json();
  if (typeof data.content !== 'string') {
    throw new Error('Chat response did not include content');
  }
  return data.content;
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Resolves to the assistant reply. Retries once, then throws the last error. */
export async function requestReply(history) {
  let lastError = null;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    if (attempt > 0) await wait(RETRY_DELAY_MS);
    try {
      return await postChat(history);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}
