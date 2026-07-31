import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import Redis from 'ioredis'
import bcrypt from 'bcryptjs'

config({ path: '.env.local' })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const COURSES = [
  { slug: 'linux', title: 'Linux pour la Cybersécurité', category: 'Offensif', color: '#3fb950', order: 1, icon: 'ComputerTerminal01Icon', chapters: 5, credits: 7, dependsOn: [], description: "Maîtrise le système d'exploitation de référence en pentest : Kali Linux, permissions, processus, scripting Bash et durcissement réseau." },
  { slug: 'reseaux', title: 'Réseaux Informatiques', category: 'Fondamentaux', color: '#58a6ff', order: 2, icon: 'SecuredNetworkIcon', chapters: 8, credits: 8, dependsOn: [], description: "Du modèle OSI aux attaques réseau courantes : adressage IP, TCP/UDP, VLANs, pare-feu/VPN et analyse de trafic avec Wireshark." },
  { slug: 'web-security', title: 'Sécurité Web (OWASP)', category: 'Offensif', color: '#f85149', order: 3, icon: 'Globe02Icon', chapters: 8, credits: 10, dependsOn: ['linux', 'reseaux'], description: "Identifie et exploite les vulnérabilités web les plus critiques du Top 10 OWASP : injection SQL, XSS, contrôle d'accès et plus." },
  { slug: 'intro-cyber', title: 'Introduction Cybersécurité', category: 'Fondamentaux', color: '#a371f7', order: 4, icon: 'ShieldKeyIcon', chapters: 5, credits: 5, dependsOn: [], description: "Les fondations avant tout le reste : triade CIA, cadre légal du hacking éthique, méthodologie de pentest et gestion des risques." },
  { slug: 'active-directory', title: 'Active Directory & Windows', category: 'Offensif', color: '#2dd4bf', order: 5, icon: 'UserGroupIcon', chapters: 8, credits: 10, dependsOn: ['reseaux', 'linux', 'administration-si'], description: "Énumération, Kerberoasting, mouvement latéral et élévation de privilèges dans un environnement Active Directory d'entreprise." },
  { slug: 'dfir', title: 'Forensics & DFIR', category: 'Défensif', color: '#e3b341', order: 6, icon: 'Search01Icon', chapters: 8, credits: 10, dependsOn: ['linux', 'reseaux'], description: "Investigation numérique après incident : acquisition de preuves, analyse mémoire et disque, reconstruction d'une chronologie d'attaque." },
  { slug: 'cryptographie', title: 'Cryptographie Avancée', category: 'Fondamentaux', color: '#f0b429', order: 7, icon: 'LockIcon', chapters: 8, credits: 8, dependsOn: ['maths'], description: "Chiffrement symétrique et asymétrique, hachage, PKI et attaques cryptographiques classiques, avec mise en pratique guidée." },
  { slug: 'maths', title: 'Mathématiques Appliquées', category: 'Fondamentaux', color: '#06b6d4', order: 8, icon: 'Calculator01Icon', chapters: 8, credits: 8, dependsOn: [], description: "Les bases mathématiques (arithmétique modulaire, probabilités, logique) indispensables pour comprendre crypto et data science." },
  { slug: 'algebre-lineaire', title: 'Algèbre Linéaire', category: 'Fondamentaux', color: '#8b5cf6', order: 9, icon: 'GridTableIcon', chapters: 7, credits: 7, dependsOn: ['maths'], description: "Vecteurs, matrices et transformations linéaires — le socle mathématique du machine learning et de l'analyse de données." },
  { slug: 'data-science', title: 'Data Science Complète', category: 'Data', color: '#ec4899', order: 10, icon: 'ChartBarLineIcon', chapters: 9, credits: 9, dependsOn: ['maths', 'algebre-lineaire'], description: "Du nettoyage de données à la visualisation : le cycle complet de la data science appliqué à des cas concrets de sécurité." },
  { slug: 'python-datasci', title: 'Python pour la Data Science', category: 'Data', color: '#10b981', order: 11, icon: 'CodeIcon', chapters: 8, credits: 8, dependsOn: ['data-science'], description: "Pandas, NumPy et Matplotlib en pratique pour manipuler, analyser et visualiser des jeux de données de sécurité." },
  { slug: 'ia-cybersecurity', title: 'IA & Agents en Cybersécurité', category: 'IA / Cyber', color: '#f59e0b', order: 12, icon: 'AiCloud01Icon', chapters: 7, credits: 7, dependsOn: ['data-science', 'python-datasci'], description: "Détection d'anomalies par machine learning, agents IA pour l'automatisation SOC, et risques propres à l'IA offensive." },
  { slug: 'soc-analysis', title: 'Analyse SOC', category: 'Défensif', color: '#ef4444', order: 13, icon: 'DashboardBrowsingIcon', chapters: 8, credits: 10, dependsOn: ['reseaux', 'dfir'], description: "Triage d'alertes, corrélation SIEM et Cyber Kill Chain : le quotidien d'un analyste SOC niveau 1 et 2." },
  { slug: 'psychologie', title: 'Psychologie & Ingénierie Sociale', category: 'Transversal', color: '#d946ef', order: 14, icon: 'BrainIcon', chapters: 6, credits: 7, dependsOn: ['intro-cyber'], description: "Comprendre les biais cognitifs exploités en phishing et social engineering pour mieux former et protéger les utilisateurs." },
  { slug: 'cyber-offensive', title: 'Cybersécurité Offensive', category: 'Offensif', color: '#ef4444', order: 15, icon: 'IncognitoIcon', chapters: 10, credits: 12, dependsOn: ['linux', 'reseaux', 'web-security', 'active-directory'], description: "Le parcours pentest complet, de la reconnaissance à la rédaction du rapport, aligné sur les référentiels CEH/OSCP." },
  { slug: 'cyber-defensive', title: 'Cybersécurité Défensive', category: 'Défensif', color: '#22c55e', order: 16, icon: 'Shield01Icon', chapters: 10, credits: 12, dependsOn: ['administration-si', 'soc-analysis', 'dfir'], description: "Construire une défense en profondeur : durcissement, détection, réponse à incident et amélioration continue post-mortem." },
  { slug: 'redaction-rapports', title: 'Rédaction de Rapports et Documentation Technique', category: 'Transversal', color: '#0ea5e9', order: 17, icon: 'DocumentValidationIcon', chapters: 5, credits: 6, dependsOn: ['intro-cyber'], description: "Structurer, rédiger et présenter un rapport de pentest ou un rapport d'incident qui soit lu, compris et suivi d'effet." },
  { slug: 'droit-cybersecurite', title: 'Droit et Réglementation de la Cybersécurité', category: 'Transversal', color: '#f97316', order: 18, icon: 'JusticeScale01Icon', chapters: 6, credits: 7, dependsOn: ['intro-cyber'], description: "Le cadre légal indispensable au hacking éthique : autorisation, RGPD, normes sectorielles, contrats et preuve numérique." },
  { slug: 'administration-si', title: "Administration Systèmes et Réseaux d'Entreprise", category: 'Fondamentaux', color: '#64748b', order: 19, icon: 'ServerStack01Icon', chapters: 8, credits: 8, dependsOn: ['linux', 'reseaux'], description: "Administrer un système d'information d'entreprise : Windows Server, Linux en production, virtualisation, sauvegarde et supervision." },
  { slug: 'fichiers-bdd', title: 'Fichiers et Bases de Données', category: 'Fondamentaux', color: '#0891b2', order: 20, icon: 'Database01Icon', chapters: 7, credits: 8, dependsOn: ['linux', 'web-security'], description: "Des systèmes de fichiers aux bases relationnelles et NoSQL : structure interne, sécurité, injection SQL en profondeur et intégrité des données." },
  { slug: 'machine-learning', title: 'Machine Learning', category: 'Data', color: '#ec4899', order: 21, icon: 'ArtificialIntelligence01Icon', chapters: 7, credits: 9, dependsOn: ['data-science', 'algebre-lineaire', 'maths'], description: "Les algorithmes de machine learning en profondeur : régression, ensembles d'arbres, SVM, clustering avancé et mise en production rigoureuse." },
  { slug: 'deep-learning', title: 'Deep Learning', category: 'IA / Cyber', color: '#fb923c', order: 22, icon: 'Layers01Icon', chapters: 7, credits: 9, dependsOn: ['machine-learning', 'algebre-lineaire'], description: "Des réseaux de neurones aux Transformers : rétropropagation, CNN, RNN, attention, entraînement et limites en cybersécurité." },
  { slug: 'securite-applications-api', title: 'Sécurité des Applications et des API', category: 'Offensif', color: '#eab308', order: 23, icon: 'ApiIcon', chapters: 8, credits: 10, dependsOn: ['web-security', 'fichiers-bdd'], description: "Au-delà de l'OWASP Top 10 : cycle de développement sécurisé, sécurité des API REST/GraphQL, microservices, chaîne d'approvisionnement logicielle et DevSecOps." },
]

const LINUX_CHAPTER_TITLES = [
  'Introduction à Linux et Kali',
  "Système de fichiers et permissions",
  'Gestion des processus et services',
  'Scripting Bash pour la sécurité',
  'Linux réseau et durcissement',
]

const INTRO_CYBER_CHAPTER_TITLES = [
  'Fondamentaux de la cybersécurité',
  'Cadre légal et éthique du hacking',
  "Méthodologie d'un test d'intrusion",
  'Gestion des risques et normes de sécurité',
  'Construire son parcours et choisir ses certifications',
]

const RESEAUX_CHAPTER_TITLES = [
  'Modèle OSI et TCP/IP',
  'Adressage IP et sous-réseaux',
  'Protocoles de la couche transport (TCP/UDP)',
  'Protocoles applicatifs courants (HTTP, DNS, DHCP)',
  'Équipements réseau et VLANs',
  'Sécurité réseau — pare-feu, NAT et VPN',
  'Analyse de trafic avec Wireshark et tcpdump',
  'Attaques réseau courantes et contre-mesures',
]

const WEB_SECURITY_CHAPTER_TITLES = [
  'Introduction à la sécurité web et l’OWASP Top 10',
  'Reconnaissance web — cartographier une application',
  'Injection SQL — détection et exploitation',
  'Cross-Site Scripting (XSS)',
  'Authentification et gestion de sessions',
  'Contrôle d’accès cassé et IDOR',
  'SSRF, mauvaises configurations et composants vulnérables',
  'Méthodologie de test web et rédaction de rapport',
]

const REDACTION_RAPPORTS_CHAPTER_TITLES = [
  "Pourquoi documenter — la valeur d'un rapport bien écrit",
  'Structurer un rapport de pentest',
  'Rédiger des preuves de concept claires et scorer avec CVSS',
  "Rapports d'incident et documentation SOC",
  'Outils, gabarits et présentation orale des résultats',
]

const DROIT_CYBERSECURITE_CHAPTER_TITLES = [
  'Cadre légal du hacking éthique et autorisation écrite',
  'RGPD et protection des données personnelles',
  'Normes et référentiels — ISO 27001, NIST, PCI-DSS',
  'Contrats, NDA et responsabilité professionnelle',
  'Preuve numérique et droit de la preuve',
  'Réglementations sectorielles et internationales',
]

const ADMINISTRATION_SI_CHAPTER_TITLES = [
  "Architecture d'un système d'information d'entreprise",
  'Administration Windows Server et Active Directory',
  'Administration Linux en production',
  'Virtualisation et conteneurs',
  'Sauvegarde, PRA et PCA',
  'Supervision et monitoring',
  'Gestion des identités et des accès (IAM)',
  'Durcissement et maintenance en conditions réelles',
]

const ACTIVE_DIRECTORY_CHAPTER_TITLES = [
  'Introduction à Active Directory et Windows Server',
  'Énumération AD — LDAP, BloodHound et PowerView',
  'Kerberos et ses faiblesses — Kerberoasting et AS-REP Roasting',
  'Mouvement latéral — Pass-the-Hash, Pass-the-Ticket et exécution distante',
  'Élévation de privilèges Windows locale',
  'Abus de délégation Kerberos et de GPO',
  'Persistence — Golden Ticket, Silver Ticket et DCSync',
  "Méthodologie d'audit AD et durcissement — le modèle de tiering",
]

const DFIR_CHAPTER_TITLES = [
  "Introduction au DFIR et méthodologie d'investigation",
  'Acquisition de preuves numériques',
  'Analyse de la mémoire vive avec Volatility',
  'Analyse forensique de disque',
  'Analyse des logs et reconstruction de timeline',
  'Forensique réseau — capture et analyse de trafic',
  'Détection de malware et analyse statique/dynamique de base',
  'Rédiger un rapport DFIR et clôturer une investigation',
]

const CRYPTOGRAPHIE_CHAPTER_TITLES = [
  'Introduction à la cryptographie moderne',
  'Chiffrement symétrique — AES et modes opératoires',
  'Chiffrement asymétrique — RSA et courbes elliptiques',
  'Fonctions de hachage — SHA-256, intégrité et mots de passe',
  'Infrastructure à clés publiques (PKI) et certificats',
  'Attaques cryptographiques classiques',
  'TLS et HTTPS en pratique',
  'Cryptographie post-quantique et perspectives',
]

const MATHS_CHAPTER_TITLES = [
  'Arithmétique modulaire',
  "Nombres premiers, PGCD et algorithme d'Euclide",
  'Logique booléenne',
  'Probabilités — fondamentaux',
  "Théorie de l'information et entropie",
  'Statistiques descriptives',
  'Théorie des graphes appliquée à la sécurité',
  'Synthèse — les mathématiques au service de la cybersécurité',
]

const ALGEBRE_LINEAIRE_CHAPTER_TITLES = [
  'Vecteurs et espaces vectoriels',
  'Matrices — opérations fondamentales',
  "Déterminant et inverse d'une matrice",
  'Transformations linéaires',
  'Valeurs propres et vecteurs propres',
  'Normes et distances entre vecteurs',
  'Synthèse — l’algèbre linéaire au service de la data et du ML',
]

const DATA_SCIENCE_CHAPTER_TITLES = [
  "Le cycle de vie d'un projet de data science",
  'Collecte et nettoyage de données',
  'Exploration et visualisation de données (EDA)',
  'Statistiques appliquées à la data science',
  'Introduction au machine learning supervisé',
  "Machine learning non supervisé et détection d'anomalies",
  'Évaluation de modèles — métriques et pièges',
  'Data science appliquée à la cybersécurité — cas concrets',
  'Synthèse et éthique des données',
]

const PYTHON_DATASCI_CHAPTER_TITLES = [
  "Python pour la data science — l'écosystème",
  'NumPy — tableaux et calcul vectorisé',
  'Pandas — manipuler des DataFrames',
  'Nettoyage de données avec Pandas',
  'Visualisation avec Matplotlib et Seaborn',
  "Analyse exploratoire d'un jeu de données de sécurité",
  'Introduction à scikit-learn — entraîner un premier modèle',
  'Synthèse — construire un pipeline Python complet',
]

const IA_CYBERSECURITY_CHAPTER_TITLES = [
  'Des réseaux de neurones aux LLM — panorama',
  "Détection d'anomalies par deep learning",
  'Traitement automatique du langage (NLP) appliqué à la sécurité',
  'Agents IA autonomes — principes et architecture',
  "Agents IA pour l'automatisation SOC",
  'IA offensive et risques — prompt injection, deepfakes, IA adversariale',
  "Synthèse — gouvernance et limites de l'IA en cybersécurité",
]

const SOC_ANALYSIS_CHAPTER_TITLES = [
  "Le SOC — rôles, niveaux et quotidien d'un analyste",
  "Triage d'alertes — méthodologie et priorisation",
  'SIEM — collecte, corrélation et règles de détection',
  'La Cyber Kill Chain et MITRE ATT&CK',
  "Investigation d'une alerte — de la détection à la conclusion",
  'Playbooks et réponse à incident (SOAR)',
  'Threat hunting — la recherche proactive de menaces',
  "Synthèse — construire sa progression vers l'analyste SOC niveau 2",
]

const PSYCHOLOGIE_CHAPTER_TITLES = [
  "Introduction à l'ingénierie sociale et à la psychologie de la manipulation",
  'Les biais cognitifs exploités en ingénierie sociale',
  'Le phishing et ses variantes',
  "Le prétexting et l'usurpation d'identité",
  'Former et protéger les utilisateurs — sensibilisation efficace',
  'Synthèse — éthique du social engineering en test d’intrusion',
]

const CYBER_OFFENSIVE_CHAPTER_TITLES = [
  'Méthodologie de pentest complète — cadre CEH/OSCP',
  'Reconnaissance et OSINT',
  'Scan et énumération des services',
  'Exploitation de vulnérabilités web (synthèse pratique)',
  'Exploitation réseau et services',
  'Élévation de privilèges (Linux et Windows)',
  'Mouvement latéral et Active Directory (synthèse pratique)',
  'Post-exploitation et persistance',
  'Ingénierie sociale en pentest (application pratique)',
  'Rédaction du rapport final et debrief client — synthèse complète',
]

const CYBER_DEFENSIVE_CHAPTER_TITLES = [
  'Les principes de la défense en profondeur',
  'Durcissement des systèmes (synthèse pratique)',
  'Segmentation réseau et Zero Trust',
  'Gestion des identités et des accès en profondeur',
  'Détection — SIEM, EDR et supervision (synthèse pratique)',
  'Réponse à incident — méthodologie complète',
  "Sauvegarde et plan de continuité d'activité",
  'Threat intelligence et veille défensive',
  'Exercices Red Team, Blue Team et Purple Team',
  'Amélioration continue — post-mortem et maturité de sécurité',
]

const FICHIERS_BDD_CHAPTER_TITLES = [
  'Systèmes de fichiers — structure et métadonnées',
  'Formats de fichiers — structure interne',
  'Fondamentaux des bases de données relationnelles',
  'Bases de données NoSQL',
  'Sécurité des bases de données',
  'Injection SQL en profondeur — au-delà des bases',
  'Sauvegarde et intégrité des données',
]

const MACHINE_LEARNING_CHAPTER_TITLES = [
  "Qu'est-ce que l'apprentissage automatique — types et paradigmes",
  'La régression linéaire et logistique en détail',
  "Arbres de décision et méthodes d'ensemble",
  'Support Vector Machines et k-NN approfondi',
  'Clustering approfondi — k-means, DBSCAN et hiérarchique',
  'Réduction de dimension et sélection de caractéristiques',
  "Évaluation rigoureuse et mise en production d'un modèle",
]

const DEEP_LEARNING_CHAPTER_TITLES = [
  'Le perceptron et la descente de gradient',
  'Réseaux de neurones profonds et rétropropagation',
  'Réseaux de neurones convolutifs (CNN)',
  'Réseaux de neurones récurrents et séquences (RNN/LSTM)',
  "Les Transformers et l'attention",
  'Entraîner un modèle deep learning — GPU, batchs, régularisation',
  'Déploiement et limites du deep learning en sécurité',
]

const SECURITE_APPLICATIONS_API_CHAPTER_TITLES = [
  'Cycle de développement sécurisé (SSDLC) et modélisation des menaces',
  'Sécurité des API REST — OWASP API Security Top 10',
  'Authentification et autorisation des API — OAuth 2.0, JWT et clés API',
  'GraphQL et sécurité des API modernes',
  'Sécurité des microservices et communication inter-services',
  "Sécurité de la chaîne d'approvisionnement logicielle",
  'Tests de sécurité automatisés — SAST, DAST et SCA',
  'DevSecOps — intégrer la sécurité dans un pipeline CI/CD',
]

const CHAPTER_TITLES_BY_COURSE: Record<string, string[]> = {
  linux: LINUX_CHAPTER_TITLES,
  'intro-cyber': INTRO_CYBER_CHAPTER_TITLES,
  reseaux: RESEAUX_CHAPTER_TITLES,
  'web-security': WEB_SECURITY_CHAPTER_TITLES,
  'redaction-rapports': REDACTION_RAPPORTS_CHAPTER_TITLES,
  'droit-cybersecurite': DROIT_CYBERSECURITE_CHAPTER_TITLES,
  'administration-si': ADMINISTRATION_SI_CHAPTER_TITLES,
  'active-directory': ACTIVE_DIRECTORY_CHAPTER_TITLES,
  dfir: DFIR_CHAPTER_TITLES,
  cryptographie: CRYPTOGRAPHIE_CHAPTER_TITLES,
  maths: MATHS_CHAPTER_TITLES,
  'algebre-lineaire': ALGEBRE_LINEAIRE_CHAPTER_TITLES,
  'data-science': DATA_SCIENCE_CHAPTER_TITLES,
  'python-datasci': PYTHON_DATASCI_CHAPTER_TITLES,
  'ia-cybersecurity': IA_CYBERSECURITY_CHAPTER_TITLES,
  'soc-analysis': SOC_ANALYSIS_CHAPTER_TITLES,
  psychologie: PSYCHOLOGIE_CHAPTER_TITLES,
  'cyber-offensive': CYBER_OFFENSIVE_CHAPTER_TITLES,
  'cyber-defensive': CYBER_DEFENSIVE_CHAPTER_TITLES,
  'fichiers-bdd': FICHIERS_BDD_CHAPTER_TITLES,
  'machine-learning': MACHINE_LEARNING_CHAPTER_TITLES,
  'deep-learning': DEEP_LEARNING_CHAPTER_TITLES,
  'securite-applications-api': SECURITE_APPLICATIONS_API_CHAPTER_TITLES,
}

const CERTIFICATIONS = [
  { slug: 'security-plus', name: 'CompTIA Security+', provider: 'CompTIA', priority: 1, linkedCourses: ['intro-cyber', 'reseaux'] },
  { slug: 'ceh', name: 'CEH v13', provider: 'EC-Council', priority: 2, linkedCourses: ['linux', 'reseaux', 'web-security', 'active-directory', 'dfir', 'cryptographie', 'intro-cyber', 'cyber-offensive'] },
  { slug: 'ejpt', name: 'eJPT', provider: 'INE Security', priority: 3, linkedCourses: ['linux', 'web-security', 'reseaux', 'cyber-offensive'] },
  { slug: 'pnpt', name: 'PNPT', provider: 'TCM Security', priority: 4, linkedCourses: ['linux', 'active-directory', 'web-security', 'cyber-offensive'] },
  { slug: 'oscp', name: 'OSCP', provider: 'Offensive Security', priority: 5, linkedCourses: ['cyber-offensive', 'active-directory', 'linux'] },
  { slug: 'gcfe', name: 'GCFE', provider: 'GIAC', priority: 6, linkedCourses: ['dfir'] },
  { slug: 'cissp', name: 'CISSP', provider: 'ISC2', priority: 7, linkedCourses: COURSES.map((c) => c.slug) },
  { slug: 'crtp', name: 'CRTP', provider: 'Altered Security', priority: 8, linkedCourses: ['active-directory', 'administration-si', 'linux'] },
  { slug: 'crte', name: 'CRTE', provider: 'Altered Security', priority: 9, linkedCourses: ['active-directory', 'cyber-offensive', 'administration-si'] },
]

function mkSteps(titles: string[]) {
  return titles.map((title, i) => ({ id: `s${i + 1}`, title, completed: false }))
}

const PROJECTS = [
  {
    title: 'Pentest complet d’une application web volontairement vulnérable',
    description: "Mène un test d'intrusion de bout en bout sur une application type DVWA/Juice Shop : reconnaissance, exploitation d'au moins 3 vulnérabilités du Top 10 OWASP, puis rédaction d'un rapport professionnel complet avec synthèse exécutive et recommandations.",
    category: 'pentest',
    linkedCourses: ['web-security', 'redaction-rapports'],
    steps: mkSteps(['Reconnaissance et cartographie de la cible', 'Exploiter au moins 3 vulnérabilités du Top 10 OWASP', 'Documenter chaque preuve de concept', 'Rédiger le rapport final avec synthèse exécutive']),
  },
  {
    title: 'Audit Active Directory d’un lab maison',
    description: "Déploie un petit domaine Active Directory (2-3 machines) volontairement mal configuré, puis audite-le avec BloodHound : identifie un chemin d'attaque complet jusqu'à Admin du domaine et documente-le.",
    category: 'pentest',
    linkedCourses: ['active-directory', 'redaction-rapports'],
    steps: mkSteps(['Déployer un domaine AD de 2-3 machines', 'Collecter les données avec BloodHound', 'Identifier un chemin d’attaque jusqu’à Admin du domaine', 'Documenter et proposer des mesures de durcissement']),
  },
  {
    title: 'Script d’automatisation de reconnaissance réseau',
    description: "Écris un script (Bash ou Python) qui enchaîne automatiquement découverte d'hôtes, scan de ports et détection de services sur un sous-réseau donné, puis génère un rapport texte structuré.",
    category: 'automatisation',
    linkedCourses: ['reseaux', 'linux'],
    steps: mkSteps(['Écrire la découverte d’hôtes automatisée', 'Enchaîner le scan de ports et services', 'Générer un rapport texte structuré', 'Tester sur un sous-réseau réel du lab']),
  },
  {
    title: 'Outil d’audit de mots de passe',
    description: "Développe un petit outil qui analyse une liste de hashs de mots de passe exportée (dans un contexte autorisé) et catégorise leur robustesse selon des règles configurables (longueur, entropie, présence dans des listes connues).",
    category: 'automatisation',
    linkedCourses: ['cryptographie'],
    steps: mkSteps(['Définir les règles de robustesse configurables', 'Implémenter le calcul d’entropie', 'Croiser avec une liste de mots de passe connus', 'Générer un rapport de robustesse par compte']),
  },
  {
    title: 'Rapport d’audit de conformité RGPD fictif',
    description: "Choisis une PME fictive et rédige un rapport d'audit de conformité RGPD complet : cartographie des traitements, analyse des risques, écarts identifiés et plan d'action priorisé.",
    category: 'rapport',
    linkedCourses: ['droit-cybersecurite', 'redaction-rapports'],
    steps: mkSteps(['Cartographier les traitements de données de la PME fictive', 'Analyser les risques associés', 'Identifier les écarts de conformité', 'Rédiger le plan d’action priorisé']),
  },
  {
    title: 'Rédiger une politique de sécurité (PSSI) pour une petite structure',
    description: "Rédige une Politique de Sécurité des Systèmes d'Information complète pour une organisation fictive de taille modeste, couvrant accès, sauvegarde, durcissement et réponse à incident.",
    category: 'rapport',
    linkedCourses: ['administration-si', 'droit-cybersecurite'],
    steps: mkSteps(['Définir le périmètre et les objectifs de la PSSI', 'Rédiger les règles d’accès et de sauvegarde', 'Rédiger les règles de durcissement', 'Rédiger la procédure de réponse à incident']),
  },
  {
    title: 'Recherche et reproduction d’une CVE récente',
    description: "Choisis une CVE publiée récemment sur un composant courant, documente son mécanisme d'exploitation, puis reproduis-la dans un environnement isolé et rédige une fiche technique détaillée.",
    category: 'recherche',
    linkedCourses: ['web-security', 'cyber-offensive'],
    steps: mkSteps(['Choisir une CVE récente documentée publiquement', 'Comprendre son mécanisme d’exploitation', 'La reproduire dans un environnement isolé', 'Rédiger une fiche technique détaillée']),
  },
  {
    title: 'Étude comparative d’outils de détection SOC open source',
    description: "Compare 2 à 3 outils open source de détection (SIEM/EDR léger) sur des critères objectifs (facilité de déploiement, qualité des règles de détection, performance) et rédige une synthèse argumentée.",
    category: 'recherche',
    linkedCourses: ['soc-analysis'],
    steps: mkSteps(['Sélectionner 2-3 outils open source à comparer', 'Déployer chaque outil dans un environnement de test', 'Évaluer selon des critères objectifs', 'Rédiger la synthèse argumentée']),
  },
  {
    title: 'Résoudre et documenter un challenge CTF complet',
    description: "Choisis un challenge CTF (catégorie web ou pwn) sur une plateforme publique, résous-le intégralement et rédige un write-up détaillé expliquant chaque étape de ton raisonnement.",
    category: 'ctf',
    linkedCourses: ['cyber-offensive'],
    steps: mkSteps(['Choisir un challenge CTF public (web ou pwn)', 'Résoudre le challenge jusqu’au flag', 'Documenter chaque étape du raisonnement', 'Publier le write-up complet']),
  },
  {
    title: 'Créer son propre mini-CTF pour un pair',
    description: "Conçois une petite machine volontairement vulnérable (1-2 failles) destinée à être résolue par quelqu'un d'autre, avec un scénario, des indices progressifs et un flag à capturer.",
    category: 'ctf',
    linkedCourses: ['linux', 'web-security'],
    steps: mkSteps(['Concevoir le scénario et les 1-2 failles', 'Construire la machine vulnérable', 'Rédiger des indices progressifs', 'Faire tester le CTF par un pair']),
  },
  {
    title: 'Veille hebdomadaire sur les CVE critiques',
    description: "Mets en place une routine hebdomadaire de veille : identifie les CVE critiques (CVSS 9+) publiées dans la semaine sur des composants courants, résume leur impact en quelques lignes chacune.",
    category: 'veille',
    linkedCourses: [],
    steps: mkSteps(['Choisir 2-3 sources de veille fiables', 'Identifier les CVE critiques (CVSS 9+) de la semaine', 'Résumer l’impact de chacune en quelques lignes', 'Partager la synthèse hebdomadaire']),
  },
  {
    title: 'Suivre un groupe de menace et résumer ses TTPs',
    description: "Choisis un groupe de menace (APT) documenté publiquement et résume ses tactiques, techniques et procédures (TTPs) selon le framework MITRE ATT&CK, avec des recommandations de détection associées.",
    category: 'veille',
    linkedCourses: ['dfir', 'soc-analysis'],
    steps: mkSteps(['Choisir un groupe de menace (APT) documenté', 'Cartographier ses TTPs selon MITRE ATT&CK', 'Identifier des recommandations de détection', 'Rédiger la synthèse finale']),
  },
  {
    title: 'Concevoir un schéma de base de données sécurisé',
    description: "Modélise le schéma d'une petite application (gestion de commandes, par exemple), en appliquant le moindre privilège aux comptes applicatifs, le chiffrement des champs sensibles et une résistance testée à l'injection SQL.",
    category: 'developpement',
    linkedCourses: ['fichiers-bdd', 'web-security'],
    steps: mkSteps(['Modéliser le schéma relationnel de l’application', 'Configurer des comptes applicatifs à privilège minimal', 'Chiffrer les champs sensibles au repos', 'Tester la résistance du schéma à l’injection SQL']),
  },
  {
    title: 'Entraîner un classifieur de détection de phishing',
    description: "Collecte ou récupère un jeu de données d'emails, entraîne et compare plusieurs modèles de classification (arbre, ensemble, SVM) pour détecter le phishing, puis évalue rigoureusement leur performance par validation croisée.",
    category: 'developpement',
    linkedCourses: ['machine-learning', 'python-datasci'],
    steps: mkSteps(['Collecter et nettoyer un jeu de données d’emails', 'Entraîner au moins deux modèles de classification différents', 'Évaluer chaque modèle par validation croisée', 'Documenter les limites et biais potentiels du modèle retenu']),
  },
  {
    title: 'Construire et entraîner un CNN de classification d’images',
    description: "Construis un réseau de neurones convolutif simple pour classifier un petit jeu d'images (par exemple logos légitimes vs logos de phishing), entraîne-le avec régularisation, puis teste sa robustesse face à une perturbation adversariale simple.",
    category: 'developpement',
    linkedCourses: ['deep-learning'],
    steps: mkSteps(['Préparer et augmenter un petit jeu de données d’images', 'Construire une architecture CNN avec dropout', 'Entraîner le modèle et suivre sa courbe d’apprentissage', 'Tester sa robustesse face à une perturbation adversariale simple']),
  },
  {
    title: 'Auditer une API REST selon l’OWASP API Security Top 10',
    description: "Cartographie les endpoints d'une API REST volontairement vulnérable, teste systématiquement les risques BOLA, authentification et excessive data exposure, puis rédige un rapport d'audit structuré.",
    category: 'pentest',
    linkedCourses: ['securite-applications-api', 'redaction-rapports'],
    steps: mkSteps(['Cartographier l’ensemble des endpoints de l’API', 'Tester une vulnérabilité BOLA sur plusieurs objets', 'Tester la robustesse de l’authentification JWT', 'Rédiger le rapport d’audit structuré']),
  },
  {
    title: 'Mettre en place un pipeline CI/CD avec sécurité intégrée',
    description: "Configure un pipeline CI/CD basique pour une petite application, puis intègre un outil SAST et un outil SCA avec une politique de blocage graduée selon la criticité des vulnérabilités détectées.",
    category: 'automatisation',
    linkedCourses: ['securite-applications-api', 'administration-si'],
    steps: mkSteps(['Configurer un pipeline CI/CD basique', 'Intégrer un outil SAST au commit', 'Intégrer un outil SCA sur les dépendances', 'Définir une politique de blocage graduée par criticité']),
  },
  {
    title: 'Générer un SBOM pour un projet open source',
    description: "Choisis un projet open source, génère son SBOM complet, croise-le avec une base de données de CVE publiques, puis rédige une synthèse des risques identifiés dans sa chaîne d'approvisionnement logicielle.",
    category: 'recherche',
    linkedCourses: ['securite-applications-api'],
    steps: mkSteps(['Choisir un projet open source à auditer', 'Générer son SBOM complet', 'Croiser le SBOM avec une base de CVE publiques', 'Rédiger la synthèse des risques identifiés']),
  },
]

const LABS = [
  {
    slug: 'web-001',
    title: 'La Boutique Piratée',
    category: 'web',
    difficulty: 'beginner',
    estimatedTime: 45,
    totalPoints: 500,
    description: "Compromets une boutique en ligne vulnérable : injection SQL, upload de web shell puis élévation de privilèges.",
    kaliImage: 'nyx/kali-tools',
    targets: [{ name: 'webserver', image: 'vulnerables/web-dvwa', ip: '10.10.0.10', hostname: 'shop.lab' }],
    flags: [
      { flagId: 'flag-1', hint: 'Le premier flag est dans /var/www/html/secret/', value: 'FLAG{sql_injection_master}', points: 150 },
      { flagId: 'flag-2', hint: 'Uploade un web shell — le flag est dans /root/', value: 'FLAG{web_shell_uploaded}', points: 200 },
      { flagId: 'flag-3', hint: 'Escalade vers root et lis /etc/shadow', value: 'FLAG{privilege_escalated}', points: 150 },
    ],
  },
  {
    slug: 'web-002',
    title: 'Le Compte Administrateur',
    category: 'web',
    difficulty: 'intermediate',
    estimatedTime: 50,
    totalPoints: 550,
    description: "Une application de gestion interne présente plusieurs failles combinées : XSS stocké, authentification faible et contrôle d'accès défaillant. À toi de les enchaîner jusqu'au compte administrateur.",
    kaliImage: 'nyx/kali-tools',
    targets: [{ name: 'webapp', image: 'vulnerables/web-dvwa', ip: '10.10.0.10', hostname: 'app.lab' }],
    flags: [
      { flagId: 'flag-1', hint: 'Un XSS stocké permet d’exfiltrer un cookie de session', value: 'FLAG{xss_stocke_confirme}', points: 150 },
      { flagId: 'flag-2', hint: 'Le formulaire de connexion accepte un bruteforce sans limitation', value: 'FLAG{authentification_forcee}', points: 200 },
      { flagId: 'flag-3', hint: 'Une IDOR sur l’identifiant utilisateur donne accès au panneau admin', value: 'FLAG{controle_acces_casse}', points: 200 },
    ],
  },
  {
    slug: 'net-001',
    title: 'Premier Contact',
    category: 'network',
    difficulty: 'beginner',
    estimatedTime: 30,
    totalPoints: 400,
    description: "Reconnaissance réseau et exploitation d'un service FTP vulnérable sur une machine Metasploitable.",
    kaliImage: 'nyx/kali-tools',
    targets: [{ name: 'target', image: 'tleemcjr/metasploitable2', ip: '10.10.0.10' }],
    flags: [
      { flagId: 'flag-1', hint: 'Trouve tous les services ouverts avec Nmap', value: 'FLAG{nmap_master_scanner}', points: 150 },
      { flagId: 'flag-2', hint: 'Exploite le service FTP vulnérable', value: 'FLAG{ftp_backdoor_pwned}', points: 250 },
    ],
  },
  {
    slug: 'linux-001',
    title: 'Élévation Silencieuse',
    category: 'exploitation',
    difficulty: 'beginner',
    estimatedTime: 35,
    totalPoints: 350,
    description: "Un accès utilisateur limité t'a été fourni sur une machine Linux mal configurée. Trouve le chemin d'élévation de privilèges jusqu'à root.",
    kaliImage: 'nyx/kali-tools',
    targets: [{ name: 'victim', image: 'tleemcjr/metasploitable2', ip: '10.10.0.10', hostname: 'internal.lab' }],
    flags: [
      { flagId: 'flag-1', hint: 'Énumère les binaires SUID sur la machine cible', value: 'FLAG{suid_binary_found}', points: 150 },
      { flagId: 'flag-2', hint: 'Utilise le binaire SUID pour obtenir un shell root', value: 'FLAG{root_shell_obtained}', points: 200 },
    ],
  },
  {
    slug: 'crypto-001',
    title: 'Le Message Chiffré',
    category: 'crypto',
    difficulty: 'beginner',
    estimatedTime: 25,
    totalPoints: 300,
    description: "Une série de messages chiffrés avec des algorithmes faibles ou mal implémentés doit être cassée pour révéler un flag final.",
    kaliImage: 'nyx/kali-tools',
    targets: [{ name: 'crypto-server', image: 'kalilinux/kali-rolling', ip: '10.10.0.10', hostname: 'vault.lab' }],
    flags: [
      { flagId: 'flag-1', hint: 'Le premier message est chiffré en base64 puis ROT13', value: 'FLAG{classic_encoding_broken}', points: 100 },
      { flagId: 'flag-2', hint: 'Le hash trouvé est un MD5 issu d’un dictionnaire courant', value: 'FLAG{weak_hash_cracked}', points: 200 },
    ],
  },
  {
    slug: 'web-003',
    title: "L'API Fragile",
    category: 'web',
    difficulty: 'intermediate',
    estimatedTime: 45,
    totalPoints: 500,
    description: "Une API REST de gestion de commandes souffre de deux failles caractéristiques des API modernes : un contrôle d'accès défaillant au niveau des objets (BOLA) et une vérification JWT mal implémentée.",
    kaliImage: 'nyx/kali-tools',
    targets: [{ name: 'api-server', image: 'nyx/lab-web-api-fragile', ip: '10.10.0.10', hostname: 'api.lab' }],
    flags: [
      { flagId: 'flag-1', hint: 'Modifie l’identifiant de commande dans l’URL pour accéder à celle d’un autre utilisateur', value: 'FLAG{bola_object_exposed}', points: 200 },
      { flagId: 'flag-2', hint: 'Le serveur accepte un JWT dont l’en-tête indique l’algorithme "none"', value: 'FLAG{jwt_alg_none_forged}', points: 300 },
    ],
  },
  {
    slug: 'ad-001',
    title: 'Le Domaine Compromis',
    category: 'ad',
    difficulty: 'advanced',
    estimatedTime: 60,
    totalPoints: 650,
    description: "Un petit domaine Active Directory d'entreprise, volontairement mal configuré, doit être compromis jusqu'à l'obtention des droits Domain Admin, en enchaînant Kerberoasting et un chemin d'attaque BloodHound.",
    kaliImage: 'nyx/kali-tools',
    targets: [{ name: 'dc01', image: 'nyx/lab-ad-corp', ip: '10.10.0.10', hostname: 'dc01.corp.lab' }],
    flags: [
      { flagId: 'flag-1', hint: 'Un compte de service dispose d’un SPN — récupère et casse son ticket Kerberos', value: 'FLAG{kerberoasting_service_account}', points: 250 },
      { flagId: 'flag-2', hint: 'BloodHound révèle un chemin d’attaque complet jusqu’à Domain Admin', value: 'FLAG{domain_admin_obtained}', points: 400 },
    ],
  },
  {
    slug: 'dfir-001',
    title: 'La Boîte à Souvenirs',
    category: 'dfir',
    difficulty: 'intermediate',
    estimatedTime: 50,
    totalPoints: 550,
    description: "Un poste de travail compromis doit être analysé après incident : reconstruis la chronologie de l'attaque à partir des artefacts disponibles (processus, prefetch, fichiers récents) pour identifier le vecteur d'entrée et l'action malveillante finale.",
    kaliImage: 'nyx/kali-tools',
    targets: [{ name: 'workstation', image: 'nyx/lab-dfir-workstation', ip: '10.10.0.10', hostname: 'victim-ws.lab' }],
    flags: [
      { flagId: 'flag-1', hint: 'Un fichier récemment exécuté figure dans les artefacts de prefetch', value: 'FLAG{vecteur_entree_identifie}', points: 250 },
      { flagId: 'flag-2', hint: 'Reconstruis la chronologie complète pour identifier l’action finale de l’attaquant', value: 'FLAG{chronologie_reconstruite}', points: 300 },
    ],
  },
  {
    slug: 'soc-001',
    title: "L'Alerte Silencieuse",
    category: 'soc',
    difficulty: 'intermediate',
    estimatedTime: 40,
    totalPoints: 450,
    description: "Une pile de logs bruts (pare-feu, authentification, proxy) contient un incident réel noyé parmi de nombreux faux positifs. Corrèle les sources pour confirmer l'incident et identifier l'adresse IP à l'origine de l'attaque.",
    kaliImage: 'nyx/kali-tools',
    targets: [{ name: 'siem', image: 'nyx/lab-soc-siem', ip: '10.10.0.10', hostname: 'siem.lab' }],
    flags: [
      { flagId: 'flag-1', hint: 'Une même IP apparaît dans les logs d’authentification échouée puis réussie juste après', value: 'FLAG{ip_malveillante_identifiee}', points: 200 },
      { flagId: 'flag-2', hint: 'Corrèle avec les logs proxy pour confirmer l’exfiltration de données', value: 'FLAG{incident_confirme}', points: 250 },
    ],
  },
  {
    slug: 'osint-001',
    title: "L'Empreinte Numérique",
    category: 'osint',
    difficulty: 'beginner',
    estimatedTime: 35,
    totalPoints: 350,
    description: "À partir de simples informations publiques (documents, réseaux sociaux fictifs, métadonnées de fichiers), reconstitue le profil numérique d'un employé fictif pour préparer une campagne de sensibilisation au phishing.",
    kaliImage: 'nyx/kali-tools',
    targets: [{ name: 'target-info', image: 'nyx/lab-osint-target', ip: '10.10.0.10', hostname: 'osint.lab' }],
    flags: [
      { flagId: 'flag-1', hint: 'Les métadonnées EXIF d’un document public révèlent le logiciel et l’auteur', value: 'FLAG{metadonnees_exposees}', points: 150 },
      { flagId: 'flag-2', hint: 'Croise les informations trouvées pour déduire un schéma probable de mot de passe', value: 'FLAG{profil_numerique_reconstitue}', points: 200 },
    ],
  },
  {
    slug: 'web-004',
    title: 'Le Gestionnaire de Fichiers',
    category: 'web',
    difficulty: 'intermediate',
    estimatedTime: 45,
    totalPoints: 500,
    description: "Exploite une inclusion de fichier local (LFI) puis empoisonne les journaux du serveur pour obtenir l'exécution de commandes.",
    kaliImage: 'nyx/kali-tools',
    targets: [{ name: 'webserver', image: 'vulnerables/web-dvwa', ip: '10.10.0.10', hostname: 'filemanager.lab' }],
    flags: [
      { flagId: 'flag-1', hint: 'Le paramètre page accepte des chemins relatifs sans filtrage sérieux', value: 'FLAG{lfi_confirmee}', points: 150 },
      { flagId: 'flag-2', hint: 'Empoisonne un journal accessible via le User-Agent puis inclus-le', value: 'FLAG{log_poisoning_rce}', points: 350 },
    ],
  },
  {
    slug: 'web-005',
    title: 'La Requête Détournée',
    category: 'web',
    difficulty: 'advanced',
    estimatedTime: 55,
    totalPoints: 600,
    description: "Détourne une fonctionnalité d'import d'image côté serveur (SSRF) pour atteindre un service d'administration interne autrement inaccessible.",
    kaliImage: 'nyx/kali-tools',
    targets: [
      { name: 'shop-api', image: 'bkimminich/juice-shop', ip: '10.10.0.10', hostname: 'shop-api.lab' },
      { name: 'internal-admin', image: 'vulnerables/web-dvwa', ip: '10.10.0.11', hostname: 'internal-admin.lab' },
    ],
    flags: [
      { flagId: 'flag-1', hint: 'Le champ d’URL d’import n’est pas limité aux domaines externes', value: 'FLAG{ssrf_confirmee}', points: 200 },
      { flagId: 'flag-2', hint: 'Pivote via la SSRF pour atteindre internal-admin.lab et récupère ses identifiants exposés', value: 'FLAG{acces_interne_via_ssrf}', points: 400 },
    ],
  },
  {
    slug: 'exploit-001',
    title: 'Le Service Oublié',
    category: 'exploitation',
    difficulty: 'intermediate',
    estimatedTime: 50,
    totalPoints: 550,
    description: "Provoque un débordement de pile sur un service réseau compilé sans protections, puis transforme ce plantage en exécution de code arbitraire.",
    kaliImage: 'nyx/kali-tools',
    targets: [{ name: 'legacy-service', image: 'tleemcjr/metasploitable2', ip: '10.10.0.10', hostname: 'legacy-service.lab' }],
    flags: [
      { flagId: 'flag-1', hint: 'Utilise msf-pattern_create/msf-pattern_offset pour trouver l’offset exact de EIP', value: 'FLAG{offset_eip_trouve}', points: 200 },
      { flagId: 'flag-2', hint: 'Place un shellcode msfvenom sur la pile pour obtenir un shell', value: 'FLAG{buffer_overflow_exploite}', points: 350 },
    ],
  },
  {
    slug: 'exploit-002',
    title: 'La Porte Dérobée',
    category: 'exploitation',
    difficulty: 'beginner',
    estimatedTime: 25,
    totalPoints: 350,
    description: "Identifie un service FTP contenant une porte dérobée connue et exploite-la pour obtenir un shell interactif complet.",
    kaliImage: 'nyx/kali-tools',
    targets: [{ name: 'target', image: 'tleemcjr/metasploitable2', ip: '10.10.0.10' }],
    flags: [
      { flagId: 'flag-1', hint: 'Un scan de version révèle un numéro de version FTP connu pour être compromis', value: 'FLAG{version_vulnerable_identifiee}', points: 100 },
      { flagId: 'flag-2', hint: 'Génère un payload avec msfvenom et obtiens un shell interactif', value: 'FLAG{shell_interactif_obtenu}', points: 250 },
    ],
  },
  {
    slug: 'net-002',
    title: 'Au-delà de la Passerelle',
    category: 'network',
    difficulty: 'intermediate',
    estimatedTime: 55,
    totalPoints: 600,
    description: "Compromets une passerelle réseau puis utilise cet accès comme pivot pour atteindre une machine d'un segment interne autrement injoignable.",
    kaliImage: 'nyx/kali-tools',
    targets: [
      { name: 'gateway', image: 'tleemcjr/metasploitable2', ip: '10.10.0.10', hostname: 'gateway.lab' },
      { name: 'internal-db', image: 'vulnerables/web-dvwa', ip: '10.10.0.20', hostname: 'internal-db.lab' },
    ],
    flags: [
      { flagId: 'flag-1', hint: 'Exploite le service FTP vulnérable de gateway.lab pour un accès initial', value: 'FLAG{passerelle_compromise}', points: 200 },
      { flagId: 'flag-2', hint: 'Pivote depuis la passerelle (tunnel SSH ou chisel) jusqu’à internal-db.lab', value: 'FLAG{pivot_reussi}', points: 400 },
    ],
  },
  {
    slug: 'crypto-002',
    title: 'La Clé Trop Faible',
    category: 'crypto',
    difficulty: 'advanced',
    estimatedTime: 60,
    totalPoints: 650,
    description: "Factorise une clé RSA volontairement faible puis exploite une confusion d'algorithme RS256/HS256 pour forger un jeton JWT administrateur.",
    kaliImage: 'nyx/kali-tools',
    targets: [{ name: 'vault-api', image: 'nyx/lab-web-api-fragile', ip: '10.10.0.10', hostname: 'vault-api.lab' }],
    flags: [
      { flagId: 'flag-1', hint: 'Factorise le module RSA public exposé pour reconstruire la clé privée', value: 'FLAG{rsa_factorisee}', points: 250 },
      { flagId: 'flag-2', hint: 'Réutilise la clé publique PEM comme secret HMAC pour forger un JWT admin', value: 'FLAG{confusion_alg_exploitee}', points: 400 },
    ],
  },
  {
    slug: 'dfir-002',
    title: 'Ce Que la Mémoire Se Souvient',
    category: 'dfir',
    difficulty: 'advanced',
    estimatedTime: 60,
    totalPoints: 650,
    description: "Analyse un dump mémoire complet avec Volatility pour repérer un processus dissimulé et extraire les artefacts laissés par l'attaquant.",
    kaliImage: 'nyx/kali-tools',
    targets: [{ name: 'forensics-host', image: 'nyx/lab-dfir-workstation', ip: '10.10.0.10', hostname: 'victim-ws2.lab' }],
    flags: [
      { flagId: 'flag-1', hint: 'Compare pslist et psscan pour repérer un processus dissimulé', value: 'FLAG{processus_dissimule_trouve}', points: 250 },
      { flagId: 'flag-2', hint: 'netscan révèle la connexion sortante, la mémoire du processus révèle les identifiants', value: 'FLAG{artefacts_memoire_extraits}', points: 400 },
    ],
  },
  {
    slug: 'soc-002',
    title: 'La Chasse au Malware',
    category: 'soc',
    difficulty: 'intermediate',
    estimatedTime: 45,
    totalPoints: 500,
    description: "Confirme une alerte Suricata, identifie le malware associé par son empreinte puis retrouve son infrastructure de commande et contrôle (C2).",
    kaliImage: 'nyx/kali-tools',
    targets: [{ name: 'siem', image: 'nyx/lab-soc-siem', ip: '10.10.0.10', hostname: 'siem2.lab' }],
    flags: [
      { flagId: 'flag-1', hint: 'Identifie la signature Suricata déclenchée et le fichier suspect associé', value: 'FLAG{signature_ids_identifiee}', points: 200 },
      { flagId: 'flag-2', hint: 'Le hash du fichier et le beaconing réseau révèlent l’infrastructure C2', value: 'FLAG{c2_identifie}', points: 300 },
    ],
  },
]

const CHEAT_ENTRIES = [
  { category: 'Nmap', title: 'Scan complet TCP', command: 'nmap -sS -p- -T4 -A <target>', description: 'Scan SYN complet de tous les ports avec détection de version et OS.' },
  { category: 'Nmap', title: 'Scan UDP top ports', command: 'nmap -sU --top-ports 20 <target>', description: 'Scan des 20 ports UDP les plus courants.' },
  { category: 'Nmap', title: 'Scripts vulnérabilités', command: 'nmap --script vuln <target>', description: "Exécute les scripts NSE de détection de vulnérabilités." },
  { category: 'Linux', title: 'Trouver fichiers SUID', command: "find / -perm -4000 -type f 2>/dev/null", description: 'Liste les binaires SUID, souvent utilisés pour une élévation de privilèges.' },
  { category: 'Linux', title: 'Processus en écoute', command: 'ss -tulpn', description: 'Affiche les ports en écoute et les processus associés.' },
  { category: 'Linux', title: 'Historique bash', command: 'cat ~/.bash_history', description: "Consulte l'historique de commandes de l'utilisateur courant." },
  { category: 'Metasploit', title: 'Lancer msfconsole', command: 'msfconsole -q', description: 'Démarre la console Metasploit en mode silencieux.' },
  { category: 'Metasploit', title: 'Recherche exploit', command: 'search type:exploit platform:linux <keyword>', description: "Recherche un exploit par plateforme et mot-clé." },
  { category: 'Web', title: 'Fuzzing répertoires', command: 'gobuster dir -u http://<target> -w /usr/share/wordlists/dirb/common.txt', description: 'Découvre des répertoires cachés sur un serveur web.' },
  { category: 'Web', title: 'SQLMap basique', command: 'sqlmap -u "http://<target>/page?id=1" --batch --dbs', description: "Teste une URL pour des injections SQL et liste les bases." },
  { category: 'Active Directory', title: 'Enumération BloodHound', command: 'bloodhound-python -u <user> -p <pass> -d <domain> -c All', description: "Collecte les données AD pour analyse dans BloodHound." },
  { category: 'Active Directory', title: 'Kerberoasting', command: 'GetUserSPNs.py <domain>/<user>:<pass> -dc-ip <dc_ip> -request', description: "Récupère les tickets Kerberos des comptes de service." },
  { category: 'Forensics', title: 'Image disque', command: 'dd if=/dev/sda of=image.dd bs=4M status=progress', description: "Crée une image bit-à-bit d'un disque pour analyse forensique." },
  { category: 'Forensics', title: 'Extraction de métadonnées', command: 'exiftool <file>', description: "Affiche les métadonnées EXIF d'un fichier." },
  { category: 'Cryptographie', title: 'Hash SHA-256', command: 'sha256sum <file>', description: "Calcule le hash SHA-256 d'un fichier." },
  { category: 'Cryptographie', title: 'Déchiffrement John', command: 'john --wordlist=rockyou.txt hash.txt', description: "Attaque par dictionnaire sur un fichier de hash." },
]

async function main() {
  console.log('🌱 Seeding Nyx database...')

  const redis = new Redis(process.env.REDIS_URL!, { keyPrefix: process.env.REDIS_PREFIX ?? 'nyx:', lazyConnect: true })
  await redis.connect()
  await redis.flushdb()
  await redis.quit()
  console.log('🧹 Cache Redis vidé (les IDs recréés par le seed auraient sinon été masqués par l’ancien cache).')

  await prisma.flagCapture.deleteMany()
  await prisma.labSession.deleteMany()
  await prisma.labFlag.deleteMany()
  await prisma.lab.deleteMany()
  await prisma.certification.deleteMany()
  await prisma.flashcard.deleteMany()
  await prisma.quizAttempt.deleteMany()
  await prisma.quiz.deleteMany()
  await prisma.cheatEntry.deleteMany()
  await prisma.tP.deleteMany()
  await prisma.chapter.deleteMany()
  await prisma.course.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()

  const adminPasswordHash = await bcrypt.hash('NyxMaster2026!', 10)
  await prisma.user.create({
    data: { email: 'adentrepreneur02@gmail.com', passwordHash: adminPasswordHash },
  })
  console.log('👤 Utilisateur admin créé (adentrepreneur02@gmail.com / NyxMaster2026!)')

  for (const c of COURSES) {
    const { chapters: chapterCount, ...courseData } = c
    const course = await prisma.course.create({ data: courseData })

    const titles = CHAPTER_TITLES_BY_COURSE[c.slug]
    for (let i = 1; i <= chapterCount; i++) {
      const title = titles?.[i - 1] ?? `Chapitre ${i}`
      await prisma.chapter.create({
        data: { courseId: course.id, number: i, title, status: 'not_started', lastReviewedAt: new Date() },
      })
    }
  }

  // Quizzes for every chapter of the two fully-written courses
  const QUIZZES: Record<string, Record<number, { title: string; questions: unknown[] }>> = {
    linux: {
      1: {
        title: 'Quiz — Introduction à Linux et Kali',
        questions: [
          { id: 'q1', question: "Quelle commande permet de lister les fichiers cachés d'un répertoire ?", options: ['ls -a', 'ls -h', 'ls -R', 'ls -l'], correct: 0, explanation: "L'option -a de ls affiche tous les fichiers, y compris ceux commençant par un point.", difficulty: 'easy', tags: ['linux', 'bash'] },
          { id: 'q2', question: 'Quelle distribution Linux est spécialisée en tests de pénétration ?', options: ['Ubuntu', 'Kali Linux', 'Debian', 'Fedora'], correct: 1, explanation: 'Kali Linux embarque des centaines d’outils dédiés au pentest.', difficulty: 'easy', tags: ['linux', 'kali'] },
          { id: 'q3', question: 'Quelle commande affiche les permissions d’un fichier ?', options: ['chmod', 'ls -l', 'chown', 'stat -c'], correct: 1, explanation: 'ls -l affiche notamment les permissions rwx du propriétaire, du groupe et des autres.', difficulty: 'medium', tags: ['linux', 'permissions'] },
        ],
      },
      2: {
        title: 'Quiz — Système de fichiers et permissions',
        questions: [
          { id: 'q1', question: 'Que fait le bit SUID sur un exécutable ?', options: ["Il chiffre le fichier", "Il l'exécute avec les droits de son propriétaire", "Il le rend invisible", "Il empêche sa suppression"], correct: 1, explanation: 'Le bit SUID fait exécuter le binaire avec les droits de son propriétaire, souvent root.', difficulty: 'medium', tags: ['linux', 'suid'] },
          { id: 'q2', question: 'Quelle commande trouve tous les binaires SUID du système ?', options: ['find / -perm -4000 -type f', 'ls -la /', 'chmod -R 4000 /', 'grep -r suid /'], correct: 0, explanation: 'find / -perm -4000 -type f recherche tous les fichiers avec le bit SUID activé.', difficulty: 'medium', tags: ['linux', 'suid'] },
          { id: 'q3', question: 'À quoi sert le sticky bit sur /tmp ?', options: ['Accélérer les écritures', "Empêcher un utilisateur de supprimer les fichiers d'un autre", 'Chiffrer le répertoire', "Le rendre lecture seule"], correct: 1, explanation: 'Le sticky bit restreint la suppression de fichiers à leur seul propriétaire dans un répertoire partagé.', difficulty: 'medium', tags: ['linux', 'permissions'] },
        ],
      },
      3: {
        title: 'Quiz — Gestion des processus et services',
        questions: [
          { id: 'q1', question: 'Que signifie un PPID égal à 1 pour un processus suspect ?', options: ['Le processus est root', "Le processus a été détaché de son parent d'origine", 'Le processus est arrêté', "Le processus n'existe pas"], correct: 1, explanation: 'Un PPID à 1 signifie que le processus a été "orphelinisé", souvent détaché volontairement de son terminal.', difficulty: 'medium', tags: ['linux', 'processus'] },
          { id: 'q2', question: 'Quelle commande liste les services systemd actifs ?', options: ['systemctl list-units --type=service --state=running', 'ps aux', 'service --status-all', 'top'], correct: 0, explanation: 'systemctl list-units --type=service --state=running liste les services actuellement démarrés.', difficulty: 'easy', tags: ['linux', 'systemd'] },
          { id: 'q3', question: 'Quelle commande permet de croiser processus et ports réseau ouverts ?', options: ['ip a', 'ss -tulpn', 'df -h', 'whoami'], correct: 1, explanation: 'ss -tulpn affiche les ports en écoute avec les processus associés.', difficulty: 'medium', tags: ['linux', 'réseau'] },
        ],
      },
      4: {
        title: 'Quiz — Scripting Bash pour la sécurité',
        questions: [
          { id: 'q1', question: 'Que fait `set -euo pipefail` en tête de script ?', options: ['Rien, c’est un commentaire', 'Arrête le script à la première erreur et détecte les variables non définies', 'Active le mode debug', 'Chiffre le script'], correct: 1, explanation: 'Ces options rendent le script strict : arrêt sur erreur, variable non définie, et échec de pipe détecté.', difficulty: 'medium', tags: ['bash', 'scripting'] },
          { id: 'q2', question: 'Pourquoi éviter `eval` sur une entrée utilisateur non filtrée ?', options: ["Ça ralentit le script", "Ça permet une injection de commande arbitraire", "Ce n'est pas portable", "Ça consomme trop de mémoire"], correct: 1, explanation: 'eval exécute la chaîne comme une commande shell, ouvrant la porte à une injection si elle contient une entrée non filtrée.', difficulty: 'hard', tags: ['bash', 'sécurité'] },
        ],
      },
      5: {
        title: 'Quiz — Linux réseau et durcissement',
        questions: [
          { id: 'q1', question: 'Quelle commande moderne remplace ifconfig ?', options: ['ip a', 'netstat', 'ping', 'traceroute'], correct: 0, explanation: 'ip a (suite iproute2) remplace ifconfig sur les distributions modernes.', difficulty: 'easy', tags: ['linux', 'réseau'] },
          { id: 'q2', question: 'Que signifie une politique de pare-feu "deny-by-default" ?', options: ['Tout est autorisé par défaut', 'Tout est bloqué sauf ce qui est explicitement autorisé', 'Le pare-feu est désactivé', "Seul le trafic sortant est filtré"], correct: 1, explanation: 'Deny-by-default bloque tout le trafic non explicitement autorisé — principe de base du hardening réseau.', difficulty: 'medium', tags: ['linux', 'firewall'] },
        ],
      },
    },
    'intro-cyber': {
      1: {
        title: 'Quiz — Fondamentaux de la cybersécurité',
        questions: [
          { id: 'q1', question: 'Que signifie l’acronyme CIA en cybersécurité ?', options: ['Confidentiality, Integrity, Availability', 'Central Intelligence Agency', 'Cyber Incident Analysis', 'Control, Inspect, Audit'], correct: 0, explanation: 'La triade CIA structure toute analyse de sécurité : confidentialité, intégrité, disponibilité.', difficulty: 'easy', tags: ['fondamentaux'] },
          { id: 'q2', question: 'Une attaque DDoS touche principalement quelle propriété de la triade CIA ?', options: ['Confidentialité', 'Intégrité', 'Disponibilité', 'Aucune des trois'], correct: 2, explanation: 'Un DDoS vise à rendre un service indisponible, sans nécessairement voler ni altérer de données.', difficulty: 'medium', tags: ['fondamentaux'] },
        ],
      },
      2: {
        title: 'Quiz — Cadre légal et éthique du hacking',
        questions: [
          { id: 'q1', question: 'Quelle est la seule différence fondamentale entre un pentester éthique et un cybercriminel ?', options: ['Le niveau technique', "L'autorisation écrite préalable", 'Le pays d’origine', 'Le type d’outils utilisés'], correct: 1, explanation: "Les techniques sont identiques ; seule l'autorisation écrite change la légalité de l'action.", difficulty: 'easy', tags: ['légal'] },
          { id: 'q2', question: 'Que signifie "divulgation responsable" ?', options: ['Publier immédiatement la faille', "Contacter l'organisation en privé avant toute divulgation publique", 'Vendre la faille au plus offrant', 'Ignorer la faille trouvée'], correct: 1, explanation: 'La divulgation responsable consiste à alerter discrètement l’organisation et lui laisser un délai raisonnable pour corriger.', difficulty: 'medium', tags: ['légal', 'éthique'] },
        ],
      },
      3: {
        title: "Quiz — Méthodologie d'un test d'intrusion",
        questions: [
          { id: 'q1', question: 'Quelle est la première phase du CEH ?', options: ['Scanning', 'Reconnaissance', 'Gaining Access', 'Covering Tracks'], correct: 1, explanation: 'La Reconnaissance est la première des 5 phases du référentiel CEH.', difficulty: 'easy', tags: ['méthodologie'] },
          { id: 'q2', question: 'Quelle est la différence entre reconnaissance passive et active ?', options: ['Aucune différence', 'La passive n’interagit pas directement avec la cible, contrairement à l’active', 'La passive est illégale', "L'active est toujours plus rapide"], correct: 1, explanation: 'La reconnaissance passive évite toute interaction directe avec la cible, réduisant le risque de détection.', difficulty: 'medium', tags: ['méthodologie'] },
        ],
      },
      4: {
        title: 'Quiz — Gestion des risques et normes de sécurité',
        questions: [
          { id: 'q1', question: 'Quelle est la différence entre une vulnérabilité et un risque ?', options: ['Aucune, ce sont des synonymes', 'Le risque combine probabilité d’exploitation et impact, la vulnérabilité est juste une faiblesse', 'La vulnérabilité est toujours plus grave', 'Le risque ne concerne que les données'], correct: 1, explanation: 'Le risque pondère la vulnérabilité par la probabilité d’exploitation et l’impact potentiel.', difficulty: 'medium', tags: ['risque'] },
          { id: 'q2', question: 'Combien de fonctions comporte le NIST Cybersecurity Framework ?', options: ['3', '5', '7', '10'], correct: 1, explanation: 'Le NIST CSF est structuré en 5 fonctions : Identify, Protect, Detect, Respond, Recover.', difficulty: 'easy', tags: ['normes'] },
        ],
      },
      5: {
        title: 'Quiz — Construire son parcours et choisir ses certifications',
        questions: [
          { id: 'q1', question: 'Quelle certification est généralement visée en premier dans le parcours Nyx ?', options: ['OSCP', 'CISSP', 'Security+ ou CEH', 'GCFE'], correct: 2, explanation: 'Security+ ou CEH servent de socle théorique avant de basculer vers des certifications pratiques.', difficulty: 'easy', tags: ['certifications'] },
          { id: 'q2', question: "Quelle est l'erreur de progression la plus fréquente évoquée dans ce chapitre ?", options: ['Faire trop de labs', "Viser l'OSCP trop tôt sans bases Linux/réseau solides", 'Trop lire de documentation', 'Changer de certification trop souvent'], correct: 1, explanation: "Viser l'OSCP sans prérequis solides mène à une difficulté qui vient des bases manquantes, pas du pentest lui-même.", difficulty: 'medium', tags: ['certifications'] },
        ],
      },
    },
    reseaux: {
      1: {
        title: 'Quiz — Modèle OSI et TCP/IP',
        questions: [
          { id: 'q1', question: 'Combien de couches compte le modèle OSI ?', options: ['4', '5', '7', '9'], correct: 2, explanation: 'Le modèle OSI compte 7 couches, du physique à l’application.', difficulty: 'easy', tags: ['osi'] },
          { id: 'q2', question: 'À quelle couche OSI se situe une attaque ARP spoofing ?', options: ['Couche 1 - Physique', 'Couche 2 - Liaison de données', 'Couche 3 - Réseau', 'Couche 7 - Application'], correct: 1, explanation: 'ARP opère en couche 2, entre adresses MAC.', difficulty: 'medium', tags: ['osi', 'arp'] },
        ],
      },
      2: {
        title: 'Quiz — Adressage IP et sous-réseaux',
        questions: [
          { id: 'q1', question: 'Combien d’hôtes utilisables contient un réseau en /24 ?', options: ['24', '254', '256', '512'], correct: 1, explanation: '2^8 - 2 = 254 hôtes utilisables (on soustrait l’adresse réseau et le broadcast).', difficulty: 'medium', tags: ['subnetting'] },
          { id: 'q2', question: 'Laquelle de ces plages est une plage IP privée (RFC 1918) ?', options: ['8.8.8.0/24', '192.168.0.0/16', '1.1.1.0/24', '203.0.113.0/24'], correct: 1, explanation: '192.168.0.0/16 fait partie des plages RFC 1918 non routées sur Internet public.', difficulty: 'easy', tags: ['ip'] },
        ],
      },
      3: {
        title: 'Quiz — Protocoles de la couche transport (TCP/UDP)',
        questions: [
          { id: 'q1', question: 'Quelles sont les 3 étapes du three-way handshake TCP ?', options: ['SYN, ACK, FIN', 'SYN, SYN-ACK, ACK', 'ACK, SYN, RST', 'SYN, RST, ACK'], correct: 1, explanation: 'Le handshake TCP se déroule en SYN, SYN-ACK, puis ACK.', difficulty: 'easy', tags: ['tcp'] },
          { id: 'q2', question: 'Pourquoi le scan UDP est-il plus lent que le scan TCP ?', options: ['UDP est plus récent', 'L’absence de réponse UDP est ambiguë (port ouvert ou filtré)', 'UDP nécessite un handshake', 'Nmap ne supporte pas bien UDP'], correct: 1, explanation: 'Sans réponse applicative, Nmap ne peut pas distinguer un port ouvert d’un port filtré, d’où des ré-essais.', difficulty: 'medium', tags: ['udp', 'nmap'] },
        ],
      },
      4: {
        title: 'Quiz — Protocoles applicatifs courants',
        questions: [
          { id: 'q1', question: 'Que signifie le code HTTP 403 ?', options: ['Ressource introuvable', 'Accès refusé', 'Erreur serveur', 'Redirection'], correct: 1, explanation: '403 Forbidden signifie que l’accès à la ressource est refusé.', difficulty: 'easy', tags: ['http'] },
          { id: 'q2', question: 'Quel enregistrement DNS indique le serveur de messagerie d’un domaine ?', options: ['A', 'NS', 'MX', 'TXT'], correct: 2, explanation: 'L’enregistrement MX pointe vers le ou les serveurs de messagerie du domaine.', difficulty: 'easy', tags: ['dns'] },
        ],
      },
      5: {
        title: 'Quiz — Équipements réseau et VLANs',
        questions: [
          { id: 'q1', question: 'À quelle couche OSI opère un switch classique ?', options: ['Couche 1', 'Couche 2', 'Couche 3', 'Couche 4'], correct: 1, explanation: 'Un switch opère en couche 2, sur la base des adresses MAC.', difficulty: 'easy', tags: ['switch'] },
          { id: 'q2', question: 'Qu’est-ce que le VLAN hopping ?', options: ['Un VLAN qui redémarre', 'Une attaque exploitant une mauvaise config de trunk pour sauter de VLAN', 'Un protocole de routage', 'Une panne matérielle de switch'], correct: 1, explanation: 'Le VLAN hopping exploite le double tagging 802.1Q ou une mauvaise configuration de trunk.', difficulty: 'hard', tags: ['vlan'] },
        ],
      },
      6: {
        title: 'Quiz — Pare-feu, NAT et VPN',
        questions: [
          { id: 'q1', question: 'Quelle est la différence entre un pare-feu stateless et stateful ?', options: ['Aucune différence', 'Le stateful suit l’état des connexions, le stateless filtre chaque paquet isolément', 'Le stateless est plus récent', 'Le stateful ne filtre rien'], correct: 1, explanation: 'Un pare-feu stateful suit l’état des connexions établies pour autoriser le trafic retour légitime automatiquement.', difficulty: 'medium', tags: ['firewall'] },
          { id: 'q2', question: 'Le NAT est-il à lui seul une mesure de sécurité suffisante ?', options: ['Oui, il bloque toutes les attaques', 'Non, il masque l’adressage mais ne filtre rien par lui-même', 'Oui, car il chiffre le trafic', 'Non, car il ralentit le réseau'], correct: 1, explanation: 'Le NAT traduit des adresses mais ne remplace pas un pare-feu — un port forwarding mal configuré expose directement une machine interne.', difficulty: 'medium', tags: ['nat'] },
        ],
      },
      7: {
        title: 'Quiz — Analyse de trafic avec Wireshark et tcpdump',
        questions: [
          { id: 'q1', question: 'Quelle option tcpdump sauvegarde une capture au format pcap ?', options: ['-X', '-A', '-w fichier.pcap', '-c 10'], correct: 2, explanation: 'L’option -w permet d’écrire la capture dans un fichier pcap réutilisable dans Wireshark.', difficulty: 'easy', tags: ['tcpdump'] },
          { id: 'q2', question: 'Quel filtre Wireshark isole les paquets SYN ?', options: ['http.request', 'dns', 'tcp.flags.syn == 1 && tcp.flags.ack == 0', 'ip.addr == 10.0.0.1'], correct: 2, explanation: 'Ce filtre isole les paquets marqués SYN sans ACK, correspondant au début d’une connexion TCP.', difficulty: 'medium', tags: ['wireshark'] },
        ],
      },
      8: {
        title: 'Quiz — Attaques réseau courantes et contre-mesures',
        questions: [
          { id: 'q1', question: 'Pourquoi l’ARP spoofing ne nécessite-t-il aucune vulnérabilité logicielle ?', options: ['Il exploite un bug Windows', 'ARP n’a aucun mécanisme d’authentification intégré', 'Il nécessite un accès physique', 'Il cible uniquement les serveurs Linux'], correct: 1, explanation: 'ARP ne vérifie pas l’authenticité des réponses, ce qui permet à quiconque sur le segment de répondre à la place d’une autre machine.', difficulty: 'medium', tags: ['arp'] },
          { id: 'q2', question: 'Quelle est la différence entre DoS et DDoS ?', options: ['Aucune différence', 'Le DDoS est distribué, mené depuis de multiples sources simultanément', 'Le DoS est plus dangereux', 'Le DDoS ne vise que les sites web'], correct: 1, explanation: 'Un DDoS est mené depuis de nombreuses sources distribuées, rendant le blocage plus difficile qu’un DoS depuis une seule source.', difficulty: 'easy', tags: ['ddos'] },
        ],
      },
    },
    'web-security': {
      1: {
        title: 'Quiz — Introduction à la sécurité web et l’OWASP Top 10',
        questions: [
          { id: 'q1', question: 'Pourquoi une application web ne peut-elle pas être protégée uniquement par un pare-feu réseau ?', options: ['Les pare-feu sont obsolètes', 'Elle doit rester accessible en continu sur le port 443, la sécurité se joue donc dans le code', 'Les applications web n’utilisent pas TCP', 'Un pare-feu bloque tout le trafic HTTPS'], correct: 1, explanation: 'Le port 443 doit rester ouvert pour que le service fonctionne, la sécurité doit donc être assurée par le code et la configuration applicative.', difficulty: 'medium', tags: ['owasp'] },
          { id: 'q2', question: 'Quel outil sert de proxy d’interception pour analyser le trafic HTTP ?', options: ['Nmap', 'Burp Suite', 'Hydra', 'John the Ripper'], correct: 1, explanation: 'Burp Suite s’interpose entre le navigateur et l’application pour observer et modifier chaque requête.', difficulty: 'easy', tags: ['burp'] },
        ],
      },
      2: {
        title: 'Quiz — Reconnaissance web',
        questions: [
          { id: 'q1', question: 'À quoi sert l’option -x de gobuster ?', options: ['Limiter le nombre de threads', 'Spécifier les extensions de fichiers à tester', 'Activer le mode verbeux', 'Changer le user-agent'], correct: 1, explanation: 'L’option -x teste des extensions comme php, txt, bak en plus des noms de base.', difficulty: 'easy', tags: ['gobuster'] },
          { id: 'q2', question: 'Que permet l’onglet Repeater de Burp Suite ?', options: ['Scanner automatiquement les vulnérabilités', 'Modifier et rejouer une requête HTTP à volonté', 'Générer des rapports PDF', 'Bruteforcer un mot de passe'], correct: 1, explanation: 'Repeater permet de modifier une requête interceptée et de la renvoyer autant de fois que nécessaire.', difficulty: 'easy', tags: ['burp'] },
        ],
      },
      3: {
        title: 'Quiz — Injection SQL',
        questions: [
          { id: 'q1', question: 'Quel type d’injection SQL utilise un délai de réponse pour déduire une information ?', options: ['Union-based', 'Error-based', 'Time-blind', 'Boolean-blind'], correct: 2, explanation: 'L’injection time-blind utilise une fonction comme SLEEP() pour déduire une information selon le temps de réponse.', difficulty: 'medium', tags: ['sqlmap'] },
          { id: 'q2', question: 'Quelle est la seule protection réellement fiable contre l’injection SQL ?', options: ['Un WAF', 'La validation côté client (JavaScript)', 'Les requêtes préparées (prepared statements)', 'Masquer les messages d’erreur'], correct: 2, explanation: 'Les requêtes préparées séparent structurellement le code SQL des données, empêchant toute injection.', difficulty: 'medium', tags: ['sql-injection'] },
        ],
      },
      4: {
        title: 'Quiz — Cross-Site Scripting (XSS)',
        questions: [
          { id: 'q1', question: 'Pourquoi le XSS stocké est-il considéré comme le plus dangereux ?', options: ['Il est plus facile à coder', 'Il touche automatiquement tout visiteur de la page, sans ingénierie sociale', 'Il ne fonctionne que sur Chrome', 'Il ne peut pas voler de cookies'], correct: 1, explanation: 'Contrairement au réfléchi, le stocké ne nécessite pas de piéger la victime via un lien : tout visiteur est touché.', difficulty: 'medium', tags: ['xss'] },
          { id: 'q2', question: 'À quoi sert l’attribut HttpOnly sur un cookie ?', options: ['Chiffrer le cookie', 'Le rendre inaccessible à JavaScript (document.cookie)', 'Le rendre visible uniquement en HTTPS', 'Le supprimer automatiquement après 24h'], correct: 1, explanation: 'HttpOnly empêche JavaScript d’accéder au cookie, limitant l’impact d’un XSS réussi.', difficulty: 'medium', tags: ['xss'] },
        ],
      },
      5: {
        title: 'Quiz — Authentification et gestion de sessions',
        questions: [
          { id: 'q1', question: 'Pourquoi des messages d’erreur différenciés à la connexion sont-ils un risque ?', options: ['Ils ralentissent le serveur', 'Ils permettent d’énumérer les comptes valides', 'Ils sont illisibles', 'Ils cassent le CSS de la page'], correct: 1, explanation: '"Utilisateur inconnu" vs "mot de passe incorrect" permet de distinguer les comptes existants.', difficulty: 'easy', tags: ['authentification'] },
          { id: 'q2', question: 'Un JWT est-il chiffré par défaut ?', options: ['Oui, toujours', 'Non, seulement signé — son payload est lisible en Base64', 'Oui, mais seulement le header', 'Cela dépend du navigateur'], correct: 1, explanation: 'Un JWT est signé pour garantir l’intégrité, mais son contenu reste lisible par quiconque le décode en Base64.', difficulty: 'medium', tags: ['jwt'] },
        ],
      },
      6: {
        title: 'Quiz — Contrôle d’accès cassé et IDOR',
        questions: [
          { id: 'q1', question: 'Qu’est-ce qu’une élévation de privilèges horizontale ?', options: ['Accéder aux données d’un autre utilisateur de même niveau', 'Devenir administrateur', 'Modifier son propre profil', 'Se déconnecter puis se reconnecter'], correct: 0, explanation: 'L’horizontale touche un utilisateur de même niveau de privilège, contrairement à la verticale qui vise un niveau supérieur.', difficulty: 'medium', tags: ['idor'] },
          { id: 'q2', question: 'Pourquoi masquer un bouton admin côté frontend n’est-il pas suffisant ?', options: ['Le CSS peut être désactivé', 'Le contrôle doit être vérifié côté serveur, pas seulement dans l’interface', 'Les boutons cachés ralentissent la page', 'Ce n’est jamais un problème'], correct: 1, explanation: 'Un attaquant peut appeler directement l’endpoint sans passer par l’interface — le contrôle doit être serveur.', difficulty: 'medium', tags: ['controle-acces'] },
        ],
      },
      7: {
        title: 'Quiz — SSRF, configuration et composants vulnérables',
        questions: [
          { id: 'q1', question: 'Pourquoi 169.254.169.254 est-elle une cible privilégiée en SSRF sur le cloud ?', options: ['C’est l’adresse de Google', 'Elle expose les métadonnées de l’instance cloud, parfois des identifiants IAM', 'C’est toujours bloquée', 'Elle ne fonctionne qu’en IPv6'], correct: 1, explanation: 'Sur des infrastructures comme AWS, cette adresse locale expose des métadonnées sensibles de l’instance.', difficulty: 'hard', tags: ['ssrf'] },
          { id: 'q2', question: 'À quoi sert searchsploit ?', options: ['Scanner des ports', 'Rechercher des exploits connus pour un composant/version donné', 'Bruteforcer un mot de passe', 'Intercepter du trafic HTTP'], correct: 1, explanation: 'searchsploit recherche dans une base locale d’exploits publics correspondant à un logiciel et une version.', difficulty: 'easy', tags: ['cve'] },
        ],
      },
      8: {
        title: 'Quiz — Méthodologie de test web et rédaction de rapport',
        questions: [
          { id: 'q1', question: 'Que mesure le score CVSS ?', options: ['Le temps nécessaire pour exploiter une faille', 'La sévérité d’une vulnérabilité selon des critères objectifs', 'Le nombre de lignes de code vulnérables', 'Le coût de la correction'], correct: 1, explanation: 'Le CVSS attribue un score de 0 à 10 selon le vecteur d’attaque, la complexité, les privilèges requis et l’impact.', difficulty: 'easy', tags: ['cvss'] },
          { id: 'q2', question: 'Pourquoi une recommandation de correction vague est-elle problématique dans un rapport ?', options: ['Elle prend trop de place', 'Elle n’est pas actionnable par l’équipe de développement', 'Elle doit être en anglais', 'Ce n’est jamais un problème'], correct: 1, explanation: 'Une recommandation doit être spécifique et technique pour être directement exploitable par les développeurs.', difficulty: 'medium', tags: ['rapport'] },
        ],
      },
    },
    'redaction-rapports': {
      1: {
        title: 'Quiz — Pourquoi documenter',
        questions: [
          { id: 'q1', question: 'Qu’est-ce qui constitue le véritable livrable d’une mission de sécurité ?', options: ['L’exploit technique obtenu', 'Le rapport, qui rend la faille compréhensible et corrigible', 'Le nombre d’heures passées', 'La liste des outils utilisés'], correct: 1, explanation: 'Un exploit non documenté ne permet ni de comprendre ni de corriger la faille — c’est le rapport qui donne sa valeur à la mission.', difficulty: 'easy', tags: ['redaction'] },
          { id: 'q2', question: 'Quelle est la différence entre documentation "vivante" et "figée" ?', options: ['Aucune différence réelle', 'La vivante est mise à jour en continu (runbooks), la figée ne change plus une fois livrée (rapports)', 'La figée est toujours plus longue', 'La vivante ne concerne que le SOC'], correct: 1, explanation: 'Un rapport de pentest est figé une fois livré, tandis qu’un runbook est mis à jour en continu.', difficulty: 'easy', tags: ['documentation'] },
        ],
      },
      2: {
        title: 'Quiz — Structurer un rapport de pentest',
        questions: [
          { id: 'q1', question: 'Pourquoi vaut-il mieux rédiger la synthèse exécutive en dernier ?', options: ['Par tradition uniquement', 'Pour qu’elle reflète fidèlement l’ensemble des findings, y compris ceux découverts tardivement', 'Parce qu’elle est la plus courte à écrire', 'Elle n’a pas besoin d’être précise'], correct: 1, explanation: 'Rédigée en dernier, la synthèse exécutive peut intégrer l’intégralité des résultats de la mission.', difficulty: 'medium', tags: ['synthese'] },
          { id: 'q2', question: 'Où doit-on placer la sortie brute complète d’un outil comme sqlmap ?', options: ['Dans la synthèse exécutive', 'Dans le corps du rapport, telle quelle', 'En annexe technique', 'Elle ne doit jamais figurer dans le rapport'], correct: 2, explanation: 'Les sorties brutes volumineuses vont en annexe technique, pour ne pas alourdir le corps du rapport.', difficulty: 'easy', tags: ['structure'] },
        ],
      },
      3: {
        title: 'Quiz — Preuves de concept et CVSS',
        questions: [
          { id: 'q1', question: 'Qu’est-ce qui distingue une bonne preuve de concept d’une simple affirmation ?', options: ['La longueur du texte', 'Le fait qu’elle soit reproductible telle quelle par un tiers', 'L’utilisation de mots techniques', 'La présence d’une capture d’écran uniquement'], correct: 1, explanation: 'Une PoC doit permettre à quelqu’un d’autre de reproduire exactement la faille observée.', difficulty: 'medium', tags: ['poc'] },
          { id: 'q2', question: 'Pourquoi ne faut-il jamais donner un score CVSS sans son vecteur complet ?', options: ['Le vecteur est optionnel', 'Sans le vecteur, le score ne peut pas être vérifié ni justifié', 'Le vecteur ralentit la lecture', 'Le client ne le lit jamais'], correct: 1, explanation: 'Le vecteur CVSS justifie et rend vérifiable le score attribué à une vulnérabilité.', difficulty: 'medium', tags: ['cvss'] },
        ],
      },
      4: {
        title: 'Quiz — Rapports d’incident et documentation SOC',
        questions: [
          { id: 'q1', question: 'Quelle est la différence entre confinement et remédiation dans un rapport d’incident ?', options: ['Aucune différence', 'Le confinement arrête la propagation immédiate, la remédiation corrige durablement la cause', 'La remédiation précède toujours le confinement', 'Ce sont des synonymes'], correct: 1, explanation: 'Le confinement est une action immédiate, la remédiation une correction structurelle à moyen terme.', difficulty: 'medium', tags: ['incident'] },
          { id: 'q2', question: 'En quoi un runbook diffère-t-il d’un rapport d’incident ?', options: ['Un runbook est écrit après l’incident comme le rapport', 'Un runbook est une procédure prescriptive écrite avant la crise, mise à jour en continu', 'Un rapport est plus court qu’un runbook', 'Il n’y a pas de différence'], correct: 1, explanation: 'Le runbook prescrit des actions à suivre en temps réel, contrairement au rapport qui décrit ce qui s’est passé.', difficulty: 'easy', tags: ['runbook'] },
        ],
      },
      5: {
        title: 'Quiz — Outils, gabarits et présentation',
        questions: [
          { id: 'q1', question: 'Quel est l’avantage de rédiger un rapport en Markdown avant de l’exporter en PDF ?', options: ['C’est plus joli automatiquement', 'Le rapport peut être versionné dans Git comme du code', 'Markdown est obligatoire pour l’OSCP', 'Cela évite d’avoir une synthèse exécutive'], correct: 1, explanation: 'Le Markdown, versionnable via Git, facilite le suivi des révisions successives d’un rapport.', difficulty: 'easy', tags: ['outils'] },
          { id: 'q2', question: 'Comment doit s’ouvrir une restitution orale devant un public mixte technique/direction ?', options: ['Par le détail technique de la faille la plus complexe', 'Par le niveau de risque global, avant les preuves techniques', 'Par la liste des outils utilisés', 'Par une sortie brute de terminal'], correct: 1, explanation: 'L’auditoire a besoin du verdict global avant le détail technique, en particulier la partie direction.', difficulty: 'medium', tags: ['presentation'] },
        ],
      },
    },
    'droit-cybersecurite': {
      1: {
        title: 'Quiz — Cadre légal du hacking éthique',
        questions: [
          { id: 'q1', question: 'Qu’est-ce qui distingue juridiquement un pentester d’un attaquant utilisant les mêmes outils ?', options: ['Le prix des outils utilisés', 'L’autorisation écrite préalable et le respect du périmètre convenu', 'Le niveau technique', 'La nationalité de l’attaquant'], correct: 1, explanation: 'Les outils sont identiques des deux côtés — seule l’autorisation écrite fait la différence légale.', difficulty: 'easy', tags: ['legal'] },
          { id: 'q2', question: 'Que doit faire un pentester qui découvre un accès à un système hors périmètre ?', options: ['L’explorer discrètement puisqu’il l’a trouvé par hasard', 'Documenter la découverte et arrêter immédiatement, puis en informer le client', 'Continuer le test normalement', 'Le signaler uniquement à la fin de la mission'], correct: 1, explanation: 'Le "scope creep" doit être stoppé immédiatement pour éviter une intrusion non autorisée sur un système non couvert.', difficulty: 'medium', tags: ['scope'] },
        ],
      },
      2: {
        title: 'Quiz — RGPD et protection des données',
        questions: [
          { id: 'q1', question: 'Quel est le délai maximal de notification d’une violation de données à l’autorité de contrôle ?', options: ['7 jours', '72 heures après la prise de connaissance', '30 jours', 'Aucun délai n’est imposé'], correct: 1, explanation: 'Le RGPD impose une notification sous 72 heures après la prise de connaissance de la violation, sauf risque jugé peu probable.', difficulty: 'medium', tags: ['rgpd'] },
          { id: 'q2', question: 'Un ransomware qui rend des données indisponibles sans les exfiltrer constitue-t-il une violation de données RGPD ?', options: ['Non, seul le vol de données compte', 'Oui, car la violation couvre aussi l’atteinte à la disponibilité', 'Seulement si les données sont personnelles ET volées', 'Non, sauf demande explicite de la CNIL'], correct: 1, explanation: 'Une violation de données couvre toute atteinte à la confidentialité, l’intégrité OU la disponibilité.', difficulty: 'medium', tags: ['violation'] },
        ],
      },
      3: {
        title: 'Quiz — Normes et référentiels',
        questions: [
          { id: 'q1', question: 'Que certifie réellement ISO 27001 ?', options: ['L’absence totale de vulnérabilités techniques', 'L’existence d’un système de management de la sécurité (SMSI) structuré', 'La conformité au RGPD', 'Un niveau de chiffrement minimal'], correct: 1, explanation: 'ISO 27001 certifie un processus de gestion des risques (SMSI), pas l’absence de failles techniques.', difficulty: 'medium', tags: ['iso27001'] },
          { id: 'q2', question: 'Pourquoi le PCI-DSS est-il contraignant bien qu’il ne soit pas un texte de loi ?', options: ['Il est imposé par un tribunal', 'Il est imposé contractuellement par les réseaux de cartes bancaires, avec des sanctions business', 'Il remplace le RGPD', 'Il ne concerne que les banques'], correct: 1, explanation: 'Le non-respect du PCI-DSS expose à des sanctions contractuelles sévères des réseaux de cartes.', difficulty: 'medium', tags: ['pci-dss'] },
        ],
      },
      4: {
        title: 'Quiz — Contrats, NDA et responsabilité',
        questions: [
          { id: 'q1', question: 'Que protège une clause d’indemnisation ("hold harmless") ?', options: ['La confidentialité des données du client', 'Le prestataire contre des poursuites pour des actions menées dans le périmètre autorisé', 'Le client contre une facture excessive', 'Rien de spécifique'], correct: 1, explanation: 'Cette clause protège le prestataire si un incident accidentel survient pendant un test pourtant autorisé.', difficulty: 'medium', tags: ['contrat'] },
          { id: 'q2', question: 'Un contrat peut-il exonérer un pentester de sa responsabilité pénale en cas de dépassement de périmètre ?', options: ['Oui, si le contrat le prévoit explicitement', 'Non, la responsabilité pénale ne peut jamais être limitée par contrat', 'Oui, mais seulement pour une faute légère', 'Cela dépend du montant du contrat'], correct: 1, explanation: 'Seule l’autorisation écrite et le respect strict du périmètre protègent réellement sur le plan pénal.', difficulty: 'hard', tags: ['responsabilite'] },
        ],
      },
      5: {
        title: 'Quiz — Preuve numérique et droit de la preuve',
        questions: [
          { id: 'q1', question: 'À quoi sert le calcul d’une empreinte hash lors de la collecte d’une preuve numérique ?', options: ['À accélérer le transfert du fichier', 'À prouver que la preuve n’a pas été altérée depuis sa collecte', 'À chiffrer la preuve', 'À identifier l’auteur de l’incident'], correct: 1, explanation: 'Le hash permet de vérifier à tout moment que la preuve est restée intègre depuis sa collecte.', difficulty: 'medium', tags: ['forensics'] },
          { id: 'q2', question: 'Pourquoi un analyste DFIR ne travaille-t-il jamais directement sur le disque original ?', options: ['Par manque de temps', 'Car même une simple consultation peut modifier des métadonnées et rompre l’intégrité de la preuve', 'Le disque original est toujours chiffré', 'Ce n’est pas obligatoire, juste une préférence'], correct: 1, explanation: 'Travailler sur une copie forensique évite toute altération accidentelle de l’original.', difficulty: 'medium', tags: ['chain-of-custody'] },
        ],
      },
      6: {
        title: 'Quiz — Réglementations sectorielles et internationales',
        questions: [
          { id: 'q1', question: 'Quelle nouveauté majeure NIS2 introduit-il concernant les dirigeants d’entreprise ?', options: ['Aucune obligation nouvelle', 'Leur responsabilité personnelle peut être engagée en cas de défaut de gestion des risques', 'Ils sont exemptés de toute responsabilité', 'NIS2 ne concerne que les employés techniques'], correct: 1, explanation: 'NIS2 engage la responsabilité personnelle des organes de direction, au-delà de la seule entreprise.', difficulty: 'hard', tags: ['nis2'] },
          { id: 'q2', question: 'Que signifie TLPT dans le cadre de DORA ?', options: ['Un simple scan de vulnérabilités automatisé', 'Un test de pénétration basé sur la menace, simulant une attaque avancée ciblée', 'Un audit de conformité RGPD', 'Un test de charge réseau'], correct: 1, explanation: 'Le Threat-Led Penetration Testing simule une attaque avancée inspirée de groupes APT réels, encadrée par TIBER-EU.', difficulty: 'hard', tags: ['dora'] },
        ],
      },
    },
    'administration-si': {
      1: {
        title: "Quiz — Architecture d'un système d'information d'entreprise",
        questions: [
          { id: 'q1', question: 'Pourquoi une DMZ est-elle isolée du reste du réseau interne ?', options: ['Pour des raisons esthétiques uniquement', 'Pour limiter l’accès d’un attaquant ayant compromis un service public exposé', 'Parce qu’elle ne contient aucun serveur', 'Elle n’est jamais isolée en pratique'], correct: 1, explanation: 'La DMZ héberge les services exposés à Internet ; l’isoler limite la propagation en cas de compromission.', difficulty: 'easy', tags: ['dmz'] },
          { id: 'q2', question: 'Pourquoi la sécurité et l’administration système sont-elles difficiles à séparer en pratique ?', options: ['Elles sont toujours confiées à des équipes totalement indépendantes', 'La majorité des vulnérabilités exploitées relèvent de décisions d’administration quotidienne', 'La sécurité ne concerne jamais les serveurs', 'Ce sont deux métiers sans aucun lien'], correct: 1, explanation: 'Mots de passe par défaut, correctifs non appliqués, comptes surprivilégiés relèvent de l’administration quotidienne.', difficulty: 'medium', tags: ['securite'] },
        ],
      },
      2: {
        title: 'Quiz — Windows Server et Active Directory',
        questions: [
          { id: 'q1', question: 'Pourquoi une entreprise dispose-t-elle presque toujours de plusieurs contrôleurs de domaine ?', options: ['Pour respecter un quota Microsoft', 'Pour garantir la disponibilité de l’authentification si l’un d’eux tombe en panne', 'Un seul contrôleur est toujours interdit techniquement', 'Pour répartir uniquement la charge réseau'], correct: 1, explanation: 'La redondance des contrôleurs de domaine garantit la continuité de l’authentification Kerberos.', difficulty: 'easy', tags: ['active-directory'] },
          { id: 'q2', question: 'Pourquoi une GPO mal sécurisée peut-elle devenir un vecteur d’attaque majeur ?', options: ['Les GPO ne s’appliquent qu’à un seul poste', 'Un attaquant y ayant accès en écriture peut y injecter un script exécuté sur tout le domaine', 'Les GPO ne concernent que l’affichage', 'Ce risque n’existe pas en pratique'], correct: 1, explanation: 'Une GPO appliquée à l’ensemble du domaine et compromise permet une exécution de code à grande échelle.', difficulty: 'hard', tags: ['gpo'] },
        ],
      },
      3: {
        title: 'Quiz — Administration Linux en production',
        questions: [
          { id: 'q1', question: 'À quoi sert `journalctl -u <service> -f` ?', options: ['À redémarrer le service', 'À suivre en temps réel les logs d’un service géré par systemd', 'À désinstaller un service', 'À changer les permissions d’un fichier'], correct: 1, explanation: 'Le mode "follow" de journalctl affiche les nouveaux logs en continu, comme un tail -f.', difficulty: 'easy', tags: ['systemd'] },
          { id: 'q2', question: 'Pourquoi ni la précipitation ni l’excès de prudence ne conviennent-ils face à un correctif de sécurité critique ?', options: ['Il faut toujours attendre la prochaine version majeure', 'Un déploiement précipité peut casser la production, un report indéfini expose à une faille connue exploitée', 'Les correctifs de sécurité ne cassent jamais rien', 'Il faut toujours appliquer immédiatement sans test'], correct: 1, explanation: 'Un équilibre entre test en pré-production et rapidité de déploiement est nécessaire.', difficulty: 'medium', tags: ['maintenance'] },
        ],
      },
      4: {
        title: 'Quiz — Virtualisation et conteneurs',
        questions: [
          { id: 'q1', question: 'Pourquoi un échappement de conteneur (container escape) est-il particulièrement dangereux ?', options: ['Il n’a aucun impact réel', 'Les conteneurs partagent le noyau de l’hôte, un échappement peut donner accès direct à l’hôte', 'Il ne concerne que Windows', 'Il est impossible techniquement'], correct: 1, explanation: 'Le partage du noyau rend l’isolation plus fragile qu’une VM classique.', difficulty: 'medium', tags: ['docker'] },
          { id: 'q2', question: 'Que risque-t-on à monter le socket Docker de l’hôte dans un conteneur non maîtrisé ?', options: ['Rien de particulier', 'Un attaquant peut créer un conteneur privilégié montant le disque de l’hôte, équivalent à un accès root', 'Le conteneur devient plus lent', 'Cela améliore la sécurité'], correct: 1, explanation: 'L’accès au socket Docker équivaut souvent à un accès root sur la machine hôte.', difficulty: 'hard', tags: ['docker-socket'] },
        ],
      },
      5: {
        title: 'Quiz — Sauvegarde, PRA et PCA',
        questions: [
          { id: 'q1', question: 'Que signifie la règle 3-2-1 en sauvegarde ?', options: ['3 sauvegardes par jour', '3 copies, 2 supports différents, 1 copie hors site', '3 supports, 2 copies, 1 sauvegarde par an', 'Aucune règle standard n’existe'], correct: 1, explanation: 'La règle 3-2-1 structure une stratégie de sauvegarde robuste face à différents scénarios de sinistre.', difficulty: 'easy', tags: ['sauvegarde'] },
          { id: 'q2', question: 'Quelle est la différence entre PRA et PCA ?', options: ['Aucune différence', 'Le PRA reconstruit l’IT après sinistre, le PCA maintient l’activité métier pendant le sinistre', 'Le PCA ne concerne que l’informatique', 'Le PRA est toujours plus rapide que le PCA'], correct: 1, explanation: 'Les deux plans sont complémentaires et doivent être pensés ensemble.', difficulty: 'medium', tags: ['pra-pca'] },
        ],
      },
      6: {
        title: 'Quiz — Supervision et monitoring',
        questions: [
          { id: 'q1', question: 'Quelle est la différence de rôle entre métriques et logs ?', options: ['Aucune différence', 'Les métriques signalent qu’un problème existe, les logs expliquent pourquoi', 'Les logs ne servent qu’à la facturation', 'Les métriques remplacent totalement les logs'], correct: 1, explanation: 'Les métriques détectent une tendance anormale, les logs permettent le diagnostic détaillé.', difficulty: 'easy', tags: ['observabilite'] },
          { id: 'q2', question: 'Pourquoi la fatigue d’alerte est-elle dangereuse du point de vue sécurité ?', options: ['Elle n’a aucun impact réel', 'Trop d’alertes non critiques conduisent à ignorer les notifications, y compris les incidents réels', 'Elle ralentit uniquement les serveurs', 'Elle ne concerne que les grandes entreprises'], correct: 1, explanation: 'Un excès d’alertes non actionnables fait perdre leur crédibilité aux notifications critiques.', difficulty: 'medium', tags: ['alerting'] },
        ],
      },
      7: {
        title: "Quiz — Gestion des identités et des accès (IAM)",
        questions: [
          { id: 'q1', question: 'Qu’apporte le RBAC par rapport à une gestion individuelle des droits ?', options: ['Rien de particulier', 'Il structure les accès par rôle métier, ce qui facilite les audits de conformité', 'Il supprime le besoin d’authentification', 'Il ne concerne que les administrateurs'], correct: 1, explanation: 'Auditer des rôles est bien plus simple qu’auditer des droits individuels accumulés au fil du temps.', difficulty: 'medium', tags: ['rbac'] },
          { id: 'q2', question: 'Pourquoi le MFA par SMS est-il considéré comme moins robuste que le TOTP ou une clé FIDO2 ?', options: ['Le SMS est toujours plus rapide donc plus sûr', 'Il reste vulnérable au SIM swapping', 'Le SMS ne fonctionne pas à l’étranger', 'Il n’y a aucune différence de robustesse'], correct: 1, explanation: 'Un attaquant peut transférer le numéro de la victime vers sa propre carte SIM pour intercepter les codes.', difficulty: 'medium', tags: ['mfa'] },
        ],
      },
      8: {
        title: 'Quiz — Durcissement et maintenance en conditions réelles',
        questions: [
          { id: 'q1', question: 'Pourquoi désinstaller un service non utilisé réduit-il le risque, même sans vulnérabilité connue ?', options: ['Cela n’a aucun effet réel', 'Un service qui ne tourne pas ne peut pas être exploité, ce qui réduit la surface d’attaque', 'Cela ralentit le serveur', 'Ce n’est utile que pour la performance'], correct: 1, explanation: 'Réduire la surface d’attaque est un principe fondamental du durcissement système.', difficulty: 'easy', tags: ['durcissement'] },
          { id: 'q2', question: 'Que signifie "isoler" un système legacy plutôt que l’ignorer ?', options: ['Le débrancher définitivement', 'Le segmenter réseau, renforcer sa surveillance et planifier sa migration', 'Ne rien faire de particulier', 'Lui donner plus de droits pour compenser'], correct: 1, explanation: 'Des mesures compensatoires limitent le risque en attendant remplacement ou migration.', difficulty: 'medium', tags: ['legacy'] },
        ],
      },
    },
    'active-directory': {
      1: {
        title: 'Quiz — Introduction à Active Directory et Windows Server',
        questions: [
          { id: 'q1', question: 'Quelle est la différence entre une forêt et un domaine dans Active Directory ?', options: ['Aucune différence', 'La forêt est le plus haut niveau, pouvant contenir plusieurs domaines', 'Un domaine contient toujours plusieurs forêts', 'Ce sont des synonymes stricts'], correct: 1, explanation: 'La forêt est le conteneur logique le plus large, pouvant regrouper plusieurs domaines liés par des trusts.', difficulty: 'easy', tags: ['active-directory'] },
          { id: 'q2', question: 'Pourquoi un attaquant cherche-t-il généralement un "chemin d’attaque" plutôt qu’une faille isolée sur le DC ?', options: ['Les DC sont toujours invulnérables', 'L’enchaînement de mauvaises configurations est bien plus fréquent qu’une faille exploitable directement', 'C’est plus rapide techniquement', 'Ce n’est jamais le cas en pratique'], correct: 1, explanation: 'La majorité des compromissions AD résultent d’un enchaînement de configurations, pas d’une faille unique.', difficulty: 'medium', tags: ['methodologie'] },
        ],
      },
      2: {
        title: 'Quiz — Énumération AD',
        questions: [
          { id: 'q1', question: 'Que révèle un graphe BloodHound qu’une simple liste d’utilisateurs ne révèle pas ?', options: ['Rien de plus', 'Les chemins d’attaque résultant de la combinaison de droits et d’appartenances à des groupes', 'Uniquement les mots de passe', 'Le nombre total d’utilisateurs'], correct: 1, explanation: 'BloodHound modélise les relations entre objets pour révéler des chemins d’attaque invisibles isolément.', difficulty: 'medium', tags: ['bloodhound'] },
          { id: 'q2', question: 'Pourquoi un compte de service avec un SPN est-il une cible d’énumération intéressante ?', options: ['Il n’a jamais de mot de passe', 'Il est potentiellement Kerberoastable', 'Il n’existe que sur les DC', 'Il ne peut pas être ciblé par une attaque'], correct: 1, explanation: 'Les comptes avec SPN sont les cibles directes du Kerberoasting, vu au chapitre suivant.', difficulty: 'easy', tags: ['spn'] },
        ],
      },
      3: {
        title: 'Quiz — Kerberos, Kerberoasting et AS-REP Roasting',
        questions: [
          { id: 'q1', question: 'Pourquoi n’importe quel utilisateur authentifié peut-il réaliser un Kerberoasting ?', options: ['Il faut être administrateur du domaine', 'Le TGS est chiffré avec le hash du compte de service, extractible par tout utilisateur qui le demande', 'Cette attaque est impossible en pratique', 'Il faut d’abord compromettre le DC'], correct: 1, explanation: 'Tout utilisateur authentifié peut demander un TGS pour un compte avec SPN et en extraire le hash.', difficulty: 'medium', tags: ['kerberoasting'] },
          { id: 'q2', question: 'Quelle configuration rend un compte vulnérable à l’AS-REP Roasting ?', options: ['Un mot de passe trop long', 'La pré-authentification Kerberos désactivée', 'L’appartenance à un groupe de sécurité', 'Un SPN mal configuré'], correct: 1, explanation: 'Sans pré-authentification, une réponse AS-REP chiffrée avec le hash du compte peut être obtenue sans authentification préalable.', difficulty: 'medium', tags: ['as-rep-roasting'] },
        ],
      },
      4: {
        title: 'Quiz — Mouvement latéral',
        questions: [
          { id: 'q1', question: 'Pourquoi le Pass-the-Hash ne nécessite-t-il pas de connaître le mot de passe en clair ?', options: ['Windows accepte directement un hash NTLM comme preuve d’authentification', 'Le mot de passe est toujours visible en clair', 'Cette technique ne fonctionne pas sous Windows', 'Il faut toujours craquer le hash au préalable'], correct: 0, explanation: 'Windows accepte le hash NTLM directement comme preuve d’authentification, sans déchiffrement préalable.', difficulty: 'medium', tags: ['pass-the-hash'] },
          { id: 'q2', question: 'Comment LAPS neutralise-t-il le Pass-the-Hash à grande échelle ?', options: ['En désactivant NTLM', 'En générant un mot de passe administrateur local unique par machine', 'En chiffrant tous les disques', 'En bloquant le protocole Kerberos'], correct: 1, explanation: 'Un mot de passe unique par machine empêche la réutilisation d’un même hash sur tout le parc.', difficulty: 'medium', tags: ['laps'] },
        ],
      },
      5: {
        title: 'Quiz — Élévation de privilèges Windows locale',
        questions: [
          { id: 'q1', question: 'Pourquoi un chemin de service non quoté avec des espaces peut-il être exploité ?', options: ['Windows peut interpréter un chemin intermédiaire comme l’exécutable à lancer', 'Cela n’a aucun impact', 'Seul Linux est concerné par ce problème', 'Cela concerne uniquement les services réseau'], correct: 0, explanation: 'Windows peut tenter d’exécuter un binaire situé à un chemin intermédiaire si celui-ci n’est pas quoté.', difficulty: 'medium', tags: ['unquoted-path'] },
          { id: 'q2', question: 'Pourquoi faut-il vérifier manuellement les résultats de WinPEAS avant exploitation ?', options: ['WinPEAS ne fonctionne jamais correctement', 'L’outil produit des faux positifs qu’il faut valider', 'Ce n’est jamais nécessaire', 'WinPEAS exploite automatiquement les failles trouvées'], correct: 1, explanation: 'Un vecteur signalé n’est pas automatiquement exploitable — une vérification manuelle reste indispensable.', difficulty: 'easy', tags: ['winpeas'] },
        ],
      },
      6: {
        title: 'Quiz — Abus de délégation et de GPO',
        questions: [
          { id: 'q1', question: 'Pourquoi la délégation Kerberos non contrainte est-elle la plus dangereuse ?', options: ['Elle expose le TGT de tout utilisateur se connectant au service, y compris un admin', 'Elle ne concerne que les serveurs web', 'Elle est toujours désactivée par défaut', 'Elle ne pose aucun risque réel'], correct: 0, explanation: 'Le TGT d’un utilisateur se connectant reste en cache sur le service, récupérable en cas de compromission.', difficulty: 'hard', tags: ['delegation'] },
          { id: 'q2', question: 'Que permet le droit ACL "GenericAll" sur un objet utilisateur ?', options: ['Uniquement la lecture de l’objet', 'Un contrôle total de l’objet, y compris réinitialiser son mot de passe', 'Rien sans droits administrateur du domaine', 'Seulement la suppression de l’objet'], correct: 1, explanation: 'GenericAll donne un contrôle total sur l’objet ciblé, incluant la réinitialisation du mot de passe.', difficulty: 'medium', tags: ['acl'] },
        ],
      },
      7: {
        title: 'Quiz — Persistence, Golden Ticket et DCSync',
        questions: [
          { id: 'q1', question: 'Pourquoi faut-il changer le mot de passe krbtgt deux fois pour invalider un Golden Ticket ?', options: ['Une seule fois suffit toujours', 'AD conserve l’ancien ET le nouveau hash, donc un seul changement ne suffit pas', 'Le krbtgt ne peut jamais être changé', 'Ce n’est pas nécessaire si on change les mots de passe utilisateurs'], correct: 1, explanation: 'AD garde une génération précédente du hash krbtgt valide, d’où la nécessité d’un double changement.', difficulty: 'hard', tags: ['golden-ticket'] },
          { id: 'q2', question: 'Quelle condition permet une attaque DCSync ?', options: ['Un accès RDP au contrôleur de domaine', 'Un compte disposant des droits de réplication (Replicating Directory Changes)', 'La connaissance du mot de passe krbtgt', 'Un accès physique au serveur'], correct: 1, explanation: 'DCSync exploite le protocole de réplication AD, nécessitant les droits de réplication sur le compte utilisé.', difficulty: 'hard', tags: ['dcsync'] },
        ],
      },
      8: {
        title: "Quiz — Méthodologie d'audit AD et modèle de tiering",
        questions: [
          { id: 'q1', question: 'Quelle règle du modèle de tiering, violée, permet directement le Pass-the-Hash entre niveaux ?', options: ['Un compte Tier 0 doit toujours être utilisé partout', 'Un compte à privilèges d’un niveau ne doit jamais se connecter à une machine d’un niveau inférieur', 'Il n’existe aucune règle de ce type', 'Les Tier 2 doivent administrer les Tier 0'], correct: 1, explanation: 'La violation de cette règle expose les identifiants d’un niveau supérieur sur une machine moins sécurisée.', difficulty: 'medium', tags: ['tiering'] },
          { id: 'q2', question: 'Pourquoi le déploiement complet du modèle de tiering est-il souvent plus difficile que LAPS ?', options: ['Le tiering est toujours gratuit et instantané', 'Il implique de revoir des habitudes d’administration ancrées depuis des années', 'LAPS est plus complexe techniquement', 'Le tiering ne nécessite aucun changement organisationnel'], correct: 1, explanation: 'Le tiering est structurant mais organisationnellement coûteux, contrairement à un déploiement technique comme LAPS.', difficulty: 'medium', tags: ['durcissement'] },
        ],
      },
    },
    dfir: {
      1: {
        title: "Quiz — Introduction au DFIR et méthodologie",
        questions: [
          { id: 'q1', question: 'Pourquoi redémarrer précipitamment un serveur compromis peut-il nuire à une investigation ?', options: ['Cela n’a aucun impact', 'Cela détruit potentiellement la mémoire vive contenant des preuves critiques', 'Le redémarrage supprime toujours les logs', 'Les serveurs ne peuvent pas être redémarrés'], correct: 1, explanation: 'La mémoire vive, source de preuve précieuse, disparaît au redémarrage.', difficulty: 'medium', tags: ['methodologie'] },
          { id: 'q2', question: 'Pourquoi la mémoire vive doit-elle être collectée avant le disque dur ?', options: ['Elle est plus facile à analyser', 'Elle est plus volatile et disparaît la première', 'Le disque n’est jamais utile en investigation', 'Il n’y a pas d’ordre particulier à respecter'], correct: 1, explanation: 'L’ordre de volatilité impose de collecter d’abord les preuves les plus fragiles.', difficulty: 'easy', tags: ['volatilite'] },
        ],
      },
      2: {
        title: 'Quiz — Acquisition de preuves numériques',
        questions: [
          { id: 'q1', question: 'Pourquoi une acquisition physique permet-elle de récupérer des fichiers supprimés ?', options: ['Elle copie tout le support, y compris l’espace non alloué', 'Elle est toujours plus rapide', 'Elle ignore les fichiers actifs', 'Elle ne concerne que les fichiers systèmes'], correct: 0, explanation: 'L’espace non alloué contient souvent des fragments de fichiers supprimés récupérables.', difficulty: 'medium', tags: ['acquisition'] },
          { id: 'q2', question: 'À quoi sert un write-blocker lors d’une acquisition ?', options: ['À accélérer la copie', 'À empêcher toute écriture accidentelle sur le support original', 'À chiffrer automatiquement les données', 'À compresser l’image obtenue'], correct: 1, explanation: 'Le write-blocker préserve l’intégrité du support original pendant sa copie.', difficulty: 'easy', tags: ['write-blocker'] },
        ],
      },
      3: {
        title: 'Quiz — Analyse de la mémoire vive avec Volatility',
        questions: [
          { id: 'q1', question: 'Pourquoi un malware fileless échappe-t-il à une analyse disque traditionnelle ?', options: ['Il s’exécute entièrement en mémoire sans jamais écrire de fichier sur le disque', 'Il est toujours détecté par l’antivirus', 'Il ne peut infecter que les serveurs Linux', 'Il n’existe pas en pratique'], correct: 0, explanation: 'Un malware fileless n’écrit rien sur le disque, le rendant invisible à une analyse disque seule.', difficulty: 'medium', tags: ['fileless'] },
          { id: 'q2', question: 'Que révèle le plugin Volatility "malfind" ?', options: ['La liste des utilisateurs du système', 'Des injections de code dans des processus légitimes', 'Les fichiers récemment supprimés', 'Les connexions USB historiques'], correct: 1, explanation: 'Malfind recherche des zones mémoire suspectes révélant des injections de code.', difficulty: 'medium', tags: ['volatility'] },
        ],
      },
      4: {
        title: 'Quiz — Analyse forensique de disque',
        questions: [
          { id: 'q1', question: 'Pourquoi un fichier Prefetch peut-il révéler l’exécution d’un outil déjà supprimé ?', options: ['Le Prefetch persiste indépendamment du fichier exécutable original', 'Le Prefetch est toujours supprimé avec le programme', 'Il ne concerne que les fichiers systèmes', 'Windows ne crée jamais de Prefetch'], correct: 0, explanation: 'Le Prefetch reste présent même après suppression du programme, avec un horodatage précis.', difficulty: 'medium', tags: ['prefetch'] },
          { id: 'q2', question: 'Pourquoi une timeline basée uniquement sur les métadonnées de fichiers peut-elle induire en erreur ?', options: ['Les métadonnées sont toujours exactes', 'Elles peuvent être manipulées via le timestomping', 'Les fichiers n’ont jamais de métadonnées fiables', 'Ce risque n’existe pas en pratique'], correct: 1, explanation: 'Un attaquant expérimenté peut manipuler les dates MACB pour masquer la réalité chronologique.', difficulty: 'hard', tags: ['timestomping'] },
        ],
      },
      5: {
        title: 'Quiz — Analyse des logs et reconstruction de timeline',
        questions: [
          { id: 'q1', question: 'Pourquoi synchroniser les fuseaux horaires est-il indispensable avant de corréler des logs multi-sources ?', options: ['Ce n’est jamais nécessaire', 'Sans cela, la chronologie reconstruite peut être totalement faussée', 'Les logs n’ont jamais d’horodatage', 'Seul le fuseau UTC existe dans les logs Windows'], correct: 1, explanation: 'Des fuseaux différents non convertis peuvent faire apparaître un événement avant sa cause réelle.', difficulty: 'medium', tags: ['timeline'] },
          { id: 'q2', question: 'Que peut signifier un vide inexpliqué dans un journal Security ?', options: ['Rien de particulier, c’est normal', 'Une possible purge volontaire des logs par l’attaquant', 'Une panne matérielle systématique', 'Un simple redémarrage du service de journalisation'], correct: 1, explanation: 'Un attaquant qui efface ses traces génère parfois un vide détectable, avec l’Event ID 1102 associé.', difficulty: 'medium', tags: ['logs'] },
        ],
      },
      6: {
        title: 'Quiz — Forensique réseau',
        questions: [
          { id: 'q1', question: 'Pourquoi une capture réseau collectée par une sonde externe résiste-t-elle à un nettoyage par l’attaquant ?', options: ['Elle est stockée sur la machine compromise', 'Elle est collectée indépendamment de la machine attaquée', 'Les attaquants ne ciblent jamais le réseau', 'Ce n’est jamais le cas en pratique'], correct: 1, explanation: 'La capture réseau est indépendante du système compromis, donc non altérable par l’attaquant local.', difficulty: 'medium', tags: ['reseau'] },
          { id: 'q2', question: 'Qu’est-ce que le "beaconing" ?', options: ['Une technique de chiffrement réseau', 'Des connexions périodiques régulières caractéristiques d’un malware C2', 'Un protocole de sauvegarde', 'Une méthode d’authentification Kerberos'], correct: 1, explanation: 'Le beaconing désigne des connexions sortantes à intervalles très réguliers vers un serveur C2.', difficulty: 'medium', tags: ['c2'] },
        ],
      },
      7: {
        title: 'Quiz — Détection et analyse de malware',
        questions: [
          { id: 'q1', question: 'Pourquoi l’analyse statique doit-elle toujours précéder toute exécution d’un fichier suspect ?', options: ['Elle ne présente aucun risque d’infection du poste d’analyse', 'Elle est toujours plus longue que l’analyse dynamique', 'Elle nécessite un environnement isolé', 'Ce n’est pas une bonne pratique reconnue'], correct: 0, explanation: 'L’analyse statique n’exécute jamais le fichier, éliminant le risque d’infection.', difficulty: 'easy', tags: ['analyse-statique'] },
          { id: 'q2', question: 'Qu’est-ce que l’évasion de sandbox ?', options: ['Une technique de chiffrement de fichiers', 'La capacité d’un malware à détecter un environnement d’analyse et à masquer son comportement', 'Un outil d’acquisition mémoire', 'Une méthode de craquage de mot de passe'], correct: 1, explanation: 'Un malware sophistiqué peut détecter la virtualisation et s’abstenir de révéler son comportement malveillant.', difficulty: 'hard', tags: ['sandbox'] },
        ],
      },
      8: {
        title: 'Quiz — Rapport DFIR et clôture d’investigation',
        questions: [
          { id: 'q1', question: 'Pourquoi un rapport DFIR doit-il distinguer faits établis et hypothèses ?', options: ['Ce n’est pas nécessaire si le rapport est bien écrit', 'Mélanger les deux nuit gravement à la crédibilité en cas de contestation', 'Les hypothèses ne doivent jamais figurer dans un rapport', 'Seuls les faits établis existent en DFIR'], correct: 1, explanation: 'Un rapport rigoureux distingue explicitement ce qui est prouvé de ce qui reste une hypothèse.', difficulty: 'medium', tags: ['rapport-dfir'] },
          { id: 'q2', question: 'Pourquoi "pourquoi n’avons-nous pas détecté l’incident plus tôt ?" est-elle une question clé du retour d’expérience ?', options: ['Elle n’a aucun intérêt pratique', 'Elle révèle les défaillances de détection à corriger structurellement, au-delà du correctif ponctuel', 'Elle ne concerne que l’équipe juridique', 'Elle remplace la nécessité de corriger la faille'], correct: 1, explanation: 'Le retour d’expérience doit interroger les défaillances de détection, pas seulement corriger la vulnérabilité.', difficulty: 'medium', tags: ['retour-experience'] },
        ],
      },
    },
    cryptographie: {
      1: {
        title: 'Quiz — Introduction à la cryptographie moderne',
        questions: [
          { id: 'q1', question: 'Quels sont les quatre objectifs fondamentaux de la cryptographie ?', options: ['Vitesse, coût, simplicité, popularité', 'Confidentialité, intégrité, authentification, non-répudiation', 'Chiffrement, hachage, signature, certificat', 'Symétrique, asymétrique, hybride, quantique'], correct: 1, explanation: 'Ces quatre objectifs structurent l’ensemble des usages de la cryptographie moderne.', difficulty: 'easy', tags: ['fondamentaux'] },
          { id: 'q2', question: 'Que dit le principe de Kerckhoffs ?', options: ['Un algorithme doit rester secret pour être sûr', 'Un système doit rester sûr même si son fonctionnement est public, la clé seule doit rester secrète', 'Seuls les gouvernements peuvent créer des algorithmes sûrs', 'Le chiffrement symétrique est toujours supérieur à l’asymétrique'], correct: 1, explanation: 'C’est l’opposé de la sécurité par l’obscurité, règle d’or de la cryptographie moderne.', difficulty: 'medium', tags: ['kerckhoffs'] },
        ],
      },
      2: {
        title: 'Quiz — Chiffrement symétrique AES',
        questions: [
          { id: 'q1', question: 'Pourquoi le mode ECB est-il dangereux ?', options: ['Il est trop lent', 'Des blocs identiques en clair produisent des blocs identiques chiffrés, révélant des motifs', 'Il ne fonctionne qu’avec des clés courtes', 'Il n’existe pas en pratique'], correct: 1, explanation: 'Les motifs visuels du fichier original restent visibles malgré le chiffrement en mode ECB.', difficulty: 'medium', tags: ['ecb'] },
          { id: 'q2', question: 'Qu’est-ce qu’un mode AEAD comme GCM ?', options: ['Un mode qui ne garantit que la confidentialité', 'Un mode combinant chiffrement et authentification en une seule opération', 'Un algorithme de hachage', 'Un protocole d’échange de clé'], correct: 1, explanation: 'AEAD garantit confidentialité ET intégrité simultanément.', difficulty: 'medium', tags: ['gcm'] },
        ],
      },
      3: {
        title: 'Quiz — Chiffrement asymétrique RSA et ECC',
        questions: [
          { id: 'q1', question: 'Sur quel problème mathématique repose RSA ?', options: ['Le logarithme discret', 'La factorisation d’un grand nombre en deux nombres premiers', 'Le calcul de racines carrées', 'La résolution d’équations linéaires'], correct: 1, explanation: 'La difficulté de factoriser le module RSA garantit la sécurité du système.', difficulty: 'medium', tags: ['rsa'] },
          { id: 'q2', question: 'Pourquoi ECC est-il préféré à RSA sur mobile/IoT ?', options: ['ECC est toujours gratuit', 'À sécurité équivalente, ECC utilise des clés bien plus petites', 'RSA ne fonctionne pas sur mobile', 'ECC ne nécessite aucune clé privée'], correct: 1, explanation: 'Des clés plus petites réduisent la charge de calcul et de bande passante.', difficulty: 'medium', tags: ['ecc'] },
        ],
      },
      4: {
        title: 'Quiz — Fonctions de hachage',
        questions: [
          { id: 'q1', question: 'Pourquoi SHA-256 seul est-il un mauvais choix pour stocker des mots de passe ?', options: ['Il n’est pas assez précis', 'Il est trop rapide, permettant des milliards de tentatives par seconde sur GPU', 'Il ne fonctionne qu’avec des nombres', 'Ce n’est pas un problème en pratique'], correct: 1, explanation: 'Bcrypt/Argon2 sont conçus pour être délibérément lents, contrairement à SHA-256.', difficulty: 'medium', tags: ['mots-de-passe'] },
          { id: 'q2', question: 'À quoi sert le sel dans le hachage de mots de passe ?', options: ['À chiffrer le mot de passe', 'À rendre chaque hash unique même pour des mots de passe identiques, contrant les rainbow tables', 'À accélérer le hachage', 'Il n’a aucune utilité réelle'], correct: 1, explanation: 'Le sel rend les rainbow tables précalculées inefficaces.', difficulty: 'easy', tags: ['sel'] },
        ],
      },
      5: {
        title: 'Quiz — PKI et certificats',
        questions: [
          { id: 'q1', question: 'Que garantit la signature d’un certificat par une autorité de certification ?', options: ['Que le site est rapide', 'Que l’identité du demandeur a été vérifiée avant de lier son identité à sa clé publique', 'Que le site n’a jamais de bug', 'Rien de vérifiable'], correct: 1, explanation: 'La CA agit comme tiers de confiance vérifiant l’identité avant signature.', difficulty: 'medium', tags: ['pki'] },
          { id: 'q2', question: 'Pourquoi ignorer un avertissement de certificat invalide est-il risqué ?', options: ['Cela ralentit la navigation', 'Cela désactive la principale protection contre les attaques de l’homme du milieu', 'Cela n’a aucune conséquence réelle', 'Les navigateurs bloquent toujours ces sites de toute façon'], correct: 1, explanation: 'Un certificat invalide accepté à tort ouvre la porte à une interception de trafic.', difficulty: 'medium', tags: ['mitm'] },
        ],
      },
      6: {
        title: 'Quiz — Attaques cryptographiques classiques',
        questions: [
          { id: 'q1', question: 'Pourquoi la force brute contre AES-256 est-elle considérée comme impraticable ?', options: ['Les ordinateurs sont trop lents pour la tenter', 'Le nombre de combinaisons dépasse largement les capacités de calcul actuelles et prévisibles', 'AES-256 n’a jamais été testé', 'Ce n’est pas vrai, c’est déjà possible'], correct: 1, explanation: 'Le temps nécessaire dépasse largement l’âge de l’univers avec les moyens actuels.', difficulty: 'medium', tags: ['force-brute'] },
          { id: 'q2', question: 'Qu’est-ce qu’une attaque par canal auxiliaire ?', options: ['Une attaque sur les mathématiques de l’algorithme', 'Une attaque exploitant la mise en œuvre physique (temps, consommation électrique)', 'Une attaque par dictionnaire', 'Une attaque de rejeu'], correct: 1, explanation: 'Le canal auxiliaire exploite l’implémentation physique, pas l’algorithme lui-même.', difficulty: 'hard', tags: ['side-channel'] },
        ],
      },
      7: {
        title: 'Quiz — TLS et HTTPS en pratique',
        questions: [
          { id: 'q1', question: 'Qu’est-ce que le forward secrecy apporte par rapport à RSA seul pour l’échange de clé ?', options: ['Une connexion plus rapide uniquement', 'Empêche qu’une compromission future de la clé privée du serveur déchiffre le trafic passé', 'Aucune différence réelle', 'Un chiffrement plus fort'], correct: 1, explanation: 'ECDHE génère une clé éphémère par session, protégeant les sessions passées.', difficulty: 'hard', tags: ['forward-secrecy'] },
          { id: 'q2', question: 'Pourquoi l’absence de HSTS est-elle risquée ?', options: ['Elle ralentit le site', 'Elle permet une attaque de downgrade vers une version non chiffrée du site', 'Elle empêche l’indexation par les moteurs de recherche', 'Elle n’a aucun impact de sécurité'], correct: 1, explanation: 'Sans HSTS, un attaquant peut rediriger vers une version HTTP non protégée.', difficulty: 'medium', tags: ['hsts'] },
        ],
      },
      8: {
        title: 'Quiz — Cryptographie post-quantique',
        questions: [
          { id: 'q1', question: 'Pourquoi l’algorithme de Shor menace-t-il RSA et ECC mais pas AES de la même façon ?', options: ['Shor ne fonctionne que sur RSA', 'Shor résout efficacement la factorisation et le logarithme discret, sur lesquels reposent RSA/ECC, contrairement à AES', 'AES est plus récent que RSA', 'Aucune différence réelle entre les deux'], correct: 1, explanation: 'AES est seulement affaibli par l’algorithme de Grover, pas cassé comme RSA/ECC par Shor.', difficulty: 'hard', tags: ['post-quantique'] },
          { id: 'q2', question: 'Qu’est-ce que la stratégie "harvest now, decrypt later" ?', options: ['Une technique de sauvegarde de données', 'Intercepter et stocker du trafic chiffré aujourd’hui pour le déchiffrer plus tard avec un ordinateur quantique', 'Une méthode de chiffrement post-quantique', 'Une attaque par force brute classique'], correct: 1, explanation: 'Cela rend la menace quantique déjà pertinente aujourd’hui pour les données à longue durée de vie.', difficulty: 'hard', tags: ['harvest-now'] },
        ],
      },
    },
    maths: {
      1: {
        title: 'Quiz — Arithmétique modulaire',
        questions: [
          { id: 'q1', question: 'Que donne 23 mod 7 ?', options: ['3', '2', '7', '16'], correct: 1, explanation: '23 = 3×7 + 2, donc 23 mod 7 = 2.', difficulty: 'easy', tags: ['modulo'] },
          { id: 'q2', question: 'Pourquoi l’exponentiation modulaire rapide est-elle indispensable pour RSA ?', options: ['Elle rend le calcul plus lent volontairement', 'Elle permet de calculer a^b mod n sans manipuler des nombres astronomiquement grands', 'Elle n’a aucun rapport avec RSA', 'Elle sert uniquement au hachage'], correct: 1, explanation: 'Sans elle, les nombres intermédiaires seraient impraticables à manipuler.', difficulty: 'medium', tags: ['rsa'] },
        ],
      },
      2: {
        title: 'Quiz — Nombres premiers, PGCD et algorithme d’Euclide',
        questions: [
          { id: 'q1', question: 'Pourquoi RSA repose-t-il sur des nombres premiers ?', options: ['Par tradition historique uniquement', 'Car factoriser le produit de deux grands nombres premiers est extrêmement coûteux en calcul', 'Les nombres premiers sont plus faciles à mémoriser', 'RSA n’utilise pas de nombres premiers'], correct: 1, explanation: 'La sécurité de RSA repose entièrement sur cette difficulté de factorisation.', difficulty: 'medium', tags: ['rsa'] },
          { id: 'q2', question: 'Pourquoi un PGCD non trivial entre deux modules RSA est-il dangereux ?', options: ['Cela n’a aucune conséquence', 'Il révèle un facteur premier partagé, cassant les deux clés concernées', 'Cela ralentit uniquement les calculs', 'Cela ne concerne que les vieux systèmes'], correct: 1, explanation: 'L’algorithme d’Euclide calcule ce PGCD en une fraction de seconde, révélant la faille.', difficulty: 'hard', tags: ['pgcd'] },
        ],
      },
      3: {
        title: 'Quiz — Logique booléenne',
        questions: [
          { id: 'q1', question: 'Quelle est la différence entre OU et XOR ?', options: ['Aucune différence', 'XOR est vrai seulement si les deux valeurs sont différentes, OU est vrai si au moins une l’est', 'XOR est toujours faux', 'OU n’existe pas en informatique'], correct: 1, explanation: 'Le XOR exclut le cas où les deux valeurs sont vraies simultanément.', difficulty: 'easy', tags: ['xor'] },
          { id: 'q2', question: 'Pourquoi réutiliser la même clé XOR pour deux messages est-il dangereux ?', options: ['Ce n’est pas dangereux', 'Combiner les deux textes chiffrés par XOR annule la clé et révèle une relation entre les messages clairs', 'Le XOR devient plus lent', 'Cela n’affecte que les clés courtes'], correct: 1, explanation: 'C’est pourquoi le masque jetable exige une clé à usage unique.', difficulty: 'hard', tags: ['vernam'] },
        ],
      },
      4: {
        title: 'Quiz — Probabilités fondamentaux',
        questions: [
          { id: 'q1', question: 'Comment calcule-t-on l’espace de recherche d’un mot de passe de 6 caractères parmi 26 lettres ?', options: ['6 × 26', '26^6', '26 + 6', '6!'], correct: 1, explanation: 'Chaque caractère indépendant multiplie l’espace de recherche total : 26 puissance 6.', difficulty: 'medium', tags: ['probabilites'] },
          { id: 'q2', question: 'Pourquoi un mot de passe humain a-t-il une entropie réelle plus faible que théorique ?', options: ['Les humains tapent plus lentement', 'Les mots de passe humains suivent des motifs prévisibles (mots, dates, substitutions courantes)', 'Ce n’est jamais le cas', 'Les claviers limitent les possibilités'], correct: 1, explanation: 'Les attaques par dictionnaire exploitent justement cette prévisibilité.', difficulty: 'medium', tags: ['mots-de-passe'] },
        ],
      },
      5: {
        title: 'Quiz — Théorie de l’information et entropie',
        questions: [
          { id: 'q1', question: 'Que mesure l’entropie en théorie de l’information ?', options: ['La vitesse de calcul', 'L’imprévisibilité (incertitude) d’une donnée, exprimée en bits', 'La taille physique d’un fichier', 'Le nombre de caractères d’un mot de passe uniquement'], correct: 1, explanation: 'Plus l’entropie est élevée, plus la donnée est imprévisible.', difficulty: 'medium', tags: ['entropie'] },
          { id: 'q2', question: 'Pourquoi une clé AES-256 doit-elle être générée par un générateur aléatoire cryptographiquement sûr ?', options: ['Pour respecter une norme esthétique', 'Pour garantir que son entropie réelle atteigne bien 256 bits, condition de sa robustesse', 'Ce n’est pas nécessaire en pratique', 'Pour accélérer le chiffrement'], correct: 1, explanation: 'Un mauvais générateur réduirait l’entropie réelle bien en dessous de 256 bits.', difficulty: 'hard', tags: ['generation-cle'] },
        ],
      },
      6: {
        title: 'Quiz — Statistiques descriptives',
        questions: [
          { id: 'q1', question: 'Pourquoi la médiane est-elle plus robuste que la moyenne face à des valeurs extrêmes ?', options: ['Elle est toujours plus grande', 'Elle n’est pas déformée par une valeur aberrante isolée, contrairement à la moyenne', 'Elle est plus facile à calculer', 'Il n’y a aucune différence'], correct: 1, explanation: 'La médiane reste représentative même en présence d’une valeur extrême.', difficulty: 'medium', tags: ['mediane'] },
          { id: 'q2', question: 'Que signifie un écart-type élevé pour un jeu de données ?', options: ['Les valeurs sont toutes identiques', 'Les valeurs sont fortement dispersées autour de la moyenne', 'La moyenne est fausse', 'Il n’y a pas assez de données'], correct: 1, explanation: 'Un écart-type élevé indique une forte dispersion des valeurs.', difficulty: 'easy', tags: ['ecart-type'] },
        ],
      },
      7: {
        title: 'Quiz — Théorie des graphes appliquée à la sécurité',
        questions: [
          { id: 'q1', question: 'Pourquoi BloodHound utilise-t-il un graphe orienté plutôt que non orienté ?', options: ['Par choix esthétique', 'Car les relations de privilège AD sont asymétriques (A peut agir sur B sans que l’inverse soit vrai)', 'Les graphes non orientés n’existent pas', 'Cela n’a aucune importance'], correct: 1, explanation: 'La directionnalité permet de modéliser fidèlement les relations de privilège.', difficulty: 'medium', tags: ['bloodhound'] },
          { id: 'q2', question: 'Pourquoi un nœud au degré de connexions élevé dans un graphe AD est-il à surveiller ?', options: ['Il ralentit le graphe', 'Il représente souvent un point de compromission à fort effet de levier', 'Cela n’a aucune signification particulière', 'Il s’agit toujours d’un compte administrateur'], correct: 1, explanation: 'Un nœud très connecté offre potentiellement plus de chemins d’attaque exploitables.', difficulty: 'medium', tags: ['tiering'] },
        ],
      },
      8: {
        title: 'Quiz — Synthèse mathématiques pour la cybersécurité',
        questions: [
          { id: 'q1', question: 'Quelle notion mathématique explique le fonctionnement de BloodHound ?', options: ['L’arithmétique modulaire', 'La théorie des graphes', 'Les statistiques descriptives', 'La logique booléenne'], correct: 1, explanation: 'BloodHound modélise un domaine AD comme un graphe et calcule des chemins d’attaque.', difficulty: 'easy', tags: ['synthese'] },
          { id: 'q2', question: 'Pourquoi n’est-il pas nécessaire de démontrer rigoureusement chaque théorème pour utiliser ces notions en cybersécurité ?', options: ['Les mathématiques ne servent à rien en pratique', 'Comprendre le principe suffit largement à l’usage professionnel de ces outils', 'Il faut toujours une preuve formelle avant d’utiliser un outil', 'Ce n’est vrai que pour les experts'], correct: 1, explanation: 'La compréhension du principe est suffisante pour un usage professionnel efficace.', difficulty: 'easy', tags: ['methodologie'] },
        ],
      },
    },
    'algebre-lineaire': {
      1: {
        title: 'Quiz — Vecteurs et espaces vectoriels',
        questions: [
          { id: 'q1', question: 'Qu’est-ce qu’un vecteur en data science ?', options: ['Toujours une flèche géométrique', 'Une liste ordonnée de nombres représentant une donnée', 'Un type de matrice spéciale', 'Un algorithme de classification'], correct: 1, explanation: 'Un email, une connexion réseau ou un document peuvent tous être représentés comme des vecteurs.', difficulty: 'easy', tags: ['vecteurs'] },
          { id: 'q2', question: 'Que mesure le produit scalaire de deux vecteurs ?', options: ['La différence entre les deux vecteurs', 'À quel point les deux vecteurs pointent dans la même direction', 'Le nombre de dimensions des vecteurs', 'La somme de leurs normes'], correct: 1, explanation: 'Un produit scalaire élevé indique une forte similarité de direction entre les vecteurs.', difficulty: 'medium', tags: ['produit-scalaire'] },
        ],
      },
      2: {
        title: 'Quiz — Matrices, opérations fondamentales',
        questions: [
          { id: 'q1', question: 'Quelle condition faut-il vérifier avant de multiplier deux matrices A et B ?', options: ['Elles doivent avoir la même taille', 'Le nombre de colonnes de A doit égaler le nombre de lignes de B', 'A et B doivent être carrées', 'Aucune condition n’est nécessaire'], correct: 1, explanation: 'Cette compatibilité de dimensions est indispensable pour que la multiplication soit définie.', difficulty: 'medium', tags: ['matrices'] },
          { id: 'q2', question: 'Pourquoi A × B est-il généralement différent de B × A ?', options: ['Ce n’est jamais le cas, ils sont toujours égaux', 'La multiplication matricielle n’est pas commutative', 'Seules les matrices carrées peuvent être multipliées', 'Cela dépend uniquement de la taille des matrices'], correct: 1, explanation: 'Contrairement à la multiplication de nombres, l’ordre compte en multiplication matricielle.', difficulty: 'medium', tags: ['multiplication'] },
        ],
      },
      3: {
        title: 'Quiz — Déterminant et inverse',
        questions: [
          { id: 'q1', question: 'Que signifie un déterminant nul pour une matrice carrée ?', options: ['La matrice est toujours identité', 'La matrice n’est pas inversible', 'La matrice est très grande', 'Rien de particulier'], correct: 1, explanation: 'Un déterminant nul indique que la matrice écrase l’espace et n’admet pas d’inverse.', difficulty: 'medium', tags: ['determinant'] },
          { id: 'q2', question: 'Comment le chiffre de Hill utilise-t-il l’inversion matricielle ?', options: ['Il ne l’utilise pas', 'Le déchiffrement consiste à multiplier par l’inverse de la matrice clé utilisée au chiffrement', 'Il calcule uniquement des déterminants', 'Il utilise l’inverse pour générer la clé aléatoirement'], correct: 1, explanation: 'Si la matrice clé n’est pas inversible, le déchiffrement devient impossible.', difficulty: 'hard', tags: ['chiffre-hill'] },
        ],
      },
      4: {
        title: 'Quiz — Transformations linéaires',
        questions: [
          { id: 'q1', question: 'En quel sens une matrice peut-elle être vue comme une fonction ?', options: ['Elle ne peut pas être vue ainsi', 'Elle transforme un vecteur d’entrée en un vecteur de sortie', 'Elle ne fonctionne que sur des nombres uniques', 'Elle représente uniquement des rotations'], correct: 1, explanation: 'Multiplier un vecteur par une matrice produit un nouveau vecteur, comme une fonction.', difficulty: 'easy', tags: ['transformations'] },
          { id: 'q2', question: 'Que fait typiquement une couche d’un réseau de neurones ?', options: ['Uniquement du stockage de données', 'Une transformation linéaire (matrice de poids) suivie d’une fonction non linéaire', 'Un tri des données d’entrée', 'Un calcul de déterminant'], correct: 1, explanation: 'Ce mécanisme permet au réseau de transformer progressivement une entrée en décision de sortie.', difficulty: 'medium', tags: ['reseaux-neurones'] },
        ],
      },
      5: {
        title: 'Quiz — Valeurs propres et vecteurs propres',
        questions: [
          { id: 'q1', question: 'Que caractérise un vecteur propre d’une matrice ?', options: ['Il change toujours de direction après transformation', 'Il garde la même direction après transformation, seulement mis à l’échelle', 'Il est toujours nul', 'Il n’a aucune propriété particulière'], correct: 1, explanation: 'Le facteur d’échelle associé est la valeur propre correspondante.', difficulty: 'medium', tags: ['valeurs-propres'] },
          { id: 'q2', question: 'Quel est le rôle des valeurs propres dans la PCA ?', options: ['Elles ne jouent aucun rôle', 'Elles indiquent l’importance (variance) de chaque composante principale', 'Elles servent uniquement à normaliser les données', 'Elles remplacent le besoin de matrice de covariance'], correct: 1, explanation: 'Les composantes associées aux plus grandes valeurs propres captent le plus de variance.', difficulty: 'hard', tags: ['pca'] },
        ],
      },
      6: {
        title: 'Quiz — Normes et distances',
        questions: [
          { id: 'q1', question: 'Quelle est la différence entre la norme L1 et la norme L2 ?', options: ['Elles sont identiques', 'L1 somme les valeurs absolues, L2 est la racine carrée de la somme des carrés', 'L2 ne fonctionne qu’en 2D', 'L1 est toujours plus précise'], correct: 1, explanation: 'Ce sont deux façons différentes de mesurer la longueur d’un vecteur.', difficulty: 'medium', tags: ['normes'] },
          { id: 'q2', question: 'Pourquoi la similarité cosinus est-elle préférée pour comparer des documents de longueurs différentes ?', options: ['Elle est plus rapide à calculer', 'Elle mesure l’orientation des vecteurs, insensible à leur magnitude', 'Elle ne fonctionne que sur des documents courts', 'Elle remplace toujours la distance euclidienne'], correct: 1, explanation: 'La similarité cosinus ignore la longueur des documents et se concentre sur leur orientation.', difficulty: 'medium', tags: ['similarite-cosinus'] },
        ],
      },
      7: {
        title: 'Quiz — Synthèse algèbre linéaire pour la data',
        questions: [
          { id: 'q1', question: 'Quelle notion est directement liée à la vectorisation d’une donnée brute ?', options: ['Le déterminant', 'Les vecteurs', 'Les valeurs propres uniquement', 'La similarité cosinus uniquement'], correct: 1, explanation: 'La vectorisation consiste précisément à représenter une donnée comme un vecteur.', difficulty: 'easy', tags: ['synthese'] },
          { id: 'q2', question: 'Pourquoi les valeurs propres sont-elles centrales dans la réduction de dimension ?', options: ['Elles n’ont aucun lien avec la réduction de dimension', 'Elles indiquent quelles directions (composantes) capturent le plus de variance à conserver', 'Elles servent uniquement au chiffrement', 'Elles remplacent le besoin de vecteurs'], correct: 1, explanation: 'La PCA garde les composantes associées aux plus grandes valeurs propres.', difficulty: 'medium', tags: ['reduction-dimension'] },
        ],
      },
    },
    'data-science': {
      1: {
        title: 'Quiz — Le cycle de vie d’un projet de data science',
        questions: [
          { id: 'q1', question: 'Quelle étape consomme généralement le plus de temps dans un projet de data science ?', options: ['La modélisation', 'La collecte et le nettoyage des données', 'Le déploiement', 'La présentation des résultats'], correct: 1, explanation: 'Collecte et nettoyage représentent souvent 60 à 80% du temps d’un projet.', difficulty: 'easy', tags: ['methodologie'] },
          { id: 'q2', question: 'Quelle est la relation entre IA, machine learning et data science ?', options: ['Ce sont trois termes strictement identiques', 'Le ML est un sous-ensemble de l’IA ; la data science englobe le ML parmi d’autres techniques', 'La data science est un sous-ensemble du ML', 'L’IA est un sous-ensemble de la data science uniquement'], correct: 1, explanation: 'Le ML est une approche statistique au sein de l’IA, la data science englobe collecte, nettoyage et analyse de données.', difficulty: 'medium', tags: ['vocabulaire'] },
        ],
      },
      2: {
        title: 'Quiz — Collecte et nettoyage de données',
        questions: [
          { id: 'q1', question: 'Pourquoi supprimer systématiquement les lignes à valeurs manquantes peut-il être risqué ?', options: ['Ce n’est jamais risqué', 'Cela peut introduire un biais si les valeurs manquantes ne sont pas réparties au hasard', 'Cela ralentit uniquement le traitement', 'Cela concerne uniquement les très grands jeux de données'], correct: 1, explanation: 'Une absence systématique de valeurs peut fausser la représentativité des données restantes.', difficulty: 'medium', tags: ['nettoyage'] },
          { id: 'q2', question: 'Pourquoi faut-il être prudent avant de "nettoyer" une valeur aberrante en sécurité ?', options: ['Ce n’est jamais un problème', 'Elle peut représenter une attaque réelle plutôt qu’une simple erreur', 'Les valeurs aberrantes n’existent pas en sécurité', 'Il faut toujours les supprimer sans exception'], correct: 1, explanation: 'Confondre signal d’attaque et erreur de données peut faire disparaître exactement ce qu’on cherche à détecter.', difficulty: 'hard', tags: ['outliers'] },
        ],
      },
      3: {
        title: 'Quiz — Exploration et visualisation de données',
        questions: [
          { id: 'q1', question: 'Quel graphique est le plus adapté pour repérer des valeurs aberrantes dans une distribution ?', options: ['Un diagramme en boîte (boxplot)', 'Un graphique circulaire (camembert)', 'Un graphique en barres empilées', 'Aucun graphique ne le permet'], correct: 0, explanation: 'Le boxplot affiche directement médiane, quartiles et valeurs aberrantes.', difficulty: 'easy', tags: ['visualisation'] },
          { id: 'q2', question: 'Pourquoi une corrélation visuelle entre deux variables ne prouve-t-elle pas une causalité ?', options: ['Une corrélation prouve toujours une causalité', 'Les deux variables peuvent dépendre d’une troisième variable cachée', 'Les graphiques sont toujours trompeurs', 'La causalité n’existe pas en data science'], correct: 1, explanation: 'Une variable cachée peut expliquer la variation simultanée de deux autres variables.', difficulty: 'medium', tags: ['correlation'] },
        ],
      },
      4: {
        title: 'Quiz — Statistiques appliquées à la data science',
        questions: [
          { id: 'q1', question: 'Que signifie une p-value faible dans un test d’hypothèse ?', options: ['L’effet observé est nécessairement très important', 'L’effet observé est statistiquement peu probable sous l’hypothèse nulle', 'Le test a échoué', 'Les données sont incorrectes'], correct: 1, explanation: 'Une p-value faible ne mesure que la significativité statistique, pas l’importance pratique.', difficulty: 'medium', tags: ['p-value'] },
          { id: 'q2', question: 'Que mesure uniquement le coefficient de corrélation de Pearson ?', options: ['Toutes les relations possibles entre deux variables', 'Uniquement les relations linéaires', 'Uniquement les relations non linéaires', 'La causalité entre deux variables'], correct: 1, explanation: 'Une relation non linéaire peut donner un Pearson proche de 0 malgré une forte relation réelle.', difficulty: 'medium', tags: ['pearson'] },
        ],
      },
      5: {
        title: 'Quiz — Introduction au machine learning supervisé',
        questions: [
          { id: 'q1', question: 'Que signifie "supervisé" en apprentissage supervisé ?', options: ['Un humain surveille chaque prédiction en temps réel', 'Chaque exemple d’entraînement est accompagné de la bonne réponse (étiquette)', 'Le modèle ne peut jamais se tromper', 'Le modèle fonctionne sans aucune donnée'], correct: 1, explanation: 'Le modèle apprend à partir d’exemples déjà étiquetés par des humains.', difficulty: 'easy', tags: ['supervise'] },
          { id: 'q2', question: 'Pourquoi un k-NN avec k=1 est-il risqué ?', options: ['Il est toujours plus lent', 'Il est très sensible à un seul exemple d’entraînement mal étiqueté', 'Il ne fonctionne que sur du texte', 'Il ne peut traiter que deux classes'], correct: 1, explanation: 'Un k trop petit rend le modèle sensible au bruit d’un seul exemple.', difficulty: 'medium', tags: ['knn'] },
        ],
      },
      6: {
        title: 'Quiz — Machine learning non supervisé et détection d’anomalies',
        questions: [
          { id: 'q1', question: 'Pourquoi le non supervisé est-il utile pour détecter des attaques inédites ?', options: ['Il nécessite des exemples déjà étiquetés de chaque attaque', 'Il cherche des motifs sans avoir besoin d’exemples étiquetés au préalable', 'Il est plus rapide que le supervisé', 'Il ne peut détecter que des attaques déjà connues'], correct: 1, explanation: 'Le non supervisé peut repérer des écarts par rapport à la norme, même sans étiquette de départ.', difficulty: 'medium', tags: ['non-supervise'] },
          { id: 'q2', question: 'Pourquoi la détection d’anomalies non supervisée produit-elle des faux positifs ?', options: ['Elle ne produit jamais de faux positifs', 'Un comportement légitime mais rare peut ressembler à une anomalie', 'Elle ne fonctionne que sur des données étiquetées', 'Les faux positifs ne concernent que le supervisé'], correct: 1, explanation: 'Un comportement rare mais légitime (ex: voyage professionnel) peut être signalé à tort.', difficulty: 'medium', tags: ['anomalies'] },
        ],
      },
      7: {
        title: 'Quiz — Évaluation de modèles, métriques et pièges',
        questions: [
          { id: 'q1', question: 'Pourquoi l’accuracy est-elle trompeuse sur un jeu de données déséquilibré ?', options: ['Elle ne l’est jamais', 'Un modèle qui prédit toujours "normal" peut obtenir une accuracy très élevée sans détecter aucune attaque', 'L’accuracy ne peut pas être calculée sur ce type de données', 'Elle ne concerne que la régression'], correct: 1, explanation: 'Sur 1% d’attaques, prédire toujours "normal" donne déjà 99% d’accuracy sans aucune détection.', difficulty: 'medium', tags: ['accuracy'] },
          { id: 'q2', question: 'Comment détecte-t-on qu’un modèle est en surapprentissage ?', options: ['Il performe mal partout, y compris à l’entraînement', 'Il performe très bien à l’entraînement mais mal sur des données de validation nouvelles', 'Il ne peut jamais être détecté', 'Il performe uniquement bien sur le jeu de test'], correct: 1, explanation: 'Un écart entre performance d’entraînement et de validation signale un surapprentissage.', difficulty: 'medium', tags: ['overfitting'] },
        ],
      },
      8: {
        title: 'Quiz — Data science appliquée à la cybersécurité',
        questions: [
          { id: 'q1', question: 'Pourquoi un modèle de détection de phishing nécessite-t-il un réentraînement régulier ?', options: ['Les modèles se dégradent avec le temps sans raison', 'Les techniques de phishing évoluent constamment (dérive de concept)', 'Ce n’est jamais nécessaire une fois entraîné', 'Uniquement pour des raisons légales'], correct: 1, explanation: 'La dérive de concept rend un modèle statique obsolète face à des menaces qui évoluent.', difficulty: 'medium', tags: ['phishing'] },
          { id: 'q2', question: 'Qu’est-ce qui rend la détection de fraude particulièrement "adversariale" ?', options: ['Les fraudeurs adaptent activement leurs techniques pour tromper le modèle', 'Les transactions frauduleuses sont toujours identiques', 'Il n’y a jamais de fraudeurs actifs', 'Les modèles de fraude ne sont jamais attaqués'], correct: 0, explanation: 'Contrairement à d’autres problèmes, l’adversaire cherche activement à contourner le modèle.', difficulty: 'hard', tags: ['adversarial'] },
        ],
      },
      9: {
        title: 'Quiz — Synthèse et éthique des données',
        questions: [
          { id: 'q1', question: 'Donne un exemple de biais historique dans un modèle.', options: ['Un modèle qui reproduit les biais de décisions humaines passées utilisées comme données d’entraînement', 'Un modèle toujours parfaitement neutre', 'Un modèle qui n’utilise aucune donnée', 'Un biais qui ne concerne que les images'], correct: 0, explanation: 'Un modèle entraîné sur des décisions humaines biaisées reproduit ces biais.', difficulty: 'medium', tags: ['biais'] },
          { id: 'q2', question: 'Pourquoi le principe de minimisation du RGPD s’applique-t-il à la data science ?', options: ['Il ne s’applique jamais à la data science', 'Collecter plus de données personnelles que nécessaire est un manquement, même si le modèle est performant', 'Seule la performance du modèle compte légalement', 'Le RGPD ne concerne que les emails'], correct: 1, explanation: 'La qualité technique d’un modèle ne dispense pas du respect du principe de minimisation des données.', difficulty: 'medium', tags: ['rgpd'] },
        ],
      },
    },
    'python-datasci': {
      1: {
        title: "Quiz — L'écosystème Python data science",
        questions: [
          { id: 'q1', question: 'Pourquoi Python domine-t-il la data science malgré ne pas être le plus rapide ?', options: ['Il est en réalité le langage le plus rapide', 'Son écosystème délègue les calculs lourds à du code C/Fortran optimisé, avec une syntaxe simple', 'Il n’est utilisé que par habitude', 'Les autres langages ne peuvent pas faire de calcul numérique'], correct: 1, explanation: 'NumPy et Pandas exploitent du code compilé sous-jacent tout en gardant une syntaxe Python simple.', difficulty: 'medium', tags: ['ecosysteme'] },
          { id: 'q2', question: 'Quel est le rôle principal de scikit-learn dans l’écosystème ?', options: ['La visualisation de données', 'Le nettoyage de données tabulaires', 'Les algorithmes de machine learning prêts à l’emploi', 'Le calcul vectorisé de bas niveau'], correct: 2, explanation: 'scikit-learn fournit classification, clustering et évaluation de modèles.', difficulty: 'easy', tags: ['scikit-learn'] },
        ],
      },
      2: {
        title: 'Quiz — NumPy, tableaux et calcul vectorisé',
        questions: [
          { id: 'q1', question: 'Pourquoi un tableau NumPy permet-il des calculs plus rapides qu’une boucle Python classique ?', options: ['Il n’y a aucune différence de performance', 'Il stocke les données de façon contiguë et typée, permettant des opérations vectorisées optimisées', 'NumPy n’utilise jamais de mémoire', 'Les boucles Python sont toujours plus rapides'], correct: 1, explanation: 'La vectorisation remplace une boucle explicite par une opération unique optimisée en code compilé.', difficulty: 'medium', tags: ['vectorisation'] },
          { id: 'q2', question: 'Quelle fonction NumPy calcule le déterminant d’une matrice ?', options: ['np.linalg.det()', 'np.array()', 'np.mean()', 'np.dot()'], correct: 0, explanation: 'np.linalg.det() calcule directement le déterminant vu au cours Algèbre Linéaire.', difficulty: 'easy', tags: ['numpy'] },
        ],
      },
      3: {
        title: 'Quiz — Pandas, manipuler des DataFrames',
        questions: [
          { id: 'q1', question: 'Pourquoi utiliser `&` plutôt que `and` pour combiner des conditions sur des colonnes Pandas ?', options: ['Il n’y a aucune différence', '`and`/`or` ne fonctionnent pas correctement sur des séries de valeurs', '`&` est simplement plus rapide à taper', 'Pandas interdit l’utilisation de `and`'], correct: 1, explanation: 'Les opérateurs `and`/`or` lèvent une erreur ou un comportement incorrect sur des séries entières.', difficulty: 'medium', tags: ['pandas'] },
          { id: 'q2', question: 'Que permet de faire `groupby` en une seule ligne de code ?', options: ['Trier un DataFrame par ordre alphabétique', 'Agréger des données par catégorie (sommes, comptages) sans écrire de boucle', 'Supprimer les doublons', 'Convertir les types de données'], correct: 1, explanation: 'groupby répond à des questions comme "volume total par IP source" sans boucle explicite.', difficulty: 'medium', tags: ['groupby'] },
        ],
      },
      4: {
        title: 'Quiz — Nettoyage de données avec Pandas',
        questions: [
          { id: 'q1', question: 'Quelle méthode révèle la proportion de valeurs manquantes par colonne ?', options: ['df.dropna()', 'df.isnull().mean()', 'df.describe()', 'df.corr()'], correct: 1, explanation: 'isnull().mean() donne directement la proportion de valeurs manquantes par colonne.', difficulty: 'easy', tags: ['nettoyage'] },
          { id: 'q2', question: 'Pourquoi faut-il convertir explicitement une colonne de dates chargée depuis un CSV ?', options: ['Ce n’est jamais nécessaire', 'Elle est chargée comme texte brut par défaut, empêchant tri chronologique et calcul de durée', 'Les CSV ne peuvent pas contenir de dates', 'Pandas convertit toujours automatiquement les dates'], correct: 1, explanation: 'pd.to_datetime() est nécessaire pour un traitement chronologique correct.', difficulty: 'medium', tags: ['dates'] },
        ],
      },
      5: {
        title: 'Quiz — Visualisation avec Matplotlib et Seaborn',
        questions: [
          { id: 'q1', question: 'Quelle est la relation entre Matplotlib et Seaborn ?', options: ['Ce sont deux bibliothèques totalement indépendantes', 'Seaborn est construit au-dessus de Matplotlib, avec une syntaxe plus concise pour les graphiques statistiques', 'Matplotlib est construit au-dessus de Seaborn', 'Elles ne peuvent pas être utilisées ensemble'], correct: 1, explanation: 'Seaborn simplifie la création de graphiques statistiques tout en restant compatible avec Matplotlib.', difficulty: 'medium', tags: ['visualisation'] },
          { id: 'q2', question: 'À quoi sert la fonction `resample` de Pandas ?', options: ['À supprimer des doublons', 'À regrouper des événements par intervalle de temps', 'À entraîner un modèle', 'À calculer une corrélation'], correct: 1, explanation: 'resample regroupe les événements par heure, jour, etc., avant analyse temporelle.', difficulty: 'medium', tags: ['resample'] },
        ],
      },
      6: {
        title: 'Quiz — Analyse exploratoire d’un jeu de données de sécurité',
        questions: [
          { id: 'q1', question: 'Quelles sont les premières commandes à exécuter face à un nouveau jeu de données ?', options: ['Entraîner directement un modèle', 'shape, head, dtypes, isnull().sum()', 'Supprimer toutes les colonnes numériques', 'Créer immédiatement un graphique complexe'], correct: 1, explanation: 'Ces commandes répondent à "à quoi ai-je affaire ?" avant toute analyse.', difficulty: 'easy', tags: ['eda'] },
          { id: 'q2', question: 'Pourquoi "les données ont été analysées" n’est-elle pas une observation exploitable ?', options: ['Elle est toujours fausse', 'Elle n’est ni spécifique ni vérifiable, contrairement à une observation chiffrée précise', 'Elle est trop longue', 'Les observations ne doivent jamais être écrites'], correct: 1, explanation: 'Une observation exploitable doit être spécifique et vérifiable, comme au cours Rédaction de Rapports.', difficulty: 'medium', tags: ['observations'] },
        ],
      },
      7: {
        title: 'Quiz — Introduction à scikit-learn',
        questions: [
          { id: 'q1', question: 'Quelles sont les deux méthodes communes à la plupart des modèles scikit-learn ?', options: ['.load() et .save()', '.fit() et .predict()', '.clean() et .visualize()', '.train() et .test()'], correct: 1, explanation: 'Cette API commune permet de changer d’algorithme facilement.', difficulty: 'easy', tags: ['api'] },
          { id: 'q2', question: 'Pourquoi ne faut-il jamais évaluer un modèle sur ses données d’entraînement ?', options: ['Ce n’est pas grave de le faire', 'Cela donne une estimation trompeusement optimiste de sa performance réelle', 'Cela rend le modèle plus rapide', 'train_test_split n’existe pas pour cette raison'], correct: 1, explanation: 'Le modèle a déjà "vu" ces données, faussant l’évaluation de sa capacité de généralisation.', difficulty: 'medium', tags: ['evaluation'] },
        ],
      },
      8: {
        title: 'Quiz — Synthèse pipeline Python complet',
        questions: [
          { id: 'q1', question: 'Pourquoi structurer un pipeline en fonctions distinctes plutôt qu’en script linéaire ?', options: ['Ce n’est pas utile', 'Chaque étape devient testable et réutilisable indépendamment', 'Cela ralentit toujours l’exécution', 'Python interdit les longs scripts'], correct: 1, explanation: 'Des fonctions séparées (charger, nettoyer, explorer, entraîner) facilitent maintenance et réutilisation.', difficulty: 'medium', tags: ['pipeline'] },
          { id: 'q2', question: 'Pourquoi un modèle déployé en production nécessite-t-il un réentraînement régulier ?', options: ['Ce n’est jamais nécessaire une fois déployé', 'La dérive de concept rend un modèle statique obsolète face à des données qui évoluent', 'Les modèles scikit-learn expirent automatiquement', 'Uniquement pour des raisons de licence'], correct: 1, explanation: 'Rappel du cours Data Science Complète : la dérive de concept impose un suivi continu.', difficulty: 'medium', tags: ['derive-concept'] },
        ],
      },
    },
    'ia-cybersecurity': {
      1: {
        title: 'Quiz — Des réseaux de neurones aux LLM',
        questions: [
          { id: 'q1', question: 'Quelle est une différence clé entre ML classique et deep learning ?', options: ['Le deep learning ne nécessite jamais de données', 'Le deep learning peut apprendre des caractéristiques directement à partir de données brutes, souvent au prix de l’interprétabilité', 'Le ML classique est toujours plus performant', 'Il n’y a aucune différence réelle'], correct: 1, explanation: 'Le deep learning excelle sur de grands volumes mais reste souvent moins interprétable.', difficulty: 'medium', tags: ['deep-learning'] },
          { id: 'q2', question: 'Pourquoi l’IA générative est-elle qualifiée de "dual-use" en sécurité ?', options: ['Elle ne sert qu’à la défense', 'Les mêmes capacités servent aussi bien la défense (résumés, rapports) que l’attaque (phishing, malware)', 'Elle ne sert qu’à l’attaque', 'Le terme ne s’applique pas à l’IA'], correct: 1, explanation: 'La génération de texte convaincant sert autant l’analyste que l’attaquant.', difficulty: 'medium', tags: ['dual-use'] },
        ],
      },
      2: {
        title: 'Quiz — Détection d’anomalies par deep learning',
        questions: [
          { id: 'q1', question: 'Comment un autoencodeur détecte-t-il une anomalie ?', options: ['Il compare directement à une liste de signatures connues', 'Une erreur de reconstruction élevée révèle un écart par rapport aux motifs normaux appris', 'Il nécessite des exemples étiquetés d’attaques', 'Il ne peut détecter que des anomalies déjà vues'], correct: 1, explanation: 'L’autoencodeur reconstruit mal ce qui s’écarte du trafic normal appris.', difficulty: 'medium', tags: ['autoencodeur'] },
          { id: 'q2', question: 'Pourquoi un autoencodeur entraîné sur des données non représentatives pose-t-il problème ?', options: ['Cela n’a aucune conséquence', 'Il produira de nombreux faux positifs sur un trafic réel plus varié', 'Il ne pourra jamais s’entraîner', 'Cela le rend plus précis'], correct: 1, explanation: 'La représentativité des données d’entraînement conditionne la fiabilité du modèle.', difficulty: 'medium', tags: ['donnees'] },
        ],
      },
      3: {
        title: 'Quiz — NLP appliqué à la sécurité',
        questions: [
          { id: 'q1', question: 'Quel avantage les embeddings ont-ils sur le simple sac de mots ?', options: ['Aucun avantage réel', 'Ils capturent des relations de sens entre mots, pas seulement leur fréquence', 'Ils sont toujours plus rapides à calculer', 'Ils ne fonctionnent qu’en anglais'], correct: 1, explanation: 'Les embeddings représentent le sens, permettant de mesurer une similarité sémantique.', difficulty: 'medium', tags: ['embeddings'] },
          { id: 'q2', question: 'Pourquoi le "log parsing" est-il nécessaire avant d’analyser des logs textuels ?', options: ['Ce n’est jamais nécessaire', 'Des messages similaires varient en détail (identifiants, timestamps), rendant un comptage exact inefficace', 'Les logs sont toujours parfaitement structurés', 'Cela concerne uniquement les emails'], correct: 1, explanation: 'Regrouper les messages similaires malgré leurs variations est une étape préalable indispensable.', difficulty: 'medium', tags: ['log-parsing'] },
        ],
      },
      4: {
        title: 'Quiz — Agents IA autonomes',
        questions: [
          { id: 'q1', question: 'Qu’est-ce qui distingue un agent d’un simple modèle de classification ?', options: ['Rien, ce sont des synonymes', 'Un agent peut enchaîner plusieurs actions autonomes vers un objectif, avec accès à des outils', 'Un agent ne peut traiter qu’une seule entrée à la fois', 'Un agent n’a jamais de mémoire'], correct: 1, explanation: 'Un agent perçoit, décide et agit sur plusieurs étapes, contrairement à un modèle simple.', difficulty: 'medium', tags: ['agents'] },
          { id: 'q2', question: 'Pourquoi l’accès à des outils capables d’agir introduit-il un risque opérationnel ?', options: ['Cela n’introduit aucun risque', 'Un agent manipulé ou qui interprète mal une instruction peut causer des dommages réels', 'Les outils ralentissent toujours l’agent', 'Les agents n’ont jamais accès à des outils'], correct: 1, explanation: 'Sans supervision, un agent avec des outils d’action peut causer des dommages au-delà d’une simple erreur textuelle.', difficulty: 'hard', tags: ['risques'] },
        ],
      },
      5: {
        title: 'Quiz — Agents IA pour l’automatisation SOC',
        questions: [
          { id: 'q1', question: 'Sur quelle tâche SOC un agent IA apporte-t-il le plus de valeur typiquement ?', options: ['La signature de contrats', 'Le triage initial et l’enrichissement de contexte des alertes', 'Le recrutement d’analystes', 'La gestion budgétaire du SOC'], correct: 1, explanation: 'Le triage et l’enrichissement automatique de contexte libèrent du temps analyste pour les cas ambigus.', difficulty: 'easy', tags: ['soc'] },
          { id: 'q2', question: 'Pourquoi la traçabilité complète des décisions d’un agent est-elle indispensable ?', options: ['Ce n’est qu’un détail administratif', 'Sans elle, une attaque réelle mal classée et clôturée pourrait passer complètement inaperçue', 'Elle ralentit inutilement l’agent', 'Elle n’est nécessaire que pour les gros SOC'], correct: 1, explanation: 'La traçabilité permet l’audit a posteriori et la détection d’erreurs de l’agent.', difficulty: 'medium', tags: ['tracabilite'] },
        ],
      },
      6: {
        title: 'Quiz — IA offensive et risques',
        questions: [
          { id: 'q1', question: 'Qu’est-ce que le prompt injection ?', options: ['Une technique de chiffrement', 'Insérer des instructions cachées dans des données traitées par un agent pour détourner son comportement', 'Une méthode d’entraînement de modèle', 'Une attaque réseau classique'], correct: 1, explanation: 'Le prompt injection manipule un agent via des instructions cachées dans les données qu’il traite.', difficulty: 'medium', tags: ['prompt-injection'] },
          { id: 'q2', question: 'Qu’est-ce qui distingue une attaque adversariale d’une simple erreur de modèle ?', options: ['Rien, c’est la même chose', 'Elle modifie délibérément une entrée de façon minime pour tromper le modèle, sans changer sa perception humaine', 'Elle ne concerne que les images', 'Elle nécessite un accès physique au serveur'], correct: 1, explanation: 'L’attaque adversariale est une manipulation intentionnelle et ciblée, pas une erreur aléatoire.', difficulty: 'hard', tags: ['adversarial'] },
        ],
      },
      7: {
        title: 'Quiz — Gouvernance et limites de l’IA',
        questions: [
          { id: 'q1', question: 'Que classifie l’AI Act européen ?', options: ['Uniquement les entreprises technologiques', 'Les systèmes d’IA selon leur niveau de risque', 'Uniquement les modèles de langage', 'Les salaires des ingénieurs IA'], correct: 1, explanation: 'Un système à fort impact peut relever d’une catégorie à risque élevé avec des obligations renforcées.', difficulty: 'medium', tags: ['ai-act'] },
          { id: 'q2', question: 'Quel est le principal risque de gouvernance de l’IA en sécurité selon ce chapitre ?', options: ['L’IA elle-même est toujours dangereuse', 'Une confiance excessive et non questionnée envers les décisions du modèle', 'Le coût des serveurs', 'L’absence totale d’IA dans les SOC'], correct: 1, explanation: 'Traiter la sortie d’un modèle comme une vérité incontestable est l’erreur la plus coûteuse.', difficulty: 'medium', tags: ['gouvernance'] },
        ],
      },
    },
    'soc-analysis': {
      1: {
        title: 'Quiz — Le SOC, rôles et niveaux',
        questions: [
          { id: 'q1', question: 'Quelle est la mission principale d’un SOC ?', options: ['Développer des logiciels', 'Surveiller en continu le SI pour détecter, analyser et répondre aux incidents', 'Gérer uniquement la paie des employés', 'Vendre des licences logicielles'], correct: 1, explanation: 'Le SOC assure une surveillance continue du système d’information.', difficulty: 'easy', tags: ['soc'] },
          { id: 'q2', question: 'Quelle est la différence de rôle entre un analyste N1 et un N3 ?', options: ['Aucune différence réelle', 'Le N1 applique des procédures documentées, le N3 recherche proactivement des menaces non détectées', 'Le N3 fait uniquement du support technique', 'Le N1 gère le budget du SOC'], correct: 1, explanation: 'Le N3/threat hunter va au-delà du triage pour anticiper des menaces non détectées.', difficulty: 'medium', tags: ['niveaux'] },
        ],
      },
      2: {
        title: 'Quiz — Triage d’alertes, méthodologie',
        questions: [
          { id: 'q1', question: 'Quels sont les deux axes de priorisation d’une alerte ?', options: ['Le coût et la durée', 'La criticité et la confiance', 'La couleur et la taille', 'Le nom de l’analyste et l’heure'], correct: 1, explanation: 'Criticité (impact potentiel) et confiance (fiabilité de la détection) guident la priorisation.', difficulty: 'easy', tags: ['triage'] },
          { id: 'q2', question: 'Pourquoi la fatigue d’alerte est-elle un risque de sécurité en soi ?', options: ['Elle n’a aucun impact réel', 'Un volume excessif d’alertes peut conduire à clôturer machinalement une alerte légitime', 'Elle ne concerne que les débutants', 'Elle améliore la vigilance des analystes'], correct: 1, explanation: 'Des analystes expérimentés peuvent aussi être affectés par la fatigue d’alerte.', difficulty: 'medium', tags: ['fatigue-alerte'] },
        ],
      },
      3: {
        title: 'Quiz — SIEM, collecte et corrélation',
        questions: [
          { id: 'q1', question: 'Quelle est la valeur principale d’un SIEM au-delà du stockage de logs ?', options: ['Le stockage à long terme uniquement', 'La corrélation d’événements de sources multiples pour révéler une attaque', 'La facturation des services cloud', 'La gestion des mots de passe'], correct: 1, explanation: 'La corrélation relie des événements isolés qui, ensemble, révèlent une attaque.', difficulty: 'medium', tags: ['siem'] },
          { id: 'q2', question: 'Pourquoi une règle de détection à seuil rigide peut-elle être contournée ?', options: ['Elle ne peut jamais être contournée', 'Un attaquant peut espacer ses tentatives pour rester sous le seuil', 'Les règles rigides sont toujours plus efficaces', 'Cela ne concerne que les très grandes entreprises'], correct: 1, explanation: 'Un attaquant patient peut éviter de déclencher un seuil fixe en ralentissant ses actions.', difficulty: 'medium', tags: ['regles-detection'] },
        ],
      },
      4: {
        title: 'Quiz — Cyber Kill Chain et MITRE ATT&CK',
        questions: [
          { id: 'q1', question: 'Pourquoi stopper une attaque tôt dans la Kill Chain est-il préférable ?', options: ['Cela n’a aucune importance', 'Moins l’attaque progresse dans la chaîne, moins l’impact final est important', 'Il faut toujours attendre la dernière phase pour agir', 'La Kill Chain ne sert qu’à la communication marketing'], correct: 1, explanation: 'Bloquer tôt (reconnaissance, livraison) évite les phases plus coûteuses (installation, exfiltration).', difficulty: 'medium', tags: ['kill-chain'] },
          { id: 'q2', question: 'Quel est l’avantage principal de MITRE ATT&CK par rapport à la Kill Chain ?', options: ['Aucun avantage réel', 'Un niveau de détail opérationnel supérieur avec des techniques précises documentées', 'Il est plus ancien', 'Il ne concerne que les attaques réseau'], correct: 1, explanation: 'ATT&CK documente des techniques précises exploitables pour la détection concrète.', difficulty: 'medium', tags: ['attack'] },
        ],
      },
      5: {
        title: 'Quiz — Investigation d’une alerte',
        questions: [
          { id: 'q1', question: 'Par quoi une investigation doit-elle toujours commencer ?', options: ['Une conclusion déjà décidée', 'Une hypothèse à vérifier', 'La rédaction du rapport final', 'La clôture immédiate de l’alerte'], correct: 1, explanation: 'Une investigation part d’une hypothèse à confirmer ou réfuter, jamais d’une conclusion préétablie.', difficulty: 'easy', tags: ['investigation'] },
          { id: 'q2', question: 'Pourquoi examine-t-on en priorité les sources de preuve les plus éphémères ?', options: ['Ce n’est pas important', 'Elles risquent de disparaître avant que l’on puisse les examiner plus tard', 'Elles sont toujours moins fiables', 'Il n’existe pas de différence de volatilité entre les sources'], correct: 1, explanation: 'Rappel du principe d’ordre de volatilité du cours Forensics & DFIR.', difficulty: 'medium', tags: ['volatilite'] },
        ],
      },
      6: {
        title: 'Quiz — Playbooks et SOAR',
        questions: [
          { id: 'q1', question: 'Quelle est la différence de rôle entre SIEM et SOAR ?', options: ['Aucune différence', 'Le SIEM détecte et corrèle, le SOAR orchestre et automatise la réponse', 'Le SOAR remplace totalement le SIEM', 'Le SIEM ne sert qu’à la facturation'], correct: 1, explanation: 'Le SOAR agit une fois que le SIEM a généré une alerte.', difficulty: 'medium', tags: ['soar'] },
          { id: 'q2', question: 'Pourquoi une action irréversible ne doit-elle pas être automatisée sans validation humaine ?', options: ['Ce n’est jamais un problème', 'Elle pourrait causer des dégâts collatéraux pires que l’incident lui-même', 'Les actions irréversibles sont toujours souhaitables', 'L’automatisation est toujours plus sûre'], correct: 1, explanation: 'Une action à fort impact mal déclenchée automatiquement peut aggraver la situation.', difficulty: 'medium', tags: ['automatisation'] },
        ],
      },
      7: {
        title: 'Quiz — Threat hunting',
        questions: [
          { id: 'q1', question: 'Quelle est la différence fondamentale entre threat hunting et détection réactive ?', options: ['Aucune différence', 'Le threat hunting cherche activement des menaces sans attendre qu’une alerte se déclenche', 'Le threat hunting est entièrement automatisé', 'La détection réactive est toujours plus efficace'], correct: 1, explanation: 'Le threat hunting part du principe qu’un attaquant pourrait déjà être présent sans alerte.', difficulty: 'medium', tags: ['threat-hunting'] },
          { id: 'q2', question: 'Pourquoi un résultat négatif de chasse reste-t-il utile ?', options: ['Il ne l’est jamais', 'Il confirme, dans la limite des données disponibles, l’absence d’un vecteur d’attaque spécifique', 'Il prouve l’absence totale de risque', 'Seuls les résultats positifs comptent'], correct: 1, explanation: 'Une chasse négative documente l’absence vérifiée d’un vecteur précis.', difficulty: 'medium', tags: ['resultat-negatif'] },
        ],
      },
      8: {
        title: 'Quiz — Synthèse progression analyste N2',
        questions: [
          { id: 'q1', question: 'Qu’est-ce qui distingue fondamentalement un analyste N1 d’un analyste N2 ?', options: ['Le salaire uniquement', 'Le N2 développe un jugement d’investigation autonome au-delà des procédures', 'Le N1 ne fait jamais d’erreur', 'Aucune différence de compétence'], correct: 1, explanation: 'Le N2 formule des hypothèses et corrèle sans qu’un playbook ne le dicte à chaque étape.', difficulty: 'medium', tags: ['progression'] },
          { id: 'q2', question: 'Quel cours Nyx complémentaire approfondit le plus l’investigation vue au chapitre 5 ?', options: ['Psychologie et Ingénierie Sociale', 'Forensics & DFIR', 'Cheatsheet', 'Flashcards'], correct: 1, explanation: 'Le cours DFIR approfondit l’investigation au-delà du triage SOC.', difficulty: 'easy', tags: ['synthese'] },
        ],
      },
    },
    psychologie: {
      1: {
        title: 'Quiz — Introduction à l’ingénierie sociale',
        questions: [
          { id: 'q1', question: 'Pourquoi une vulnérabilité humaine ne peut-elle jamais être "corrigée" comme une vulnérabilité technique ?', options: ['Ce n’est pas vrai, elle se corrige comme les autres', 'Les biais cognitifs sont universels et permanents chez l’être humain', 'Les humains ne sont jamais vulnérables', 'Seuls les logiciels ont des vulnérabilités'], correct: 1, explanation: 'Contrairement à un correctif logiciel, un biais cognitif reste actif en permanence.', difficulty: 'easy', tags: ['ingenierie-sociale'] },
          { id: 'q2', question: 'Pourquoi l’ingénierie sociale ne peut-elle être pratiquée légalement que sous autorisation écrite ?', options: ['Ce n’est pas nécessaire pour ce type de test', 'Elle implique de manipuler des personnes réelles, un cadre légal encore plus strict que pour un pentest technique', 'Seuls les tests techniques nécessitent une autorisation', 'L’autorisation orale suffit toujours'], correct: 1, explanation: 'Rappel du cours Droit et Réglementation sur le cadre légal du hacking éthique.', difficulty: 'medium', tags: ['legal'] },
        ],
      },
      2: {
        title: 'Quiz — Les biais cognitifs exploités',
        questions: [
          { id: 'q1', question: 'Pourquoi le biais d’autorité est-il efficace quand un attaquant se fait passer pour le support informatique ?', options: ['Il ne l’est pas réellement', 'Les gens obéissent plus facilement à une figure perçue comme légitime', 'Le support informatique n’a aucune autorité perçue', 'Ce biais ne s’applique qu’aux enfants'], correct: 1, explanation: 'Le biais d’autorité pousse à obéir sans remettre en question la demande.', difficulty: 'easy', tags: ['autorite'] },
          { id: 'q2', question: 'Pourquoi est-il contre-productif de dire qu’une victime de phishing a "manqué de vigilance" ?', options: ['C’est toujours vrai et utile de le dire', 'Ces biais affectent tout le monde, y compris des experts, sous pression de temps', 'Les victimes de phishing ne sont jamais concernées par des biais', 'Cela motive les employés à mieux faire'], correct: 1, explanation: 'Blâmer l’individu ignore le caractère universel des biais cognitifs.', difficulty: 'medium', tags: ['biais'] },
        ],
      },
      3: {
        title: 'Quiz — Le phishing et ses variantes',
        questions: [
          { id: 'q1', question: 'Quelle est la différence entre spear phishing et whaling ?', options: ['Aucune différence', 'Le whaling cible spécifiquement des dirigeants ou cadres à haute responsabilité', 'Le spear phishing est toujours moins dangereux', 'Le whaling ne concerne que les PME'], correct: 1, explanation: 'Le whaling est une forme de spear phishing ciblant des cadres dirigeants.', difficulty: 'medium', tags: ['whaling'] },
          { id: 'q2', question: 'Pourquoi demander un code de vérification SMS à une victime est-il un piège particulièrement dangereux ?', options: ['Cela n’a aucune conséquence réelle', 'L’attaquant a probablement initié lui-même une tentative de connexion, et ce code sert à l’authentifier lui', 'Les codes SMS ne servent jamais à rien', 'C’est une pratique totalement sûre'], correct: 1, explanation: 'Le code demandé sert en réalité à valider la session initiée par l’attaquant.', difficulty: 'hard', tags: ['vishing'] },
        ],
      },
      4: {
        title: 'Quiz — Le prétexting et l’usurpation d’identité',
        questions: [
          { id: 'q1', question: 'En quoi le prétexting diffère-t-il d’un email de phishing ponctuel ?', options: ['Aucune différence', 'Il construit un scénario complet et cohérent maintenu sur la durée', 'Il est toujours moins efficace', 'Il ne concerne que les emails'], correct: 1, explanation: 'Le prétexting maintient une légende crédible sur plusieurs interactions.', difficulty: 'medium', tags: ['pretexting'] },
          { id: 'q2', question: 'Quelle politique organisationnelle limite le risque de tailgating ?', options: ['Aucune politique ne peut y remédier', 'Une politique stricte de badge individuel pour chaque personne', 'Laisser toujours la porte ouverte', 'Supprimer tous les contrôles d’accès'], correct: 1, explanation: 'Badge individuel systématique, même en groupe, contre la politesse exploitée par le tailgating.', difficulty: 'medium', tags: ['tailgating'] },
        ],
      },
      5: {
        title: 'Quiz — Former et protéger les utilisateurs',
        questions: [
          { id: 'q1', question: 'Pourquoi une formation annuelle générique échoue-t-elle souvent ?', options: ['Elle ne devrait jamais être générique', 'Les biais cognitifs restent actifs sous pression réelle, indépendamment de la théorie connue', 'Les employés ne suivent jamais ces formations', 'La formation générique est toujours suffisante'], correct: 1, explanation: 'Connaître la théorie ne suffit pas face à un biais actif en situation de stress.', difficulty: 'medium', tags: ['formation'] },
          { id: 'q2', question: 'Pourquoi un canal de signalement non punitif est-il crucial ?', options: ['Ce n’est pas important', 'Il permet un signalement rapide, réduisant le délai de réponse à un incident réel', 'Il encourage à cliquer sur des liens suspects', 'Il remplace totalement la formation'], correct: 1, explanation: 'Rappel du cours Analyse SOC : plus une alerte est signalée tôt, plus la réponse peut limiter l’impact.', difficulty: 'medium', tags: ['signalement'] },
        ],
      },
      6: {
        title: 'Quiz — Synthèse éthique du social engineering',
        questions: [
          { id: 'q1', question: 'Pourquoi l’autorisation d’un test d’ingénierie sociale doit-elle être plus précise qu’un pentest technique classique ?', options: ['Ce n’est pas nécessaire', 'Elle doit couvrir explicitement les techniques autorisées et exclure les sujets personnels sensibles', 'Un test d’ingénierie sociale ne nécessite aucune autorisation', 'Les deux types d’autorisation sont identiques'], correct: 1, explanation: 'Le social engineering touche directement des personnes réelles, nécessitant un cadrage plus strict.', difficulty: 'medium', tags: ['ethique'] },
          { id: 'q2', question: 'Pourquoi nommer publiquement les employés ayant échoué à un test de phishing est-il problématique ?', options: ['Ce n’est jamais un problème', 'Cela nuit à la confiance envers l’équipe sécurité et décourage le signalement spontané', 'Cela motive toujours positivement les employés', 'C’est une pratique recommandée par tous les experts'], correct: 1, explanation: 'Le blâme public décourage exactement le comportement de signalement recherché.', difficulty: 'medium', tags: ['debriefing'] },
        ],
      },
    },
    'cyber-offensive': {
      1: {
        title: 'Quiz — Méthodologie de pentest CEH/OSCP',
        questions: [
          { id: 'q1', question: 'Quelle est la toute première étape d’un pentest professionnel ?', options: ['La reconnaissance', 'Le cadrage et l’obtention d’une autorisation écrite', 'L’exploitation directe', 'La rédaction du rapport'], correct: 1, explanation: 'Aucune phase ne peut légalement commencer sans autorisation écrite précise.', difficulty: 'easy', tags: ['methodologie'] },
          { id: 'q2', question: 'Quelle est la différence d’approche entre CEH et OSCP ?', options: ['Aucune différence', 'CEH est plus généraliste, OSCP est centré sur l’exploitation pratique intensive en laboratoire', 'OSCP n’a pas d’examen pratique', 'CEH est uniquement pratique'], correct: 1, explanation: 'OSCP évalue par un examen pratique de 24h sur des machines réelles.', difficulty: 'medium', tags: ['certifications'] },
        ],
      },
      2: {
        title: 'Quiz — Reconnaissance et OSINT',
        questions: [
          { id: 'q1', question: 'Pourquoi commence-t-on par la reconnaissance passive ?', options: ['Elle est plus rapide uniquement', 'Elle est indétectable et ne génère aucun log côté cible', 'Elle est toujours obligatoire par la loi', 'Elle remplace la reconnaissance active'], correct: 1, explanation: 'La reconnaissance passive ne génère aucune interaction directe détectable.', difficulty: 'easy', tags: ['reconnaissance'] },
          { id: 'q2', question: 'Pourquoi un sous-domaine "dev" découvert en reconnaissance est-il intéressant ?', options: ['Il ne l’est jamais', 'Les environnements de développement sont statistiquement moins durcis que la production', 'Il indique toujours une vulnérabilité critique', 'Il n’a aucun rapport avec la sécurité'], correct: 1, explanation: 'Un environnement de dev/test est souvent un point d’entrée privilégié.', difficulty: 'medium', tags: ['osint'] },
        ],
      },
      3: {
        title: 'Quiz — Scan et énumération des services',
        questions: [
          { id: 'q1', question: 'Pourquoi une stratégie de scan en plusieurs passes est-elle efficace ?', options: ['Elle ne l’est pas', 'Elle réduit le temps total tout en garantissant une couverture complète', 'Elle est obligatoire légalement', 'Elle ne fonctionne que sur un seul port'], correct: 1, explanation: 'Un scan large rapide puis ciblé optimise temps et couverture.', difficulty: 'medium', tags: ['scan'] },
          { id: 'q2', question: 'Que révèle une énumération SMB anonyme réussie ?', options: ['Rien d’utile', 'Une liste de comptes utilisateurs à cibler pour une authentification', 'Le mot de passe administrateur directement', 'Une vulnérabilité déjà corrigée'], correct: 1, explanation: 'Les comptes énumérés réduisent l’espace de recherche d’un bruteforce ultérieur.', difficulty: 'medium', tags: ['enumeration'] },
        ],
      },
      4: {
        title: 'Quiz — Exploitation de vulnérabilités web',
        questions: [
          { id: 'q1', question: 'Pourquoi une application réelle présente-t-elle rarement une seule vulnérabilité isolée ?', options: ['Ce n’est jamais le cas en pratique', 'Plusieurs failles coexistent souvent et peuvent être enchaînées pour un impact plus grand', 'Une seule faille suffit toujours à tout compromettre', 'Les applications modernes n’ont qu’une faille par design'], correct: 1, explanation: 'Enchaîner XSS, IDOR et autres failles combinées est fréquent en pratique.', difficulty: 'medium', tags: ['exploitation-web'] },
          { id: 'q2', question: 'Pourquoi un scanner automatisé ne suffit-il pas pour l’IDOR ?', options: ['Les scanners détectent toujours l’IDOR parfaitement', 'L’IDOR est une faille de logique métier nécessitant une analyse manuelle', 'L’IDOR n’existe pas en pratique', 'Les scanners ne fonctionnent que sur les IDOR'], correct: 1, explanation: 'Les failles de logique métier échappent souvent aux outils automatisés.', difficulty: 'medium', tags: ['idor'] },
        ],
      },
      5: {
        title: 'Quiz — Exploitation réseau et services',
        questions: [
          { id: 'q1', question: 'Quelle est la différence entre exploitation directe et exploitation par identifiants ?', options: ['Aucune différence', 'La première exploite une faille logicielle, la seconde des identifiants faibles ou par défaut', 'L’exploitation par identifiants est toujours illégale', 'L’exploitation directe ne nécessite jamais d’exploit'], correct: 1, explanation: 'Ce sont deux familles distinctes de vecteurs d’accès réseau.', difficulty: 'medium', tags: ['exploitation-reseau'] },
          { id: 'q2', question: 'Pourquoi utiliser Metasploit "en boîte noire" pose-t-il problème ?', options: ['Ce n’est jamais un problème', 'Cela empêche d’adapter la technique et de comprendre les enseignements pour le rapport', 'Metasploit ne fonctionne qu’en boîte noire', 'Metasploit est illégal à utiliser'], correct: 1, explanation: 'Comprendre le mécanisme sous-jacent reste indispensable pour l’adaptation et le rapport.', difficulty: 'medium', tags: ['metasploit'] },
        ],
      },
      6: {
        title: 'Quiz — Élévation de privilèges Linux et Windows',
        questions: [
          { id: 'q1', question: 'Quel est l’équivalent Windows de la recherche des binaires SUID Linux ?', options: ['Il n’y en a pas', 'La recherche de services mal configurés et de jetons de privilèges (WinPEAS)', 'Uniquement le changement de mot de passe', 'La désinstallation d’antivirus'], correct: 1, explanation: 'WinPEAS effectue une énumération équivalente à LinPEAS côté Windows.', difficulty: 'medium', tags: ['privesc'] },
          { id: 'q2', question: 'Qu’est-ce qu’AlwaysInstallElevated ?', options: ['Un antivirus Windows', 'Un paramètre de registre permettant d’installer un MSI avec privilèges administrateur', 'Une fonction de sauvegarde', 'Un pare-feu Windows'], correct: 1, explanation: 'Mal configuré, il permet à tout utilisateur d’exécuter du code avec privilèges élevés.', difficulty: 'hard', tags: ['windows'] },
        ],
      },
      7: {
        title: 'Quiz — Mouvement latéral et Active Directory',
        questions: [
          { id: 'q1', question: 'Pourquoi BloodHound est-il quasi incontournable en mission AD réelle ?', options: ['Il n’apporte rien de particulier', 'Il rend praticable en quelques minutes une analyse humainement impossible manuellement sur un grand domaine', 'Il remplace totalement Kerberoasting', 'Il ne fonctionne que sur de petits domaines'], correct: 1, explanation: 'L’énumération manuelle exhaustive serait impraticable sur un domaine de taille réelle.', difficulty: 'medium', tags: ['bloodhound'] },
          { id: 'q2', question: 'Pourquoi un domaine durci selon le modèle de tiering présente-t-il moins de chemins d’attaque ?', options: ['Ce n’est pas lié au tiering', 'Le tiering limite les relations de privilège exploitables entre niveaux', 'Le tiering désactive BloodHound', 'Le tiering ne concerne que les mots de passe'], correct: 1, explanation: 'Un tiering correct réduit drastiquement les chemins identifiables par BloodHound.', difficulty: 'medium', tags: ['tiering'] },
        ],
      },
      8: {
        title: 'Quiz — Post-exploitation et persistance',
        questions: [
          { id: 'q1', question: 'Quels sont les trois objectifs principaux de la post-exploitation ?', options: ['Supprimer toutes les preuves uniquement', 'Consolider l’accès, étendre la visibilité, atteindre l’objectif de mission', 'Redémarrer tous les serveurs', 'Modifier le pare-feu uniquement'], correct: 1, explanation: 'Ces trois objectifs structurent la phase de post-exploitation.', difficulty: 'medium', tags: ['post-exploitation'] },
          { id: 'q2', question: 'Pourquoi chaque mécanisme de persistance établi en pentest doit-il être documenté et retiré ?', options: ['Ce n’est pas nécessaire', 'Un mécanisme oublié peut devenir une vulnérabilité exploitable par un vrai attaquant', 'La documentation ralentit inutilement la mission', 'Les mécanismes de persistance se suppriment automatiquement'], correct: 1, explanation: 'Un mécanisme oublié après la mission constitue un risque réel pour le client.', difficulty: 'medium', tags: ['persistance'] },
        ],
      },
      9: {
        title: 'Quiz — Ingénierie sociale en pentest',
        questions: [
          { id: 'q1', question: 'Pourquoi intégrer l’ingénierie sociale à une mission de pentest technique ?', options: ['Ce n’est jamais utile', 'L’humain reste souvent le vecteur d’accès initial le plus réaliste', 'Cela remplace toute exploitation technique', 'C’est obligatoire légalement dans tous les cas'], correct: 1, explanation: 'Un pentest purement technique peut manquer le vecteur d’accès le plus fréquent en réalité.', difficulty: 'medium', tags: ['ingenierie-sociale'] },
          { id: 'q2', question: 'Quelle règle du cours Psychologie s’applique impérativement au debrief d’une campagne de phishing simulé ?', options: ['Nommer publiquement les employés ayant cliqué', 'Ne jamais nommer ou blâmer publiquement les individus concernés', 'Sanctionner financièrement les employés concernés', 'Publier les résultats sur les réseaux sociaux de l’entreprise'], correct: 1, explanation: 'L’objectif reste l’amélioration collective, jamais la sanction individuelle.', difficulty: 'medium', tags: ['ethique'] },
        ],
      },
      10: {
        title: 'Quiz — Rapport final et debrief client',
        questions: [
          { id: 'q1', question: 'Pourquoi un rapport racontant la chronologie complète d’une mission a-t-il plus d’impact ?', options: ['Ce n’est pas le cas, une liste suffit toujours', 'Il montre concrètement comment un accès modeste peut mener à un objectif critique', 'Il est toujours plus court qu’une liste', 'Les directions ne lisent jamais les chronologies'], correct: 1, explanation: 'La narration complète a souvent plus d’impact qu’une liste de vulnérabilités déconnectées.', difficulty: 'medium', tags: ['rapport'] },
          { id: 'q2', question: 'Par quoi doit s’ouvrir un debrief client, avant tout détail technique ?', options: ['La liste complète des outils utilisés', 'Le niveau de risque global', 'Le prix de la prestation', 'Les noms des employés impliqués'], correct: 1, explanation: 'L’auditoire, souvent mixte, a besoin du verdict avant le détail technique.', difficulty: 'easy', tags: ['debrief'] },
        ],
      },
    },
    'cyber-defensive': {
      1: {
        title: 'Quiz — Principes de la défense en profondeur',
        questions: [
          { id: 'q1', question: 'Pourquoi superpose-t-on plusieurs couches de défense plutôt que de renforcer une seule ?', options: ['Ce n’est pas utile', 'La défaillance d’une couche ne compromet pas l’ensemble du système', 'Une seule couche est toujours suffisante', 'Cela ralentit uniquement le système'], correct: 1, explanation: 'Le principe de défense en profondeur limite l’impact de la défaillance d’une seule couche.', difficulty: 'easy', tags: ['defense-profondeur'] },
          { id: 'q2', question: 'Qu’illustre le modèle du Swiss cheese en cybersécurité ?', options: ['Qu’une seule couche parfaite suffit', 'Que plusieurs couches imparfaites rendent statistiquement improbable qu’une attaque traverse tout', 'Que le fromage protège des cyberattaques', 'Que les couches de défense sont inutiles'], correct: 1, explanation: 'Les trous de chaque couche s’alignent rarement, contrairement à une seule couche.', difficulty: 'medium', tags: ['swiss-cheese'] },
        ],
      },
      2: {
        title: 'Quiz — Durcissement des systèmes',
        questions: [
          { id: 'q1', question: 'Quelle mesure contre directement l’énumération SMB anonyme ?', options: ['Augmenter la bande passante', 'Désactiver l’accès anonyme et restreindre l’énumération', 'Changer uniquement le mot de passe administrateur', 'Installer un antivirus'], correct: 1, explanation: 'La désactivation de l’accès anonyme SMB contre directement ce vecteur d’énumération.', difficulty: 'medium', tags: ['durcissement'] },
          { id: 'q2', question: 'Pourquoi un durcissement uniforme sans priorisation pose-t-il problème ?', options: ['Ce n’est jamais un problème', 'Un système critique exposé peut rester vulnérable plus longtemps que nécessaire', 'Le durcissement uniforme est toujours plus rapide', 'La priorisation n’a aucun impact réel'], correct: 1, explanation: 'La priorisation par risque réel garantit que les systèmes critiques sont traités en premier.', difficulty: 'medium', tags: ['priorisation'] },
        ],
      },
      3: {
        title: 'Quiz — Segmentation réseau et Zero Trust',
        questions: [
          { id: 'q1', question: 'Quelle est la différence entre le modèle "château fort" et le Zero Trust ?', options: ['Aucune différence', 'Le Zero Trust vérifie explicitement chaque accès, sans confiance implicite liée à la localisation réseau', 'Le château fort est plus sûr', 'Le Zero Trust ne concerne que les mots de passe'], correct: 1, explanation: 'Le Zero Trust élimine la confiance implicite accordée par le seul fait d’être sur le réseau interne.', difficulty: 'medium', tags: ['zero-trust'] },
          { id: 'q2', question: 'Pourquoi le Zero Trust complique-t-il le mouvement latéral ?', options: ['Il ne le complique pas', 'Il exige une nouvelle vérification à chaque nouvelle ressource accédée', 'Il supprime totalement le réseau interne', 'Il ne concerne que les serveurs externes'], correct: 1, explanation: 'Un attaquant ayant compromis un point doit re-authentifier à chaque nouvel accès.', difficulty: 'medium', tags: ['mouvement-lateral'] },
        ],
      },
      4: {
        title: 'Quiz — Gestion des identités et des accès en profondeur',
        questions: [
          { id: 'q1', question: 'Pourquoi l’élévation de privilège Just-In-Time réduit-elle le risque ?', options: ['Elle ne réduit aucun risque', 'Elle limite la durée d’exposition par rapport à un accès permanent', 'Elle est plus lente donc plus sûre', 'Elle supprime le besoin d’authentification'], correct: 1, explanation: 'Un accès temporaire réduit la fenêtre d’exploitation possible.', difficulty: 'medium', tags: ['pam'] },
          { id: 'q2', question: 'Comment LAPS contre-t-il le Pass-the-Hash ?', options: ['Il ne le contre pas', 'En faisant tourner régulièrement les mots de passe administrateur locaux', 'En désactivant tous les comptes locaux', 'En chiffrant le réseau entier'], correct: 1, explanation: 'La rotation régulière des mots de passe locaux limite la réutilisation d’un hash volé.', difficulty: 'hard', tags: ['laps'] },
        ],
      },
      5: {
        title: 'Quiz — Détection SIEM, EDR et supervision',
        questions: [
          { id: 'q1', question: 'Quelle est la différence de niveau d’observation entre SIEM et EDR ?', options: ['Aucune différence', 'Le SIEM corrèle à l’échelle du SI, l’EDR surveille en détail un poste individuel', 'L’EDR remplace totalement le SIEM', 'Le SIEM ne fonctionne que sur un seul poste'], correct: 1, explanation: 'Les deux niveaux d’observation sont complémentaires.', difficulty: 'medium', tags: ['siem-edr'] },
          { id: 'q2', question: 'Pourquoi une organisation avec EDR mais sans SIEM présente-t-elle un angle mort ?', options: ['Ce n’est pas un problème', 'Elle manque la corrélation d’événements entre systèmes multiples', 'L’EDR seul est toujours suffisant', 'Le SIEM ne sert à rien en pratique'], correct: 1, explanation: 'Le SIEM apporte la vue corrélée entre systèmes que l’EDR seul ne fournit pas.', difficulty: 'medium', tags: ['angle-mort'] },
        ],
      },
      6: {
        title: 'Quiz — Réponse à incident, méthodologie complète',
        questions: [
          { id: 'q1', question: 'Quelle est la différence entre confinement, éradication et remédiation ?', options: ['Ce sont des synonymes', 'Le confinement stoppe la propagation, l’éradication supprime la cause, la remédiation corrige durablement', 'La remédiation précède toujours le confinement', 'Seule l’éradication compte'], correct: 1, explanation: 'Ce sont trois temporalités distinctes de la réponse à incident.', difficulty: 'medium', tags: ['reponse-incident'] },
          { id: 'q2', question: 'Pourquoi le juridique doit-il être impliqué dès le début d’une réponse à incident ?', options: ['Ce n’est jamais nécessaire', 'Une décision de communication prise sans consultation peut aggraver l’exposition légale', 'Le juridique ne sert qu’après la clôture', 'Cela ralentit inutilement la réponse'], correct: 1, explanation: 'L’évaluation légale précoce (RGPD notamment) est cruciale dès le début.', difficulty: 'medium', tags: ['legal'] },
        ],
      },
      7: {
        title: 'Quiz — Sauvegarde et continuité d’activité',
        questions: [
          { id: 'q1', question: 'Pourquoi la sauvegarde est-elle la dernière couche de la défense en profondeur ?', options: ['Elle ne l’est pas', 'Elle garantit la survie même si toutes les couches précédentes ont échoué', 'Elle remplace toutes les autres couches', 'Elle n’a aucun rapport avec la défense en profondeur'], correct: 1, explanation: 'C’est la garantie ultime de résilience face à une attaque réussie.', difficulty: 'medium', tags: ['sauvegarde'] },
          { id: 'q2', question: 'Quelle est la différence entre PRA et PCA ?', options: ['Aucune différence', 'Le PRA reconstruit l’infrastructure, le PCA maintient l’activité métier pendant la restauration', 'Le PCA ne concerne que l’informatique', 'Le PRA est toujours plus rapide'], correct: 1, explanation: 'Les deux plans sont complémentaires face à un incident paralysant.', difficulty: 'medium', tags: ['pra-pca'] },
        ],
      },
      8: {
        title: 'Quiz — Threat intelligence et veille défensive',
        questions: [
          { id: 'q1', question: 'Quelle est la différence entre threat intelligence stratégique et opérationnelle ?', options: ['Aucune différence', 'La stratégique répond aux tendances générales, l’opérationnelle aux indicateurs précis (IOC)', 'L’opérationnelle ne concerne que le long terme', 'La stratégique ne sert à rien en pratique'], correct: 1, explanation: 'Les trois niveaux répondent à des granularités différentes.', difficulty: 'medium', tags: ['threat-intelligence'] },
          { id: 'q2', question: 'Pourquoi un IOC opérationnel devient-il rapidement obsolète ?', options: ['Ce n’est jamais le cas', 'Les attaquants changent régulièrement leur infrastructure (IP, domaines)', 'Les IOC ne changent jamais', 'Seule la threat intelligence stratégique existe'], correct: 1, explanation: 'La threat intelligence tactique (techniques) reste plus durable que les IOC ponctuels.', difficulty: 'medium', tags: ['ioc'] },
        ],
      },
      9: {
        title: 'Quiz — Red Team, Blue Team et Purple Team',
        questions: [
          { id: 'q1', question: 'Quelle est la différence fondamentale entre Red Team classique et Purple Team ?', options: ['Aucune différence', 'Le Purple Team fait collaborer Red et Blue en temps réel, avec partage immédiat des observations', 'Le Red Team classique est toujours plus efficace', 'Le Purple Team ne teste rien de réel'], correct: 1, explanation: 'La collaboration en temps réel accélère considérablement l’amélioration de la détection.', difficulty: 'medium', tags: ['purple-team'] },
          { id: 'q2', question: 'Pourquoi un exercice Red/Blue Team mal encadré peut-il être contre-productif ?', options: ['Ce n’est jamais un problème', 'Il peut créer une confrontation compétitive plutôt qu’une amélioration collective', 'Les exercices Red/Blue sont toujours inutiles', 'Cela ne concerne que les grandes entreprises'], correct: 1, explanation: 'L’objectif reste l’amélioration collective, jamais la compétition entre équipes.', difficulty: 'medium', tags: ['ethique'] },
        ],
      },
      10: {
        title: 'Quiz — Amélioration continue et maturité de sécurité',
        questions: [
          { id: 'q1', question: 'Pourquoi un post-mortem ne doit-il jamais se limiter au correctif immédiat ?', options: ['Le correctif immédiat suffit toujours', 'Il doit identifier les défaillances structurelles de la défense en profondeur pour éviter la récidive', 'Un post-mortem ne sert à rien', 'Il faut toujours blâmer un individu responsable'], correct: 1, explanation: 'Un post-mortem constructif interroge les causes structurelles, pas seulement le symptôme.', difficulty: 'medium', tags: ['post-mortem'] },
          { id: 'q2', question: 'Quels sont les trois niveaux de maturité de sécurité présentés dans ce chapitre ?', options: ['Débutant, intermédiaire, expert', 'Réactif, géré, proactif', 'Faible, moyen, fort', 'Novice, apprenti, maître'], correct: 1, explanation: 'Cette progression rejoint le système de progression Novice/Apprenti/Intermédiaire de Nyx.', difficulty: 'easy', tags: ['maturite'] },
        ],
      },
    },
    'fichiers-bdd': {
      1: {
        title: 'Quiz — Systèmes de fichiers, structure et métadonnées',
        questions: [
          { id: 'q1', question: 'Que désigne l’acronyme MACB en forensique de fichiers ?', options: ['Un type de système de fichiers', 'Les métadonnées temporelles Modified/Accessed/Changed/Born d’un fichier', 'Un protocole réseau', 'Un algorithme de hachage'], correct: 1, explanation: 'MACB regroupe les quatre horodatages temporels associés à un fichier, essentiels en forensique.', difficulty: 'medium', tags: ['metadonnees'] },
          { id: 'q2', question: 'Pourquoi les métadonnées d’un fichier sont-elles aussi importantes que son contenu en investigation ?', options: ['Elles ne le sont pas', 'Elles révèlent le contexte (qui, quand) que le contenu seul ne révèle pas', 'Elles remplacent le besoin d’analyser le contenu', 'Elles ne concernent que les images'], correct: 1, explanation: 'Les métadonnées fournissent un contexte temporel et d’origine indispensable en DFIR.', difficulty: 'easy', tags: ['forensique'] },
        ],
      },
      2: {
        title: 'Quiz — Formats de fichiers et structure interne',
        questions: [
          { id: 'q1', question: 'À quoi sert un "magic byte" (signature de fichier) ?', options: ['À chiffrer le fichier', 'À identifier le vrai type d’un fichier indépendamment de son extension', 'À compresser le fichier', 'À le rendre exécutable'], correct: 1, explanation: 'Les magic bytes permettent d’identifier le format réel, même si l’extension a été modifiée.', difficulty: 'medium', tags: ['magic-bytes'] },
          { id: 'q2', question: 'Pourquoi un fichier renommé avec une fausse extension ne trompe-t-il pas un outil d’analyse sérieux ?', options: ['Il trompe toujours ces outils', 'L’outil vérifie la signature interne réelle du fichier, pas son extension', 'Les extensions ne peuvent jamais être modifiées', 'Ce n’est vrai que pour les images'], correct: 1, explanation: 'L’analyse de la signature interne déjoue le simple renommage d’extension.', difficulty: 'medium', tags: ['file-carving'] },
        ],
      },
      3: {
        title: 'Quiz — Fondamentaux des bases relationnelles',
        questions: [
          { id: 'q1', question: 'Que permet une clé étrangère dans une base relationnelle ?', options: ['Rien de particulier', 'De lier une ligne d’une table à une ligne d’une autre table, garantissant l’intégrité référentielle', 'De chiffrer une colonne', 'D’indexer automatiquement la table'], correct: 1, explanation: 'La clé étrangère garantit qu’une référence pointe toujours vers une ligne existante.', difficulty: 'easy', tags: ['sql'] },
          { id: 'q2', question: 'Pourquoi comprendre le modèle relationnel est-il un prérequis pour comprendre l’injection SQL ?', options: ['Ce n’est pas lié', 'Comprendre la structure des requêtes permet de comprendre comment les manipuler malicieusement', 'L’injection SQL ne concerne pas les bases relationnelles', 'Le modèle relationnel empêche toute injection'], correct: 1, explanation: 'Il faut comprendre la syntaxe légitime pour comprendre comment elle peut être détournée.', difficulty: 'medium', tags: ['injection-sql'] },
        ],
      },
      4: {
        title: 'Quiz — Bases de données NoSQL',
        questions: [
          { id: 'q1', question: 'Quel opérateur MongoDB est classiquement exploité en injection NoSQL ?', options: ['$select', '$ne (not equal)', '$create', '$delete'], correct: 1, explanation: 'L’opérateur $ne, injecté dans un champ non validé, peut contourner une authentification.', difficulty: 'hard', tags: ['nosql-injection'] },
          { id: 'q2', question: 'Redis appartient à quelle famille de bases NoSQL ?', options: ['Document', 'Clé-valeur', 'Graphe', 'Colonne large'], correct: 1, explanation: 'Redis est une base clé-valeur, déjà utilisée pour le cache dans l’infrastructure Nyx.', difficulty: 'easy', tags: ['redis'] },
        ],
      },
      5: {
        title: 'Quiz — Sécurité des bases de données',
        questions: [
          { id: 'q1', question: 'Pourquoi un compte applicatif avec des droits d’administration complets sur la base est-il risqué ?', options: ['Ce n’est jamais risqué', 'Une injection SQL réussie aurait alors un impact maximal sur toute la base', 'Cela ralentit uniquement les requêtes', 'Les droits d’administration accélèrent les performances'], correct: 1, explanation: 'Le moindre privilège limite directement l’impact d’une compromission via injection.', difficulty: 'medium', tags: ['moindre-privilege'] },
          { id: 'q2', question: 'Pourquoi chiffrer une base à la fois au repos et en transit ?', options: ['Un seul type de chiffrement suffit toujours', 'Ils protègent contre des menaces différentes, vol physique et interception réseau', 'Le chiffrement en transit remplace celui au repos', 'Ce n’est jamais nécessaire simultanément'], correct: 1, explanation: 'Les deux formes de chiffrement se complètent contre des scénarios de menace distincts.', difficulty: 'medium', tags: ['chiffrement'] },
        ],
      },
      6: {
        title: 'Quiz — Injection SQL en profondeur',
        questions: [
          { id: 'q1', question: 'Qu’est-ce qu’une injection boolean-blind ?', options: ['Une injection visible dans un message d’erreur', 'Une déduction d’information bit par bit selon le comportement vrai/faux de la page', 'Une injection qui chiffre la base', 'Une injection impossible à automatiser'], correct: 1, explanation: 'L’attaquant déduit l’information caractère par caractère via un signal indirect vrai/faux.', difficulty: 'hard', tags: ['blind-sqli'] },
          { id: 'q2', question: 'Pourquoi les requêtes préparées neutralisent-elles les techniques d’évasion de filtres ?', options: ['Elles ne les neutralisent pas', 'Elles séparent structurellement le code SQL des données, rendant l’évasion sans objet', 'Elles chiffrent automatiquement les requêtes', 'Elles ne fonctionnent que sur NoSQL'], correct: 1, explanation: 'La séparation structurelle rend inopérantes les techniques de contournement de filtres.', difficulty: 'medium', tags: ['prepared-statements'] },
        ],
      },
      7: {
        title: 'Quiz — Sauvegarde et intégrité des données',
        questions: [
          { id: 'q1', question: 'Que garantit l’atomicité (le "A" d’ACID) d’une transaction ?', options: ['Que la transaction est toujours rapide', 'Qu’elle s’exécute entièrement ou pas du tout', 'Qu’elle est toujours chiffrée', 'Qu’elle ne peut jamais échouer'], correct: 1, explanation: 'L’atomicité empêche qu’une transaction ne s’applique que partiellement en cas d’échec.', difficulty: 'medium', tags: ['acid'] },
          { id: 'q2', question: 'Pourquoi vérifier le hash d’une sauvegarde avant restauration ?', options: ['Ce n’est jamais utile', 'Pour détecter une corruption ou altération survenue depuis la sauvegarde', 'Pour accélérer la restauration', 'Pour chiffrer automatiquement la sauvegarde'], correct: 1, explanation: 'Rappel du principe de chaîne de custody déjà vu en forensique et cryptographie.', difficulty: 'medium', tags: ['integrite'] },
        ],
      },
    },
    'machine-learning': {
      1: {
        title: "Quiz — Types et paradigmes d'apprentissage automatique",
        questions: [
          { id: 'q1', question: 'Qu’est-ce qui distingue l’apprentissage par renforcement de l’apprentissage supervisé ?', options: ['Aucune différence', 'L’agent apprend par essai-erreur via une récompense, sans exemples étiquetés fournis à l’avance', 'Le renforcement nécessite toujours plus de données étiquetées', 'Le renforcement ne s’applique jamais à des problèmes réels'], correct: 1, explanation: 'L’apprentissage par renforcement n’utilise aucune paire entrée-sortie étiquetée à l’avance.', difficulty: 'medium', tags: ['renforcement'] },
          { id: 'q2', question: 'Pourquoi ce cours approfondit-il mathématiquement des algorithmes déjà utilisés de façon appliquée ?', options: ['Pour remplacer scikit-learn', 'Pour permettre d’ajuster finement un modèle plutôt que de l’utiliser par défaut', 'Ce n’est jamais utile en pratique', 'Parce que scikit-learn ne fonctionne pas réellement'], correct: 1, explanation: 'Comprendre le détail mathématique permet un ajustement fin impossible en restant à l’usage par défaut.', difficulty: 'easy', tags: ['methodologie'] },
        ],
      },
      2: {
        title: 'Quiz — Régression linéaire et logistique',
        questions: [
          { id: 'q1', question: 'Que cherche à minimiser l’entraînement d’une régression linéaire ?', options: ['Le nombre de variables', 'L’erreur quadratique moyenne entre valeurs prédites et réelles', 'Le temps de calcul uniquement', 'Le nombre d’exemples d’entraînement'], correct: 1, explanation: 'La régression linéaire minimise la MSE (mean squared error) entre prédictions et réalité.', difficulty: 'easy', tags: ['regression'] },
          { id: 'q2', question: 'Pourquoi la régression logistique sert-elle à la classification malgré son nom ?', options: ['Elle ne sert pas à la classification', 'Elle applique une sigmoïde pour transformer une régression linéaire en probabilité de classe', 'Elle ne produit jamais de probabilité', 'Elle est identique à la régression linéaire'], correct: 1, explanation: 'La fonction sigmoïde convertit le résultat linéaire en une probabilité entre 0 et 1.', difficulty: 'medium', tags: ['regression-logistique'] },
        ],
      },
      3: {
        title: "Quiz — Arbres de décision et méthodes d'ensemble",
        questions: [
          { id: 'q1', question: 'Pourquoi un arbre de décision isolé, trop profond, généralise-t-il souvent mal ?', options: ['Ce n’est jamais le cas', 'Il mémorise les particularités du jeu d’entraînement plutôt qu’une règle générale', 'Un arbre profond est toujours plus rapide', 'Les arbres ne peuvent pas surapprendre'], correct: 1, explanation: 'Un arbre trop profond surapprend, un phénomène déjà rencontré en data science.', difficulty: 'medium', tags: ['surapprentissage'] },
          { id: 'q2', question: 'Quelle est la différence fondamentale entre bagging et boosting ?', options: ['Aucune différence', 'Le bagging entraîne des arbres indépendamment, le boosting les entraîne séquentiellement en corrigeant les erreurs précédentes', 'Le boosting est toujours plus rapide', 'Le bagging ne fonctionne que sur des données textuelles'], correct: 1, explanation: 'Random Forest (bagging) et Gradient Boosting illustrent ces deux approches distinctes.', difficulty: 'medium', tags: ['ensemble'] },
        ],
      },
      4: {
        title: 'Quiz — SVM et k-NN approfondi',
        questions: [
          { id: 'q1', question: 'À quoi sert le kernel trick (astuce du noyau) dans une SVM ?', options: ['À accélérer uniquement le calcul', 'À projeter implicitement les données dans un espace où elles deviennent linéairement séparables', 'À réduire le nombre d’exemples nécessaires', 'À remplacer la fonction d’activation'], correct: 1, explanation: 'Le kernel trick permet de séparer des données non linéairement séparables sans calcul explicite coûteux.', difficulty: 'hard', tags: ['svm'] },
          { id: 'q2', question: 'Pourquoi k-NN est-il qualifié d’algorithme d’apprentissage "paresseux" ?', options: ['Il est lent à l’exécution uniquement', 'Il ne construit aucun modèle à l’entraînement, il mémorise simplement les données', 'Il ne fonctionne jamais correctement', 'Il n’a besoin d’aucune donnée'], correct: 1, explanation: 'k-NN diffère structurellement des autres algorithmes en n’ayant pas de phase d’entraînement propre.', difficulty: 'medium', tags: ['knn'] },
        ],
      },
      5: {
        title: 'Quiz — Clustering approfondi',
        questions: [
          { id: 'q1', question: 'Pourquoi DBSCAN est-il particulièrement adapté à la détection d’anomalies ?', options: ['Il ne l’est pas', 'Il identifie explicitement les points isolés comme du bruit, sans forcer chaque point dans un groupe', 'Il nécessite toujours de fixer k à l’avance', 'Il ne fonctionne que sur des données sphériques'], correct: 1, explanation: 'Contrairement à k-means, DBSCAN peut désigner un point comme du bruit plutôt que de l’assigner de force.', difficulty: 'medium', tags: ['dbscan'] },
          { id: 'q2', question: 'Quel avantage offre le clustering hiérarchique par rapport à k-means ?', options: ['Aucun avantage réel', 'Le dendrogramme permet de choisir le nombre de groupes après coup, à tout niveau de granularité', 'Il est toujours plus rapide sur de grands volumes', 'Il ne nécessite jamais de calcul de distance'], correct: 1, explanation: 'Le dendrogramme offre une vue à tous les niveaux, contrairement à un k fixé à l’avance.', difficulty: 'medium', tags: ['hierarchique'] },
        ],
      },
      6: {
        title: 'Quiz — Réduction de dimension et sélection de caractéristiques',
        questions: [
          { id: 'q1', question: 'Que représentent les composantes principales calculées par l’ACP ?', options: ['Les variables originales inchangées', 'De nouvelles variables combinées, ordonnées par variance expliquée décroissante', 'Le nombre d’exemples du jeu de données', 'Les clusters trouvés par k-means'], correct: 1, explanation: 'L’ACP crée des combinaisons linéaires des variables originales, ordonnées par variance expliquée.', difficulty: 'medium', tags: ['pca'] },
          { id: 'q2', question: 'Pourquoi préférer la sélection de caractéristiques à l’ACP quand l’interprétabilité compte ?', options: ['L’ACP est toujours plus interprétable', 'La sélection conserve les variables originales, contrairement aux combinaisons de l’ACP', 'Elles sont strictement équivalentes', 'La sélection ne réduit jamais la dimension'], correct: 1, explanation: 'La sélection de caractéristiques garde des variables directement interprétables, contrairement à l’ACP.', difficulty: 'medium', tags: ['feature-selection'] },
        ],
      },
      7: {
        title: 'Quiz — Évaluation rigoureuse et mise en production',
        questions: [
          { id: 'q1', question: 'Qu’est-ce que la fuite de données (data leakage) ?', options: ['Une perte de données par panne matérielle', 'Une information de l’ensemble de test qui s’infiltre indirectement dans l’entraînement', 'Un chiffrement mal configuré', 'Une erreur de syntaxe dans le code d’entraînement'], correct: 1, explanation: 'Normaliser avant le split train/test est un exemple classique de fuite de données.', difficulty: 'medium', tags: ['data-leakage'] },
          { id: 'q2', question: 'Pourquoi la dérive de concept est-elle critique pour un modèle de détection d’intrusion ?', options: ['Elle ne l’est pas particulièrement', 'Les techniques d’attaque évoluent, un modèle figé peut manquer des variantes récentes', 'Un modèle ne dérive jamais une fois entraîné', 'La dérive ne concerne que les images'], correct: 1, explanation: 'Un modèle de détection doit être réévalué et réentraîné pour suivre l’évolution des menaces.', difficulty: 'medium', tags: ['concept-drift'] },
        ],
      },
    },
    'deep-learning': {
      1: {
        title: 'Quiz — Le perceptron et la descente de gradient',
        questions: [
          { id: 'q1', question: 'Pourquoi la fonction d’activation d’un perceptron doit-elle être non linéaire ?', options: ['Elle n’a pas besoin de l’être', 'Sans non-linéarité, même plusieurs couches ne pourraient modéliser que des relations linéaires', 'La non-linéarité ralentit uniquement le calcul', 'Elle sert uniquement à normaliser les entrées'], correct: 1, explanation: 'La non-linéarité est indispensable pour modéliser des motifs complexes au-delà du linéaire.', difficulty: 'medium', tags: ['activation'] },
          { id: 'q2', question: 'Pourquoi un perceptron isolé ne peut-il pas résoudre XOR ?', options: ['XOR est en réalité linéairement séparable', 'XOR n’est pas linéairement séparable, une limite du perceptron isolé', 'Un perceptron ne peut traiter que des nombres négatifs', 'Ce n’est vrai que pour la fonction sigmoïde'], correct: 1, explanation: 'Cette limite historique a motivé le développement de réseaux à plusieurs couches.', difficulty: 'hard', tags: ['xor'] },
        ],
      },
      2: {
        title: 'Quiz — Réseaux profonds et rétropropagation',
        questions: [
          { id: 'q1', question: 'Que calcule la propagation avant (forward pass) ?', options: ['La contribution de chaque poids à l’erreur', 'La sortie du réseau pour une entrée donnée', 'Le nombre de couches nécessaires', 'La dérivée de la fonction de coût uniquement'], correct: 1, explanation: 'La propagation avant produit la prédiction, la rétropropagation calcule ensuite l’ajustement des poids.', difficulty: 'easy', tags: ['forward-pass'] },
          { id: 'q2', question: 'Pourquoi la rétropropagation était-elle nécessaire pour entraîner des réseaux profonds ?', options: ['Elle ne l’était pas réellement', 'Elle calcule efficacement, via la règle de dérivation en chaîne, la contribution de chaque poids à l’erreur', 'Elle remplace le besoin de données d’entraînement', 'Elle ne concerne que la couche de sortie'], correct: 1, explanation: 'Sans rétropropagation, ajuster individuellement chaque poids serait numériquement intraitable.', difficulty: 'hard', tags: ['backpropagation'] },
        ],
      },
      3: {
        title: 'Quiz — Réseaux de neurones convolutifs (CNN)',
        questions: [
          { id: 'q1', question: 'Pourquoi un réseau dense classique est-il mal adapté aux images ?', options: ['Il fonctionne parfaitement sur les images', 'Il ignore la structure spatiale et produit un nombre de poids explosif', 'Les images ne peuvent pas être représentées numériquement', 'Un réseau dense ne peut traiter que du texte'], correct: 1, explanation: 'Le CNN exploite la structure spatiale via des filtres glissants, contrairement au réseau dense.', difficulty: 'medium', tags: ['cnn'] },
          { id: 'q2', question: 'Quel est le rôle du pooling dans un CNN ?', options: ['Ajouter de nouvelles couches denses', 'Réduire la dimension des cartes d’activation en conservant les activations les plus fortes', 'Chiffrer les données de l’image', 'Remplacer la convolution'], correct: 1, explanation: 'Le max-pooling réduit le volume de calcul et améliore la robustesse aux petites variations de position.', difficulty: 'medium', tags: ['pooling'] },
        ],
      },
      4: {
        title: 'Quiz — RNN et LSTM',
        questions: [
          { id: 'q1', question: 'Qu’est-ce que le problème du gradient qui s’évanouit ?', options: ['Un problème de mémoire matérielle', 'Le gradient devient extrêmement petit sur de longues séquences, limitant l’apprentissage de dépendances lointaines', 'Une erreur de configuration réseau', 'Un problème propre uniquement aux CNN'], correct: 1, explanation: 'Ce problème limite fortement les RNN classiques sur de longues séquences.', difficulty: 'hard', tags: ['gradient-evanouissant'] },
          { id: 'q2', question: 'Quel mécanisme le LSTM utilise-t-il pour résoudre ce problème ?', options: ['Un mécanisme de portes régulant explicitement la mémoire (oubli, entrée, sortie)', 'Une couche de pooling supplémentaire', 'La suppression totale de la mémoire', 'Un chiffrement des poids'], correct: 0, explanation: 'Les portes du LSTM régulent explicitement ce qui est retenu, oublié ou transmis à chaque étape.', difficulty: 'medium', tags: ['lstm'] },
        ],
      },
      5: {
        title: "Quiz — Transformers et attention",
        questions: [
          { id: 'q1', question: 'Quelle limite majeure des RNN/LSTM le mécanisme d’attention permet-il de dépasser ?', options: ['Le coût de stockage des données', 'Le traitement strictement séquentiel qui empêche la parallélisation', 'Le besoin de données d’entraînement', 'La nécessité d’une fonction d’activation'], correct: 1, explanation: 'L’attention traite toute la séquence en parallèle, contrairement au traitement séquentiel des RNN.', difficulty: 'medium', tags: ['transformers'] },
          { id: 'q2', question: 'Pourquoi faut-il rester prudent face aux réponses d’un modèle basé sur les Transformers ?', options: ['Ces modèles sont toujours parfaitement exacts', 'Ils restent des outils statistiques pouvant produire des réponses plausibles mais incorrectes (hallucinations)', 'Ils ne peuvent traiter que des séquences courtes', 'Ils ne peuvent jamais être utilisés en sécurité'], correct: 1, explanation: 'Le risque d’hallucination impose une vérification humaine, surtout en contexte de sécurité.', difficulty: 'medium', tags: ['hallucinations'] },
        ],
      },
      6: {
        title: 'Quiz — Entraîner un modèle deep learning',
        questions: [
          { id: 'q1', question: 'Pourquoi les GPU accélèrent-ils l’entraînement du deep learning ?', options: ['Ils ne l’accélèrent pas réellement', 'Ils parallélisent massivement les multiplications matricielles au cœur du calcul', 'Ils remplacent le besoin de données', 'Ils suppriment le besoin de rétropropagation'], correct: 1, explanation: 'Les GPU, conçus pour le rendu graphique, excellent au calcul matriciel parallèle massif.', difficulty: 'medium', tags: ['gpu'] },
          { id: 'q2', question: 'Comment le dropout aide-t-il à limiter le surapprentissage ?', options: ['En supprimant définitivement des neurones du réseau', 'En désactivant aléatoirement une fraction des neurones à chaque étape d’entraînement', 'En augmentant le taux d’apprentissage', 'En réduisant le nombre de données d’entraînement'], correct: 1, explanation: 'Cette désactivation aléatoire empêche le réseau de trop dépendre de neurones spécifiques.', difficulty: 'medium', tags: ['dropout'] },
        ],
      },
      7: {
        title: 'Quiz — Déploiement et limites du deep learning en sécurité',
        questions: [
          { id: 'q1', question: 'Qu’est-ce qu’une attaque adversariale ?', options: ['Une attaque réseau classique par déni de service', 'Une perturbation minime d’une entrée, conçue pour tromper un modèle avec une confiance élevée', 'Un vol de données d’entraînement', 'Une attaque qui ne concerne que les CNN'], correct: 1, explanation: 'Ces perturbations exploitent les frontières de décision du modèle, souvent imperceptibles pour un humain.', difficulty: 'hard', tags: ['adversarial'] },
          { id: 'q2', question: 'Pourquoi un modèle de deep learning ne devrait-il jamais être une autorité de décision autonome en cybersécurité ?', options: ['Ces modèles sont toujours infaillibles', 'Son opacité, sa vulnérabilité adversariale et sa dérive de concept exigent une supervision humaine', 'Ils ne peuvent jamais être utilisés en production', 'Ils remplacent totalement l’analyse humaine avec succès'], correct: 1, explanation: 'Opacité, vulnérabilité et dérive de concept imposent de le traiter comme une aide à la décision, pas une autorité.', difficulty: 'medium', tags: ['limites'] },
        ],
      },
    },
    'securite-applications-api': {
      1: {
        title: 'Quiz — SSDLC et modélisation des menaces',
        questions: [
          { id: 'q1', question: 'Pourquoi une faille détectée en production coûte-t-elle généralement plus cher qu’à la conception ?', options: ['Ce n’est jamais le cas', 'Le SSDLC intègre la sécurité à chaque étape, une faille tardive coûte plus cher en urgence et en réputation', 'Le coût est toujours identique', 'Seule la phase de test compte réellement'], correct: 1, explanation: 'Le SSDLC répond directement à ce constat en intégrant la sécurité dès la conception.', difficulty: 'easy', tags: ['ssdlc'] },
          { id: 'q2', question: 'Que signifie le "T" de STRIDE ?', options: ['Trust (confiance)', 'Tampering (altération)', 'Testing (test)', 'Transfer (transfert)'], correct: 1, explanation: 'Tampering désigne la modification non autorisée de données ou de code.', difficulty: 'medium', tags: ['stride'] },
        ],
      },
      2: {
        title: 'Quiz — OWASP API Security Top 10',
        questions: [
          { id: 'q1', question: 'Qu’est-ce que BOLA ?', options: ['Une attaque par déni de service uniquement', 'Un défaut de vérification d’autorisation au niveau d’un objet précis de l’API', 'Un algorithme de chiffrement', 'Un type de pare-feu applicatif'], correct: 1, explanation: 'BOLA est la vulnérabilité API la plus critique, une forme d’IDOR appliquée aux objets exposés par l’API.', difficulty: 'medium', tags: ['bola'] },
          { id: 'q2', question: 'Pourquoi ne faut-il jamais compter sur le client pour filtrer les champs sensibles d’une réponse API ?', options: ['Le client filtre toujours correctement', 'Un attaquant peut inspecter directement la réponse brute de l’API et voir tous les champs renvoyés', 'Les champs sensibles ne sont jamais renvoyés par une API', 'Cela ralentit uniquement l’application'], correct: 1, explanation: 'L’excessive data exposure survient quand le filtrage n’est pas effectué côté serveur.', difficulty: 'medium', tags: ['data-exposure'] },
        ],
      },
      3: {
        title: 'Quiz — OAuth 2.0, JWT et clés API',
        questions: [
          { id: 'q1', question: 'Quel est l’intérêt principal d’OAuth 2.0 ?', options: ['Chiffrer les mots de passe', 'Permettre une délégation d’accès sans partager de mot de passe avec une application tierce', 'Remplacer totalement les API REST', 'Accélérer les requêtes réseau'], correct: 1, explanation: 'OAuth 2.0 délivre un token limité en portée et en durée, sans jamais exposer le mot de passe.', difficulty: 'easy', tags: ['oauth2'] },
          { id: 'q2', question: 'Pourquoi ne faut-il jamais placer d’information sensible en clair dans un JWT ?', options: ['Un JWT est toujours chiffré intégralement', 'La charge utile est seulement encodée en base64, lisible par quiconque intercepte le jeton', 'Les JWT ne peuvent jamais être interceptés', 'Cela ralentit uniquement la vérification côté serveur'], correct: 1, explanation: 'Seule la signature garantit l’intégrité, pas la confidentialité de la charge utile.', difficulty: 'medium', tags: ['jwt'] },
        ],
      },
      4: {
        title: 'Quiz — GraphQL et sécurité des API modernes',
        questions: [
          { id: 'q1', question: 'Pourquoi l’introspection GraphQL est-elle risquée si elle reste activée en production ?', options: ['Elle ralentit uniquement les requêtes', 'Elle révèle instantanément tout le schéma de l’API, équivalent à une reconnaissance gratuite pour un attaquant', 'Elle chiffre automatiquement les réponses', 'Elle n’a aucun impact réel sur la sécurité'], correct: 1, explanation: 'L’introspection expose tous les types, champs et opérations disponibles de l’API.', difficulty: 'medium', tags: ['introspection'] },
          { id: 'q2', question: 'Pourquoi une requête GraphQL profondément imbriquée peut-elle causer un déni de service ?', options: ['Ce n’est jamais possible en GraphQL', 'Sans limite de profondeur ou de complexité, elle peut générer une charge de calcul disproportionnée côté serveur', 'GraphQL limite toujours automatiquement la profondeur', 'Cela ne concerne que les mutations, jamais les requêtes'], correct: 1, explanation: 'La flexibilité de GraphQL permet des requêtes très coûteuses sans limite imposée par défaut.', difficulty: 'medium', tags: ['graphql-dos'] },
        ],
      },
      5: {
        title: 'Quiz — Sécurité des microservices',
        questions: [
          { id: 'q1', question: 'Pourquoi une architecture microservices élargit-elle la surface d’attaque ?', options: ['Ce n’est jamais le cas', 'Elle multiplie les communications inter-services, chacune une frontière de confiance potentielle', 'Les microservices sont toujours plus sûrs qu’un monolithe', 'Elle ne concerne que les API publiques'], correct: 1, explanation: 'Chaque communication inter-services doit être sécurisée comme une API exposée publiquement.', difficulty: 'medium', tags: ['microservices'] },
          { id: 'q2', question: 'Que garantit le mTLS par rapport au TLS classique ?', options: ['Rien de différent', 'Une authentification mutuelle : chaque service prouve son identité à l’autre', 'Un chiffrement plus rapide uniquement', 'Il remplace le besoin de segmentation réseau'], correct: 1, explanation: 'Le mTLS exige un certificat de chaque côté, contrairement au TLS classique à sens unique.', difficulty: 'medium', tags: ['mtls'] },
        ],
      },
      6: {
        title: 'Quiz — Chaîne d’approvisionnement logicielle',
        questions: [
          { id: 'q1', question: 'Qu’est-ce que le typosquatting de paquet ?', options: ['Une faute de frappe dans le code source', 'Un paquet malveillant publié sous un nom très proche d’un paquet légitime', 'Un type de chiffrement faible', 'Une vulnérabilité réseau classique'], correct: 1, explanation: 'Le typosquatting espère qu’une erreur de frappe à l’installation profite au paquet malveillant.', difficulty: 'medium', tags: ['typosquatting'] },
          { id: 'q2', question: 'À quoi sert un SBOM ?', options: ['À chiffrer le code source', 'À inventorier exhaustivement tous les composants logiciels d’une application pour répondre rapidement à une nouvelle CVE', 'À remplacer les tests SAST', 'À accélérer uniquement le déploiement'], correct: 1, explanation: 'Le SBOM permet une réponse quasi immédiate face à une CVE critique publiée sur un composant courant.', difficulty: 'medium', tags: ['sbom'] },
        ],
      },
      7: {
        title: 'Quiz — SAST, DAST et SCA',
        questions: [
          { id: 'q1', question: 'Quelle est la principale limite du SAST ?', options: ['Il ne peut jamais s’exécuter sur du code source', 'Il génère souvent de nombreux faux positifs et ne détecte pas les failles propres à l’exécution', 'Il est toujours plus lent que le DAST', 'Il remplace totalement le DAST'], correct: 1, explanation: 'Le SAST analyse le code statiquement, sans jamais l’exécuter réellement.', difficulty: 'medium', tags: ['sast'] },
          { id: 'q2', question: 'Que recherche spécifiquement un outil SCA ?', options: ['Des failles dans le code source propre de l’équipe', 'Des vulnérabilités connues (CVE) dans les dépendances tierces utilisées', 'Des failles de configuration réseau', 'Des failles uniquement détectables à l’exécution'], correct: 1, explanation: 'Le SCA cible spécifiquement les composants tiers et leurs CVE publiées.', difficulty: 'medium', tags: ['sca'] },
        ],
      },
      8: {
        title: 'Quiz — DevSecOps et intégration CI/CD',
        questions: [
          { id: 'q1', question: 'À quelle étape du pipeline le SCA peut-il s’exécuter, par rapport au DAST ?', options: ['Uniquement après le DAST', 'Dès que les dépendances sont résolues, bien avant que le DAST ne nécessite une application déployée', 'Jamais avant la mise en production', 'Au même moment exact que le DAST toujours'], correct: 1, explanation: 'Le SCA n’a besoin que du fichier de dépendances, alors que le DAST nécessite une application en cours d’exécution.', difficulty: 'medium', tags: ['pipeline'] },
          { id: 'q2', question: 'Pourquoi une politique de blocage systématique au moindre avertissement mineur est-elle contre-productive ?', options: ['Elle ralentit uniquement les tests', 'Les équipes sous pression finissent par contourner un pipeline trop strict', 'Elle améliore toujours la sécurité sans inconvénient', 'Elle ne concerne que les grandes entreprises'], correct: 1, explanation: 'Une criticité graduée garantit que seules les vulnérabilités réellement critiques bloquent le déploiement.', difficulty: 'medium', tags: ['devsecops'] },
        ],
      },
    },
  }

  for (const [courseSlug, chapterQuizzes] of Object.entries(QUIZZES)) {
    const course = await prisma.course.findUniqueOrThrow({ where: { slug: courseSlug } })
    for (const [chapterNumber, quiz] of Object.entries(chapterQuizzes)) {
      const chapter = await prisma.chapter.findFirstOrThrow({ where: { courseId: course.id, number: Number(chapterNumber) } })
      await prisma.quiz.create({ data: { chapterId: chapter.id, title: quiz.title, questions: quiz.questions as object } })
    }
  }

  // Ressources curées Nyx — une référence externe fiable par chapitre, en plus de celles ajoutées par l'utilisateur
  const RESOURCES: Record<string, Record<number, { title: string; url: string; type: string }>> = {
    linux: {
      1: { title: 'Documentation officielle Kali Linux', url: 'https://www.kali.org/docs/', type: 'article' },
      2: { title: 'Linux Journey — Permissions', url: 'https://linuxjourney.com/lesson/file-permissions', type: 'article' },
      3: { title: 'systemd — documentation officielle', url: 'https://www.freedesktop.org/software/systemd/man/systemd.html', type: 'article' },
      4: { title: 'GNU Bash Reference Manual', url: 'https://www.gnu.org/software/bash/manual/bash.html', type: 'article' },
      5: { title: 'CIS Benchmarks (durcissement système)', url: 'https://www.cisecurity.org/cis-benchmarks', type: 'link' },
    },
    reseaux: {
      1: { title: 'Cloudflare — Le modèle OSI expliqué', url: 'https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-osi-model/', type: 'article' },
      2: { title: 'Cloudflare — Qu’est-ce qu’un sous-réseau', url: 'https://www.cloudflare.com/learning/network-layer/what-is-a-subnet/', type: 'article' },
      3: { title: 'Cloudflare — TCP/IP expliqué', url: 'https://www.cloudflare.com/learning/ddos/glossary/tcp-ip/', type: 'article' },
      4: { title: 'MDN — Vue d’ensemble de HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview', type: 'article' },
      5: { title: 'Cisco — VLAN, notions de base', url: 'https://www.cisco.com/c/en/us/tech/lan-switching/vlan/index.html', type: 'link' },
      6: { title: 'Cloudflare — Qu’est-ce qu’un pare-feu', url: 'https://www.cloudflare.com/learning/security/glossary/what-is-a-firewall/', type: 'article' },
      7: { title: 'Wireshark — Documentation officielle', url: 'https://www.wireshark.org/docs/', type: 'article' },
      8: { title: 'OWASP — Catalogue des attaques', url: 'https://owasp.org/www-community/attacks/', type: 'link' },
    },
    'web-security': {
      1: { title: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/', type: 'link' },
      2: { title: 'PortSwigger Web Security Academy', url: 'https://portswigger.net/web-security', type: 'link' },
      3: { title: 'OWASP — SQL Injection', url: 'https://owasp.org/www-community/attacks/SQL_Injection', type: 'article' },
      4: { title: 'OWASP — Cross-Site Scripting (XSS)', url: 'https://owasp.org/www-community/attacks/xss/', type: 'article' },
      5: { title: 'OWASP Cheat Sheet — Authentication', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html', type: 'article' },
      6: { title: 'OWASP Cheat Sheet — IDOR Prevention', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html', type: 'article' },
      7: { title: 'OWASP Cheat Sheet — SSRF Prevention', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html', type: 'article' },
      8: { title: 'FIRST — Calculateur CVSS 3.1', url: 'https://www.first.org/cvss/calculator/3.1', type: 'tool' },
    },
    'intro-cyber': {
      1: { title: 'CISA — Bonnes pratiques de cybersécurité', url: 'https://www.cisa.gov/topics/cybersecurity-best-practices', type: 'link' },
      2: { title: 'ANSSI — Agence nationale de la sécurité des SI', url: 'https://www.ssi.gouv.fr/', type: 'link' },
      3: { title: 'OWASP Web Security Testing Guide', url: 'https://owasp.org/www-project-web-security-testing-guide/', type: 'article' },
      4: { title: 'ISO/IEC 27001 — Présentation officielle', url: 'https://www.iso.org/isoiec-27001-information-security.html', type: 'link' },
      5: { title: 'CompTIA — Certifications cybersécurité', url: 'https://www.comptia.org/certifications', type: 'link' },
    },
    'active-directory': {
      1: { title: 'Microsoft Learn — Active Directory Domain Services', url: 'https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/active-directory-domain-services', type: 'article' },
      2: { title: 'BloodHound — dépôt officiel', url: 'https://github.com/BloodHoundAD/BloodHound', type: 'tool' },
      3: { title: 'MITRE ATT&CK — Steal or Forge Kerberos Tickets', url: 'https://attack.mitre.org/techniques/T1558/', type: 'article' },
      4: { title: 'MITRE ATT&CK — Lateral Movement', url: 'https://attack.mitre.org/tactics/TA0008/', type: 'article' },
      5: { title: 'MITRE ATT&CK — Privilege Escalation', url: 'https://attack.mitre.org/tactics/TA0004/', type: 'article' },
      6: { title: 'Microsoft Learn — Group Policy overview', url: 'https://learn.microsoft.com/en-us/windows/win32/group-policy/group-policy-overview', type: 'article' },
      7: { title: 'MITRE ATT&CK — Persistence', url: 'https://attack.mitre.org/tactics/TA0003/', type: 'article' },
      8: { title: 'Microsoft — Tier model pour AD', url: 'https://learn.microsoft.com/en-us/security/privileged-access-workstations/privileged-access-access-model', type: 'article' },
    },
    dfir: {
      1: { title: 'NIST SP 800-61 — Computer Security Incident Handling Guide', url: 'https://csrc.nist.gov/pubs/sp/800/61/r2/final', type: 'pdf' },
      2: { title: 'SANS — Digital Forensics posters et guides', url: 'https://www.sans.org/posters/', type: 'link' },
      3: { title: 'Volatility 3 — Documentation officielle', url: 'https://volatility3.readthedocs.io/', type: 'tool' },
      4: { title: 'Microsoft — Windows Prefetch forensics', url: 'https://learn.microsoft.com/en-us/windows/win32/w8cookbook/prefetch-files', type: 'article' },
      5: { title: 'Microsoft — Référence des événements de sécurité Windows', url: 'https://learn.microsoft.com/en-us/windows/security/threat-protection/auditing/windows-security-audit-events', type: 'article' },
      6: { title: 'Wireshark — Documentation officielle', url: 'https://www.wireshark.org/docs/', type: 'article' },
      7: { title: 'VirusTotal', url: 'https://www.virustotal.com/', type: 'tool' },
      8: { title: 'MITRE ATT&CK — Framework complet', url: 'https://attack.mitre.org/', type: 'link' },
    },
    'redaction-rapports': {
      1: { title: 'OWASP Web Security Testing Guide — Reporting', url: 'https://owasp.org/www-project-web-security-testing-guide/', type: 'article' },
      2: { title: 'PTES — Reporting standard', url: 'http://www.pentest-standard.org/index.php/Reporting', type: 'article' },
      3: { title: 'FIRST — Calculateur CVSS 3.1', url: 'https://www.first.org/cvss/calculator/3.1', type: 'tool' },
      4: { title: 'NIST SP 800-61 — Computer Security Incident Handling Guide', url: 'https://csrc.nist.gov/pubs/sp/800/61/r2/final', type: 'pdf' },
      5: { title: 'Pandoc — Documentation officielle', url: 'https://pandoc.org/', type: 'tool' },
    },
    'droit-cybersecurite': {
      1: { title: 'ANSSI — Cadre légal et réglementaire', url: 'https://www.ssi.gouv.fr/', type: 'link' },
      2: { title: 'CNIL — Le RGPD', url: 'https://www.cnil.fr/fr/reglement-europeen-protection-donnees', type: 'article' },
      3: { title: 'ISO/IEC 27001 — Présentation officielle', url: 'https://www.iso.org/isoiec-27001-information-security.html', type: 'link' },
      4: { title: 'CNIL — Sous-traitance et RGPD', url: 'https://www.cnil.fr/fr/les-obligations-des-sous-traitants', type: 'article' },
      5: { title: 'SWGDE — Bonnes pratiques de preuve numérique', url: 'https://www.swgde.org/documents/published', type: 'link' },
      6: { title: 'ENISA — NIS2 Directive', url: 'https://www.enisa.europa.eu/topics/nis-directive', type: 'link' },
    },
    'administration-si': {
      1: { title: 'CIS Benchmarks', url: 'https://www.cisecurity.org/cis-benchmarks', type: 'link' },
      2: { title: 'Microsoft Learn — Active Directory Domain Services', url: 'https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/active-directory-domain-services', type: 'article' },
      3: { title: 'systemd — documentation officielle', url: 'https://www.freedesktop.org/software/systemd/man/systemd.html', type: 'article' },
      4: { title: 'Docker — Documentation de sécurité', url: 'https://docs.docker.com/engine/security/', type: 'article' },
      5: { title: 'Veeam — La règle 3-2-1 de sauvegarde', url: 'https://www.veeam.com/blog/321-backup-rule.html', type: 'article' },
      6: { title: 'Prometheus — Documentation officielle', url: 'https://prometheus.io/docs/introduction/overview/', type: 'tool' },
      7: { title: 'NIST — Digital Identity Guidelines (SP 800-63)', url: 'https://pages.nist.gov/800-63-3/', type: 'article' },
      8: { title: 'CIS Benchmarks', url: 'https://www.cisecurity.org/cis-benchmarks', type: 'link' },
    },
    cryptographie: {
      1: { title: 'NIST — Cryptographic Standards and Guidelines', url: 'https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines', type: 'link' },
      2: { title: 'NIST FIPS 197 — Advanced Encryption Standard (AES)', url: 'https://csrc.nist.gov/pubs/fips/197/final', type: 'pdf' },
      3: { title: 'OpenSSL — Documentation officielle', url: 'https://docs.openssl.org/', type: 'tool' },
      4: { title: 'OWASP Cheat Sheet — Password Storage', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html', type: 'article' },
      5: { title: "Let's Encrypt — Comment fonctionne HTTPS", url: 'https://letsencrypt.org/how-it-works/', type: 'article' },
      6: { title: 'ANSSI — Recommandations cryptographiques', url: 'https://www.ssi.gouv.fr/', type: 'link' },
      7: { title: 'Qualys SSL Labs — SSL Server Test', url: 'https://www.ssllabs.com/ssltest/', type: 'tool' },
      8: { title: 'NIST — Post-Quantum Cryptography', url: 'https://csrc.nist.gov/projects/post-quantum-cryptography', type: 'link' },
    },
    maths: {
      1: { title: 'Khan Academy — Arithmétique modulaire', url: 'https://fr.khanacademy.org/computing/computer-science/cryptography', type: 'article' },
      2: { title: 'Khan Academy — Théorie des nombres', url: 'https://fr.khanacademy.org/computing/computer-science/cryptography/modarithmetic', type: 'article' },
      3: { title: 'Khan Algo — Logique booléenne', url: 'https://fr.khanacademy.org/computing/computer-science/algorithms', type: 'article' },
      4: { title: 'Khan Academy — Probabilités', url: 'https://fr.khanacademy.org/math/statistics-probability', type: 'article' },
      5: { title: 'Shannon (1948) — A Mathematical Theory of Communication', url: 'https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf', type: 'pdf' },
      6: { title: 'Khan Academy — Statistiques descriptives', url: 'https://fr.khanacademy.org/math/statistics-probability/summarizing-quantitative-data', type: 'article' },
      7: { title: 'BloodHound — Documentation officielle', url: 'https://bloodhound.specterops.io/', type: 'tool' },
      8: { title: 'NIST — Digital Identity Guidelines (SP 800-63)', url: 'https://pages.nist.gov/800-63-3/', type: 'article' },
    },
    'algebre-lineaire': {
      1: { title: '3Blue1Brown — Essence of Linear Algebra (vecteurs)', url: 'https://www.3blue1brown.com/topics/linear-algebra', type: 'video' },
      2: { title: 'Khan Academy — Matrices', url: 'https://fr.khanacademy.org/math/algebra-home/alg-matrices', type: 'article' },
      3: { title: 'Khan Academy — Déterminants', url: 'https://fr.khanacademy.org/math/algebra-home/alg-matrices', type: 'article' },
      4: { title: '3Blue1Brown — Linear transformations', url: 'https://www.3blue1brown.com/topics/linear-algebra', type: 'video' },
      5: { title: '3Blue1Brown — Eigenvectors and eigenvalues', url: 'https://www.3blue1brown.com/topics/linear-algebra', type: 'video' },
      6: { title: 'scikit-learn — Pairwise metrics (distances, similarité cosinus)', url: 'https://scikit-learn.org/stable/modules/metrics.html', type: 'article' },
      7: { title: 'scikit-learn — Decomposition (PCA)', url: 'https://scikit-learn.org/stable/modules/decomposition.html', type: 'article' },
    },
    'data-science': {
      1: { title: 'Kaggle — Apprendre la data science par la pratique', url: 'https://www.kaggle.com/learn', type: 'link' },
      2: { title: 'pandas — Documentation officielle (nettoyage de données)', url: 'https://pandas.pydata.org/docs/', type: 'tool' },
      3: { title: 'seaborn — Documentation officielle (visualisation)', url: 'https://seaborn.pydata.org/', type: 'tool' },
      4: { title: 'Khan Academy — Tests d’hypothèses', url: 'https://fr.khanacademy.org/math/statistics-probability/significance-tests-one-sample', type: 'article' },
      5: { title: 'scikit-learn — Supervised learning', url: 'https://scikit-learn.org/stable/supervised_learning.html', type: 'article' },
      6: { title: 'scikit-learn — Clustering', url: 'https://scikit-learn.org/stable/modules/clustering.html', type: 'article' },
      7: { title: 'scikit-learn — Model evaluation', url: 'https://scikit-learn.org/stable/modules/model_evaluation.html', type: 'article' },
      8: { title: 'MITRE ATT&CK — Framework complet', url: 'https://attack.mitre.org/', type: 'link' },
      9: { title: 'CNIL — Intelligence artificielle et RGPD', url: 'https://www.cnil.fr/fr/intelligence-artificielle', type: 'article' },
    },
    'python-datasci': {
      1: { title: 'Jupyter — Documentation officielle', url: 'https://docs.jupyter.org/', type: 'tool' },
      2: { title: 'NumPy — Documentation officielle', url: 'https://numpy.org/doc/stable/', type: 'tool' },
      3: { title: 'pandas — Documentation officielle', url: 'https://pandas.pydata.org/docs/', type: 'tool' },
      4: { title: 'pandas — Guide utilisateur (missing data)', url: 'https://pandas.pydata.org/docs/user_guide/missing_data.html', type: 'article' },
      5: { title: 'Seaborn — Documentation officielle', url: 'https://seaborn.pydata.org/', type: 'tool' },
      6: { title: 'Kaggle — Datasets de cybersécurité', url: 'https://www.kaggle.com/datasets?search=cybersecurity', type: 'link' },
      7: { title: 'scikit-learn — Getting Started', url: 'https://scikit-learn.org/stable/getting_started.html', type: 'article' },
      8: { title: 'scikit-learn — Documentation officielle', url: 'https://scikit-learn.org/stable/', type: 'tool' },
    },
    'ia-cybersecurity': {
      1: { title: 'Anthropic — Recherche et documentation', url: 'https://www.anthropic.com/research', type: 'link' },
      2: { title: 'MITRE ATLAS — Menaces contre les systèmes IA', url: 'https://atlas.mitre.org/', type: 'link' },
      3: { title: 'Hugging Face — NLP Course', url: 'https://huggingface.co/learn/nlp-course', type: 'article' },
      4: { title: 'Anthropic — Building effective agents', url: 'https://www.anthropic.com/engineering/building-effective-agents', type: 'article' },
      5: { title: 'MITRE ATT&CK — Framework complet', url: 'https://attack.mitre.org/', type: 'link' },
      6: { title: 'OWASP — Top 10 for LLM Applications', url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/', type: 'link' },
      7: { title: 'Commission Européenne — AI Act', url: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai', type: 'link' },
    },
    'soc-analysis': {
      1: { title: 'SANS — SOC Survey et ressources', url: 'https://www.sans.org/security-resources/', type: 'link' },
      2: { title: 'NIST SP 800-61 — Incident Handling Guide', url: 'https://csrc.nist.gov/pubs/sp/800/61/r2/final', type: 'pdf' },
      3: { title: 'Elastic Security — Documentation SIEM', url: 'https://www.elastic.co/guide/en/security/current/index.html', type: 'tool' },
      4: { title: 'MITRE ATT&CK — Framework complet', url: 'https://attack.mitre.org/', type: 'link' },
      5: { title: 'SANS — Digital Forensics posters et guides', url: 'https://www.sans.org/posters/', type: 'link' },
      6: { title: 'MITRE — D3FEND (contre-mesures et playbooks)', url: 'https://d3fend.mitre.org/', type: 'link' },
      7: { title: 'MITRE ATT&CK — Threat hunting resources', url: 'https://attack.mitre.org/resources/', type: 'link' },
      8: { title: 'SANS — Cyber Security Career Roadmap', url: 'https://www.sans.org/cyber-security-career-roadmap/', type: 'link' },
    },
    psychologie: {
      1: { title: 'CISA — Social Engineering', url: 'https://www.cisa.gov/topics/cyber-threats-and-advisories/social-engineering', type: 'link' },
      2: { title: 'Cialdini — Principes d’influence (résumé académique)', url: 'https://fr.wikipedia.org/wiki/Influence_et_manipulation', type: 'article' },
      3: { title: 'ANSSI — Hameçonnage (phishing)', url: 'https://www.cybermalveillance.gouv.fr/tous-nos-contenus/actualites/hameconnage-phishing', type: 'link' },
      4: { title: 'CISA — Physical Security Guidance', url: 'https://www.cisa.gov/topics/physical-security', type: 'link' },
      5: { title: 'ANSSI — MOOC SecNumacadémie (sensibilisation)', url: 'https://secnumacademie.gouv.fr/', type: 'tool' },
      6: { title: 'ANSSI — Cadre légal et réglementaire', url: 'https://www.ssi.gouv.fr/', type: 'link' },
    },
    'cyber-offensive': {
      1: { title: 'Offensive Security — OSCP', url: 'https://www.offsec.com/courses/pen-200/', type: 'link' },
      2: { title: 'OSINT Framework', url: 'https://osintframework.com/', type: 'tool' },
      3: { title: 'Nmap — Documentation officielle', url: 'https://nmap.org/book/man.html', type: 'article' },
      4: { title: 'PortSwigger Web Security Academy', url: 'https://portswigger.net/web-security', type: 'link' },
      5: { title: 'Rapid7 — Metasploit Documentation', url: 'https://docs.rapid7.com/metasploit/', type: 'tool' },
      6: { title: 'GTFOBins', url: 'https://gtfobins.github.io/', type: 'tool' },
      7: { title: 'BloodHound — Documentation officielle', url: 'https://bloodhound.specterops.io/', type: 'tool' },
      8: { title: 'MITRE ATT&CK — Persistence', url: 'https://attack.mitre.org/tactics/TA0003/', type: 'link' },
      9: { title: 'ANSSI — Cadre légal et réglementaire', url: 'https://www.ssi.gouv.fr/', type: 'link' },
      10: { title: 'PTES — Reporting standard', url: 'http://www.pentest-standard.org/index.php/Reporting', type: 'article' },
    },
    'cyber-defensive': {
      1: { title: 'NIST Cybersecurity Framework', url: 'https://www.nist.gov/cyberframework', type: 'link' },
      2: { title: 'CIS Benchmarks', url: 'https://www.cisecurity.org/cis-benchmarks', type: 'link' },
      3: { title: 'NIST SP 800-207 — Zero Trust Architecture', url: 'https://csrc.nist.gov/pubs/sp/800/207/final', type: 'pdf' },
      4: { title: 'Microsoft — Privileged Access Workstations', url: 'https://learn.microsoft.com/en-us/security/privileged-access-workstations/privileged-access-access-model', type: 'article' },
      5: { title: 'MITRE ATT&CK — Detection resources', url: 'https://attack.mitre.org/resources/', type: 'link' },
      6: { title: 'NIST SP 800-61 — Incident Handling Guide', url: 'https://csrc.nist.gov/pubs/sp/800/61/r2/final', type: 'pdf' },
      7: { title: 'Veeam — La règle 3-2-1 de sauvegarde', url: 'https://www.veeam.com/blog/321-backup-rule.html', type: 'article' },
      8: { title: 'MITRE ATT&CK — Framework complet', url: 'https://attack.mitre.org/', type: 'link' },
      9: { title: 'MITRE — D3FEND', url: 'https://d3fend.mitre.org/', type: 'link' },
      10: { title: 'NIST Cybersecurity Framework — Tiers de maturité', url: 'https://www.nist.gov/cyberframework', type: 'link' },
    },
    'fichiers-bdd': {
      1: { title: 'Sleuth Kit & Autopsy — Documentation officielle', url: 'https://www.sleuthkit.org/autopsy/', type: 'tool' },
      2: { title: 'Gary Kessler — File Signatures Table', url: 'https://www.garykessler.net/library/file_sigs.html', type: 'link' },
      3: { title: 'PostgreSQL — Documentation officielle', url: 'https://www.postgresql.org/docs/', type: 'tool' },
      4: { title: 'MongoDB — Documentation officielle', url: 'https://www.mongodb.com/docs/', type: 'tool' },
      5: { title: 'OWASP Cheat Sheet — Database Security', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Database_Security_Cheat_Sheet.html', type: 'article' },
      6: { title: 'sqlmap — Documentation officielle', url: 'https://sqlmap.org/', type: 'tool' },
      7: { title: 'Veeam — La règle 3-2-1 de sauvegarde', url: 'https://www.veeam.com/blog/321-backup-rule.html', type: 'article' },
    },
    'machine-learning': {
      1: { title: 'scikit-learn — Reinforcement learning (ressources externes)', url: 'https://scikit-learn.org/stable/related_projects.html', type: 'article' },
      2: { title: 'scikit-learn — Linear Models', url: 'https://scikit-learn.org/stable/modules/linear_model.html', type: 'article' },
      3: { title: 'scikit-learn — Ensemble methods', url: 'https://scikit-learn.org/stable/modules/ensemble.html', type: 'article' },
      4: { title: 'scikit-learn — Support Vector Machines', url: 'https://scikit-learn.org/stable/modules/svm.html', type: 'article' },
      5: { title: 'scikit-learn — Clustering', url: 'https://scikit-learn.org/stable/modules/clustering.html', type: 'article' },
      6: { title: 'scikit-learn — Decomposition (PCA)', url: 'https://scikit-learn.org/stable/modules/decomposition.html', type: 'article' },
      7: { title: 'scikit-learn — Cross-validation', url: 'https://scikit-learn.org/stable/modules/cross_validation.html', type: 'article' },
    },
    'deep-learning': {
      1: { title: '3Blue1Brown — Neural Networks', url: 'https://www.3blue1brown.com/topics/neural-networks', type: 'video' },
      2: { title: '3Blue1Brown — Backpropagation calculus', url: 'https://www.3blue1brown.com/topics/neural-networks', type: 'video' },
      3: { title: 'CS231n — Convolutional Neural Networks (Stanford)', url: 'https://cs231n.github.io/convolutional-networks/', type: 'article' },
      4: { title: 'Colah’s Blog — Understanding LSTM Networks', url: 'https://colah.github.io/posts/2015-08-Understanding-LSTMs/', type: 'article' },
      5: { title: 'Jay Alammar — The Illustrated Transformer', url: 'https://jalammar.github.io/illustrated-transformer/', type: 'article' },
      6: { title: 'PyTorch — Documentation officielle', url: 'https://pytorch.org/docs/stable/index.html', type: 'tool' },
      7: { title: 'MITRE ATLAS — Menaces contre les systèmes IA', url: 'https://atlas.mitre.org/', type: 'link' },
    },
    'securite-applications-api': {
      1: { title: 'OWASP — Threat Modeling Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html', type: 'article' },
      2: { title: 'OWASP API Security Top 10', url: 'https://owasp.org/www-project-api-security/', type: 'link' },
      3: { title: 'OAuth 2.0 — Documentation officielle', url: 'https://oauth.net/2/', type: 'link' },
      4: { title: 'OWASP — GraphQL Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/GraphQL_Cheat_Sheet.html', type: 'article' },
      5: { title: 'NIST SP 800-207 — Zero Trust Architecture', url: 'https://csrc.nist.gov/pubs/sp/800/207/final', type: 'pdf' },
      6: { title: 'CISA — Software Bill of Materials (SBOM)', url: 'https://www.cisa.gov/sbom', type: 'link' },
      7: { title: 'OWASP — Vulnerable Dependency Management Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Vulnerable_Dependency_Management_Cheat_Sheet.html', type: 'article' },
      8: { title: 'OWASP DevSecOps Guideline', url: 'https://owasp.org/www-project-devsecops-guideline/', type: 'link' },
    },
  }

  for (const [courseSlug, chapterResources] of Object.entries(RESOURCES)) {
    const course = await prisma.course.findUniqueOrThrow({ where: { slug: courseSlug } })
    for (const [chapterNumber, resource] of Object.entries(chapterResources)) {
      const chapter = await prisma.chapter.findFirstOrThrow({ where: { courseId: course.id, number: Number(chapterNumber) } })
      await prisma.resource.create({ data: { chapterId: chapter.id, ...resource, isCurated: true } })
    }
  }

  // TPs (hands-on exercises) for a few key chapters
  const linuxCourse = await prisma.course.findUniqueOrThrow({ where: { slug: 'linux' } })
  const linuxChapter1 = await prisma.chapter.findFirstOrThrow({ where: { courseId: linuxCourse.id, number: 1 } })
  const linuxChapter2 = await prisma.chapter.findFirstOrThrow({ where: { courseId: linuxCourse.id, number: 2 } })
  const linuxChapter3 = await prisma.chapter.findFirstOrThrow({ where: { courseId: linuxCourse.id, number: 3 } })
  const introCyberCourse = await prisma.course.findUniqueOrThrow({ where: { slug: 'intro-cyber' } })
  const introCyberChapter3 = await prisma.chapter.findFirstOrThrow({ where: { courseId: introCyberCourse.id, number: 3 } })

  await prisma.tP.create({
    data: {
      chapterId: linuxChapter1.id,
      title: 'Prise en main de Kali Linux',
      environment: 'Kali Linux (terminal Nyx Shell)',
      objectives: ['Naviguer dans le système de fichiers', 'Identifier les outils de pentest installés', "Configurer l'environnement réseau"],
      steps: [
        { title: 'Explorer le système', description: 'Liste les répertoires principaux et identifie leur rôle.', code: 'ls -la / && tree -L 2 /usr/share' },
        { title: 'Vérifier la configuration réseau', description: 'Affiche ton adresse IP et la table de routage.', code: 'ip a && ip route' },
        { title: 'Lister les outils de pentest', description: 'Explore les catégories d’outils fournies par Kali.', code: 'ls /usr/share/wordlists' },
      ],
    },
  })

  await prisma.tP.create({
    data: {
      chapterId: linuxChapter3.id,
      title: 'Audit des processus et services',
      environment: 'Kali Linux (terminal Nyx Shell)',
      objectives: ['Identifier les processus en cours', 'Lister les services systemd actifs', 'Croiser processus et ports réseau ouverts'],
      steps: [
        { title: 'Arborescence des processus', description: 'Affiche tous les processus avec leur hiérarchie.', code: 'ps -ef --forest' },
        { title: 'Services actifs', description: 'Liste les services systemd démarrés.', code: 'systemctl list-units --type=service --state=running' },
        { title: 'Ports en écoute', description: 'Identifie les processus qui écoutent sur le réseau.', code: 'ss -tulpn' },
      ],
    },
  })

  await prisma.tP.create({
    data: {
      chapterId: linuxChapter2.id,
      title: 'Élévation de privilèges Linux — énumération manuelle et LinPEAS',
      environment: 'Kali Linux (terminal Nyx Shell) — cible : Metasploitable2 (10.10.0.10)',
      objectives: [
        'Identifier les binaires SUID exploitables sur une cible',
        "Repérer une entrée sudo mal configurée et l'exploiter",
        'Utiliser LinPEAS pour automatiser l’énumération de vecteurs de privesc',
        'Distinguer un vecteur exploitable d’un faux positif',
      ],
      steps: [
        { title: 'Lister les binaires SUID', description: 'Recherche tous les binaires disposant du bit SUID sur la cible.', code: 'find / -perm -4000 -type f 2>/dev/null' },
        { title: 'Vérifier les droits sudo', description: 'Regarde si l’utilisateur courant peut exécuter des commandes en root sans mot de passe.', code: 'sudo -l' },
        { title: 'Croiser avec GTFOBins', description: 'Pour chaque binaire SUID trouvé, vérifie sur GTFOBins s’il permet une évasion vers un shell root (ex. find, vim, less).' },
        { title: 'Automatiser avec LinPEAS', description: 'Télécharge et exécute LinPEAS pour une énumération exhaustive (SUID, cron, capabilities, kernel).', code: 'curl -L https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh -o linpeas.sh && bash linpeas.sh' },
        { title: 'Exploiter le vecteur retenu', description: 'Utilise le binaire SUID ou l’entrée sudo identifiée pour obtenir un shell root, puis confirme avec `id`.', code: 'id && whoami' },
      ],
    },
  })

  await prisma.tP.create({
    data: {
      chapterId: introCyberChapter3.id,
      title: "Classer une méthodologie d'attaque",
      environment: 'Réflexion guidée (sans terminal)',
      objectives: ["Classer des actions par phase CEH", 'Relier la Cyber Kill Chain à des mesures défensives concrètes'],
      steps: [
        { title: 'Classer des actions', description: "Range chacune des actions suivantes dans la bonne phase CEH : scan Nmap, recherche LinkedIn, tâche planifiée post-accès, suppression de logs." },
        { title: 'Proposer des défenses', description: "Pour la phase 'Delivery' de la Kill Chain, propose deux mesures défensives concrètes." },
      ],
    },
  })

  // Tool-focused TPs — deliberately practice one tool in depth, tied to the chapter that introduces it
  const reseauxCourse = await prisma.course.findUniqueOrThrow({ where: { slug: 'reseaux' } })
  const reseauxChapter3 = await prisma.chapter.findFirstOrThrow({ where: { courseId: reseauxCourse.id, number: 3 } })
  const webSecurityCourse = await prisma.course.findUniqueOrThrow({ where: { slug: 'web-security' } })
  const webSecurityChapter3 = await prisma.chapter.findFirstOrThrow({ where: { courseId: webSecurityCourse.id, number: 3 } })
  const webSecurityChapter5 = await prisma.chapter.findFirstOrThrow({ where: { courseId: webSecurityCourse.id, number: 5 } })

  await prisma.tP.create({
    data: {
      chapterId: reseauxChapter3.id,
      title: 'Maîtriser Nmap — du scan basique à l’évasion',
      environment: 'Kali Linux (terminal Nyx Shell)',
      objectives: [
        'Distinguer les principaux types de scan Nmap (SYN, Connect, UDP)',
        'Utiliser les scripts NSE pour la détection de vulnérabilités',
        'Ajuster le timing et la fragmentation pour un scan plus discret',
      ],
      steps: [
        { title: 'Scan de découverte', description: 'Identifie les hôtes actifs sur le sous-réseau du lab.', code: 'nmap -sn 10.10.0.0/24' },
        { title: 'Scan SYN complet', description: 'Scanne tous les ports TCP avec détection de version et OS.', code: 'nmap -sS -p- -T4 -A 10.10.0.10' },
        { title: 'Scan UDP ciblé', description: 'Scanne les ports UDP les plus courants (plus lent que TCP).', code: 'nmap -sU --top-ports 20 10.10.0.10' },
        { title: 'Scripts NSE de détection de vulnérabilités', description: 'Lance les scripts de vulnérabilité intégrés à Nmap.', code: 'nmap --script vuln 10.10.0.10' },
        { title: 'Scan discret (timing + fragmentation)', description: 'Compare un scan agressif à un scan discret et note la différence de durée.', code: 'nmap -T1 -f -p- 10.10.0.10' },
      ],
    },
  })

  await prisma.tP.create({
    data: {
      chapterId: webSecurityChapter3.id,
      title: 'Sqlmap — automatiser la détection d’injection SQL',
      environment: 'Kali Linux (terminal Nyx Shell)',
      objectives: [
        'Détecter automatiquement une injection SQL sur un paramètre',
        'Énumérer bases de données, tables et colonnes',
        'Extraire le contenu d’une table sensible',
      ],
      steps: [
        { title: 'Détecter l’injection', description: 'Lance sqlmap sur un paramètre suspect.', code: 'sqlmap -u "http://10.10.0.10/produit.php?id=1" --batch' },
        { title: 'Lister les bases de données', description: 'Énumère les bases accessibles depuis le point d’injection.', code: 'sqlmap -u "http://10.10.0.10/produit.php?id=1" --batch --dbs' },
        { title: 'Lister les tables d’une base', description: 'Cible une base précise et liste ses tables.', code: 'sqlmap -u "http://10.10.0.10/produit.php?id=1" --batch -D shop --tables' },
        { title: 'Extraire une table sensible', description: 'Extrait le contenu complet de la table des utilisateurs.', code: 'sqlmap -u "http://10.10.0.10/produit.php?id=1" --batch -D shop -T users --dump' },
      ],
    },
  })

  await prisma.tP.create({
    data: {
      chapterId: webSecurityChapter5.id,
      title: 'Hydra — automatiser un test d’authentification',
      environment: 'Kali Linux (terminal Nyx Shell)',
      objectives: [
        'Identifier le message d’échec exact d’un formulaire de connexion',
        'Construire une commande Hydra ciblant un formulaire web',
        'Distinguer un test légitime d’un bruteforce non autorisé',
      ],
      steps: [
        { title: 'Identifier le message d’échec', description: 'Tente une connexion avec des identifiants invalides et note le message exact renvoyé par le formulaire.' },
        { title: 'Construire la commande Hydra', description: 'Lance Hydra contre le formulaire de connexion avec une wordlist.', code: 'hydra -l admin -P /usr/share/wordlists/rockyou.txt 10.10.0.10 http-post-form "/login.php:username=^USER^&password=^PASS^:Invalid credentials"' },
        { title: 'Analyser le résultat', description: 'Une fois un identifiant valide trouvé, documente-le et arrête immédiatement toute tentative supplémentaire.' },
      ],
    },
  })

  // TPs — couverture élargie à des cours jusqu'ici sans exercice pratique dédié
  const activeDirectoryCourse = await prisma.course.findUniqueOrThrow({ where: { slug: 'active-directory' } })
  const activeDirectoryChapter3 = await prisma.chapter.findFirstOrThrow({ where: { courseId: activeDirectoryCourse.id, number: 3 } })
  const cryptographieCourse = await prisma.course.findUniqueOrThrow({ where: { slug: 'cryptographie' } })
  const cryptographieChapter3 = await prisma.chapter.findFirstOrThrow({ where: { courseId: cryptographieCourse.id, number: 3 } })
  const dfirCourse = await prisma.course.findUniqueOrThrow({ where: { slug: 'dfir' } })
  const dfirChapter3 = await prisma.chapter.findFirstOrThrow({ where: { courseId: dfirCourse.id, number: 3 } })
  const pythonDatasciCourse = await prisma.course.findUniqueOrThrow({ where: { slug: 'python-datasci' } })
  const pythonDatasciChapter3 = await prisma.chapter.findFirstOrThrow({ where: { courseId: pythonDatasciCourse.id, number: 3 } })
  const socAnalysisCourse = await prisma.course.findUniqueOrThrow({ where: { slug: 'soc-analysis' } })
  const socAnalysisChapter3 = await prisma.chapter.findFirstOrThrow({ where: { courseId: socAnalysisCourse.id, number: 3 } })
  const administrationSiCourse = await prisma.course.findUniqueOrThrow({ where: { slug: 'administration-si' } })
  const administrationSiChapter3 = await prisma.chapter.findFirstOrThrow({ where: { courseId: administrationSiCourse.id, number: 3 } })
  const fichiersBddCourse = await prisma.course.findUniqueOrThrow({ where: { slug: 'fichiers-bdd' } })
  const fichiersBddChapter3 = await prisma.chapter.findFirstOrThrow({ where: { courseId: fichiersBddCourse.id, number: 3 } })
  const machineLearningCourse = await prisma.course.findUniqueOrThrow({ where: { slug: 'machine-learning' } })
  const machineLearningChapter2 = await prisma.chapter.findFirstOrThrow({ where: { courseId: machineLearningCourse.id, number: 2 } })
  const securiteApiCourse = await prisma.course.findUniqueOrThrow({ where: { slug: 'securite-applications-api' } })
  const securiteApiChapter2 = await prisma.chapter.findFirstOrThrow({ where: { courseId: securiteApiCourse.id, number: 2 } })
  const securiteApiChapter3 = await prisma.chapter.findFirstOrThrow({ where: { courseId: securiteApiCourse.id, number: 3 } })

  await prisma.tP.create({
    data: {
      chapterId: activeDirectoryChapter3.id,
      title: 'Kerberoasting — extraire et casser un ticket de service',
      environment: 'Kali Linux (terminal Nyx Shell) — cible : lab ad-001 (10.10.0.10)',
      objectives: [
        'Énumérer les comptes de service disposant d’un SPN',
        'Obtenir un ticket TGS pour un compte Kerberoastable et en extraire le hash',
        'Casser le hash extrait hors ligne avec une wordlist',
      ],
      steps: [
        { title: 'Énumérer les comptes avec SPN', description: 'Liste les comptes de service disposant d’un Service Principal Name.', code: 'GetUserSPNs.py corp.lab/utilisateur:motdepasse -dc-ip 10.10.0.10' },
        { title: 'Obtenir un ticket de service', description: 'Certaines cibles (notamment les contrôleurs de domaine Samba) rejettent la demande automatique `-request` d’impacket pour une raison d’interopérabilité Kerberos — obtiens le ticket via les outils Kerberos standards à la place.', code: "kinit utilisateur@CORP.LAB && kvno HTTP/svc-web.corp.lab" },
        { title: 'Extraire le hash Kerberoastable', description: 'Décrit le contenu du ticket obtenu et en extrait le hash au format krb5tgs, cassable par John/Hashcat.', code: 'describeTicket.py /tmp/krb5cc_0' },
        { title: 'Casser le hash hors ligne', description: 'Utilise John the Ripper ou Hashcat avec une wordlist pour retrouver le mot de passe en clair.', code: 'john --wordlist=/usr/share/wordlists/rockyou.txt --format=krb5tgs hash.txt' },
      ],
    },
  })

  await prisma.tP.create({
    data: {
      chapterId: cryptographieChapter3.id,
      title: 'OpenSSL — chiffrer, déchiffrer et gérer des certificats',
      environment: 'Kali Linux (terminal Nyx Shell)',
      objectives: [
        'Chiffrer et déchiffrer un fichier avec AES en ligne de commande',
        'Générer une paire de clés RSA',
        'Générer un certificat auto-signé',
      ],
      steps: [
        { title: 'Chiffrer un fichier en AES-256', description: 'Chiffre un fichier texte avec une clé symétrique.', code: 'openssl enc -aes-256-cbc -salt -in secret.txt -out secret.enc' },
        { title: 'Déchiffrer le fichier', description: 'Retrouve le contenu original avec la même clé.', code: 'openssl enc -d -aes-256-cbc -in secret.enc -out secret_dechiffre.txt' },
        { title: 'Générer une paire de clés RSA', description: 'Crée une clé privée puis extrait la clé publique correspondante.', code: 'openssl genrsa -out cle_privee.pem 2048 && openssl rsa -in cle_privee.pem -pubout -out cle_publique.pem' },
        { title: 'Générer un certificat auto-signé', description: 'Crée un certificat X.509 auto-signé valable 365 jours.', code: 'openssl req -x509 -new -key cle_privee.pem -days 365 -out certificat.pem' },
      ],
    },
  })

  await prisma.tP.create({
    data: {
      chapterId: dfirChapter3.id,
      title: 'Analyse mémoire avec Volatility',
      environment: 'Kali Linux (terminal Nyx Shell) — cible : lab dfir-001 (10.10.0.10)',
      objectives: [
        'Identifier le profil du système à partir d’un dump mémoire',
        'Lister les processus en cours au moment de l’acquisition',
        'Repérer un processus suspect et ses connexions réseau associées',
      ],
      steps: [
        { title: 'Identifier le profil du système', description: 'Détermine automatiquement le système d’exploitation source du dump.', code: 'vol.py -f memoire.dmp windows.info' },
        { title: 'Lister les processus', description: 'Affiche l’arborescence des processus actifs au moment du dump.', code: 'vol.py -f memoire.dmp windows.pstree' },
        { title: 'Examiner les connexions réseau', description: 'Croise les processus suspects avec les connexions réseau actives.', code: 'vol.py -f memoire.dmp windows.netscan' },
      ],
    },
  })

  await prisma.tP.create({
    data: {
      chapterId: pythonDatasciChapter3.id,
      title: 'Nettoyer un jeu de données avec pandas',
      environment: 'Kali Linux (terminal Nyx Shell) — Jupyter/Python',
      objectives: [
        'Charger un jeu de données CSV avec pandas',
        'Identifier et traiter les valeurs manquantes',
        'Supprimer les doublons et corriger les types de colonnes',
      ],
      steps: [
        { title: 'Charger le jeu de données', description: 'Importe un fichier CSV de logs réseau dans un DataFrame.', code: "import pandas as pd\ndf = pd.read_csv('logs_reseau.csv')\ndf.info()" },
        { title: 'Traiter les valeurs manquantes', description: 'Identifie les colonnes contenant des valeurs manquantes et choisis une stratégie (suppression ou imputation).', code: "df.isnull().sum()\ndf = df.dropna(subset=['ip_source'])" },
        { title: 'Supprimer les doublons', description: 'Élimine les lignes strictement dupliquées du jeu de données.', code: 'df = df.drop_duplicates()' },
        { title: 'Corriger les types de colonnes', description: 'Convertit la colonne de date en type datetime exploitable.', code: "df['timestamp'] = pd.to_datetime(df['timestamp'])" },
      ],
    },
  })

  await prisma.tP.create({
    data: {
      chapterId: socAnalysisChapter3.id,
      title: 'Trianger une alerte à partir de logs bruts',
      environment: 'Kali Linux (terminal Nyx Shell) — cible : lab soc-001 (10.10.0.10)',
      objectives: [
        'Filtrer des logs bruts pour isoler les tentatives d’authentification échouées',
        'Identifier une adresse IP à l’origine de multiples échecs suivis d’un succès',
        'Corréler avec les logs proxy pour confirmer un incident réel',
      ],
      steps: [
        { title: 'Filtrer les échecs d’authentification', description: 'Isole les lignes correspondant à des échecs de connexion.', code: "grep 'AUTH_FAILED' auth.log | awk '{print $5}' | sort | uniq -c | sort -rn" },
        { title: 'Identifier l’IP suspecte', description: 'Repère l’adresse IP avec le plus grand nombre d’échecs suivis d’un succès.', code: "grep 'AUTH_SUCCESS' auth.log | grep <ip_suspecte>" },
        { title: 'Corréler avec les logs proxy', description: 'Vérifie si un volume de données inhabituel a transité depuis cette IP peu après la connexion.', code: 'grep <ip_suspecte> proxy.log' },
      ],
    },
  })

  await prisma.tP.create({
    data: {
      chapterId: administrationSiChapter3.id,
      title: 'Diagnostiquer un service en panne avec systemd',
      environment: 'Kali Linux (terminal Nyx Shell)',
      objectives: [
        'Identifier l’état d’un service systemd en échec',
        'Consulter les logs détaillés du service via journalctl',
        'Redémarrer le service et vérifier sa bonne reprise',
      ],
      steps: [
        { title: 'Vérifier l’état du service', description: 'Affiche le statut détaillé d’un service en échec.', code: 'systemctl status nginx' },
        { title: 'Consulter les logs du service', description: 'Affiche les 50 dernières lignes de log du service concerné.', code: 'journalctl -u nginx -n 50 --no-pager' },
        { title: 'Redémarrer et vérifier', description: 'Redémarre le service puis confirme qu’il est bien actif.', code: 'systemctl restart nginx && systemctl is-active nginx' },
      ],
    },
  })

  await prisma.tP.create({
    data: {
      chapterId: fichiersBddChapter3.id,
      title: 'Manipuler une base relationnelle avec psql',
      environment: 'Kali Linux (terminal Nyx Shell) — PostgreSQL',
      objectives: [
        'Se connecter à une base PostgreSQL en ligne de commande',
        'Créer une table avec une clé étrangère',
        'Écrire une jointure entre deux tables liées',
      ],
      steps: [
        { title: 'Se connecter à la base', description: 'Ouvre une session psql sur la base cible.', code: 'psql -U nyx -d nyx' },
        { title: 'Créer les tables liées', description: 'Crée une table clients et une table commandes liée par clé étrangère.', code: 'CREATE TABLE clients (id SERIAL PRIMARY KEY, nom TEXT);\nCREATE TABLE commandes (id SERIAL PRIMARY KEY, client_id INT REFERENCES clients(id), montant NUMERIC);' },
        { title: 'Écrire une jointure', description: 'Affiche chaque commande avec le nom du client associé.', code: 'SELECT commandes.id, clients.nom, commandes.montant FROM commandes JOIN clients ON commandes.client_id = clients.id;' },
      ],
    },
  })

  await prisma.tP.create({
    data: {
      chapterId: machineLearningChapter2.id,
      title: 'Entraîner une régression avec scikit-learn',
      environment: 'Kali Linux (terminal Nyx Shell) — Python/scikit-learn',
      objectives: [
        'Entraîner un modèle de régression linéaire sur un petit jeu de données',
        'Afficher les coefficients appris par le modèle',
        'Évaluer la performance du modèle avec l’erreur quadratique moyenne',
      ],
      steps: [
        { title: 'Entraîner le modèle', description: 'Entraîne une régression linéaire sur des données d’exemple.', code: "from sklearn.linear_model import LinearRegression\nmodele = LinearRegression()\nmodele.fit(X_train, y_train)" },
        { title: 'Afficher les coefficients', description: 'Observe les poids appris pour chaque variable.', code: 'print(modele.coef_, modele.intercept_)' },
        { title: 'Évaluer la performance', description: 'Calcule l’erreur quadratique moyenne sur l’ensemble de test.', code: "from sklearn.metrics import mean_squared_error\nmean_squared_error(y_test, modele.predict(X_test))" },
      ],
    },
  })

  await prisma.tP.create({
    data: {
      chapterId: securiteApiChapter2.id,
      title: 'Tester une API pour une vulnérabilité BOLA',
      environment: 'Kali Linux (terminal Nyx Shell) — cible : lab web-003 (10.10.0.10)',
      objectives: [
        'Authentifier une requête API avec un token valide',
        'Identifier un identifiant d’objet manipulable dans l’URL',
        'Confirmer un accès non autorisé à l’objet d’un autre utilisateur',
      ],
      steps: [
        { title: 'Récupérer sa propre ressource', description: 'Authentifie-toi et récupère l’identifiant de ta propre commande.', code: 'curl -H "Authorization: Bearer <token>" http://10.10.0.10/api/commandes/42' },
        { title: 'Modifier l’identifiant', description: 'Remplace l’identifiant par celui d’un autre utilisateur potentiel.', code: 'curl -H "Authorization: Bearer <token>" http://10.10.0.10/api/commandes/43' },
        { title: 'Confirmer la vulnérabilité', description: 'Si la réponse contient des données d’un autre compte, la BOLA est confirmée — documente la preuve.' },
      ],
    },
  })

  await prisma.tP.create({
    data: {
      chapterId: securiteApiChapter3.id,
      title: 'Décoder et analyser un JWT intercepté',
      environment: 'Kali Linux (terminal Nyx Shell)',
      objectives: [
        'Décoder les trois parties d’un JWT sans connaître le secret de signature',
        'Identifier les informations exposées en clair dans la charge utile',
        'Repérer un en-tête vulnérable annonçant l’algorithme "none"',
      ],
      steps: [
        { title: 'Décoder l’en-tête', description: 'Décode la première partie du JWT (avant le premier point).', code: "echo '<en_tete_base64>' | base64 -d" },
        { title: 'Décoder la charge utile', description: 'Décode la deuxième partie pour lire les informations exposées.', code: "echo '<charge_utile_base64>' | base64 -d" },
        { title: 'Identifier une faiblesse', description: 'Vérifie si l’en-tête décodé indique "alg": "none", ce qui permettrait de forger un jeton sans signature valide.' },
      ],
    },
  })

  for (const cert of CERTIFICATIONS) {
    await prisma.certification.create({ data: { ...cert, linkedCourses: cert.linkedCourses } })
  }

  for (const project of PROJECTS) {
    await prisma.project.create({ data: { ...project, type: 'proposed', linkedCourses: project.linkedCourses } })
  }

  for (const lab of LABS) {
    const { flags, ...labData } = lab
    const created = await prisma.lab.create({
      data: { ...labData, prerequisites: [], published: true, mdPath: `content/labs/${lab.slug}.md` },
    })
    for (const flag of flags) {
      await prisma.labFlag.create({ data: { labId: created.id, ...flag } })
    }
  }

  for (const entry of CHEAT_ENTRIES) {
    await prisma.cheatEntry.create({ data: { ...entry, tags: [entry.category.toLowerCase()] } })
  }

  const flashcards = [
    { deck: 'Linux', front: 'Quelle commande liste les processus en cours ?', back: 'ps aux' },
    { deck: 'Linux', front: 'Quelle commande change les permissions d’un fichier ?', back: 'chmod' },
    { deck: 'Réseaux', front: 'Que signifie TCP ?', back: 'Transmission Control Protocol' },
    { deck: 'Réseaux', front: 'Quel port utilise HTTPS par défaut ?', back: '443' },
    { deck: 'Cryptographie', front: 'Quelle est la taille d’un hash SHA-256 ?', back: '256 bits (32 octets)' },
  ]
  for (const fc of flashcards) {
    await prisma.flashcard.create({ data: fc })
  }

  console.log('✅ Seed terminé !')
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
