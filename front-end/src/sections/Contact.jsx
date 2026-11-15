// src/sections/Contact.jsx
import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import { developer, socials } from '../data/developerData.js';
import { CONTACT_LIMITS, validateContact } from '../lib/contactValidation.js';

const SEND_ENDPOINT = '/api/send-message';
const EMPTY_FORM = { name: '', email: '', message: '', website: '' };
const SUCCESS_MESSAGE = 'Thanks! Your message has been sent.';
const GENERIC_ERROR = 'Something went wrong. Please try again, or email me directly.';
const IDLE_STATUS = { state: 'idle', message: '' };

/** POSTs the payload. Resolves to an error message, or null on success. */
async function submitContact(payload) {
  const response = await fetch(SEND_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response.ok ? null : GENERIC_ERROR;
}

function ContactItem({ icon, label, children }) {
  return (
    <div className="contact-item">
      <span className="icon-badge" aria-hidden="true"><Icon name={icon} size={20} /></span>
      <div>
        <p className="contact-item-label">{label}</p>
        {children}
      </div>
    </div>
  );
}

function ContactDetails() {
  const github = socials.find((social) => social.id === 'github');
  return (
    <div className="contact-info">
      <p className="contact-lead">
        I am open to new projects, freelance work, and full-time roles. Tell me what you are building and I will reply within a day or two.
      </p>
      <ContactItem icon="mail" label="Email">
        <a href={`mailto:${developer.email}`}>{developer.email}</a>
      </ContactItem>
      <ContactItem icon="mapPin" label="Location">
        <p>{developer.location}</p>
      </ContactItem>
      {github && (
        <ContactItem icon="github" label="GitHub">
          <a href={github.url} target="_blank" rel="noopener noreferrer">{github.handle}</a>
        </ContactItem>
      )}
    </div>
  );
}

/** Label, optional count and error text wired to one input. */
function Field({ id, label, optional, count, error, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>
        <span>
          {label} {optional && <span className="field-optional">(optional)</span>}
        </span>
        {count && <span className="field-count">{count}</span>}
      </label>
      {children}
      {error && <p id={`${id}-error`} className="field-error">{error}</p>}
    </div>
  );
}

function StatusMessage({ status }) {
  if (status.state === 'idle' || status.state === 'sending') return null;
  return (
    <p className={`form-status is-${status.state}`} role="status">
      <Icon name={status.state === 'success' ? 'check' : 'alert'} size={18} />
      {status.message}
    </p>
  );
}

export default function Contact() {
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(IDLE_STATUS);

  const updateField = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const sendForm = async () => {
    setStatus({ state: 'sending', message: '' });
    try {
      const failure = await submitContact({
        name: values.name.trim(),
        email: values.email.trim(),
        message: values.message.trim(),
      });
      if (failure) {
        setStatus({ state: 'error', message: failure });
        return;
      }
      setValues(EMPTY_FORM);
      setStatus({ state: 'success', message: SUCCESS_MESSAGE });
    } catch {
      setStatus({ state: 'error', message: GENERIC_ERROR });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Honeypot filled: pretend success so bots get no signal.
    if (values.website) {
      setStatus({ state: 'success', message: SUCCESS_MESSAGE });
      return;
    }
    const nextErrors = validateContact(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      sendForm();
    }
  };

  const isSending = status.state === 'sending';
  const ariaFor = (field) => ({
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `contact-${field}-error` : undefined,
  });

  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <div className="container">
        <SectionHeader index="05" title="Let's build something" id="contact-title" />

        <div className="contact-grid">
          <Reveal>
            <ContactDetails />
          </Reveal>

          <Reveal delay={120} className="card">
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="contact-form-row">
                <Field id="contact-name" label="Name" error={errors.name}>
                  <input
                    id="contact-name"
                    name="name"
                    className="input"
                    type="text"
                    autoComplete="name"
                    maxLength={CONTACT_LIMITS.nameMax}
                    value={values.name}
                    onChange={updateField}
                    required
                    {...ariaFor('name')}
                  />
                </Field>
                <Field id="contact-email" label="Email" optional error={errors.email}>
                  <input
                    id="contact-email"
                    name="email"
                    className="input"
                    type="email"
                    autoComplete="email"
                    maxLength={CONTACT_LIMITS.emailMax}
                    value={values.email}
                    onChange={updateField}
                    {...ariaFor('email')}
                  />
                </Field>
              </div>

              <Field
                id="contact-message"
                label="Message"
                count={`${values.message.length}/${CONTACT_LIMITS.messageMax}`}
                error={errors.message}
              >
                <textarea
                  id="contact-message"
                  name="message"
                  className="input"
                  rows={6}
                  maxLength={CONTACT_LIMITS.messageMax}
                  value={values.message}
                  onChange={updateField}
                  required
                  {...ariaFor('message')}
                />
              </Field>

              {/* Honeypot: hidden from people, often filled in by bots. */}
              <div className="honeypot" aria-hidden="true">
                <label htmlFor="contact-website">Leave this field empty</label>
                <input
                  id="contact-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={values.website}
                  onChange={updateField}
                />
              </div>

              <StatusMessage status={status} />

              <button type="submit" className="btn btn-primary" disabled={isSending}>
                {isSending ? 'Sending...' : 'Send message'}
                <Icon name="arrowRight" size={18} className="icon-slide" />
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
