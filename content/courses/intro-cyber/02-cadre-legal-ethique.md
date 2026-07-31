---
title: Cadre légal et éthique du hacking
chapter: 2
course: intro-cyber
difficulty: beginner
duration: 30
tags: [légal, éthique, autorisation]
ceh_modules: ["Module 01 - Introduction to Ethical Hacking", "Module 02 - Footprinting and Reconnaissance"]
objectives:
  - Comprendre la différence entre hacking éthique et cybercriminalité
  - Connaître les grandes bases légales encadrant le pentest
  - Identifier les éléments indispensables d'une autorisation de test
---

## Introduction

Toutes les techniques que tu vas apprendre sur Nyx — scan de ports, exploitation de vulnérabilités, élévation de privilèges — sont strictement identiques, que tu sois un pentester autorisé ou un cybercriminel. La seule différence est **l'autorisation**. Ce chapitre pose ce cadre avant d'aller plus loin techniquement, car c'est un prérequis non négociable de toute pratique du hacking éthique.

## Hacking éthique vs cybercriminalité

<CompareTable
  titleA="Hacking éthique"
  titleB="Cybercriminalité"
  rows={[
    { a: "Autorisation écrite préalable (scope, périmètre, dates)", b: "Aucune autorisation" },
    { a: "Objectif : identifier des failles pour les corriger", b: "Objectif : exploiter les failles pour en tirer profit ou nuire" },
    { a: "Rapport détaillé remis au client", b: "Aucune transparence, dissimulation des traces" },
    { a: "Encadré par un contrat (NDA, rules of engagement)", b: "Aucun cadre contractuel" },
  ]}
/>

<LegalCallout>
Sans autorisation écrite explicite, toute tentative d'intrusion — même "juste pour tester", même sur un système que tu penses mal protégé — est passible de poursuites pénales dans la quasi-totalité des juridictions. L'intention ne change rien au regard de la loi si l'autorisation fait défaut.
</LegalCallout>

## Les bases légales à connaître

Sans viser l'exhaustivité juridique, voici les textes structurants que tu croiseras le plus souvent :

- **France** : loi n°88-19 dite "Loi Godfrain", intégrée aux articles 323-1 à 323-8 du Code pénal — réprime l'accès et le maintien frauduleux dans un système de traitement automatisé de données (STAD).
- **États-Unis** : Computer Fraud and Abuse Act (CFAA), texte de référence historiquement large et souvent invoqué.
- **Union Européenne** : RGPD, qui encadre le traitement des données personnelles et s'applique directement dès qu'un test touche des données à caractère personnel.
- **International** : Convention de Budapest sur la cybercriminalité, premier traité international en la matière.

<AuditCallout>
Un test d'intrusion mené dans le cadre d'une certification ISO 27001 ou d'une conformité RGPD doit être documenté : périmètre, autorisation, méthodologie, résultats. Cette traçabilité fait partie intégrante de la démarche d'audit.
</AuditCallout>

## Les éléments d'une autorisation de test (Rules of Engagement)

Un document d'autorisation de test sérieux couvre a minima :

1. **Le périmètre (scope)** : quelles adresses IP, domaines, applications sont autorisés — et lesquels sont explicitement exclus
2. **La fenêtre temporelle** : dates et heures autorisées pour le test
3. **Les techniques autorisées et interdites** : par exemple, un déni de service peut être explicitement exclu
4. **Le contact d'urgence** : une personne joignable en cas d'incident pendant le test
5. **La confidentialité** : NDA couvrant les informations découvertes pendant l'audit

<CehCallout>
Le CEH consacre une part significative de son référentiel à cette notion de "Rules of Engagement" — un pentester professionnel ne lance jamais un scan sans document signé, même dans un contexte de confiance apparente.
</CehCallout>

## Divulgation responsable (Responsible Disclosure)

Si tu découvres une vulnérabilité en dehors d'un cadre de test formel (par exemple sur un site public, par accident), la pratique éthique est la **divulgation responsable** :

<Steps steps={[
  { title: "Ne pas exploiter la faille au-delà de la preuve de concept minimale", description: "Documenter juste assez pour prouver la vulnérabilité, sans accéder à des données non nécessaires." },
  { title: "Contacter l'organisation de façon privée", description: "Via un canal officiel (security.txt, programme de bug bounty, contact direct) — jamais publiquement en premier lieu." },
  { title: "Laisser un délai raisonnable de correction", description: "Généralement 90 jours est un standard de l'industrie avant toute divulgation publique." },
]} />

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (pas de terminal requis pour ce chapitre)

<Steps steps={[
  { title: "Rédiger un mini-scope", description: "Imagine que tu es mandaté pour tester le site interne d'une association locale. Rédige en 5 lignes un périmètre de test raisonnable." },
  { title: "Identifier une zone grise", description: "Tu remarques qu'un site public de ta ville a un formulaire vulnérable à une injection SQL basique, découverte par hasard. Que fais-tu, étape par étape ?" },
]} />

## Pour aller plus loin

### Les certifications comme cadre professionnel

Au-delà du texte de loi, l'écosystème professionnel s'est doté de codes de conduite qui structurent la pratique éthique du métier.

<CompareTable
  titleA="Cadre / Organisme"
  titleB="Ce qu'il impose"
  rows={[
    { a: "Code d'éthique EC-Council (CEH)", b: "Engagement écrit à n'utiliser les compétences que dans un cadre légal et autorisé" },
    { a: "(ISC)² Code of Ethics (CISSP)", b: "Quatre canons dont \"protéger la société, le bien commun...\" — un manquement peut entraîner la révocation de la certification" },
    { a: "Programmes de bug bounty (HackerOne, Bugcrowd)", b: "Définissent eux-mêmes un scope légal précis, avec sauf-conduit contractuel pour les chercheurs" },
  ]}
/>

<TipCallout>
Un programme de bug bounty est en réalité une autorisation de test permanente et publique, limitée à un périmètre défini — c'est souvent le moyen le plus accessible de pratiquer légalement sur de vrais systèmes en production, avec une rémunération à la clé.
</TipCallout>

### Zoom : la loi Godfrain en pratique

La loi Godfrain (article 323-1 du Code pénal français) réprime "le fait d'accéder ou de se maintenir, frauduleusement, dans tout ou partie d'un système de traitement automatisé de données" — jusqu'à 3 ans d'emprisonnement et 100 000 € d'amende, davantage en cas d'atteinte à des données ou au fonctionnement du système.

<WarningCallout>
Point souvent mal compris : le "maintien frauduleux" est puni même sans intention de nuire. Un accès obtenu par erreur (ex: une URL mal protégée trouvée par hasard) qui se transforme en exploration volontaire du système peut déjà constituer une infraction, indépendamment de toute malveillance.
</WarningCallout>

### La loi Godfrain a une exception : l'article 47 de la LPM

Depuis la Loi de Programmation Militaire (LPM) de 2018, la loi française permet à l'ANSSI et à certains organismes de test agréés d'effectuer des scans de vulnérabilités sur des systèmes d'importance vitale (OIV) sans consentement préalable individuel systématique, dans un cadre très encadré de cyberdéfense nationale — un rappel que le cadre légal évolue et se complexifie avec les enjeux de sécurité nationale.

## En résumé

- La seule différence entre hacking éthique et cybercriminalité est l'autorisation écrite préalable.
- Plusieurs cadres légaux structurent la pratique (Loi Godfrain en France, CFAA aux USA, RGPD en UE).
- Une autorisation de test sérieuse définit précisément périmètre, dates, techniques autorisées et contact d'urgence.
- En dehors d'un mandat formel, la divulgation responsable est la pratique éthique de référence.

## Questions de Révision

1. Quelle est la seule différence fondamentale entre un pentester éthique et un cybercriminel ?
2. Cite trois éléments indispensables d'une autorisation de test (Rules of Engagement).
3. Que signifie "divulgation responsable" et quel délai est généralement considéré comme standard ?
