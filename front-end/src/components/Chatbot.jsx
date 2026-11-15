// src/components/Chatbot.jsx
import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { developer } from '../data/developerData.js';
import { buildHistory, CHAT_FALLBACK_TEXT, requestReply } from '../lib/chatApi.js';

const OPEN_CHAT_EVENT = 'open-chat';
const INPUT_MAX_LENGTH = 500;
const SUGGESTIONS = ['What do you build?', 'Show me your projects', 'How can I contact you?'];
const WELCOME_TEXT = `Hi! I am SI AI, the assistant for ${developer.name} (${developer.handle}). Ask me about projects, web development, experience, or how to get in touch.`;
const BOLD_SEGMENT = /(\*\*[^*]+\*\*)/;
const BOLD_MARKER_LENGTH = 2;
const MIN_BOLD_LENGTH = BOLD_MARKER_LENGTH * 2 + 1;

const MESSAGE_CLASS_BY_SENDER = {
  user: 'msg msg--user',
  ai: 'msg msg--bot',
  error: 'msg msg--bot msg--error',
};

const createMessage = (sender, text) => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  sender,
  text,
});

/** Renders **bold** segments as <strong> nodes. Never injects raw HTML. */
function renderInline(text) {
  return text.split(BOLD_SEGMENT).map((part, index) => {
    const isBold = part.length >= MIN_BOLD_LENGTH && part.startsWith('**') && part.endsWith('**');
    if (!isBold) return part;
    return <strong key={index}>{part.slice(BOLD_MARKER_LENGTH, -BOLD_MARKER_LENGTH)}</strong>;
  });
}

function ChatMessage({ message }) {
  return <div className={MESSAGE_CLASS_BY_SENDER[message.sender]}>{renderInline(message.text)}</div>;
}

function useOpenChatEvent(onOpen) {
  useEffect(() => {
    window.addEventListener(OPEN_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpen);
  }, [onOpen]);
}

function useEscapeToClose(isOpen, onClose) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => [createMessage('ai', WELCOME_TEXT)]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const logRef = useRef(null);
  const inputRef = useRef(null);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);

  useOpenChatEvent(openChat);
  useEscapeToClose(isOpen, closeChat);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [messages, isLoading]);

  const sendText = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    const history = buildHistory(messages, trimmed);
    setMessages((current) => [...current, createMessage('user', trimmed)]);
    setInput('');
    setIsLoading(true);
    try {
      const reply = await requestReply(history);
      setMessages((current) => [...current, createMessage('ai', reply)]);
    } catch {
      setMessages((current) => [...current, createMessage('error', CHAT_FALLBACK_TEXT)]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendText(input);
  };

  const showSuggestions = messages.length === 1 && !isLoading;

  return (
    <>
      <button
        type="button"
        className={`chatbot-fab${isOpen ? ' is-hidden' : ''}`}
        onClick={openChat}
        aria-label="Open chat with SI AI"
        aria-expanded={isOpen}
        aria-controls="chatbot-panel"
      >
        <Icon name="sparkles" size={20} />
        <span className="chatbot-fab-label">Ask SI AI</span>
      </button>

      <section
        id="chatbot-panel"
        className={`chatbot-panel${isOpen ? ' is-open' : ''}`}
        aria-label="SI AI chat"
        inert={!isOpen}
      >
        <header className="chatbot-header">
          <span className="icon-badge" aria-hidden="true">
            <Icon name="sparkles" size={20} />
          </span>
          <div className="chatbot-title">
            <h2>SI AI</h2>
            <p>Ask about projects, skills, or contact</p>
          </div>
          <button type="button" className="icon-btn" onClick={closeChat} aria-label="Close chat">
            <Icon name="close" size={18} />
          </button>
        </header>

        <div className="chatbot-messages" ref={logRef} role="log" aria-live="polite">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="typing" role="status" aria-label="SI AI is typing">
              <span />
              <span />
              <span />
            </div>
          )}
        </div>

        {showSuggestions && (
          <div className="chatbot-suggestions">
            {SUGGESTIONS.map((prompt) => (
              <button key={prompt} type="button" className="chip" onClick={() => sendText(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
        )}

        <form className="chatbot-form" onSubmit={handleSubmit}>
          <label className="visually-hidden" htmlFor="chatbot-input">Message SI AI</label>
          <input
            id="chatbot-input"
            ref={inputRef}
            className="input"
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type your question"
            autoComplete="off"
            maxLength={INPUT_MAX_LENGTH}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="btn chatbot-send"
            disabled={isLoading || !input.trim()}
            aria-label="Send message"
          >
            <Icon name="send" size={18} />
          </button>
        </form>
      </section>
    </>
  );
}
