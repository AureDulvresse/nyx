---
title: Théorie de l'information et entropie
chapter: 5
course: maths
difficulty: intermediate
duration: 30
tags: [maths, entropie, information]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Comprendre ce que mesure l'entropie en théorie de l'information
  - Calculer l'entropie d'un mot de passe en bits
  - Relier l'entropie à la robustesse cryptographique réelle
---

## Introduction

L'entropie, concept central de la théorie de l'information formalisée par Claude Shannon en 1948, quantifie objectivement une notion utilisée intuitivement en sécurité : le degré d'imprévisibilité d'une donnée. C'est la mesure de référence pour évaluer la robustesse réelle d'un mot de passe ou d'une clé cryptographique.

## Ce que mesure l'entropie

<CehCallout>
L'entropie mesure la quantité d'incertitude (ou d'information) contenue dans une donnée, exprimée en bits. Plus l'entropie d'un mot de passe est élevée, plus il est imprévisible et donc difficile à deviner — un mot de passe de 60 bits d'entropie est bien plus robuste qu'un mot de passe de 20 bits, indépendamment de sa longueur apparente en caractères.
</CehCallout>

```text
Formule simplifiée pour une donnée avec N possibilités équiprobables :
Entropie (en bits) = log2(N)

Exemple : un caractère choisi parmi 94 possibilités
Entropie par caractère = log2(94) ≈ 6,55 bits

Un mot de passe de 8 caractères parmi ces 94 possibilités :
Entropie totale ≈ 8 × 6,55 ≈ 52,4 bits
```

<TipCallout>
Ce calcul rejoint directement celui du chapitre 4 : l'espace de recherche (94^8) et l'entropie (52,4 bits) mesurent la même réalité sous deux formes différentes — l'entropie est simplement le logarithme en base 2 de l'espace de recherche, une échelle plus pratique pour comparer des mots de passe de tailles différentes.
</TipCallout>

## Pourquoi l'entropie théorique surestime souvent la robustesse réelle

<WarningCallout>
Le calcul d'entropie ci-dessus suppose une génération véritablement aléatoire et uniforme. Un mot de passe choisi par un humain (même en respectant les règles de complexité imposées) a en pratique une entropie réelle bien plus faible que sa borne théorique, car certains motifs (mots du dictionnaire, séquences de clavier, substitutions prévisibles) réduisent drastiquement l'incertitude réelle exploitable par un attaquant.
</WarningCallout>

<CompareTable
  titleA="Mot de passe"
  titleB="Entropie théorique vs réelle"
  rows={[
    { a: "'P@ssw0rd123!'", b: "Entropie théorique élevée (12 caractères mixtes), entropie réelle très faible (motif prévisible, présent dans les dictionnaires d'attaque)" },
    { a: "'xK9$mQ2#vL7&'", b: "Entropie théorique et réelle proches (généré aléatoirement, sans motif reconnaissable)" },
]}
/>

## L'entropie appliquée aux clés cryptographiques

<CehCallout>
Une clé AES-256 (chapitre 2 du cours Cryptographie Avancée) possède, par construction, une entropie de 256 bits si elle est générée par un générateur de nombres aléatoires cryptographiquement sûr — c'est cette entropie maximale, et non la simple longueur en bits, qui garantit la résistance de la clé à la force brute vue au chapitre 6 du même cours.
</CehCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (calculs à la main)

<Steps steps={[
  { title: "Calculer une entropie", description: "Calcule l'entropie approximative d'un mot de passe de 10 caractères choisis parmi 26 lettres minuscules uniquement (log2(26) ≈ 4,7 bits par caractère)." },
  { title: "Comparer entropie théorique et réelle", description: "Pourquoi 'Motdepasse2026!' a-t-il une entropie théorique respectable mais une entropie réelle beaucoup plus faible face à un attaquant qui connaît les habitudes humaines de composition de mots de passe ?" },
]} />

## En résumé

- L'entropie mesure l'imprévisibilité d'une donnée en bits, calculée comme le logarithme en base 2 du nombre de possibilités équiprobables.
- L'entropie théorique d'un mot de passe suppose une génération vraiment aléatoire — les mots de passe humains ont souvent une entropie réelle bien plus faible.
- La robustesse d'une clé cryptographique dépend de son entropie réelle, garantie par un générateur aléatoire cryptographiquement sûr, pas de sa seule longueur en bits.

## Questions de Révision

1. Que mesure l'entropie en théorie de l'information, et dans quelle unité s'exprime-t-elle ?
2. Pourquoi l'entropie réelle d'un mot de passe choisi par un humain est-elle souvent inférieure à son entropie théorique ?
3. Pourquoi une clé AES-256 doit-elle être générée par un générateur aléatoire cryptographiquement sûr pour atteindre réellement 256 bits d'entropie ?
