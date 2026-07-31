---
title: Acquisition de preuves numériques
chapter: 2
course: dfir
difficulty: intermediate
duration: 35
tags: [dfir, acquisition, imagerie, write-blocker]
ceh_modules: ["Module 7 - Malware Threats"]
objectives:
  - Réaliser une acquisition forensique conforme aux bonnes pratiques
  - Comprendre le rôle d'un write-blocker et du calcul de hash
  - Choisir entre acquisition physique et logique selon le contexte
---

## Introduction

Ce chapitre met en pratique les principes juridiques vus au chapitre 5 du cours Droit et Réglementation (chaîne de custody, recevabilité de la preuve) : comment acquérir concrètement une preuve numérique de façon à ce qu'elle reste utilisable, tant techniquement que légalement.

## Acquisition physique vs logique

<CompareTable
  titleA="Acquisition physique (bit-à-bit)"
  titleB="Acquisition logique"
  rows={[
    { a: "Copie exacte de tout le support, y compris espace non alloué", b: "Copie des fichiers actifs uniquement, tels que vus par le système de fichiers" },
    { a: "Permet de récupérer des fichiers supprimés", b: "Plus rapide, mais ignore les données supprimées et l'espace non alloué" },
    { a: "Standard pour une investigation forensique complète", b: "Suffisant pour une réponse à incident rapide et ciblée" },
]}
/>

<CehCallout>
L'espace "non alloué" d'un disque (zones marquées comme libres par le système de fichiers mais dont le contenu précédent n'a pas été effacé physiquement) contient souvent des fragments de fichiers supprimés — c'est précisément ce que révèle une acquisition physique et que manque une acquisition logique.
</CehCallout>

## Le rôle du write-blocker

<WarningCallout>
Brancher un disque suspect directement sur un poste d'analyse sans write-blocker, même en apparence "juste pour regarder", peut suffire à modifier des métadonnées du système de fichiers (dates d'accès) — rompant l'intégrité de la preuve avant même le début de l'analyse.
</WarningCallout>

<Steps steps={[
  { title: "Write-blocker matériel", description: "Un boîtier physique interposé entre le disque suspect et le poste d'analyse, empêchant physiquement toute écriture." },
  { title: "Write-blocker logiciel", description: "Une configuration système empêchant l'écriture sur un support monté — moins fiable qu'une solution matérielle mais utilisable en dépannage." },
  { title: "Vérification post-acquisition", description: "Calculer immédiatement un hash (SHA-256) de l'image obtenue et le comparer, quand c'est possible, avec un hash calculé sur l'original avant démontage." },
]} />

## Calculer et vérifier l'intégrité

```bash
# Acquisition physique bit-à-bit avec dd, en calculant le hash au passage
dd if=/dev/sdb of=image_disque.dd bs=4M status=progress
sha256sum image_disque.dd > image_disque.sha256

# Vérification ultérieure de l'intégrité
sha256sum -c image_disque.sha256
```

<TipCallout>
Des outils dédiés comme `dc3dd` ou `dcfldd` (variantes forensiques de dd) calculent le hash directement pendant l'acquisition, évitant une étape séparée et réduisant le risque d'erreur humaine dans la procédure.
</TipCallout>

## Documenter l'acquisition — la fiche de collecte

<Steps steps={[
  { title: "Identification du support", description: "Numéro de série, modèle, capacité, emplacement physique où il a été trouvé." },
  { title: "Outil et méthode utilisés", description: "Commande exacte exécutée, version de l'outil, write-blocker utilisé (référence)." },
  { title: "Hash calculé immédiatement après acquisition", description: "Point de référence pour toute vérification future d'intégrité." },
  { title: "Identité du collecteur et horodatage précis", description: "Premier maillon de la chaîne de custody, vue au cours Droit et Réglementation." },
]} />

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell)

<Steps steps={[
  { title: "Réaliser une acquisition et vérifier son intégrité", description: "Simule une acquisition d'un fichier représentant un disque, puis vérifie son intégrité.", code: 'dd if=/dev/zero of=disque_test.img bs=1M count=10\nsha256sum disque_test.img > disque_test.sha256\nsha256sum -c disque_test.sha256' },
  { title: "Justifier un choix d'acquisition", description: "Une entreprise doit investiguer une fuite de données suspectée sur un poste utilisateur, tout en minimisant l'interruption de service. Acquisition physique ou logique ? Justifie ton choix." },
]} />

## En résumé

- L'acquisition physique (bit-à-bit) capture tout le support, y compris les données supprimées ; l'acquisition logique ne capture que les fichiers actifs.
- Un write-blocker empêche toute écriture accidentelle sur le support original pendant sa copie.
- Un hash calculé immédiatement après acquisition constitue le point de référence de toute vérification d'intégrité ultérieure.

## Questions de Révision

1. Pourquoi une acquisition physique permet-elle de récupérer des fichiers supprimés là où une acquisition logique ne le permet pas ?
2. Que risque-t-on à analyser un disque suspect sans write-blocker, même en pensant "juste regarder" ?
3. À quel moment précis faut-il calculer le hash d'une image forensique, et pourquoi ?
