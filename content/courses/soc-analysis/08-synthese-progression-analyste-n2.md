---
title: Synthèse — construire sa progression vers l'analyste SOC niveau 2
chapter: 8
course: soc-analysis
difficulty: intermediate
duration: 30
tags: [soc, synthese, progression]
ceh_modules: ["Module 1 - Introduction to Ethical Hacking"]
objectives:
  - Relier chaque compétence du cours à la progression N1 vers N2
  - Identifier les compétences complémentaires à approfondir
  - Construire une synthèse complète du cours
---

## Introduction

Ce dernier chapitre referme le cours en reliant explicitement chaque compétence acquise à la progression professionnelle réelle d'un analyste SOC — du triage N1 vers l'investigation et la chasse plus autonomes du N2/N3.

## Panorama des compétences et leur rôle dans la progression

<CompareTable
  titleA="Chapitre"
  titleB="Compétence pour la progression N1 → N2"
  rows={[
    { a: "1. Rôles et niveaux", b: "Comprendre où l'on se situe et ce qui différencie le niveau suivant" },
    { a: "2. Triage d'alertes", b: "Maîtriser la base : prioriser efficacement sans se fier à un seul critère" },
    { a: "3. SIEM et corrélation", b: "Comprendre l'outil pour aller au-delà de son usage superficiel" },
    { a: "4. Kill Chain et ATT&CK", b: "Situer une alerte isolée dans une attaque plus large — compétence clé du N2" },
    { a: "5. Investigation approfondie", b: "La compétence centrale distinguant le N2 du simple triage N1" },
    { a: "6. Playbooks et SOAR", b: "Comprendre les limites de l'automatisation pour savoir quand s'en remettre au jugement humain" },
    { a: "7. Threat hunting", b: "La compétence la plus avancée, typique du N3, à développer progressivement" },
]}
/>

## Ce qui distingue concrètement un bon analyste N2

<CehCallout>
Un analyste N1 applique correctement des procédures documentées ; un analyste N2 développe un jugement d'investigation autonome — la capacité à formuler des hypothèses, chercher des preuves au-delà des procédures écrites, et corréler plusieurs sources sans qu'un playbook ne le lui dicte explicitement à chaque étape.
</CehCallout>

<Steps steps={[
  { title: "Développer sa connaissance de l'environnement surveillé", description: "Connaître les comportements normaux de son organisation (rythmes, applications, comptes de service) est indispensable pour repérer un écart réel." },
  { title: "Approfondir MITRE ATT&CK au-delà des bases", description: "Se familiariser avec les techniques les plus pertinentes pour son secteur d'activité, pas seulement les plus connues." },
  { title: "Pratiquer l'investigation sur des cas réels ou simulés", description: "Rappel des labs Nyx (Active Directory, DFIR) : l'investigation s'apprend par la pratique répétée, pas uniquement la théorie." },
  { title: "Cultiver la rigueur documentaire", description: "Rappel du cours Rédaction de Rapports : chaque investigation doit rester traçable et distinguer clairement faits établis et hypothèses." },
]} />

## Compétences complémentaires à approfondir

<CompareTable
  titleA="Cours Nyx complémentaire"
  titleB="Apport pour la progression SOC"
  rows={[
    { a: "Forensics & DFIR", b: "Approfondir l'investigation au-delà du triage SOC, jusqu'à l'analyse mémoire et disque" },
    { a: "Active Directory & Windows", b: "Comprendre en profondeur les techniques d'attaque les plus fréquentes en environnement Windows d'entreprise" },
    { a: "IA & Agents en Cybersécurité", b: "Comprendre les outils d'automatisation qui transforment progressivement le métier" },
    { a: "Droit et Réglementation", b: "Comprendre les obligations légales déclenchées par certains types d'incidents" },
]}
/>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Identifier sa prochaine compétence à développer", description: "Parmi les 7 chapitres de ce cours, lequel te semble le plus éloigné de ta pratique actuelle, et quel lab ou TP Nyx pourrait t'aider à le renforcer ?" },
  { title: "Distinguer N1 et N2 sur un cas concret", description: "Une alerte de connexion inhabituelle est correctement escaladée par un N1 selon la procédure. Que ferait un N2 de plus, au-delà de cette escalade correcte ?" },
]} />

## En résumé

- La progression N1 → N2 repose sur le développement d'un jugement d'investigation autonome, au-delà de l'application correcte de procédures.
- La connaissance approfondie de son environnement, la maîtrise d'ATT&CK et la pratique répétée de l'investigation sont les leviers concrets de cette progression.
- Les cours Forensics & DFIR, Active Directory & Windows, IA & Agents en Cybersécurité et Droit et Réglementation complètent directement les compétences de ce cours.

## Questions de Révision

1. Qu'est-ce qui distingue fondamentalement un analyste N1 d'un analyste N2 ?
2. Cite deux leviers concrets pour progresser du triage N1 vers l'investigation N2.
3. Quel cours Nyx complémentaire approfondirait le plus directement les compétences d'investigation vues au chapitre 5 ?

Félicitations, tu viens de terminer le cours **Analyse SOC** ! Ces compétences s'appuient directement sur les cours Forensics & DFIR, Active Directory & Windows et IA & Agents en Cybersécurité — direction **Psychologie & Ingénierie Sociale** pour la suite de la roadmap.
