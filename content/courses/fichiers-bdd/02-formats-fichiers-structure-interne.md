---
title: Formats de fichiers courants et leur structure interne
chapter: 2
course: fichiers-bdd
difficulty: beginner
duration: 30
tags: [formats-fichiers, magic-bytes, forensics]
ceh_modules: ["Module 7 - Malware Threats"]
objectives:
  - Comprendre la notion de signature de fichier (magic bytes)
  - Distinguer formats texte et formats binaires
  - Comprendre pourquoi l'extension seule ne garantit jamais le vrai type d'un fichier
---

## Introduction

Au-delà du système de fichiers qui les organise, chaque fichier possède une structure interne propre à son format — une connaissance directement utile en sécurité, du file carving forensique (cours Forensics & DFIR, chapitre 4) à la détection de fichiers malveillants déguisés.

## La signature de fichier (magic bytes)

<CehCallout>
Rappel du cours Forensics & DFIR (chapitre 4, file carving) : la plupart des formats de fichiers commencent par une séquence d'octets caractéristique (magic bytes) — par exemple, un fichier PNG commence toujours par les octets 89 50 4E 47, indépendamment de son extension. C'est cette signature, pas l'extension, qui permet d'identifier fiablement le vrai type d'un fichier.
</CehCallout>

```bash
# Identifier le vrai type d'un fichier via sa signature, indépendamment de son extension
file document_suspect.pdf
xxd -l 16 image.png   # affiche les premiers octets en hexadécimal
```

<WarningCallout>
Renommer un fichier exécutable malveillant avec une extension .jpg ne change en rien sa signature binaire réelle ni son comportement à l'exécution — un utilisateur qui se fie uniquement à l'extension affichée (parfois masquée par défaut sur certains systèmes) peut être trompé, une technique classique combinée au phishing (cours Psychologie & Ingénierie Sociale, chapitre 3).
</WarningCallout>

## Formats texte vs formats binaires

<CompareTable
  titleA="Format texte"
  titleB="Format binaire"
  rows={[
    { a: "Lisible directement par un humain (CSV, JSON, XML, code source)", b: "Nécessite un décodage spécifique pour être interprété (images, exécutables, bases de données compilées)" },
    { a: "Facilement modifiable avec un simple éditeur de texte", b: "Modification nécessitant généralement un outil dédié" },
    { a: "Plus volumineux à taille d'information égale", b: "Plus compact, optimisé pour l'espace et la vitesse de traitement" },
]}
/>

<TipCallout>
Rappel du cours Python pour la Data Science (chapitre 3) : Pandas peut directement charger des formats texte structurés comme le CSV ou le JSON, tandis que des formats binaires spécialisés (comme Parquet) offrent de meilleures performances pour de très grands volumes de données, au prix d'une lisibilité humaine directe perdue.
</TipCallout>

## Quelques structures de formats courants

<Steps steps={[
  { title: "CSV — la simplicité du texte tabulaire", description: "Valeurs séparées par des virgules, une ligne par enregistrement — simple mais fragile face aux valeurs contenant elles-mêmes des virgules ou des retours à la ligne." },
  { title: "JSON — structuré et hiérarchique", description: "Représente des structures de données imbriquées (objets, tableaux), largement utilisé pour les échanges entre applications et API." },
  { title: "PDF — un format binaire complexe", description: "Combine texte, images et mise en page dans une structure interne complexe, historiquement source de nombreuses vulnérabilités d'analyseurs PDF." },
]} />

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell)

<Steps steps={[
  { title: "Identifier un fichier par sa signature", description: "Renomme un fichier PNG en .txt, puis vérifie que sa signature réelle reste inchangée.", code: 'cp image.png fichier_suspect.txt\nfile fichier_suspect.txt\nxxd -l 8 fichier_suspect.txt' },
  { title: "Expliquer un risque de sécurité", description: "Pourquoi un antivirus basé uniquement sur l'extension d'un fichier serait-il facilement contournable ?" },
]} />

## En résumé

- La signature de fichier (magic bytes) identifie fiablement le vrai type d'un fichier, indépendamment de son extension affichée.
- Les formats texte sont lisibles directement mais plus volumineux ; les formats binaires sont compacts mais nécessitent un décodage spécifique.
- Se fier uniquement à l'extension d'un fichier, sans vérifier sa signature réelle, est une pratique de sécurité fragile et facilement contournable.

## Questions de Révision

1. Qu'est-ce qu'une signature de fichier (magic bytes), et pourquoi est-elle plus fiable que l'extension ?
2. Quelle est la principale différence entre un format texte et un format binaire ?
3. Pourquoi un antivirus qui se fie uniquement à l'extension d'un fichier est-il facilement contournable ?
