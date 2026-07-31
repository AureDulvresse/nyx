---
title: Cadre légal du hacking éthique et autorisation écrite
chapter: 1
course: droit-cybersecurite
difficulty: beginner
duration: 30
tags: [droit, legal, hacking-ethique]
ceh_modules: ["Module 1 - Introduction to Ethical Hacking"]
objectives:
  - Comprendre la frontière légale entre hacking éthique et infraction pénale
  - Identifier les éléments obligatoires d'une autorisation écrite de test
  - Connaître les principales incriminations applicables à l'intrusion informatique
---

## Introduction

Tout ce que tu apprends techniquement sur Nyx — scanner, exploiter, extraire des données — est **strictement illégal sans autorisation écrite préalable**, dans la quasi-totalité des juridictions. Ce premier chapitre pose la limite la plus importante du métier de pentester : celle qui sépare le hacking éthique du délit pénal, une limite qui ne tient parfois qu'à un document signé.

## Ce qui distingue le hacking éthique de l'infraction

<LegalCallout>
En France, l'accès ou le maintien frauduleux dans un système de traitement automatisé de données (STAD) est réprimé par les articles 323-1 et suivants du Code pénal — jusqu'à 3 ans d'emprisonnement et 100 000€ d'amende, indépendamment du fait que l'attaquant ait "juste regardé" sans rien endommager. L'intention et l'autorisation sont les seuls éléments qui distinguent un pentester d'un délinquant au regard de la loi.
</LegalCallout>

La différence entre un pentester et un attaquant n'est **jamais technique** — les mêmes outils (Nmap, sqlmap, Metasploit) sont utilisés des deux côtés. La différence est intégralement juridique :

<CompareTable
  titleA="Hacking éthique (légal)"
  titleB="Intrusion (délit pénal)"
  rows={[
    { a: "Autorisation écrite préalable du propriétaire du système", b: "Absence d'autorisation, ou autorisation dépassée en périmètre" },
    { a: "Périmètre défini et respecté", b: "Test hors du périmètre convenu (même par erreur)" },
    { a: "Objectif : identifier des failles pour les corriger", b: "Objectif : nuire, voler, extorquer ou simplement 'voir si c'est possible'" },
]}
/>

## Les éléments obligatoires d'une autorisation écrite

<Steps steps={[
  { title: "Identité des parties", description: "Qui commande le test (le client, avec pouvoir de signature), qui l'exécute (le pentester ou le cabinet)." },
  { title: "Périmètre exact", description: "Adresses IP, domaines, applications précisément listés — tout ce qui n'est pas listé est HORS périmètre par défaut." },
  { title: "Fenêtre temporelle", description: "Dates et heures précises de début et de fin autorisées du test." },
  { title: "Type de test autorisé", description: "Boîte noire/grise/blanche, tests de déni de service autorisés ou non, ingénierie sociale autorisée ou non." },
  { title: "Contact d'urgence", description: "Une personne joignable côté client en cas d'incident pendant le test (ex: service perturbé de façon imprévue)." },
  { title: "Signature des deux parties", description: "Sans signature du représentant légal habilité, le document n'a aucune valeur d'autorisation." },
]} />

<WarningCallout>
Un email informel ("vas-y, teste notre site") ne constitue PAS une autorisation légalement valable. En cas de litige, seul un document écrit et signé, précisant le périmètre exact, protège juridiquement le pentester — y compris envers son propre client si un incident survient.
</WarningCallout>

## Scope creep — le piège le plus fréquent

<CehCallout>
Le "scope creep" (dépassement de périmètre) est l'erreur la plus fréquente et la plus dangereuse juridiquement : découvrir par hasard, en testant le système autorisé, un accès vers un système NON listé dans l'autorisation — et l'explorer quand même. Même sans intention malveillante, cela constitue une intrusion non autorisée sur ce second système.
</CehCallout>

La règle professionnelle : si un test révèle un accès à un système hors périmètre, on **documente la découverte et on arrête immédiatement**, puis on en informe le client pour obtenir une extension écrite du périmètre avant d'aller plus loin.

## Panorama des principales lois applicables

<CompareTable
  titleA="Texte / Juridiction"
  titleB="Ce qu'il couvre"
  rows={[
    { a: "Code pénal art. 323-1 à 323-8 (France)", b: "Accès/maintien frauduleux, entrave, introduction/extraction de données" },
    { a: "Computer Fraud and Abuse Act — CFAA (USA)", b: "Accès non autorisé à un système informatique protégé" },
    { a: "Computer Misuse Act (UK)", b: "Accès non autorisé, modification non autorisée de données" },
    { a: "Convention de Budapest (internationale)", b: "Cadre de coopération internationale contre la cybercriminalité" },
  ]}
/>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Identifier les manques d'une autorisation", description: "Cette autorisation est-elle valable ? 'Le client autorise par email un test de son serveur web, sans préciser de dates ni de périmètre technique exact.' Justifie ta réponse." },
  { title: "Réagir à un scope creep", description: "Pendant un test autorisé sur app.client.com, tu découvres un accès non protégé vers un serveur de backup non mentionné dans l'autorisation. Que fais-tu, dans l'ordre ?" },
]} />

## En résumé

- La différence entre hacking éthique et délit pénal n'est jamais technique, toujours juridique : elle repose sur l'autorisation.
- Une autorisation valable précise identité des parties, périmètre exact, fenêtre temporelle, type de test, contact d'urgence, et signatures.
- Le "scope creep" — tester au-delà du périmètre autorisé, même par découverte fortuite — constitue une infraction distincte.

## Questions de Révision

1. Qu'est-ce qui distingue juridiquement un pentester d'un attaquant, si les outils utilisés sont identiques ?
2. Cite quatre éléments obligatoires d'une autorisation écrite de test d'intrusion.
3. Que doit faire un pentester qui découvre, par hasard, un accès à un système hors périmètre ?
