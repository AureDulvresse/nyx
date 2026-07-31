---
title: Nombres premiers, PGCD et algorithme d'Euclide
chapter: 2
course: maths
difficulty: beginner
duration: 30
tags: [maths, nombres-premiers, pgcd, euclide]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Comprendre ce qu'est un nombre premier et pourquoi ils sont centraux en crypto
  - Calculer un PGCD avec l'algorithme d'Euclide
  - Comprendre le lien entre PGCD et sécurité RSA
---

## Introduction

Les nombres premiers ne sont pas qu'une curiosité mathématique — ils sont au cœur de la sécurité de RSA (chapitre 3 du cours Cryptographie Avancée), dont la robustesse repose entièrement sur la difficulté de factoriser un grand nombre en ses facteurs premiers.

## Qu'est-ce qu'un nombre premier

<CehCallout>
Un nombre premier est un entier supérieur à 1 qui n'a que deux diviseurs : 1 et lui-même. RSA choisit deux très grands nombres premiers (plusieurs centaines de chiffres) et les multiplie pour former le module utilisé dans les clés — la sécurité du système repose sur le fait que retrouver ces deux facteurs à partir du seul produit est extrêmement coûteux en calcul.
</CehCallout>

```text
Nombres premiers : 2, 3, 5, 7, 11, 13, 17, 19, 23...
Nombres non premiers (composés) : 4 (2×2), 6 (2×3), 9 (3×3), 15 (3×5)...
```

<TipCallout>
Le crible d'Ératosthène, une méthode simple vieille de plus de 2000 ans, reste la façon la plus intuitive de trouver tous les nombres premiers jusqu'à une certaine limite : éliminer progressivement tous les multiples de chaque nombre premier trouvé.
</TipCallout>

## Le PGCD — plus grand commun diviseur

<Steps steps={[
  { title: "Définition", description: "Le PGCD de deux nombres est le plus grand nombre qui divise exactement les deux." },
  { title: "Nombres premiers entre eux", description: "Deux nombres sont premiers entre eux si leur PGCD vaut 1 — condition essentielle pour l'existence d'un inverse modulaire (chapitre 1)." },
]} />

## L'algorithme d'Euclide

<CehCallout>
L'algorithme d'Euclide, l'un des plus anciens algorithmes connus (environ 300 av. J.-C.), calcule le PGCD de deux nombres en un nombre d'étapes remarquablement faible, même pour de très grands nombres — c'est cette efficacité qui le rend utilisable en pratique dans les implémentations cryptographiques modernes.
</CehCallout>

```text
Calcul du PGCD(48, 18) par l'algorithme d'Euclide :

48 = 2×18 + 12   → PGCD(48,18) = PGCD(18,12)
18 = 1×12 + 6    → PGCD(18,12) = PGCD(12,6)
12 = 2×6 + 0     → reste 0, donc PGCD = 6

PGCD(48, 18) = 6
```

<Steps steps={[
  { title: "Diviser le plus grand par le plus petit", description: "Noter le reste de la division." },
  { title: "Répéter avec le diviseur et le reste", description: "Le diviseur précédent devient le nouveau dividende, le reste devient le nouveau diviseur." },
  { title: "S'arrêter quand le reste est 0", description: "Le dernier diviseur non nul est le PGCD recherché." },
]} />

## Le lien avec la sécurité RSA

<WarningCallout>
Rappel du chapitre 3 du cours Cryptographie Avancée : si deux clés RSA partagent accidentellement un même nombre premier (un risque réel documenté sur des équipements aux générateurs aléatoires faibles), calculer le PGCD des deux modules révèle instantanément ce facteur commun — cassant les deux clés en une opération d'algorithme d'Euclide qui prend une fraction de seconde, même sur des nombres de centaines de chiffres.
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (calculs à la main)

<Steps steps={[
  { title: "Calculer un PGCD", description: "Calcule PGCD(56, 98) en appliquant l'algorithme d'Euclide étape par étape." },
  { title: "Vérifier des nombres premiers entre eux", description: "35 et 12 sont-ils premiers entre eux ? Et 35 et 14 ? Justifie avec le PGCD." },
]} />

## En résumé

- Un nombre premier n'a que deux diviseurs : 1 et lui-même — RSA repose sur la difficulté de factoriser un produit de deux très grands nombres premiers.
- L'algorithme d'Euclide calcule le PGCD de deux nombres en un nombre d'étapes très réduit, même pour de grands nombres.
- Un PGCD non trivial entre deux modules RSA révèle un facteur premier partagé, cassant instantanément les deux clés concernées.

## Questions de Révision

1. Pourquoi RSA repose-t-il sur des nombres premiers plutôt que sur des nombres quelconques ?
2. Calcule PGCD(84, 30) en appliquant l'algorithme d'Euclide.
3. Pourquoi le calcul du PGCD entre deux modules RSA peut-il révéler une faille de génération de clés ?
