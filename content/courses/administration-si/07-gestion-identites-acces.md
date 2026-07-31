---
title: Gestion des identités et des accès (IAM)
chapter: 7
course: administration-si
difficulty: intermediate
duration: 35
tags: [sysadmin, iam, mfa, moindre-privilege]
ceh_modules: ["Module 6 - System Hacking"]
objectives:
  - Appliquer le principe du moindre privilège dans la gestion des accès
  - Comprendre les mécanismes RBAC et l'authentification multifacteur
  - Concevoir un cycle de vie complet des accès (arrivée, mobilité, départ)
---

## Introduction

La majorité des compromissions majeures documentées ces dernières années impliquent, à un moment de la chaîne d'attaque, un accès mal géré : un compte resté actif après un départ, un droit administrateur accordé "temporairement" et jamais retiré, une authentification sans second facteur. Ce chapitre couvre la gestion des identités et des accès (IAM) comme discipline structurante, pas comme simple détail technique.

## Le principe du moindre privilège

<CehCallout>
Le principe du moindre privilège (least privilege) énonce qu'un utilisateur ou un service ne doit disposer que des droits strictement nécessaires à sa fonction, ni plus. C'est l'un des principes de sécurité les plus anciens et les plus systématiquement violés en pratique, souvent par excès de facilité ("on lui donne les droits admin, ça évitera des tickets").
</CehCallout>

<CompareTable
  titleA="Violation fréquente"
  titleB="Application correcte du principe"
  rows={[
    { a: "Un développeur a un accès admin permanent en production", b: "Accès en lecture seule par défaut, élévation temporaire tracée en cas de besoin réel" },
    { a: "Un compte de service a les droits d'un compte utilisateur complet", b: "Un compte dédié avec uniquement les droits nécessaires à son unique fonction" },
    { a: "Tous les employés d'un service ont accès à toutes les données du service", b: "Accès différencié selon le rôle réel de chacun (RBAC)" },
]}
/>

## RBAC — le contrôle d'accès basé sur les rôles

<Steps steps={[
  { title: "Définir des rôles métier", description: "Ex : 'Comptable', 'Responsable RH', 'Développeur backend' — chacun avec un ensemble de droits précis." },
  { title: "Associer les utilisateurs aux rôles", description: "Un utilisateur hérite des droits de son rôle, plutôt que de droits accordés individuellement au fil du temps." },
  { title: "Réviser périodiquement", description: "Une revue des accès régulière (ex: trimestrielle) permet de détecter les droits accumulés au fil des changements de poste et jamais retirés." },
]} />

<TipCallout>
Le RBAC facilite considérablement les audits de conformité (ISO 27001, PCI-DSS vus au cours Droit et Réglementation) : il est bien plus simple de vérifier "qui a le rôle Comptable et quels droits ce rôle porte" que d'auditer les droits individuels de centaines d'utilisateurs un par un.
</TipCallout>

## L'authentification multifacteur (MFA)

<CompareTable
  titleA="Facteur"
  titleB="Exemple"
  rows={[
    { a: "Ce que je sais", b: "Mot de passe, code PIN" },
    { a: "Ce que je possède", b: "Téléphone (application d'authentification), clé de sécurité physique (FIDO2)" },
    { a: "Ce que je suis", b: "Empreinte digitale, reconnaissance faciale" },
]}
/>

<WarningCallout>
Le MFA par SMS, bien que meilleur qu'une authentification à facteur unique, reste vulnérable au SIM swapping (un attaquant fait transférer le numéro de téléphone de la victime vers sa propre carte SIM) — les applications d'authentification (TOTP) ou les clés physiques FIDO2 offrent une protection sensiblement supérieure pour les comptes à privilèges élevés.
</WarningCallout>

## Le cycle de vie complet d'un accès

```mermaid
graph LR
    A[Arrivée] --> B[Attribution du rôle et des droits]
    B --> C[Mobilité interne / changement de poste]
    C --> D[Révision et ajustement des droits]
    D --> E[Départ]
    E --> F[Révocation immédiate de TOUS les accès]
```

<WarningCallout>
Le maillon le plus souvent négligé de ce cycle est le départ : un compte d'ancien employé qui reste actif — parfois des mois — représente un accès potentiellement exploitable sans qu'aucune alerte ne se déclenche, puisqu'il s'agit d'un compte légitime aux yeux du système. La révocation d'accès au départ doit être immédiate et systématique, jamais différée.
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Concevoir des rôles RBAC", description: "Pour un service commercial de 15 personnes (5 commerciaux, 2 managers, 1 assistant administratif), propose 3 rôles RBAC distincts avec les droits typiques de chacun." },
  { title: "Identifier une faille de cycle de vie", description: "Un employé quitte l'entreprise un vendredi ; son compte est désactivé le lundi suivant par l'équipe RH lors du traitement administratif du départ. Quel est le risque concret de ce délai, et comment le cycle de vie IAM devrait-il être corrigé ?" },
]} />

## En résumé

- Le principe du moindre privilège reste l'un des plus violés en pratique, souvent par excès de facilité opérationnelle.
- Le RBAC structure les accès par rôle métier plutôt que par attribution individuelle, ce qui facilite aussi les audits de conformité.
- Le MFA renforce l'authentification, mais toutes ses formes ne se valent pas (SMS vulnérable au SIM swapping vs TOTP/FIDO2).
- La révocation d'accès au départ d'un employé doit être immédiate — c'est le maillon le plus souvent négligé du cycle de vie IAM.

## Questions de Révision

1. Pourquoi le principe du moindre privilège est-il l'un des principes de sécurité les plus violés en pratique ?
2. En quoi le RBAC facilite-t-il les audits de conformité par rapport à une gestion individuelle des droits ?
3. Pourquoi le MFA par SMS est-il considéré comme moins robuste que le MFA par application TOTP ou clé FIDO2 ?
