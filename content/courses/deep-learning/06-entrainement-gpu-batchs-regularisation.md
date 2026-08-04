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

**Environnement** : Python 3 (terminal Nyx Shell ou environnement local avec `numpy` installé — pas besoin de framework deep learning complet pour ces exercices)

<Steps steps={[
  { title: "Comparer batch complet, mini-batch et exemple unique", description: "Calcule le gradient d'une régression simple sur l'ensemble complet des données, sur un seul exemple, puis sur un mini-batch, pour observer la différence décrite dans ce chapitre.", code: "import numpy as np\nnp.random.seed(0)\n\n# Jeu de donnees jouet : 20 exemples, relation y = 2x + bruit\nX = np.random.randn(20)\ny = 2 * X + np.random.randn(20) * 0.1\n\nw = 0.0\n\ndef gradient(w, X_batch, y_batch):\n    y_pred = w * X_batch\n    error = y_pred - y_batch\n    return np.mean(2 * error * X_batch)\n\nprint('Gradient (batch complet, 20 exemples) :', gradient(w, X, y))\nprint('Gradient (1 seul exemple)             :', gradient(w, X[:1], y[:1]))\nprint('Gradient (mini-batch de 4 exemples)   :', gradient(w, X[:4], y[:4]))" },
  { title: "Mesurer la stabilité du gradient selon la taille du batch", description: "Compare la variabilité (écart-type) du gradient calculé exemple par exemple à celle calculée par mini-batchs, pour visualiser le compromis stabilité/parallélisation.", code: "single_grads = [gradient(w, X[i:i+1], y[i:i+1]) for i in range(20)]\nmini_batch_grads = [gradient(w, X[i:i+4], y[i:i+4]) for i in range(0, 20, 4)]\n\nprint('Ecart-type gradient (exemple par exemple) :', np.std(single_grads))\nprint('Ecart-type gradient (mini-batchs de 4)    :', np.std(mini_batch_grads))\n# Le mini-batch lisse la variabilite du gradient par rapport a un seul exemple,\n# tout en restant bien moins couteux que le batch complet." },
  { title: "Implémenter le dropout à la main", description: "Applique un masque de dropout à une couche de 8 neurones et observe la mise à l'échelle des activations restantes, comme décrit dans la section sur la régularisation.", code: "activations = np.array([0.9, 0.2, 0.7, 0.5, 0.3, 0.8, 0.1, 0.6])\ndropout_rate = 0.5\n\nmask = (np.random.rand(*activations.shape) > dropout_rate).astype(float)\nactivations_dropped = activations * mask / (1 - dropout_rate)\n\nprint('Activations originales    :', activations)\nprint('Masque de dropout         :', mask)\nprint('Activations apres dropout :', np.round(activations_dropped, 2))" },
]} />

## En résumé

- Les GPU accélèrent massivement l'entraînement du deep learning grâce à leur capacité à paralléliser les multiplications matricielles.
- L'entraînement par mini-batchs offre un compromis entre stabilité et parallélisation, en calculant le gradient moyen sur de petits groupes de données.
- Le dropout, l'arrêt précoce et l'augmentation de données sont des techniques de régularisation qui limitent le surapprentissage propre aux grands réseaux de neurones.

## Questions de Révision

1. Pourquoi les GPU sont-ils particulièrement adaptés au calcul du deep learning, par rapport aux CPU ?
2. Qu'est-ce qu'un mini-batch, et pourquoi ce compromis est-il préféré à un entraînement sur l'ensemble complet des données ou exemple par exemple ?
3. Comment le dropout aide-t-il à limiter le surapprentissage d'un réseau de neurones profond ?
