---
title: Intégration continue (CI) et pipelines automatisés
chapter: 3
course: devops
difficulty: intermediate
duration: 55
tags: [ci-cd, github-actions, tests, automatisation, pipelines]
ceh_modules: []
objectives:
  - Comprendre les stages d'un pipeline CI (lint, build, test, package) et leur enchaînement
  - Écrire et comprendre un pipeline GitHub Actions complet pour un projet réel
  - Distinguer tests unitaires et tests d'intégration dans une logique fail-fast
  - Maîtriser artifacts, cache et matrix builds pour des pipelines rapides et fiables
---

## Introduction

L'intégration continue (CI, *Continuous Integration*) est la pratique consistant à fusionner et valider automatiquement chaque changement de code, plusieurs fois par jour, plutôt que d'attendre une intégration manuelle tardive et risquée. Historiquement, l'absence de CI menait au tristement célèbre « merge hell » : des semaines de divergence entre branches qui se terminaient en conflits massifs et en bugs découverts trop tard.

Un pipeline CI automatise une séquence de vérifications — style du code, compilation, tests, empaquetage — à chaque `push` ou pull request. Si une étape échoue, le pipeline s'arrête et prévient l'équipe immédiatement : c'est le principe du **fail-fast**, détecter un problème en quelques minutes plutôt qu'en production plusieurs jours plus tard.

Ce chapitre construit un pipeline CI complet avec GitHub Actions, l'outil le plus répandu dans l'écosystème open source et professionnel. Tu apprendras à structurer les stages, à écrire un fichier YAML de bout en bout, à distinguer les types de tests exécutés, à optimiser les temps d'exécution avec le cache et les artifacts, à tester sur plusieurs versions d'environnement avec les matrix builds, et à comprendre pourquoi la protection de branche est indissociable d'une CI qui a du sens. Ce chapitre pose les fondations ; le cours **DevSecOps Avancé** creusera la dimension sécurité du pipeline (scan de secrets, SAST) que nous ne faisons qu'évoquer ici.

## Le concept de pipeline : lint → build → test → package

Un pipeline CI bien conçu enchaîne des stages dans un ordre précis, chacun filtrant les erreurs les moins coûteuses à détecter avant les plus coûteuses.

<CompareTable
  titleA="Stage"
  titleB="Rôle"
  rows={[
    { a: "Lint", b: "Vérifie le style et les erreurs évidentes (variables inutilisées, syntaxe) — quelques secondes, échoue vite" },
    { a: "Build", b: "Compile ou transpile le code — confirme que le projet est dans un état exécutable" },
    { a: "Test", b: "Exécute les suites de tests unitaires puis d'intégration — valide le comportement fonctionnel" },
    { a: "Package", b: "Produit un artefact déployable (image Docker, binaire, archive) prêt pour la suite du pipeline CD" },
  ]}
/>

Cet ordre n'est pas arbitraire : il place les vérifications les moins chères en premier. Il ne sert à rien de lancer une suite de tests de 10 minutes si le code ne compile même pas — le lint et le build filtrent 80 % des erreurs triviales en quelques secondes.

<TipCallout>
Chaque stage qui échoue doit interrompre immédiatement le pipeline (fail-fast) plutôt que de continuer à exécuter les étapes suivantes sur un état déjà invalide — cela économise du temps de calcul et raccourcit le délai de feedback pour le développeur.
</TipCallout>

## Un pipeline GitHub Actions complet, commenté

Voici un fichier `.github/workflows/ci.yml` réaliste pour un projet Node.js/TypeScript, structuré exactement selon les quatre stages précédents.

```yaml
name: CI                                # Nom affiché dans l'onglet Actions de GitHub

on:                                     # Déclencheurs du pipeline
  push:
    branches: [main]                    # À chaque push sur main
  pull_request:
    branches: [main]                    # À chaque PR ciblant main

jobs:
  lint:
    runs-on: ubuntu-latest              # Machine virtuelle éphémère fournie par GitHub
    steps:
      - uses: actions/checkout@v4       # Récupère le code du dépôt sur le runner
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'                  # Met en cache le répertoire npm entre les runs
      - run: npm ci                     # Installation stricte depuis package-lock.json
      - run: npm run lint               # ESLint — échoue le job si des erreurs sont trouvées

  build:
    needs: lint                         # N'exécute build QUE si lint a réussi
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build              # Compilation TypeScript → JavaScript
      - uses: actions/upload-artifact@v4 # Sauvegarde le résultat pour les jobs suivants
        with:
          name: dist
          path: dist/

  test:
    needs: build
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: ['18', '20', '22'] # Matrix build : 3 exécutions en parallèle
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit          # Tests unitaires — rapides, isolés
      - run: npm run test:integration   # Tests d'intégration — plus lents, DB réelle

  package:
    needs: test                         # Ne s'exécute que si TOUTES les combinaisons matrix ont réussi
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      - name: Build Docker image
        run: docker build -t myapp:${{ github.sha }} .
```

Quelques points méritent d'être détaillés :

- `on.pull_request` garantit que la CI tourne **avant** le merge, pas seulement après — c'est la seule manière de bloquer un code cassé en amont.
- `needs:` crée une dépendance explicite entre jobs : `build` attend que `lint` réussisse, `test` attend `build`, etc. Sans `needs`, GitHub Actions exécuterait tous les jobs en parallèle.
- `${{ github.sha }}` référence le hash du commit courant, utile pour tagger précisément une image Docker.

<WarningCallout>
Un pipeline sans `needs` correctement configuré peut donner une fausse impression de sécurité : si `test` s'exécute en parallèle de `build` plutôt qu'après, un échec de compilation peut passer inaperçu si les tests eux-mêmes réussissent sur un ancien artefact en cache.
</WarningCallout>

## Tests automatisés : unitaires, intégration, et fail-fast

Le stage `test` du pipeline ci-dessus exécute deux catégories de tests aux objectifs très différents.

<CompareTable
  titleA="Type de test"
  titleB="Caractéristiques"
  rows={[
    { a: "Unitaire", b: "Teste une fonction ou un module isolé, sans dépendance externe (mocks) — s'exécute en millisecondes, des centaines par seconde" },
    { a: "Intégration", b: "Teste l'interaction réelle entre composants (base de données, API externe) — plus lent, plus proche des conditions réelles" },
  ]}
/>

L'ordre `test:unit` avant `test:integration` n'est pas un détail : les tests unitaires étant nettement plus rapides et plus nombreux, ils doivent échouer en premier pour donner un feedback immédiat, avant d'investir du temps de calcul dans des tests d'intégration plus coûteux (démarrage d'une base PostgreSQL, appels réseau simulés). C'est une application directe du fail-fast au niveau des tests eux-mêmes.

<TipCallout>
Dans la plupart des frameworks (Jest, Vitest, pytest), il est possible de configurer un seuil de couverture minimal (`--coverage --coverageThreshold`) qui fait échouer le pipeline si la couverture de tests chute en dessous d'un pourcentage défini — une garde-fou utile contre l'érosion progressive de la qualité.
</TipCallout>

## Artifacts et cache : accélérer sans sacrifier la fiabilité

Deux mécanismes distincts, souvent confondus, optimisent la vitesse d'un pipeline CI.

Le **cache** (`cache: 'npm'` dans l'exemple, ou l'action dédiée `actions/cache`) conserve des données qui ne changent pas souvent d'un run à l'autre — typiquement le répertoire `node_modules` ou `~/.npm`. Il accélère l'installation des dépendances mais n'est qu'une optimisation : sa perte (cache invalidé, expiré) ne doit jamais casser le pipeline, seulement le ralentir.

Les **artifacts** (`actions/upload-artifact` / `actions/download-artifact`) transportent le résultat produit par un job vers un job suivant, ou vers l'extérieur du pipeline (téléchargement manuel, déploiement). Contrairement au cache, un artifact est indispensable au bon déroulement du pipeline : dans l'exemple ci-dessus, le job `package` a explicitement besoin du dossier `dist/` produit par `build`, car chaque job GitHub Actions démarre sur une machine virtuelle vierge.

<WarningCallout>
Ne jamais confondre cache et artifact : un cache est une optimisation best-effort (peut être vide, doit être régénérable), un artifact est un livrable attendu par un job en aval. Utiliser un cache là où un artifact est nécessaire peut faire échouer silencieusement des jobs en aval si le cache n'est pas restauré comme prévu.
</WarningCallout>

## Matrix builds : valider plusieurs environnements

La section `strategy.matrix` de l'exemple GitHub Actions exécute le job `test` trois fois en parallèle, une fois par version de Node.js listée (18, 20, 22). GitHub Actions génère automatiquement une combinaison de jobs pour chaque valeur de la matrice — utile pour garantir la compatibilité d'une bibliothèque avec plusieurs versions de runtime, plusieurs OS (`ubuntu-latest`, `windows-latest`, `macos-latest`), ou plusieurs versions de base de données.

```yaml
strategy:
  matrix:
    node-version: ['18', '20', '22']
    os: [ubuntu-latest, windows-latest]
  # Génère 3 × 2 = 6 jobs exécutés en parallèle
```

<TipCallout>
Une matrix build multiplie le temps de calcul consommé (et parfois le coût, sur les runners GitHub Actions privés) : réserve-la aux dimensions réellement nécessaires — une bibliothèque publique multi-plateforme en a besoin, une application interne mono-environnement généralement pas.
</TipCallout>

## Pourquoi un build cassé doit bloquer le merge

Un pipeline CI qui échoue mais n'empêche personne de merger n'a quasiment aucune valeur : il devient un indicateur ignoré plutôt qu'une garde-fou. C'est le rôle de la **protection de branche** (*branch protection*), une configuration au niveau du dépôt GitHub qui impose, avant tout merge sur `main` :

- Le succès de tous les checks CI requis (lint, build, test).
- Un nombre minimal de relectures approuvées (*code review*).
- Une branche à jour avec `main` avant le merge, pour éviter qu'un changement récent ne casse silencieusement une PR déjà validée.

<AuditCallout>
Sur GitHub, la protection de branche se configure dans *Settings → Branches → Branch protection rules*, avec l'option « Require status checks to pass before merging ». Sans cette activation explicite, un job CI rouge n'affiche qu'un avertissement visuel — il ne bloque techniquement rien.
</AuditCallout>

L'enjeu dépasse la simple discipline d'équipe : un build cassé mergé sur `main` peut invalider immédiatement l'environnement de tout développeur qui tire la branche, et si un déploiement continu (CD) est branché derrière cette CI, un merge non bloqué peut littéralement pousser du code cassé en production en quelques minutes.

<CehCallout>
Ce chapitre s'arrête volontairement à la porte de la sécurité applicative dans le pipeline. Le scan automatique de secrets (clés API oubliées dans un commit) et l'analyse statique de sécurité (SAST) sur chaque pull request sont traités en détail dans le cours **DevSecOps Avancé** — la CI que tu viens de construire est exactement le point d'ancrage où ces contrôles s'intégreront.
</CehCallout>

## Lab — Mise en Pratique

**Environnement** : Terminal Nyx Shell — dépôt Git local avec un projet Node.js minimal

<Steps steps={[
  { title: "Initialiser le pipeline", description: "Crée le dossier de workflow et le fichier YAML dans ton dépôt local.", code: "mkdir -p .github/workflows && touch .github/workflows/ci.yml" },
  { title: "Écrire les stages lint et build", description: "Ajoute les jobs lint et build avec la dépendance needs entre eux, en t'inspirant de l'exemple du chapitre." },
  { title: "Ajouter le stage test en matrix build", description: "Configure une matrice sur au moins deux versions de Node.js et vérifie que 2 jobs distincts apparaissent dans l'onglet Actions après un push." },
  { title: "Casser volontairement un test", description: "Modifie un test pour qu'il échoue, pousse la branche, et observe le pipeline s'arrêter en rouge avant le stage package.", code: "git commit -am 'test: introduire une regression volontaire' && git push" },
  { title: "Configurer la protection de branche", description: "Active 'Require status checks to pass before merging' sur la branche main dans les paramètres du dépôt GitHub, puis vérifie qu'une pull request avec un test cassé ne peut plus être mergée." },
]} />

## En résumé

- Un pipeline CI enchaîne les stages lint → build → test → package, du moins coûteux au plus coûteux, selon le principe fail-fast.
- Un fichier `.github/workflows/ci.yml` définit des jobs liés par `needs:`, déclenchés sur `push` et `pull_request`.
- Les tests unitaires (rapides, isolés) doivent s'exécuter avant les tests d'intégration (plus lents, dépendances réelles).
- Le cache accélère le pipeline sans être indispensable ; les artifacts transportent un livrable requis entre jobs et machines virtuelles distinctes.
- Les matrix builds valident automatiquement plusieurs versions d'environnement en parallèle, au prix d'un temps de calcul multiplié.
- Sans protection de branche activée explicitement, un pipeline CI rouge n'empêche techniquement aucun merge.
- Le scan de secrets et le SAST, non couverts ici, seront approfondis dans le cours DevSecOps Avancé.

## Questions de Révision

1. Pourquoi place-t-on le stage lint avant le stage test dans un pipeline CI ?
2. À quoi sert l'instruction `needs:` dans un fichier GitHub Actions, et que se passe-t-il si elle est omise ?
3. Quelle est la différence fonctionnelle entre un cache et un artifact dans un pipeline CI ?
4. Pourquoi exécute-t-on les tests unitaires avant les tests d'intégration plutôt que l'inverse ?
5. Qu'apporte concrètement une matrix build par rapport à un job de test unique ?
6. Pourquoi un pipeline CI qui échoue sans protection de branche activée n'offre-t-il qu'une garantie illusoire ?
