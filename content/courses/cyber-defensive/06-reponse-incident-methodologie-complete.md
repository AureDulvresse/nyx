---
title: Réponse à incident — méthodologie complète
chapter: 6
course: cyber-defensive
difficulty: advanced
duration: 40
tags: [reponse-incident, methodologie, synthese]
ceh_modules: ["Module 1 - Introduction to Ethical Hacking"]
objectives:
  - Réunir en synthèse la méthodologie de réponse à incident du parcours Nyx
  - Mener une réponse complète de la détection à la clôture
  - Comprendre la coordination entre SOC, DFIR et direction
---

## Introduction

Ce chapitre réunit, dans une méthodologie de réponse à incident complète, les compétences déjà détaillées séparément aux cours Analyse SOC (playbooks, chapitre 6) et Forensics & DFIR (investigation complète, chapitres 1 à 8).

## Une méthodologie de réponse à incident réunie

```mermaid
graph LR
    A[Détection - SIEM/EDR, ch.5] --> B[Triage SOC - cours Analyse SOC]
    B --> C[Confinement immédiat - playbook, ch.6 SOC]
    C --> D[Investigation approfondie - cours DFIR]
    D --> E[Éradication et remédiation]
    E --> F[Retour d'expérience - post-mortem]
```

<CehCallout>
Rappel du cours Forensics & DFIR (chapitre 1) : confinement, éradication et remédiation sont trois temporalités distinctes — le confinement stoppe la propagation immédiatement, l'éradication supprime la cause, la remédiation corrige durablement pour éviter la récidive.
</CehCallout>

## La coordination entre équipes

<CompareTable
  titleA="Équipe"
  titleB="Rôle dans la réponse"
  rows={[
    { a: "SOC (cours Analyse SOC)", b: "Détection initiale, triage, premier confinement selon playbook" },
    { a: "DFIR (cours Forensics & DFIR)", b: "Investigation approfondie, détermination de l'étendue réelle de la compromission" },
    { a: "Direction / RSSI", b: "Décisions à fort impact (communication, obligations légales), rappel du cours Droit et Réglementation" },
    { a: "Équipes techniques (Administration Systèmes et Réseaux)", b: "Exécution technique de la remédiation (durcissement, correctifs)" },
]}
/>

## Les obligations légales pendant la réponse

<WarningCallout>
Rappel du cours Droit et Réglementation (chapitre 2) : une violation de données personnelles déclenche une obligation de notification à l'autorité de contrôle sous 72 heures — cette contrainte légale doit être intégrée dès le début de la réponse à incident, pas traitée comme une préoccupation secondaire une fois l'aspect technique résolu.
</WarningCallout>

<Steps steps={[
  { title: "Évaluer rapidement si des données personnelles sont concernées", description: "Cette évaluation précoce détermine si l'horloge des 72 heures RGPD a commencé à courir." },
  { title: "Documenter en parallèle de l'investigation technique", description: "Rappel du cours Rédaction de Rapports (chapitre 4) : la documentation ne peut pas attendre la fin de l'investigation complète si une échéance légale est en jeu." },
  { title: "Impliquer le juridique dès le début, pas à la fin", description: "Une décision de communication ou de notification prise sans consultation juridique préalable peut aggraver l'exposition légale de l'organisation." },
]} />

## Clôturer une réponse à incident

<CehCallout>
Rappel du cours Forensics & DFIR (chapitre 8) : une réponse à incident se clôture par un retour d'expérience qui interroge non seulement "comment corriger la faille exploitée" mais surtout "pourquoi n'avons-nous pas détecté l'incident plus tôt" — cette seconde question, souvent négligée, est celle qui améliore réellement la posture de détection pour l'avenir.
</CehCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Retracer une réponse complète", description: "Pour un incident de compte compromis détecté par le SIEM (rappel du cours Analyse SOC, chapitre 5), retrace les étapes de confinement, investigation, éradication et remédiation, en précisant quelle équipe intervient à chaque étape." },
  { title: "Identifier une obligation légale déclenchée", description: "Un incident de ransomware a chiffré une base de données clients sans preuve d'exfiltration. Quelle obligation légale doit être évaluée en priorité, et sous quel délai ?" },
]} />

## En résumé

- Une réponse à incident complète enchaîne détection, triage, confinement, investigation approfondie, éradication, remédiation et retour d'expérience.
- SOC, DFIR, direction/RSSI et équipes techniques doivent coordonner leurs rôles respectifs tout au long de la réponse.
- Les obligations légales (notification RGPD sous 72h) doivent être évaluées dès le début de la réponse, pas une fois l'aspect technique entièrement résolu.

## Questions de Révision

1. Quelle est la différence entre confinement, éradication et remédiation dans une réponse à incident ?
2. Pourquoi le juridique doit-il être impliqué dès le début d'une réponse à incident plutôt qu'à la fin ?
3. Quelle question de retour d'expérience est souvent négligée, alors qu'elle améliore réellement la détection future ?
