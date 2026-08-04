---
title: Évaluation de modèles — métriques et pièges
chapter: 7
course: data-science
difficulty: advanced
duration: 40
tags: [data-science, evaluation, metriques, overfitting]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Comprendre la matrice de confusion et les métriques qui en dérivent
  - Comprendre pourquoi l'accuracy est trompeuse sur des données déséquilibrées
  - Comprendre le surapprentissage (overfitting) et comment s'en prémunir
---

## Introduction

Un modèle qui affiche "99% de précision" peut être soit excellent, soit totalement inutile — tout dépend de la métrique employée et de la nature des données. Ce chapitre couvre les pièges d'évaluation les plus fréquents, particulièrement critiques en sécurité où les données sont presque toujours déséquilibrées (très peu d'attaques parmi énormément de trafic normal).

## La matrice de confusion

<CompareTable
  titleA="Résultat"
  titleB="Signification"
  rows={[
    { a: "Vrai positif (VP)", b: "Le modèle prédit une attaque, c'en est réellement une" },
    { a: "Faux positif (FP)", b: "Le modèle prédit une attaque, mais c'était du trafic normal (fausse alerte)" },
    { a: "Vrai négatif (VN)", b: "Le modèle prédit du trafic normal, c'en est réellement" },
    { a: "Faux négatif (FN)", b: "Le modèle prédit du trafic normal, mais c'était une attaque manquée" },
]}
/>

<WarningCallout>
En sécurité, un faux négatif (une attaque manquée) est généralement bien plus coûteux qu'un faux positif (une fausse alerte à trier) — un système de détection doit souvent être réglé en tenant compte de cette asymétrie de coût, pas seulement en cherchant à minimiser le nombre total d'erreurs.
</WarningCallout>

## Pourquoi l'accuracy est trompeuse sur des données déséquilibrées

<CehCallout>
Sur un jeu de données où seulement 1% du trafic est une attaque réelle, un modèle "paresseux" qui prédit systématiquement "trafic normal" obtient déjà 99% d'accuracy — un chiffre impressionnant mais totalement inutile, puisque ce modèle ne détecte jamais aucune attaque. C'est le piège classique de l'accuracy sur des données fortement déséquilibrées, la norme en sécurité.
</CehCallout>

## Précision, rappel et F1-score

<CompareTable
  titleA="Métrique"
  titleB="Calcul et signification"
  rows={[
    { a: "Précision (precision)", b: "VP / (VP + FP) — parmi les alertes déclenchées, quelle proportion est réellement une attaque ?" },
    { a: "Rappel (recall)", b: "VP / (VP + FN) — parmi les attaques réelles, quelle proportion a été détectée ?" },
    { a: "F1-score", b: "Moyenne harmonique de la précision et du rappel — un compromis unique entre les deux" },
]}
/>

<TipCallout>
Un SOC qui privilégie ne rater aucune attaque (chapitre lié : Analyse SOC) acceptera un rappel élevé au prix d'une précision plus faible (plus de fausses alertes à trier) — le choix du compromis précision/rappel dépend directement du coût relatif des faux positifs et des faux négatifs pour l'organisation concernée.
</TipCallout>

## Le surapprentissage (overfitting)

<CehCallout>
Un modèle en surapprentissage a "mémorisé" les exemples d'entraînement (y compris leur bruit et leurs particularités non généralisables) plutôt que d'apprendre des motifs réellement transférables — il obtient d'excellents résultats sur les données d'entraînement mais échoue sur des données nouvelles jamais vues.
</CehCallout>

```mermaid
graph LR
    A[Modèle trop simple] -->|sous-apprentissage| B[Mauvaise performance partout]
    C[Modèle bien ajusté] --> D[Bonne généralisation]
    E[Modèle trop complexe] -->|surapprentissage| F[Excellent sur l'entraînement, mauvais en généralisation]
```

<Steps steps={[
  { title: "Séparer les données en jeux distincts", description: "Entraînement (pour apprendre), validation (pour ajuster), test (pour l'évaluation finale, jamais utilisé pendant l'entraînement)." },
  { title: "Surveiller l'écart entraînement/validation", description: "Un modèle en surapprentissage montre une performance qui continue de s'améliorer sur l'entraînement tout en stagnant ou se dégradant sur la validation." },
  { title: "Simplifier le modèle si nécessaire", description: "Réduire la profondeur d'un arbre de décision, ou utiliser des techniques de régularisation, pour limiter la mémorisation excessive." },
]} />

<WarningCallout>
Évaluer un modèle sur les mêmes données que celles utilisées pour l'entraîner donne systématiquement une estimation optimiste et trompeuse de sa performance réelle — c'est pourquoi le jeu de test doit rester strictement séparé et jamais consulté avant l'évaluation finale.
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Python 3 (terminal Nyx Shell ou environnement local avec `pandas`/`numpy`/`matplotlib` installés)

<Steps steps={[
  { title: "Calculer précision, rappel et F1-score", description: "Un modèle de détection produit 80 vrais positifs, 20 faux positifs, et 10 faux négatifs. Calcule sa précision, son rappel et son F1-score.", code: 'VP, FP, FN = 80, 20, 10\n\nprecision = VP / (VP + FP)\nrappel = VP / (VP + FN)\nf1 = 2 * (precision * rappel) / (precision + rappel)\n\nprint("Precision :", round(precision, 3))\nprint("Rappel :", round(rappel, 3))\nprint("F1-score :", round(f1, 3))' },
  { title: "Démontrer le piège de l'accuracy", description: "Simule un jeu de données déséquilibré (2% d'attaques) et un modèle 'paresseux' qui prédit toujours 'normal', comme dans l'exemple du modèle de fraude à 98% d'accuracy.", code: 'import pandas as pd\nimport numpy as np\n\nnp.random.seed(2)\nn = 1000\nlabels_reels = np.random.choice(["normal", "attaque"], size=n, p=[0.98, 0.02])\nprediction_paresseuse = np.array(["normal"] * n)\n\naccuracy = (prediction_paresseuse == labels_reels).mean()\nprint("Accuracy du modele paresseux :", round(accuracy, 3))\nprint("Attaques reellement detectees :", ((prediction_paresseuse == "attaque") & (labels_reels == "attaque")).sum())' },
  { title: "Repérer un surapprentissage via l'écart entraînement/validation", description: "Compare l'accuracy sur l'entraînement et sur la validation à mesure que la complexité du modèle augmente, pour repérer où le surapprentissage apparaît.", code: 'complexites = np.array([1, 2, 3, 4, 5])\naccuracy_entrainement = np.array([0.70, 0.80, 0.90, 0.97, 0.99])\naccuracy_validation = np.array([0.68, 0.78, 0.85, 0.80, 0.72])\n\necart = accuracy_entrainement - accuracy_validation\nprint("Ecart entrainement/validation par complexite :", np.round(ecart, 2))\nprint("Complexite ou le surapprentissage apparait :", complexites[np.argmax(ecart)])' },
  { title: "Interpréter l'écart observé", description: "Pourquoi un écart important entre l'accuracy sur l'entraînement et sur la validation (comme observé à la complexité 4 ci-dessus) signale-t-il un surapprentissage plutôt qu'une simple variation aléatoire ?" },
]} />

## En résumé

- La matrice de confusion (VP, FP, VN, FN) est la base de toutes les métriques d'évaluation d'un modèle de classification.
- L'accuracy est trompeuse sur des données déséquilibrées, la norme en sécurité — précision, rappel et F1-score sont souvent plus pertinents.
- Le surapprentissage se détecte en comparant la performance sur l'entraînement et sur un jeu de validation distinct, jamais sur les mêmes données que l'entraînement.

## Questions de Révision

1. Pourquoi un faux négatif est-il généralement plus coûteux qu'un faux positif en sécurité ?
2. Pourquoi l'accuracy peut-elle donner une impression trompeuse de performance sur un jeu de données déséquilibré ?
3. Comment détecte-t-on qu'un modèle est en situation de surapprentissage ?
