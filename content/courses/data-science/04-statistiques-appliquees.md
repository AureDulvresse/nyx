---
title: Statistiques appliquées à la data science
chapter: 4
course: data-science
difficulty: intermediate
duration: 35
tags: [data-science, statistiques, tests]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Réutiliser et approfondir les statistiques descriptives du cours Mathématiques Appliquées
  - Comprendre le principe d'un test d'hypothèse
  - Comprendre la corrélation de Pearson et ses limites
---

## Introduction

Ce chapitre approfondit les statistiques descriptives déjà vues au cours Mathématiques Appliquées (chapitre 6), en les étendant vers des outils plus formels pour comparer des groupes et quantifier des relations entre variables.

## Rappel et approfondissement — moyenne, médiane, écart-type

<CehCallout>
Rappel du cours Mathématiques Appliquées : la moyenne est sensible aux valeurs extrêmes, la médiane y est robuste, et l'écart-type mesure la dispersion. En data science, ces trois indicateurs se calculent systématiquement en première étape de toute analyse, avant même de tracer un graphique.
</CehCallout>

## Le principe d'un test d'hypothèse

<Steps steps={[
  { title: "Formuler une hypothèse nulle (H0)", description: "L'affirmation par défaut à réfuter — par exemple, 'ce nouveau pare-feu n'a aucun effet sur le taux d'intrusions détectées'." },
  { title: "Collecter des données et calculer une statistique de test", description: "Comparer les taux observés avant et après le déploiement du pare-feu." },
  { title: "Calculer une p-value", description: "La probabilité d'observer une différence au moins aussi grande que celle mesurée, SI l'hypothèse nulle était vraie." },
  { title: "Décider", description: "Une p-value très faible (généralement < 0,05) suggère de rejeter l'hypothèse nulle — mais cela ne confirme jamais l'hypothèse alternative avec certitude absolue." },
]} />

<WarningCallout>
Une p-value faible ne signifie pas "l'effet est important" — elle signifie seulement que l'effet observé est statistiquement peu probable sous l'hypothèse nulle. Un très grand jeu de données peut rendre statistiquement significatif un effet minuscule et sans intérêt pratique réel — un piège fréquent d'interprétation.
</WarningCallout>

## La corrélation de Pearson

```text
Le coefficient de corrélation de Pearson (r) varie de -1 à 1 :

r proche de 1  → forte corrélation positive (les deux variables augmentent ensemble)
r proche de -1 → forte corrélation négative (l'une augmente quand l'autre diminue)
r proche de 0  → absence de relation linéaire
```

<CehCallout>
Le coefficient de Pearson ne mesure QUE les relations linéaires — deux variables peuvent avoir une relation forte mais non linéaire (par exemple en forme de courbe) et afficher pourtant une corrélation de Pearson proche de 0. Toujours visualiser un nuage de points (chapitre 3) en complément du seul chiffre de corrélation.
</CehCallout>

## Application à la comparaison de groupes en sécurité

<CompareTable
  titleA="Question"
  titleB="Approche statistique"
  rows={[
    { a: "Le nouveau système de détection réduit-il vraiment le temps de réponse moyen aux incidents ?", b: "Test d'hypothèse comparant les temps de réponse avant/après" },
    { a: "Le volume de trafic est-il corrélé au nombre d'alertes générées ?", b: "Coefficient de corrélation de Pearson (si la relation semble linéaire au nuage de points)" },
    { a: "Les emails de phishing ont-ils une longueur significativement différente des emails légitimes ?", b: "Test d'hypothèse comparant les moyennes des deux groupes" },
]}
/>

<TipCallout>
Avant de conclure qu'un nouvel outil de sécurité "fonctionne mieux", un test d'hypothèse rigoureux protège contre la conclusion hâtive basée sur une simple observation ponctuelle ("on a eu moins d'incidents ce mois-ci") qui pourrait n'être due qu'au hasard ou à d'autres facteurs.
</TipCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Interpréter une p-value", description: "Un test donne une p-value de 0,001 pour l'effet d'un nouveau pare-feu sur le taux d'intrusions, mesuré sur 10 millions de connexions. Peut-on affirmer que l'effet est nécessairement important en pratique ? Justifie." },
  { title: "Repérer la limite de Pearson", description: "Pourquoi est-il important de toujours tracer un nuage de points en complément d'un coefficient de corrélation de Pearson proche de 0 ?" },
]} />

## En résumé

- Un test d'hypothèse permet de déterminer si une différence observée est statistiquement significative ou probablement due au hasard.
- Une p-value faible indique une significativité statistique, pas nécessairement une importance pratique.
- Le coefficient de corrélation de Pearson ne capture que les relations linéaires — toujours le compléter par une visualisation.

## Questions de Révision

1. Que signifie une p-value faible dans un test d'hypothèse ?
2. Pourquoi une p-value faible ne garantit-elle pas qu'un effet est important en pratique ?
3. Pourquoi le coefficient de corrélation de Pearson peut-il être proche de 0 alors que deux variables ont une relation forte mais non linéaire ?
