---
title: Réglementations sectorielles et internationales
chapter: 6
course: droit-cybersecurite
difficulty: advanced
duration: 30
tags: [droit, nis2, dora, reglementation]
ceh_modules: ["Module 1 - Introduction to Ethical Hacking"]
objectives:
  - Situer NIS2 et DORA parmi les réglementations européennes récentes
  - Comprendre la notion d'entité "essentielle" et "importante" au sens NIS2
  - Identifier les enjeux propres aux réglementations sectorielles hors Europe
---

## Introduction

Ce dernier chapitre referme le cours en élargissant le regard au-delà du RGPD (chapitre 2) : l'Union Européenne a considérablement étoffé son arsenal réglementaire en cybersécurité ces dernières années, avec des textes qui imposent directement des obligations de sécurité technique — pas seulement de protection des données personnelles.

## NIS2 — la cybersécurité des infrastructures critiques et au-delà

La directive **NIS2** (Network and Information Security 2, transposée en droit national depuis 2024) étend considérablement le périmètre de son prédécesseur NIS1, en couvrant désormais des secteurs bien plus larges que la seule infrastructure critique historique.

<CompareTable
  titleA="Entités essentielles"
  titleB="Entités importantes"
  rows={[
    { a: "Énergie, transport, santé, eau, infrastructures numériques", b: "Services postaux, gestion des déchets, fabrication de dispositifs médicaux..." },
    { a: "Supervision proactive par les autorités", b: "Supervision réactive (après incident signalé)" },
    { a: "Sanctions pouvant atteindre 10M€ ou 2% du CA mondial", b: "Sanctions pouvant atteindre 7M€ ou 1,4% du CA mondial" },
]}
/>

<LegalCallout>
NIS2 introduit une nouveauté significative : la responsabilité personnelle des organes de direction. Les dirigeants d'une entité concernée peuvent être tenus personnellement responsables du défaut de mise en œuvre des mesures de gestion des risques cybersécurité — ce n'est plus seulement l'entreprise qui est exposée, mais ses décideurs individuellement.
</LegalCallout>

<Steps steps={[
  { title: "Analyse de risque obligatoire", description: "Identifier et documenter les risques pesant sur les systèmes d'information de l'entité." },
  { title: "Mesures techniques et organisationnelles", description: "Proportionnées au risque : chiffrement, gestion des accès, continuité d'activité." },
  { title: "Notification d'incident sous 24h", description: "Une alerte précoce à l'autorité compétente, puis un rapport complet sous 72h, plus un rapport final sous un mois." },
  { title: "Gestion de la chaîne d'approvisionnement", description: "Évaluer la sécurité de ses fournisseurs et sous-traitants critiques — une nouveauté majeure par rapport à NIS1." },
]} />

## DORA — la résilience numérique du secteur financier

**DORA (Digital Operational Resilience Act)**, applicable depuis janvier 2025, cible spécifiquement le secteur financier européen (banques, assurances, sociétés d'investissement) avec une exigence de résilience opérationnelle numérique plus poussée encore que NIS2.

<CompareTable
  titleA="Pilier DORA"
  titleB="Contenu"
  rows={[
    { a: "Gestion des risques TIC", b: "Cadre de gouvernance des risques liés aux technologies de l'information" },
    { a: "Gestion des incidents", b: "Classification, notification et suivi des incidents TIC majeurs" },
    { a: "Tests de résilience", b: "Tests de pénétration basés sur la menace (TLPT) obligatoires pour les entités les plus critiques" },
    { a: "Risque lié aux tiers", b: "Surveillance stricte des prestataires TIC critiques (cloud, SaaS)" },
]}
/>

<CehCallout>
Le TLPT (Threat-Led Penetration Testing) imposé par DORA n'est pas un simple pentest classique : il simule une attaque avancée et ciblée (souvent inspirée de groupes APT réels) sur les fonctions critiques d'une institution financière, encadré par un cadre méthodologique européen strict (TIBER-EU).
</CehCallout>

## Un aperçu des réglementations hors Europe

<CompareTable
  titleA="Réglementation"
  titleB="Périmètre"
  rows={[
    { a: "HIPAA (États-Unis)", b: "Protection des données de santé, obligations de sécurité pour les acteurs du système de santé" },
    { a: "CCPA/CPRA (Californie)", b: "Droits des consommateurs sur leurs données personnelles, proche du RGPD dans son esprit" },
    { a: "PIPL (Chine)", b: "Protection des informations personnelles, avec des règles strictes de localisation des données" },
    { a: "LGPD (Brésil)", b: "Fortement inspirée du RGPD européen" },
]}
/>

<TipCallout>
Une organisation opérant à l'international doit souvent se conformer simultanément à plusieurs de ces textes — la stratégie la plus courante consiste à appliquer le standard le plus exigeant (souvent le RGPD) comme socle commun, puis à ajouter les obligations spécifiques de chaque juridiction par-dessus.
</TipCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Qualifier une entité NIS2", description: "Un hôpital public et un fabricant de dispositifs médicaux sont-ils concernés par NIS2 ? Si oui, dans quelle catégorie (essentielle/importante) et pourquoi cette distinction compte ?" },
  { title: "Comparer pentest classique et TLPT", description: "En quoi un TLPT imposé par DORA diffère-t-il d'un pentest de sécurité web classique tel qu'étudié dans le cours Sécurité Web ?" },
]} />

## En résumé

- NIS2 élargit fortement le périmètre des entités soumises à des obligations de cybersécurité et engage la responsabilité personnelle des dirigeants.
- DORA impose au secteur financier une résilience numérique renforcée, incluant des tests de pénétration avancés (TLPT).
- De nombreuses réglementations hors Europe (HIPAA, CCPA, PIPL, LGPD) s'inspirent largement du RGPD tout en ajoutant des spécificités sectorielles ou nationales.

## Questions de Révision

1. Quelle nouveauté majeure NIS2 introduit-il concernant la responsabilité des dirigeants ?
2. Quel secteur DORA cible-t-il spécifiquement, et quel type de test avancé impose-t-il ?
3. Cite deux réglementations hors Europe et le texte européen dont elles s'inspirent le plus souvent.

Félicitations, tu viens de terminer le cours **Droit et Réglementation de la Cybersécurité** ! Ce socle juridique s'applique à chaque mission que tu mèneras — reviens-y dès qu'un doute se présente sur l'autorisation, la preuve ou la conformité.
