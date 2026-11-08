// Minimum score ratio for a quiz attempt to count as passed.
export const QUIZ_PASS_RATIO = 0.6

// WebSocket endpoint served by server.ts that bridges xterm.js to `docker exec` in a session's Kali box.
export const TERMINAL_WS_PATH = '/ws/terminal'

export function terminalWsUrl(sessionId: string): string {
  return `${TERMINAL_WS_PATH}?sessionId=${sessionId}`
}

export const DIFFICULTY_LABELS: Record<string, string> = {
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
