---
title: Sauvegarde et intégrité des données
chapter: 7
course: fichiers-bdd
difficulty: intermediate
duration: 30
tags: [sauvegarde, integrite, synthese]
ceh_modules: ["Module 14 - Hacking Web Applications"]
objectives:
  - Réutiliser en synthèse la stratégie de sauvegarde déjà vue
  - Comprendre les mécanismes de garantie d'intégrité d'une base de données
  - Construire une synthèse complète du cours
---

## Introduction

Ce dernier chapitre referme le cours en reliant la sauvegarde et l'intégrité des données — deux préoccupations déjà abordées séparément aux cours Administration Systèmes et Réseaux et Cryptographie Avancée — spécifiquement au contexte des fichiers et bases de données étudiés dans ce cours.

## Sauvegarder une base de données — spécificités par rapport aux fichiers simples

<CehCallout>
Rappel du cours Administration Systèmes et Réseaux (chapitre 5) : la règle 3-2-1 s'applique aussi aux bases de données, mais avec une contrainte supplémentaire — une base de données active reçoit des écritures en continu, rendant une simple copie de fichier à un instant donné potentiellement incohérente si des transactions sont en cours.
</CehCallout>

<CompareTable
  titleA="Sauvegarde à froid"
  titleB="Sauvegarde à chaud"
  rows={[
    { a: "La base est arrêtée pendant la sauvegarde", b: "La base reste disponible pendant la sauvegarde" },
    { a: "Garantit une cohérence totale, simple à mettre en œuvre", b: "Nécessite un mécanisme spécifique pour garantir la cohérence malgré les écritures en cours" },
    { a: "Implique une interruption de service", b: "N'interrompt pas le service, adapté aux systèmes à haute disponibilité" },
]}
/>

## Les transactions et la garantie ACID

<Steps steps={[
  { title: "Atomicité", description: "Une transaction s'exécute entièrement, ou pas du tout — jamais partiellement en cas d'échec en cours de route." },
  { title: "Cohérence", description: "Une transaction amène la base d'un état valide à un autre état valide, sans jamais violer les contraintes définies." },
  { title: "Isolation", description: "Des transactions concurrentes ne s'interfèrent pas de façon incohérente entre elles." },
  { title: "Durabilité", description: "Une fois une transaction validée, elle survit même à une panne immédiatement après (rappel du concept de sauvegarde immuable, cours Administration Systèmes et Réseaux, chapitre 5)." },
]} />

<CehCallout>
Ces garanties ACID expliquent pourquoi une base de données relationnelle reste préférée pour des données critiques (transactions financières, dossiers médicaux) là où certaines bases NoSQL (chapitre 4) acceptent délibérément de sacrifier une part de ces garanties au profit de la performance ou de la disponibilité (compromis CAP).
</CehCallout>

## Vérifier l'intégrité des données dans le temps

<WarningCallout>
Rappel du cours Cryptographie Avancée (chapitre 4, hachage) : calculer une empreinte hash d'une sauvegarde de base de données au moment de sa création, puis la revérifier avant toute restauration, permet de détecter une corruption ou une altération survenue entre-temps — un principe identique à la chaîne de custody vue au cours Forensics & DFIR et au cours Droit et Réglementation.
</WarningCallout>

## Synthèse — panorama complet du cours

<CompareTable
  titleA="Chapitre"
  titleB="Contribution au panorama"
  rows={[
    { a: "1. Systèmes de fichiers", b: "Organisation et métadonnées du stockage" },
    { a: "2. Formats de fichiers", b: "Structure interne et signatures" },
    { a: "3. Bases relationnelles", b: "Modèle et syntaxe SQL de base" },
    { a: "4. Bases NoSQL", b: "Alternatives flexibles et leurs enjeux" },
    { a: "5. Sécurité des bases", b: "Durcissement et moindre privilège" },
    { a: "6. Injection SQL approfondie", b: "Application offensive du socle SQL" },
    { a: "7. Sauvegarde et intégrité", b: "Résilience et garanties de fiabilité" },
]}
/>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Choisir un type de sauvegarde", description: "Pour une base de données de commerce en ligne qui ne peut jamais être interrompue en journée, sauvegarde à froid ou à chaud est-elle nécessaire ? Justifie." },
  { title: "Relier ACID à un cas concret", description: "Pourquoi la garantie d'atomicité est-elle cruciale pour une transaction bancaire impliquant un débit et un crédit simultanés sur deux comptes différents ?" },
]} />

## En résumé

- La sauvegarde à chaud garantit la disponibilité continue du service, au prix d'une complexité de cohérence supplémentaire par rapport à la sauvegarde à froid.
- Les garanties ACID (atomicité, cohérence, isolation, durabilité) expliquent pourquoi le relationnel reste préféré pour des données critiques.
- Vérifier l'intégrité d'une sauvegarde par hachage, avant restauration, applique à la base de données un principe déjà rencontré en cryptographie et en forensique.

## Questions de Révision

1. Pourquoi une simple copie de fichier d'une base de données active peut-elle être incohérente ?
2. Que garantit l'atomicité d'une transaction, et pourquoi est-ce crucial pour une opération bancaire ?
3. Pourquoi vérifier le hash d'une sauvegarde avant restauration est-il une bonne pratique ?

Félicitations, tu viens de terminer le cours **Fichiers et Bases de Données** ! Ces fondations éclairent directement les cours Sécurité Web (injection SQL), Forensics & DFIR (systèmes de fichiers) et Administration Systèmes et Réseaux (sauvegarde) — continue vers **Machine Learning** pour approfondir les algorithmes déjà rencontrés au cours Data Science Complète.
