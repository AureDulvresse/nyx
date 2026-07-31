---
title: Synthèse — gouvernance et limites de l'IA en cybersécurité
chapter: 7
course: ia-cybersecurity
difficulty: intermediate
duration: 30
tags: [ia, gouvernance, synthese]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Comprendre les principes de gouvernance applicables à l'IA en sécurité
  - Identifier les limites actuelles de l'IA appliquée à la cybersécurité
  - Construire une synthèse complète du cours
---

## Introduction

Ce dernier chapitre referme le cours en abordant la gouvernance de l'IA en sécurité — comment encadrer son usage de façon responsable — avant de dresser une synthèse reliant chaque chapitre à son usage concret.

## Principes de gouvernance de l'IA en sécurité

<Steps steps={[
  { title: "Transparence sur les décisions automatisées", description: "Documenter clairement quand une décision (clôture d'alerte, blocage de compte) a été prise par un agent IA plutôt qu'un humain." },
  { title: "Supervision humaine sur les actions à conséquence réelle", description: "Rappel du chapitre 5 : jamais d'action de confinement critique sans validation humaine, sauf règles très strictes et validées au préalable." },
  { title: "Audit régulier des modèles et agents déployés", description: "Vérifier périodiquement que le comportement reste conforme aux attentes, notamment face à une dérive de concept (cours Data Science Complète, chapitre 8)." },
  { title: "Conformité réglementaire", description: "Rappel du cours Droit et Réglementation : le RGPD encadre les décisions automatisées à impact significatif ; des réglementations spécifiques à l'IA émergent également (comme l'AI Act européen)." },
]} />

<CehCallout>
L'AI Act européen, entré progressivement en application depuis 2024, classe les systèmes d'IA selon leur niveau de risque — un système d'IA utilisé pour des décisions de sécurité à fort impact (comme le blocage automatique de comptes) est susceptible de relever d'une catégorie à risque élevé, imposant des obligations de transparence et de supervision renforcées.
</CehCallout>

## Les limites actuelles de l'IA en cybersécurité

<CompareTable
  titleA="Limite"
  titleB="Implication pratique"
  rows={[
    { a: "Les modèles reflètent les biais de leurs données d'entraînement (cours Data Science Complète, ch.9)", b: "Un modèle peut sous-performer sur des menaces ou contextes sous-représentés à l'entraînement" },
    { a: "Vulnérabilité au prompt injection et aux attaques adversariales (chapitre 6)", b: "Aucun système d'IA de sécurité ne doit être considéré comme une défense infaillible" },
    { a: "Manque d'interprétabilité des modèles complexes (chapitre 1)", b: "Difficile d'expliquer précisément pourquoi un modèle a pris une décision donnée" },
    { a: "Dérive de concept dans le temps", b: "Un modèle non réentraîné se dégrade face à des menaces qui évoluent" },
]}
/>

<WarningCallout>
Le principal risque de gouvernance n'est pas l'IA elle-même, mais une confiance excessive et non questionnée envers ses décisions — traiter la sortie d'un modèle comme une vérité incontestable plutôt que comme une aide à la décision parmi d'autres est l'erreur la plus fréquente et la plus coûteuse dans le déploiement de l'IA en sécurité.
</WarningCallout>

## Synthèse — panorama complet du cours

<CompareTable
  titleA="Chapitre"
  titleB="Contribution au panorama"
  rows={[
    { a: "1. Panorama réseaux de neurones et LLM", b: "Fondations conceptuelles de l'IA moderne" },
    { a: "2. Détection d'anomalies par deep learning", b: "Application défensive directe aux données de sécurité" },
    { a: "3. NLP appliqué à la sécurité", b: "Exploiter les données textuelles (emails, logs)" },
    { a: "4. Agents IA autonomes", b: "Architecture générale d'un système agissant, pas seulement prédisant" },
    { a: "5. Agents IA pour le SOC", b: "Application concrète et garde-fous nécessaires" },
    { a: "6. IA offensive et risques", b: "Nouvelles surfaces d'attaque introduites par l'IA elle-même" },
    { a: "7. Gouvernance et limites", b: "Encadrer l'usage de façon responsable" },
]}
/>

## Où aller ensuite

<Steps steps={[
  { title: "Vers Analyse SOC", description: "Voir comment les agents et modèles vus dans ce cours s'intègrent concrètement dans le quotidien d'un analyste SOC." },
  { title: "Vers Psychologie & Ingénierie Sociale", description: "Approfondir les biais cognitifs exploités par l'ingénierie sociale, amplifiée par les deepfakes vus au chapitre 6." },
  { title: "Vers Droit et Réglementation", description: "Approfondir les obligations réglementaires encadrant les décisions automatisées et l'IA à risque élevé." },
]} />

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Identifier une décision de gouvernance manquante", description: "Une entreprise déploie un agent IA de blocage automatique de comptes suspects sans documentation ni processus de contestation pour l'utilisateur concerné. Quel principe de gouvernance manque, et quel risque cela fait-il courir ?" },
  { title: "Résumer une limite clé", description: "Pourquoi ne faut-il jamais traiter la sortie d'un modèle de sécurité basé sur l'IA comme une vérité incontestable ?" },
]} />

## En résumé

- La gouvernance de l'IA en sécurité repose sur la transparence, la supervision humaine, l'audit régulier et la conformité réglementaire.
- Biais hérités des données, vulnérabilité aux attaques adversariales, manque d'interprétabilité et dérive de concept sont des limites actuelles à ne jamais perdre de vue.
- Le risque principal n'est pas l'IA elle-même, mais une confiance excessive et non questionnée envers ses décisions.

## Questions de Révision

1. Que classifie l'AI Act européen, et pourquoi un système de sécurité à fort impact peut-il en relever ?
2. Cite deux limites actuelles de l'IA appliquée à la cybersécurité.
3. Pourquoi le risque principal de gouvernance de l'IA est-il une confiance excessive plutôt que l'IA elle-même ?

Félicitations, tu viens de terminer le cours **IA & Agents en Cybersécurité** ! Direction **Analyse SOC** pour voir concrètement comment ces outils s'intègrent dans le travail quotidien d'un analyste.
