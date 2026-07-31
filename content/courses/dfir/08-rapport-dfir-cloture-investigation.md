---
title: Rédiger un rapport DFIR et clôturer une investigation
chapter: 8
course: dfir
difficulty: advanced
duration: 35
tags: [dfir, rapport, cloture, retour-experience]
ceh_modules: ["Module 7 - Malware Threats"]
objectives:
  - Structurer un rapport d'investigation DFIR complet
  - Distinguer les faits établis des hypothèses dans un rapport
  - Clore une investigation avec un retour d'expérience actionnable
---

## Introduction

Ce dernier chapitre referme le cours en réunissant l'ensemble des compétences précédentes (acquisition, mémoire, disque, logs, réseau, malware) dans un livrable structuré — directement lié aux compétences du cours Rédaction de Rapports, ici appliquées spécifiquement au contexte de l'investigation post-incident.

## Structurer un rapport d'investigation DFIR

<Steps steps={[
  { title: "Résumé de l'incident", description: "Ce qui s'est passé, quand, quel impact — en une page, lisible par une direction non technique." },
  { title: "Chronologie complète (timeline)", description: "Reconstruite à partir des sources corroborées (chapitre 5), avec un niveau de confiance indiqué pour chaque événement." },
  { title: "Vecteur d'accès initial", description: "Comment l'attaquant est entré — phishing, exploitation d'une vulnérabilité, identifiants compromis." },
  { title: "Portée de la compromission", description: "Systèmes touchés, données concernées, comptes utilisés par l'attaquant." },
  { title: "Preuves techniques détaillées", description: "Hash de fichiers malveillants, IOC réseau, artefacts identifiés — en annexe technique (principe vu au cours Rédaction de Rapports, chapitre 2)." },
  { title: "Recommandations et retour d'expérience", description: "Ce qui doit changer pour éviter une récidive, au-delà du simple nettoyage immédiat." },
]} />

## Distinguer faits établis et hypothèses

<CehCallout>
Un rapport DFIR rigoureux distingue explicitement ce qui est un FAIT établi par une preuve corroborée (ex: "le fichier X a été exécuté à 14:32, confirmé par Prefetch et Event ID 4688") de ce qui reste une HYPOTHÈSE non entièrement confirmée (ex: "l'attaquant a probablement exfiltré la base clients, bien qu'aucune preuve directe de transfert ne subsiste") — mélanger les deux sans le signaler nuit gravement à la crédibilité du rapport en cas de contestation.
</CehCallout>

```text
Exemple de formulation rigoureuse dans un rapport DFIR :

FAIT ÉTABLI : Le compte "svc-backup" a été utilisé pour s'authentifier
sur SRV-02 à 03:14:22 UTC le 12/03/2026 (Event ID 4624, corroboré par
les logs du pare-feu).

HYPOTHÈSE NON CONFIRMÉE : Il est probable que ce compte ait été compromis
via Kerberoasting, bien qu'aucun ticket TGS anormal n'ait pu être retrouvé
dans les logs disponibles (rétention insuffisante sur la période concernée).
```

<WarningCallout>
Présenter une hypothèse comme un fait établi dans un rapport DFIR — notamment si ce rapport sert de base à une décision juridique, une déclaration à la CNIL ou une communication publique — expose l'organisation à un risque de crédibilité majeur si l'hypothèse s'avère ultérieurement incorrecte.
</WarningCallout>

## Clôturer une investigation — le retour d'expérience

<Steps steps={[
  { title: "Organiser une réunion post-mortem", description: "Rassembler toutes les équipes impliquées (DFIR, SOC, IT, direction) pour partager la chronologie complète et les enseignements." },
  { title: "Identifier les défaillances de détection", description: "Pourquoi l'incident n'a-t-il pas été détecté plus tôt ? Quel signal aurait dû déclencher une alerte plus précocement ?" },
  { title: "Prioriser les actions correctives", description: "Distinguer ce qui doit être corrigé immédiatement (vulnérabilité exploitée) de ce qui relève d'une amélioration structurelle à plus long terme (modèle de tiering, segmentation)." },
  { title: "Mettre à jour les runbooks", description: "Intégrer les enseignements de cette investigation dans les procédures opérationnelles futures (lien direct avec le chapitre 4 du cours Rédaction de Rapports)." },
]} />

<TipCallout>
Un retour d'expérience qui se contente de conclure "nous avons corrigé la vulnérabilité" sans interroger pourquoi la détection a été tardive rate l'essentiel de la valeur de l'exercice — la question la plus utile après un incident n'est pas seulement "comment est-il entré ?" mais "pourquoi ne l'avons-nous pas vu plus tôt ?".
</TipCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Distinguer fait et hypothèse", description: "Reformule cette phrase d'un rapport pour distinguer clairement le fait établi de l'hypothèse : 'L'attaquant a exploité une injection SQL puis a probablement installé une porte dérobée persistante sur le serveur.'" },
  { title: "Proposer une question de retour d'expérience", description: "Un incident a été détecté 6 jours après la compromission initiale. Formule une question de retour d'expérience allant au-delà de 'comment corriger la faille exploitée ?'." },
]} />

## En résumé

- Un rapport DFIR complet réunit résumé, chronologie, vecteur d'accès, portée, preuves techniques et recommandations.
- Distinguer explicitement les faits établis des hypothèses non confirmées est indispensable à la crédibilité du rapport.
- Le retour d'expérience post-incident doit interroger les défaillances de détection, pas seulement corriger la vulnérabilité exploitée.

## Questions de Révision

1. Pourquoi un rapport DFIR doit-il distinguer explicitement les faits établis des hypothèses non confirmées ?
2. Quel risque concret prend une organisation qui présente une hypothèse comme un fait établi dans un rapport DFIR ?
3. Pourquoi la question "pourquoi n'avons-nous pas détecté l'incident plus tôt ?" est-elle souvent plus utile que "comment corriger la faille exploitée ?" lors d'un retour d'expérience ?

Félicitations, tu viens de terminer le cours **Forensics & DFIR** ! Ces compétences complètent directement le cours Active Directory & Windows (investiguer les attaques que tu as appris à mener) et s'appuient sur le cours Rédaction de Rapports pour produire un livrable crédible — direction le cours Cryptographie Avancée pour la suite de la roadmap.
