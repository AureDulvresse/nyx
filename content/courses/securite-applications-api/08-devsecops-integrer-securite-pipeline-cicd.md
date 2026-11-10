---
title: DevSecOps — intégrer la sécurité dans un pipeline CI/CD
chapter: 8
course: securite-applications-api
difficulty: advanced
duration: 60
tags: [devsecops, cicd, pipeline, security-gates, synthese]
ceh_modules: ["Module 14 - Hacking Web Applications"]
objectives:
  - Comprendre le principe du DevSecOps et son lien direct avec le SSDLC
  - Placer SAST, SCA, détection de secrets et DAST au bon moment d'un pipeline CI/CD
  - Concevoir une politique de blocage graduée selon la criticité, et gérer les exceptions
  - Mesurer l'efficacité du programme et construire une synthèse complète du cours
---

## Introduction

Ce dernier chapitre referme le cours en assemblant tous les concepts précédents — modélisation des menaces, sécurité des API, authentification, microservices, chaîne d'approvisionnement, tests automatisés — dans un cadre opérationnel concret : le pipeline d'intégration et de déploiement continus (**CI/CD**). C'est là que la sécurité doit s'intégrer sans ralentir excessivement la livraison logicielle, sous peine d'être contournée.

À la fin, tu sauras expliquer ce qu'apporte le DevSecOps, positionner chaque contrôle automatisé à l'étape où il est le plus utile, définir une politique de blocage que les équipes respecteront durablement, et suivre quelques indicateurs pour piloter l'amélioration. Le durcissement de la plateforme CI/CD elle-même, la sécurité des conteneurs et de Kubernetes sont approfondis dans le cours DevSecOps Avancé.

## Le principe du DevSecOps

Le **DevOps** a rapproché le développement et l'exploitation pour livrer plus vite et plus souvent. Le **DevSecOps** prolonge ce mouvement en y intégrant la sécurité comme une **responsabilité partagée** par toute l'équipe, automatisée à chaque étape du pipeline, plutôt que confiée exclusivement à une équipe sécurité séparée qui intervient tardivement.

<CehCallout>
Le DevSecOps prolonge directement le principe du SSDLC vu au chapitre 1. Les deux répondent au même constat : une sécurité ajoutée tardivement, en fin de cycle, coûte plus cher et ralentit davantage la livraison qu'une sécurité intégrée dès le départ. Le DevSecOps y répond en automatisant les vérifications à chaque étape plutôt qu'en un contrôle final unique et bloquant.
</CehCallout>

Trois idées guident la démarche. La **rapidité du retour** : un développeur corrige bien mieux une alerte reçue quelques minutes après son commit qu'un rapport d'audit reçu trois mois plus tard. L'**automatisation** : ce qui est vérifié à la main est vérifié irrégulièrement. Et la **culture** : des référents sécurité (security champions) dans chaque équipe font le lien entre les développeurs et l'équipe sécurité.

## Où intégrer chaque contrôle dans le pipeline

Chaque type de test a un moment naturel d'intégration, déterminé par ce dont il a besoin pour fonctionner : du code source seul, la liste des dépendances, un artefact construit, ou une application en cours d'exécution.

```mermaid
flowchart LR
    A["Poste du developpeur"] --> B["Commit / pull request"]
    B --> C["SAST + SCA + secrets"]
    C --> D["Build et SBOM"]
    D --> E["Scan d'image et signature"]
    E --> F["Deploiement en test"]
    F --> G["DAST"]
    G --> H["Production"]
    H --> I["Surveillance et veille CVE"]
```

<Steps steps={[
  { title: "Sur le poste du développeur", description: "Extensions SAST dans l'editeur et detection de secrets avant commit (pre-commit hook) : le retour le plus rapide possible." },
  { title: "SAST au commit ou à la pull request", description: "Le code source est disponible des cette etape, sans besoin d'executer l'application ; les resultats s'affichent directement dans la revue de code." },
  { title: "SCA dès la résolution des dépendances", description: "Des que le fichier de dependances est connu, le SCA verifie chaque composant contre les bases de CVE, bien avant qu'une application ne soit deployee." },
  { title: "Build, SBOM et signature", description: "Le build genere le SBOM (chapitre 6), l'image est analysee puis signee pour que le deploiement puisse verifier sa provenance." },
  { title: "DAST après déploiement en environnement de test", description: "Le DAST a besoin d'une application reellement en cours d'execution pour l'examiner de l'exterieur." },
  { title: "En production", description: "Surveillance, journalisation, et veille continue : une nouvelle CVE peut toucher un composant deja deploye, d'ou l'interet des SBOM archives." },
]} />

### Exemple de pipeline

```yaml
# Extrait de pipeline GitHub Actions : controles de securite a la pull request
name: securite
on: [pull_request]

jobs:
  sast:
    runs-on: ubuntu-latest
    container: semgrep/semgrep
    steps:
      - uses: actions/checkout@v4
      - run: semgrep scan --config auto --error   # echoue si une regle bloquante est violee

  sca:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: trivy fs --scanners vuln --severity CRITICAL --exit-code 1 .
        # seul le niveau critique bloque ; les autres niveaux sont remontes sans bloquer
```

Les actions tierces utilisées dans un pipeline font elles-mêmes partie de la chaîne d'approvisionnement : en production, on les épingle par empreinte de commit plutôt que par étiquette, et on limite les permissions du jeton de CI au strict nécessaire.

## Bloquer ou alerter : la politique de criticité graduée

Un pipeline peut réagir de deux façons à une découverte : **bloquer** la fusion ou le déploiement, ou **alerter** pour un traitement ultérieur. Le choix entre les deux est l'un des points les plus importants de toute la démarche.

<TipCallout>
Un pipeline qui bloque systématiquement au moindre avertissement mineur finit par être contourné par les équipes sous pression de livraison : désactivation de l'étape, exceptions massives, ou contournement du pipeline. Une politique de criticité graduée, où seules les vulnérabilités réellement critiques bloquent le déploiement, est indispensable pour que la sécurité automatisée reste durablement respectée.
</TipCallout>

<CompareTable
  titleA="Niveau"
  titleB="Reaction du pipeline"
  rows={[
    { a: "Critique, ou vulnerabilite au catalogue CISA KEV", b: "Blocage du deploiement ; correction ou exception formelle obligatoire" },
    { a: "Elevee", b: "Blocage des nouvelles occurrences ; delai de correction defini pour l'existant" },
    { a: "Moyenne", b: "Alerte et ticket automatique, traitement planifie" },
    { a: "Faible", b: "Suivi dans le tableau de bord, sans interruption" },
  ]}
/>

Deux pratiques rendent cette politique tenable. La première consiste à ne bloquer que les **nouvelles** vulnérabilités introduites par une modification, en traitant la dette existante selon un plan séparé : sinon, le premier jour, tout est bloqué. La seconde est un processus d'**exception** formel : une vulnérabilité acceptée temporairement est documentée, justifiée, approuvée par un responsable, et assortie d'une date d'expiration.

## Mesurer et améliorer

Un programme DevSecOps se pilote avec quelques indicateurs simples : le **délai moyen de correction** par niveau de criticité, le **nombre de vulnérabilités critiques ouvertes** en production, le **taux de faux positifs** de chaque outil, la **part des dépôts couverts** par les contrôles, et le nombre d'**exceptions** en cours. L'OWASP SAMM (chapitre 1) permet par ailleurs d'évaluer la maturité globale et de fixer des objectifs progressifs.

<AuditCallout>
Ces indicateurs alimentent la fonction Govern introduite par le NIST CSF 2.0, qui demande de piloter la cybersécurité par les risques et de mesurer son efficacité. L'ISO/IEC 27001:2022 exige l'intégration de la sécurité dans le cycle de développement (thème A.8) et l'amélioration continue du système de management. Pour les produits commercialisés dans l'Union européenne, le Cyber Resilience Act impose une gestion des vulnérabilités tout au long du cycle de vie, que ce type de pipeline aide à démontrer.
</AuditCallout>

## Angle offensif et défensif

<AttackDefenseTable rows={[
  { phase: "Introduction de faille", attack: "Une vulnerabilite est fusionnee sans controle", defense: "SAST, SCA et detection de secrets a chaque pull request" },
  { phase: "Pipeline", attack: "Compromettre une action tierce ou un jeton de CI", defense: "Actions epinglees par empreinte, permissions minimales, secrets de CI proteges" },
  { phase: "Deploiement", attack: "Deployer une image modifiee ou non verifiee", defense: "Signature et verification de provenance avant deploiement" },
  { phase: "Contournement", attack: "Les equipes desactivent les controles trop bloquants", defense: "Criticite graduee, blocage des nouvelles failles seulement, exceptions formelles" },
]} />

## Synthèse — panorama complet du cours

<CompareTable
  titleA="Chapitre"
  titleB="Contribution au panorama"
  rows={[
    { a: "1. SSDLC et threat modeling", b: "Integrer la securite des la conception, identifier les menaces avec STRIDE" },
    { a: "2. OWASP API Security Top 10", b: "Les vulnerabilites specifiques aux API, en particulier BOLA" },
    { a: "3. OAuth 2.0, JWT et cles API", b: "Authentifier et autoriser correctement les echanges avec une API" },
    { a: "4. GraphQL", b: "Les risques d'une API a point d'entree unique et flexible" },
    { a: "5. Microservices", b: "Securiser la communication inter-services avec mTLS et Zero Trust" },
    { a: "6. Chaine d'approvisionnement", b: "Maitriser les risques des dependances tierces avec un SBOM" },
    { a: "7. SAST, DAST, SCA", b: "Automatiser la detection de vulnerabilites a chaque niveau" },
    { a: "8. DevSecOps", b: "Integrer l'ensemble dans un pipeline CI/CD operationnel" },
  ]}
/>

## Erreurs fréquentes

Les erreurs courantes sont : empiler les outils sans définir qui traite les alertes ; bloquer sur tout dès le premier jour ; accorder des exceptions sans date d'expiration ; lancer un DAST actif contre la production ; donner au jeton de CI des droits d'écriture étendus ; et mesurer le nombre d'outils déployés plutôt que le délai réel de correction.

## Lab — Mise en pratique

**Environnement** : réflexion guidée et projet de lab

<Steps steps={[
  { title: "Positionner les contrôles", description: "Pour un pipeline simple (commit, build, test, deploiement), indique a quelle etape integrer SAST, SCA, detection de secrets et DAST, et justifie chaque choix par ce dont l'outil a besoin." },
  { title: "Écrire la politique de blocage", description: "Redige une politique de criticite graduee en quatre niveaux, en precisant le traitement des vulnerabilites presentes au catalogue CISA KEV." },
  { title: "Rédiger un processus d'exception", description: "Definis les informations obligatoires d'une exception : justification, approbateur, mesure compensatoire, date d'expiration." },
  { title: "Construire le pipeline", description: "Sur le projet de lab, ajoute un controle SAST et un controle SCA a la pull request, en ne bloquant que le niveau critique." },
  { title: "Vérifier le comportement", description: "Introduis volontairement une dependance vulnerable de faible severite puis une critique, et observe que seule la seconde bloque la fusion." },
  { title: "Définir les indicateurs", description: "Choisis trois indicateurs pour suivre l'efficacite du programme et explique comment les mesurer." },
]} />

## À retenir

- Le DevSecOps automatise la sécurité à chaque étape du pipeline et en fait une responsabilité partagée, dans le prolongement du SSDLC.
- SAST et SCA s'intègrent tôt (code et dépendances), tandis que le DAST nécessite une application déployée en environnement de test.
- SBOM, scan et signature des artefacts relient le pipeline à la sécurité de la chaîne d'approvisionnement.
- Une politique de criticité graduée, bloquant seulement le critique et les nouvelles failles, évite le contournement par les équipes.
- Les exceptions doivent être formelles et temporaires, et le programme se pilote par des indicateurs comme le délai de correction.

## Questions de révision

1. En quoi le DevSecOps prolonge-t-il directement le principe du SSDLC vu au chapitre 1 ?
2. Que fait le DevSecOps de la responsabilité de la sécurité par rapport à une approche traditionnelle ?
3. Pourquoi le SCA peut-il s'exécuter plus tôt dans le pipeline que le DAST ?
4. Pourquoi une politique de blocage systématique au moindre avertissement est-elle contre-productive ?
5. Pourquoi est-il judicieux de ne bloquer que les nouvelles vulnérabilités introduites par une modification ?
6. Pourquoi les actions tierces d'un pipeline font-elles partie de la chaîne d'approvisionnement ?
7. Quels indicateurs permettent de mesurer l'efficacité réelle d'un programme DevSecOps ?

Félicitations, tu viens de terminer le cours **Sécurité des Applications et des API** ! Tu maîtrises désormais la sécurité applicative au-delà de la correction de vulnérabilités déjà présentes : de la conception (modélisation des menaces) à la mise en production automatisée (DevSecOps), en passant par les risques spécifiques aux API modernes, aux microservices et à la chaîne d'approvisionnement logicielle. Ces compétences complètent directement le cours Sécurité Web (OWASP) et préparent le cours DevSecOps Avancé.
