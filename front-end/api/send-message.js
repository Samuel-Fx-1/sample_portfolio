// api/send-message.js - Vercel serverless handler for the contact form.
import { validateContact } from '../src/lib/contactValidation.js';

const SUBJECT_PREFIX = 'New message from';
const SUCCESS_BODY = { success: true, message: 'Message sent successfully' };

function readFields(body) {
  const pick = (value) => (typeof value === 'string' ? value : '');
  return {
    name: pick(body.name),
    email: pick(body.email),
    message: pick(body.message),
  };
}

function buildPayload(fields) {
  const name = fields.name.trim();
  const email = fields.email.trim();
  return {
    name,
    message: fields.message.trim(),
    _subject: `${SUBJECT_PREFIX} ${name} on Samuel Fx`,
    ...(email ? { email, _replyto: email } : {}),
  };
}

async function forwardToFormspree(endpoint, payload) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Formspree responded with status ${response.status}`);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const fields = readFields(body);

  // Honeypot filled: report success without doing anything.
  if (typeof body.website === 'string' && body.website.length > 0) {
    return res.status(200).json(SUCCESS_BODY);
  }

  const errors = validateContact(fields);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ error: 'Invalid input', fields: errors });
  }

  const endpoint = process.env.FORMSPREE_ENDPOINT;
  if (!endpoint) {
    // Fail loudly so the message is never silently dropped.
    console.error('FORMSPREE_ENDPOINT is not set; contact message was not delivered.');
    return res.status(503).json({ error: 'Message service is not configured' });
  }

  try {
    await forwardToFormspree(endpoint, buildPayload(fields));
    return res.status(200).json(SUCCESS_BODY);
  } catch (error) {
    console.error('Contact form delivery failed:', error);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}
