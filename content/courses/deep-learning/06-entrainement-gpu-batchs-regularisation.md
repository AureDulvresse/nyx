---
title: Entraîner un modèle deep learning — GPU, batchs, régularisation
chapter: 6
course: deep-learning
difficulty: advanced
duration: 35
tags: [entrainement, gpu, regularisation, dropout]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Comprendre pourquoi le deep learning nécessite des GPU
  - Comprendre le principe de l'entraînement par mini-batchs
  - Comprendre les techniques de régularisation spécifiques au deep learning
---

## Introduction

Ce chapitre aborde les aspects pratiques de l'entraînement d'un modèle de deep learning — des considérations matérielles et algorithmiques indispensables pour transformer les architectures des chapitres précédents (CNN, RNN, Transformers) en modèles réellement entraînables sur des données de taille réelle.

## Pourquoi le deep learning nécessite des GPU

<CehCallout>
Rappel du cours Algèbre Linéaire (chapitre 3, multiplication matricielle) : l'essentiel des calculs d'un réseau de neurones (propagation avant, rétropropagation) se ramène à d'immenses multiplications de matrices — une opération que les GPU, conçus à l'origine pour le rendu graphique, effectuent massivement en parallèle, bien plus efficacement qu'un processeur classique (CPU) optimisé pour des calculs séquentiels.
</CehCallout>

<CompareTable
  titleA="CPU"
  titleB="GPU"
  rows={[
    { a: "Quelques cœurs puissants, optimisés pour des tâches séquentielles variées", b: "Des milliers de cœurs plus simples, optimisés pour effectuer la même opération en parallèle sur d'immenses volumes de données" },
    { a: "Adapté à la majorité des tâches informatiques générales", b: "Particulièrement adapté aux multiplications matricielles massives du deep learning" },
]}
/>

## L'entraînement par mini-batchs

<WarningCallout>
Calculer le gradient (rappel cours Machine Learning, chapitre 2) sur l'intégralité d'un jeu de données avant chaque mise à jour des poids serait extrêmement lent sur de grands volumes — à l'inverse, mettre à jour les poids après chaque exemple individuel rendrait l'entraînement instable et peu parallélisable.
</WarningCallout>

<CehCallout>
L'entraînement par mini-batchs divise les données en petits groupes (batchs), et calcule le gradient moyen sur chaque batch avant de mettre à jour les poids — un compromis qui permet de paralléliser efficacement le calcul sur GPU tout en gardant un entraînement suffisamment stable.
</CehCallout>

```mermaid
graph LR
    A[Jeu de données complet] --> B[Diviser en mini-batchs]
    B --> C[Calculer le gradient moyen par batch]
    C --> D[Mettre à jour les poids]
    D --> B
```

<TipCallout>
Une "époque" (epoch) correspond à un passage complet sur l'ensemble du jeu de données d'entraînement, généralement décomposé en de nombreux mini-batchs successifs — un modèle est typiquement entraîné sur plusieurs dizaines ou centaines d'époques.
</TipCallout>

## Le surapprentissage à grande échelle

<WarningCallout>
Rappel du cours Machine Learning (chapitre 3, surapprentissage des arbres) : un réseau de neurones profond, avec ses millions de paramètres, est particulièrement sujet au surapprentissage — il peut mémoriser le jeu d'entraînement au lieu d'apprendre des motifs généralisables, surtout si les données d'entraînement sont limitées par rapport à la taille du modèle.
</WarningCallout>

## Techniques de régularisation spécifiques au deep learning

<Steps steps={[
  { title: "Dropout", description: "Désactive aléatoirement une fraction des neurones à chaque étape d'entraînement, empêchant le réseau de trop dépendre de neurones spécifiques et favorisant des représentations plus robustes." },
  { title: "Arrêt précoce (early stopping)", description: "Surveille la performance sur un ensemble de validation et arrête l'entraînement dès que cette performance cesse de s'améliorer, avant que le surapprentissage ne s'installe." },
  { title: "Augmentation de données", description: "Génère artificiellement des variantes des données d'entraînement (rotation, recadrage d'images, par exemple) pour exposer le modèle à plus de diversité sans collecter de nouvelles données." },
]} />

<CehCallout>
Ces techniques de régularisation s'ajoutent aux principes déjà vus au cours Machine Learning (validation croisée, chapitre 7) — combinées à une évaluation rigoureuse sur un ensemble de test totalement indépendant, elles permettent de s'assurer qu'un modèle de deep learning généralise réellement, plutôt que de simplement mémoriser ses données d'entraînement.
</CehCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Expliquer l'intérêt des GPU", description: "Pourquoi un GPU, conçu à l'origine pour le rendu graphique, est-il particulièrement adapté à l'entraînement d'un réseau de neurones profond ?" },
  { title: "Choisir une technique de régularisation", description: "Un modèle de deep learning atteint une excellente performance sur les données d'entraînement mais une performance médiocre sur les données de validation. Quelles techniques de régularisation de ce chapitre pourraient aider, et pourquoi ?" },
]} />

## En résumé

- Les GPU accélèrent massivement l'entraînement du deep learning grâce à leur capacité à paralléliser les multiplications matricielles.
- L'entraînement par mini-batchs offre un compromis entre stabilité et parallélisation, en calculant le gradient moyen sur de petits groupes de données.
- Le dropout, l'arrêt précoce et l'augmentation de données sont des techniques de régularisation qui limitent le surapprentissage propre aux grands réseaux de neurones.

## Questions de Révision

1. Pourquoi les GPU sont-ils particulièrement adaptés au calcul du deep learning, par rapport aux CPU ?
2. Qu'est-ce qu'un mini-batch, et pourquoi ce compromis est-il préféré à un entraînement sur l'ensemble complet des données ou exemple par exemple ?
3. Comment le dropout aide-t-il à limiter le surapprentissage d'un réseau de neurones profond ?
