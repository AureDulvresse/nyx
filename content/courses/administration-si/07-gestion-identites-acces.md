---
title: Gestion des identités et des accès (IAM)
chapter: 7
course: administration-si
difficulty: intermediate
duration: 55
tags: [sysadmin, iam, mfa, moindre-privilege, rbac, pam]
ceh_modules: ["Module 6 - System Hacking"]
objectives:
  - Appliquer le principe du moindre privilège dans la gestion des accès
  - Comprendre les mécanismes RBAC, l'authentification multifacteur et le SSO
  - Concevoir un cycle de vie complet des accès (arrivée, mobilité, départ)
  - Distinguer la robustesse des différents facteurs d'authentification
---

## Introduction

La majorité des compromissions majeures documentées ces dernières années impliquent, à un moment de la chaîne d'attaque, un accès mal géré : un compte resté actif après un départ, un droit administrateur accordé « temporairement » et jamais retiré, une authentification sans second facteur. La gestion des identités et des accès (IAM, Identity and Access Management) est donc une discipline structurante, pas un simple détail technique.

Ce chapitre couvre les principes et les mécanismes de l'IAM. À la fin, tu sauras appliquer le moindre privilège, structurer les droits par rôle avec le RBAC, choisir le bon facteur d'authentification, et concevoir un cycle de vie des accès qui ne laisse pas de comptes orphelins derrière lui.

## Le principe du moindre privilège

<CehCallout>
Le principe du moindre privilège (least privilege) énonce qu'un utilisateur ou un service ne doit disposer que des droits strictement nécessaires à sa fonction, ni plus. C'est l'un des principes de sécurité les plus anciens et les plus systématiquement violés en pratique, souvent par excès de facilité, selon le raisonnement « on lui donne les droits admin, ça évitera des tickets ». Chaque droit superflu est une porte supplémentaire pour un attaquant.
</CehCallout>

<CompareTable
  titleA="Violation fréquente"
  titleB="Application correcte du principe"
  rows={[
    { a: "Un développeur a un accès admin permanent en production", b: "Accès en lecture seule par défaut, élévation temporaire et tracée en cas de besoin réel" },
    { a: "Un compte de service a les droits d'un compte utilisateur complet", b: "Un compte dédié avec uniquement les droits nécessaires à sa seule fonction" },
    { a: "Tous les employés d'un service accèdent à toutes ses données", b: "Accès différencié selon le rôle réel de chacun (RBAC)" },
]}
/>

### L'accès juste-à-temps et le PAM

L'application moderne du moindre privilège ne consiste plus à accorder un droit en permanence, mais à le donner seulement quand il est nécessaire, pour une durée limitée et avec traçabilité. C'est le principe de l'accès juste-à-temps (just-in-time). Les solutions de gestion des accès à privilèges (PAM, Privileged Access Management) mettent cela en œuvre : un administrateur demande une élévation pour une tâche précise, l'obtient temporairement, et le droit expire ensuite automatiquement. Cela réduit considérablement la fenêtre pendant laquelle un compte à privilèges est exploitable.

## RBAC — le contrôle d'accès basé sur les rôles

Le RBAC (Role-Based Access Control) consiste à attribuer les droits non pas individu par individu, mais à des rôles métier auxquels on rattache les personnes.

<Steps steps={[
  { title: "Définir des rôles métier", description: "Par exemple Comptable, Responsable RH, Développeur backend, chacun avec un ensemble de droits précis et justifié." },
  { title: "Associer les utilisateurs aux rôles", description: "Un utilisateur hérite des droits de son rôle, plutôt que de droits accordés individuellement et accumulés au fil du temps." },
  { title: "Réviser périodiquement", description: "Une revue des accès régulière, par exemple trimestrielle, détecte les droits accumulés lors des changements de poste et jamais retirés." },
]} />

<TipCallout>
Le RBAC facilite considérablement les audits de conformité (ISO 27001, PCI DSS vus au cours Droit et Réglementation) : il est bien plus simple de vérifier « qui a le rôle Comptable et quels droits ce rôle porte » que d'auditer les droits individuels de centaines d'utilisateurs un par un. Au-delà du RBAC, l'ABAC (contrôle basé sur les attributs) affine encore la décision en tenant compte du contexte, comme l'heure ou l'emplacement.
</TipCallout>

### Le phénomène de dérive des droits

Sans revue régulière, les droits s'accumulent : une personne change de poste, obtient de nouveaux droits, mais conserve les anciens. Au bout de quelques années, elle cumule des accès qui ne correspondent plus à sa fonction. C'est la dérive des droits (privilege creep), et c'est précisément ce que la revue périodique des accès corrige.

## L'authentification multifacteur (MFA)

Un mot de passe seul ne suffit plus : il peut être deviné, hameçonné ou rejoué. L'authentification multifacteur combine plusieurs preuves de catégories différentes.

<CompareTable
  titleA="Facteur"
  titleB="Exemple"
  rows={[
    { a: "Ce que je sais", b: "Mot de passe, code PIN" },
    { a: "Ce que je possède", b: "Téléphone avec application d'authentification, clé de sécurité physique FIDO2" },
    { a: "Ce que je suis", b: "Empreinte digitale, reconnaissance faciale" },
]}
/>

<WarningCallout>
Le MFA par SMS, bien que meilleur qu'une authentification à facteur unique, reste vulnérable au SIM swapping : un attaquant fait transférer le numéro de téléphone de la victime vers sa propre carte SIM et reçoit les codes à sa place. Les applications d'authentification (TOTP) et surtout les clés physiques FIDO2 offrent une protection sensiblement supérieure pour les comptes à privilèges, car elles ne dépendent pas du réseau téléphonique et résistent à l'hameçonnage.
</WarningCallout>

Les clés FIDO2 et les passkeys ont une propriété précieuse : elles sont liées cryptographiquement au site légitime, ce qui les rend résistantes à l'hameçonnage, là où un code TOTP peut encore être saisi sur un faux site par une victime trompée. Pour les comptes les plus sensibles, c'est la forme de MFA à privilégier.

## Le SSO — un seul point d'authentification

L'authentification unique (SSO, Single Sign-On) permet de s'authentifier une fois pour accéder à plusieurs applications, via des protocoles comme SAML ou OpenID Connect. C'est un gain de confort et de sécurité, car on centralise le contrôle et on peut y imposer un MFA fort. Mais c'est aussi une concentration du risque : compromettre l'identité SSO, c'est accéder à tout. D'où l'importance d'un MFA résistant à l'hameçonnage sur le fournisseur d'identité lui-même.

## Le cycle de vie complet d'un accès

Un accès naît, évolue et doit mourir. Chaque étape de ce cycle a ses pièges.

```mermaid
flowchart LR
    A["Arrivée"] --> B["Attribution du rôle et des droits"]
    B --> C["Mobilite interne / changement de poste"]
    C --> D["Revision et ajustement des droits"]
    D --> E["Depart"]
    E --> F["Revocation immediate de TOUS les acces"]
```

<WarningCallout>
Le maillon le plus souvent négligé de ce cycle est le départ : un compte d'ancien employé qui reste actif, parfois des mois, représente un accès potentiellement exploitable sans qu'aucune alerte ne se déclenche, puisqu'il s'agit d'un compte légitime aux yeux du système. La révocation d'accès au départ doit être immédiate et systématique, jamais différée au prochain traitement administratif.
</WarningCallout>

Le bon fonctionnement du cycle repose sur la coordination entre les ressources humaines, qui connaissent les mouvements de personnel, et l'informatique, qui applique les changements. Idéalement, un départ déclaré aux RH déclenche automatiquement la désactivation des comptes, sans dépendre d'un courriel qu'on oublie d'envoyer.

## Erreurs fréquentes

On accorde des droits admin permanents « pour éviter des tickets », en violation directe du moindre privilège. On attribue les droits individu par individu, ce qui rend les audits impossibles et favorise la dérive des droits. On déploie un MFA par SMS en croyant le problème réglé, alors qu'il reste vulnérable au SIM swapping. On ne révise jamais les accès, et les droits s'accumulent au fil des changements de poste. Enfin, on désactive les comptes des partants « quand on y pense », laissant des comptes orphelins actifs pendant des semaines.

## Lab — Mise en pratique

**Environnement** : Réflexion guidée.

<Steps steps={[
  { title: "Concevoir des rôles RBAC", description: "Pour un service commercial de 15 personnes (5 commerciaux, 2 managers, 1 assistant administratif et le reste en support), propose trois rôles RBAC distincts avec les droits typiques de chacun." },
  { title: "Appliquer le moindre privilège", description: "Un développeur a besoin d'un accès admin en production une fois par mois pour une maintenance. Propose une solution conforme au moindre privilège plutôt qu'un accès permanent." },
  { title: "Classer des facteurs d'authentification", description: "Range par robustesse croissante : MFA par SMS, mot de passe seul, clé FIDO2, application TOTP, et justifie l'ordre." },
  { title: "Identifier une faille de cycle de vie", description: "Un employé quitte l'entreprise un vendredi ; son compte est désactivé le lundi suivant lors du traitement RH. Indique le risque concret de ce délai et comment corriger le cycle de vie." },
  { title: "Détecter une dérive des droits", description: "Explique comment une revue trimestrielle des accès permet de repérer un salarié ayant changé de poste trois fois en cinq ans." },
  { title: "Choisir un MFA pour comptes sensibles", description: "Pour les comptes administrateurs, indique quelle forme de MFA tu recommandes et pourquoi, en lien avec la résistance à l'hameçonnage." },
]} />

## À retenir

- Le principe du moindre privilège reste l'un des plus violés en pratique, souvent par excès de facilité opérationnelle.
- L'accès juste-à-temps et les solutions PAM accordent les droits à privilèges temporairement plutôt qu'en permanence.
- Le RBAC structure les accès par rôle métier plutôt que par attribution individuelle, ce qui facilite les audits et limite la dérive des droits.
- Le MFA combine des facteurs de catégories différentes ; le facteur « ce que je possède » inclut le téléphone et la clé FIDO2.
- Le MFA par SMS est vulnérable au SIM swapping ; les applications TOTP et surtout les clés FIDO2 sont plus robustes et résistent à l'hameçonnage.
- La révocation d'accès au départ d'un employé doit être immédiate : c'est le maillon le plus souvent négligé du cycle de vie IAM.

## Questions de révision

1. Que signifie le principe du moindre privilège, et pourquoi est-il si souvent violé en pratique ?
2. Quelle est l'application correcte du principe face à un développeur qui a besoin d'un accès admin ponctuel en production ?
3. Qu'apporte le RBAC par rapport à une gestion individuelle des droits ?
4. Quel facteur d'authentification correspond à « ce que je possède » ?
5. Pourquoi le MFA par SMS est-il considéré comme moins robuste que le TOTP ou une clé FIDO2 ?
6. Qu'est-ce que la dérive des droits, et comment la revue périodique des accès y remédie-t-elle ?
7. Dans le cycle de vie IAM, quel maillon est le plus souvent négligé, et pourquoi est-il dangereux ?
8. Pourquoi le SSO est-il à la fois un gain de sécurité et une concentration du risque ?
