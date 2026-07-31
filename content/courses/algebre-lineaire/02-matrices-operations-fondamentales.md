---
title: Matrices — opérations fondamentales
chapter: 2
course: algebre-lineaire
difficulty: beginner
duration: 35
tags: [algebre-lineaire, matrices]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Comprendre une matrice comme un tableau de vecteurs
  - Réaliser l'addition et la multiplication de matrices
  - Comprendre pourquoi la multiplication matricielle n'est pas commutative
---

## Introduction

Une matrice n'est qu'un tableau de nombres organisé en lignes et colonnes — mais cette structure simple permet de représenter et manipuler efficacement des ensembles entiers de données, une capacité exploitée massivement en data science et en machine learning.

## Une matrice comme tableau de vecteurs

<CehCallout>
Une matrice peut se voir comme un empilement de vecteurs lignes (ou colonnes) : un tableau de 100 emails, chacun représenté par un vecteur de 3 caractéristiques (chapitre 1), forme naturellement une matrice de 100 lignes et 3 colonnes.
</CehCallout>

```text
Matrice de 3 emails (lignes) x 3 caractéristiques (colonnes) :

[ 15   2   1 ]   ← email 1
[  2  45   0 ]   ← email 2
[  8  12   1 ]   ← email 3
```

## Addition et multiplication par un scalaire

<Steps steps={[
  { title: "Addition de matrices", description: "Additionner terme à terme, comme pour les vecteurs — les deux matrices doivent avoir les mêmes dimensions." },
  { title: "Multiplication par un scalaire", description: "Multiplier chaque élément de la matrice par le même nombre." },
]} />

## La multiplication matricielle

<CehCallout>
La multiplication de deux matrices A (m×n) et B (n×p) donne une matrice C (m×p), où chaque élément de C est un produit scalaire (chapitre 1) entre une ligne de A et une colonne de B — c'est l'opération centrale qui permet, par exemple, à un réseau de neurones de transformer une entrée en sortie à chaque couche.
</CehCallout>

```text
Exemple de multiplication matricielle simple (2x2) :

A = [1 2]      B = [5 6]
    [3 4]          [7 8]

A × B = [1×5+2×7  1×6+2×8]   =  [19 22]
        [3×5+4×7  3×6+4×8]      [43 50]
```

<WarningCallout>
La multiplication matricielle n'est PAS commutative : A × B est en général différent de B × A, contrairement à la multiplication de nombres classiques. C'est une source d'erreurs fréquente pour qui découvre l'algèbre linéaire — l'ordre des matrices dans une multiplication compte toujours.
</WarningCallout>

<TipCallout>
La condition pour multiplier deux matrices : le nombre de colonnes de la première doit être égal au nombre de lignes de la seconde. Une matrice (2×3) ne peut être multipliée qu'avec une matrice ayant 3 lignes — vérifier cette compatibilité de dimensions est le premier réflexe avant toute multiplication.
</TipCallout>

## La matrice identité

<CehCallout>
La matrice identité (des 1 sur la diagonale, des 0 ailleurs) joue le rôle du nombre 1 dans la multiplication classique : multiplier n'importe quelle matrice par l'identité la laisse inchangée. Elle sert de référence pour définir l'inverse d'une matrice, abordé au chapitre suivant.
</CehCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (calculs à la main)

<Steps steps={[
  { title: "Vérifier la compatibilité de dimensions", description: "Une matrice A de dimension (3×2) peut-elle être multipliée par une matrice B de dimension (2×4) ? Et par une matrice de dimension (3×2) ?" },
  { title: "Multiplier deux matrices 2x2", description: "Calcule le produit de [[2,0],[1,3]] par [[1,1],[0,2]]." },
]} />

## En résumé

- Une matrice est un tableau de nombres, souvent interprété comme un empilement de vecteurs (par exemple, un jeu de données entier).
- La multiplication matricielle combine des produits scalaires ligne par colonne et exige une compatibilité de dimensions précise.
- La multiplication matricielle n'est pas commutative — l'ordre des matrices compte toujours.

## Questions de Révision

1. Pourquoi une matrice de 100 lignes et 3 colonnes peut-elle représenter un jeu de 100 emails à 3 caractéristiques chacun ?
2. Quelle condition de dimensions faut-il vérifier avant de multiplier deux matrices ?
3. Pourquoi A × B n'est-il généralement pas égal à B × A ?
