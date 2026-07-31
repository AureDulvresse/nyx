---
title: Le perceptron et la descente de gradient
chapter: 1
course: deep-learning
difficulty: intermediate
duration: 35
tags: [perceptron, deep-learning, gradient]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Comprendre le fonctionnement d'un perceptron, l'unité de base d'un réseau de neurones
  - Comprendre pourquoi un perceptron isolé est limité
  - Situer ce cours comme prolongement du cours Machine Learning
---

## Introduction

Ce cours prolonge le cours Machine Learning en abordant les réseaux de neurones et le deep learning — des modèles inspirés (très librement) du fonctionnement des neurones biologiques, à l'origine des avancées les plus spectaculaires de l'intelligence artificielle moderne, de la reconnaissance d'image à la génération de texte.

## Le perceptron — l'unité de base

<CehCallout>
Un perceptron est l'unité de calcul la plus simple d'un réseau de neurones : il reçoit plusieurs entrées, calcule leur somme pondérée (rappel du cours Algèbre Linéaire, produit scalaire), puis applique une fonction d'activation pour produire une sortie — une structure qui rappelle directement la régression linéaire du cours Machine Learning (chapitre 2), à laquelle s'ajoute cette fonction d'activation.
</CehCallout>

```mermaid
graph LR
    X1[Entrée x1] -->|poids w1| S((Somme pondérée))
    X2[Entrée x2] -->|poids w2| S
    X3[Entrée x3] -->|poids w3| S
    S --> F[Fonction d'activation]
    F --> Y[Sortie]
```

```text
Calcul d'un perceptron :
somme = w1*x1 + w2*x2 + w3*x3 + b
sortie = fonction_activation(somme)
```

## Les fonctions d'activation

<CehCallout>
Sans fonction d'activation non linéaire, un perceptron (ou même un empilement de perceptrons) ne pourrait modéliser que des relations linéaires, quel que soit le nombre de couches — la fonction d'activation introduit la non-linéarité qui permet aux réseaux de neurones d'apprendre des motifs complexes.
</CehCallout>

<CompareTable
  titleA="Fonction d'activation"
  titleB="Caractéristique"
  rows={[
    { a: "Sigmoïde", b: "Rappel du cours Machine Learning (chapitre 2) : transforme la somme en une valeur entre 0 et 1, utile en sortie pour une probabilité" },
    { a: "ReLU (Rectified Linear Unit)", b: "Retourne 0 pour toute entrée négative, l'entrée elle-même sinon — la plus utilisée dans les couches internes des réseaux profonds" },
    { a: "Tanh", b: "Similaire à la sigmoïde mais centrée sur 0, valeurs entre -1 et 1" },
]}
/>

## La limite historique du perceptron isolé

<WarningCallout>
Un perceptron isolé ne peut résoudre que des problèmes linéairement séparables — il est par exemple incapable d'apprendre la fonction logique XOR (OU exclusif), un problème simple mais non linéairement séparable, ce qui a considérablement freiné la recherche sur les réseaux de neurones jusqu'à la découverte de méthodes permettant d'entraîner des réseaux à plusieurs couches.
</WarningCallout>

## La descente de gradient appliquée au perceptron

<CehCallout>
Rappel du cours Machine Learning (chapitre 2) : la descente de gradient ajuste progressivement les poids et le biais d'un perceptron pour minimiser l'erreur entre la sortie prédite et la sortie attendue — exactement le même principe que pour la régression linéaire, appliqué ici à une unité de calcul qui inclut une fonction d'activation.
</CehCallout>

<Steps steps={[
  { title: "Calculer la sortie du perceptron", description: "À partir des entrées, des poids actuels et de la fonction d'activation." },
  { title: "Calculer l'erreur", description: "La différence entre la sortie prédite et la sortie attendue." },
  { title: "Ajuster les poids via la descente de gradient", description: "Chaque poids est légèrement modifié dans la direction qui réduit l'erreur, selon le taux d'apprentissage (rappel cours Machine Learning, chapitre 2)." },
]} />

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Expliquer le rôle de la fonction d'activation", description: "Pourquoi un réseau de neurones sans fonction d'activation non linéaire, même avec de nombreuses couches, ne pourrait-il modéliser que des relations linéaires ?" },
  { title: "Identifier la limite du perceptron isolé", description: "Pourquoi un perceptron isolé ne peut-il pas apprendre la fonction logique XOR ?" },
]} />

## En résumé

- Un perceptron calcule une somme pondérée de ses entrées puis applique une fonction d'activation, un calcul proche de la régression linéaire enrichi de non-linéarité.
- Les fonctions d'activation (sigmoïde, ReLU, tanh) introduisent la non-linéarité indispensable pour modéliser des motifs complexes.
- Un perceptron isolé reste limité aux problèmes linéairement séparables — une limite qui a motivé le développement de réseaux à plusieurs couches, objet du prochain chapitre.

## Questions de Révision

1. Que calcule un perceptron avant d'appliquer sa fonction d'activation ?
2. Pourquoi la non-linéarité de la fonction d'activation est-elle indispensable ?
3. Pourquoi un perceptron isolé ne peut-il pas résoudre un problème comme XOR ?
