// src/data/developerData.js
// Single source of truth for profile details shown across the site.

export const developer = {
  name: 'IZABAYO Samuel',
  handle: 'Samuel_Fx',
  initials: 'IS',
  role: 'Full-Stack Developer',
  location: 'Rwanda · Remote worldwide',
  email: 'samuelislegend8@gmail.com',
  available: true,
  tagline:
    'I build real-world web applications, dashboards, and backend systems that actually work in production — not just demos or templates.',
  skills: ['JavaScript', 'React.js', 'Node.js', 'Express', 'CSS'],
  passion: 'Creating amazing web experiences'
};

export const socials = [
  { id: 'github', label: 'GitHub', handle: 'Samuel-Fx-1', url: 'https://github.com/Samuel-Fx-1' },
  { id: 'linkedin', label: 'LinkedIn', handle: 'Samuel_FX', url: 'https://linkedin.com/in/Samuel_FX' },
  { id: 'twitter', label: 'Twitter / X', handle: '@Samuel_Fx', url: 'https://twitter.com/Samuel_Fx' },
  { id: 'instagram', label: 'Instagram', handle: '@samuel__fx_1', url: 'https://instagram.com/samuel__fx_1' }
];

export const stats = [
  { value: 6, suffix: '+', label: 'Projects shipped' },
  { value: 2, suffix: '+', label: 'Years experience' },
  { value: 10, suffix: '+', label: 'Technologies' }
];

export const strengths = [
  {
    icon: 'shield',
    title: 'Production-ready code',
    description: 'Maintainable, scalable code that supports real users, real data, and long-term growth.'
  },
  {
    icon: 'layers',
    title: 'System-level problem solving',
    description: 'Designing and debugging complete systems — from frontend behaviour to backend logic and data flow.'
  },
  {
    icon: 'users',
    title: 'Client & team collaboration',
    description: 'Translating business requirements into working technical solutions and communicating clearly.'
  }
];

export const timeline = [
  {
    period: '2024 — Present',
    title: 'Full-Stack Developer',
    description: 'Building responsive web apps, REST APIs and AI-powered tools with React, Node.js and Express.'
  },
  {
    period: '2022 — 2024',
    title: 'Cybersecurity Analyst',
    description: 'Securing web applications and APIs, performing penetration testing, and implementing security best practices.'
  }
];

export const navSections = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'testimonials', label: 'Testimonials' },
  { id: 'contact', label: 'Contact' }
];
