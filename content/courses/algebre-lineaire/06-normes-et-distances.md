---
title: Normes et distances entre vecteurs
chapter: 6
course: algebre-lineaire
difficulty: intermediate
duration: 30
tags: [algebre-lineaire, normes, distances, similarite]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Comprendre les principales normes vectorielles (L1, L2)
  - Calculer une distance euclidienne et une similarité cosinus
  - Relier ces notions à la détection d'anomalies et la classification
---

## Introduction

Ce chapitre approfondit une notion introduite au chapitre 1 (la norme d'un vecteur) et l'étend à la comparaison entre vecteurs — une opération omniprésente dès qu'on veut savoir si deux données (deux emails, deux comportements réseau, deux documents) se ressemblent.

## Les normes vectorielles courantes

<CompareTable
  titleA="Norme"
  titleB="Calcul et usage"
  rows={[
    { a: "Norme L1 (Manhattan)", b: "Somme des valeurs absolues des composantes — mesure une distance 'en escalier', comme se déplacer dans une ville en grille" },
    { a: "Norme L2 (Euclidienne)", b: "Racine carrée de la somme des carrés — la distance 'à vol d'oiseau', la plus intuitive" },
]}
/>

```text
Pour le vecteur v = [3, -4] :

Norme L1 = |3| + |-4| = 7
Norme L2 = √(3² + 4²) = √25 = 5
```

<TipCallout>
La norme L2 correspond exactement au théorème de Pythagore généralisé — c'est la distance la plus intuitive et la plus utilisée par défaut, mais la norme L1 est parfois préférée car elle est moins sensible aux valeurs extrêmes (outliers) dans certains contextes d'analyse de données.
</TipCallout>

## La distance euclidienne entre deux vecteurs

<CehCallout>
La distance entre deux vecteurs (deux points dans l'espace des caractéristiques) se calcule comme la norme de leur différence : distance(A, B) = norme(A - B). C'est le principe de base de nombreux algorithmes de classification, comme celui des k plus proches voisins (k-NN), qui classe une nouvelle donnée selon les données les plus "proches" déjà connues.
</CehCallout>

## La similarité cosinus — une mesure différente

<WarningCallout>
La distance euclidienne peut être trompeuse pour comparer des documents textes : deux documents de longueurs très différentes mais traitant du même sujet peuvent avoir une grande distance euclidienne, alors que leurs vecteurs "pointent" dans la même direction — c'est précisément ce que mesure la similarité cosinus, insensible à la magnitude des vecteurs.
</WarningCallout>

```text
Similarité cosinus entre A et B :

similarité = (A · B) / (norme(A) × norme(B))

Résultat entre -1 (opposés) et 1 (identiques en direction),
0 signifiant une absence de relation (vecteurs orthogonaux).
```

<CehCallout>
La similarité cosinus est directement utilisée en recherche d'information et en détection de plagiat : deux documents représentés par leurs fréquences de mots (vecteurs à plusieurs milliers de dimensions) sont jugés similaires si leur similarité cosinus est proche de 1, indépendamment de leur longueur respective.
</CehCallout>

## Choisir la bonne mesure selon le contexte

<CompareTable
  titleA="Contexte"
  titleB="Mesure recommandée"
  rows={[
    { a: "Comparer des positions géographiques ou des valeurs numériques brutes", b: "Distance euclidienne (norme L2)" },
    { a: "Comparer des documents texte de longueurs variables", b: "Similarité cosinus" },
    { a: "Détecter des anomalies robustes aux valeurs extrêmes", b: "Norme L1 (Manhattan)" },
]}
/>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (calculs à la main)

<Steps steps={[
  { title: "Calculer une distance euclidienne", description: "Calcule la distance euclidienne entre les vecteurs [1, 2] et [4, 6]." },
  { title: "Choisir la bonne mesure", description: "Pour comparer deux mails de tailles très différentes selon la fréquence des mots qu'ils contiennent, la distance euclidienne ou la similarité cosinus serait-elle plus adaptée ? Justifie." },
]} />

## En résumé

- Les normes L1 et L2 mesurent la "longueur" d'un vecteur de façons différentes, chacune adaptée à des contextes différents.
- La distance euclidienne entre deux vecteurs est la norme de leur différence, base de nombreux algorithmes de classification.
- La similarité cosinus mesure l'orientation plutôt que la magnitude des vecteurs, plus adaptée à la comparaison de documents de longueurs variables.

## Questions de Révision

1. Quelle est la différence entre la norme L1 et la norme L2 ?
2. Comment calcule-t-on la distance euclidienne entre deux vecteurs ?
3. Pourquoi la similarité cosinus est-elle préférée à la distance euclidienne pour comparer des documents de longueurs très différentes ?
