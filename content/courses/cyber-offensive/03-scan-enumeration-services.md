---
title: Scan et énumération des services
chapter: 3
course: cyber-offensive
difficulty: intermediate
duration: 35
tags: [scan, enumeration, nmap]
ceh_modules: ["Module 3 - Scanning Networks"]
objectives:
  - Mettre en pratique une stratégie de scan complète
  - Énumérer en détail les services identifiés
  - Prioriser les cibles selon leur surface d'attaque
---

## Introduction

Ce chapitre met en pratique et approfondit le TP Nmap déjà réalisé au cours Réseaux (chapitre 3), en l'intégrant dans une méthodologie complète de scan et d'énumération, la transition entre reconnaissance (chapitre 2) et exploitation (chapitre 4).

## Une stratégie de scan en plusieurs passes

<Steps steps={[
  { title: "Scan de découverte d'hôtes", description: "Identifier les machines actives sur le périmètre autorisé, avant de s'intéresser au détail de chacune." },
  { title: "Scan de ports large et rapide", description: "Un premier passage large (tous les ports, sans détection de version) pour ne rien manquer." },
  { title: "Scan approfondi ciblé", description: "Sur les ports ouverts identifiés, un scan plus lent avec détection de version et scripts NSE (rappel du TP Nmap)." },
]} />

```bash
# Rappel et extension du TP Nmap (cours Réseaux, chapitre 3)
nmap -sn 10.10.0.0/24                          # découverte d'hôtes
nmap -p- -T4 10.10.0.15                        # scan de ports complet et rapide
nmap -sV -sC -p 22,80,443 10.10.0.15           # scan approfondi ciblé sur les ports ouverts
```

<CehCallout>
Cette approche en plusieurs passes (large puis ciblée) est bien plus efficace qu'un unique scan exhaustif et lent dès le départ — elle réduit considérablement le temps total tout en garantissant une couverture complète du périmètre autorisé.
</CehCallout>

## Énumérer en détail chaque service

<CompareTable
  titleA="Service identifié"
  titleB="Énumération approfondie typique"
  rows={[
    { a: "HTTP/HTTPS (80/443)", b: "Cartographie de l'application (rappel du cours Sécurité Web, chapitre 2), technologies utilisées, répertoires cachés" },
    { a: "SSH (22)", b: "Version exacte, méthodes d'authentification acceptées (mot de passe, clé)" },
    { a: "SMB (445)", b: "Partages accessibles, version du protocole, utilisateurs/groupes énumérables sans authentification" },
    { a: "FTP (21)", b: "Accès anonyme éventuellement autorisé, version du serveur" },
]}
/>

<TipCallout>
Un service SMB acceptant une énumération anonyme des utilisateurs (fréquent sur des configurations par défaut mal durcies) fournit directement une liste de comptes à cibler lors d'une future tentative d'authentification — rappel du TP Hydra (cours Sécurité Web, chapitre 5).
</TipCallout>

## Prioriser les cibles selon la surface d'attaque

<WarningCallout>
Face à de nombreux hôtes et services découverts, tenter d'exploiter chaque piste dans un ordre arbitraire gaspille un temps précieux — prioriser d'abord les services avec des versions connues pour des vulnérabilités documentées (recherche via searchsploit, cours Sécurité Web chapitre 7), puis les configurations par défaut non modifiées, avant les cibles nécessitant un effort d'exploitation plus incertain.
</WarningCallout>

```bash
# Rechercher des vulnérabilités connues pour une version de service identifiée
searchsploit apache 2.4.49
```

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell)

<Steps steps={[
  { title: "Mener un scan en plusieurs passes", description: "Applique la stratégie en trois passes sur le sous-réseau du lab web-001, du scan de découverte au scan approfondi ciblé." },
  { title: "Prioriser des cibles découvertes", description: "Un scan révèle un serveur Apache 2.4.49 (version avec CVE connue), un service SMB avec énumération anonyme active, et un serveur SSH à jour. Dans quel ordre les investiguerais-tu ?" },
]} />

## En résumé

- Une stratégie de scan efficace enchaîne découverte d'hôtes, scan large rapide, puis scan approfondi ciblé sur les ports ouverts.
- Chaque service identifié appelle une énumération spécifique (cartographie web, énumération SMB, accès anonyme FTP...).
- Prioriser les cibles selon leur surface d'attaque réelle (vulnérabilités connues, configurations par défaut) optimise le temps d'une mission de pentest.

## Questions de Révision

1. Pourquoi une stratégie de scan en plusieurs passes est-elle plus efficace qu'un unique scan exhaustif dès le départ ?
2. Que révèle une énumération SMB anonyme réussie, et pourquoi est-ce précieux pour la suite du pentest ?
3. Selon quels critères prioriser l'investigation de plusieurs cibles découvertes lors d'un scan ?
