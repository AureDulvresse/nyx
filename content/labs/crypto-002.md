---
title: La Clé Trop Faible
slug: crypto-002
category: crypto
difficulty: advanced
---

## Scénario

`vault-api.lab` (10.10.0.10) est la même API de gestion de commandes déjà rencontrée dans un précédent lab — mais cette fois, ta cible n'est plus l'application elle-même, c'est sa cryptographie. L'équipe qui l'a développée a généré une paire de clés RSA bien trop petite pour signer certains de ses jetons, pensant que personne ne s'en apercevrait.

## Objectifs

1. Récupérer le module RSA public exposé par le service et le factoriser pour reconstruire la clé privée
2. Identifier un endpoint où l'API accepte un jeton JWT signé avec l'algorithme RS256 alors qu'elle vérifie parfois la signature avec HS256 en utilisant la clé publique comme secret
3. Forger un jeton JWT valide en exploitant cette confusion d'algorithme pour obtenir un accès administrateur

## Indices

- La clé RSA exposée par le service est volontairement bien plus petite qu'une clé RSA de production — un outil comme `RsaCtfTool` ou une factorisation manuelle (Fermat, Pollard rho) permet de retrouver ses deux facteurs premiers en un temps raisonnable.
- Une fois la clé privée reconstruite, exporte également la clé publique correspondante au format PEM exact tel qu'elle est exposée par l'API — c'est cette chaîne de caractères précise qui sera réutilisée à l'étape suivante.
- Certaines implémentations JWT ne vérifient pas strictement l'algorithme annoncé dans l'en-tête du jeton : si l'API accepte un jeton HS256 alors qu'elle attend RS256, la clé publique PEM peut être réutilisée telle quelle comme secret HMAC pour signer un jeton falsifié.

<WarningCallout>
La confusion d'algorithme RS256/HS256 est une vulnérabilité JWT réelle et documentée (CVE historiques sur plusieurs bibliothèques populaires) — elle illustre pourquoi l'algorithme de vérification doit toujours être imposé côté serveur, jamais déduit du jeton reçu.
</WarningCallout>

<TipCallout>
Ce lab combine directement le chapitre sur la factorisation RSA du cours Cryptographie Avancée et le chapitre JWT du cours Sécurité des Applications et des API — relis les deux si une étape te semble abstraite.
</TipCallout>
