---
title: Sécurité des API REST — OWASP API Security Top 10
chapter: 2
course: securite-applications-api
difficulty: intermediate
duration: 40
tags: [api-rest, owasp-api, bola]
ceh_modules: ["Module 14 - Hacking Web Applications"]
objectives:
  - Comprendre pourquoi les API nécessitent un référentiel de sécurité dédié
  - Comprendre les vulnérabilités les plus critiques de l'OWASP API Security Top 10
  - Distinguer BOLA d'un IDOR classique
---

## Introduction

Ce chapitre présente l'OWASP API Security Top 10, un référentiel distinct de l'OWASP Top 10 classique déjà étudié au cours Sécurité Web — les API, de plus en plus au cœur des architectures modernes, exposent des risques spécifiques que le Top 10 web généraliste ne couvre pas complètement.

## Pourquoi un référentiel spécifique aux API

<CehCallout>
Une API expose généralement sa logique métier de façon plus directe et plus granulaire qu'une application web traditionnelle — chaque endpoint correspond souvent à une action précise sur une ressource précise, ce qui déplace le centre de gravité des vulnérabilités vers le contrôle d'accès au niveau de chaque objet, plutôt que vers l'injection classique (rappel cours Sécurité Web, chapitre 3).
</CehCallout>

## BOLA — Broken Object Level Authorization

<WarningCallout>
BOLA (API1:2023), la vulnérabilité la plus critique du référentiel API, survient quand une API vérifie qu'un utilisateur est authentifié mais ne vérifie pas qu'il a le droit d'accéder à l'objet précis qu'il demande — un attaquant modifie simplement un identifiant dans l'URL ou le corps de la requête pour accéder aux données d'un autre utilisateur.
</WarningCallout>

```text
Requête légitime de l'utilisateur 42 :
GET /api/commandes/42

Requête BOLA — l'utilisateur 42 accède aux données de l'utilisateur 43 :
GET /api/commandes/43
(si l'API ne vérifie pas que la commande 43 appartient bien à l'utilisateur authentifié)
```

<TipCallout>
Rappel du cours Sécurité Web (chapitre 6, IDOR) : BOLA est en réalité une IDOR appliquée spécifiquement au niveau des objets exposés par une API — le principe est identique, mais BOLA est reconnu comme la vulnérabilité API la plus répandue et la plus critique, tant les API l'exposent naturellement par leur structure orientée ressources.
</TipCallout>

## Les autres vulnérabilités critiques du référentiel

<CompareTable
  titleA="Vulnérabilité API"
  titleB="Principe"
  rows={[
    { a: "Broken Authentication (API2)", b: "Mécanismes d'authentification faibles ou mal implémentés spécifiquement sur les endpoints API" },
    { a: "Broken Object Property Level Authorization (API3)", b: "L'utilisateur accède à l'objet mais peut lire ou modifier des propriétés qu'il ne devrait pas voir (ex : le champ 'role' d'un profil)" },
    { a: "Unrestricted Resource Consumption (API4)", b: "Absence de limitation de débit (rate limiting), permettant un abus de ressources ou un déni de service applicatif" },
    { a: "Broken Function Level Authorization (API5)", b: "Un utilisateur standard accède à des endpoints réservés aux administrateurs, faute de vérification côté serveur" },
    { a: "Server Side Request Forgery (API7)", b: "Rappel du cours Sécurité Web (chapitre 7) : une API qui récupère une ressource depuis une URL fournie par le client sans validation" },
]}
/>

## Le sur-exposition de données (Excessive Data Exposure)

<CehCallout>
Une erreur fréquente consiste à renvoyer l'intégralité d'un objet interne (base de données) dans la réponse d'une API, en comptant sur le client (l'application front-end) pour filtrer les champs sensibles avant affichage — un attaquant qui inspecte directement la réponse brute de l'API, en contournant l'interface graphique, peut alors voir des champs jamais destinés à être affichés (mot de passe haché, informations internes).
</CehCallout>

<WarningCallout>
Rappel du principe de moindre privilège déjà vu à plusieurs reprises (cours Administration Systèmes et Réseaux, Fichiers et Bases de Données) : une API doit filtrer explicitement, côté serveur, les champs renvoyés à chaque client selon ses droits — jamais faire confiance au client pour ne pas afficher un champ sensible qu'il a pourtant reçu.
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell)

<Steps steps={[
  { title: "Identifier une BOLA potentielle", description: "Observe les requêtes d'une API qui expose des identifiants numériques séquentiels dans ses URLs (ex : /api/commandes/42). Modifie l'identifiant pour tenter d'accéder à une ressource d'un autre compte.", code: 'curl -H "Authorization: Bearer <token_utilisateur_42>" http://10.10.0.10/api/commandes/43' },
  { title: "Expliquer la différence entre BOLA et Excessive Data Exposure", description: "En quoi ces deux vulnérabilités, bien que proches, ciblent-elles des angles différents du contrôle d'accès aux données d'une API ?" },
]} />

## En résumé

- L'OWASP API Security Top 10 est un référentiel distinct de l'OWASP Top 10 web classique, adapté aux risques spécifiques des API.
- BOLA, la vulnérabilité API la plus critique, est une forme d'IDOR appliquée à la structure orientée ressources des API.
- L'excessive data exposure survient quand une API renvoie des champs sensibles en comptant, à tort, sur le client pour les filtrer avant affichage.

## Questions de Révision

1. Pourquoi les API nécessitent-elles un référentiel de sécurité distinct de l'OWASP Top 10 web classique ?
2. En quoi BOLA se rapproche-t-il d'une IDOR déjà étudiée au cours Sécurité Web ?
3. Pourquoi une API ne doit-elle jamais compter sur le client pour filtrer les champs sensibles d'une réponse ?
