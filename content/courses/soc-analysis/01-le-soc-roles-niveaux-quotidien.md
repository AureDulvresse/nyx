---
title: Le SOC — rôles, niveaux et quotidien d'un analyste
chapter: 1
course: soc-analysis
difficulty: beginner
duration: 30
tags: [soc, roles, organisation]
ceh_modules: ["Module 1 - Introduction to Ethical Hacking"]
objectives:
  - Comprendre la mission d'un SOC (Security Operations Center)
  - Distinguer les niveaux d'analystes SOC (N1, N2, N3)
  - Comprendre le quotidien réel d'un analyste SOC niveau 1
---

## Introduction

Ce cours couvre le métier d'analyste SOC (Security Operations Center) — celui qui reçoit et traite au quotidien les alertes générées par les systèmes de détection déjà étudiés (cours Data Science Complète, IA & Agents en Cybersécurité). C'est souvent le premier poste occupé par un débutant en cybersécurité défensive.

## La mission d'un SOC

<CehCallout>
Un SOC (Security Operations Center) est l'équipe et l'infrastructure chargées de surveiller en continu (souvent 24h/24, 7j/7) l'ensemble du système d'information d'une organisation, pour détecter, analyser et répondre aux incidents de sécurité le plus rapidement possible.
</CehCallout>

```mermaid
graph LR
    A[Sources de logs] --> B[SIEM - corrélation]
    B --> C[Alertes générées]
    C --> D[Analyste SOC N1 - triage]
    D -->|Escalade si nécessaire| E[Analyste SOC N2/N3 - investigation approfondie]
```

## Les niveaux d'analystes SOC

<CompareTable
  titleA="Niveau"
  titleB="Rôle typique"
  rows={[
    { a: "Analyste N1", b: "Triage initial des alertes, application de procédures documentées, escalade des cas ambigus ou critiques" },
    { a: "Analyste N2", b: "Investigation approfondie des cas escaladés, corrélation de plusieurs sources, décisions de confinement" },
    { a: "Analyste N3 / Threat Hunter", b: "Recherche proactive de menaces non détectées, amélioration des règles de détection, réponse aux incidents majeurs" },
]}
/>

<TipCallout>
La progression N1 → N2 → N3 rejoint directement le système de progression de Nyx (Novice → Apprenti → Intermédiaire) : le N1 applique des procédures documentées, le N2 développe un jugement d'investigation autonome, le N3 anticipe des menaces avant même qu'une alerte ne se déclenche.
</TipCallout>

## Le quotidien réel d'un analyste SOC N1

<Steps steps={[
  { title: "Prise de poste et passation", description: "Consulter les incidents en cours et les alertes non résolues de l'équipe précédente." },
  { title: "Triage de la file d'alertes", description: "Examiner chaque nouvelle alerte selon une procédure documentée (approfondi au chapitre 2)." },
  { title: "Documentation systématique", description: "Chaque alerte traitée, même bénigne, doit être documentée avec la décision prise et sa justification." },
  { title: "Escalade des cas ambigus", description: "Transmettre à un analyste N2 les alertes qui dépassent le cadre des procédures documentées." },
]} />

<WarningCallout>
Le volume d'alertes traité quotidiennement par un analyste N1 peut être considérable — souvent des centaines par jour dans une organisation de taille moyenne à grande — un contexte qui rend la fatigue d'alerte (vue au cours Administration Systèmes et Réseaux, chapitre 6) un risque professionnel réel, pas une simple abstraction théorique.
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Classer une tâche par niveau", description: "Classe ces tâches par niveau d'analyste (N1, N2, N3) : appliquer une procédure documentée pour une alerte de connexion échouée, rechercher proactivement des signes de compromission non détectés, corréler trois sources de logs pour confirmer une intrusion." },
  { title: "Identifier un risque du quotidien N1", description: "Pourquoi un volume élevé d'alertes quotidiennes peut-il constituer un risque de sécurité en soi, au-delà de la simple charge de travail ?" },
]} />

## En résumé

- Un SOC surveille en continu le système d'information d'une organisation pour détecter, analyser et répondre aux incidents.
- Les analystes N1, N2 et N3 ont des rôles progressivement plus autonomes, du triage documenté à la recherche proactive de menaces.
- Le quotidien d'un analyste N1 combine triage à haut volume, documentation systématique et escalade des cas ambigus.

## Questions de Révision

1. Quelle est la mission principale d'un SOC ?
2. Quelle est la différence de rôle entre un analyste N1 et un analyste N3 ?
3. Pourquoi le volume élevé d'alertes quotidiennes constitue-t-il un risque de sécurité en soi ?
