---
title: La Clé Protégée
slug: crypto-004
category: crypto
difficulty: intermediate
---

## Scénario

Une sauvegarde exposée sur `backup.lab` (10.10.0.10) contient une clé privée SSH protégée par une phrase de passe. La politique de mots de passe de l'entreprise fictive Nyx Corp n'a visiblement pas été appliquée à cette clé, restée protégée par une phrase de passe issue d'un dictionnaire courant.

## Objectifs

1. Récupérer la clé privée SSH exposée et confirmer qu'elle est protégée par une phrase de passe
2. Convertir la clé dans un format exploitable par un outil de cassage de mot de passe
3. Casser la phrase de passe par dictionnaire et l'utiliser pour se connecter en SSH avec cette clé

## Indices

- `ssh2john` convertit une clé privée protégée en un format que `john` ou `hashcat` peuvent attaquer.
- Le dictionnaire `rockyou.txt`, déjà présent sur Kali, suffit largement ici.
- Une fois la phrase de passe trouvée, `ssh -i cle_privee utilisateur@backup.lab` confirme l'accès.

<WarningCallout>
Cet environnement est isolé dans un réseau Docker dédié à ta session. Toute action ici reste strictement confinée à ce lab.
</WarningCallout>
