export const COLORS = {
  background: '#0d1117',
  surface: '#161b22',
  border: '#30363d',
  textPrimary: '#e6edf3',
  textSecondary: '#8b949e',
  green: '#3fb950',
  blue: '#58a6ff',
  red: '#f85149',
  orange: '#e3b341',
  purple: '#a371f7',
  teal: '#2dd4bf',
} as const

export const CATEGORY_LABELS: Record<string, string> = {
  Offensif: 'Offensif',
  Défensif: 'Défensif',
  Fondamentaux: 'Fondamentaux',
  Data: 'Data',
  'IA / Cyber': 'IA / Cyber',
  Transversal: 'Transversal',
}

export const LAB_DIFFICULTY_LABELS: Record<string, string> = {
  beginner: 'Débutant',
  intermediate: 'Intermédiaire',
  advanced: 'Avancé',
}

export const NAV_SECTIONS = [
  {
    title: 'Apprentissage',
    items: [
      { label: 'Dashboard', href: '/', icon: 'DashboardSquare01Icon' },
      { label: 'Cours', href: '/courses', icon: 'BookOpen01Icon' },
      { label: 'Par où commencer', href: '/learning-paths', icon: 'RoadLocation01Icon' },
      { label: 'TP', href: '/tp', icon: 'Task01Icon' },
      { label: 'Flashcards', href: '/flashcards', icon: 'Cards01Icon' },
    ],
  },
  {
    title: 'Outils',
    items: [
      { label: 'Cheatsheet', href: '/cheatsheet', icon: 'Search01Icon' },
      { label: 'Certifications', href: '/certifications', icon: 'Certificate01Icon' },
      { label: 'Projets', href: '/projects', icon: 'FolderLibraryIcon' },
      { label: 'Mes notes', href: '/notes', icon: 'StickyNote02Icon' },
      { label: 'Dépendances', href: '/dependencies', icon: 'GitBranchIcon' },
      { label: 'Portfolio', href: '/portfolio', icon: 'Album02Icon' },
    ],
  },
  {
    title: 'Labs',
    items: [
      { label: 'Nyx Labs', href: '/labs', icon: 'IncognitoIcon' },
    ],
  },
] as const
