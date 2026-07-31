---
title: Bases de données NoSQL — principes et cas d'usage
chapter: 4
course: fichiers-bdd
difficulty: intermediate
duration: 30
tags: [nosql, mongodb, redis]
ceh_modules: ["Module 14 - Hacking Web Applications"]
objectives:
  - Comprendre pourquoi le NoSQL a émergé en complément du relationnel
  - Distinguer les grandes familles de bases NoSQL
  - Comprendre les enjeux de sécurité spécifiques au NoSQL
---

## Introduction

Ce chapitre complète le modèle relationnel du chapitre précédent par les bases NoSQL, largement utilisées dans les applications web modernes déjà étudiées au cours Sécurité Web, et pour le cache déjà rencontré via Redis dans l'infrastructure Nyx elle-même.

## Pourquoi le NoSQL a émergé

<CehCallout>
Le modèle relationnel impose une structure de tables fixe (un schéma défini à l'avance) — le NoSQL a émergé pour répondre à des besoins où cette rigidité devient un frein : données très volumineuses, structure changeante, ou besoin de performance extrême sur des opérations simples (comme le cache Redis utilisé par Nyx elle-même).
</CehCallout>

## Les grandes familles de bases NoSQL

<CompareTable
  titleA="Famille"
  titleB="Principe et exemple"
  rows={[
    { a: "Document", b: "Stocke des documents structurés (souvent JSON), schéma flexible d'un document à l'autre — ex : MongoDB" },
    { a: "Clé-valeur", b: "Stockage et récupération ultra-rapide par clé unique — ex : Redis, déjà utilisé pour le cache de Nyx" },
    { a: "Colonne large", b: "Optimisée pour d'immenses volumes de données réparties sur de nombreux serveurs — ex : Cassandra" },
    { a: "Graphe", b: "Optimisée pour les relations complexes entre entités — ex : Neo4j, le même principe que BloodHound (cours Active Directory)" },
]}
/>

<TipCallout>
Rappel de l'infrastructure Nyx elle-même : Redis (base clé-valeur) sert de cache pour accélérer les requêtes fréquentes — un exemple concret et déjà familier de base NoSQL utilisée pour un besoin de performance extrême plutôt que de structure relationnelle complexe.
</TipCallout>

## Relationnel vs NoSQL — un choix selon le besoin, pas une hiérarchie

<CompareTable
  titleA="Relationnel (SQL)"
  titleB="NoSQL"
  rows={[
    { a: "Schéma fixe, cohérence forte entre tables", b: "Schéma flexible, adapté à des données hétérogènes" },
    { a: "Adapté aux données fortement structurées et relationnelles", b: "Adapté à de très grands volumes ou des besoins de performance spécifiques" },
    { a: "Transactions ACID robustes par défaut", b: "Certaines bases NoSQL sacrifient une part de cohérence pour la performance (compromis CAP)" },
]}
/>

## Enjeux de sécurité spécifiques au NoSQL

<WarningCallout>
Contrairement à une idée reçue, l'absence de SQL classique ne signifie pas l'absence d'injection : la "NoSQL injection" existe bien, exploitant la façon dont certaines bases (comme MongoDB) interprètent des opérateurs spéciaux dans une requête mal validée, avec un impact similaire à l'injection SQL classique déjà étudiée au cours Sécurité Web.
</WarningCallout>

```text
Exemple simplifié de NoSQL injection (MongoDB) :

Requête prévue : { "utilisateur": saisie_utilisateur, "motDePasse": saisie_mdp }

Si un attaquant soumet comme mot de passe : { "$ne": null }
La requête devient : { "utilisateur": "admin", "motDePasse": { "$ne": null } }
Cette condition est presque toujours vraie, contournant l'authentification.
```

<CehCallout>
Ce mécanisme rejoint directement le principe de l'injection SQL (chapitre 3) : une entrée non validée modifie la structure logique d'une requête plutôt que d'être traitée comme une simple valeur — la défense reste la même en substance : valider et structurer rigoureusement les entrées, jamais construire une requête par simple concaténation.
</CehCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Choisir la bonne famille NoSQL", description: "Pour un système de cache de session utilisateur nécessitant une lecture/écriture ultra-rapide par identifiant unique, quelle famille NoSQL choisirais-tu ?" },
  { title: "Identifier le principe commun aux injections", description: "Explique en une phrase le point commun entre l'injection SQL classique et la NoSQL injection présentée ci-dessus." },
]} />

## En résumé

- Le NoSQL a émergé pour répondre à des besoins de flexibilité de schéma, de volume ou de performance que le modèle relationnel rigide gère moins bien.
- Document, clé-valeur, colonne large et graphe sont les quatre grandes familles de bases NoSQL, chacune adaptée à un besoin distinct.
- La NoSQL injection existe bien, exploitant des opérateurs spéciaux mal validés, avec un principe et une défense similaires à l'injection SQL classique.

## Questions de Révision

1. Pourquoi le NoSQL a-t-il émergé en complément du modèle relationnel plutôt qu'en remplacement ?
2. À quelle famille NoSQL appartient Redis, déjà utilisé dans l'infrastructure Nyx, et pour quel usage ?
3. Quel principe commun relie l'injection SQL classique et la NoSQL injection sur MongoDB ?
