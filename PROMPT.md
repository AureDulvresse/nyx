# Nyx — Spécification projet

> **Nyx** — plateforme personnelle d'apprentissage de la cybersécurité.
> *"Master the night, own the light."* — Aure, Pointe-Noire, Congo.

Ce document est la référence pour toute contribution (humaine ou IA). Il décrit **ce qui existe et
les règles à respecter**, pas un tutoriel de génération. En cas de doute, le code fait foi :
mettre ce fichier à jour quand une règle ou un choix d'architecture change.

---

## 1. Périmètre

| Module | Description |
| --- | --- |
| **Cours** | ~25 cours Markdown/MDX (`content/courses/<slug>/`), chapitres avec progression, lecture audio (synthèse vocale du navigateur), commentaires, ressources, examen de fin de cours |
| **Apprentissage** | Quiz par chapitre, flashcards (SM-2), travaux pratiques (TP) |
| **Nyx Labs** | Missions Docker isolées (Kali + cibles), terminal web, flags, indices |
| **Outils** | Cheatsheet, certifications, parcours, dépendances entre cours, notes, projets, portfolio |
| **Dashboard** | Progression, streak, points, crédits |

**Hors périmètre (supprimé volontairement — ne pas réintroduire sans décision explicite)** :
assistant IA « Ask Nyx » (Ollama), reconnaissance vocale (Whisper), synthèse vocale serveur (Piper),
stockage objet MinIO/S3. Objectif : une application légère qui démarre avec **PostgreSQL + Redis** seulement.

---

## 2. Stack

- **Next.js 16** (App Router, Server Components, Server Actions) · **React 19** · **TypeScript strict**
  - ⚠️ Cette version de Next diffère des versions connues : consulter `node_modules/next/dist/docs/` avant d'utiliser une API.
- **Serveur custom** `server.ts` (Next + WebSocket `/ws/terminal` + `node-pty`), lancé avec `tsx`
- **PostgreSQL 16** via **Prisma 7** (`@prisma/adapter-pg`)
- **Redis 7** (`ioredis`) : cache, sessions de labs, rate-limit
- **Docker** (`dockerode`) : environnements de labs
- **Auth** : NextAuth v5 (JWT, page `/login`), routes protégées par `src/proxy.ts`
- **UI** : Tailwind 4, composants shadcn-like (`src/components/ui`), **hugeicons-react** (jamais Lucide), framer-motion, recharts, xterm.js, Mermaid
- **Validation / état** : zod, zustand
- **Fichiers uploadés** : disque local (`STORAGE_DIR`, défaut `./storage`), servis par `src/app/uploads/[...path]/route.ts`

---

## 3. Services Docker

| Fichier | Contenu |
| --- | --- |
| `docker-compose.yml` | `postgres`, `redis`, `app` (stage `dev` du Dockerfile, code monté, hot reload) |
| `docker-compose.preprod.yml` | `app` (stage `runner`, build de prod) + `nginx` sur `:8080`, réseau `nyx_default` |
| `Dockerfile` | Stages `base` → `deps` → `dev` / `builder` → `runner` (sans outils de compilation ni devDependencies) |
| `infra/kali-tools`, `infra/labs/*` | Images des labs (`npm run docker:build-kali`, `npm run docker:build-labs`) |

Règles :

- Images **épinglées sur une version** (`postgres:16-alpine`, `redis:7-alpine`…), jamais d'image non maintenue.
- Le conteneur `app` réécrit `DATABASE_URL`/`REDIS_URL` vers les noms de service : un seul `.env.local` sert à l'hôte et à Docker.
- Volumes nommés : `postgres_data`, `redis_data`, `uploads_data`.

---

## 4. Variables d'environnement (`.env.local`)

```dotenv
DATABASE_URL="postgresql://nyx:nyx_dev_secret@localhost:5432/nyx?schema=public"
DIRECT_URL="postgresql://nyx:nyx_dev_secret@localhost:5432/nyx?schema=public"
REDIS_URL="redis://localhost:6379"
REDIS_PREFIX="nyx:"
NEXTAUTH_SECRET="<openssl rand -base64 32>"
NEXTAUTH_URL="http://localhost:3000"
DOCKER_SOCKET="/var/run/docker.sock"
LAB_SESSION_TIMEOUT_HOURS="2"
LAB_MAX_CONCURRENT_SESSIONS="3"
# STORAGE_DIR="./storage"   # optionnel
```

Toute nouvelle variable : l'ajouter ici **et** dans le README.

---

## 5. Architecture en couches

```
app/ (routing)  →  components/features (UI)  →  hooks (état client)  →  actions (Server Actions)
                                                                            ↓
                                    services (logique pure)  ←  repositories (Prisma + cache Redis)
                                                                            ↓
                                                       infrastructure (docker, cache, storage, content)
domain/ : types métier purs, importables partout
lib/    : prisma singleton, schémas zod, utilitaires, constantes
```

| Couche | Dossier | Rôle | Interdit |
| --- | --- | --- | --- |
| Routing | `src/app` | Server Component : charge via repositories, passe des props, `notFound()` si absent | Logique métier, `!` sur des entités potentiellement absentes |
| Domain | `src/domain` | Types et interfaces purs | Toute dépendance (framework, Prisma) |
| Repositories | `src/repositories` | Accès données, cache Redis + invalidation après mutation. Interface dans `interfaces/`, implémentation Prisma dans `prisma/`, singletons dans `index.ts` | Logique métier |
| Services | `src/services` | Logique métier pure et testable (SM-2, scoring, progression, streak, labs via DI) | Prisma, Redis, Next |
| Actions | `src/actions` | Fines : valider (zod) → appeler service/repo → `revalidatePath()` → `ActionResult` | Prisma direct, logique métier |
| Infrastructure | `src/infrastructure` | Clients et adaptateurs : `docker`, `cache`, `storage`, `content` (MDX) | Logique métier |
| Composants | `src/components` | `ui/` atomes, `common/` molécules réutilisables, `features/<feature>/` organismes | Prisma, repositories |
| Hooks | `src/hooks` | État client, appels d'actions, WebSocket terminal | Accès données direct |

### Contrat des Server Actions

```ts
// src/lib/utils/result.ts
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }

// Schéma type d'une action
'use server'
export async function updateChapterStatus(input: UpdateChapterStatusInput): Promise<ActionResult<Chapter>> {
  const v = UpdateChapterStatusSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')
  try {
    const chapter = await chapterRepo.updateStatus(v.data.chapterId, v.data.status)
    revalidatePath('/courses')
    return ok(chapter)
  } catch {
    return err('Échec de la mise à jour du chapitre.', 'DB_ERROR')
  }
}
```

Les schémas zod vivent dans `src/lib/schemas/` et sont partagés entre actions et UI.

---

## 6. Règles de code

### TypeScript

- `strict`, aucun `any` (utiliser `unknown` + narrowing).
- Type de retour explicite sur toute fonction / méthode / composant / hook exporté.
- Imports absolus `@/…`.

### React / Next

- Server Components par défaut ; `'use client'` seulement si nécessaire (état, effets, événements, API navigateur).
- Pas de `setState` synchrone dans le corps d'un `useEffect` : dériver l'état, ou le réinitialiser dans le gestionnaire d'événement.
- Nettoyer timers, listeners et WebSockets dans les effets ; tableaux de dépendances complets.
- ESLint doit passer (`npm run lint`) ainsi que `npx tsc --noEmit`.

### Style / thème

- Couleurs uniquement via les variables CSS / tokens Tailwind de `src/app/globals.css` — jamais de hex en dur dans un composant.
- Palette : fond `#0d1117`, surface `#161b22`, bordure `#30363d`, texte `#e6edf3` / `#8b949e`, violet Nyx `#7c3aed`, vert terminal `#3fb950`, bleu `#58a6ff`, rouge `#f85149`, orange `#e3b341`, violet `#a371f7`, teal `#2dd4bf`.
- Icônes : `hugeicons-react` uniquement.

### Général

- DRY sans sur-abstraction : extraire dans `components/common` ou `lib/` dès qu'un motif se répète réellement.
- Pas de code mort ni de commentaires obsolètes ; les commentaires expliquent le *pourquoi*.
- Textes UI en français.

---

## 7. Redis

- Clés centralisées dans `src/infrastructure/cache/cache.keys.ts`, TTL dans `CACHE_TTL`.
- **Toujours un TTL** ; invalidation dans les repositories après chaque mutation.
- Sessions de labs en Redis (TTL 2 h), compteur de sessions actives.

---

## 8. Labs Docker

- Un réseau bridge isolé par session (sous-réseau déterministe), un conteneur Kali + les cibles du lab.
- Ressources limitées : 512 Mo RAM, 0,5 CPU, ulimits ; **jamais `--privileged`**.
- Maximum `LAB_MAX_CONCURRENT_SESSIONS` sessions simultanées (vérifié avant démarrage).
- Timeout automatique (`LAB_SESSION_TIMEOUT_HOURS`) avec nettoyage Docker + Redis.
- Terminal : WebSocket `/ws/terminal?sessionId=…` → `docker exec` via `node-pty` (resize via message JSON `{type:'resize',cols,rows}`).
- Les flags ne sont jamais envoyés au client (types `LabFlagPublic`).

---

## 9. Stockage des fichiers

- `storageService` (`src/infrastructure/storage`) implémente `IStorageService` sur disque local.
- Clés résolues sous `STORAGE_DIR` avec protection contre le path traversal ; buckets logiques `courses`, `labs`, `uploads`.
- Servi sous `/uploads/<bucket>/<key>` (authentifié via le proxy), avec un CSP `sandbox` pour neutraliser les SVG.
- Uploads validés : type MIME autorisé, 25 Mo max, rate-limit Redis.

---

## 10. Contenu Markdown

Chaque cours : `content/courses/<slug>/meta.json` + `NN-titre.md`. Chaque lab : `content/labs/<slug>.md`.

```markdown
---
title: Titre du chapitre
chapter: 1
course: linux
difficulty: beginner | intermediate | advanced
duration: 45
tags: [tag1, tag2]
ceh_modules: ["Module X"]
objectives:
  - Comprendre …
---

## Introduction
## Théorie            (texte + code + diagramme ```mermaid)
## Pratique           (code commenté)
## Lab — Mise en pratique   (<Steps steps={[…]} />)
## Questions de révision
```

Composants MDX disponibles (`src/components/features/mdx/mdx-components.tsx`) :
`CehCallout`, `AuditCallout`, `TipCallout`, `WarningCallout`, `LegalCallout`, `Figure`,
`CompareTable`, `Steps`, `AttackDefenseTable` ; `img` → `Figure`, `table` → wrapper défilable.
Images statiques : `public/images/courses/<slug>/`.

---

## 11. Commandes

```bash
docker compose up -d postgres redis          # dépendances
npx prisma generate && npm run db:push       # schéma
npm run db:seed                              # ⚠️ réinitialise toutes les données (dev uniquement)
npm run dev                                  # serveur custom + hot reload (tsx watch)
npm run lint && npx tsc --noEmit             # qualité
docker compose up -d --build                 # tout dans Docker (dev)
docker compose -f docker-compose.preprod.yml up -d --build   # préprod sur :8080
```
