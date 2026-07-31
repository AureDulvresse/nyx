---
title: Systèmes de fichiers — structure et métadonnées
chapter: 1
course: fichiers-bdd
difficulty: beginner
duration: 30
tags: [systemes-fichiers, metadonnees]
ceh_modules: ["Module 7 - Malware Threats"]
objectives:
  - Comprendre le rôle d'un système de fichiers
  - Comprendre les métadonnées associées à chaque fichier
  - Relier ces notions au travail forensique déjà étudié
---

## Introduction

Ce cours pose les fondations autour d'un objet omniprésent mais rarement expliqué en profondeur : le fichier, et sa forme structurée par excellence, la base de données. Ce premier chapitre couvre le système de fichiers, déjà rencontré de façon appliquée aux cours Linux et Forensics & DFIR.

## Le rôle d'un système de fichiers

<CehCallout>
Un système de fichiers (NTFS, ext4, APFS...) organise la façon dont les données sont stockées, nommées et retrouvées sur un support physique — sans lui, un disque ne serait qu'une suite de zéros et de uns sans aucune structure exploitable par un humain ou une application.
</CehCallout>

```mermaid
graph TD
    A[Disque physique] --> B[Système de fichiers - NTFS/ext4]
    B --> C[Table des fichiers - MFT/inode]
    C --> D[Fichiers et dossiers organisés]
```

## Les métadonnées — des informations sur les données

<CehCallout>
Rappel du cours Forensics & DFIR (chapitre 4) : chaque fichier porte des métadonnées MACB (Modified, Accessed, Created, entry Modified) — des informations précieuses en investigation, mais qui existent en réalité pour un usage bien plus quotidien : permettre à un système d'exploitation de trier, rechercher et gérer efficacement des millions de fichiers.
</CehCallout>

<CompareTable
  titleA="Métadonnée"
  titleB="Usage courant"
  rows={[
    { a: "Nom et extension", b: "Identification et association à une application par défaut" },
    { a: "Taille", b: "Gestion de l'espace disque, affichage dans l'explorateur de fichiers" },
    { a: "Dates (MACB)", b: "Tri chronologique, sauvegarde incrémentale (rappel du cours Administration Systèmes et Réseaux, chapitre 5)" },
    { a: "Permissions", b: "Contrôle d'accès (rappel du cours Linux, chapitre 2)" },
]}
/>

## La table des fichiers — l'index du système

<Steps steps={[
  { title: "La MFT (Master File Table) sur NTFS", description: "Un index central recensant chaque fichier du volume et ses métadonnées, rappel direct du cours Forensics & DFIR (chapitre 4)." },
  { title: "Les inodes sur les systèmes Unix/Linux", description: "Une structure équivalente stockant les métadonnées d'un fichier séparément de son nom, permettant plusieurs noms (liens) pour un même contenu physique." },
]} />

<TipCallout>
Cette séparation entre le nom d'un fichier et son contenu physique (via l'inode) explique pourquoi, sur Linux, on peut créer plusieurs liens vers un même fichier physique (hard links) — un même contenu accessible sous plusieurs noms, sans duplication réelle des données.
</TipCallout>

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell)

<Steps steps={[
  { title: "Examiner les métadonnées d'un fichier", description: "Affiche les métadonnées complètes d'un fichier, y compris son inode.", code: 'stat /etc/passwd' },
  { title: "Relier au travail forensique", description: "Pourquoi un examinateur DFIR s'intéresse-t-il particulièrement aux dates MACB d'un fichier suspect plutôt qu'à son seul contenu ?" },
]} />

## En résumé

- Un système de fichiers organise le stockage, le nommage et la recherche de données sur un support physique.
- Les métadonnées (nom, taille, dates, permissions) accompagnent chaque fichier pour un usage quotidien bien au-delà du seul contexte forensique.
- La MFT (NTFS) et les inodes (Unix/Linux) indexent centralement les fichiers et leurs métadonnées.

## Questions de Révision

1. Que se passerait-il si un disque n'avait aucun système de fichiers organisant ses données ?
2. Cite deux métadonnées d'un fichier et leur usage quotidien, au-delà du contexte forensique.
3. Pourquoi peut-on créer plusieurs liens (hard links) vers un même fichier physique sur un système Unix/Linux ?
