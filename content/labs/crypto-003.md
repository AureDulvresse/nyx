---
title: L'Oracle de Bourrage
slug: crypto-003
category: crypto
difficulty: advanced
---

## Scénario

L'application fictive `session.lab` (10.10.0.10) chiffre ses cookies de session avec AES en mode CBC, et renvoie un message d'erreur distinct selon que le padding PKCS#7 déchiffré est valide ou non. Cette différence de comportement, en apparence anodine, suffit à casser entièrement le chiffrement sans jamais connaître la clé.

## Objectifs

1. Confirmer l'existence de l'oracle de bourrage en observant les deux messages d'erreur distincts (padding valide / invalide)
2. Utiliser cet oracle pour déchiffrer octet par octet un cookie intercepté, sans connaître la clé AES
3. Réutiliser la technique pour forger un cookie arbitraire ("role=admin") accepté par l'application

## Indices

- Un outil comme `padbuster`, ou un script manuel exploitant l'oracle bit par bit, fonctionne parfaitement ici — repère d'abord précisément la chaîne qui distingue les deux cas d'erreur.
- Le déchiffrement complet du cookie révèle un format `user=...&role=user` — c'est ce format qu'il faut reproduire en `role=admin` grâce au chiffrement par oracle inverse.
- Le flag final apparaît dans la réponse du serveur une fois le cookie forgé accepté avec le rôle admin.

<TipCallout>
Le mode CBC déchiffre chaque bloc par XOR avec le bloc chiffré précédent : en manipulant ce bloc précédent octet par octet et en observant si le padding reste valide, on retrouve le clair sans jamais avoir besoin de la clé — c'est tout le principe de l'attaque par oracle de bourrage.
</TipCallout>

<WarningCallout>
Cet environnement est isolé dans un réseau Docker dédié à ta session. Toute action ici reste strictement confinée à ce lab.
</WarningCallout>
