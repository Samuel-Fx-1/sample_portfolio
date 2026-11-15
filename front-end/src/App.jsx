// src/App.jsx
import { useCallback, useEffect, useState } from 'react';
import Navigation from './components/Navigation.jsx';
import CommandPalette from './components/CommandPalette.jsx';
import ProjectModal from './components/ProjectModal.jsx';
import Chatbot from './components/Chatbot.jsx';
import Footer from './components/Footer.jsx';
import Hero from './sections/Hero.jsx';
import About from './sections/About.jsx';
import Projects from './sections/Projects.jsx';
import Skills from './sections/Skills.jsx';
import Testimonials from './sections/Testimonials.jsx';
import Contact from './sections/Contact.jsx';
import useTheme from './hooks/useTheme.js';

const PALETTE_SHORTCUT_KEY = 'k';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const openPalette = useCallback(() => setIsPaletteOpen(true), []);
  const closePalette = useCallback(() => setIsPaletteOpen(false), []);
  const closeProject = useCallback(() => setSelectedProject(null), []);

  useEffect(() => {
    const onShortcut = (event) => {
      const isPaletteKey = event.key.toLowerCase() === PALETTE_SHORTCUT_KEY;
      if (isPaletteKey && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setIsPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onShortcut);
    return () => window.removeEventListener('keydown', onShortcut);
  }, []);

  return (
    <div className="app">
      <a className="skip-link" href="#main">Skip to content</a>

      <Navigation theme={theme} onToggleTheme={toggleTheme} onOpenPalette={openPalette} />

      <CommandPalette isOpen={isPaletteOpen} onClose={closePalette} onSelectProject={setSelectedProject} />

      <main id="main" tabIndex={-1}>
        <Hero />
        <About />
        <Projects onOpenProject={setSelectedProject} />
        <Skills />
        <Testimonials />
        <Contact />
      </main>

      <ProjectModal project={selectedProject} onClose={closeProject} />
      <Chatbot />
      <Footer />
    </div>
  );
}
