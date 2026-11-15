// src/sections/Hero.jsx
import Icon from '../components/Icon.jsx';
import Reveal from '../components/Reveal.jsx';
import { developer, socials, stats } from '../data/developerData.js';

const OPEN_CHAT_EVENT = 'open-chat';

function openChat() {
  window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT));
}

function ProfileCard() {
  return (
    <Reveal delay={150} className="card profile-card">
      <div className="profile-head">
        <span className="avatar" aria-hidden="true">{developer.initials}</span>
        <div>
          <h2>{developer.name}</h2>
          <p className="profile-role">{developer.role}</p>
        </div>
      </div>
      <ul className="profile-meta">
        <li><Icon name="mapPin" size={16} />{developer.location}</li>
        <li><Icon name="briefcase" size={16} />{developer.available ? 'Available for new projects' : 'Currently booked'}</li>
        <li><Icon name="mail" size={16} />{developer.email}</li>
      </ul>
      <div className="social-row">
        {socials.map((social) => (
          <a
            key={social.id}
            className="icon-btn"
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${social.label} profile`}
            title={social.label}
          >
            <Icon name={social.id} size={18} />
          </a>
        ))}
      </div>
    </Reveal>
  );
}

function CodeWindow() {
  return (
    <Reveal delay={300} className="card code-window" aria-hidden="true">
      <div className="code-window-bar">
        <span /><span /><span />
        <p>developer.js</p>
      </div>
      <pre>
        <code>
          <span className="tok-key">const</span> <span className="tok-prop">stack</span> = {'{'}{'\n'}
          {'  '}<span className="tok-prop">frontend</span>: <span className="tok-str">'React · Vite'</span>,{'\n'}
          {'  '}<span className="tok-prop">backend</span>: <span className="tok-str">'Node · Express'</span>,{'\n'}
          {'  '}<span className="tok-prop">focus</span>: <span className="tok-str">'production'</span>,{'\n'}
          {'  '}<span className="tok-prop">shipping</span>: <span className="tok-bool">true</span>,{'\n'}
          {'}'};
        </code>
      </pre>
    </Reveal>
  );
}

export default function Hero() {
  return (
    <section id="home" className="hero section" aria-labelledby="hero-title">
      <div className="container hero-grid">
        <div className="hero-copy">
          <Reveal className="hero-status">
            <span className={`status-dot${developer.available ? '' : ' is-busy'}`} aria-hidden="true" />
            {developer.available ? 'Open to freelance & full-time work' : 'Currently booked'}
          </Reveal>

          <Reveal as="h1" delay={80} className="hero-title" id="hero-title">
            <span className="line">Full-stack developer</span>
            <span className="line">building for <span className="text-accent">production.</span></span>
          </Reveal>

          <Reveal as="p" delay={160} className="hero-lead">{developer.tagline}</Reveal>

          <Reveal delay={240} className="hero-actions">
            <a href="#projects" className="btn btn-primary">
              View projects
              <Icon name="arrowRight" size={18} className="icon-slide" />
            </a>
            <a href="#contact" className="btn btn-ghost">Get in touch</a>
            <button type="button" className="btn btn-ghost" onClick={openChat}>
              <Icon name="sparkles" size={18} />
              Ask my AI assistant
            </button>
          </Reveal>

          <Reveal as="dl" delay={320} className="hero-stats">
            {stats.map((stat) => (
              <div className="stat" key={stat.label}>
                <dt>{stat.label}</dt>
                <dd>{stat.value}<span>{stat.suffix}</span></dd>
              </div>
            ))}
          </Reveal>
        </div>

        <div className="hero-visual">
          <ProfileCard />
          <CodeWindow />
        </div>
      </div>
    </section>
  );
}
