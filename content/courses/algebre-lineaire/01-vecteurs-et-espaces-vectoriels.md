---
title: Vecteurs et espaces vectoriels
chapter: 1
course: algebre-lineaire
difficulty: beginner
duration: 30
tags: [algebre-lineaire, vecteurs, fondamentaux]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Comprendre ce qu'est un vecteur au-delà de la simple flèche géométrique
  - Réaliser les opérations de base sur les vecteurs (addition, produit scalaire)
  - Comprendre pourquoi les données sont naturellement représentées comme des vecteurs
---

## Introduction

L'algèbre linéaire est le socle mathématique de la data science et du machine learning, deux domaines abordés dans les cours suivants de cette roadmap. Ce premier chapitre repart d'une notion familière — le vecteur — pour la reconnecter à un usage très concret : représenter des données.

## Un vecteur n'est pas qu'une flèche

<CehCallout>
En physique, un vecteur est une flèche avec une direction et une magnitude. En data science et en cybersécurité, un vecteur est simplement une liste ordonnée de nombres — par exemple, les caractéristiques d'un email (nombre de liens, présence de pièces jointes, longueur du texte) peuvent former un vecteur à 3 dimensions, exploité par un modèle de détection de phishing.
</CehCallout>

```text
Exemple : représenter un email comme un vecteur

Email = [nombre_liens, taille_ko, contient_piece_jointe]
Email_suspect = [15, 2, 1]
Email_normal   = [2, 45, 0]
```

## Opérations de base sur les vecteurs

<Steps steps={[
  { title: "Addition de vecteurs", description: "Additionner composante par composante : [1,2] + [3,4] = [4,6]." },
  { title: "Multiplication par un scalaire", description: "Multiplier chaque composante par un même nombre : 2 × [1,2] = [2,4]." },
  { title: "Produit scalaire (dot product)", description: "Multiplier les composantes correspondantes puis sommer : [1,2]·[3,4] = 1×3 + 2×4 = 11." },
  { title: "Norme (longueur) d'un vecteur", description: "Racine carrée de la somme des carrés des composantes — généralise le théorème de Pythagore à n dimensions." },
]} />

<TipCallout>
Le produit scalaire mesure à quel point deux vecteurs "pointent dans la même direction" — un produit scalaire élevé (relativement aux normes des vecteurs) indique une forte similarité, un principe directement utilisé pour comparer des documents ou des comportements réseau dans les cours Data Science et IA & Cybersécurité.
</TipCallout>

## Espace vectoriel — le cadre qui contient les vecteurs

<CehCallout>
Un espace vectoriel est simplement l'ensemble de tous les vecteurs possibles d'une certaine dimension, muni des opérations d'addition et de multiplication par un scalaire — l'ensemble des emails représentés par 3 caractéristiques numériques forme un espace vectoriel de dimension 3, que l'on peut se représenter comme un espace à 3 axes.
</CehCallout>

<CompareTable
  titleA="Dimension"
  titleB="Exemple concret"
  rows={[
    { a: "2D", b: "Un point sur un graphique (x, y)" },
    { a: "3D", b: "Un email représenté par 3 caractéristiques" },
    { a: "N-D (des centaines/milliers)", b: "Un document texte représenté par la fréquence de chaque mot du vocabulaire" },
]}
/>

<WarningCallout>
Au-delà de 3 dimensions, il devient impossible de visualiser directement un vecteur — mais les mêmes opérations mathématiques (addition, produit scalaire, norme) restent parfaitement valables et calculables, même pour des vecteurs à plusieurs milliers de dimensions comme ceux utilisés en traitement du langage naturel.
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (calculs à la main)

<Steps steps={[
  { title: "Calculer un produit scalaire", description: "Calcule le produit scalaire de [2, 3, 1] et [1, 0, 4]." },
  { title: "Représenter une donnée en vecteur", description: "Propose un vecteur à 4 dimensions pour représenter une tentative de connexion réseau (par exemple : port, taille du paquet, protocole, heure)." },
]} />

## En résumé

- Un vecteur est une liste ordonnée de nombres, pas seulement une flèche géométrique — c'est la façon la plus naturelle de représenter des données.
- L'addition, la multiplication par un scalaire et le produit scalaire sont les opérations de base sur les vecteurs.
- Un espace vectoriel contient tous les vecteurs d'une dimension donnée ; au-delà de 3 dimensions, on ne peut plus le visualiser mais les calculs restent valables.

## Questions de Révision

1. Pourquoi un email peut-il être représenté comme un vecteur ?
2. Calcule le produit scalaire de [1, 1, 1] et [2, 2, 2].
3. Pourquoi peut-on continuer à faire des calculs sur des vecteurs à 1000 dimensions même s'ils ne sont pas visualisables ?
