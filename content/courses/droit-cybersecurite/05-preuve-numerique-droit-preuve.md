---
title: Preuve numérique et droit de la preuve
chapter: 5
course: droit-cybersecurite
difficulty: advanced
duration: 35
tags: [droit, preuve-numerique, forensics, chaine-custody]
ceh_modules: ["Module 1 - Introduction to Ethical Hacking"]
objectives:
  - Comprendre les conditions de recevabilité d'une preuve numérique
  - Appliquer les principes de chaîne de custody (chain of custody)
  - Identifier les erreurs qui rendent une preuve irrecevable
---

## Introduction

Ce chapitre fait le pont entre le droit et les compétences forensiques (approfondies dans le cours DFIR) : une preuve technique parfaitement identifiée peut devenir juridiquement inutilisable si sa collecte, sa conservation ou sa documentation ne respecte pas des règles précises. Un excellent analyste DFIR sans culture juridique de la preuve peut produire une investigation techniquement brillante mais inutilisable devant un tribunal.

## Ce qui rend une preuve numérique recevable

<CompareTable
  titleA="Critère de recevabilité"
  titleB="En pratique"
  rows={[
    { a: "Intégrité", b: "La preuve n'a pas été altérée depuis sa collecte (empreinte hash constante)" },
    { a: "Authenticité", b: "La preuve provient bien de la source qu'elle prétend représenter" },
    { a: "Traçabilité", b: "Chaque manipulation de la preuve est documentée : qui, quand, comment" },
    { a: "Licéité de la collecte", b: "La preuve n'a pas été obtenue par un moyen lui-même illégal (ex : accès non autorisé)" },
]}
/>

<LegalCallout>
Une preuve obtenue par un moyen illégal — par exemple un accès à un système hors du périmètre autorisé — peut être jugée irrecevable, indépendamment de sa pertinence factuelle. La légalité de la collecte prime souvent sur la valeur informative de la preuve elle-même.
</LegalCallout>

## La chaîne de custody (chain of custody)

La chaîne de custody documente le parcours complet d'une preuve, de sa collecte à sa présentation éventuelle devant une juridiction, garantissant qu'elle n'a pas pu être altérée sans que cela soit détecté.

<Steps steps={[
  { title: "Collecte initiale", description: "Qui a collecté la preuve, quand, comment (outil utilisé), et calcul immédiat d'une empreinte cryptographique (hash SHA-256)." },
  { title: "Stockage sécurisé", description: "Support de stockage identifié, accès restreint et journalisé, copie de travail distincte de l'original préservé." },
  { title: "Chaque transfert documenté", description: "Toute personne qui manipule la preuve, à quel moment, pour quelle raison — sans rupture dans la chronologie." },
  { title: "Vérification d'intégrité à chaque étape", description: "Recalcul du hash à chaque manipulation pour prouver qu'aucune altération n'a eu lieu." },
]} />

```text
Exemple de fiche de chaîne de custody :

Preuve : Image disque du serveur WEB-PROD-03
Hash SHA-256 à la collecte : 8f14e45fceea167a5a36dedd4bea2543...
Collecté par : J. Martin, le 12/03/2026 à 09:15, via dd sur support write-blocker
Stocké : coffre-fort numérique, accès restreint (2 personnes habilitées)
Transfert 1 : copie transmise à l'analyste K. Diallo le 12/03/2026 à 14:00 pour analyse
Vérification hash post-transfert : 8f14e45fceea167a5a36dedd4bea2543... (identique — intègre)
```

<CehCallout>
En DFIR, l'utilisation d'un write-blocker (bloqueur d'écriture matériel ou logiciel) lors de l'acquisition d'un disque n'est pas qu'une bonne pratique technique — c'est un élément de preuve en soi, démontrant que l'original n'a subi aucune écriture accidentelle pendant sa copie.
</CehCallout>

## Erreurs qui rendent une preuve irrecevable ou fragile

<WarningCallout>
Travailler directement sur le système original plutôt que sur une copie forensique — même en pensant "juste regarder", une simple consultation de fichier peut modifier des métadonnées (date de dernier accès) et rompre l'intégrité de la preuve originale.
</WarningCallout>

- Absence de calcul de hash à la collecte — impossible de prouver ensuite que la preuve n'a pas été modifiée.
- Rupture dans la chaîne de custody — une période non documentée où la preuve a été accessible sans traçabilité.
- Collecte réalisée hors du périmètre légalement autorisé (voir chapitre 1).
- Documentation rédigée après coup, de mémoire, plutôt qu'en temps réel pendant la collecte.

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Identifier une rupture de chaîne", description: "Une image disque est collectée avec hash documenté, puis transmise par clé USB à un second analyste sans qu'aucun hash de vérification ne soit recalculé à réception. Quel problème cela pose-t-il ?" },
  { title: "Justifier une pratique forensique", description: "Explique en une phrase pourquoi un analyste DFIR ne doit jamais travailler directement sur un disque original plutôt que sur une copie forensique." },
]} />

## En résumé

- Une preuve numérique recevable doit être intègre, authentique, traçable, et collectée de façon licite.
- La chaîne de custody documente chaque étape du parcours d'une preuve pour garantir qu'elle n'a pas pu être altérée sans que cela soit détecté.
- Travailler sur l'original plutôt que sur une copie forensique, ou omettre de calculer un hash à la collecte, sont des erreurs qui fragilisent gravement la recevabilité d'une preuve.

## Questions de Révision

1. Quels sont les quatre critères qui rendent une preuve numérique recevable ?
2. À quoi sert le calcul d'une empreinte hash (SHA-256) lors de la collecte d'une preuve ?
3. Pourquoi un analyste DFIR ne travaille-t-il jamais directement sur le disque original d'une machine compromise ?
