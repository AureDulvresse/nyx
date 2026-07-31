---
title: Durcissement des systèmes (synthèse pratique)
chapter: 2
course: cyber-defensive
difficulty: intermediate
duration: 35
tags: [durcissement, hardening, synthese]
ceh_modules: ["Module 1 - Introduction to Ethical Hacking"]
objectives:
  - Réutiliser en synthèse la checklist de durcissement déjà vue
  - Contrer directement les vecteurs d'attaque étudiés côté offensif
  - Prioriser les actions de durcissement selon le risque réel
---

## Introduction

Ce chapitre met en pratique, du point de vue défensif, le durcissement déjà détaillé au cours Administration Systèmes et Réseaux (chapitre 8) — en le reliant explicitement à chaque vecteur d'attaque étudié au cours Cybersécurité Offensive, pour comprendre précisément ce que chaque mesure contre concrètement.

## Contrer directement les vecteurs offensifs étudiés

<CompareTable
  titleA="Vecteur offensif (cours Cybersécurité Offensive)"
  titleB="Mesure de durcissement défensive"
  rows={[
    { a: "Binaires SUID exploitables (ch.6)", b: "Audit régulier des binaires SUID, suppression des droits non indispensables" },
    { a: "Services mal configurés Windows (ch.6)", b: "Vérification des permissions de service, principe du moindre privilège" },
    { a: "Énumération SMB anonyme (ch.3)", b: "Désactivation de l'accès anonyme, restriction de l'énumération" },
    { a: "Identifiants par défaut (ch.5)", b: "Changement systématique de toute configuration par défaut au déploiement" },
]}
/>

<CehCallout>
Ce tableau illustre le principe central de la défense en profondeur (chapitre 1) : chaque technique offensive étudiée en détail dans le parcours a une contre-mesure défensive précise et directe — comprendre l'attaque rend le durcissement bien plus ciblé qu'une checklist générique appliquée sans compréhension du "pourquoi".
</CehCallout>

## Prioriser le durcissement selon le risque réel

<Steps steps={[
  { title: "Identifier les vecteurs les plus probables", description: "Rappel du cours Analyse SOC (chapitre 4, MITRE ATT&CK) : cartographier les techniques les plus fréquentes pour son secteur d'activité." },
  { title: "Évaluer l'exposition réelle", description: "Un service exposé à Internet mérite une priorité de durcissement supérieure à un service interne isolé." },
  { title: "Traiter les systèmes legacy en priorité isolée", description: "Rappel du cours Administration Systèmes et Réseaux (chapitre 8) : un système non durcissable immédiatement doit être isolé et surveillé activement." },
]} />

<WarningCallout>
Un durcissement appliqué uniformément sans priorisation peut consommer un temps précieux sur des systèmes à faible risque, pendant qu'un système critique exposé reste vulnérable plus longtemps — la priorisation par risque réel (rappel du cours Data Science Complète, chapitre 7, sur l'évaluation) doit guider l'ordre des actions.
</WarningCallout>

## Les référentiels de durcissement — un point de départ, pas une fin

<TipCallout>
Rappel du cours Administration Systèmes et Réseaux (chapitre 8) : les CIS Benchmarks fournissent des checklists détaillées par système — un excellent point de départ, mais qui doit être adapté au contexte réel de l'organisation plutôt qu'appliqué mécaniquement sans compréhension des compromis fonctionnels que chaque règle implique.
</TipCallout>

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell)

<Steps steps={[
  { title: "Auditer les binaires SUID d'un système", description: "Rappel du TP privesc (cours Linux) : liste les binaires SUID d'un système et identifie ceux qui pourraient être retirés sans casser de fonctionnalité légitime.", code: 'find / -perm -4000 -type f 2>/dev/null' },
  { title: "Prioriser trois actions de durcissement", description: "Pour un serveur web exposé à Internet exécutant un service SSH avec authentification par mot de passe, un service SMB avec énumération anonyme active, et un compte administrateur au mot de passe par défaut, priorise l'ordre de durcissement de ces trois éléments." },
]} />

## En résumé

- Chaque technique offensive étudiée dans le parcours a une contre-mesure défensive précise, rendant le durcissement bien plus ciblé qu'une checklist générique.
- La priorisation du durcissement doit suivre l'exposition réelle et la probabilité des vecteurs d'attaque, pas un traitement uniforme.
- Les référentiels comme les CIS Benchmarks sont un point de départ à adapter, jamais une checklist à appliquer mécaniquement sans réflexion contextuelle.

## Questions de Révision

1. Quelle mesure de durcissement contre directement l'énumération SMB anonyme étudiée côté offensif ?
2. Pourquoi un durcissement uniforme sans priorisation peut-il laisser un système critique vulnérable plus longtemps que nécessaire ?
3. Pourquoi les CIS Benchmarks doivent-ils être adaptés au contexte plutôt qu'appliqués mécaniquement ?
