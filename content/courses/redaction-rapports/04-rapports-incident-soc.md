---
title: Rapports d'incident et documentation SOC
chapter: 4
course: redaction-rapports
difficulty: intermediate
duration: 35
tags: [redaction, incident, soc, runbook]
ceh_modules: ["Module 20 - Penetration Testing Fundamentals"]
objectives:
  - Structurer un rapport d'incident post-mortem
  - Rédiger un runbook SOC exploitable en pleine crise
  - Construire une timeline d'incident claire et datée
---

## Introduction

La rédaction en cybersécurité défensive obéit à des contraintes différentes de celle du pentest : elle doit souvent être produite dans l'urgence, sous pression, et servir à la fois d'outil opérationnel (pendant la crise) et de mémoire organisationnelle (après la crise). Ce chapitre couvre les deux familles de documents SOC : le rapport d'incident (post-mortem) et le runbook (opérationnel).

## Le rapport d'incident post-mortem

<Steps steps={[
  { title: "Résumé de l'incident", description: "Quoi, quand, impact en une phrase — lisible par un dirigeant en 30 secondes." },
  { title: "Timeline détaillée", description: "Chronologie horodatée de la détection à la remédiation, avec les actions entreprises à chaque étape." },
  { title: "Cause racine (root cause)", description: "Le mécanisme technique précis ayant permis l'incident — pas juste le symptôme observé." },
  { title: "Impact réel", description: "Systèmes touchés, données concernées, durée d'indisponibilité, éventuelle obligation de notification (CNIL, clients)." },
  { title: "Actions correctives", description: "Ce qui a été fait immédiatement (containment) et ce qui doit l'être à moyen terme (remédiation structurelle)." },
  { title: "Leçons apprises", description: "Ce que l'organisation change dans ses processus pour éviter la récidive — la section la plus souvent bâclée, pourtant la plus utile." },
]} />

<CehCallout>
Distingue toujours confinement (containment — arrêter la propagation), éradication (supprimer la cause), et remédiation (corriger durablement) dans la section actions — ce sont trois temporalités différentes de la réponse à incident, et les confondre rend le rapport confus sur ce qui a réellement été résolu.
</CehCallout>

## Construire une timeline lisible

```text
Exemple de timeline d'incident :

14:02 — Alerte SIEM : connexion admin depuis IP inhabituelle (Russie)
14:07 — Analyste SOC N1 confirme l'alerte, escalade vers N2
14:15 — N2 confirme une compromission du compte admin@societe.fr
14:18 — Décision : désactivation immédiate du compte (containment)
14:25 — Analyse des logs d'authentification des 72h précédentes lancée
15:40 — Identification du vecteur initial : phishing reçu le jour précédent à 09:12
16:10 — Réinitialisation de tous les mots de passe à privilèges élevés
18:00 — Incident déclaré clos (containment), investigation approfondie en cours
```

<TipCallout>
Toujours horodater en heure locale ET fuseau explicite (ou en UTC) — un incident impliquant plusieurs équipes ou pays sans fuseau clair génère des timelines incohérentes qui ralentissent l'investigation elle-même.
</TipCallout>

## Le runbook — documentation vivante pour l'urgence

Un runbook n'est pas un rapport : c'est une procédure opérationnelle, écrite pour être suivie sous pression, par quelqu'un qui n'a peut-être jamais géré ce type d'incident auparavant.

<CompareTable
  titleA="Rapport d'incident"
  titleB="Runbook"
  rows={[
    { a: "Écrit APRÈS l'incident", b: "Écrit et maintenu AVANT l'incident" },
    { a: "Décrit ce qui s'est passé", b: "Prescrit ce qu'il faut faire" },
    { a: "Figé une fois validé", b: "Mis à jour à chaque exercice ou incident réel" },
    { a: "Lu une fois, archivé", b: "Suivi étape par étape, en direct" },
  ]}
/>

<WarningCallout>
Un runbook rédigé avec des instructions vagues ("analyser la situation", "prendre les mesures appropriées") est inutilisable en pleine crise, quand la charge cognitive de l'analyste est déjà saturée — un bon runbook donne des commandes exactes, des seuils numériques précis, et des critères de décision binaires (si X alors Y).
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Rédiger une timeline", description: "À partir de ces événements en désordre, reconstruis une timeline horodatée cohérente : détection SIEM à 09:15, confirmation de compromission à 09:40, phishing initial reçu la veille à 08:00, isolement de la machine à 09:45." },
  { title: "Corriger un runbook vague", description: "Réécris cette instruction de runbook pour qu'elle soit actionnable : 'En cas d'alerte suspecte, analyser la situation et agir en conséquence.'" },
]} />

## En résumé

- Un rapport d'incident post-mortem comprend résumé, timeline, cause racine, impact, actions correctives et leçons apprises.
- Confinement, éradication et remédiation sont trois temporalités distinctes à ne pas confondre dans un rapport.
- Un runbook, contrairement au rapport, est un document vivant et prescriptif, écrit avant la crise pour être suivi pendant.

## Questions de Révision

1. Quelle est la différence entre confinement, éradication et remédiation ?
2. Pourquoi faut-il toujours horodater une timeline d'incident avec un fuseau explicite ?
3. En quoi un runbook diffère-t-il fondamentalement d'un rapport d'incident ?
