---
title: Threat intelligence et veille défensive
chapter: 8
course: cyber-defensive
difficulty: advanced
duration: 35
tags: [threat-intelligence, veille, ioc]
ceh_modules: ["Module 1 - Introduction to Ethical Hacking"]
objectives:
  - Comprendre le rôle de la threat intelligence dans une défense proactive
  - Distinguer les niveaux stratégique, tactique et opérationnel
  - Exploiter des indicateurs de compromission (IOC) concrètement
---

## Introduction

Ce chapitre complète le threat hunting déjà détaillé au cours Analyse SOC (chapitre 7) par la discipline qui l'alimente en amont : la threat intelligence, qui consiste à collecter et exploiter des informations sur les menaces avant même qu'elles ne se manifestent dans son propre système d'information.

## Les trois niveaux de la threat intelligence

<CompareTable
  titleA="Niveau"
  titleB="Question à laquelle il répond"
  rows={[
    { a: "Stratégique", b: "Quelles tendances de menaces générales concernent notre secteur d'activité sur le long terme ?" },
    { a: "Tactique", b: "Quelles techniques (MITRE ATT&CK, rappel du cours Analyse SOC ch.4) les groupes de menace pertinents utilisent-ils actuellement ?" },
    { a: "Opérationnel", b: "Quels indicateurs de compromission précis (IP, hash, domaine) sont associés à une campagne d'attaque en cours ?" },
]}
/>

<CehCallout>
Rappel du cours Analyse SOC (chapitre 7, threat hunting) : la threat intelligence tactique et opérationnelle alimente directement les hypothèses de chasse — une nouvelle technique documentée par la threat intelligence devient une hypothèse concrète à vérifier dans son propre système d'information.
</CehCallout>

## Exploiter des indicateurs de compromission (IOC)

<Steps steps={[
  { title: "Collecter des IOC de sources fiables", description: "Flux de threat intelligence, rapports de recherche publics, partage d'informations sectoriel." },
  { title: "Intégrer les IOC au SIEM", description: "Rappel du chapitre 5 de ce cours : une règle de corrélation peut directement signaler toute connexion vers une IP ou un domaine déjà documenté comme malveillant." },
  { title: "Vérifier rétrospectivement", description: "Un nouvel IOC publié aujourd'hui peut révéler qu'une compromission passée, non détectée à l'époque, est présente dans les logs historiques." },
]} />

<TipCallout>
Rappel du cours Forensics & DFIR (chapitre 6, forensique réseau) : un IOC réseau (IP ou domaine de commande et contrôle documenté) permet de rechercher rétrospectivement dans des captures ou logs archivés une éventuelle communication passée avec cette infrastructure malveillante, même des mois après.
</TipCallout>

## Les limites de la threat intelligence

<WarningCallout>
Rappel du cours Data Science Complète (chapitre 8, sur la dérive de concept) : un IOC statique (une IP ou un domaine précis) a une durée de vie souvent courte — les attaquants changent régulièrement leur infrastructure. La threat intelligence tactique (techniques, comportements) reste généralement plus durable et utile à long terme que la seule accumulation d'IOC opérationnels ponctuels.
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Classer un renseignement par niveau", description: "Classe ces informations par niveau (stratégique, tactique, opérationnel) : 'le secteur bancaire est de plus en plus ciblé par le ransomware', 'le groupe X utilise le Kerberoasting pour l'accès aux identifiants', 'l'IP 45.33.x.x est un serveur de commande et contrôle actif'." },
  { title: "Expliquer une limite de la threat intelligence", description: "Pourquoi un IOC opérationnel (une IP précise) devient-il rapidement obsolète, alors qu'une information tactique (une technique MITRE ATT&CK) reste utile plus longtemps ?" },
]} />

## En résumé

- La threat intelligence stratégique, tactique et opérationnelle répond à des questions de granularité croissante, de la tendance générale à l'indicateur précis.
- Les IOC intégrés au SIEM permettent une détection immédiate, mais aussi une recherche rétrospective dans les logs archivés.
- Les IOC opérationnels ont une durée de vie courte ; la threat intelligence tactique (techniques) reste généralement plus durable.

## Questions de Révision

1. Quelle est la différence entre threat intelligence stratégique, tactique et opérationnelle ?
2. Comment un IOC réseau peut-il permettre une détection rétrospective d'une compromission passée ?
3. Pourquoi la threat intelligence tactique reste-t-elle généralement plus durable que les IOC opérationnels ?
