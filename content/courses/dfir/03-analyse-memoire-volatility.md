---
title: Analyse de la mémoire vive avec Volatility
chapter: 3
course: dfir
difficulty: intermediate
duration: 40
tags: [dfir, memoire, volatility, ram]
ceh_modules: ["Module 7 - Malware Threats"]
objectives:
  - Comprendre pourquoi l'analyse mémoire est indispensable en DFIR moderne
  - Utiliser Volatility pour extraire processus, connexions réseau et injections
  - Identifier des indicateurs de compromission en mémoire
---

## Introduction

Une part croissante des attaques modernes (malware "fileless", techniques d'injection de processus, outils vivant exclusivement en mémoire) ne laisse quasiment aucune trace sur le disque — l'analyse de la mémoire vive (RAM) est devenue une étape aussi indispensable que l'analyse disque traditionnelle, parfois plus révélatrice.

## Pourquoi la mémoire révèle ce que le disque ne montre pas

<CehCallout>
Un malware "fileless" s'exécute entièrement en mémoire, souvent injecté dans un processus légitime (PowerShell, explorer.exe), sans jamais écrire de fichier exécutable sur le disque — une analyse disque seule ne trouvera absolument rien, alors qu'un dump mémoire révèle immédiatement le processus injecté et son code malveillant.
</CehCallout>

<CompareTable
  titleA="Analyse disque seule"
  titleB="Analyse mémoire complémentaire"
  rows={[
    { a: "Trouve les fichiers malveillants persistés", b: "Trouve les processus injectés, connexions réseau actives, clés de chiffrement en mémoire" },
    { a: "Ne révèle rien d'un malware fileless", b: "Révèle l'exécution même si aucun fichier n'a été écrit" },
    { a: "Analyse un état figé après extinction", b: "Capture l'état du système AU MOMENT de l'incident" },
]}
/>

## Volatility — l'outil de référence

<Steps steps={[
  { title: "Acquérir le dump mémoire", description: "Réalisé en priorité absolue selon l'ordre de volatilité (chapitre 1), avant toute autre collecte." },
  { title: "Identifier le profil du système", description: "Volatility doit connaître la version exacte de l'OS pour interpréter correctement les structures mémoire." },
  { title: "Lister les processus actifs", description: "Un plugin dédié révèle tous les processus en cours d'exécution au moment du dump, y compris ceux masqués aux outils normaux du système compromis." },
  { title: "Examiner les connexions réseau", description: "Connexions actives et passées, révélant une éventuelle communication avec un serveur de commande et contrôle (C2)." },
  { title: "Détecter les injections de code", description: "Rechercher des processus légitimes contenant du code injecté par un attaquant." },
]} />

```bash
# Exemples de commandes Volatility 3 (syntaxe simplifiée)
vol -f dump_memoire.raw windows.pslist          # Liste des processus
vol -f dump_memoire.raw windows.netscan         # Connexions réseau
vol -f dump_memoire.raw windows.malfind         # Recherche d'injections de code
vol -f dump_memoire.raw windows.cmdline         # Lignes de commande des processus
```

<TipCallout>
Le plugin `pslist` énumère les processus via les structures normales du noyau — un rootkit sophistiqué peut les masquer à ce niveau. Le plugin `psscan`, qui parcourt la mémoire physique brute à la recherche de structures de processus, révèle parfois des processus cachés que `pslist` ne montre pas.
</TipCallout>

## Interpréter les résultats — quelques indicateurs classiques

<CompareTable
  titleA="Indicateur en mémoire"
  titleB="Ce qu'il suggère"
  rows={[
    { a: "Processus enfant inattendu (ex: winword.exe lançant powershell.exe)", b: "Exécution de macro malveillante ou exploitation de document" },
    { a: "Connexion réseau vers une IP/port inhabituel", b: "Communication potentielle avec un serveur de commande et contrôle" },
    { a: "Code exécutable dans une zone mémoire normalement non exécutable", b: "Injection de processus ou technique d'évasion (malfind)" },
    { a: "Ligne de commande encodée en Base64", b: "Technique classique d'obfuscation PowerShell utilisée par de nombreux malwares" },
]}
/>

<WarningCallout>
Un processus enfant inattendu (par exemple un lecteur PDF lançant un interpréteur de commandes) n'est presque jamais un comportement légitime — c'est l'un des signaux les plus fiables et les plus simples à repérer dans une analyse mémoire, avant même de plonger dans une analyse de code plus poussée.
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Identifier un signal suspect", description: "Un dump mémoire révèle que le processus 'outlook.exe' a lancé 'powershell.exe -enc <base64>'. Explique pourquoi ce comportement mérite une investigation immédiate." },
  { title: "Choisir le bon plugin", description: "Tu veux vérifier si un malware communique actuellement avec un serveur externe. Quel type de plugin Volatility utiliserais-tu, et pourquoi cette information ne serait-elle pas visible sur une simple analyse disque ?" },
]} />

## En résumé

- L'analyse mémoire révèle des malwares fileless et des injections de processus totalement invisibles sur le disque.
- Volatility permet d'extraire processus, connexions réseau, lignes de commande et injections de code depuis un dump mémoire.
- Des processus enfants inattendus et des lignes de commande encodées comptent parmi les indicateurs de compromission les plus fiables en mémoire.

## Questions de Révision

1. Pourquoi un malware fileless échappe-t-il totalement à une analyse disque traditionnelle ?
2. Que révèle le plugin `malfind` de Volatility que `pslist` ne révèle pas ?
3. Pourquoi un processus enfant inattendu (ex: un lecteur de document lançant un interpréteur de commandes) est-il un indicateur de compromission fiable ?
