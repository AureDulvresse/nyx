---
title: Le Message Chiffré
slug: crypto-001
category: crypto
difficulty: beginner
---

## Scénario

Un serveur `vault.lab` (10.10.0.10) contient une série de messages protégés par des méthodes de chiffrement faibles ou obsolètes. Ta mission : casser chaque protection successivement pour révéler les flags.

## Objectifs

1. Décoder un message encodé en base64 puis chiffré en ROT13
2. Casser un hash MD5 par attaque au dictionnaire

## Indices

- `base64 -d` puis un décalage ROT13 classique suffisent pour le premier message.
- Le hash trouvé provient d'un mot de passe courant présent dans les dictionnaires standards (rockyou.txt).
- `john` ou `hashcat` sont adaptés à ce type d'attaque au dictionnaire.

<WarningCallout>
Cet exercice illustre pourquoi les algorithmes de chiffrement/hachage obsolètes (ROT13, MD5 sans sel) n'ont plus leur place en production — approfondis le sujet dans le cours Cryptographie Avancée.
</WarningCallout>
