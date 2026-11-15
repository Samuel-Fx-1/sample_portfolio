// src/components/Navigation.jsx
import { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import { developer, navSections } from '../data/developerData.js';
import useActiveSection from '../hooks/useActiveSection.js';

const SCROLL_THRESHOLD_PX = 12;
const SECTION_IDS = navSections.map((section) => section.id);

/**
 * @param {{ theme: 'light' | 'dark', onToggleTheme: () => void, onOpenPalette: () => void }} props
 */
export default function Navigation({ theme, onToggleTheme, onOpenPalette }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const activeId = useActiveSection(SECTION_IDS);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD_PX);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const themeLabel = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';

  const linkProps = (id) => ({
    href: `#${id}`,
    className: `nav-link${activeId === id ? ' is-active' : ''}`,
    'aria-current': activeId === id ? 'location' : undefined,
    onClick: closeMenu,
  });

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${menuOpen ? ' is-menu-open' : ''}`}>
      <nav className="nav container" aria-label="Main">
        <a href="#home" className="brand" aria-label={`${developer.name}, home`}>
          <span className="brand-mark" aria-hidden="true">{developer.initials[0]}</span>
          <span>{developer.handle}<span className="brand-dot">.</span></span>
        </a>

        <ul className="nav-links">
          {navSections.map((section) => (
            <li key={section.id}>
              <a {...linkProps(section.id)}>{section.label}</a>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <button type="button" className="search-trigger" onClick={onOpenPalette} aria-label="Open command palette">
            <Icon name="search" size={16} />
            <span className="search-trigger-label">Search</span>
            <kbd>⌘K</kbd>
          </button>
          <button type="button" className="icon-btn" onClick={onToggleTheme} aria-label={themeLabel} title={themeLabel}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
          </button>
          <button
            type="button"
            className="icon-btn menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={18} />
          </button>
        </div>
      </nav>

      <div id="mobile-menu" className={`mobile-menu${menuOpen ? ' is-open' : ''}`} inert={!menuOpen}>
        <ul className="container">
          {navSections.map((section) => (
            <li key={section.id}>
              <a {...linkProps(section.id)}>{section.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
