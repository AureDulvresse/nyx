---
title: La Boîte à Souvenirs
slug: dfir-001
category: dfir
difficulty: intermediate
---

## Scénario

`victim-ws.lab` (10.10.0.10) est un poste de travail suspecté d'avoir été compromis. Aucune investigation en direct n'a encore été menée : à toi de reconstruire la chronologie de l'attaque à partir des artefacts disponibles sur la machine, en appliquant la méthodologie du cours Forensics & DFIR.

## Objectifs

1. Identifier le fichier exécuté ayant servi de vecteur d'entrée initial
2. Reconstruire la chronologie complète jusqu'à l'action finale de l'attaquant

## Indices

- Les artefacts de prefetch Windows conservent une trace des exécutables récemment lancés, même après leur suppression.
- Croise les horodatages MACB (Modified/Accessed/Changed/Born) des fichiers suspects avec les journaux d'événements pour reconstituer l'ordre exact des actions.

<TipCallout>
Ce lab reprend directement les chapitres du cours Forensics & DFIR sur l'acquisition de preuves et la reconstruction de chronologie — rappel également du chapitre 1 du cours Fichiers et Bases de Données sur les métadonnées MACB.
</TipCallout>

<WarningCallout>
Ne modifie jamais un artefact original en cours d'analyse — travaille toujours sur une copie, exactement comme en investigation réelle (chaîne de custody).
</WarningCallout>
