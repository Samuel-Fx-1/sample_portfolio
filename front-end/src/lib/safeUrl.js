// src/lib/safeUrl.js
const SAFE_PROTOCOLS = ['https:', 'http:'];

/**
 * Returns the URL only when it uses a web protocol, so injected javascript: links are dropped.
 * @param {string | undefined} url
 * @returns {string | undefined}
 */
export function safeExternalUrl(url) {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return SAFE_PROTOCOLS.includes(parsed.protocol) ? parsed.href : undefined;
  } catch {
    return undefined;
  }
}
