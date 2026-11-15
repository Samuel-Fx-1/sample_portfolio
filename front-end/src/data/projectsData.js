// src/data/projectsData.js
// `links.github` / `links.live` are optional — cards only show the links that exist.

export const projectCategories = ['All', 'Web', 'AI', 'Desktop'];

export const projects = [
  {
    id: 'si-ai',
    title: 'SI AI',
    category: 'AI',
    year: '2025',
    featured: true,
    summary: 'AI assistant that handles customer inquiries and automates support workflows.',
    description:
      'Production-ready AI assistant that handles customer inquiries, automates support workflows, and scales from 100 to 10,000+ concurrent conversations. It also powers the chat assistant on this site.',
    highlights: [
      'Multi-provider LLM routing with an offline fallback',
      'Conversation memory with bounded context',
      'Rate-limited serverless API'
    ],
    tags: ['Node.js', 'Express', 'JavaScript', 'OpenAI API', 'WebSocket'],
    accent: '#ff8a00',
    links: {}
  },
  {
    id: 'forex-platform',
    title: 'Forex Trading Platform',
    category: 'Web',
    year: '2024',
    featured: true,
    summary: 'Trading platform with real-time market data, charting and automation.',
    description:
      'Advanced forex trading platform with real-time market data, charting tools, and automated trading capabilities.',
    highlights: ['Live price feeds and charting', 'Strategy automation', 'MySQL-backed trade history'],
    tags: ['JavaScript', 'Node.js', 'Express', 'MySQL', 'HTML5', 'CSS3'],
    accent: '#f5b301',
    links: {}
  },
  {
    id: 'email-scan',
    title: 'Email Scan App',
    category: 'Desktop',
    year: '2023',
    summary: 'Security app that captures a photo on every failed login attempt.',
    description:
      'Captures a picture for every failed login attempt, providing an extra layer of security and peace of mind for users.',
    highlights: ['Camera capture on auth failure', 'Local incident log', 'Lightweight background service'],
    tags: ['C#', 'ASP.NET'],
    accent: '#ff5e3a',
    links: {}
  },
  {
    id: 'system-blocker',
    title: 'System Blocker',
    category: 'Desktop',
    year: '2023',
    summary: 'Productivity tool that blocks distracting websites system-wide.',
    description:
      'C# application that blocks access to specified websites, enhancing productivity and focus by preventing distractions.',
    highlights: ['System-wide domain blocking', 'Schedules and allow-lists', 'Tamper-resistant settings'],
    tags: ['C#', 'ASP.NET'],
    accent: '#ffa94d',
    links: {}
  },
  {
    id: 'ecommerce',
    title: 'E-commerce Website',
    category: 'Web',
    year: '2023',
    summary: 'Storefront with auth, product management, cart and checkout.',
    description:
      'Full-featured e-commerce platform with user authentication, product management, shopping cart, and secure payment integration.',
    highlights: ['User accounts and auth', 'Product catalogue management', 'Cart and checkout flow'],
    tags: ['HTML5', 'CSS3', 'JavaScript'],
    accent: '#ff7a59',
    links: {}
  },
  {
    id: 'samport',
    title: 'SamPort',
    category: 'Web',
    year: '2025',
    summary: 'This portfolio — fast, accessible, with a built-in AI assistant.',
    description:
      'High-performance portfolio system with an AI assistant, command-palette search, light/dark themes and a serverless contact pipeline.',
    highlights: ['React 19 + Vite', 'Serverless API routes', 'Accessible, motion-aware UI'],
    tags: ['React.js', 'JavaScript', 'Node.js', 'Express'],
    accent: '#ffc247',
    links: { live: 'https://samuelport.vercel.app' }
  }
];
