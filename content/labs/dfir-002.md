---
title: Ce Que la Mémoire Se Souvient
slug: dfir-002
category: dfir
difficulty: advanced
---

## Scénario

Un dump complet de la mémoire vive de `victim-ws2.lab` a été capturé au moment précis où une intrusion était suspectée, et déposé dans `/forensics/` sur ta machine Kali. Contrairement à l'analyse d'artefacts sur disque déjà pratiquée, cette fois tout ce que tu sais de l'attaque doit être reconstruit à partir de ce qui vivait en RAM au moment de la capture.

## Objectifs

1. Identifier le profil du système d'exploitation correspondant au dump mémoire avec Volatility
2. Repérer un processus suspect dissimulé parmi les processus légitimes
3. Extraire depuis la mémoire les identifiants et connexions réseau laissés par l'attaquant

## Indices

- Le plugin d'identification automatique de profil de Volatility (`imageinfo` sur Volatility 2, ou l'auto-détection de Volatility 3) doit être exécuté avant tout autre plugin — sans le bon profil, les résultats suivants seront incohérents.
- Compare la liste des processus obtenue via `pslist` avec celle de `psscan` : un processus visible uniquement dans l'un des deux résultats est un signe classique de dissimulation ou de terminaison forcée.
- Les plugins réseau (`netscan`) et mémoire de processus (`memdump` puis analyse de la chaîne extraite) révèlent respectivement une connexion sortante suspecte et des identifiants en clair laissés en mémoire par le processus malveillant.

<TipCallout>
Ce lab prolonge le chapitre sur l'analyse mémoire du cours Forensics & DFIR — contrairement aux artefacts disque déjà vus, la RAM ne conserve ces informations que tant que la machine reste allumée, ce qui rend sa capture rapide absolument critique en intervention réelle.
</TipCallout>

<WarningCallout>
Travaille toujours sur une copie du dump mémoire, jamais sur l'original — en investigation réelle, un dump mémoire corrompu par une manipulation imprudente ne peut generalement plus être recapturé.
</WarningCallout>
