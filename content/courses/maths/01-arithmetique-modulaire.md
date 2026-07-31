---
title: Arithmétique modulaire
chapter: 1
course: maths
difficulty: beginner
duration: 30
tags: [maths, arithmetique, modulo]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Comprendre l'opération modulo et ses propriétés
  - Réaliser des additions et multiplications modulaires
  - Comprendre pourquoi l'arithmétique modulaire fonde RSA
---

## Introduction

Ce cours de mathématiques appliquées n'a pas vocation à être théorique pour lui-même — chaque notion introduite sert directement des concepts déjà rencontrés ou à venir dans les cours de cybersécurité, à commencer par la cryptographie. L'arithmétique modulaire est LA notion mathématique la plus directement utile pour comprendre RSA, vu au chapitre 3 du cours Cryptographie Avancée.

## L'opération modulo

<CehCallout>
Le modulo (noté mod ou %) donne le reste d'une division entière. 17 mod 5 = 2, car 17 = 3×5 + 2. C'est une notion que tu utilises déjà sans le savoir : une horloge de 12 heures fonctionne en arithmétique modulo 12 — après 12, on revient à 1.
</CehCallout>

```text
Exemples :
17 mod 5 = 2   (17 = 3×5 + 2)
23 mod 7 = 2   (23 = 3×7 + 2)
100 mod 12 = 4 (100 = 8×12 + 4)
```

<Steps steps={[
  { title: "Addition modulaire", description: "(a + b) mod n = ((a mod n) + (b mod n)) mod n — on peut réduire modulo n à chaque étape sans changer le résultat final." },
  { title: "Multiplication modulaire", description: "(a × b) mod n = ((a mod n) × (b mod n)) mod n — même principe, très utile pour manipuler de très grands nombres." },
  { title: "Exponentiation modulaire", description: "Calculer a^b mod n sans jamais calculer a^b en entier (qui serait astronomiquement grand) — la clé du fonctionnement pratique de RSA." },
]} />

## Pourquoi l'exponentiation modulaire est cruciale en cryptographie

<WarningCallout>
Calculer 2^1000 directement produit un nombre de plus de 300 chiffres — totalement impraticable à manipuler pour chaque opération de chiffrement RSA (qui utilise des exposants et modules de plusieurs centaines de chiffres). L'exponentiation modulaire rapide permet de calculer a^b mod n en réduisant le résultat modulo n à chaque étape intermédiaire, gardant les nombres manipulés toujours de taille raisonnable.
</WarningCallout>

<TipCallout>
C'est exactement cette propriété qui rend RSA praticable : chiffrer et déchiffrer un message revient à calculer une exponentiation modulaire (message^exposant mod module) — une opération que même un smartphone modeste réalise en quelques millisecondes, alors que les nombres en jeu (le module RSA) font plusieurs centaines de chiffres.
</TipCallout>

## L'inverse modulaire

<Steps steps={[
  { title: "Le problème", description: "Trouver un nombre x tel que (a × x) mod n = 1 — l'équivalent modulaire de l'inverse d'un nombre (comme 5 et 1/5 en arithmétique classique)." },
  { title: "Condition d'existence", description: "Un inverse modulaire de a existe si et seulement si a et n sont premiers entre eux (leur PGCD vaut 1)." },
  { title: "Utilité en cryptographie", description: "Le calcul de la clé privée RSA à partir de la clé publique repose directement sur le calcul d'un inverse modulaire." },
]} />

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (calculs à la main ou calculatrice)

<Steps steps={[
  { title: "Calculer des modulos", description: "Calcule : 29 mod 6, 100 mod 9, et 15 mod 15. Que remarques-tu pour ce dernier cas ?" },
  { title: "Vérifier une propriété modulaire", description: "Vérifie que (7 + 9) mod 5 donne le même résultat que ((7 mod 5) + (9 mod 5)) mod 5." },
]} />

## En résumé

- Le modulo donne le reste d'une division entière, et fonctionne de façon cyclique (comme une horloge).
- L'addition et la multiplication modulaires peuvent être réduites à chaque étape sans changer le résultat final.
- L'exponentiation modulaire rapide est ce qui rend RSA praticable, en évitant de manipuler des nombres astronomiquement grands.

## Questions de Révision

1. Que donne 23 mod 7, et comment le calculer étape par étape ?
2. Pourquoi ne peut-on pas simplement calculer a^b puis appliquer le modulo à la fin en cryptographie RSA ?
3. À quelle condition un nombre a possède-t-il un inverse modulaire par rapport à n ?
