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

**Environnement** : Python 3 (terminal Nyx Shell ou environnement local avec `pandas`/`numpy`/`matplotlib` installés)

<Steps steps={[
  { title: "Calculer les statistiques descriptives avant/après", description: "Reprends l'exemple du pare-feu : calcule moyenne, médiane et écart-type des temps de réponse aux incidents avant et après déploiement.", code: 'import numpy as np\n\navant = np.array([42, 39, 51, 47, 60, 45, 38, 55])\napres = np.array([30, 28, 35, 25, 40, 33, 29, 31])\n\nprint("Avant - moyenne:", np.mean(avant), "mediane:", np.median(avant), "ecart-type:", np.std(avant))\nprint("Apres - moyenne:", np.mean(apres), "mediane:", np.median(apres), "ecart-type:", np.std(apres))' },
  { title: "Réaliser un test d'hypothèse", description: "Teste si la différence entre les deux groupes est statistiquement significative avec un test t, et récupère la p-value.", code: 'from scipy import stats\n\nt_stat, p_value = stats.ttest_ind(avant, apres)\nprint("Statistique t :", t_stat)\nprint("p-value :", p_value)' },
  { title: "Calculer un coefficient de corrélation de Pearson", description: "Calcule la corrélation entre le volume de trafic et le nombre d'alertes générées, comme dans le tableau du chapitre.", code: 'volume_trafic = np.array([100, 150, 200, 250, 300, 350])\nnombre_alertes = np.array([5, 8, 12, 15, 20, 22])\n\ncorrelation = np.corrcoef(volume_trafic, nombre_alertes)[0, 1]\nprint("Coefficient de Pearson :", round(correlation, 3))' },
  { title: "Interpréter les résultats avec prudence", description: "Le test ci-dessus porte sur seulement 8 mesures avant/après. Si le même test était refait sur 10 millions de connexions et donnait une p-value de 0,001, pourrait-on affirmer que l'effet du pare-feu est nécessairement important en pratique ? Et pourquoi faudrait-il aussi tracer un nuage de points même quand, comme ici, le coefficient de Pearson calculé est élevé ou proche de 0 ?" },
]} />

## En résumé

- Un test d'hypothèse permet de déterminer si une différence observée est statistiquement significative ou probablement due au hasard.
- Une p-value faible indique une significativité statistique, pas nécessairement une importance pratique.
- Le coefficient de corrélation de Pearson ne capture que les relations linéaires — toujours le compléter par une visualisation.

## Questions de Révision

1. Que signifie une p-value faible dans un test d'hypothèse ?
2. Pourquoi une p-value faible ne garantit-elle pas qu'un effet est important en pratique ?
3. Pourquoi le coefficient de corrélation de Pearson peut-il être proche de 0 alors que deux variables ont une relation forte mais non linéaire ?
