---
title: Le prétexting et l'usurpation d'identité
chapter: 4
course: psychologie
difficulty: advanced
duration: 35
tags: [psychologie, pretexting, usurpation]
ceh_modules: ["Module 9 - Social Engineering"]
objectives:
  - Comprendre le principe du prétexting
  - Étudier des scénarios courants d'usurpation d'identité
  - Comprendre le rôle du tailgating dans l'ingénierie sociale physique
---

## Introduction

Ce chapitre approfondit une technique d'ingénierie sociale plus élaborée que le simple email de phishing : le prétexting, qui consiste à construire un scénario complet et crédible pour justifier une demande, parfois soutenu sur plusieurs interactions successives.

## Le principe du prétexting

<CehCallout>
Le prétexting va au-delà d'un message ponctuel — l'attaquant construit une identité et un scénario cohérents (parfois vérifiables en apparence : faux badge, faux numéro de téléphone usurpé) pour justifier sa présence ou sa demande sur la durée, augmentant considérablement la crédibilité par rapport à un email isolé.
</CehCallout>

<Steps steps={[
  { title: "Construire une légende crédible", description: "Un rôle plausible dans le contexte de la cible : technicien de maintenance, nouvel employé, auditeur externe." },
  { title: "Préparer des éléments de preuve apparente", description: "Un faux badge, une tenue appropriée, une connaissance de détails internes collectés lors de la reconnaissance." },
  { title: "Maintenir la cohérence sur la durée", description: "Répondre de façon crédible aux questions de vérification, sans se contredire d'une interaction à l'autre." },
]} />

## Scénarios courants d'usurpation d'identité

<CompareTable
  titleA="Scénario"
  titleB="Objectif typique"
  rows={[
    { a: "Faux technicien informatique sur site", b: "Obtenir un accès physique à des postes ou équipements réseau" },
    { a: "Faux nouvel employé", b: "Exploiter la bienveillance naturelle envers un collègue récemment arrivé pour obtenir des accès ou informations" },
    { a: "Faux auditeur ou inspecteur", b: "Justifier des questions intrusives ou une demande d'accès à des documents sensibles" },
]}
/>

<WarningCallout>
Un prétexte efficace exploite souvent la réticence sociale à remettre en question l'autorité ou la légitimité apparente d'une personne, en particulier dans un contexte professionnel où la politesse et la coopération sont valorisées — un attaquant compte précisément sur cette réticence pour éviter d'être questionné.
</WarningCallout>

## Le tailgating — l'ingénierie sociale physique

<CehCallout>
Le tailgating (ou "piggybacking") consiste à suivre de près une personne autorisée pour franchir un accès physique sécurisé (porte à badge, sas d'entrée), en comptant sur la politesse naturelle qui pousse à tenir la porte pour quelqu'un plutôt que de la refermer sur lui.
</CehCallout>

```text
Exemple de tailgating :

Un attaquant, les bras chargés de cartons, se présente à l'entrée
d'un bâtiment sécurisé juste derrière un employé badgeant sa carte.
L'employé, par courtoisie, tient la porte — l'attaquant entre sans
jamais avoir eu besoin de badge lui-même.
```

<TipCallout>
Rappel du cours Administration Systèmes et Réseaux (chapitre 8, durcissement) : une politique stricte de "un badge, une personne" (chacun badge individuellement, même en groupe) contre le tailgating physique, tout comme une politique de moindre privilège contre les abus de droits numériques — le principe de durcissement s'applique tout autant à la sécurité physique.
</TipCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Construire un prétexte plausible (analyse défensive)", description: "Pour une entreprise de taille moyenne, quel prétexte serait le plus crédible pour un attaquant cherchant à obtenir un accès physique aux bureaux, et quelle contre-mesure simple limiterait ce risque ?" },
  { title: "Identifier une faille de tailgating", description: "Pourquoi la politesse naturelle (tenir une porte) constitue-t-elle une vulnérabilité de sécurité physique difficile à corriger par la seule sensibilisation ?" },
]} />

## En résumé

- Le prétexting construit un scénario complet et crédible, maintenu de façon cohérente, contrairement à un message ponctuel isolé.
- Les scénarios courants exploitent des rôles de confiance apparente (technicien, nouvel employé, auditeur) pour justifier une demande intrusive.
- Le tailgating exploite la politesse naturelle pour franchir un accès physique sécurisé sans authentification individuelle.

## Questions de Révision

1. En quoi le prétexting diffère-t-il d'un simple email de phishing ponctuel ?
2. Pourquoi un faux "nouvel employé" est-il un prétexte particulièrement efficace ?
3. Quelle politique organisationnelle simple limite le risque de tailgating ?
