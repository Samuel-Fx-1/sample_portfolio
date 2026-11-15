// src/lib/contactValidation.js
// Mirrors the server-side limits in api/send-message.js.
export const CONTACT_LIMITS = Object.freeze({
  nameMax: 50,
  emailMax: 100,
  messageMax: 500,
});

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Returns a map of field name to error message. Empty object means valid.
 * @param {{ name: string, email: string, message: string }} values
 * @returns {Record<string, string>}
 */
export function validateContact(values) {
  const errors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const message = values.message.trim();

  if (!name) {
    errors.name = 'Please enter your name.';
  } else if (name.length > CONTACT_LIMITS.nameMax) {
    errors.name = `Name must be ${CONTACT_LIMITS.nameMax} characters or fewer.`;
  }

  if (email && email.length > CONTACT_LIMITS.emailMax) {
    errors.email = `Email must be ${CONTACT_LIMITS.emailMax} characters or fewer.`;
  } else if (email && !EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!message) {
    errors.message = 'Please write a message.';
  } else if (message.length > CONTACT_LIMITS.messageMax) {
    errors.message = `Message must be ${CONTACT_LIMITS.messageMax} characters or fewer.`;
  }

  return errors;
}
