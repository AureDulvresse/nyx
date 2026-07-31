---
title: Contrats, NDA et responsabilité professionnelle
chapter: 4
course: droit-cybersecurite
difficulty: intermediate
duration: 30
tags: [droit, contrats, nda, responsabilite]
ceh_modules: ["Module 1 - Introduction to Ethical Hacking"]
objectives:
  - Identifier les clauses essentielles d'un contrat de prestation en cybersécurité
  - Comprendre l'objet et les limites d'un accord de confidentialité (NDA)
  - Distinguer responsabilité civile et responsabilité pénale d'un pentester
---

## Introduction

Ce chapitre couvre les documents contractuels qui encadrent la relation entre un professionnel de la cybersécurité et son client — au-delà de la seule autorisation de test vue au chapitre 1. Un pentester qui ne maîtrise pas ces bases contractuelles s'expose personnellement, même en agissant de bonne foi.

## Le contrat de prestation — au-delà de l'autorisation de test

L'autorisation écrite (chapitre 1) définit le périmètre technique du test. Le **contrat de prestation** définit, lui, la relation commerciale et juridique globale :

<Steps steps={[
  { title: "Objet précis de la mission", description: "Pas seulement 'un pentest', mais le type exact (web, réseau, red team...), les livrables attendus, le calendrier." },
  { title: "Clause de limitation de responsabilité", description: "Plafonne la responsabilité financière du prestataire en cas de dommage, sauf faute lourde ou intentionnelle." },
  { title: "Clause d'indemnisation (hold harmless)", description: "Le client s'engage à ne pas poursuivre le prestataire pour des actions menées dans le périmètre autorisé." },
  { title: "Propriété du rapport", description: "Précise qui peut utiliser, diffuser ou publier (même partiellement) le rapport livré." },
  { title: "Conditions de résiliation", description: "Ce qui se passe si le client interrompt la mission en cours (paiement partiel, destruction des données collectées...)." },
]} />

<TipCallout>
La clause d'indemnisation ("hold harmless") est particulièrement importante pour un pentester : elle protège contre le risque qu'un service perturbé accidentellement pendant un test pourtant autorisé (ex: un scan trop agressif faisant planter un serveur fragile) ne se transforme en poursuite judiciaire du client contre le prestataire.
</TipCallout>

## Le NDA (accord de confidentialité)

Un NDA (Non-Disclosure Agreement) encadre spécifiquement la confidentialité des informations échangées — souvent signé AVANT même le contrat de prestation, dès les échanges commerciaux préliminaires.

<CompareTable
  titleA="Ce qu'un NDA protège typiquement"
  titleB="Ce qu'un NDA ne remplace PAS"
  rows={[
    { a: "Architecture réseau, code source consultés pendant l'audit", b: "L'autorisation de test elle-même (documents distincts)" },
    { a: "Vulnérabilités découvertes, avant correction par le client", b: "La limitation de responsabilité (clause du contrat de prestation)" },
    { a: "Données personnelles ou sensibles rencontrées", b: "Un accord de sous-traitance RGPD (DPA) si des données personnelles sont traitées" },
]}
/>

<WarningCallout>
Un NDA impose généralement une obligation de confidentialité qui survit à la fin de la mission — souvent 3 à 5 ans après. Un pentester qui réutilise, même anonymisée, une méthodologie ou un exemple précis tiré d'une mission couverte par NDA (dans un article de blog, une conférence) peut être en infraction contractuelle des années après la fin du contrat.
</WarningCallout>

## Responsabilité civile vs responsabilité pénale

<CompareTable
  titleA="Responsabilité civile"
  titleB="Responsabilité pénale"
  rows={[
    { a: "Réparer un dommage causé à autrui (indemnisation financière)", b: "Sanctionner une infraction à la loi (amende, prison)" },
    { a: "Peut être limitée/plafonnée par contrat", b: "Ne peut JAMAIS être limitée ou exclue par un contrat" },
    { a: "Ex : un scan cause une panne de service non anticipée", b: "Ex : dépasser le périmètre autorisé (voir chapitre 1)" },
]}
/>

<LegalCallout>
Un contrat, même parfaitement rédigé, ne peut jamais exonérer un pentester de sa responsabilité pénale personnelle en cas de dépassement de périmètre ou d'action malveillante — seule l'autorisation écrite et le respect strict du périmètre protègent réellement sur ce plan, aucune clause contractuelle ne peut s'y substituer.
</LegalCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Identifier une clause manquante", description: "Un contrat de prestation de pentest ne mentionne ni clause d'indemnisation ni limitation de responsabilité. Quel risque concret cela fait-il courir au prestataire si un scan cause une panne accidentelle ?" },
  { title: "Distinguer les responsabilités", description: "Un pentester teste un périmètre plus large que celui autorisé par erreur d'inattention et cause une panne. S'agit-il d'un risque en responsabilité civile, pénale, ou les deux ? Justifie." },
]} />

## En résumé

- Le contrat de prestation encadre la relation commerciale globale au-delà de la seule autorisation technique de test.
- Le NDA protège la confidentialité des informations échangées, avec une durée qui survit souvent longtemps après la fin de la mission.
- La responsabilité civile peut être limitée par contrat ; la responsabilité pénale, jamais — seul le respect strict du périmètre autorisé protège sur ce plan.

## Questions de Révision

1. Que protège une clause d'indemnisation ("hold harmless") dans un contrat de prestation ?
2. Pourquoi un NDA continue-t-il souvent à s'appliquer plusieurs années après la fin d'une mission ?
3. Pourquoi un contrat ne peut-il jamais exonérer un pentester de sa responsabilité pénale ?
