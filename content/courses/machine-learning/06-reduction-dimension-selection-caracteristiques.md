---
title: Réduction de dimension et sélection de caractéristiques
chapter: 6
course: machine-learning
difficulty: advanced
duration: 35
tags: [pca, reduction-dimension, feature-selection]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Comprendre le fléau de la dimension
  - Comprendre le principe de l'ACP (PCA)
  - Distinguer réduction de dimension et sélection de caractéristiques
---

## Introduction

Ce chapitre aborde un problème pratique récurrent en machine learning : que faire quand un jeu de données contient un très grand nombre de variables — un scénario fréquent en cybersécurité (des centaines de caractéristiques réseau extraites pour de la détection d'intrusion, par exemple).

## Le fléau de la dimension

<WarningCallout>
Le "fléau de la dimension" (curse of dimensionality) désigne le fait que les données deviennent de plus en plus clairsemées à mesure que le nombre de variables augmente — au-delà d'un certain nombre de dimensions, les notions de distance et de proximité utilisées par des algorithmes comme k-NN ou k-means (chapitres précédents) perdent en partie leur pouvoir discriminant.
</WarningCallout>

<CehCallout>
Rappel du cours Algèbre Linéaire (chapitre 4) : chaque variable ajoutée est une dimension supplémentaire de l'espace des données — avec trop de dimensions, le volume de cet espace croît si rapidement que les points, même nombreux, deviennent relativement isolés les uns des autres, rendant plus difficile la détection de motifs.
</CehCallout>

## L'Analyse en Composantes Principales (ACP / PCA)

<CehCallout>
L'ACP transforme un ensemble de variables potentiellement corrélées en un nouvel ensemble de variables non corrélées (les composantes principales), ordonnées par la quantité de variance des données qu'elles expliquent — en ne conservant que les premières composantes, on réduit le nombre de dimensions tout en préservant l'essentiel de l'information.
</CehCallout>

```mermaid
graph LR
    A[Données à N dimensions corrélées] --> B[Calcul des composantes principales]
    B --> C[Conserver les k premières composantes]
    C --> D[Données à k dimensions, variance maximale préservée]
```

<Steps steps={[
  { title: "Centrer et normaliser les données", description: "Chaque variable est centrée (moyenne nulle) et mise à la même échelle, sans quoi une variable à grande échelle dominerait artificiellement l'analyse." },
  { title: "Calculer les composantes principales", description: "Rappel du cours Algèbre Linéaire (chapitre 6, valeurs propres et vecteurs propres) : les composantes principales sont les vecteurs propres de la matrice de covariance des données, ordonnés par variance expliquée décroissante." },
  { title: "Projeter les données sur les k premières composantes", description: "Les données sont projetées sur un nouvel espace de dimension réduite, défini par les composantes qui expliquent le plus de variance." },
]} />

<TipCallout>
L'ACP est fréquemment utilisée avant d'entraîner un modèle sur des données à très haute dimension (par exemple des centaines de caractéristiques réseau) : réduire les dimensions accélère l'entraînement, réduit le risque de surapprentissage, et permet parfois de visualiser les données en 2 ou 3 dimensions.
</TipCallout>

## Réduction de dimension vs sélection de caractéristiques

<WarningCallout>
Il ne faut pas confondre réduction de dimension et sélection de caractéristiques : l'ACP crée de nouvelles variables (combinaisons des variables originales, difficiles à interpréter individuellement), tandis que la sélection de caractéristiques choisit un sous-ensemble des variables originales, en conservant leur interprétabilité.
</WarningCallout>

<CompareTable
  titleA="Réduction de dimension (ACP)"
  titleB="Sélection de caractéristiques"
  rows={[
    { a: "Crée de nouvelles variables combinées", b: "Conserve un sous-ensemble des variables originales" },
    { a: "Variables résultantes difficiles à interpréter", b: "Variables conservées restent directement interprétables" },
    { a: "Maximise la variance expliquée globale", b: "Peut cibler les variables les plus pertinentes pour une tâche spécifique (ex : importance des variables d'un Random Forest, chapitre 3)" },
]}
/>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Identifier un cas d'usage du fléau de la dimension", description: "Pourquoi un modèle k-NN entraîné sur 500 caractéristiques réseau pourrait-il moins bien fonctionner qu'un modèle entraîné sur les 20 caractéristiques les plus pertinentes ?" },
  { title: "Choisir entre ACP et sélection de caractéristiques", description: "Pour un analyste SOC qui doit pouvoir expliquer à un manager quelles variables réseau ont motivé une alerte, l'ACP ou la sélection de caractéristiques est-elle préférable ? Justifie." },
]} />

## En résumé

- Le fléau de la dimension dégrade la pertinence des notions de distance à mesure que le nombre de variables augmente.
- L'ACP réduit la dimension en projetant les données sur les composantes principales, les combinaisons de variables qui expliquent le plus de variance.
- Contrairement à l'ACP, la sélection de caractéristiques conserve un sous-ensemble des variables originales, préservant leur interprétabilité.

## Questions de Révision

1. Qu'est-ce que le fléau de la dimension, et pourquoi affecte-t-il des algorithmes comme k-NN ?
2. Que représentent les composantes principales calculées par l'ACP ?
3. Pourquoi préférer la sélection de caractéristiques à l'ACP quand l'interprétabilité des variables est importante ?
