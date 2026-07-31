---
title: Pourquoi documenter — la valeur d'un rapport bien écrit
chapter: 1
course: redaction-rapports
difficulty: beginner
duration: 25
tags: [redaction, documentation, communication]
ceh_modules: ["Module 20 - Penetration Testing Fundamentals"]
objectives:
  - Comprendre pourquoi le rapport est le vrai livrable d'une mission de sécurité
  - Identifier les publics différents d'un même document (direction, technique, juridique)
  - Distinguer documentation "vivante" et documentation "figée"
---

## Introduction

Un pentester brillant qui ne sait pas écrire un rapport clair produit, en pratique, un travail sans valeur pour son client : la vulnérabilité qu'il a trouvée ne sera jamais corrigée si personne ne la comprend. Ce cours part d'un principe simple — **la compétence technique et la compétence rédactionnelle ne sont pas séparables en cybersécurité**, elles sont les deux faces d'un même métier. Ce premier chapitre pose les bases : à qui écrit-on, pourquoi, et avec quelles conséquences si on écrit mal.

## Le rapport, pas l'exploit, est le livrable

<CehCallout>
En CEH comme en OSCP, l'épreuve pratique ne s'arrête pas à l'obtention d'un flag ou d'un accès root — elle inclut la production d'un rapport. Un exploit sans preuve documentée ne compte pas.
</CehCallout>

Un client qui paie pour un audit de sécurité paie en réalité pour trois choses, dans cet ordre d'importance :

1. **Savoir où il est exposé** — la synthèse des risques, compréhensible sans expertise technique.
2. **Savoir comment corriger** — des recommandations précises et actionnables par ses équipes.
3. **Avoir la preuve technique** — de quoi rejouer et valider chaque vulnérabilité trouvée.

L'exploitation technique elle-même (le "comment j'ai eu le shell root") n'est qu'un moyen d'arriver à ces trois livrables — jamais une fin en soi pour le client.

## Un même rapport, plusieurs lecteurs

<CompareTable
  titleA="Public"
  titleB="Ce qu'il attend du document"
  rows={[
    { a: "Direction / RSSI", b: "Synthèse en 1 page, niveau de risque global, décision à prendre" },
    { a: "Équipe technique / DevOps", b: "Détail exact de la faille, requêtes, code vulnérable, correctif précis" },
    { a: "Juridique / Conformité", b: "Périmètre exact testé, autorisation, éventuelles obligations réglementaires déclenchées" },
    { a: "Toi-même, 6 mois plus tard", b: "Contexte suffisant pour comprendre ta propre mission sans tout re-tester" },
  ]}
/>

<TipCallout>
Un rapport qui essaie de satisfaire tous ces publics dans un seul flux de texte échoue en général à satisfaire aucun d'entre eux. La solution structurelle — vue au chapitre 2 — consiste à séparer clairement les sections selon le public visé.
</TipCallout>

## Documentation "vivante" vs documentation "figée"

Deux familles de documents cohabitent en sécurité, avec des règles différentes :

- **Documentation figée** : le rapport de pentest, le rapport d'incident final — une fois livré et signé, il ne change plus. Il fait foi à une date donnée.
- **Documentation vivante** : les runbooks SOC, les procédures de durcissement, les playbooks de réponse à incident — mise à jour en continu, versionnée, jamais "terminée".

<WarningCallout>
Confondre les deux est une erreur fréquente chez les débutants : ils traitent un runbook comme un rapport figé (jamais mis à jour après sa première rédaction) ou, à l'inverse, laissent un rapport de pentest "en brouillon" indéfiniment modifiable — ce qui lui fait perdre toute valeur probatoire en cas de litige.
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Identifier les publics", description: "Pour un rapport de pentest web ayant trouvé une injection SQL critique, liste les 3 informations que la direction veut lire en premier, et les 3 informations que l'équipe technique veut lire en premier — remarque ce qui diffère." },
  { title: "Classer des documents", description: "Range ces documents en 'vivant' ou 'figé' : rapport d'audit ISO 27001, procédure de sauvegarde, rapport de test d'intrusion signé, playbook de réponse au phishing." },
]} />

## En résumé

- Le rapport, pas l'exploit technique, est le vrai livrable d'une mission de sécurité.
- Un même rapport a plusieurs publics (direction, technique, juridique) aux attentes différentes.
- La documentation "figée" (rapports) et "vivante" (runbooks, procédures) obéissent à des règles de gestion différentes.

## Questions de Révision

1. Pourquoi un exploit technique sans preuve documentée n'a-t-il aucune valeur pour un client ?
2. Cite deux publics différents d'un rapport de pentest et ce que chacun en attend.
3. Donne un exemple de document "vivant" et un exemple de document "figé" en cybersécurité.
