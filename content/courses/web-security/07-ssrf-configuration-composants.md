---
title: SSRF, mauvaises configurations et composants vulnérables
chapter: 7
course: web-security
difficulty: intermediate
duration: 55
tags: [web, ssrf, misconfiguration, cve, patch-management]
ceh_modules: ["Module 14 - Hacking Web Applications"]
objectives:
  - Comprendre le mécanisme d'une attaque SSRF et pourquoi elle est critique en environnement cloud
  - Identifier les erreurs de configuration de sécurité les plus courantes
  - Évaluer et prioriser les vulnérabilités connues (CVE) d'un composant avec CVSS, EPSS et CISA KEV
  - Appliquer les défenses : validation des destinations, durcissement de configuration, gestion des correctifs
---

## Introduction

Ce chapitre regroupe trois catégories de l'OWASP Top 10 qui partagent un point commun : elles n'exploitent pas un bug de code applicatif, mais un défaut de conception ou de configuration de l'infrastructure autour de l'application. Le **SSRF** est la catégorie A10 de l'édition 2021 ; la **mauvaise configuration de sécurité** (A05) gagne en importance dans l'édition 2025 ; et les **composants vulnérables et obsolètes** (A06) restent une cause majeure de compromissions.

Ce chapitre adopte l'angle du défenseur : comprendre ces défauts pour les éliminer, durcir la configuration, et surtout prioriser et appliquer les correctifs. Tu apprendras aussi à évaluer la gravité réelle d'une vulnérabilité avec les référentiels à jour.

## SSRF : le serveur manipulé pour émettre une requête

Le **Server-Side Request Forgery** pousse le serveur cible à émettre une requête vers une destination choisie par l'attaquant, souvent vers des ressources internes normalement inaccessibles depuis Internet. La faille naît d'une fonctionnalité légitime — récupérer une ressource depuis une URL fournie par l'utilisateur — dont la destination n'est pas validée.

```text
Fonctionnalite legitime : l'application recupere une image depuis une URL fournie
POST /import-image
url=https://exemple.com/photo.jpg

Risque SSRF : la destination n'est pas validee et peut viser le reseau interne
url=http://<ressource-interne>/...
-> Le serveur, qui a acces au reseau interne, effectue la requete a la place de l'attaquant.
```

Le scénario le plus critique concerne le cloud : l'adresse `169.254.169.254` expose, sur de nombreuses plateformes, le service de métadonnées de l'instance, qui peut contenir des identifiants IAM temporaires. Un SSRF vers cette adresse peut donc mener à la compromission d'identifiants cloud.

<CehCallout>
Retiens le principe : un SSRF transforme le serveur en relais de requêtes. Sa gravité vient de la position du serveur dans le réseau, qui lui donne accès à des ressources internes et à des services de métadonnées (comme `169.254.169.254` en cloud) inaccessibles depuis l'extérieur. Les plateformes cloud modernes imposent désormais un service de métadonnées renforcé exigeant un jeton, précisément pour réduire ce risque.
</CehCallout>

La défense repose sur la **validation stricte des destinations** : liste d'autorisation des hôtes et schémas permis, rejet des adresses internes et de bouclage, résolution DNS contrôlée pour éviter les contournements, et usage d'un service de métadonnées cloud exigeant un jeton.

## Security Misconfiguration : les erreurs classiques

La mauvaise configuration est l'une des découvertes d'audit les plus fréquentes, parce qu'elle résulte souvent de valeurs par défaut non modifiées ou de fonctionnalités de développement laissées actives en production.

<CompareTable
  titleA="Erreur de configuration"
  titleB="Risque"
  rows={[
    { a: "Panneau d'administration expose publiquement", b: "Acces direct si les identifiants par defaut n'ont pas ete changes" },
    { a: "Listing de repertoire active", b: "Revele l'arborescence complete du site, y compris des fichiers sensibles non destines au public" },
    { a: "En-tetes de securite absents", b: "Absence de Content-Security-Policy, X-Frame-Options, HSTS : facilite clickjacking et interception" },
    { a: "Mode debug actif en production", b: "Une console de debogage interactive peut permettre l'execution de code arbitraire" },
  ]}
/>

<WarningCallout>
Un mode debug activé en production est l'une des découvertes les plus critiques d'un audit de configuration : certaines consoles de débogage interactives permettent l'exécution de code arbitraire sur le serveur. La règle est simple : les fonctionnalités de développement (debug, traces complètes, comptes de test) ne doivent jamais exister en production.
</WarningCallout>

Le durcissement consiste à désactiver le debug, interdire le listing de répertoire, retirer les interfaces d'administration d'Internet, changer tous les identifiants par défaut, et déployer les en-têtes de sécurité (CSP, HSTS, X-Content-Type-Options, X-Frame-Options ou directive `frame-ancestors`).

## Composants vulnérables : évaluer et prioriser les CVE

Une application peut être parfaitement codée mais reposer sur une bibliothèque, un framework ou un CMS obsolète contenant une vulnérabilité publiquement connue, identifiée par un numéro **CVE**. L'enjeu défensif est double : savoir qu'un composant est concerné, et décider lesquels corriger en priorité.

<Steps steps={[
  { title: "Identifier le composant et sa version", description: "Determiner precisement la version deployee (inventaire, SBOM, en-tetes) : une CVE concerne des plages de versions precises." },
  { title: "Rechercher les CVE associées", description: "Consulter la base NVD (nvd.nist.gov) pour les vulnerabilites publiees ; des outils comme searchsploit aident a savoir si une version donnee est connue comme vulnerable." },
  { title: "Évaluer la gravité (CVSS 4.0)", description: "Le CVSS 4.0 (publie fin 2023) attribue un score de gravite selon des criteres objectifs : vecteur, complexite, privileges, impact." },
  { title: "Prioriser avec EPSS et CISA KEV", description: "L'EPSS estime la probabilite d'exploitation a court terme ; le catalogue CISA KEV liste les vulnerabilites activement exploitees : les deux affinent la priorisation au-dela du seul CVSS." },
  { title: "Appliquer le correctif", description: "Mettre a jour vers une version corrigee, ou appliquer une mesure d'attenuation temporaire si la mise a jour n'est pas immediate." },
]} />

<AuditCallout>
La gestion des correctifs (patch management) est l'une des mesures les plus rentables en cybersécurité : la majorité des compromissions via composants vulnérables exploitent des CVE publiées depuis des mois, pas des zero-days. Combiner CVSS 4.0 (gravité), EPSS (probabilité d'exploitation) et le catalogue CISA KEV (exploitation avérée) permet de corriger d'abord ce qui compte vraiment. La gestion des vulnérabilités techniques est un contrôle explicite de l'ISO/IEC 27001:2022 (annexe A) et une fonction du NIST CSF 2.0.
</AuditCallout>

## Angle offensif et défensif

<AttackDefenseTable rows={[
  { phase: "SSRF", attack: "Manipuler une URL pour viser des ressources internes ou les metadonnees cloud", defense: "Valider les destinations (liste d'autorisation), bloquer les adresses internes, exiger un jeton de metadonnees" },
  { phase: "Misconfiguration", attack: "Exploiter debug, listing ou identifiants par defaut", defense: "Durcir la configuration, desactiver le debug, deployer les en-tetes de securite" },
  { phase: "Composants vulnerables", attack: "Exploiter une CVE connue sur une version obsolete", defense: "Inventaire (SBOM), veille CVE, priorisation CVSS/EPSS/KEV, correctifs rapides" },
]} />

## Erreurs fréquentes

Le débutant côté défense traite toutes les CVE avec la même urgence, se noie et finit par ne rien corriger ; la priorisation par EPSS et KEV résout précisément ce problème. Il laisse le mode debug actif « le temps de la mise en production », qui devient permanent. Il oublie que le SSRF tire sa gravité de la position réseau du serveur, et ne pense pas à protéger le service de métadonnées cloud. Enfin, il considère qu'une application bien codée est à l'abri, en ignorant que ses dépendances portent l'essentiel du risque.

## Lab — Mise en pratique

**Environnement** : Kali Linux (terminal Nyx Shell) (observation, durcissement et vérification)

<Steps steps={[
  { title: "Auditer les en-têtes de sécurité", description: "Verifie la presence des en-tetes de securite HTTP standards sur la cible de lab.", code: "curl -I http://10.10.0.10" },
  { title: "Repérer une fonctionnalité d'import d'URL", description: "Identifie une fonctionnalite qui recupere une ressource a partir d'une URL fournie, et analyse si la destination est validee." },
  { title: "Identifier la version d'un composant", description: "Determine la version exacte d'un composant deploye en vue d'une recherche de CVE.", code: "whatweb -v http://10.10.0.10" },
  { title: "Évaluer une CVE", description: "Pour la version identifiee, recherche une CVE associee et note son score CVSS, sa valeur EPSS et sa presence eventuelle au catalogue CISA KEV." },
  { title: "Durcir la configuration", description: "Desactive le mode debug et le listing de repertoire, et ajoute les en-tetes de securite manquants (CSP, HSTS, frame-ancestors)." },
  { title: "Restreindre les destinations de requête", description: "Mets en place une liste d'autorisation des hotes pour la fonctionnalite d'import et bloque les adresses internes et de metadonnees." },
  { title: "Vérifier les corrections", description: "Reprends l'audit des en-tetes et confirme que debug, listing et destinations non autorisees sont desormais neutralises." },
]} />

## À retenir

- Le SSRF manipule le serveur pour qu'il émette des requêtes vers des ressources internes ou les métadonnées cloud (`169.254.169.254`, identifiants IAM).
- La défense SSRF repose sur la validation stricte des destinations et le durcissement du service de métadonnées cloud.
- Les mauvaises configurations (debug, listing, identifiants par défaut, en-têtes absents) sont des découvertes d'audit fréquentes et évitables.
- Une application bien codée reste vulnérable via un composant obsolète portant une CVE.
- CVSS 4.0, EPSS et le catalogue CISA KEV permettent de prioriser les correctifs selon gravité, probabilité d'exploitation et exploitation avérée.
- Le patch management rapide est l'une des mesures les plus rentables, car la plupart des attaques exploitent des CVE anciennes.

## Questions de révision

1. Pourquoi un SSRF tire-t-il sa gravité de la position réseau du serveur plutôt que de la requête elle-même ?
2. Pourquoi l'adresse `169.254.169.254` est-elle une cible privilégiée en SSRF sur une infrastructure cloud ?
3. Cite deux erreurs de configuration de sécurité courantes et leur correction.
4. Pourquoi un mode debug actif en production est-il particulièrement critique ?
5. À quoi servent respectivement le CVSS 4.0, l'EPSS et le catalogue CISA KEV pour prioriser les correctifs ?
6. Pourquoi une application au code impeccable peut-elle néanmoins être compromise ?
7. Pourquoi le patch management est-il présenté comme l'une des mesures les plus rentables en cybersécurité ?
