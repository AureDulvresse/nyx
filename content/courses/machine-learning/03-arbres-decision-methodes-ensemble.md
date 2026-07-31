---
title: Arbres de décision et méthodes d'ensemble
chapter: 3
course: machine-learning
difficulty: intermediate
duration: 35
tags: [arbres-decision, random-forest, gradient-boosting]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Comprendre le principe de construction d'un arbre de décision
  - Comprendre pourquoi combiner plusieurs modèles améliore la performance
  - Distinguer bagging (Random Forest) et boosting (Gradient Boosting)
---

## Introduction

Ce chapitre détaille les arbres de décision et les méthodes d'ensemble qui les combinent — des algorithmes parmi les plus utilisés en pratique, y compris pour la détection d'anomalies en cybersécurité, déjà mentionnés sans détail au cours Data Science Complète (chapitre 5).

## Construire un arbre de décision

<CehCallout>
Un arbre de décision divise successivement les données selon des questions simples (par exemple "la taille du fichier dépasse-t-elle 1 Mo ?") choisies pour séparer au mieux les classes à chaque étape — un principe qui se rapproche d'un organigramme de décision, lisible et interprétable, contrairement à de nombreux autres modèles.
</CehCallout>

```mermaid
graph TD
    A[Taille du fichier > 1 Mo ?] -->|Oui| B[Contient une macro ?]
    A -->|Non| C[Bénin]
    B -->|Oui| D[Malveillant]
    B -->|Non| E[Bénin]
```

<TipCallout>
Le critère de séparation à chaque nœud est choisi pour maximiser la "pureté" des groupes résultants — rappel du concept d'entropie (cours Mathématiques Appliquées, chapitre 5) : un groupe parfaitement pur (une seule classe) a une entropie nulle, l'algorithme cherche donc la question qui réduit le plus l'entropie à chaque division.
</TipCallout>

## La faiblesse d'un arbre isolé — le surapprentissage

<WarningCallout>
Un arbre de décision poussé trop en profondeur mémorise les particularités du jeu d'entraînement plutôt que d'apprendre une règle générale — rappel direct du surapprentissage (overfitting) déjà rencontré au cours Data Science Complète (chapitre 6) : un arbre trop profond obtient un score parfait sur l'entraînement mais généralise mal à de nouvelles données.
</WarningCallout>

## Le bagging — Random Forest

<CehCallout>
Une forêt aléatoire (Random Forest) entraîne un grand nombre d'arbres de décision, chacun sur un sous-échantillon aléatoire des données et des variables, puis combine leurs prédictions (vote majoritaire en classification, moyenne en régression) — cette technique s'appelle le bagging (bootstrap aggregating).
</CehCallout>

<Steps steps={[
  { title: "Tirer des sous-échantillons aléatoires", description: "Chaque arbre de la forêt est entraîné sur un sous-ensemble différent des données, tiré avec remise (bootstrap)." },
  { title: "Limiter les variables considérées à chaque nœud", description: "Chaque arbre ne considère qu'un sous-ensemble aléatoire des variables disponibles à chaque division, augmentant la diversité entre arbres." },
  { title: "Combiner les prédictions", description: "La prédiction finale résulte du vote majoritaire (classification) ou de la moyenne (régression) de tous les arbres de la forêt." },
]} />

<TipCallout>
Cette diversité entre arbres est la clé du succès du bagging : des arbres individuellement faibles ou surajustés, une fois combinés, compensent mutuellement leurs erreurs respectives — un principe similaire à la sagesse des foules, où l'agrégation de nombreux avis indépendants surpasse souvent un avis unique, même expert.
</TipCallout>

## Le boosting — Gradient Boosting

<CehCallout>
Contrairement au bagging qui entraîne des arbres indépendamment puis les combine, le boosting (dont Gradient Boosting est l'exemple le plus connu) entraîne les arbres séquentiellement — chaque nouvel arbre est entraîné spécifiquement pour corriger les erreurs commises par les arbres précédents.
</CehCallout>

<CompareTable
  titleA="Bagging (Random Forest)"
  titleB="Boosting (Gradient Boosting)"
  rows={[
    { a: "Arbres entraînés indépendamment et en parallèle", b: "Arbres entraînés séquentiellement, chacun corrigeant le précédent" },
    { a: "Réduit principalement la variance (surapprentissage)", b: "Réduit principalement le biais (sous-apprentissage), au risque de surapprendre si mal réglé" },
    { a: "Plus simple à paralléliser, entraînement rapide", b: "Généralement plus performant mais plus sensible aux réglages" },
]}
/>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Expliquer pourquoi la diversité améliore la performance", description: "Pourquoi combiner de nombreux arbres légèrement différents (bagging) donne-t-il généralement de meilleurs résultats qu'un seul arbre très profond ?" },
  { title: "Choisir entre Random Forest et Gradient Boosting", description: "Pour un projet nécessitant un entraînement rapide sur une grande quantité de données avec des ressources de calcul limitées, quelle méthode d'ensemble privilégier, et pourquoi ?" },
]} />

## En résumé

- Un arbre de décision divise successivement les données selon des questions choisies pour maximiser la pureté des groupes résultants.
- Un arbre isolé, trop profond, surapprend facilement — les méthodes d'ensemble corrigent cette faiblesse en combinant plusieurs arbres.
- Le bagging (Random Forest) entraîne des arbres indépendamment en parallèle ; le boosting (Gradient Boosting) les entraîne séquentiellement, chacun corrigeant les erreurs du précédent.

## Questions de Révision

1. Comment un arbre de décision choisit-il la question à poser à chaque nœud ?
2. Pourquoi un arbre de décision isolé, trop profond, généralise-t-il souvent mal ?
3. Quelle est la différence fondamentale entre le bagging et le boosting ?
