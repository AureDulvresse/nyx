---
title: Fonctions de hachage — SHA-256, intégrité et mots de passe
chapter: 4
course: cryptographie
difficulty: intermediate
duration: 35
tags: [cryptographie, hachage, sha256, mots-de-passe]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Comprendre les propriétés d'une fonction de hachage cryptographique
  - Distinguer les usages d'intégrité et de stockage de mots de passe
  - Comprendre pourquoi un hash simple ne suffit pas pour les mots de passe
---

## Introduction

Les fonctions de hachage sont omniprésentes en sécurité — vérification d'intégrité de fichiers, empreintes forensiques (vues au cours Forensics & DFIR), et stockage de mots de passe. Ce dernier usage, en particulier, exige des précautions que ce chapitre détaille en profondeur.

## Les propriétés d'une fonction de hachage cryptographique

<CompareTable
  titleA="Propriété"
  titleB="Ce qu'elle garantit"
  rows={[
    { a: "Déterminisme", b: "La même entrée produit toujours la même sortie" },
    { a: "Effet avalanche", b: "Un changement minime de l'entrée change radicalement la sortie" },
    { a: "Résistance aux collisions", b: "Extrêmement difficile de trouver deux entrées différentes produisant le même hash" },
    { a: "Sens unique (irréversibilité)", b: "Impossible de retrouver l'entrée à partir du seul hash" },
]}
/>

<CehCallout>
MD5 et SHA-1, autrefois standards, sont aujourd'hui considérés cassés pour un usage de sécurité : des collisions ont été démontrées publiquement, permettant de produire deux fichiers différents avec le même hash — SHA-256 (famille SHA-2) est aujourd'hui la référence pour l'intégrité et les usages généraux.
</CehCallout>

## Hachage pour l'intégrité — un usage direct

```bash
# Vérifier qu'un fichier téléchargé n'a pas été altéré
sha256sum fichier_telecharge.iso
# Comparer avec le hash publié officiellement par la source
```

<TipCallout>
Ce cas d'usage — vérifier qu'un fichier n'a pas été modifié — est exactement celui vu au chapitre 2 du cours Forensics & DFIR pour l'acquisition de preuves : le hash sert de preuve d'intégrité, pas de mécanisme de confidentialité.
</TipCallout>

## Pourquoi un hash simple ne suffit PAS pour les mots de passe

<WarningCallout>
Hacher un mot de passe avec SHA-256 seul, bien que déterministe et résistant aux collisions, reste dangereusement rapide à calculer — un attaquant disposant d'une base de hashs volée peut tester des milliards de mots de passe par seconde sur du matériel grand public (GPU), rendant les mots de passe faibles ou communs cassables en quelques minutes malgré un hachage "correct".
</WarningCallout>

<CompareTable
  titleA="SHA-256 seul (à éviter pour les mots de passe)"
  titleB="Fonctions dédiées (bcrypt, Argon2)"
  rows={[
    { a: "Conçu pour être rapide — mauvais pour ce cas d'usage précis", b: "Conçu pour être délibérément lent et coûteux en calcul" },
    { a: "Pas de sel intégré par défaut", b: "Sel intégré automatiquement, unique par mot de passe" },
    { a: "Vulnérable aux rainbow tables si pas de sel", b: "Résistant aux rainbow tables grâce au sel systématique" },
    { a: "Facilement parallélisable sur GPU", b: "Argon2 est conçu pour résister spécifiquement au calcul GPU massif" },
]}
/>

## Le rôle du sel (salt)

<Steps steps={[
  { title: "Génération d'un sel unique", description: "Une valeur aléatoire différente générée pour chaque mot de passe, avant hachage." },
  { title: "Concaténation avant hachage", description: "Le sel est combiné au mot de passe avant l'opération de hachage elle-même." },
  { title: "Stockage du sel avec le hash", description: "Le sel n'a pas besoin d'être secret, seulement unique — il est stocké en clair à côté du hash résultant." },
]} />

<CehCallout>
Sans sel, deux utilisateurs partageant le même mot de passe ("123456") produisent exactement le même hash — un attaquant peut alors utiliser une rainbow table (base précalculée de hashs courants) pour retrouver instantanément le mot de passe. Avec un sel unique par utilisateur, le même mot de passe produit un hash totalement différent pour chaque compte, rendant les rainbow tables inefficaces.
</CehCallout>

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell)

<Steps steps={[
  { title: "Calculer et comparer des hashs", description: "Observe l'effet avalanche en modifiant un seul caractère.", code: 'echo -n "motdepasse" | sha256sum\necho -n "motdepasse1" | sha256sum' },
  { title: "Justifier un choix d'algorithme", description: "Explique pourquoi une application qui stocke des mots de passe avec SHA-256 seul, sans sel ni fonction dédiée, présente un risque même si SHA-256 est un algorithme robuste." },
]} />

## En résumé

- Une fonction de hachage cryptographique doit être déterministe, avec effet avalanche, résistante aux collisions, et à sens unique.
- Le hachage sert à l'intégrité (fichiers, preuves forensiques) mais nécessite une approche différente pour les mots de passe.
- Les fonctions dédiées (bcrypt, Argon2), volontairement lentes et salées par défaut, sont indispensables pour le stockage sécurisé de mots de passe — jamais SHA-256 seul.

## Questions de Révision

1. Quelles sont les quatre propriétés attendues d'une fonction de hachage cryptographique ?
2. Pourquoi SHA-256, bien que robuste pour l'intégrité, est-il un mauvais choix pour hacher des mots de passe seul ?
3. À quoi sert le sel dans le hachage de mots de passe, et pourquoi n'a-t-il pas besoin d'être secret ?
