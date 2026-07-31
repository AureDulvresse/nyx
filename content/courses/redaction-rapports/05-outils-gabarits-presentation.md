---
title: Outils, gabarits et présentation orale des résultats
chapter: 5
course: redaction-rapports
difficulty: intermediate
duration: 30
tags: [redaction, outils, markdown, presentation]
ceh_modules: ["Module 20 - Penetration Testing Fundamentals"]
objectives:
  - Choisir des outils adaptés à la rédaction de rapports techniques
  - Construire et réutiliser un gabarit (template) de rapport
  - Préparer une restitution orale efficace des résultats
---

## Introduction

Ce dernier chapitre referme le cours en abordant l'aspect pratique et logistique : avec quels outils rédiger, comment ne jamais repartir de zéro, et comment restituer à l'oral des résultats qu'on a pourtant déjà parfaitement documentés à l'écrit.

## Choisir ses outils de rédaction

<CompareTable
  titleA="Outil"
  titleB="Cas d'usage typique"
  rows={[
    { a: "Markdown + Pandoc/Typora", b: "Rapports versionnables avec Git, conversion facile en PDF/Word" },
    { a: "Serpico / Dradis / PlexTrac", b: "Plateformes dédiées pentest — gabarits de findings réutilisables, export automatisé" },
    { a: "Notion / Confluence", b: "Documentation vivante collaborative (runbooks, wikis SOC)" },
    { a: "Word/LibreOffice avec gabarit", b: "Quand le client impose un format spécifique en entreprise" },
  ]}
/>

<TipCallout>
Rédiger en Markdown puis exporter en PDF (via Pandoc) présente un avantage souvent sous-estimé : le rapport peut être versionné dans Git comme du code, avec un historique clair des révisions — précieux quand un rapport passe par plusieurs relectures avant livraison finale.
</TipCallout>

## Construire un gabarit réutilisable

Un gabarit de rapport de pentest typique définit à l'avance :

<Steps steps={[
  { title: "La structure figée", description: "Les titres de section qui ne changent jamais d'une mission à l'autre (garde, synthèse, méthodologie...)." },
  { title: "Le gabarit de fiche de vulnérabilité", description: "Un bloc réutilisable avec les champs vus au chapitre 3 (titre, CVSS, description, PoC, impact, recommandation)." },
  { title: "La charte graphique minimale", description: "Code couleur par sévérité (rouge/orange/jaune/bleu), pagination, mention de confidentialité en pied de page." },
  { title: "Un glossaire type", description: "Définitions des termes techniques récurrents (CVSS, IDOR, SSRF...) pour les lecteurs non techniques." },
]} />

<CehCallout>
Les plateformes professionnelles comme PlexTrac ou Dradis existent précisément pour industrialiser cette logique de gabarit : une bibliothèque de findings réutilisables (ex: "Injection SQL générique") que le pentester adapte au cas rencontré plutôt que de rédiger à chaque fois depuis zéro.
</CehCallout>

## Préparer une restitution orale

Un rapport écrit, aussi bon soit-il, est souvent complété par une réunion de restitution — l'occasion de répondre aux questions et de créer l'adhésion nécessaire à la correction effective des failles.

<Steps steps={[
  { title: "Ouvrir par le niveau de risque global", description: "Ne commence jamais par le détail technique — l'auditoire (souvent mixte technique/direction) a besoin du verdict avant les preuves." },
  { title: "Une slide par vulnérabilité critique/élevée maximum", description: "Titre, impact en une phrase, capture d'écran, recommandation — pas de sortie d'outil brute projetée." },
  { title: "Anticiper les objections", description: "Prépare une réponse aux réactions fréquentes : 'ce n'est pas exploitable en pratique', 'ça coûte trop cher à corriger', 'on le savait déjà'." },
  { title: "Terminer par un plan d'action daté", description: "Qui corrige quoi, et pour quelle date — transformer le rapport en engagement concret plutôt qu'en simple constat." },
]} />

<WarningCallout>
Projeter une sortie brute de terminal (100 lignes de sqlmap) pendant une restitution devant un public mixte est une erreur classique : cela n'apporte rien à la direction et ralentit inutilement la réunion — garde les preuves techniques pour un échange en aparté avec l'équipe technique.
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Construire un gabarit de fiche de vulnérabilité", description: "Rédige un gabarit vide (avec juste les champs, sans contenu) réutilisable pour toute future fiche de vulnérabilité que tu produiras sur Nyx." },
  { title: "Préparer une ouverture de restitution", description: "Rédige les 3 premières phrases que tu prononcerais pour ouvrir une restitution orale annonçant 1 faille critique et 2 failles moyennes." },
]} />

## En résumé

- Le choix d'outil (Markdown/Pandoc, plateformes dédiées, Word) dépend du contexte client et du besoin de versionnage.
- Un gabarit réutilisable (structure, fiche de vulnérabilité type, charte graphique) évite de repartir de zéro à chaque mission.
- Une restitution orale s'ouvre par le verdict global, évite les sorties brutes, et se termine par un plan d'action daté.

## Questions de Révision

1. Quel est l'avantage principal de rédiger un rapport en Markdown plutôt que directement en Word ?
2. Que doit contenir un gabarit de fiche de vulnérabilité réutilisable ?
3. Pourquoi ne faut-il jamais projeter une sortie d'outil brute pendant une restitution devant un public mixte ?

Félicitations, tu viens de terminer le cours **Rédaction de Rapports et Documentation Technique** ! Ces compétences s'appliquent directement à chaque lab Nyx que tu termines — prends l'habitude d'en rédiger une fiche complète.
