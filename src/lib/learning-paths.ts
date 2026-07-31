export interface LearningPath {
  slug: string
  title: string
  description: string
  courseSlugs: string[]
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    slug: 'pentest-web-api',
    title: 'Pentest Web & API',
    description: "Le parcours pour auditer des applications et des API du premier scan à la rédaction du rapport.",
    courseSlugs: [
      'intro-cyber',
      'linux',
      'reseaux',
      'web-security',
      'fichiers-bdd',
      'securite-applications-api',
      'redaction-rapports',
    ],
  },
  {
    slug: 'ad-entreprise',
    title: 'Active Directory & Entreprise',
    description: "Comprendre, administrer puis auditer un système d'information d'entreprise sous Active Directory.",
    courseSlugs: [
      'intro-cyber',
      'linux',
      'reseaux',
      'administration-si',
      'active-directory',
      'cyber-offensive',
      'redaction-rapports',
    ],
  },
  {
    slug: 'defense-soc',
    title: 'Défense & SOC',
    description: "Construire une défense en profondeur, détecter les incidents et savoir y répondre en tant qu'analyste SOC.",
    courseSlugs: [
      'intro-cyber',
      'reseaux',
      'dfir',
      'soc-analysis',
      'cyber-defensive',
      'droit-cybersecurite',
    ],
  },
  {
    slug: 'data-ia-cyber',
    title: 'Data & IA pour la Cybersécurité',
    description: "Le socle mathématique, puis le machine learning et le deep learning appliqués à la détection et à l'automatisation.",
    courseSlugs: [
      'maths',
      'algebre-lineaire',
      'python-datasci',
      'data-science',
      'machine-learning',
      'deep-learning',
      'ia-cybersecurity',
    ],
  },
]
