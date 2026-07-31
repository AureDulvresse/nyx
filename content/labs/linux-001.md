---
title: Élévation Silencieuse
slug: linux-001
category: exploitation
difficulty: beginner
---

## Scénario

Tu disposes d'un accès utilisateur limité sur `internal.lab` (10.10.0.10), une machine Linux volontairement mal configurée pour cet exercice. Ta mission : identifier un vecteur d'élévation de privilèges et obtenir un accès root.

## Objectifs

1. Énumérer les binaires disposant du bit SUID sur le système
2. Identifier lequel de ces binaires permet une élévation de privilèges (voir GTFOBins)
3. Obtenir un shell root et confirmer l'accès

## Indices

- Reprends la commande d'énumération SUID vue dans le cours Linux, chapitre 2.
- Un des binaires trouvés n'est pas standard sur une installation minimale — c'est probablement lui.
- Le site GTFOBins référence les techniques d'abus connues pour la plupart des binaires SUID/sudo courants.

<TipCallout>
Ce lab reprend directement les notions du chapitre "Système de fichiers et permissions" du cours Linux — n'hésite pas à y retourner si tu bloques.
</TipCallout>
