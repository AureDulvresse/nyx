---
title: Reconnaissance web — cartographier une application
chapter: 2
course: web-security
difficulty: beginner
duration: 40
tags: [web, reconnaissance, gobuster, burp]
ceh_modules: ["Module 14 - Hacking Web Applications"]
objectives:
  - Cartographier la structure d'une application web (pages, endpoints, paramètres)
  - Utiliser Burp Suite pour intercepter et analyser le trafic HTTP
  - Identifier les technologies et versions utilisées par une cible
---

## Introduction

Avant d'exploiter la moindre vulnérabilité, il faut cartographier l'application : quelles pages existent, quels paramètres acceptent une entrée utilisateur, quelles technologies sont utilisées. Cette phase de reconnaissance web détermine directement la qualité de tout ce qui suivra dans ce cours.

## Découverte de contenu avec Gobuster

```bash
# Découverte de répertoires et fichiers
gobuster dir -u http://10.10.0.10 -w /usr/share/wordlists/dirb/common.txt -x php,txt,bak

# Découverte de sous-domaines
gobuster dns -d example.com -w /usr/share/wordlists/subdomains.txt

# Découverte de paramètres d'une page (utile pour trouver des paramètres cachés)
gobuster fuzz -u "http://10.10.0.10/page.php?FUZZ=test" -w params.txt
```

<CompareTable
  titleA="Option gobuster"
  titleB="Effet"
  rows={[
    { a: "-u", b: "URL cible" },
    { a: "-w", b: "Wordlist utilisée pour le brute-force" },
    { a: "-x", b: "Extensions de fichiers à tester (php, txt, bak...)" },
    { a: "-t", b: "Nombre de threads (accélère le scan, mais plus détectable)" },
  ]}
/>

<TipCallout>
Les fichiers de sauvegarde oubliés (`.bak`, `.old`, `~`) contiennent parfois le code source complet d'une page, y compris des identifiants de connexion à une base de données codés en dur — toujours inclure ces extensions dans une découverte de contenu.
</TipCallout>

## Burp Suite : intercepter et rejouer des requêtes

Burp Suite (édition Community incluse dans Kali) place un proxy entre ton navigateur et la cible, te permettant de voir et modifier chaque requête avant son envoi.

<Steps steps={[
  { title: "Configurer le proxy du navigateur", description: "Pointe le proxy HTTP/HTTPS du navigateur vers 127.0.0.1:8080 (proxy Burp par défaut)." },
  { title: "Intercepter une requête", description: "Active 'Intercept is on' dans l'onglet Proxy, puis navigue sur la cible — chaque requête s'affiche avant envoi." },
  { title: "Envoyer une requête vers Repeater", description: "Clic droit sur une requête interceptée → 'Send to Repeater' pour la modifier et la rejouer à volonté." },
]} />

<CehCallout>
Burp Repeater est l'outil que tu utiliseras le plus souvent dans ce cours : modifier un paramètre, renvoyer la requête, observer la réponse — c'est le cycle de base de tout test d'injection ou de contrôle d'accès.
</CehCallout>

## Identifier la stack technique

<CompareTable
  titleA="Indice"
  titleB="Ce qu'il révèle"
  rows={[
    { a: "En-tête Server / X-Powered-By", b: "Serveur web et langage backend (Apache/PHP, nginx/Node...)" },
    { a: "Extension de fichier (.php, .aspx, .jsp)", b: "Langage de programmation utilisé" },
    { a: "Cookies (PHPSESSID, JSESSIONID, ASP.NET_SessionId)", b: "Technologie de session, donc souvent le framework" },
    { a: "Messages d'erreur détaillés", b: "Version exacte du framework/librairie, parfois la requête SQL brute" },
  ]}
/>

```bash
# Outil dédié à l'identification de technologies web
whatweb http://10.10.0.10

# Identifier le CMS utilisé (si applicable)
wpscan --url http://10.10.0.10 --enumerate p
```

<WarningCallout>
Un message d'erreur détaillé affichant une trace complète (stack trace) en production est une fuite d'information classique — elle révèle souvent la version exacte du framework, facilitant la recherche d'exploits publics connus (CVE).
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell)

<Steps steps={[
  { title: "Cartographier les répertoires accessibles", description: "Lance une découverte de contenu complète sur la cible.", code: "gobuster dir -u http://10.10.0.10 -w /usr/share/wordlists/dirb/common.txt -x php,txt,bak,zip" },
  { title: "Identifier la stack technique", description: "Utilise whatweb pour identifier serveur et technologies.", code: "whatweb -v http://10.10.0.10" },
  { title: "Documenter la cartographie", description: "Liste chaque page/endpoint découvert avec son objectif apparent, en vue des chapitres suivants sur l'exploitation." },
]} />

## En résumé

- La reconnaissance web cartographie pages, paramètres et technologies avant toute tentative d'exploitation.
- Gobuster découvre répertoires, fichiers et sous-domaines par brute-force de wordlist.
- Burp Suite (Proxy + Repeater) est l'outil central pour intercepter, modifier et rejouer des requêtes HTTP.
- Les en-têtes, cookies et messages d'erreur révèlent souvent la stack technique exacte d'une cible.

## Questions de Révision

1. À quoi sert l'option `-x` de gobuster ?
2. Que permet de faire l'onglet "Repeater" de Burp Suite ?
3. Pourquoi un message d'erreur détaillé en production est-il un risque de sécurité ?
