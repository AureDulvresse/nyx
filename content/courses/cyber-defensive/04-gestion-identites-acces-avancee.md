---
title: Gestion des identités et des accès en profondeur
chapter: 4
course: cyber-defensive
difficulty: advanced
duration: 35
tags: [iam, mfa, privileged-access]
ceh_modules: ["Module 1 - Introduction to Ethical Hacking"]
objectives:
  - Approfondir l'IAM vu au cours Administration Systèmes et Réseaux
  - Comprendre la gestion des accès à privilèges (PAM)
  - Relier chaque mesure IAM à un vecteur d'attaque étudié
---

## Introduction

Ce chapitre approfondit la gestion des identités et des accès (IAM) déjà introduite au cours Administration Systèmes et Réseaux (chapitre 7), en se concentrant sur les comptes à privilèges élevés — la cible la plus recherchée dans une chaîne d'attaque Active Directory (cours Cybersécurité Offensive, chapitre 7).

## Rappel — le principe du moindre privilège en pratique défensive

<CehCallout>
Rappel du cours Administration Systèmes et Réseaux (chapitre 7) : le principe du moindre privilège reste l'un des plus violés en pratique — un compte de service disposant de droits d'Administrateur du domaine pour une tâche qui n'en nécessite qu'une infime partie constitue précisément le type de cible privilégiée par le Kerberoasting étudié au cours Active Directory & Windows.
</CehCallout>

## La gestion des accès à privilèges (PAM)

<Steps steps={[
  { title: "Inventorier tous les comptes à privilèges", description: "Un compte à privilèges oublié ou non documenté ne peut pas être correctement protégé." },
  { title: "Limiter la durée des privilèges élevés", description: "L'élévation de privilège temporaire (Just-In-Time), accordée uniquement pour la durée d'une tâche précise, réduit la fenêtre d'exposition par rapport à un accès permanent." },
  { title: "Isoler les postes d'administration", description: "Un administrateur ne devrait jamais utiliser le même poste pour naviguer sur Internet et pour administrer des systèmes critiques — rappel du modèle de tiering (cours Active Directory, chapitre 8)." },
  { title: "Faire tourner régulièrement les mots de passe à privilèges", description: "Rappel du cours Active Directory & Windows : LAPS (Local Administrator Password Solution) automatise cette rotation pour les comptes administrateurs locaux." },
]} />

<CehCallout>
Rappel direct du cours Active Directory & Windows (chapitre 8) : le modèle de tiering et LAPS sont deux mesures de durcissement spécifiquement conçues pour contrer le Pass-the-Hash et le mouvement latéral étudiés côté offensif — chaque mesure PAM répond à une technique d'attaque précise, pas à une menace abstraite.
</CehCallout>

## L'authentification multifacteur, rappel et approfondissement

<CompareTable
  titleA="Rappel (cours Administration Systèmes et Réseaux, ch.7)"
  titleB="Application défensive avancée"
  rows={[
    { a: "MFA par SMS vulnérable au SIM swapping", b: "Privilégier les clés FIDO2 pour tous les comptes à privilèges élevés, sans exception" },
    { a: "MFA à la connexion initiale", b: "MFA également ré-exigé pour toute action sensible (changement de mot de passe, élévation temporaire)" },
]}
/>

<WarningCallout>
Un MFA appliqué uniquement à la connexion initiale, mais jamais aux actions sensibles ultérieures (changement de configuration critique, accès à des données très sensibles), laisse une fenêtre d'exploitation à un attaquant ayant compromis une session déjà authentifiée — un principe qui rejoint le Zero Trust du chapitre 3 : vérifier à chaque action sensible, pas seulement à l'entrée.
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Identifier un compte à risque", description: "Un compte de service dispose des droits d'Administrateur du domaine pour une tâche de sauvegarde qui ne nécessite qu'un accès en lecture à un dossier partagé. Quelle mesure PAM corrigerait directement ce risque ?" },
  { title: "Relier une mesure à une technique offensive", description: "En quoi LAPS (rotation automatique des mots de passe administrateur locaux) contre-t-il directement le Pass-the-Hash étudié au cours Active Directory & Windows ?" },
]} />

## En résumé

- La gestion des accès à privilèges (PAM) inventorie, limite dans le temps et isole les comptes et postes à privilèges élevés.
- Le modèle de tiering et LAPS, déjà vus au cours Active Directory & Windows, contrent directement le Pass-the-Hash et le mouvement latéral.
- Le MFA doit s'appliquer non seulement à la connexion initiale, mais aussi aux actions sensibles ultérieures, dans l'esprit du Zero Trust.

## Questions de Révision

1. Pourquoi l'élévation de privilège Just-In-Time réduit-elle le risque par rapport à un accès permanent ?
2. Comment le modèle de tiering et LAPS contrent-ils directement le Pass-the-Hash ?
3. Pourquoi le MFA ne devrait-il pas s'appliquer uniquement à la connexion initiale ?
