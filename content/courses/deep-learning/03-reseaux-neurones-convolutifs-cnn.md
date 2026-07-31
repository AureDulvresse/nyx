---
title: Réseaux de neurones convolutifs (CNN)
chapter: 3
course: deep-learning
difficulty: advanced
duration: 35
tags: [cnn, convolution, vision]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Comprendre pourquoi un réseau dense classique est mal adapté aux images
  - Comprendre le principe de la convolution
  - Comprendre le rôle du pooling
---

## Introduction

Ce chapitre présente les réseaux de neurones convolutifs (CNN), l'architecture qui a rendu possible les percées majeures en vision par ordinateur — reconnaissance d'objets, détection de visages, mais aussi analyse d'images forensiques ou détection de logos de phishing dans des captures d'écran.

## Pourquoi un réseau dense classique est mal adapté aux images

<WarningCallout>
Une image de taille modeste (par exemple 224x224 pixels en couleur) représente plus de 150 000 valeurs — connecter chaque pixel à chaque neurone d'une couche cachée dense (chapitre 2) produirait un nombre de poids explosif, et surtout ignorerait complètement la structure spatiale de l'image : deux pixels voisins sont bien plus liés que deux pixels éloignés.
</WarningCallout>

<CehCallout>
Les CNN exploitent cette structure spatiale : au lieu de connecter chaque pixel individuellement, ils appliquent de petits filtres qui se déplacent sur l'image, détectant des motifs locaux (contours, textures) indépendamment de leur position exacte dans l'image.
</CehCallout>

## La convolution

<Steps steps={[
  { title: "Définir un petit filtre (noyau)", description: "Une petite matrice de poids, par exemple 3x3, qui détecte un motif particulier (un contour vertical, par exemple)." },
  { title: "Faire glisser le filtre sur l'image", description: "Le filtre se déplace sur toute l'image, calculant à chaque position un produit scalaire entre le filtre et la portion d'image correspondante." },
  { title: "Produire une carte d'activation", description: "Le résultat de ce glissement est une nouvelle grille de valeurs (feature map) indiquant où le motif détecté par le filtre est présent dans l'image." },
]} />

```mermaid
graph LR
    A[Image d'entrée] --> B[Filtre glissant 3x3]
    B --> C[Carte d'activation - feature map]
    C --> D[Détecte où le motif apparaît dans l'image]
```

<TipCallout>
Le même filtre est réutilisé sur toute l'image (partage de poids) — un contour vertical est détecté de la même façon qu'il apparaisse en haut à gauche ou en bas à droite de l'image, ce qui réduit drastiquement le nombre de poids par rapport à un réseau dense classique, tout en rendant la détection invariante à la position.
</TipCallout>

## Les couches successives — de motifs simples à motifs complexes

<CehCallout>
Les premières couches convolutives d'un CNN détectent des motifs très simples (contours, coins) ; les couches suivantes combinent ces motifs simples pour détecter des formes plus complexes (yeux, roues), et les couches profondes détectent des concepts encore plus abstraits (visages, véhicules) — une hiérarchie de représentations de plus en plus abstraites, rappel du principe déjà évoqué au chapitre 2 pour les réseaux denses.
</CehCallout>

## Le pooling — réduire la dimension progressivement

<CehCallout>
Une couche de pooling (le plus souvent max-pooling) réduit la taille d'une carte d'activation en ne conservant que la valeur maximale sur de petites régions — cela réduit le volume de calcul des couches suivantes et rend la détection plus robuste à de petites variations de position du motif détecté.
</CehCallout>

<CompareTable
  titleA="Couche"
  titleB="Rôle"
  rows={[
    { a: "Convolution", b: "Détecte des motifs locaux via des filtres glissants" },
    { a: "Pooling (max-pooling)", b: "Réduit la dimension, conserve les activations les plus fortes" },
    { a: "Couche dense finale", b: "Combine les motifs détectés pour produire la classification finale (rappel chapitre 2)" },
]}
/>

<WarningCallout>
Rappel du cours Analyse SOC (chapitre 5, méfiance envers l'automatisation aveugle) : un CNN entraîné pour détecter des logos de phishing dans des captures d'écran reste vulnérable à des variantes visuelles jamais vues à l'entraînement — un modèle de vision n'est jamais infaillible et doit rester un outil d'aide à la décision, pas une autorité absolue.
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Expliquer le partage de poids", description: "Pourquoi réutiliser le même filtre sur toute l'image (au lieu d'un poids différent par pixel) réduit-il drastiquement le nombre de paramètres d'un CNN ?" },
  { title: "Relier la hiérarchie de couches à un cas concret", description: "Pour un CNN entraîné à reconnaître des visages, que détectent probablement ses premières couches, par opposition à ses couches les plus profondes ?" },
]} />

## En résumé

- Un réseau dense classique est mal adapté aux images car il ignore leur structure spatiale et produit un nombre de poids explosif.
- La convolution applique de petits filtres glissants qui détectent des motifs locaux, avec partage de poids sur toute l'image.
- Les couches successives d'un CNN détectent des motifs de plus en plus abstraits, tandis que le pooling réduit progressivement la dimension.

## Questions de Révision

1. Pourquoi un réseau dense classique est-il mal adapté au traitement direct d'images ?
2. Qu'est-ce qu'une carte d'activation (feature map), et comment est-elle produite ?
3. Quel est le rôle du pooling dans un réseau de neurones convolutif ?
