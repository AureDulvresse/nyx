---
title: Authentification et gestion de sessions
chapter: 5
course: web-security
difficulty: intermediate
duration: 45
tags: [web, authentification, hydra, jwt]
ceh_modules: ["Module 14 - Hacking Web Applications"]
objectives:
  - Identifier les failles courantes d'authentification web
  - Automatiser une attaque par bruteforce avec Hydra
  - Comprendre le fonctionnement et les faiblesses des tokens JWT
---

## Introduction

L'authentification et la gestion de session sont le pilier de tout contrôle d'accès web — un défaut ici compromet potentiellement l'intégralité de l'application, quelle que soit la qualité du reste du code. Ce chapitre couvre les failles d'authentification les plus fréquentes et les techniques pour les identifier.

## Failles d'authentification courantes

<CompareTable
  titleA="Faille"
  titleB="Impact"
  rows={[
    { a: "Absence de limitation de tentatives", b: "Permet un bruteforce ou une attaque par dictionnaire sans blocage" },
    { a: "Messages d'erreur différenciés", b: "\"Utilisateur inconnu\" vs \"mot de passe incorrect\" permet d'énumérer les comptes valides" },
    { a: "Identifiants transmis en GET", b: "Visibles dans les logs serveur, l'historique navigateur et les en-têtes Referer" },
    { a: "Session ID prévisible", b: "Un identifiant de session séquentiel ou faiblement aléatoire peut être deviné" },
  ]}
/>

<CehCallout>
L'énumération de comptes via des messages d'erreur différenciés est un classique de reconnaissance passive : même sans casser un seul mot de passe, un attaquant peut déjà constituer une liste de comptes valides à cibler ensuite.
</CehCallout>

## Bruteforce automatisé avec Hydra

Hydra automatise les attaques par dictionnaire contre de nombreux protocoles et formulaires web.

```bash
# Bruteforce SSH
hydra -l admin -P /usr/share/wordlists/rockyou.txt ssh://10.10.0.10

# Bruteforce d'un formulaire web (POST)
hydra -l admin -P /usr/share/wordlists/rockyou.txt 10.10.0.10 http-post-form \
  "/login.php:username=^USER^&password=^PASS^:Invalid credentials"

# Bruteforce FTP
hydra -L users.txt -P passwords.txt ftp://10.10.0.10
```

<TipCallout>
La chaîne après `http-post-form` suit une syntaxe précise : `chemin:paramètres_avec_marqueurs:condition_d_échec`. Identifier le bon message d'échec (visible en tentant une connexion invalide manuellement) est indispensable pour que Hydra distingue les tentatives réussies des échecs.
</TipCallout>

## JWT (JSON Web Tokens) : structure et faiblesses

De nombreuses applications modernes remplacent les sessions côté serveur par des tokens JWT, auto-suffisants et signés.

```text
Structure d'un JWT (3 parties séparées par des points) :
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4ifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
└──── Header (algo) ────┘└──── Payload (données) ────┘└──── Signature ────┘
```

<CompareTable
  titleA="Faille JWT classique"
  titleB="Principe de l'attaque"
  rows={[
    { a: "Algorithme 'none' accepté", b: "Modifier le header pour indiquer alg:none et supprimer la signature — certaines implémentations l'acceptent" },
    { a: "Clé secrète faible", b: "Une signature HS256 avec un secret faible/deviné permet de forger n'importe quel token" },
    { a: "Confusion d'algorithme (RS256 vers HS256)", b: "Utiliser la clé publique RSA connue comme secret HMAC pour forger une signature valide" },
  ]}
/>

<WarningCallout>
Un JWT n'est PAS chiffré par défaut, seulement signé — son contenu (payload) est lisible par quiconque l'intercepte, simplement en le décodant en Base64. Ne jamais y stocker d'information sensible en clair (mot de passe, données personnelles).
</WarningCallout>

## Contre-mesures

<AttackDefenseTable rows={[
  { phase: "Bruteforce", attack: "Tentatives de connexion illimitées", defense: "Limitation de débit (rate limiting), verrouillage temporaire de compte, CAPTCHA" },
  { phase: "Énumération", attack: "Messages d'erreur différenciés", defense: "Message d'erreur générique unique (\"identifiants invalides\") quel que soit le cas" },
  { phase: "JWT", attack: "Algorithme none / confusion d'algorithme", defense: "Valider explicitement l'algorithme attendu côté serveur, jamais le faire dépendre du header du token" },
]} />

<AuditCallout>
La mise en place d'une authentification multifacteur (MFA) reste la mesure la plus efficace contre l'ensemble de ces failles combinées : même un mot de passe compromis par bruteforce ne suffit alors plus à accéder au compte.
</AuditCallout>

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell)

<Steps steps={[
  { title: "Identifier le message d'échec de connexion", description: "Tente une connexion avec des identifiants invalides et note le message exact renvoyé." },
  { title: "Lancer un bruteforce ciblé", description: "Utilise Hydra contre le formulaire de connexion identifié.", code: "hydra -l admin -P /usr/share/wordlists/rockyou.txt 10.10.0.10 http-post-form \"/login.php:username=^USER^&password=^PASS^:Invalid credentials\"" },
  { title: "Décoder un JWT capturé", description: "Décode manuellement les deux premières parties d'un JWT (header et payload) en Base64.", code: "echo 'eyJhbGciOiJIUzI1NiJ9' | base64 -d" },
]} />

## En résumé

- Les messages d'erreur différenciés et l'absence de limitation de tentatives sont les failles d'authentification les plus fréquentes.
- Hydra automatise le bruteforce contre SSH, FTP et formulaires web (http-post-form).
- Un JWT est signé mais pas chiffré par défaut — son payload est toujours lisible en Base64.
- Le MFA reste la contre-mesure la plus efficace contre l'ensemble des failles d'authentification.

## Questions de Révision

1. Pourquoi des messages d'erreur différenciés ("utilisateur inconnu" vs "mot de passe incorrect") sont-ils une faille de sécurité ?
2. Que signifie la faille "algorithme none" sur un JWT ?
3. Un JWT est-il chiffré ? Justifie ta réponse.
