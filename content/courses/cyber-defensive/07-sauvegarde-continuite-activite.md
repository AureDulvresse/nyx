---
title: Sauvegarde et plan de continuité d'activité
chapter: 7
course: cyber-defensive
difficulty: intermediate
duration: 30
tags: [sauvegarde, continuite, resilience]
ceh_modules: ["Module 1 - Introduction to Ethical Hacking"]
objectives:
  - Réutiliser en contexte défensif la règle 3-2-1 déjà vue
  - Comprendre la résilience face à un scénario de ransomware
  - Tester la restauration comme discipline défensive à part entière
---

## Introduction

Ce chapitre remet en contexte la sauvegarde et la continuité d'activité, déjà détaillées au cours Administration Systèmes et Réseaux (chapitre 5), comme dernière ligne de défense face à un scénario que ni le durcissement ni la détection n'auraient réussi à empêcher.

## La sauvegarde comme dernière ligne de défense

<CehCallout>
Rappel du cours Administration Systèmes et Réseaux (chapitre 5) : dans le modèle de défense en profondeur (chapitre 1 de ce cours), la sauvegarde constitue la dernière couche — celle qui garantit la survie de l'organisation même si toutes les couches précédentes (périmètre, réseau, système, détection) ont échoué face à une attaque déterminée.
</CehCallout>

## Face au scénario ransomware

<WarningCallout>
Rappel du cours Administration Systèmes et Réseaux (chapitre 5) : un ransomware moderne cible spécifiquement les sauvegardes accessibles depuis le réseau compromis avant même de chiffrer les données de production — une sauvegarde immuable ou déconnectée (air-gapped) reste la seule protection réellement fiable contre ce scénario spécifique.
</WarningCallout>

<Steps steps={[
  { title: "Appliquer la règle 3-2-1", description: "Rappel du cours Administration Systèmes et Réseaux : 3 copies, 2 supports différents, 1 copie hors site." },
  { title: "Garantir l'immuabilité d'au moins une copie", description: "Une sauvegarde que même un compte administrateur compromis ne peut modifier ni supprimer." },
  { title: "Isoler physiquement ou logiquement une copie", description: "Une sauvegarde air-gapped, totalement déconnectée du réseau de production entre deux opérations de sauvegarde." },
]} />

## Tester la restauration — une discipline défensive à part entière

<CehCallout>
Rappel du cours Administration Systèmes et Réseaux (chapitre 5) : une sauvegarde jamais restaurée en test n'offre aucune garantie réelle — de nombreuses organisations découvrent une sauvegarde corrompue précisément au moment où elles en ont le plus besoin, pendant un incident réel.
</CehCallout>

<Steps steps={[
  { title: "Planifier des tests de restauration réguliers", description: "Comme n'importe quelle autre maintenance préventive (rappel du cours Administration Systèmes et Réseaux, chapitre 8)." },
  { title: "Mesurer le temps réel de restauration", description: "Le RTO théorique (rappel du cours Administration Systèmes et Réseaux, chapitre 5) doit être validé par un test réel, pas seulement estimé sur le papier." },
  { title: "Documenter la procédure de restauration complète", description: "Rappel du cours Rédaction de Rapports (chapitre 4) : un runbook de restauration précis, pas des instructions vagues à improviser en pleine crise." },
]} />

## Le plan de continuité d'activité (PCA) en complément

<CehCallout>
Rappel du cours Administration Systèmes et Réseaux (chapitre 5) : le PCA répond à la question "comment l'activité métier continue-t-elle PENDANT la restauration ?", distincte du PRA qui reconstruit l'infrastructure — un ransomware paralysant les systèmes de facturation pendant plusieurs jours nécessite un PCA définissant un mode dégradé, pas seulement un plan de restauration technique.
</CehCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Concevoir une stratégie anti-ransomware", description: "Pour une PME qui sauvegarde actuellement ses données chaque nuit sur un NAS accessible depuis le réseau interne, propose une amélioration concrète pour se protéger d'un ransomware." },
  { title: "Calculer un RPO et vérifier sa faisabilité", description: "Un service exige de ne jamais perdre plus de 4 heures de données. Quelle fréquence de sauvegarde minimale cela impose-t-il, et que faudrait-il tester pour garantir que cet objectif est réellement tenable ?" },
]} />

## En résumé

- La sauvegarde constitue la dernière ligne de défense, garantissant la survie de l'organisation même si toutes les couches précédentes ont échoué.
- Une sauvegarde immuable ou air-gapped reste la seule protection réellement fiable contre un ransomware ciblant activement les sauvegardes.
- Tester régulièrement la restauration, pas seulement planifier la sauvegarde, est une discipline défensive à part entière.

## Questions de Révision

1. Pourquoi la sauvegarde est-elle considérée comme la dernière couche de la défense en profondeur ?
2. Pourquoi une sauvegarde immuable ou air-gapped est-elle la seule protection fiable contre un ransomware moderne ?
3. Quelle est la différence entre PRA et PCA face à un incident de ransomware paralysant ?
