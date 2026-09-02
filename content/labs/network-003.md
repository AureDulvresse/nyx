---
title: Le Partage Anonyme
slug: network-003
category: network
difficulty: beginner
---

## Scénario

`fileshare.lab` (10.10.0.10) expose un service de partage de fichiers SMB accessible sans authentification (session null). L'équipe IT fictive de Nyx Corp pense que ce partage ne contient « rien de sensible » — ta mission est de vérifier cette hypothèse par une énumération méthodique.

## Objectifs

1. Réaliser une session SMB null pour lister les partages disponibles sur `fileshare.lab`
2. Explorer le contenu d'un partage accessible en lecture pour y trouver un fichier de sauvegarde oublié
3. Extraire les identifiants qu'il contient et confirmer qu'ils fonctionnent sur un autre service exposé par la machine

## Indices

- `smbclient -L //10.10.0.10/ -N` ou `enum4linux -a 10.10.0.10` listent les partages sans avoir besoin d'identifiants.
- Un partage nommé de façon anodine (sauvegarde, archive, temp...) mérite toujours d'être exploré en entier.
- Une fois des identifiants trouvés, teste-les sur le service FTP ou SSH exposé par la même machine.

<WarningCallout>
Cet environnement est isolé dans un réseau Docker dédié à ta session. Toute action ici reste strictement confinée à ce lab.
</WarningCallout>
