---
title: RGPD et protection des données personnelles
chapter: 2
course: droit-cybersecurite
difficulty: intermediate
duration: 35
tags: [droit, rgpd, donnees-personnelles]
ceh_modules: ["Module 1 - Introduction to Ethical Hacking"]
objectives:
  - Comprendre les principes fondamentaux du RGPD applicables à la sécurité
  - Identifier les obligations en cas de violation de données (data breach)
  - Distinguer les rôles de responsable de traitement et sous-traitant
---

## Introduction

Le RGPD (Règlement Général sur la Protection des Données) est le texte européen qui structure le plus directement le travail quotidien d'un professionnel de la cybersécurité, bien au-delà du simple hacking éthique : il définit ce qui constitue une "violation de données", impose des délais de notification stricts, et façonne les priorités de tout SOC.

## Les principes fondamentaux du RGPD

<CompareTable
  titleA="Principe"
  titleB="Implication pour la sécurité"
  rows={[
    { a: "Minimisation des données", b: "Ne collecter/stocker que les données strictement nécessaires — réduit la surface d'exposition en cas de fuite" },
    { a: "Limitation de la conservation", b: "Supprimer les données au-delà de leur durée de rétention légale — un vieux backup oublié est un risque juridique" },
    { a: "Intégrité et confidentialité", b: "Obligation de sécurité 'appropriée au risque' — chiffrement, contrôle d'accès, journalisation" },
    { a: "Responsabilité (accountability)", b: "Le responsable de traitement doit pouvoir PROUVER sa conformité, pas juste l'affirmer" },
]}
/>

<TipCallout>
Le principe d'accountability explique pourquoi la documentation (registre des traitements, analyses d'impact, politiques de sécurité écrites) est elle-même une obligation RGPD — ce n'est pas un détail administratif, c'est la preuve exigée en cas de contrôle.
</TipCallout>

## Responsable de traitement vs sous-traitant

<CompareTable
  titleA="Responsable de traitement (Data Controller)"
  titleB="Sous-traitant (Data Processor)"
  rows={[
    { a: "Décide des finalités et moyens du traitement", b: "Traite les données selon les instructions du responsable" },
    { a: "Ex : une entreprise qui gère les données de ses clients", b: "Ex : un hébergeur cloud, un prestataire de support qui traite ces données pour elle" },
    { a: "Responsabilité principale en cas de violation", b: "Responsabilité contractuelle définie par un accord de sous-traitance (DPA)" },
]}
/>

<CehCallout>
Un cabinet de pentest qui reçoit un accès à une base de données de production dans le cadre d'un audit devient, le temps de la mission, un sous-traitant au sens du RGPD — ce qui impose un accord de sous-traitance (Data Processing Agreement) avant même le début du test.
</CehCallout>

## Violation de données — l'obligation de notification

Une "violation de données" (data breach) au sens RGPD couvre bien plus que le vol de données : toute atteinte à la confidentialité, l'intégrité OU la disponibilité de données personnelles compte, y compris un ransomware qui les rend indisponibles sans les exfiltrer.

<Steps steps={[
  { title: "Détection", description: "L'horloge légale démarre dès que le responsable de traitement a connaissance de la violation, pas au moment où elle a eu lieu." },
  { title: "Notification à l'autorité (CNIL en France)", description: "Délai maximal de 72 heures après la prise de connaissance, sauf si le risque pour les personnes est jugé peu probable." },
  { title: "Évaluation du risque pour les personnes", description: "Détermine si une notification aux personnes concernées elles-mêmes est également requise (risque élevé)." },
  { title: "Notification aux personnes concernées", description: "Si le risque est élevé (ex : mots de passe en clair, données de santé), sans délai injustifié, en langage clair." },
  { title: "Documentation interne", description: "Toute violation doit être documentée en interne, même celles non notifiées à l'autorité — exigence d'accountability." },
]} />

<WarningCallout>
Le délai de 72 heures est extrêmement court à l'échelle d'une investigation technique complète — c'est pourquoi les organisations notifient souvent à l'autorité avec les informations disponibles à ce stade, puis complètent la notification au fur et à mesure de l'investigation, plutôt que d'attendre d'avoir toutes les réponses.
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Qualifier une violation", description: "Un ransomware chiffre la base de données clients d'une entreprise sans preuve d'exfiltration. S'agit-il d'une violation de données au sens RGPD ? Justifie." },
  { title: "Déterminer les rôles", description: "Un cabinet de pentest reçoit temporairement un accès en lecture à une base de données de production pour les besoins d'un audit. Quel est son rôle au sens RGPD, et quel document faut-il signer avant le test ?" },
]} />

## En résumé

- Les principes RGPD (minimisation, limitation de conservation, intégrité/confidentialité, accountability) structurent directement les priorités de sécurité d'une organisation.
- Un pentester manipulant des données de production endosse le rôle de sous-traitant et doit signer un accord de sous-traitance.
- Une violation de données (atteinte à confidentialité, intégrité OU disponibilité) impose une notification à l'autorité sous 72 heures.

## Questions de Révision

1. Pourquoi un ransomware qui rend des données indisponibles, sans les exfiltrer, peut-il constituer une violation de données RGPD ?
2. Quel est le délai maximal de notification d'une violation de données à l'autorité de contrôle ?
3. Pourquoi un cabinet de pentest ayant accès à des données de production doit-il signer un accord de sous-traitance ?
