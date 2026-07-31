---
title: Attaques cryptographiques classiques
chapter: 6
course: cryptographie
difficulty: advanced
duration: 40
tags: [cryptographie, cryptanalyse, attaques]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Distinguer les grandes familles d'attaques cryptographiques
  - Comprendre le principe d'une attaque par force brute et par dictionnaire
  - Reconnaître les attaques par canal auxiliaire (side-channel)
---

## Introduction

Ce chapitre dresse un panorama des attaques cryptographiques les plus courantes — non pas pour apprendre à "casser" la cryptographie (les algorithmes standards vus aux chapitres 2 et 3 résistent à ces attaques quand correctement implémentés), mais pour comprendre où se situent réellement les failles exploitables en pratique.

## Attaques par force brute et par dictionnaire

<CompareTable
  titleA="Force brute"
  titleB="Attaque par dictionnaire"
  rows={[
    { a: "Teste TOUTES les combinaisons possibles d'une clé/mot de passe", b: "Teste une liste de mots de passe probables (dictionnaire, rockyou.txt...)" },
    { a: "Exhaustif mais très lent pour des clés longues", b: "Rapide mais limité aux mots de passe présents dans la liste" },
    { a: "Reste théoriquement toujours possible, question de temps", b: "Échoue totalement si le mot de passe n'est pas dans le dictionnaire" },
]}
/>

<CehCallout>
Une clé AES-256 correctement générée rend la force brute totalement impraticable avec les moyens de calcul actuels et prévisibles — même avec tous les supercalculateurs de la planète, le temps nécessaire dépasse largement l'âge de l'univers. C'est pourquoi les attaquants ciblent presque toujours l'implémentation ou les mots de passe humains, pas l'algorithme lui-même.
</CehCallout>

## Attaques par canal auxiliaire (side-channel)

<WarningCallout>
Une attaque par canal auxiliaire ne s'attaque pas aux mathématiques de l'algorithme, mais à sa mise en œuvre physique : temps d'exécution, consommation électrique, émissions électromagnétiques peuvent involontairement révéler des informations sur la clé secrète manipulée, même si l'algorithme lui-même est parfaitement sûr sur le papier.
</WarningCallout>

<Steps steps={[
  { title: "Attaque temporelle (timing attack)", description: "Mesurer les variations infimes de temps de calcul selon la valeur de la clé traitée, pour en déduire progressivement des informations sur celle-ci." },
  { title: "Analyse de consommation électrique (power analysis)", description: "Utilisée notamment contre des cartes à puce, en analysant les variations de courant pendant une opération cryptographique." },
  { title: "Émissions électromagnétiques", description: "Certains équipements émettent des signaux électromagnétiques exploitables à distance, révélant indirectement des données traitées." },
]} />

<CehCallout>
Les implémentations cryptographiques modernes intègrent des contre-mesures spécifiques contre le timing (temps d'exécution constant quelle que soit la valeur traitée) — c'est une des raisons pour lesquelles il ne faut jamais implémenter soi-même un algorithme cryptographique, même en suivant scrupuleusement la spécification mathématique.
</CehCallout>

## Attaques par rejeu (replay attacks)

<Steps steps={[
  { title: "Interception d'un message chiffré légitime", description: "Un attaquant capture un message chiffré valide, par exemple une requête d'authentification." },
  { title: "Renvoi du message intercepté", description: "Le même message est renvoyé tel quel, sans que l'attaquant ait besoin de le déchiffrer." },
  { title: "Le système traite le message comme une nouvelle requête légitime", description: "Si aucune protection n'existe, le système accepte la requête rejouée comme si elle était nouvelle." },
]} />

<TipCallout>
Les contre-mesures classiques contre le rejeu incluent l'ajout d'un horodatage vérifié, d'un numéro de séquence croissant, ou d'un nonce (nombre utilisé une seule fois) — un message chiffré identique renvoyé plus tard doit être détectable et rejeté par le destinataire.
</TipCallout>

## Attaque de l'homme du milieu (Man-in-the-Middle)

<CompareTable
  titleA="Sans PKI (vulnérable au MITM)"
  titleB="Avec PKI et vérification de certificat (chapitre 5)"
  rows={[
    { a: "Un attaquant peut s'interposer et présenter sa propre clé publique", b: "Le certificat signé permet de détecter une clé publique frauduleuse" },
    { a: "Les deux parties croient communiquer directement l'une avec l'autre", b: "La chaîne de confiance vérifie l'identité du correspondant réel" },
]}
/>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Choisir la bonne défense", description: "Un service d'authentification accepte deux fois le même jeton chiffré envoyé à quelques minutes d'intervalle sans le rejeter. Quel type d'attaque cela permet-il, et quelle contre-mesure proposerais-tu ?" },
  { title: "Expliquer une attaque par canal auxiliaire", description: "Pourquoi un algorithme cryptographique mathématiquement parfait peut-il rester vulnérable en pratique via une attaque temporelle ?" },
]} />

## En résumé

- La force brute contre un algorithme moderne correctement configuré (AES-256) est impraticable ; les attaquants ciblent l'implémentation ou les mots de passe humains.
- Les attaques par canal auxiliaire exploitent la mise en œuvre physique (temps, consommation électrique) plutôt que les mathématiques de l'algorithme.
- Les attaques par rejeu et de l'homme du milieu se contrent respectivement par des nonces/horodatages et par une PKI correctement vérifiée.

## Questions de Révision

1. Pourquoi la force brute contre une clé AES-256 correctement générée est-elle considérée comme impraticable aujourd'hui ?
2. Qu'est-ce qu'une attaque par canal auxiliaire, et en quoi diffère-t-elle d'une cryptanalyse mathématique classique ?
3. Quelles contre-mesures permettent de se protéger contre une attaque par rejeu ?
