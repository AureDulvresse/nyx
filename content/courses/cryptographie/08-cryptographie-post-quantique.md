---
title: Cryptographie post-quantique et perspectives
chapter: 8
course: cryptographie
difficulty: advanced
duration: 35
tags: [cryptographie, post-quantique, nist]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Comprendre pourquoi l'informatique quantique menace la cryptographie actuelle
  - Distinguer les algorithmes vulnérables des algorithmes résistants
  - Situer l'état d'avancement de la standardisation post-quantique
---

## Introduction

Ce dernier chapitre referme le cours en tournant le regard vers l'avenir : l'informatique quantique, encore embryonnaire en 2026 pour un usage offensif à grande échelle, représente néanmoins une menace suffisamment sérieuse pour que des organismes comme le NIST aient déjà standardisé de nouveaux algorithmes de remplacement.

## Pourquoi l'informatique quantique menace la cryptographie actuelle

<CehCallout>
L'algorithme de Shor, conçu pour un ordinateur quantique suffisamment puissant, permettrait de factoriser de grands nombres et de résoudre le problème du logarithme discret de façon radicalement plus rapide qu'un ordinateur classique — cassant directement RSA et ECC, les deux piliers du chiffrement asymétrique vus au chapitre 3.
</CehCallout>

<CompareTable
  titleA="Algorithme"
  titleB="Vulnérabilité face à un ordinateur quantique suffisamment puissant"
  rows={[
    { a: "RSA", b: "Cassé — repose sur la factorisation, résolue efficacement par l'algorithme de Shor" },
    { a: "ECC (ECDSA, ECDHE)", b: "Cassé — repose sur le logarithme discret, également résolu par Shor" },
    { a: "AES (symétrique)", b: "Affaibli mais pas cassé — l'algorithme de Grover réduit la sécurité effective de moitié, compensable en doublant la taille de clé" },
    { a: "SHA-256 (hachage)", b: "Affaibli de façon similaire, également compensable par des tailles de sortie plus grandes" },
]}
/>

<TipCallout>
C'est précisément l'asymétrie de cette menace (le chiffrement asymétrique est cassé, le symétrique seulement affaibli) qui explique pourquoi la cryptographie post-quantique se concentre presque exclusivement sur le remplacement de RSA et ECC, pas sur AES.
</TipCallout>

## "Harvest now, decrypt later" — une menace déjà actuelle

<WarningCallout>
Une organisation traitant des données devant rester confidentielles pendant des décennies (secrets d'État, données médicales, propriété intellectuelle) fait déjà face à une menace concrète aujourd'hui : un adversaire peut intercepter et stocker du trafic chiffré maintenant, dans l'attente qu'un ordinateur quantique suffisamment puissant permette de le déchiffrer plus tard. Attendre l'arrivée réelle de l'informatique quantique pour migrer serait alors déjà trop tard pour ces données.
</WarningCallout>

## La standardisation NIST des algorithmes post-quantiques

<Steps steps={[
  { title: "Concours public international", description: "Le NIST a lancé un processus de sélection ouvert, comparable à celui qui avait abouti à AES, pour identifier des algorithmes résistants aux attaques quantiques." },
  { title: "Sélection de CRYSTALS-Kyber", description: "Standardisé pour l'échange de clé (remplaçant progressif de RSA/ECDHE), basé sur des réseaux euclidiens (lattice-based cryptography)." },
  { title: "Sélection de CRYSTALS-Dilithium", description: "Standardisé pour les signatures numériques (remplaçant progressif de RSA/ECDSA), également basé sur les réseaux euclidiens." },
  { title: "Déploiement progressif hybride", description: "De nombreuses implémentations combinent actuellement un algorithme classique ET post-quantique simultanément, par prudence pendant la période de transition." },
]} />

<CehCallout>
L'approche hybride (combiner ECDHE classique et Kyber post-quantique dans un même handshake TLS) est déjà déployée par plusieurs grands fournisseurs cloud et navigateurs — une stratégie de transition prudente qui protège contre une éventuelle faiblesse non encore découverte dans les nouveaux algorithmes, tout en anticipant la menace quantique.
</CehCallout>

## Ce que cela signifie concrètement pour un professionnel de la sécurité

<CompareTable
  titleA="Aujourd'hui"
  titleB="À anticiper"
  rows={[
    { a: "AES-256 et SHA-256 restent recommandés sans changement", b: "Rien à changer sur le chiffrement symétrique à court terme" },
    { a: "RSA et ECC restent utilisables pour la majorité des usages courants", b: "Planifier une migration vers des algorithmes hybrides pour les données à très longue durée de vie" },
    { a: "Suivre les recommandations mises à jour de l'ANSSI et du NIST", b: "Ne pas migrer précipitamment vers des implémentations expérimentales non standardisées" },
]}
/>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Identifier un cas d'usage prioritaire", description: "Une entreprise pharmaceutique conserve des données de recherche devant rester confidentielles pendant 30 ans. Pourquoi la menace quantique est-elle déjà pertinente pour elle aujourd'hui, même sans ordinateur quantique opérationnel ?" },
  { title: "Expliquer l'asymétrie de la menace", description: "Pourquoi la cryptographie post-quantique se concentre-t-elle sur le remplacement de RSA/ECC plutôt que sur AES ?" },
]} />

## En résumé

- L'algorithme de Shor menace directement RSA et ECC ; AES et SHA-256 sont seulement affaiblis, pas cassés.
- Le scénario "harvest now, decrypt later" rend la menace quantique déjà pertinente aujourd'hui pour les données à longue durée de vie.
- Le NIST a standardisé CRYSTALS-Kyber (échange de clé) et CRYSTALS-Dilithium (signatures), souvent déployés en mode hybride avec les algorithmes classiques pendant la transition.

## Questions de Révision

1. Pourquoi l'algorithme de Shor menace-t-il RSA et ECC mais pas AES de la même façon ?
2. Qu'est-ce que la stratégie "harvest now, decrypt later", et pourquoi rend-elle la menace quantique déjà actuelle ?
3. Pourquoi de nombreuses implémentations combinent-elles actuellement un algorithme classique et un algorithme post-quantique plutôt que de migrer entièrement vers ce dernier ?

Félicitations, tu viens de terminer le cours **Cryptographie Avancée** ! Ces fondations mathématiques et pratiques s'appliquent directement aux cours Sécurité Web (TLS/HTTPS), Active Directory (Kerberos) et Droit et Réglementation (protection des données) — continue vers **Mathématiques Appliquées** pour renforcer les bases utilisées ici.
