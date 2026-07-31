---
title: Investigation d'une alerte — de la détection à la conclusion
chapter: 5
course: soc-analysis
difficulty: advanced
duration: 40
tags: [soc, investigation, methodologie]
ceh_modules: ["Module 1 - Introduction to Ethical Hacking"]
objectives:
  - Mener une investigation structurée d'une alerte escaladée
  - Distinguer les sources de preuve mobilisables et leur ordre d'examen
  - Conclure une investigation de façon rigoureuse et documentée
---

## Introduction

Ce chapitre s'adresse au travail d'un analyste N2 : une fois une alerte escaladée par le triage N1 (chapitre 2), comment mener une investigation complète, rigoureuse, jusqu'à une conclusion justifiée ?

## Une méthodologie d'investigation structurée

<Steps steps={[
  { title: "Reformuler l'hypothèse à vérifier", description: "Rappel du cours Forensics & DFIR (chapitre 1) : une investigation part d'une hypothèse à confirmer ou réfuter, jamais d'une conclusion déjà décidée." },
  { title: "Rassembler les preuves disponibles", description: "Logs SIEM, captures réseau (cours DFIR, chapitre 6), artefacts disque si nécessaire (cours DFIR, chapitre 4)." },
  { title: "Corroborer par plusieurs sources indépendantes", description: "Rappel du principe de corroboration du cours DFIR : ne jamais se fier à une seule source de preuve pour une conclusion importante." },
  { title: "Documenter la chronologie complète", description: "Construire une timeline claire des événements (rappel du cours DFIR, chapitre 5)." },
  { title: "Conclure et recommander", description: "Formuler une conclusion claire (faux positif, incident confirmé, ampleur) et des actions concrètes." },
]} />

## Ordre d'examen des sources de preuve

<CehCallout>
Rappel du principe de l'ordre de volatilité (cours Forensics & DFIR, chapitre 1) : en investigation SOC également, examiner d'abord les sources les plus éphémères (connexions actives, mémoire d'un processus suspect encore en cours) avant les sources plus stables (logs archivés, disque), pour ne pas perdre d'information qui disparaîtrait entre-temps.
</CehCallout>

<CompareTable
  titleA="Source de preuve"
  titleB="Ce qu'elle confirme ou infirme"
  rows={[
    { a: "Logs SIEM corrélés (chapitre 3)", b: "La séquence d'événements ayant déclenché l'alerte" },
    { a: "Historique de connexion de l'utilisateur", b: "Si le comportement est cohérent avec son activité habituelle" },
    { a: "Réputation de l'IP/domaine impliqué", b: "Si la source est déjà documentée comme malveillante" },
    { a: "Capture réseau en direct si l'activité est en cours", b: "La nature exacte du trafic échangé au moment présent" },
]}
/>

## Distinguer investigation et enquête définitive

<WarningCallout>
Une investigation SOC de premier niveau n'a pas toujours vocation à établir une certitude absolue — elle vise à décider rapidement d'une action proportionnée (confinement, escalade vers une enquête DFIR complète, clôture) ; une investigation DFIR complète (cours Forensics & DFIR) intervient ensuite si l'ampleur de l'incident le justifie, avec des exigences de preuve plus strictes.
</WarningCallout>

## Conclure de façon rigoureuse

```text
Exemple de conclusion d'investigation SOC :

FAIT ÉTABLI : Le compte j.martin s'est connecté depuis une IP
en Roumanie à 03:14 UTC, un pays et un horaire jamais observés
pour ce compte sur les 90 derniers jours (vérifié via l'historique
de connexion).

HYPOTHÈSE CONFIRMÉE : Compromission probable du compte, action
immédiate recommandée : réinitialisation du mot de passe,
révocation des sessions actives, escalade vers l'équipe DFIR
pour investigation de l'étendue de l'accès obtenu.
```

<CehCallout>
Rappel direct du cours Forensics & DFIR (chapitre 8) : une conclusion d'investigation SOC doit elle aussi distinguer explicitement les faits établis des hypothèses, même sous la pression du temps qui caractérise souvent le travail SOC.
</CehCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Ordonner les sources de preuve", description: "Pour une alerte impliquant un processus suspect toujours en cours d'exécution ET des logs archivés d'il y a une semaine, dans quel ordre examinerais-tu ces deux sources, et pourquoi ?" },
  { title: "Rédiger une conclusion rigoureuse", description: "À partir des faits suivants, rédige une conclusion distinguant fait établi et hypothèse : un compte s'est connecté à 2h du matin depuis une IP inhabituelle, puis a accédé à un partage de fichiers sensibles jamais consulté auparavant par ce compte." },
]} />

## En résumé

- Une investigation SOC part d'une hypothèse à vérifier, rassemble des preuves corroborées par plusieurs sources, et conclut par une chronologie claire.
- L'ordre d'examen des preuves suit le principe de volatilité : les sources les plus éphémères d'abord.
- Une conclusion rigoureuse distingue toujours les faits établis des hypothèses, même sous la pression du temps caractéristique du travail SOC.

## Questions de Révision

1. Pourquoi une investigation doit-elle toujours partir d'une hypothèse à vérifier plutôt que d'une conclusion déjà décidée ?
2. Pourquoi faut-il examiner en priorité les sources de preuve les plus éphémères ?
3. Quelle est la différence entre une investigation SOC de premier niveau et une enquête DFIR complète ?
