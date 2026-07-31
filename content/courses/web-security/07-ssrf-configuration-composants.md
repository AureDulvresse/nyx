---
title: SSRF, mauvaises configurations et composants vulnérables
chapter: 7
course: web-security
difficulty: intermediate
duration: 45
tags: [web, ssrf, misconfiguration, cve]
ceh_modules: ["Module 14 - Hacking Web Applications"]
objectives:
  - Comprendre le mécanisme d'une attaque SSRF (Server-Side Request Forgery)
  - Identifier les erreurs de configuration de sécurité les plus courantes
  - Rechercher les vulnérabilités connues (CVE) d'un composant identifié
---

## Introduction

Ce chapitre regroupe trois catégories de l'OWASP Top 10 qui partagent un point commun : elles n'exploitent pas un bug de code applicatif, mais un défaut de conception ou de configuration de l'infrastructure autour de l'application.

## SSRF : forcer le serveur à effectuer une requête pour toi

Le Server-Side Request Forgery pousse le serveur cible à effectuer une requête HTTP vers une destination choisie par l'attaquant — souvent vers des ressources internes normalement inaccessibles depuis Internet.

```text
Fonctionnalité légitime : l'application récupère une image depuis une URL fournie
POST /import-image
url=https://exemple.com/photo.jpg

Exploitation SSRF : rediriger la requête vers le réseau interne
url=http://169.254.169.254/latest/meta-data/iam/security-credentials/
→ Sur une infrastructure cloud (AWS), cette adresse expose les métadonnées de l'instance,
  potentiellement des identifiants IAM temporaires.
```

<CehCallout>
L'exploitation de l'endpoint de métadonnées cloud (`169.254.169.254`) via SSRF a été le vecteur central de plusieurs incidents majeurs documentés publiquement — c'est aujourd'hui l'un des scénarios SSRF les plus recherchés en bug bounty sur des applications hébergées en cloud.
</CehCallout>

```bash
# Tester une SSRF basique vers un service interne
curl -X POST http://10.10.0.10/import-image -d "url=http://127.0.0.1:22"
# Une différence de temps de réponse ou de message d'erreur peut révéler un port ouvert en interne
```

## Security Misconfiguration : les erreurs de configuration classiques

<CompareTable
  titleA="Erreur de configuration"
  titleB="Risque"
  rows={[
    { a: "Panneau d'administration exposé publiquement", b: "Accès direct si les identifiants par défaut n'ont pas été changés" },
    { a: "Listing de répertoire activé", b: "Révèle l'arborescence complète du site, y compris fichiers sensibles" },
    { a: "En-têtes de sécurité absents", b: "Absence de X-Frame-Options, CSP, HSTS — facilite clickjacking et MITM" },
    { a: "Services de développement/debug actifs en production", b: "Consoles de debug (ex: Werkzeug, Django DEBUG=True) exposant du code exécutable" },
  ]}
/>

```bash
# Vérifier les en-têtes de sécurité présents sur une cible
curl -I https://10.10.0.10 | grep -i "x-frame\|content-security\|strict-transport"

# Repérer un listing de répertoire actif
curl -s http://10.10.0.10/uploads/ | grep -i "index of"
```

<WarningCallout>
Un mode debug activé en production (ex: `DEBUG=True` en Django/Flask) peut permettre l'exécution de code arbitraire directement via la console de débogage interactive intégrée — une des découvertes les plus critiques possibles lors d'un audit de configuration.
</WarningCallout>

## Composants vulnérables : rechercher les CVE

Une application peut être parfaitement codée mais reposer sur une librairie ou un CMS obsolète contenant une vulnérabilité publiquement connue.

<Steps steps={[
  { title: "Identifier le composant et sa version exacte", description: "Utilise whatweb, les en-têtes HTTP, ou l'inspection du code source pour déterminer précisément la version d'un CMS/framework." },
  { title: "Rechercher les CVE associées", description: "Consulte la base NVD (nvd.nist.gov) ou searchsploit pour trouver des vulnérabilités publiées pour cette version exacte." },
  { title: "Vérifier l'existence d'un exploit public", description: "Si un exploit Metasploit ou un script public existe, teste-le uniquement dans le cadre de ton autorisation de test." },
]} />

```bash
# Rechercher des exploits connus pour un composant/version dans la base locale Kali
searchsploit wordpress 6.2

# Recherche plus large en ligne (nécessite une connexion)
searchsploit --nmap resultat_scan.xml
```

<AuditCallout>
La gestion des correctifs (patch management) — appliquer rapidement les mises à jour de sécurité connues — reste l'une des mesures les plus rentables en cybersécurité : la majorité des compromissions via composants vulnérables exploitent des CVE publiées depuis des mois, pas des zero-days.
</AuditCallout>

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell)

<Steps steps={[
  { title: "Auditer les en-têtes de sécurité", description: "Vérifie la présence des en-têtes de sécurité HTTP standards sur la cible.", code: "curl -I http://10.10.0.10" },
  { title: "Identifier la version exacte d'un composant", description: "Utilise whatweb pour préciser la version du CMS/framework détecté.", code: "whatweb -v http://10.10.0.10" },
  { title: "Rechercher un exploit connu", description: "Cherche dans la base locale d'exploits si la version identifiée est vulnérable.", code: "searchsploit <nom_du_composant> <version>" },
]} />

## En résumé

- Le SSRF force le serveur à effectuer une requête vers une destination choisie par l'attaquant, souvent vers des ressources internes ou des métadonnées cloud sensibles.
- Les erreurs de configuration (panneaux exposés, listing de répertoire, en-têtes absents) restent parmi les découvertes d'audit les plus fréquentes.
- Une application bien codée reste vulnérable si elle repose sur un composant obsolète avec une CVE publiée.
- Le patch management rapide neutralise la majorité des risques liés aux composants vulnérables.

## Questions de Révision

1. Pourquoi l'adresse 169.254.169.254 est-elle une cible privilégiée en SSRF sur une infrastructure cloud ?
2. Cite deux erreurs de configuration de sécurité courantes.
3. Que recherche-t-on avec `searchsploit` ?
