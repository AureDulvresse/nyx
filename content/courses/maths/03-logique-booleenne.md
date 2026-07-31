---
title: Logique booléenne
chapter: 3
course: maths
difficulty: beginner
duration: 25
tags: [maths, logique, booleen]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Maîtriser les opérateurs logiques de base (ET, OU, NON, XOR)
  - Construire et lire une table de vérité
  - Comprendre le rôle du XOR en cryptographie
---

## Introduction

La logique booléenne est le langage sous-jacent à tout ce qui est numérique — des règles de pare-feu vues au cours Réseaux aux requêtes de recherche du Cheatsheet Nyx, en passant par un usage cryptographique central : le XOR.

## Les opérateurs logiques de base

<CompareTable
  titleA="Opérateur"
  titleB="Signification"
  rows={[
    { a: "ET (AND)", b: "Vrai seulement si les deux conditions sont vraies" },
    { a: "OU (OR)", b: "Vrai si au moins une des deux conditions est vraie" },
    { a: "NON (NOT)", b: "Inverse la valeur — vrai devient faux et inversement" },
    { a: "XOR (OU exclusif)", b: "Vrai si les deux valeurs sont DIFFÉRENTES l'une de l'autre" },
]}
/>

## Tables de vérité

```text
Table de vérité du ET (AND) :
A=0 B=0 → 0
A=0 B=1 → 0
A=1 B=0 → 0
A=1 B=1 → 1

Table de vérité du XOR :
A=0 B=0 → 0
A=0 B=1 → 1
A=1 B=0 → 1
A=1 B=1 → 0
```

<TipCallout>
Une règle de pare-feu combinant plusieurs conditions ("source = IP interne ET destination = port 443") utilise directement l'opérateur ET — comprendre la logique booléenne rend la lecture de règles complexes (pare-feu, requêtes SIEM) beaucoup plus naturelle.
</TipCallout>

## Le XOR — l'opérateur préféré de la cryptographie

<CehCallout>
Le XOR possède une propriété remarquable et centrale en cryptographie : appliqué deux fois avec la même clé, il annule son propre effet — (message XOR clé) XOR clé = message original. C'est le principe du chiffrement de Vernam (masque jetable), la seule méthode de chiffrement mathématiquement prouvée incassable si la clé est aussi longue que le message et utilisée une seule fois.
</CehCallout>

```text
Exemple simplifié de chiffrement par XOR (en binaire) :

Message : 1010
Clé     : 0110
Chiffré = Message XOR Clé = 1100

Pour déchiffrer :
Chiffré XOR Clé = 1100 XOR 0110 = 1010 = Message original
```

<WarningCallout>
Réutiliser la même clé pour chiffrer deux messages différents avec un simple XOR est une erreur catastrophique : en combinant les deux textes chiffrés par XOR, la clé s'annule et révèle une relation directe entre les deux messages clairs, souvent suffisante pour les retrouver entièrement — c'est précisément pourquoi le masque jetable exige une clé à usage unique.
</WarningCallout>

## Combiner les opérateurs — l'algèbre de Boole

<Steps steps={[
  { title: "Lois de De Morgan", description: "NON(A ET B) = (NON A) OU (NON B) — permet de réécrire des conditions complexes sous une forme équivalente plus lisible." },
  { title: "Priorité des opérateurs", description: "Comme en arithmétique, NON s'applique avant ET, qui s'applique avant OU — les parenthèses lèvent toute ambiguïté." },
  { title: "Application aux règles de sécurité", description: "Une règle de détection SIEM combine souvent plusieurs conditions booléennes pour réduire les faux positifs." },
]} />

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (calculs à la main)

<Steps steps={[
  { title: "Construire une table de vérité", description: "Construis la table de vérité complète de l'opérateur OU (OR) pour A et B." },
  { title: "Appliquer un XOR binaire", description: "Calcule 1011 XOR 0101, puis vérifie qu'en appliquant à nouveau XOR avec 0101 tu retrouves bien 1011." },
]} />

## En résumé

- Les opérateurs ET, OU, NON et XOR forment la base de la logique booléenne, utilisée dans les règles de pare-feu comme dans les requêtes SIEM.
- Le XOR a la propriété unique de s'annuler lorsqu'il est appliqué deux fois avec la même clé, ce qui en fait la base du chiffrement de Vernam.
- Réutiliser une clé XOR pour plusieurs messages est une erreur catastrophique qui peut révéler le contenu des messages chiffrés.

## Questions de Révision

1. Quelle est la différence entre OU (OR) et XOR (OU exclusif) ?
2. Pourquoi (message XOR clé) XOR clé redonne-t-il le message original ?
3. Pourquoi réutiliser la même clé pour chiffrer deux messages différents avec un simple XOR est-il dangereux ?
