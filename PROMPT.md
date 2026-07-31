# Nyx

> **Plateforme** : Nyx — Cybersecurity Learning Platform
> **Tagline** : *"Master the night, own the light."*
> **Couleur principale** : `#7c3aed` (Violet Nyx)
> **Couleur terminale** : `#3fb950` (Terminal vert)
> **Fond** : `#0d1117` (Nuit profonde)
> **Modules** : Nyx Shell (terminal Kali) · Nyx Labs (missions Docker) · Ask Nyx (assistant futur)
> **Domaine suggéré** : `nyx.dev` ou `nyx.app`
> **Stack** : Next.js 16· TypeScript · PostgreSQL · MinIO · Redis · Docker
> **Architecture** : Repository Pattern · Service Layer · Server Actions · SOLID · DRY
> **Contenu** : 16 cours · 128 chapitres · Terminal Kali · Labs Docker · Mermaid
> **Aure Pointe-Noire, Congo**

---

## INSTRUCTION PRINCIPALE

Construis **Nyx** — une plateforme web d'apprentissage cybersécurité personnelle
en suivant cette spec ligne par ligne. Respecte strictement l'architecture en couches,
les noms de fichiers, et les patterns définis. Ne simplifie pas, ne raccourcis pas.

---

## 1. INFRASTRUCTURE DOCKER

### docker-compose.yml (racine du projet)

```yaml
version: '3.9'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    env_file: .env.local
    volumes:
      - .:/app
      - /app/node_modules
      - /var/run/docker.sock:/var/run/docker.sock  # pour les labs Docker
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      minio:
        condition: service_started
    restart: unless-stopped

  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: nyx
      POSTGRES_USER: nyx
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-nyx_dev_secret}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./infra/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U nyx -d nyx"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
      - ./infra/redis/redis.conf:/usr/local/etc/redis/redis.conf
    command: redis-server /usr/local/etc/redis/redis.conf
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"   # API S3
      - "9001:9001"   # Console web
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:-nyx}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-nyx_minio_secret}
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3
    restart: unless-stopped

  minio-init:
    image: minio/mc:latest
    depends_on:
      minio:
        condition: service_healthy
    entrypoint: >
      /bin/sh -c "
      mc alias set local http://minio:9000 nyx nyx_minio_secret;
      mc mb --ignore-existing local/nyx-courses;
      mc mb --ignore-existing local/nyx-labs;
      mc mb --ignore-existing local/nyx-uploads;
      mc anonymous set download local/nyx-courses;
      exit 0;
      "

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### Dockerfile (racine)

```dockerfile
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/content ./content
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["ts-node", "--project", "tsconfig.server.json", "server.ts"]
```

### infra/redis/redis.conf

```conf
appendonly yes
appendfsync everysec
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
```

### infra/postgres/init.sql

```sql
-- Extensions utiles
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- pour la recherche full-text
```

---

## 2. STACK ET DÉPENDANCES

### Commandes d'installation

```bash
npx create-next-app@latest nyx --typescript --tailwind --app --src-dir
cd nyx
npx shadcn-ui@latest init

# Core UI
npm install hugeicons-react framer-motion recharts

# Database (PostgreSQL)
npm install prisma @prisma/client
npm install @prisma/extension-accelerate  # connection pooling
npx prisma init --datasource-provider postgresql

# Validation & State
npm install zod zustand

# Markdown & Diagrammes
npm install next-mdx-remote gray-matter remark-gfm rehype-highlight rehype-slug
npm install rehype-autolink-headings remark-mermaidjs @tailwindcss/typography
npm install @mapbox/rehype-prism

# MinIO (S3-compatible)
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Redis
npm install ioredis

# Terminal & Labs
npm install @xterm/xterm @xterm/addon-fit @xterm/addon-web-links @xterm/addon-search
npm install ws node-pty dockerode

# Utils
npm install date-fns sharp clsx tailwind-merge

# Dev
npm install -D @types/ws @types/node-pty @types/dockerode tsx
npm install -D @types/ioredis prettier eslint-config-prettier
```

---

## 3. VARIABLES D'ENVIRONNEMENT (.env.local)

```env
# PostgreSQL
DATABASE_URL="postgresql://nyx:nyx_dev_secret@localhost:5432/nyx?schema=public"
DIRECT_URL="postgresql://nyx:nyx_dev_secret@localhost:5432/nyx?schema=public"

# Redis
REDIS_URL="redis://localhost:6379"
REDIS_PREFIX="nyx:"

# MinIO (compatible S3)
MINIO_ENDPOINT="http://localhost:9000"
MINIO_ACCESS_KEY="nyx"
MINIO_SECRET_KEY="nyx_minio_secret"
MINIO_BUCKET_COURSES="nyx-courses"
MINIO_BUCKET_LABS="nyx-labs"
MINIO_BUCKET_UPLOADS="nyx-uploads"
MINIO_PUBLIC_URL="http://localhost:9000"

# Docker
DOCKER_SOCKET="/var/run/docker.sock"
LAB_SESSION_TIMEOUT_HOURS=2
LAB_MAX_CONCURRENT_SESSIONS=3

# App
NEXTAUTH_SECRET="change-me-in-production-use-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

---

## 4. STRUCTURE DE DOSSIERS COMPLÈTE

```
nyx/
├── src/
│   ├── app/                          # ROUTING SEULEMENT — aucune logique
│   │   ├── layout.tsx                # Layout global avec sidebar
│   │   ├── page.tsx                  # → <DashboardPage />
│   │   ├── (courses)/
│   │   │   ├── courses/page.tsx      # → <CoursesPage />
│   │   │   ├── courses/[slug]/page.tsx
│   │   │   └── courses/[slug]/[chapter]/page.tsx
│   │   ├── (learning)/
│   │   │   ├── quiz/[chapterId]/page.tsx
│   │   │   ├── tp/page.tsx
│   │   │   ├── tp/[id]/page.tsx
│   │   │   ├── flashcards/page.tsx
│   │   │   └── flashcards/review/page.tsx
│   │   ├── (tools)/
│   │   │   ├── cheatsheet/page.tsx
│   │   │   └── certifications/page.tsx
│   │   └── (labs)/
│   │       ├── labs/page.tsx
│   │       └── labs/[id]/page.tsx
│   │
│   ├── domain/                       # TYPES MÉTIER PURS
│   │   ├── course.ts
│   │   ├── quiz.ts
│   │   ├── flashcard.ts
│   │   ├── tp.ts
│   │   ├── cheat.ts
│   │   ├── lab.ts
│   │   ├── certification.ts
│   │   └── index.ts
│   │
│   ├── repositories/
│   │   ├── interfaces/               # INTERFACES — Dependency Inversion
│   │   │   ├── course.repository.interface.ts
│   │   │   ├── quiz.repository.interface.ts
│   │   │   ├── flashcard.repository.interface.ts
│   │   │   ├── lab.repository.interface.ts
│   │   │   ├── cheat.repository.interface.ts
│   │   │   ├── tp.repository.interface.ts
│   │   │   └── index.ts
│   │   ├── prisma/                   # IMPLÉMENTATIONS PRISMA
│   │   │   ├── course.repository.ts
│   │   │   ├── chapter.repository.ts
│   │   │   ├── quiz.repository.ts
│   │   │   ├── flashcard.repository.ts
│   │   │   ├── lab.repository.ts
│   │   │   ├── cheat.repository.ts
│   │   │   └── tp.repository.ts
│   │   └── index.ts                  # Factory — singletons exportés
│   │
│   ├── services/                     # LOGIQUE MÉTIER PURE — testable
│   │   ├── flashcard.service.ts      # SM-2 pur
│   │   ├── quiz.service.ts           # correction + scoring
│   │   ├── progress.service.ts       # calculs progression
│   │   ├── lab.service.ts            # orchestration labs (DI)
│   │   ├── certification.service.ts  # % prérequis
│   │   └── index.ts
│   │
│   ├── actions/                      # SERVER ACTIONS — thin layer
│   │   ├── chapter.actions.ts
│   │   ├── quiz.actions.ts
│   │   ├── flashcard.actions.ts
│   │   ├── tp.actions.ts
│   │   ├── lab.actions.ts
│   │   ├── cheat.actions.ts
│   │   └── index.ts
│   │
│   ├── infrastructure/
│   │   ├── docker/
│   │   │   ├── docker.client.ts      # singleton dockerode
│   │   │   ├── docker.service.ts     # IDockerService + implémentation
│   │   │   └── sessions.store.ts     # Map<sessionId, SessionData>
│   │   ├── storage/
│   │   │   ├── minio.client.ts       # singleton S3Client (MinIO)
│   │   │   ├── storage.service.ts    # IStorageService + implémentation
│   │   │   └── storage.types.ts
│   │   ├── cache/
│   │   │   ├── redis.client.ts       # singleton ioredis
│   │   │   ├── cache.service.ts      # ICacheService + implémentation
│   │   │   └── cache.keys.ts         # constantes de clés Redis
│   │   └── content/
│   │       ├── mdx.loader.ts         # charger + compiler .md
│   │       └── content.types.ts
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui atoms
│   │   ├── common/                   # molecules réutilisables
│   │   │   ├── ProgressRing.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── CommandCard.tsx
│   │   │   ├── StreakBadge.tsx
│   │   │   ├── PageHeader.tsx
│   │   │   └── Skeleton.tsx
│   │   └── features/                 # organisms par feature
│   │       ├── layout/
│   │       │   ├── Sidebar.tsx
│   │       │   ├── Header.tsx
│   │       │   └── MobileNav.tsx
│   │       ├── courses/
│   │       │   ├── CourseCard.tsx
│   │       │   ├── CourseGrid.tsx
│   │       │   ├── ChapterList.tsx
│   │       │   └── ChapterNavSidebar.tsx
│   │       ├── mdx/
│   │       │   ├── mdx-components.tsx   # CehCallout, Figure, Steps...
│   │       │   └── MDXRenderer.tsx
│   │       ├── quiz/
│   │       │   ├── QuizSession.tsx
│   │       │   ├── QuestionCard.tsx
│   │       │   └── QuizResult.tsx
│   │       ├── flashcards/
│   │       │   ├── FlashCard.tsx
│   │       │   ├── DeckCard.tsx
│   │       │   └── ReviewSession.tsx
│   │       ├── tp/
│   │       │   ├── TPCard.tsx
│   │       │   └── StepItem.tsx
│   │       ├── cheatsheet/
│   │       │   ├── CheatSearchBar.tsx
│   │       │   └── CommandGrid.tsx
│   │       ├── labs/
│   │       │   ├── LabCard.tsx
│   │       │   ├── LabMission.tsx
│   │       │   ├── FlagForm.tsx
│   │       │   └── NetworkMap.tsx
│   │       ├── terminal/
│   │       │   └── Terminal.tsx
│   │       └── dashboard/
│   │           ├── DashboardStats.tsx
│   │           └── WeeklyChart.tsx
│   │
│   ├── hooks/
│   │   ├── useQuizSession.ts
│   │   ├── useFlashcardReview.ts
│   │   ├── useLabSession.ts
│   │   ├── useTerminal.ts
│   │   └── useCheatSearch.ts
│   │
│   └── lib/
│       ├── prisma.ts                 # singleton Prisma client
│       ├── schemas/                  # ZOD — partagés actions + UI
│       │   ├── quiz.schemas.ts
│       │   ├── flashcard.schemas.ts
│       │   ├── lab.schemas.ts
│       │   ├── chapter.schemas.ts
│       │   └── index.ts
│       ├── utils/
│       │   ├── cn.ts                 # clsx + tailwind-merge
│       │   ├── date.utils.ts         # date-fns helpers
│       │   └── result.ts             # ActionResult<T>, ok(), err()
│       └── constants.ts
│
├── content/                          # MARKDOWN — hors src/
│   ├── courses/
│   │   ├── linux/
│   │   │   ├── meta.json
│   │   │   └── 01-introduction.md … 05-reseau.md
│   │   ├── reseaux/     … (8 chapitres)
│   │   ├── web-security/ … (8 chapitres)
│   │   ├── intro-cyber/  … (5 chapitres)
│   │   ├── active-directory/ … (8 chapitres)
│   │   ├── dfir/         … (8 chapitres)
│   │   ├── cryptographie/ … (8 chapitres)
│   │   ├── maths/        … (8 chapitres)
│   │   ├── algebre-lineaire/ … (7 chapitres)
│   │   ├── data-science/ … (9 chapitres)
│   │   ├── python-datasci/ … (8 chapitres)
│   │   ├── ia-cybersecurity/ … (7 chapitres)
│   │   ├── soc-analysis/ … (8 chapitres)
│   │   ├── psychologie/  … (6 chapitres)
│   │   ├── cyber-offensive/ … (10 chapitres)
│   │   └── cyber-defensive/ … (10 chapitres)
│   └── labs/
│       └── web-001.md … (14 missions)
│
├── public/
│   └── images/courses/[slug]/        # SVGs statiques par cours
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── infra/
│   ├── postgres/init.sql
│   └── redis/redis.conf
├── server.ts                         # HTTP + WebSocket custom server
├── tsconfig.server.json
├── docker-compose.yml
├── Dockerfile
└── .env.local
```

---

## 5. TYPES DOMAIN (src/domain/)

```typescript
// src/domain/index.ts — tout re-exporter ici
export * from './course'
export * from './quiz'
export * from './flashcard'
export * from './tp'
export * from './cheat'
export * from './lab'
export * from './certification'

// src/lib/utils/result.ts
export type ActionResult<T = void> =
  | { success: true;  data: T }
  | { success: false; error: string; code?: string }

export const ok  = <T>(data: T): ActionResult<T>  => ({ success: true, data })
export const err = (error: string, code?: string): ActionResult<never> =>
  ({ success: false, error, code })

// src/domain/course.ts
export type ChapterStatus = 'not_started' | 'in_progress' | 'completed'
export type CourseCategory = 'Offensif' | 'Défensif' | 'Fondamentaux' | 'Data' | 'IA / Cyber' | 'Transversal'

export interface Course {
  id: string; slug: string; title: string; description: string
  category: CourseCategory; icon: string; color: string; order: number
  chapters?: Chapter[]; createdAt: Date
}

export interface Chapter {
  id: string; courseId: string; number: number; title: string
  status: ChapterStatus; completedAt?: Date | null; notes?: string | null
}

export interface CourseProgress {
  courseId: string; slug: string; title: string; color: string
  total: number; completed: number; percentage: number
}

// src/domain/quiz.ts
export interface QuizQuestion {
  id: string; question: string; options: [string, string, string, string]
  correct: 0 | 1 | 2 | 3; explanation: string
  difficulty: 'easy' | 'medium' | 'hard'; tags: string[]
}

export interface QuizAttemptResult {
  score: number; total: number; percentage: number; passed: boolean
  answers: { questionId: string; chosen: number; correct: boolean }[]
  duration: number
}

// src/domain/flashcard.ts
export interface Flashcard {
  id: string; deck: string; chapterId?: string | null
  front: string; back: string
  interval: number; easeFactor: number
  nextReview: Date; reviewCount: number
}

export type SM2Quality = 0 | 1 | 2 | 3 | 4 | 5

export interface SM2Result {
  interval: number; easeFactor: number
  nextReview: Date; reviewCount: number
}

// src/domain/lab.ts
export type LabCategory = 'web' | 'network' | 'exploitation' | 'dfir' | 'ad' | 'crypto' | 'soc' | 'ds' | 'osint'
export type LabDifficulty = 'beginner' | 'intermediate' | 'advanced'
export type LabSessionStatus = 'active' | 'completed' | 'failed' | 'expired'

export interface DockerTarget { name: string; image: string; ip: string; hostname?: string }

export interface Lab {
  id: string; slug: string; title: string
  category: LabCategory; difficulty: LabDifficulty
  estimatedTime: number; totalPoints: number; description: string
  mdPath: string; targets: DockerTarget[]
  kaliImage: string; prerequisites: string[]; published: boolean
  flags?: LabFlag[]
}

export interface LabFlag { id: string; labId: string; flagId: string; hint: string; value: string; points: number }
export interface LabSession {
  id: string; labId: string; kaliId: string; networkId: string
  status: LabSessionStatus; score: number; startedAt: Date; completedAt?: Date | null
}

export interface FlagSubmitResult {
  success: boolean; points?: number; labCompleted?: boolean; totalScore?: number
}
```

---

## 6. SCHÉMA PRISMA — POSTGRESQL

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

model Course {
  id          String    @id @default(cuid())
  slug        String    @unique
  title       String
  description String
  category    String
  icon        String
  color       String
  order       Int
  chapters    Chapter[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([category])
  @@index([order])
}

model Chapter {
  id          String    @id @default(cuid())
  courseId    String
  course      Course    @relation(fields: [courseId], references: [id], onDelete: Cascade)
  number      Int
  title       String
  status      String    @default("not_started")
  completedAt DateTime?
  notes       String?
  tp          TP?
  quizzes     Quiz[]
  flashcards  Flashcard[]
  updatedAt   DateTime  @updatedAt

  @@unique([courseId, number])
  @@index([courseId])
  @@index([status])
}

model Quiz {
  id        String        @id @default(cuid())
  chapterId String        @unique
  chapter   Chapter       @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  title     String
  questions Json          // QuizQuestion[]
  attempts  QuizAttempt[]
  createdAt DateTime      @default(now())
}

model QuizAttempt {
  id        String   @id @default(cuid())
  quizId    String
  quiz      Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  score     Int
  total     Int
  answers   Json
  duration  Int?
  createdAt DateTime @default(now())

  @@index([quizId])
  @@index([createdAt])
}

model TP {
  id          String   @id @default(cuid())
  chapterId   String   @unique
  chapter     Chapter  @relation(fields: [chapterId], references: [id], onDelete: Cascade)
  title       String
  environment String
  objectives  Json     // string[]
  steps       Json     // TPStep[]
  notes       String?
  completedAt DateTime?
  updatedAt   DateTime @updatedAt
}

model CheatEntry {
  id          String   @id @default(cuid())
  category    String
  subcategory String?
  title       String
  command     String
  description String
  example     String?
  tags        Json     // string[]
  isFavorite  Boolean  @default(false)
  createdAt   DateTime @default(now())

  @@index([category])
  // Recherche full-text PostgreSQL
  @@index([title, command, description])
}

model Flashcard {
  id          String   @id @default(cuid())
  deck        String
  chapterId   String?
  chapter     Chapter? @relation(fields: [chapterId], references: [id], onDelete: SetNull)
  front       String
  back        String
  interval    Int      @default(1)
  easeFactor  Float    @default(2.5)
  nextReview  DateTime @default(now())
  reviewCount Int      @default(0)
  createdAt   DateTime @default(now())

  @@index([deck])
  @@index([deck, nextReview])
  @@index([nextReview])
}

model Certification {
  id            String    @id @default(cuid())
  slug          String    @unique
  name          String
  provider      String
  status        String    @default("not_started")
  targetDate    DateTime?
  completedDate DateTime?
  notes         String?
  linkedCourses Json      // string[] of course slugs
  priority      Int       @default(0)

  @@index([priority])
  @@index([status])
}

// ---- LABS ----

model Lab {
  id            String       @id @default(cuid())
  slug          String       @unique
  title         String
  category      String
  difficulty    String
  estimatedTime Int
  totalPoints   Int
  description   String
  mdPath        String
  targets       Json         // DockerTarget[]
  kaliImage     String       @default("nyx/kali-tools")
  prerequisites Json         // string[]
  published     Boolean      @default(false)
  sessions      LabSession[]
  flags         LabFlag[]
  createdAt     DateTime     @default(now())

  @@index([category])
  @@index([difficulty])
  @@index([published])
}

model LabFlag {
  id       String        @id @default(cuid())
  labId    String
  lab      Lab           @relation(fields: [labId], references: [id], onDelete: Cascade)
  flagId   String
  hint     String
  value    String
  points   Int
  captures FlagCapture[]

  @@index([labId])
}

model LabSession {
  id          String        @id @default(cuid())
  labId       String
  lab         Lab           @relation(fields: [labId], references: [id])
  kaliId      String
  networkId   String
  status      String        @default("active")
  score       Int           @default(0)
  startedAt   DateTime      @default(now())
  completedAt DateTime?
  captures    FlagCapture[]

  @@index([status])
  @@index([startedAt])
}

model FlagCapture {
  id         String     @id @default(cuid())
  flagId     String
  flag       LabFlag    @relation(fields: [flagId], references: [id])
  sessionId  String
  session    LabSession @relation(fields: [sessionId], references: [id])
  capturedAt DateTime   @default(now())

  @@unique([flagId, sessionId])
  @@index([sessionId])
}
```

---

## 7. INFRASTRUCTURE — MinIO, Redis, Docker

### src/infrastructure/storage/minio.client.ts

```typescript
import { S3Client } from '@aws-sdk/client-s3'

let client: S3Client | null = null

export function getMinioClient(): S3Client {
  if (!client) {
    client = new S3Client({
      endpoint: process.env.MINIO_ENDPOINT!,
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY!,
        secretAccessKey: process.env.MINIO_SECRET_KEY!,
      },
      forcePathStyle: true, // OBLIGATOIRE pour MinIO
    })
  }
  return client
}
```

### src/infrastructure/storage/storage.service.ts

```typescript
import {
  PutObjectCommand, GetObjectCommand,
  DeleteObjectCommand, ListObjectsV2Command
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { getMinioClient } from './minio.client'

export interface IStorageService {
  upload(bucket: string, key: string, body: Buffer | Uint8Array, contentType: string): Promise<string>
  getPublicUrl(bucket: string, key: string): string
  getPresignedUrl(bucket: string, key: string, expiresIn?: number): Promise<string>
  delete(bucket: string, key: string): Promise<void>
}

export class MinioStorageService implements IStorageService {
  private client = getMinioClient()

  async upload(bucket: string, key: string, body: Buffer | Uint8Array, contentType: string): Promise<string> {
    await this.client.send(new PutObjectCommand({
      Bucket: bucket, Key: key, Body: body, ContentType: contentType,
    }))
    return this.getPublicUrl(bucket, key)
  }

  getPublicUrl(bucket: string, key: string): string {
    return `${process.env.MINIO_PUBLIC_URL}/${bucket}/${key}`
  }

  async getPresignedUrl(bucket: string, key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key })
    return getSignedUrl(this.client, command, { expiresIn })
  }

  async delete(bucket: string, key: string): Promise<void> {
    await this.client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
  }
}

export const storageService: IStorageService = new MinioStorageService()
```

### src/infrastructure/cache/redis.client.ts

```typescript
import Redis from 'ioredis'

let client: Redis | null = null

export function getRedisClient(): Redis {
  if (!client) {
    client = new Redis(process.env.REDIS_URL!, {
      keyPrefix: process.env.REDIS_PREFIX ?? 'nyx:',
      retryStrategy: (times) => Math.min(times * 50, 2000),
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    })

    client.on('error', (err) => console.error('[Redis] Error:', err))
    client.on('connect', () => console.log('[Redis] Connected'))
  }
  return client
}
```

### src/infrastructure/cache/cache.service.ts

```typescript
import { getRedisClient } from './redis.client'
import { CACHE_KEYS, CACHE_TTL } from './cache.keys'

export interface ICacheService {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>
  del(key: string): Promise<void>
  exists(key: string): Promise<boolean>
  incr(key: string): Promise<number>
  expire(key: string, ttlSeconds: number): Promise<void>
}

export class RedisCacheService implements ICacheService {
  private redis = getRedisClient()

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key)
    if (!value) return null
    try { return JSON.parse(value) as T } catch { return value as unknown as T }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value)
    if (ttlSeconds) {
      await this.redis.setex(key, ttlSeconds, serialized)
    } else {
      await this.redis.set(key, serialized)
    }
  }

  async del(key: string): Promise<void>    { await this.redis.del(key) }
  async exists(key: string): Promise<boolean> { return (await this.redis.exists(key)) === 1 }
  async incr(key: string): Promise<number>    { return this.redis.incr(key) }
  async expire(key: string, ttl: number)      { await this.redis.expire(key, ttl) }
}

export const cacheService: ICacheService = new RedisCacheService()
```

### src/infrastructure/cache/cache.keys.ts

```typescript
export const CACHE_KEYS = {
  courses:           'courses:all',
  course:            (slug: string) => `course:${slug}`,
  courseProgress:    (courseId: string) => `progress:course:${courseId}`,
  globalProgress:    'progress:global',
  flashcardsDue:     (deck: string) => `flashcards:due:${deck}`,
  cheatsheet:        (category: string) => `cheat:${category}`,
  labSession:        (sessionId: string) => `lab:session:${sessionId}`,
  labActiveSessions: 'lab:sessions:active:count',
  streak:            'streak:current',
} as const

export const CACHE_TTL = {
  courses:   3600,       // 1 heure
  progress:  300,        // 5 minutes
  flashcards: 60,        // 1 minute
  cheatsheet: 1800,      // 30 minutes
  labSession: 7200,      // 2 heures
} as const
```

### src/infrastructure/docker/docker.service.ts

```typescript
import Docker from 'dockerode'
import { Lab, LabSession } from '@/domain'
import { sessions } from './sessions.store'
import { cacheService, CACHE_KEYS, CACHE_TTL } from '@/infrastructure/cache'

export interface IDockerService {
  startLabEnvironment(lab: Lab, sessionId: string): Promise<{ kaliId: string; networkId: string }>
  stopLabEnvironment(sessionId: string): Promise<void>
  isSessionRunning(sessionId: string): Promise<boolean>
}

const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET ?? '/var/run/docker.sock' })

export class DockerLabService implements IDockerService {
  async startLabEnvironment(lab: Lab, sessionId: string) {
    // 1. Réseau isolé
    const network = await docker.createNetwork({
      Name: `cl-${sessionId}`, Driver: 'bridge',
      IPAM: { Config: [{ Subnet: '10.10.0.0/24', Gateway: '10.10.0.1' }] }
    })

    // 2. Container Kali
    const kali = await docker.createContainer({
      Image: lab.kaliImage,
      name: `kali-${sessionId}`,
      Cmd: ['/bin/bash'], Tty: true, OpenStdin: true,
      HostConfig: {
        NetworkMode: `cl-${sessionId}`,
        CapAdd: ['NET_ADMIN', 'NET_RAW'],
        Memory: 512 * 1024 * 1024,
        NanoCpus: 500_000_000,
        Ulimits: [{ Name: 'nofile', Soft: 1024, Hard: 2048 }],
      }
    })
    await kali.start()

    // 3. Containers cibles
    for (const target of lab.targets) {
      const ctn = await docker.createContainer({
        Image: target.image,
        name: `${target.name}-${sessionId}`,
        Hostname: target.hostname ?? target.name,
        HostConfig: { NetworkMode: `cl-${sessionId}` }
      })
      await ctn.start()
    }

    // 4. Stocker la session dans Redis
    await cacheService.set(
      CACHE_KEYS.labSession(sessionId),
      { kaliId: kali.id, networkId: network.id, startedAt: new Date().toISOString() },
      CACHE_TTL.labSession
    )
    sessions.set(sessionId, { kaliId: kali.id })
    await cacheService.incr(CACHE_KEYS.labActiveSessions)

    return { kaliId: kali.id, networkId: network.id }
  }

  async stopLabEnvironment(sessionId: string) {
    const cached = await cacheService.get<{ kaliId: string; networkId: string }>(
      CACHE_KEYS.labSession(sessionId)
    )

    // Arrêter tous les containers du réseau
    const containers = await docker.listContainers({
      all: true,
      filters: { name: [sessionId] }
    })

    await Promise.allSettled(containers.map(async (c) => {
      const ctn = docker.getContainer(c.Id)
      if (c.State === 'running') await ctn.stop({ t: 5 }).catch(() => {})
      await ctn.remove({ force: true }).catch(() => {})
    }))

    // Supprimer le réseau
    if (cached?.networkId) {
      await docker.getNetwork(cached.networkId).remove().catch(() => {})
    }

    // Cleanup
    await cacheService.del(CACHE_KEYS.labSession(sessionId))
    sessions.delete(sessionId)
  }

  async isSessionRunning(sessionId: string): Promise<boolean> {
    return cacheService.exists(CACHE_KEYS.labSession(sessionId))
  }
}

export const dockerLabService: IDockerService = new DockerLabService()
```

---

## 8. REPOSITORIES — INTERFACES ET PRISMA

### src/repositories/index.ts (factory + singletons)

```typescript
import { PrismaCourseRepository, PrismaChapterRepository } from './prisma/course.repository'
import { PrismaQuizRepository }      from './prisma/quiz.repository'
import { PrismaFlashcardRepository } from './prisma/flashcard.repository'
import { PrismaLabRepository }       from './prisma/lab.repository'
import { PrismaTPRepository }        from './prisma/tp.repository'
import { PrismaCheatRepository }     from './prisma/cheat.repository'

export const courseRepo    = new PrismaCourseRepository()
export const chapterRepo   = new PrismaChapterRepository()
export const quizRepo      = new PrismaQuizRepository()
export const flashcardRepo = new PrismaFlashcardRepository()
export const labRepo       = new PrismaLabRepository()
export const tpRepo        = new PrismaTPRepository()
export const cheatRepo     = new PrismaCheatRepository()

export type { ICourseRepository, IChapterRepository } from './interfaces/course.repository.interface'
export type { IQuizRepository }      from './interfaces/quiz.repository.interface'
export type { IFlashcardRepository } from './interfaces/flashcard.repository.interface'
export type { ILabRepository }       from './interfaces/lab.repository.interface'
```

### src/repositories/prisma/course.repository.ts

```typescript
import { prisma } from '@/lib/prisma'
import { cacheService, CACHE_KEYS, CACHE_TTL } from '@/infrastructure/cache'
import type { ICourseRepository, IChapterRepository } from '../interfaces'
import type { Course, Chapter, ChapterStatus, CourseProgress } from '@/domain'

export class PrismaCourseRepository implements ICourseRepository {
  async findAll(): Promise<Course[]> {
    const cached = await cacheService.get<Course[]>(CACHE_KEYS.courses)
    if (cached) return cached

    const courses = await prisma.course.findMany({ orderBy: { order: 'asc' } })
    await cacheService.set(CACHE_KEYS.courses, courses, CACHE_TTL.courses)
    return courses
  }

  async findBySlug(slug: string): Promise<Course | null> {
    const cached = await cacheService.get<Course>(CACHE_KEYS.course(slug))
    if (cached) return cached

    const course = await prisma.course.findUnique({ where: { slug } })
    if (course) await cacheService.set(CACHE_KEYS.course(slug), course, CACHE_TTL.courses)
    return course
  }

  async findWithChapters(slug: string) {
    return prisma.course.findUnique({
      where: { slug },
      include: { chapters: { orderBy: { number: 'asc' } } }
    })
  }
}

export class PrismaChapterRepository implements IChapterRepository {
  async findById(id: string): Promise<Chapter | null> {
    return prisma.chapter.findUnique({ where: { id } })
  }

  async updateStatus(id: string, status: ChapterStatus): Promise<Chapter> {
    const chapter = await prisma.chapter.update({
      where: { id },
      data: { status, completedAt: status === 'completed' ? new Date() : null }
    })
    // Invalider le cache progression
    await cacheService.del(CACHE_KEYS.courseProgress(chapter.courseId))
    await cacheService.del(CACHE_KEYS.globalProgress)
    return chapter
  }

  async getGlobalProgress() {
    const cached = await cacheService.get<{ total: number; completed: number; percentage: number }>(
      CACHE_KEYS.globalProgress
    )
    if (cached) return cached

    const [total, completed] = await Promise.all([
      prisma.chapter.count(),
      prisma.chapter.count({ where: { status: 'completed' } })
    ])
    const result = { total, completed, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 }
    await cacheService.set(CACHE_KEYS.globalProgress, result, CACHE_TTL.progress)
    return result
  }

  async getProgressByCourse(courseId: string): Promise<CourseProgress> {
    const cached = await cacheService.get<CourseProgress>(CACHE_KEYS.courseProgress(courseId))
    if (cached) return cached

    const [course, total, completed] = await Promise.all([
      prisma.course.findUniqueOrThrow({ where: { id: courseId } }),
      prisma.chapter.count({ where: { courseId } }),
      prisma.chapter.count({ where: { courseId, status: 'completed' } }),
    ])

    const result: CourseProgress = {
      courseId, slug: course.slug, title: course.title, color: course.color,
      total, completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    }
    await cacheService.set(CACHE_KEYS.courseProgress(courseId), result, CACHE_TTL.progress)
    return result
  }

  async findByCourse(courseId: string): Promise<Chapter[]> {
    return prisma.chapter.findMany({ where: { courseId }, orderBy: { number: 'asc' } })
  }
}
```

---

## 9. SERVICES — LOGIQUE MÉTIER PURE

```typescript
// src/services/flashcard.service.ts — AUCUNE dépendance framework
import { Flashcard, SM2Quality, SM2Result } from '@/domain'
import { addDays } from 'date-fns'

export function calculateSM2(
  card: Pick<Flashcard, 'interval' | 'easeFactor' | 'reviewCount'>,
  quality: SM2Quality
): SM2Result {
  let { interval, easeFactor, reviewCount } = card

  if (quality < 3) {
    interval = 1; reviewCount = 0
  } else {
    interval = reviewCount === 0 ? 1 : reviewCount === 1 ? 6 : Math.round(interval * easeFactor)
    reviewCount++
  }

  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

  return { interval, easeFactor, nextReview: addDays(new Date(), interval), reviewCount }
}

export const FlashcardService = {
  calculateSM2,
  isDue: (card: Flashcard): boolean => new Date(card.nextReview) <= new Date(),
}

// src/services/quiz.service.ts — pure
import { QuizQuestion, QuizAttemptResult } from '@/domain'

export const QuizService = {
  grade(
    questions: QuizQuestion[],
    answers: { questionId: string; chosen: number }[],
    durationMs: number
  ): QuizAttemptResult {
    const map = new Map(answers.map(a => [a.questionId, a.chosen]))
    const graded = questions.map(q => ({
      questionId: q.id,
      chosen: map.get(q.id) ?? -1,
      correct: map.get(q.id) === q.correct,
    }))
    const score = graded.filter(a => a.correct).length
    const total = questions.length
    return { score, total, percentage: Math.round((score / total) * 100), passed: score / total >= 0.6, answers: graded, duration: Math.round(durationMs / 1000) }
  },

  shuffle: <T>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5),
}
```

---

## 10. SERVER ACTIONS — MINCES

```typescript
// src/actions/chapter.actions.ts
'use server'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { chapterRepo } from '@/repositories'
import { ok, err, ActionResult } from '@/lib/utils/result'
import type { Chapter } from '@/domain'
import { UpdateChapterStatusSchema } from '@/lib/schemas'

export async function updateChapterStatus(
  input: z.infer<typeof UpdateChapterStatusSchema>
): Promise<ActionResult<Chapter>> {
  const v = UpdateChapterStatusSchema.safeParse(input)
  if (!v.success) return err(v.error.message, 'VALIDATION')

  try {
    const chapter = await chapterRepo.updateStatus(v.data.chapterId, v.data.status)
    revalidatePath('/courses')
    revalidatePath(`/courses/${chapter.courseId}`)
    return ok(chapter)
  } catch {
    return err('Failed to update chapter', 'DB_ERROR')
  }
}

// src/actions/lab.actions.ts
'use server'
import { labRepo } from '@/repositories'
import { dockerLabService } from '@/infrastructure/docker/docker.service'
import { LabService } from '@/services/lab.service'
import { ok, err, ActionResult } from '@/lib/utils/result'
import type { LabSession, FlagSubmitResult } from '@/domain'
import { StartLabSchema, SubmitFlagSchema } from '@/lib/schemas'
import { z } from 'zod'

const labService = new LabService(labRepo, dockerLabService)

export async function startLabSession(
  input: z.infer<typeof StartLabSchema>
): Promise<ActionResult<{ session: LabSession; wsUrl: string }>> {
  const v = StartLabSchema.safeParse(input)
  if (!v.success) return err(v.error.message)
  try {
    const session = await labService.startSession(v.data.labId, v.data.userId)
    return ok({ session, wsUrl: `/ws/terminal?sessionId=${session.id}` })
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Failed to start lab')
  }
}

export async function submitFlag(
  input: z.infer<typeof SubmitFlagSchema>
): Promise<ActionResult<FlagSubmitResult>> {
  const v = SubmitFlagSchema.safeParse(input)
  if (!v.success) return err(v.error.message)
  try {
    const result = await labService.submitFlag(v.data.sessionId, v.data.flagValue)
    return ok(result)
  } catch (e) {
    return err(e instanceof Error ? e.message : 'Failed to submit flag')
  }
}

export async function stopLabSession(sessionId: string): Promise<ActionResult> {
  if (!sessionId) return err('sessionId required')
  try {
    await labService.stopSession(sessionId)
    return ok(undefined)
  } catch {
    return err('Failed to stop lab session')
  }
}
```

---

## 11. SERVER.TS — WebSocket + Next.js

```typescript
// server.ts (racine)
import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { WebSocketServer, WebSocket } from 'ws'
import * as pty from 'node-pty'
import { sessions } from './src/infrastructure/docker/sessions.store'
import { cacheService, CACHE_KEYS } from './src/infrastructure/cache'

const dev  = process.env.NODE_ENV !== 'production'
const port = parseInt(process.env.PORT ?? '3000')
const app  = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res, parse(req.url!, true))
  })

  const wss = new WebSocketServer({ server, path: '/ws/terminal' })

  wss.on('connection', async (ws: WebSocket, req) => {
    const url = new URL(req.url!, 'http://localhost')
    const sessionId = url.searchParams.get('sessionId')

    if (!sessionId) {
      ws.close(1008, 'sessionId required')
      return
    }

    const session = sessions.get(sessionId)
    if (!session) {
      ws.close(1008, `Session ${sessionId} not found`)
      return
    }

    // Rafraîchir le TTL de la session Redis
    await cacheService.expire(CACHE_KEYS.labSession(sessionId), 7200)

    const term = pty.spawn('docker', ['exec', '-it', session.kaliId, 'bash'], {
      name: 'xterm-256color',
      cols: parseInt(url.searchParams.get('cols') ?? '120'),
      rows: parseInt(url.searchParams.get('rows') ?? '40'),
      cwd: '/root',
      env: { ...process.env, TERM: 'xterm-256color', COLORTERM: 'truecolor' },
    })

    term.onData(data => {
      if (ws.readyState === WebSocket.OPEN) ws.send(data)
    })

    ws.on('message', (data: Buffer) => {
      // Supporter le resize : { type: 'resize', cols: N, rows: N }
      try {
        const msg = JSON.parse(data.toString())
        if (msg.type === 'resize') { term.resize(msg.cols, msg.rows); return }
      } catch {}
      term.write(data.toString())
    })

    ws.on('close', () => { term.kill() })
    ws.on('error', ()  => { term.kill() })

    // Timeout automatique
    const timeout = setTimeout(() => {
      ws.close(1001, 'Session timeout')
      term.kill()
    }, (parseInt(process.env.LAB_SESSION_TIMEOUT_HOURS ?? '2')) * 3600 * 1000)

    ws.on('close', () => clearTimeout(timeout))
  })

  server.listen(port, () => {
    console.log(`> Nyx ready on http://localhost:${port}`)
    console.log(`> WebSocket terminal on ws://localhost:${port}/ws/terminal`)
  })

  // Graceful shutdown
  const shutdown = async () => {
    console.log('> Shutting down...')
    server.close()
    process.exit(0)
  }
  process.on('SIGTERM', shutdown)
  process.on('SIGINT',  shutdown)
})
```

---

## 12. COMPOSANTS MDX (src/components/features/mdx/mdx-components.tsx)

Implémenter ces composants :

```typescript
// Callouts : CehCallout (rouge), AuditCallout (vert), TipCallout (bleu),
//            WarningCallout (jaune), LegalCallout (orange)
// Composants riches :
//   Figure({ src, alt, caption, width?, height? })  → next/image + légende
//   CompareTable({ titleA, titleB, rows })           → tableau comparatif bicolore
//   Steps({ steps: [{title, description, code?}] })  → étapes numérotées
//   AttackDefenseTable({ rows })                      → rouge/orange/vert/bleu

// Override HTML :
//   img → <Figure />
//   table → wrapper avec overflow-x-auto + border

export const MDX_COMPONENTS = {
  CehCallout, AuditCallout, TipCallout, WarningCallout, LegalCallout,
  Figure, CompareTable, Steps, AttackDefenseTable,
  img: (props) => <Figure src={props.src} alt={props.alt} caption={props.title} />,
}
```

---

## 13. PAGES (app/)

Chaque `page.tsx` est un **Server Component** qui :
1. Charge les données via les repositories (pas d'API routes)
2. Passe les données au composant feature
3. Ne contient aucune logique

```typescript
// app/page.tsx (Dashboard)
import { chapterRepo, courseRepo, quizRepo, flashcardRepo, labRepo } from '@/repositories'
import { DashboardPage } from '@/components/features/dashboard/DashboardPage'

export default async function Page() {
  const [globalProgress, courses, recentAttempts, flashcardsDue] = await Promise.all([
    chapterRepo.getGlobalProgress(),
    courseRepo.findAll(),
    quizRepo.getRecentAttempts(5),
    flashcardRepo.countDueToday(),
  ])
  return <DashboardPage {...{ globalProgress, courses, recentAttempts, flashcardsDue }} />
}

// app/courses/[slug]/[chapter]/page.tsx
import { MDXLoader } from '@/infrastructure/content/mdx.loader'
import { courseRepo, chapterRepo } from '@/repositories'
import { ChapterPage } from '@/components/features/courses/ChapterPage'

export default async function Page({ params }) {
  const { slug, chapter } = await params
  const chapterNum = parseInt(chapter)
  const [course, content, progress] = await Promise.all([
    courseRepo.findWithChapters(slug),
    MDXLoader.getChapter(slug, chapterNum),
    chapterRepo.getProgressByCourse((await courseRepo.findBySlug(slug))!.id),
  ])
  return <ChapterPage course={course!} content={content} progress={progress} />
}

// app/labs/[id]/page.tsx
import { labRepo } from '@/repositories'
import { MDXLoader } from '@/infrastructure/content/mdx.loader'
import { LabMissionPage } from '@/components/features/labs/LabMissionPage'

export default async function Page({ params }) {
  const { id } = await params
  const lab = await labRepo.findById(id)
  if (!lab || !lab.published) notFound()
  const content = await MDXLoader.getLab(lab.slug)
  return <LabMissionPage lab={lab} content={content} />
}
```

---

## 14. HOOKS PRINCIPAUX

```typescript
// src/hooks/useLabSession.ts
'use client'
import { useState, useCallback, useTransition } from 'react'
import { startLabSession, stopLabSession, submitFlag } from '@/actions/lab.actions'
import type { LabSession, FlagSubmitResult } from '@/domain'

type LabState = 'idle' | 'loading' | 'active' | 'completed'

export function useLabSession(labId: string) {
  const [state, setState]     = useState<LabState>('idle')
  const [session, setSession] = useState<LabSession | null>(null)
  const [wsUrl, setWsUrl]     = useState<string | null>(null)
  const [error, setError]     = useState<string | null>(null)
  const [isPending, start]    = useTransition()

  const startLab = useCallback(() => {
    setState('loading')
    start(async () => {
      const result = await startLabSession({ labId, userId: 'local-user' })
      if (result.success) {
        setSession(result.data.session)
        setWsUrl(result.data.wsUrl)
        setState('active')
      } else {
        setError(result.error)
        setState('idle')
      }
    })
  }, [labId])

  const stopLab = useCallback(() => {
    if (!session) return
    start(async () => {
      await stopLabSession(session.id)
      setSession(null); setWsUrl(null); setState('idle')
    })
  }, [session])

  const handleFlagSubmit = useCallback(async (flagValue: string): Promise<FlagSubmitResult> => {
    if (!session) return { success: false }
    const result = await submitFlag({ sessionId: session.id, flagValue })
    if (result.success && result.data.labCompleted) setState('completed')
    return result.success ? result.data : { success: false }
  }, [session])

  return { state, session, wsUrl, error, isPending, startLab, stopLab, submitFlag: handleFlagSubmit }
}

// src/hooks/useTerminal.ts
'use client'
import { useEffect, useRef, useCallback } from 'react'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { SearchAddon } from '@xterm/addon-search'
import '@xterm/xterm/css/xterm.css'

export function useTerminal(containerRef: React.RefObject<HTMLDivElement>, wsUrl: string | null) {
  const termRef  = useRef<XTerm | null>(null)
  const wsRef    = useRef<WebSocket | null>(null)
  const fitRef   = useRef<FitAddon | null>(null)

  const connect = useCallback(() => {
    if (!wsUrl || !containerRef.current) return

    const term = new XTerm({
      theme: {
        background: '#0d1117', foreground: '#c9d1d9',
        cursor: '#3fb950', selectionBackground: '#3fb95033',
        black: '#0d1117', brightBlack: '#8b949e',
        green: '#3fb950', brightGreen: '#56d364',
        blue: '#58a6ff', brightBlue: '#79c0ff',
        red: '#f85149', yellow: '#e3b341',
      },
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
      fontSize: 14, lineHeight: 1.4,
      cursorBlink: true, cursorStyle: 'block',
      scrollback: 5000,
    })

    const fit     = new FitAddon()
    const links   = new WebLinksAddon()
    const search  = new SearchAddon()

    term.loadAddon(fit); term.loadAddon(links); term.loadAddon(search)
    term.open(containerRef.current)
    fit.fit()

    termRef.current = term
    fitRef.current  = fit

    const ws = new WebSocket(
      `${wsUrl}&cols=${term.cols}&rows=${term.rows}`
    )
    wsRef.current = ws

    ws.onopen  = () => term.writeln('\x1b[32m[Nyx]\x1b[0m Terminal connecté. Bon pentest!\r\n')
    ws.onmessage = (e) => term.write(typeof e.data === 'string' ? e.data : new Uint8Array(e.data))
    ws.onclose   = () => term.writeln('\r\n\x1b[31m[Nyx]\x1b[0m Connexion fermée.')
    ws.onerror   = () => term.writeln('\r\n\x1b[31m[Nyx]\x1b[0m Erreur de connexion.')

    term.onData(data => ws.readyState === WebSocket.OPEN && ws.send(data))

    // Resize
    const observer = new ResizeObserver(() => {
      fit.fit()
      ws.readyState === WebSocket.OPEN && ws.send(JSON.stringify({
        type: 'resize', cols: term.cols, rows: term.rows
      }))
    })
    observer.observe(containerRef.current)

    return () => { observer.disconnect(); ws.close(); term.dispose() }
  }, [wsUrl])

  useEffect(() => { return connect() }, [connect])

  return {
    search: (text: string) => (termRef.current as any)?.searchAddon?.findNext(text),
    clear:  () => termRef.current?.clear(),
    fit:    () => fitRef.current?.fit(),
  }
}
```

---

## 15. SEED DATA (prisma/seed.ts)

Créer le fichier `prisma/seed.ts` avec :

```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// 16 COURS avec tous leurs chapitres
const COURSES = [
  { slug: 'linux',              title: 'Linux pour la Cybersécurité',    category: 'Offensif',     color: '#3fb950', order: 1,  icon: 'Terminal01Icon',      chapters: 5 },
  { slug: 'reseaux',            title: 'Réseaux Informatiques',           category: 'Fondamentaux', color: '#58a6ff', order: 2,  icon: 'NetworkIcon',         chapters: 8 },
  { slug: 'web-security',       title: 'Sécurité Web (OWASP)',            category: 'Offensif',     color: '#f85149', order: 3,  icon: 'Globe01Icon',         chapters: 8 },
  { slug: 'intro-cyber',        title: 'Introduction Cybersécurité',      category: 'Fondamentaux', color: '#a371f7', order: 4,  icon: 'ShieldKeyIcon',       chapters: 5 },
  { slug: 'active-directory',   title: 'Active Directory & Windows',      category: 'Offensif',     color: '#2dd4bf', order: 5,  icon: 'UserGroupIcon',       chapters: 8 },
  { slug: 'dfir',               title: 'Forensics & DFIR',                category: 'Défensif',     color: '#e3b341', order: 6,  icon: 'Search01Icon',        chapters: 8 },
  { slug: 'cryptographie',      title: 'Cryptographie Avancée',           category: 'Fondamentaux', color: '#f0b429', order: 7,  icon: 'LockIcon',            chapters: 8 },
  { slug: 'maths',              title: 'Mathématiques Appliquées',        category: 'Fondamentaux', color: '#06b6d4', order: 8,  icon: 'Calculator01Icon',    chapters: 8 },
  { slug: 'algebre-lineaire',   title: 'Algèbre Linéaire',                category: 'Fondamentaux', color: '#8b5cf6', order: 9,  icon: 'GridTableIcon',       chapters: 7 },
  { slug: 'data-science',       title: 'Data Science Complète',           category: 'Data',         color: '#ec4899', order: 10, icon: 'ChartBarLineIcon',    chapters: 9 },
  { slug: 'python-datasci',     title: 'Python pour la Data Science',     category: 'Data',         color: '#10b981', order: 11, icon: 'CodeIcon',            chapters: 8 },
  { slug: 'ia-cybersecurity',   title: 'IA & Agents en Cybersécurité',    category: 'IA / Cyber',   color: '#f59e0b', order: 12, icon: 'AiCloud01Icon',       chapters: 7 },
  { slug: 'soc-analysis',       title: 'Analyse SOC',                     category: 'Défensif',     color: '#ef4444', order: 13, icon: 'DashboardBrowsingIcon',chapters: 8 },
  { slug: 'psychologie',        title: 'Psychologie & Ingénierie Sociale',category: 'Transversal',  color: '#d946ef', order: 14, icon: 'BrainIcon',           chapters: 6 },
  { slug: 'cyber-offensive',    title: 'Cybersécurité Offensive',         category: 'Offensif',     color: '#ef4444', order: 15, icon: 'HackerIcon',          chapters: 10 },
  { slug: 'cyber-defensive',    title: 'Cybersécurité Défensive',         category: 'Défensif',     color: '#22c55e', order: 16, icon: 'Shield01Icon',        chapters: 10 },
]

// Titres de chapitres par cours (utiliser les plans détaillés des specs)
// [IMPORTANT] : Remplir les titres réels depuis les specs chapitres_detailles.md

// CERTIFICATIONS
const CERTIFICATIONS = [
  { slug: 'security-plus', name: 'CompTIA Security+',  provider: 'CompTIA',          priority: 1, linkedCourses: ['intro-cyber', 'reseaux'] },
  { slug: 'ceh',           name: 'CEH v13',             provider: 'EC-Council',       priority: 2, linkedCourses: ['linux','reseaux','web-security','active-directory','dfir','cryptographie','intro-cyber','cyber-offensive'] },
  { slug: 'ejpt',          name: 'eJPT',                provider: 'INE Security',     priority: 3, linkedCourses: ['linux','web-security','reseaux','cyber-offensive'] },
  { slug: 'pnpt',          name: 'PNPT',                provider: 'TCM Security',     priority: 4, linkedCourses: ['linux','active-directory','web-security','cyber-offensive'] },
  { slug: 'oscp',          name: 'OSCP',                provider: 'Offensive Security',priority: 5, linkedCourses: ['cyber-offensive','active-directory','linux'] },
  { slug: 'gcfe',          name: 'GCFE',                provider: 'GIAC',             priority: 6, linkedCourses: ['dfir'] },
  { slug: 'cissp',         name: 'CISSP',               provider: 'ISC2',             priority: 7, linkedCourses: COURSES.map(c => c.slug) },
]

// LABS (14 missions)
const LABS = [
  { slug: 'web-001', title: 'La Boutique Piratée',    category: 'web',     difficulty: 'beginner',      estimatedTime: 45,  totalPoints: 500,  kaliImage: 'nyx/kali-tools',
    targets: [{ name: 'webserver', image: 'vulnerables/web-dvwa', ip: '10.10.0.10', hostname: 'shop.lab' }],
    flags: [
      { flagId: 'flag-1', hint: 'Le premier flag est dans /var/www/html/secret/', value: 'FLAG{sql_injection_master}', points: 150 },
      { flagId: 'flag-2', hint: 'Uploade un web shell — le flag est dans /root/', value: 'FLAG{web_shell_uploaded}',   points: 200 },
      { flagId: 'flag-3', hint: 'Escalade vers root et lis /etc/shadow',          value: 'FLAG{privilege_escalated}',  points: 150 },
    ]
  },
  { slug: 'net-001', title: 'Premier Contact',        category: 'network', difficulty: 'beginner',      estimatedTime: 30,  totalPoints: 400,  kaliImage: 'nyx/kali-tools',
    targets: [{ name: 'target', image: 'tleemcjr/metasploitable2', ip: '10.10.0.10' }],
    flags: [
      { flagId: 'flag-1', hint: 'Trouve tous les services ouverts avec Nmap', value: 'FLAG{nmap_master_scanner}', points: 150 },
      { flagId: 'flag-2', hint: 'Exploite le service FTP vulnérable',          value: 'FLAG{ftp_backdoor_pwned}', points: 250 },
    ]
  },
  // ... 12 autres labs avec leurs configurations
]

async function main() {
  console.log('🌱 Seeding Nyx database...')

  // Supprimer les données existantes dans l'ordre
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

  // Créer les 16 cours
  for (const c of COURSES) {
    const course = await prisma.course.create({ data: { ...c, chapters: undefined } })
    // Créer les chapitres
    for (let i = 1; i <= c.chapters; i++) {
      await prisma.chapter.create({
        data: { courseId: course.id, number: i, title: `Chapitre ${i}`, status: 'not_started' }
      })
    }
  }

  // Certifications
  for (const cert of CERTIFICATIONS) {
    await prisma.certification.create({ data: { ...cert, linkedCourses: cert.linkedCourses } })
  }

  // Labs
  for (const lab of LABS) {
    const { flags, ...labData } = lab
    const created = await prisma.lab.create({ data: { ...labData, targets: labData.targets, prerequisites: [], published: true, mdPath: `content/labs/${lab.slug}.md` } })
    for (const flag of flags) {
      await prisma.labFlag.create({ data: { labId: created.id, ...flag } })
    }
  }

  // CheatEntries (500+) — générées par catégorie
  // ... (générer les entrées pour chaque catégorie)

  // Flashcards (10-15 par cours)
  // ... (générer les flashcards)

  console.log('✅ Seed terminé!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
```

---

## 16. CONTENU MARKDOWN — STANDARD

### Format obligatoire pour chaque chapitre

```markdown
---
title: [Titre]
chapter: [N]
course: [slug]
difficulty: beginner | intermediate | advanced
duration: [minutes]
tags: [tag1, tag2]
ceh_modules: ["Module X"]
objectives:
  - Comprendre ...
  - Savoir utiliser ...
---

## Introduction (200-300 mots)

## [Section 1 — Théorie] (300-500 mots)
[Texte + code + diagramme Mermaid]

```mermaid
[diagramme]
```

## [Section 2 — Pratique]

```bash ou python
[code commenté et expliqué]
```

<Figure src="/images/courses/[slug]/schema.svg" alt="..." caption="..." />

<CompareTable titleA="..." titleB="..." rows={[...]} />

<AttackDefenseTable rows={[...]} />

<CehCallout>Points clés CEH/OSCP...</CehCallout>

<AuditCallout>ISO 27001 contrôle...</AuditCallout>

## Lab — Mise en Pratique

**Environnement** : Kali Linux + [cibles]

<Steps steps={[
  { title: "...", description: "...", code: "..." },
]} />

## Questions de Révision
1. ...
2. ...
3. ...
```

---

## 17. QUALITÉ ET RÈGLES FINALES

```
TYPESCRIPT:
  - strict: true dans tsconfig.json
  - noImplicitAny: true
  - Pas de 'any' — utiliser 'unknown' si nécessaire
  - Imports absolus via '@/' (configurer paths dans tsconfig)
  - Chaque fonction a un type de retour explicite

DARK THEME (globals.css):
  :root {
    --background: #0d1117;
    --surface: #161b22;
    --border: #30363d;
    --text-primary: #e6edf3;
    --text-secondary: #8b949e;
    --green: #3fb950;
    --blue: #58a6ff;
    --red: #f85149;
    --orange: #e3b341;
    --purple: #a371f7;
    --teal: #2dd4bf;
  }
  Jamais de valeurs codées en dur dans les composants — toujours les variables CSS.
  Jamais utiliser Lucide React — uniquement hugeicons-react.

ARCHITECTURE:
  - Jamais de logique métier dans les Server Actions
  - Jamais de requêtes Prisma dans les composants
  - Jamais de requêtes Prisma dans les Server Actions (passer par les repositories)
  - Le cache Redis est géré dans les repositories, pas dans les services
  - Les Server Actions revalidatePath() après chaque mutation

DOCKER POUR LES LABS:
  - Toujours limiter les ressources (Memory: 512Mo, NanoCpus: 0.5)
  - Jamais --privileged sur les containers
  - Timeout automatique 2h avec cleanup Redis + Docker
  - Maximum 3 sessions concurrentes (vérifier avant de démarrer)

MINIO:
  - Bucket nyx-courses : images des cours (public en lecture)
  - Bucket nyx-labs : fichiers des labs (DFIR images, etc.)
  - Bucket nyx-uploads : uploads utilisateur
  - Toujours forcePathStyle: true pour MinIO

REDIS:
  - Toujours un TTL sur les clés (pas de clés permanentes sauf config)
  - Invalider le cache après chaque mutation (repositories)
  - Sessions lab dans Redis avec TTL 2h

COMMANDES DE LANCEMENT:
  docker-compose up -d postgres redis minio minio-init
  npx prisma generate && npx prisma db push && npx prisma db seed
  npm run dev   # ou: ts-node server.ts
```

---

*Nyx — Prompt Final Complet*
*PostgreSQL · MinIO · Redis · Docker · 16 cours · 128 chapitres · 14 labs*
