---
title: Sécurisation de la chaîne CI/CD
chapter: 2
course: devsecops
difficulty: intermediate
duration: 55
tags: [devsecops, ci-cd, secrets-management, supply-chain]
ceh_modules: []
objectives:
  - Durcir les runners CI (éphémères vs persistants) et appliquer le moindre privilège aux credentials de pipeline
  - Comparer les approches de gestion des secrets (variables chiffrées, HashiCorp Vault, sealed-secrets) et choisir la bonne selon le contexte
  - Protéger les branches critiques et signer commits/tags avec GPG
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
  image: node:20-alpine
```

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

```bash
# HashiCorp Vault — récupération dynamique d'un secret à durée de vie courte
vault login -method=jwt role=ci-pipeline jwt="$CI_JOB_JWT"
vault kv get -field=password secret/data/prod/database
```

<AuditCallout>
ISO 27001 (contrôle A.8.24, gestion des clés cryptographiques et des secrets) exige une traçabilité de l'accès aux secrets sensibles. Vault répond nativement à cette exigence grâce à son audit log ; les variables chiffrées natives d'une plateforme CI l'assurent plus partiellement (accès en lecture au secret non tracé au niveau du job).
</AuditCallout>

Quelle que soit l'approche, une règle ne souffre aucune exception : **un secret ne doit jamais apparaître en clair dans un fichier versionné**, qu'il s'agisse d'un pipeline YAML, d'un fichier de configuration, ou d'un commentaire de code.

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
```

<CehCallout>
En reconnaissance offensive, l'historique Git d'un dépôt (y compris les commits supprimés d'une branche mais toujours présents dans les objets Git) est une cible d'investigation classique — `git log --all`, les forks archivés, et les caches publics d'outils comme GitHub peuvent exposer un secret bien après sa suppression apparente du code actuel.
</CehCallout>

## En résumé

- Les runners CI éphémères éliminent la persistance d'une compromission et la contamination croisée entre projets — à privilégier systématiquement quand c'est possible.
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
  { title: "Aller plus loin (bonus non noté)", description: "Examine le Dockerfile applicatif et la configuration Terraform pour d'autres mauvaises pratiques (ADD depuis une URL distante, exécution root, port SSH ouvert à 0.0.0.0/0, bucket S3 public), et formule la correction que tu proposerais en revue de code. En conditions réelles, `trivy config .` ou `tfsec` automatisent une bonne partie de cet audit." },
]} />

## Questions de Révision

1. Pourquoi un runner CI éphémère réduit-il l'impact d'une compromission par rapport à un runner persistant ?
2. Qu'apporte concrètement l'authentification OIDC entre un pipeline CI et un fournisseur cloud, par rapport à des clés d'accès statiques stockées en secret CI ?
3. Dans quel contexte HashiCorp Vault apporte-t-il un avantage net par rapport aux variables chiffrées natives d'une plateforme CI ?
4. Pourquoi la signature GPG des commits, combinée à la protection de branche, empêche-t-elle un compte compromis de faire atteindre du code non vérifié à la production ?
5. Pourquoi supprimer un fichier contenant un secret dans un commit ultérieur ne suffit-il pas à protéger ce secret ?
6. Quelle est la seule remédiation réellement valable une fois qu'un secret cloud a été committé en clair, même par erreur ?
