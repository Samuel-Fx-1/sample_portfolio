// src/components/Footer.jsx
import Icon from './Icon.jsx';
import { developer, navSections, socials } from '../data/developerData.js';

const SOCIAL_ICONS = {
  github: 'github',
  linkedin: 'linkedin',
  twitter: 'twitter',
  instagram: 'instagram',
};

export default function Footer() {
  const year = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <a href="#home" className="brand" aria-label={`${developer.name}, back to top`}>
            <span className="brand-mark" aria-hidden="true">{developer.initials[0]}</span>
            <span>{developer.handle}<span className="brand-dot">.</span></span>
          </a>
          <p className="footer-note">{developer.role}. Built with React and Vite.</p>
        </div>

        <nav className="footer-nav" aria-label="Footer">
          <ul>
            {navSections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>{section.label}</a>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="social-row" aria-label="Social profiles">
          {socials.map((social) => (
            <li key={social.id}>
              <a
                className="icon-btn"
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${social.label} (opens in a new tab)`}
                title={social.label}
              >
                <Icon name={SOCIAL_ICONS[social.id] ?? 'external'} size={18} />
              </a>
            </li>
          ))}
        </ul>

        <button type="button" className="icon-btn footer-top" onClick={scrollToTop} aria-label="Back to top" title="Back to top">
          <Icon name="arrowUp" size={18} />
        </button>
      </div>

      <div className="container footer-legal">
        <p>© {year} {developer.name}. All rights reserved.</p>
      </div>
    </footer>
  );
}
