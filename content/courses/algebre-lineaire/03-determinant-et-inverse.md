---
title: Déterminant et inverse d'une matrice
chapter: 3
course: algebre-lineaire
difficulty: intermediate
duration: 35
tags: [algebre-lineaire, determinant, inverse]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Comprendre ce que mesure le déterminant d'une matrice
  - Comprendre le rôle de l'inverse d'une matrice
  - Relier ces notions à la résolution de systèmes d'équations
---

## Introduction

Ce chapitre couvre deux notions étroitement liées : le déterminant, qui indique si une matrice est "inversible", et l'inverse lui-même, qui permet d'annuler l'effet d'une transformation matricielle — un concept qui réapparaît directement en cryptographie (certains schémas de chiffrement historiques comme le chiffre de Hill reposent sur l'inversion de matrices).

## Le déterminant — une mesure de "dégénérescence"

<CehCallout>
Le déterminant d'une matrice carrée est un unique nombre qui indique si la matrice "écrase" l'espace (déterminant nul) ou le préserve (déterminant non nul). Une matrice de déterminant nul n'est pas inversible — c'est une information cruciale avant de tenter de résoudre un système d'équations.
</CehCallout>

```text
Déterminant d'une matrice 2x2 :

Pour M = [a b]
         [c d]

det(M) = a×d - b×c

Exemple : M = [2 3]     det(M) = 2×5 - 3×4 = 10 - 12 = -2
              [4 5]
```

<TipCallout>
Un déterminant nul signifie que les lignes (ou colonnes) de la matrice sont linéairement dépendantes — l'une peut être obtenue à partir des autres par combinaison — ce qui correspond géométriquement à un "écrasement" de l'espace en une dimension inférieure.
</TipCallout>

## L'inverse d'une matrice

<Steps steps={[
  { title: "Condition d'existence", description: "Une matrice carrée n'admet un inverse que si son déterminant est non nul." },
  { title: "Définition", description: "L'inverse M⁻¹ d'une matrice M est tel que M × M⁻¹ = matrice identité (vue au chapitre 2)." },
  { title: "Utilité", description: "L'inverse permet d''annuler' une transformation matricielle, un peu comme la division annule une multiplication en arithmétique classique." },
]} />

<CehCallout>
Le chiffre de Hill, un schéma de chiffrement classique par blocs, chiffre un message en le multipliant par une matrice clé — déchiffrer revient alors à multiplier par l'inverse de cette matrice. Si la matrice clé n'est pas inversible (déterminant nul, ou non premier avec la taille de l'alphabet), le déchiffrement est impossible : un lien direct entre cette notion mathématique et une application cryptographique concrète.
</CehCallout>

## Résoudre un système d'équations avec les matrices

<CompareTable
  titleA="Système d'équations classique"
  titleB="Écriture matricielle équivalente"
  rows={[
    { a: "2x + 3y = 8\n4x + 5y = 14", b: "M × [x,y] = [8,14], où M = [[2,3],[4,5]]" },
]}
/>

<Steps steps={[
  { title: "Écrire le système sous forme matricielle", description: "Regrouper les coefficients dans une matrice M et les résultats dans un vecteur." },
  { title: "Calculer l'inverse de M (si elle existe)", description: "Vérifier d'abord que le déterminant est non nul." },
  { title: "Multiplier l'inverse par le vecteur résultat", description: "La solution du système est directement donnée par M⁻¹ × résultat." },
]} />

<WarningCallout>
En pratique (notamment en machine learning), on évite de calculer explicitement l'inverse d'une grande matrice — coûteux en calcul et numériquement instable — au profit de méthodes de résolution plus robustes. La notion d'inverse reste néanmoins essentielle pour comprendre CE QUE ces méthodes calculent réellement.
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (calculs à la main)

<Steps steps={[
  { title: "Calculer un déterminant", description: "Calcule le déterminant de [[3,1],[2,4]]. Cette matrice est-elle inversible ?" },
  { title: "Identifier une matrice non inversible", description: "Calcule le déterminant de [[2,4],[1,2]]. Que remarques-tu sur la relation entre les deux lignes ?" },
]} />

## En résumé

- Le déterminant d'une matrice indique si elle est inversible (déterminant non nul) ou non (déterminant nul).
- L'inverse d'une matrice M vérifie M × M⁻¹ = identité, et permet d'annuler une transformation matricielle.
- Un système d'équations linéaires peut se résoudre par inversion matricielle, un principe utilisé notamment dans le chiffre de Hill.

## Questions de Révision

1. Que signifie un déterminant nul pour une matrice ?
2. Pourquoi une matrice de déterminant nul n'admet-elle pas d'inverse ?
3. En quoi le chiffre de Hill illustre-t-il une application concrète de l'inversion matricielle ?
