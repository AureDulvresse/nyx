---
title: L'Empreinte Numérique
slug: osint-001
category: osint
difficulty: beginner
---

## Scénario

`osint.lab` (10.10.0.10) héberge des informations publiques fictives (documents, profils, fichiers) appartenant à un employé imaginaire d'une entreprise cible. Aucune exploitation technique n'est nécessaire ici : seule une reconnaissance passive méthodique permet de reconstituer son profil numérique, en vue de préparer une campagne de sensibilisation au phishing.

## Objectifs

1. Extraire les métadonnées d'un document public révélant des informations sur son auteur
2. Croiser plusieurs informations publiques pour déduire un schéma probable de mot de passe

## Indices

- Un document ou une image publique conserve souvent des métadonnées EXIF (auteur, logiciel utilisé, parfois localisation) que peu de personnes pensent à supprimer avant publication.
- Croise les centres d'intérêt et informations personnelles trouvées avec les schémas de mots de passe les plus courants (rappel du cours Cryptographie Avancée sur la robustesse des mots de passe).

<TipCallout>
Ce lab reprend directement la méthodologie OSINT du cours Cybersécurité Offensive (chapitre 2, reconnaissance) et le cours Psychologie & Ingénierie Sociale sur l'exploitation d'informations personnelles en phishing ciblé.
</TipCallout>

<WarningCallout>
En mission réelle, cette reconnaissance ne doit jamais dépasser le périmètre explicitement autorisé — rappel du cours Droit et Réglementation de la Cybersécurité sur le cadre légal de l'OSINT.
</WarningCallout>
