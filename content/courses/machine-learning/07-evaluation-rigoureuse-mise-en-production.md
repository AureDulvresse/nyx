---
title: Évaluation rigoureuse et mise en production d'un modèle
chapter: 7
course: machine-learning
difficulty: advanced
duration: 40
tags: [evaluation, validation-croisee, mise-en-production]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Approfondir la validation croisée au-delà d'un simple split train/test
  - Comprendre les pièges courants de l'évaluation d'un modèle
  - Comprendre les enjeux de la mise en production d'un modèle de machine learning
---

## Introduction

Ce dernier chapitre referme le cours en détaillant rigoureusement comment évaluer un modèle avant de le déployer — une étape trop souvent bâclée alors qu'elle conditionne la fiabilité de toute décision fondée sur ce modèle, en particulier en cybersécurité, où un modèle mal évalué peut laisser passer de véritables menaces.

## Au-delà du simple split train/test

<CehCallout>
Rappel du cours Data Science Complète (chapitre 6) : diviser les données en un ensemble d'entraînement et un ensemble de test est la base de toute évaluation — mais un unique split dépend fortement du hasard de cette division, une seule "mauvaise" répartition pouvant fausser l'évaluation.
</CehCallout>

<Steps steps={[
  { title: "Diviser les données en k parties (folds)", description: "Par exemple, k=5 : les données sont divisées en 5 parties égales." },
  { title: "Entraîner et évaluer k fois", description: "À chaque itération, une partie sert de test et les k-1 autres d'entraînement — répété k fois, chaque partie servant une fois de test." },
  { title: "Moyenner les résultats", description: "La performance finale est la moyenne des k évaluations, une estimation bien plus fiable qu'un split unique." },
]} />

<TipCallout>
Cette validation croisée en k-plis (k-fold cross-validation) est particulièrement précieuse sur des jeux de données de taille limitée, où chaque split unique gaspillerait des données potentiellement informatives en les excluant définitivement de l'entraînement.
</TipCallout>

## Les pièges courants de l'évaluation

<WarningCallout>
La fuite de données (data leakage) survient quand des informations de l'ensemble de test s'infiltrent, même indirectement, dans l'entraînement — par exemple, normaliser l'ensemble des données (calculer moyenne et écart-type) avant de les diviser en train/test, ce qui donne au modèle une connaissance implicite de la distribution des données de test.
</WarningCallout>

<CompareTable
  titleA="Piège d'évaluation"
  titleB="Conséquence"
  rows={[
    { a: "Fuite de données (normalisation avant le split)", b: "Performance surestimée à l'évaluation, dégradée en production" },
    { a: "Jeu de données déséquilibré non pris en compte", b: "Un modèle prédisant toujours la classe majoritaire semble performant en exactitude alors qu'il est inutile" },
    { a: "Évaluer uniquement sur les données d'entraînement", b: "Aucune indication de la capacité de généralisation du modèle" },
]}
/>

<CehCallout>
Rappel du cours Data Science Complète (chapitre 6, précision et rappel) : sur un jeu de données déséquilibré — typique en cybersécurité, où les attaques réelles représentent une infime minorité du trafic — l'exactitude seule est trompeuse ; le rappel (ne pas manquer d'attaques réelles) et la précision (limiter les fausses alertes) doivent être examinés ensemble.
</CehCallout>

## Mettre un modèle en production

<Steps steps={[
  { title: "Sérialiser le modèle entraîné", description: "Le modèle final, une fois entraîné et validé, est sauvegardé dans un format réutilisable sans réentraînement." },
  { title: "Exposer le modèle via une interface stable", description: "Une API ou un service dédié permet à d'autres systèmes d'obtenir des prédictions sans connaître les détails internes du modèle." },
  { title: "Surveiller la dérive du modèle", description: "Les données réelles évoluent avec le temps (concept drift) — un modèle performant à son déploiement peut se dégrader progressivement si son environnement change." },
  { title: "Réentraîner périodiquement", description: "Un modèle en production doit être réévalué et réentraîné régulièrement sur des données récentes pour rester pertinent." },
]} />

<WarningCallout>
La dérive de concept (concept drift) est particulièrement critique en cybersécurité : les techniques d'attaque évoluent constamment, un modèle de détection entraîné sur des attaques d'il y a un an peut manquer des variantes plus récentes — rappel du principe de veille et de mise à jour continue déjà souligné au cours Analyse SOC.
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Identifier une fuite de données", description: "Une équipe normalise l'intégralité de son jeu de données avant de le diviser en train/test. Pourquoi cela biaise-t-il l'évaluation finale du modèle ?" },
  { title: "Choisir la bonne métrique", description: "Pour un modèle de détection d'intrusion où manquer une attaque réelle est bien plus coûteux qu'une fausse alerte, faut-il privilégier la précision ou le rappel ? Justifie." },
]} />

## En résumé

- La validation croisée en k-plis donne une estimation plus fiable de la performance d'un modèle qu'un simple split train/test unique.
- La fuite de données et les jeux de données déséquilibrés sont deux pièges fréquents qui faussent l'évaluation apparente d'un modèle.
- Un modèle en production doit être surveillé pour détecter une dérive de concept et réentraîné périodiquement pour rester pertinent.

## Questions de Révision

1. Pourquoi la validation croisée en k-plis donne-t-elle une estimation plus fiable qu'un split train/test unique ?
2. Qu'est-ce que la fuite de données (data leakage), et comment peut-elle fausser une évaluation ?
3. Pourquoi la dérive de concept est-elle particulièrement critique pour un modèle de détection d'intrusion ?

Félicitations, tu viens de terminer le cours **Machine Learning** ! Tu maîtrises désormais en profondeur les algorithmes fondamentaux — régression, arbres et méthodes d'ensemble, SVM, k-NN, clustering et réduction de dimension — ainsi que leur évaluation rigoureuse. Continue vers **Deep Learning** pour découvrir les réseaux de neurones et les architectures qui ont transformé l'intelligence artificielle moderne.
