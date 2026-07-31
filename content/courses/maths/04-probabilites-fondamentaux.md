---
title: Probabilités — fondamentaux
chapter: 4
course: maths
difficulty: intermediate
duration: 30
tags: [maths, probabilites]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Calculer une probabilité simple et une probabilité combinée
  - Comprendre l'indépendance d'événements
  - Appliquer les probabilités à l'estimation de robustesse d'un mot de passe
---

## Introduction

Les probabilités permettent de quantifier objectivement des notions manipulées intuitivement en sécurité — "ce mot de passe est fort", "cette attaque a peu de chances de réussir". Ce chapitre pose les bases nécessaires pour rendre ces intuitions mesurables, en lien direct avec le cours Data Science.

## Probabilité d'un événement simple

<CehCallout>
La probabilité d'un événement se calcule comme le rapport entre le nombre de cas favorables et le nombre total de cas possibles. Deviner un chiffre entre 0 et 9 au hasard a une probabilité de 1/10 — c'est ce calcul, étendu à un espace de mots de passe bien plus vaste, qui permet d'estimer la résistance réelle d'un mot de passe à une attaque par force brute.
</CehCallout>

```text
Probabilité de deviner un code PIN à 4 chiffres au hasard :
Nombre de codes possibles = 10 × 10 × 10 × 10 = 10 000
Probabilité de succès en un essai = 1/10 000
```

## Événements indépendants

<Steps steps={[
  { title: "Définition", description: "Deux événements sont indépendants si la réalisation de l'un n'affecte pas la probabilité de l'autre." },
  { title: "Multiplication des probabilités", description: "Pour des événements indépendants, la probabilité qu'ils se réalisent tous deux est le produit de leurs probabilités individuelles." },
  { title: "Application aux mots de passe", description: "Chaque caractère d'un mot de passe généré aléatoirement est indépendant des autres — leurs probabilités se multiplient pour calculer l'espace total des possibilités." },
]} />

## Calculer la robustesse d'un mot de passe

<CompareTable
  titleA="Composition du mot de passe"
  titleB="Nombre de combinaisons possibles (espace de recherche)"
  rows={[
    { a: "4 chiffres (0-9)", b: "10^4 = 10 000" },
    { a: "8 caractères minuscules (26 lettres)", b: "26^8 ≈ 208 milliards" },
    { a: "8 caractères mixtes (minuscules, majuscules, chiffres, symboles ≈ 94 caractères)", b: "94^8 ≈ 6 milliards de milliards" },
]}
/>

<TipCallout>
Chaque caractère supplémentaire dans l'alphabet utilisé multiplie considérablement l'espace de recherche total — c'est pourquoi la diversité des caractères ET la longueur comptent autant l'une que l'autre dans la robustesse réelle d'un mot de passe, un principe directement lié aux TP Hydra et sqlmap déjà pratiqués sur Nyx.
</TipCallout>

<WarningCallout>
Ce calcul suppose un mot de passe véritablement aléatoire — en pratique, les mots de passe humains sont loin d'être aléatoires (mots du dictionnaire, dates, substitutions prévisibles comme "a" → "@"), ce qui réduit drastiquement l'espace de recherche réel exploité par les attaques par dictionnaire vues avec Hydra.
</WarningCallout>

## Probabilité conditionnelle — une intuition utile en détection

<CehCallout>
En détection d'intrusion, on s'intéresse souvent à une probabilité conditionnelle : sachant qu'une alerte s'est déclenchée, quelle est la probabilité qu'il s'agisse réellement d'une attaque (et non d'un faux positif) ? Cette question, centrale dans le cours Analyse SOC, dépend directement du taux de faux positifs de l'outil de détection utilisé.
</CehCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (calculs à la main)

<Steps steps={[
  { title: "Calculer un espace de recherche", description: "Calcule le nombre de combinaisons possibles pour un mot de passe de 6 caractères composé uniquement de chiffres (0-9)." },
  { title: "Comparer deux mots de passe", description: "Compare l'espace de recherche d'un mot de passe de 10 chiffres uniquement à celui d'un mot de passe de 6 caractères mixtes (alphabet de 94 caractères). Lequel est réellement plus robuste ?" },
]} />

## En résumé

- La probabilité d'un événement se calcule comme le rapport entre cas favorables et cas possibles.
- Pour des événements indépendants, les probabilités se multiplient — c'est ce qui permet de calculer l'espace de recherche d'un mot de passe.
- La longueur ET la diversité des caractères comptent toutes deux dans la robustesse réelle d'un mot de passe face à une attaque par force brute.

## Questions de Révision

1. Comment calcule-t-on la probabilité d'un événement simple ?
2. Pourquoi les probabilités se multiplient-elles pour des événements indépendants ?
3. Pourquoi un mot de passe "humain" (mot du dictionnaire avec substitutions prévisibles) est-il beaucoup moins robuste que son espace de recherche théorique ne le suggère ?
