---
title: Threat hunting — la recherche proactive de menaces
chapter: 7
course: soc-analysis
difficulty: advanced
duration: 35
tags: [soc, threat-hunting, proactif]
ceh_modules: ["Module 1 - Introduction to Ethical Hacking"]
objectives:
  - Comprendre ce qui distingue le threat hunting de la détection réactive
  - Formuler une hypothèse de chasse exploitable
  - Utiliser MITRE ATT&CK comme guide de recherche proactive
---

## Introduction

Ce chapitre couvre l'activité la plus avancée du travail SOC, typiquement associée au niveau N3 (chapitre 1) : le threat hunting, ou recherche proactive de menaces qui n'ont déclenché aucune alerte existante.

## Threat hunting vs détection réactive

<CompareTable
  titleA="Détection réactive (chapitres 2-3)"
  titleB="Threat hunting"
  rows={[
    { a: "Attend qu'une règle de détection se déclenche", b: "Cherche activement des signes de compromission, sans attendre d'alerte" },
    { a: "Limité aux motifs déjà anticipés par une règle", b: "Peut révéler des menaces qui échappent complètement aux règles existantes" },
    { a: "Processus largement automatisable", b: "Processus fondamentalement exploratoire, guidé par l'expertise humaine" },
]}
/>

<CehCallout>
Le threat hunting part d'un principe simple mais puissant : "supposons qu'un attaquant soit déjà présent dans le système sans avoir déclenché aucune alerte — quels indices chercherais-je pour le confirmer ou l'infirmer ?" Une posture fondamentalement différente de l'attente passive d'une alerte.
</CehCallout>

## Formuler une hypothèse de chasse

<Steps steps={[
  { title: "Partir d'une technique MITRE ATT&CK (chapitre 4) précise", description: "Ex : 'Un attaquant pourrait utiliser des tâches planifiées pour maintenir sa persistance (technique T1053)'." },
  { title: "Déterminer quelles données permettraient de vérifier cette hypothèse", description: "Quels logs, quelles sources de données révéleraient la présence (ou l'absence) de ce comportement ?" },
  { title: "Rechercher activement, sans attendre d'alerte", description: "Interroger directement les données disponibles à la recherche du motif suspecté, même en l'absence de toute alerte préexistante." },
  { title: "Documenter le résultat, positif ou négatif", description: "Une chasse qui ne trouve rien reste une information précieuse : elle confirme (avec les limites des données disponibles) l'absence de ce vecteur d'attaque spécifique." },
]} />

<TipCallout>
Une hypothèse de chasse bien formulée est spécifique et vérifiable — "chercher des tâches planifiées créées récemment par des comptes qui n'en créent habituellement jamais" est actionnable, contrairement à "chercher des activités suspectes" qui ne l'est pas, un principe qui rejoint directement la rigueur de formulation vue au cours Rédaction de Rapports.
</TipCallout>

## Exemple concret de chasse

```text
Hypothèse : Un attaquant pourrait avoir établi une persistance via
une tâche planifiée sur un serveur critique (technique MITRE ATT&CK T1053).

Recherche : Interroger les logs de création de tâches planifiées
(Event ID 4698 sur Windows) des 30 derniers jours, filtrés sur les
serveurs critiques, en excluant les comptes de service connus créant
légitimement des tâches planifiées.

Résultat : Une tâche planifiée créée par un compte utilisateur standard
(jamais observé créant de tâche auparavant), exécutant un script
PowerShell encodé en Base64 (rappel du cours Forensics & DFIR, ch.3,
sur l'obfuscation PowerShell) — investigation approfondie déclenchée.
```

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Formuler une hypothèse de chasse", description: "En t'appuyant sur une technique MITRE ATT&CK de ton choix (vue au chapitre 4), formule une hypothèse de chasse spécifique et vérifiable." },
  { title: "Justifier la valeur d'un résultat négatif", description: "Pourquoi une chasse qui ne trouve aucun signe de compromission reste-t-elle une information utile pour l'organisation, plutôt qu'un simple 'rien à signaler' ?" },
]} />

## En résumé

- Le threat hunting cherche activement des signes de compromission sans attendre qu'une règle de détection existante se déclenche.
- Une hypothèse de chasse doit être spécifique et vérifiable, souvent formulée à partir d'une technique MITRE ATT&CK précise.
- Un résultat négatif de chasse reste une information précieuse, confirmant l'absence (dans les limites des données disponibles) d'un vecteur d'attaque spécifique.

## Questions de Révision

1. Quelle est la différence fondamentale entre le threat hunting et la détection réactive ?
2. Pourquoi une hypothèse de chasse doit-elle être spécifique et vérifiable plutôt que vague ?
3. Pourquoi un résultat négatif de chasse (rien trouvé) reste-t-il une information utile ?
