# Nyx

Nyx est une plateforme personnelle d'apprentissage de la cybersécurité : cours Markdown, quiz, flashcards, travaux pratiques et laboratoires isolés dans Docker. L'interface et les contenus sont en français.

## Stack et architecture

- **Application** : Next.js 16, React 19 et TypeScript.
- **Serveur** : serveur Node personnalisé ([server.ts](./server.ts)) pour Next.js et le terminal WebSocket des labs.
- **Données** : PostgreSQL avec Prisma 7 ; Redis pour le cache et les sessions.
- **Fichiers** : stockage disque local (`./storage`, volume `uploads_data` dans Docker), servi sous `/uploads`.
- **Labs** : conteneurs Docker ; images et scénarios dans [infra/](./infra/) et [content/labs/](./content/labs/).
- **Lecture audio** : synthèse vocale native du navigateur (aucun service serveur).
- **Code** : composants sous [src/](./src/), schéma et seed sous [prisma/](./prisma/), cours sous [content/courses/](./content/courses/).

Les scripts et services disponibles sont définis dans [package.json](./package.json) et [docker-compose.yml](./docker-compose.yml). Il existe également une configuration de préproduction avec Nginx dans [docker-compose.preprod.yml](./docker-compose.preprod.yml).

## Prérequis

Pour le développement local :

- Node.js 20 ou plus récent et npm ;
- Docker avec le plugin Docker Compose ;
- Git.

Les labs nécessitent que Docker soit accessible depuis le serveur Nyx. Pour utiliser le terminal/labs dans l'application lancée directement sur l'hôte, le compte qui exécute Node doit pouvoir accéder au socket ou au moteur Docker. Le mode préproduction monte `/var/run/docker.sock` dans le conteneur app : cela donne à l'application un accès étendu au moteur Docker.

## Lancer en développement

### 1. Récupérer le projet et installer les dépendances

```bash
git clone <URL_DU_DEPOT>
cd nyx
npm ci
```

### 2. Créer `.env.local`

Ce fichier est ignoré par Git. Pour exécuter Next.js **sur l'hôte** et les services de données dans Docker, utiliser des adresses `localhost` :

```dotenv
DATABASE_URL="postgresql://nyx:nyx_dev_secret@localhost:5432/nyx?schema=public"
DIRECT_URL="postgresql://nyx:nyx_dev_secret@localhost:5432/nyx?schema=public"

REDIS_URL="redis://localhost:6379"
REDIS_PREFIX="nyx:"

NEXTAUTH_SECRET="<secret-aleatoire>"
NEXTAUTH_URL="http://localhost:3000"

DOCKER_SOCKET="/var/run/docker.sock"
LAB_SESSION_TIMEOUT_HOURS="2"
LAB_MAX_CONCURRENT_SESSIONS="3"

# Optionnel — répertoire des fichiers uploadés (défaut : ./storage)
# STORAGE_DIR="./storage"
```

Générer le secret d'authentification avec `openssl rand -base64 32`, puis remplacer `<secret-aleatoire>`. Les valeurs PostgreSQL ci-dessus sont des valeurs locales de développement, pas des secrets de déploiement.

### 3. Démarrer les dépendances

```bash
docker compose up -d postgres redis
```

PostgreSQL est publié sur `localhost:5432` et Redis sur `localhost:6379`.

### 4. Initialiser la base et charger les données de démonstration

```bash
npx prisma generate
npm run db:push
npm run db:seed
```

**Attention :** le seed n'est pas une migration. Il supprime les données applicatives existantes et vide Redis avant de recréer les données, dont le compte de démonstration. Ne l'exécutez que sur une base et un Redis de développement isolés ; ne l'utilisez jamais sur des données à conserver ou en production. Les identifiants du compte de démonstration sont définis en clair dans [prisma/seed.ts](./prisma/seed.ts) : ils sont réservés au développement et ne doivent jamais être exposés sur un service public.

### 5. Démarrer l'application

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000). Le script démarre le serveur Node personnalisé avec rechargement en développement ; le terminal WebSocket est disponible sous `/ws/terminal`.

### Lancer Nyx entièrement dans Compose

Le service `app` de [docker-compose.yml](./docker-compose.yml) lit `.env.local` mais remplace automatiquement `DATABASE_URL`, `DIRECT_URL` et `REDIS_URL` par les noms de service Compose (`postgres`, `redis`) : le même `.env.local` fonctionne donc sur l'hôte et dans Docker.

```bash
docker compose up -d --build
```

## Commandes utiles

| Commande | Description |
| --- | --- |
| `npm run dev` | Serveur de développement avec rechargement |
| `npm run lint` | Vérification ESLint |
| `npm run build` | Build Next.js de production |
| `npm run start` | Démarre le serveur Node en mode production |
| `npm run db:push` | Synchronise le schéma Prisma avec la base |
| `npm run db:seed` | Réinitialise et peuple les données de démonstration |
| `npm run db:studio` | Ouvre Prisma Studio |
| `npm run docker:build-kali` | Construit l'image `nyx/kali-tools:latest` |
| `npm run docker:build-labs` | Construit les images de labs personnalisées déclarées dans les scripts |

`db:push` convient au développement, mais ne remplace pas un processus de migrations contrôlé pour une base de production.

## Préproduction Docker

La configuration préproduction utilise l'image construite par le [Dockerfile](./Dockerfile), expose Nginx sur le port `8080` et suppose que les dépendances partagent le réseau Compose `nyx_default`. Elle est prévue pour un essai local ou un environnement de préproduction, **pas pour exposer directement Nyx sur Internet**.

1. Créez et remplissez `.env.local` avec les secrets et les paramètres nécessaires. Ne réutilisez pas les secrets ou identifiants de démonstration en production.
2. Démarrez d'abord les services dépendants et créez le réseau Compose :

   ```bash
   docker compose up -d postgres redis
   ```

3. Initialisez la base depuis l'hôte si nécessaire (avec les URL `localhost` du fichier `.env.local`) :

   ```bash
   npm ci
   npx prisma generate
   npm run db:push
   ```

   Ne lancez pas `npm run db:seed` sur une base contenant des données à conserver.

4. Construisez et démarrez l'application préproduction et Nginx :

   ```bash
   docker compose -f docker-compose.preprod.yml up -d --build
   docker compose -f docker-compose.preprod.yml logs -f app nginx
   ```

5. Accédez à [http://localhost:8080](http://localhost:8080).

Le Compose préproduction remplace les URL internes de PostgreSQL et Redis par leurs noms de conteneur. Les ports des services de données sont publiés sur l'hôte par le Compose principal.

### Avant tout déploiement public

La configuration fournie n'est pas un déploiement de production prêt à l'emploi : Nginx écoute en HTTP, certains services et ports sont publiés sur l'hôte, et le conteneur app reçoit le socket Docker. Avant une exposition publique, il faut notamment configurer TLS et les domaines/URL externes, remplacer tous les secrets et identifiants par défaut, restreindre les ports et l'accès au socket Docker, protéger les services de stockage et de données, et mettre en place sauvegardes, mises à jour et supervision. Ne publiez pas le socket Docker ni les interfaces d'administration sur Internet.

## Dépannage

- **Prisma ne se connecte pas** : vérifiez que PostgreSQL est démarré (`docker compose ps`) et que `DATABASE_URL` utilise `localhost` depuis l'hôte ou `postgres` depuis un conteneur.
- **Erreur Redis pendant le seed** : le seed vide Redis ; vérifiez `REDIS_URL` et que Redis est démarré.
- **Upload impossible** : vérifiez que le répertoire `STORAGE_DIR` (défaut `./storage`) est accessible en écriture par le processus Node.
- **Terminal/labs indisponibles** : vérifiez l'accès au moteur Docker, la présence de l'image Kali (`npm run docker:build-kali`) et les images cibles requises par le lab.
- **L'application conteneurisée ne joint pas un service** : dans les URL utilisées par le conteneur, `localhost` désigne le conteneur lui-même ; utilisez le nom du service Compose.

## Utilisation responsable

Les exercices de sécurité doivent être exécutés uniquement dans les laboratoires isolés de Nyx ou sur des systèmes pour lesquels vous avez une autorisation explicite. Les images de labs peuvent contenir volontairement des logiciels vulnérables ; ne les exposez pas à des réseaux non maîtrisés.
