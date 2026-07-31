---
title: Sécurité des bases de données — durcissement et contrôle d'accès
chapter: 5
course: fichiers-bdd
difficulty: intermediate
duration: 35
tags: [securite-bdd, durcissement]
ceh_modules: ["Module 14 - Hacking Web Applications"]
objectives:
  - Appliquer les principes de durcissement à une base de données
  - Comprendre le principe du moindre privilège appliqué aux comptes de base de données
  - Comprendre le chiffrement des données au repos et en transit
---

## Introduction

Ce chapitre applique à la base de données les principes de durcissement et de moindre privilège déjà détaillés aux cours Administration Systèmes et Réseaux et Cybersécurité Défensive — une base de données mal sécurisée reste l'une des cibles les plus critiques d'un système d'information, puisqu'elle concentre souvent l'essentiel des données sensibles.

## Le moindre privilège appliqué aux comptes de base de données

<CehCallout>
Rappel du cours Administration Systèmes et Réseaux (chapitre 7) : un compte applicatif qui se connecte à une base de données ne devrait jamais disposer de droits d'administration complets — un compte dédié avec uniquement les permissions strictement nécessaires (lecture sur certaines tables, écriture sur d'autres) limite considérablement l'impact d'une éventuelle injection SQL réussie.
</CehCallout>

<CompareTable
  titleA="Violation fréquente"
  titleB="Application correcte du moindre privilège"
  rows={[
    { a: "L'application se connecte avec un compte 'root' ou 'sa' aux droits complets", b: "Un compte dédié à l'application, limité aux tables et opérations réellement nécessaires" },
    { a: "Un même compte pour toutes les applications de l'organisation", b: "Un compte distinct par application, limitant l'impact d'une compromission isolée" },
]}
/>

<WarningCallout>
Rappel du cours Sécurité Web (chapitre 3) : si une application souffre d'une injection SQL mais se connecte avec un compte aux droits minimaux (lecture seule sur les tables nécessaires), l'impact d'une exploitation réussie reste bien plus limité que si le compte applicatif dispose de droits d'administration complets sur toute la base.
</WarningCallout>

## Durcir la configuration d'une base de données

<Steps steps={[
  { title: "Changer les identifiants par défaut", description: "Rappel du cours Cybersécurité Offensive (chapitre 5) : de nombreuses bases de données conservent des comptes par défaut documentés publiquement." },
  { title: "Restreindre l'accès réseau", description: "Une base de données ne devrait jamais être directement accessible depuis Internet, rappel du zonage réseau (cours Administration Systèmes et Réseaux, chapitre 1)." },
  { title: "Désactiver les fonctionnalités non utilisées", description: "Certaines bases de données proposent des fonctions d'exécution de commandes système, rarement nécessaires et à désactiver si inutilisées." },
  { title: "Journaliser les accès sensibles", description: "Rappel du cours Analyse SOC (chapitre 3) : les requêtes vers des tables sensibles devraient être journalisées et surveillées comme n'importe quel autre événement critique." },
]} />

## Chiffrement au repos et en transit

<CompareTable
  titleA="Chiffrement au repos"
  titleB="Chiffrement en transit"
  rows={[
    { a: "Protège les données stockées sur le disque du serveur de base de données", b: "Protège les données pendant leur transmission entre l'application et la base de données" },
    { a: "Rappel du cours Cryptographie Avancée (chapitre 2, AES)", b: "Rappel du cours Cryptographie Avancée (chapitre 7, TLS)" },
    { a: "Protège contre le vol physique du support de stockage", b: "Protège contre l'interception réseau (cours DFIR, chapitre 6, forensique réseau)" },
]}
/>

<TipCallout>
Ces deux formes de chiffrement se complètent et répondent à des menaces différentes — chiffrer uniquement en transit laisse les données vulnérables en cas de vol physique du disque ; chiffrer uniquement au repos laisse les données interceptables en transit si le réseau n'est pas de confiance.
</TipCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Limiter l'impact d'une injection SQL", description: "Une application de lecture d'articles se connecte à sa base avec un compte disposant de droits d'écriture sur toutes les tables. Quelle modification de configuration limiterait directement l'impact d'une future injection SQL découverte ?" },
  { title: "Choisir le bon type de chiffrement", description: "Pour protéger des données sensibles à la fois contre le vol physique d'un disque de sauvegarde et contre l'interception réseau, quels types de chiffrement faut-il combiner ?" },
]} />

## En résumé

- Le principe du moindre privilège appliqué aux comptes de base de données limite considérablement l'impact d'une injection SQL réussie.
- Le durcissement d'une base de données passe par le changement des identifiants par défaut, la restriction d'accès réseau et la désactivation des fonctionnalités inutiles.
- Le chiffrement au repos et en transit se complètent, protégeant contre des menaces différentes (vol physique vs interception réseau).

## Questions de Révision

1. Pourquoi un compte applicatif aux droits minimaux limite-t-il l'impact d'une injection SQL réussie ?
2. Cite deux mesures de durcissement applicables à une base de données, au-delà du changement de mot de passe.
3. Pourquoi le chiffrement au repos et en transit sont-ils tous deux nécessaires, l'un ne remplaçant pas l'autre ?
