---
title: Contrôle d'accès cassé et IDOR
chapter: 6
course: web-security
difficulty: intermediate
duration: 40
tags: [web, idor, controle-acces]
ceh_modules: ["Module 14 - Hacking Web Applications"]
objectives:
  - Comprendre pourquoi le contrôle d'accès cassé est la catégorie n°1 de l'OWASP Top 10
  - Identifier et exploiter une référence directe non sécurisée à un objet (IDOR)
  - Distinguer élévation de privilèges verticale et horizontale
---

## Introduction

Depuis l'édition 2021 de l'OWASP Top 10, le contrôle d'accès cassé (Broken Access Control) occupe la première place — devant l'injection. C'est aussi l'une des vulnérabilités les plus simples à comprendre conceptuellement, mais parmi les plus difficiles à couvrir exhaustivement en test, car elle dépend entièrement de la logique métier de chaque application.

## IDOR : Insecure Direct Object Reference

Une IDOR survient quand une application expose une référence directe (souvent un identifiant numérique dans une URL ou un paramètre) à une ressource, sans vérifier que l'utilisateur courant est bien autorisé à y accéder.

```text
Requête légitime (l'utilisateur consulte sa propre facture) :
GET /facture?id=1042

Requête modifiée (IDOR) :
GET /facture?id=1043
→ Si l'application ne vérifie pas que la facture 1043 appartient à l'utilisateur connecté,
  celui-ci accède à la facture d'un autre client.
```

<CehCallout>
L'IDOR est l'une des vulnérabilités les plus simples à tester manuellement : incrémenter ou modifier un identifiant dans l'URL après authentification, et observer si l'accès à la ressource d'un autre utilisateur est accordé.
</CehCallout>

## Élévation de privilèges verticale vs horizontale

<CompareTable
  titleA="Type"
  titleB="Définition"
  rows={[
    { a: "Horizontale", b: "Un utilisateur accède aux données d'un AUTRE utilisateur de même niveau de privilège (ex: la facture d'un autre client)" },
    { a: "Verticale", b: "Un utilisateur accède à des fonctionnalités réservées à un niveau de privilège SUPÉRIEUR (ex: un utilisateur standard accède au panneau admin)" },
  ]}
/>

```text
Exemple d'élévation verticale : un endpoint admin non protégé côté serveur
GET /admin/users  → accessible directement même sans rôle admin,
                     si seule l'INTERFACE (bouton caché) empêchait normalement d'y accéder.
```

<WarningCallout>
Masquer un bouton ou un lien côté frontend ("l'utilisateur ne voit pas le lien donc il ne peut pas y accéder") n'est PAS un contrôle d'accès — c'est de la sécurité par l'obscurité. Le contrôle doit systématiquement être appliqué côté serveur, à chaque requête, indépendamment de l'interface affichée.
</WarningCallout>

## Méthodologie de test du contrôle d'accès

<Steps steps={[
  { title: "Cartographier les rôles disponibles", description: "Identifie les différents niveaux d'utilisateurs de l'application (anonyme, utilisateur standard, admin)." },
  { title: "Créer un compte pour chaque rôle testable", description: "Dispose d'au moins deux comptes de même niveau pour tester le contrôle d'accès horizontal." },
  { title: "Tester systématiquement chaque endpoint avec chaque niveau", description: "Pour chaque fonctionnalité, vérifie qu'un compte de niveau insuffisant reçoit bien un refus (401/403), pas juste une absence de lien dans l'interface." },
  { title: "Tester la modification directe d'identifiants", description: "Incrémente, décrémente ou remplace les identifiants dans les requêtes pour repérer une IDOR." },
]} />

<AuditCallout>
Cette méthodologie de test croisé (matrice rôles × endpoints) est directement issue des bonnes pratiques d'audit — un tableau simple listant chaque endpoint et le résultat attendu/obtenu pour chaque rôle constitue une preuve solide dans un rapport de pentest.
</AuditCallout>

## Contre-mesures

<AttackDefenseTable rows={[
  { phase: "IDOR", attack: "Modifier un identifiant dans l'URL pour accéder à la ressource d'un autre utilisateur", defense: "Vérifier systématiquement, côté serveur, que la ressource demandée appartient bien à l'utilisateur authentifié" },
  { phase: "Élévation verticale", attack: "Accéder directement à un endpoint admin non protégé", defense: "Middleware d'autorisation centralisé, appliqué à chaque route, jamais délégué au seul frontend" },
  { phase: "Principe général", attack: "Confiance implicite dans les données envoyées par le client", defense: "Ne jamais faire confiance à un identifiant, un rôle ou une permission envoyé par le client sans le revalider côté serveur" },
]} />

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell)

<Steps steps={[
  { title: "Identifier une référence directe à un objet", description: "Repère une URL ou un paramètre contenant un identifiant numérique de ressource (ex: ?id=42)." },
  { title: "Tester une IDOR", description: "Modifie l'identifiant et observe si l'accès à la ressource d'un autre utilisateur est accordé.", code: "curl -s 'http://10.10.0.10/facture?id=43' -H 'Cookie: session=TON_TOKEN'" },
  { title: "Tester un endpoint admin directement", description: "Tente d'accéder directement à un chemin admin supposé protégé, sans passer par l'interface.", code: "curl -s 'http://10.10.0.10/admin/users' -H 'Cookie: session=TOKEN_UTILISATEUR_STANDARD'" },
]} />

## En résumé

- Le contrôle d'accès cassé est la catégorie n°1 de l'OWASP Top 10 2021.
- Une IDOR permet d'accéder à une ressource d'un autre utilisateur en modifiant une référence directe (identifiant).
- L'élévation horizontale touche un utilisateur de même niveau ; la verticale accède à un niveau de privilège supérieur.
- Le contrôle d'accès doit toujours être vérifié côté serveur — jamais délégué au seul affichage de l'interface.

## Questions de Révision

1. Quelle est la différence entre une élévation de privilèges horizontale et verticale ?
2. Pourquoi masquer un bouton côté frontend n'est-il pas un contrôle d'accès valide ?
3. Décris la méthodologie de test croisé rôles × endpoints.
