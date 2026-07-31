---
title: Administration Windows Server et Active Directory
chapter: 2
course: administration-si
difficulty: intermediate
duration: 40
tags: [sysadmin, windows, active-directory]
ceh_modules: ["Module 6 - System Hacking"]
objectives:
  - Comprendre le rôle central d'un contrôleur de domaine Active Directory
  - Administrer les objets courants (utilisateurs, groupes, OU) via des outils standards
  - Appliquer des GPO pour standardiser la configuration d'un parc
---

## Introduction

Active Directory (AD) reste, en 2026, l'épine dorsale de la quasi-totalité des systèmes d'information d'entreprise de taille moyenne à grande. Ce chapitre l'aborde du point de vue de celui qui l'administre au quotidien — un point de vue complémentaire à celui du cours Active Directory & Windows, plus centré sur son exploitation offensive.

## Rôle du contrôleur de domaine

<CompareTable
  titleA="Fonction"
  titleB="Ce qu'elle apporte"
  rows={[
    { a: "Annuaire LDAP", b: "Base centralisée des utilisateurs, groupes, ordinateurs et leurs attributs" },
    { a: "Authentification Kerberos", b: "Authentification unique (SSO) sur l'ensemble des ressources du domaine" },
    { a: "DNS intégré", b: "Résolution de noms indispensable au fonctionnement du domaine lui-même" },
    { a: "Stratégies de groupe (GPO)", b: "Application centralisée de configurations sur postes et serveurs" },
]}
/>

<TipCallout>
Un domaine AD dispose presque toujours d'au moins deux contrôleurs de domaine en production — jamais un seul — pour garantir la disponibilité de l'authentification si l'un d'eux tombe en panne.
</TipCallout>

## Administrer les objets courants

<Steps steps={[
  { title: "Unités d'organisation (OU)", description: "Structurent l'annuaire de façon hiérarchique (par service, par site) — c'est sur les OU que s'appliquent les GPO, pas directement sur les utilisateurs." },
  { title: "Groupes de sécurité vs groupes de distribution", description: "Un groupe de sécurité porte des droits d'accès ; un groupe de distribution ne sert qu'à la messagerie — les confondre est une erreur fréquente de conception." },
  { title: "Comptes de service", description: "Comptes dédiés aux applications (jamais un compte utilisateur réel) — avec un mot de passe complexe, une rotation régulière, et le principe du moindre privilège strictement appliqué." },
  { title: "Délégation d'administration", description: "Accorder à une équipe (ex: support niveau 1) le droit de réinitialiser des mots de passe SANS lui donner les droits d'administrateur du domaine." },
]} />

<WarningCallout>
Ajouter un compte à "Administrateurs du domaine" pour résoudre rapidement un problème ponctuel est une pratique dangereuse et très répandue : ces comptes surprivilégiés, une fois oubliés, deviennent des cibles de choix en cas de compromission — c'est précisément ce que recherche un attaquant pratiquant le Kerberoasting étudié dans le cours Active Directory & Windows.
</WarningCallout>

## Les GPO — standardiser sans repasser partout

Les stratégies de groupe (Group Policy Objects) permettent d'appliquer une configuration à tous les postes/serveurs d'une OU en une seule opération, au lieu de la répéter manuellement machine par machine.

```text
Exemples de GPO courantes en entreprise :

- Politique de mot de passe (longueur minimale, complexité, expiration)
- Verrouillage d'écran automatique après inactivité
- Restriction d'exécution de logiciels non autorisés (AppLocker)
- Déploiement automatique d'un antivirus/EDR
- Désactivation de l'exécution de scripts PowerShell non signés
```

<CehCallout>
Une GPO mal restreinte peut elle-même devenir un vecteur d'attaque : un attaquant disposant de droits d'écriture sur une GPO appliquée à l'ensemble du domaine peut y injecter un script malveillant exécuté automatiquement sur tous les postes — la sécurisation des GPO elles-mêmes est un axe d'audit à part entière.
</CehCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Concevoir une structure d'OU", description: "Pour une entreprise avec trois services (Comptabilité, Développement, Direction) répartis sur deux sites, propose une structure d'OU cohérente pour appliquer des GPO différenciées." },
  { title: "Identifier un risque de sur-privilège", description: "Un compte de service utilisé par une application de sauvegarde est membre du groupe Administrateurs du domaine. Quel principe est violé, et quel droit minimal suffirait probablement ?" },
]} />

## En résumé

- Le contrôleur de domaine centralise annuaire, authentification Kerberos, DNS et stratégies de groupe.
- Les unités d'organisation structurent l'annuaire et servent de support à l'application différenciée des GPO.
- Les comptes surprivilégiés (Administrateurs du domaine) et les GPO mal sécurisées comptent parmi les vecteurs d'attaque AD les plus exploités.

## Questions de Révision

1. Pourquoi une entreprise dispose-t-elle presque toujours d'au moins deux contrôleurs de domaine ?
2. Quelle est la différence entre un groupe de sécurité et un groupe de distribution ?
3. Pourquoi une GPO mal sécurisée peut-elle devenir un vecteur d'attaque à l'échelle de tout un domaine ?
