---
title: Sécurité des API REST — OWASP API Security Top 10
chapter: 2
course: securite-applications-api
difficulty: intermediate
duration: 60
tags: [api-rest, owasp-api, bola, bopla, rate-limiting, inventaire]
ceh_modules: ["Module 14 - Hacking Web Applications"]
objectives:
  - Comprendre pourquoi les API nécessitent un référentiel de sécurité dédié
  - Connaître les dix catégories de l'OWASP API Security Top 10 (édition 2023)
  - Distinguer BOLA, BOPLA et BFLA et savoir les corriger dans le code
  - Concevoir les défenses transverses d'une API (filtrage des réponses, limitation de débit, inventaire)
---

## Introduction

Le cours Sécurité Web t'a présenté l'OWASP Top 10, centré sur les applications web classiques. Les API, désormais au cœur des architectures modernes (applications mobiles, front-ends JavaScript, intégrations entre partenaires, microservices), exposent des risques spécifiques que ce Top 10 généraliste ne couvre pas complètement. L'OWASP publie donc un référentiel distinct : l'**OWASP API Security Top 10**, dont l'édition en vigueur date de **2023**.

Ce chapitre présente ce référentiel avec un angle de concepteur et de défenseur. Tu apprendras à reconnaître chaque catégorie, à comprendre pourquoi elle apparaît dans une API, à la repérer dans le code et à la corriger. À la fin, tu sauras expliquer pourquoi le contrôle d'accès au niveau de l'objet est le centre de gravité de la sécurité des API.

## Pourquoi un référentiel spécifique aux API

Une API expose sa logique métier de façon plus directe et plus granulaire qu'une application web traditionnelle. Chaque endpoint correspond souvent à une action précise sur une ressource précise : lire la commande 42, modifier le profil 7, supprimer le fichier 1290. Il n'y a plus d'interface graphique pour « guider » l'utilisateur ; le client appelle ce qu'il veut, avec les paramètres qu'il veut.

<CehCallout>
Parce que chaque endpoint correspond souvent à une action précise sur une ressource précise, les API déplacent le centre de gravité des vulnérabilités vers le contrôle d'accès au niveau de chaque objet, plutôt que vers l'injection classique étudiée au chapitre 3 du cours Sécurité Web. Les trois premières catégories du référentiel 2023 portent d'ailleurs sur l'autorisation et l'authentification.
</CehCallout>

## Vue d'ensemble de l'OWASP API Security Top 10 (2023)

<CompareTable
  titleA="Categorie (edition 2023)"
  titleB="Principe"
  rows={[
    { a: "API1 - Broken Object Level Authorization (BOLA)", b: "L'API ne verifie pas que l'utilisateur a le droit d'acceder a l'objet precis demande" },
    { a: "API2 - Broken Authentication", b: "Mecanismes d'authentification faibles ou mal implementes sur les endpoints" },
    { a: "API3 - Broken Object Property Level Authorization (BOPLA)", b: "L'utilisateur accede a l'objet mais peut lire ou modifier des proprietes qu'il ne devrait pas voir" },
    { a: "API4 - Unrestricted Resource Consumption", b: "Absence de limites (debit, taille, cout), permettant abus de ressources ou deni de service" },
    { a: "API5 - Broken Function Level Authorization (BFLA)", b: "Un utilisateur standard atteint des fonctions reservees a un role superieur" },
    { a: "API6 - Unrestricted Access to Sensitive Business Flows", b: "Un flux metier sensible (achat, reservation, inscription) est automatisable a grande echelle" },
    { a: "API7 - Server Side Request Forgery (SSRF)", b: "L'API recupere une ressource depuis une URL fournie par le client sans la valider" },
    { a: "API8 - Security Misconfiguration", b: "Configuration non durcie : CORS permissif, messages d'erreur verbeux, en-tetes absents" },
    { a: "API9 - Improper Inventory Management", b: "Versions anciennes, endpoints de test ou API non documentees restees exposees" },
    { a: "API10 - Unsafe Consumption of APIs", b: "Confiance excessive dans les donnees renvoyees par des API tierces" },
  ]}
/>

## BOLA — Broken Object Level Authorization

**BOLA** (API1:2023) est la vulnérabilité la plus critique et la plus répandue du référentiel. Elle survient quand une API vérifie qu'un utilisateur est authentifié, mais ne vérifie pas qu'il a le droit d'accéder à l'objet précis qu'il demande. En changeant un identifiant dans l'URL ou le corps de la requête, un utilisateur atteint les données d'un autre.

```text
Requete legitime de l'utilisateur proprietaire de la commande 42 :
GET /api/commandes/42

Risque BOLA : le meme utilisateur demande la commande d'un autre client
GET /api/commandes/43
(si l'API ne verifie pas que la commande 43 lui appartient)
```

<TipCallout>
BOLA est en réalité une IDOR (chapitre 6 du cours Sécurité Web) appliquée aux objets exposés par une API. Le principe est identique, mais BOLA est reconnue comme la vulnérabilité API la plus répandue, parce que la structure orientée ressources des API l'expose naturellement : chaque endpoint de type `/ressource/{id}` est un candidat.
</TipCallout>

La correction se fait dans le code, à chaque accès : la requête qui charge l'objet doit être restreinte à ce que l'utilisateur authentifié a le droit de voir.

```javascript
// VULNERABLE : l'objet est charge par identifiant seul
const commande = await db.commande.findUnique({ where: { id: req.params.id } })

// CORRIGE : la requete restreint l'objet au proprietaire authentifie
const commande = await db.commande.findFirst({
  where: { id: req.params.id, clientId: req.user.id },
})
if (!commande) return res.status(404).end()
```

Des identifiants aléatoires (UUID) plutôt que séquentiels rendent l'énumération plus difficile, mais ne remplacent jamais cette vérification.

## BOPLA — l'autorisation au niveau des propriétés

**BOPLA** (API3:2023) fusionne deux catégories de l'édition 2019 : l'**exposition excessive de données** (Excessive Data Exposure) et l'**assignation de masse** (Mass Assignment). Dans les deux cas, l'utilisateur a bien le droit d'accéder à l'objet, mais pas à toutes ses propriétés.

L'exposition excessive survient quand l'API renvoie l'intégralité d'un objet interne en comptant sur le client (le front-end) pour filtrer les champs sensibles avant affichage. Or un client qui inspecte directement la réponse brute, sans passer par l'interface, voit tous les champs : hash de mot de passe, rôle, notes internes. L'assignation de masse est le symétrique en écriture : l'API copie aveuglément tous les champs reçus dans l'objet, ce qui permet de modifier une propriété comme `role` ou `solde`.

<WarningCallout>
Une API ne doit jamais compter sur le client pour filtrer les champs sensibles d'une réponse. C'est une violation du principe de moindre privilège appliqué au filtrage côté serveur. La défense est de définir explicitement, côté serveur, les champs renvoyés (objet de transfert dédié ou schéma de sérialisation) et les champs modifiables (liste d'autorisation), selon les droits de l'appelant.
</WarningCallout>

```javascript
// CORRIGE : seuls les champs explicitement autorises sont renvoyes...
const { id, nom, email } = utilisateur
res.json({ id, nom, email })

// ...et seuls les champs explicitement modifiables sont acceptes
const { nom, email } = req.body
await db.utilisateur.update({ where: { id: req.user.id }, data: { nom, email } })
```

La différence avec BOLA est importante : BOLA porte sur l'accès à un objet entier appartenant à un autre utilisateur, tandis que l'exposition excessive concerne des champs sensibles renvoyés en trop dans une réponse à laquelle on a pourtant droit.

## BFLA — l'autorisation au niveau des fonctions

**BFLA** (API5:2023) survient quand un utilisateur standard peut appeler des endpoints réservés à un rôle supérieur, faute de vérification côté serveur. Alors que BOLA concerne l'accès à un objet précis appartenant à un autre utilisateur, BFLA concerne l'accès à des fonctions entières : `DELETE /api/utilisateurs/12`, `POST /api/admin/remboursement`. La défense est un contrôle de rôle centralisé, appliqué par défaut à toutes les routes, avec refus par défaut.

## Les autres catégories à connaître

L'**authentification cassée** (API2) recouvre les jetons mal validés, l'absence de limitation sur les endpoints de connexion ou de réinitialisation, et les clés API transmises dans l'URL ; elle est détaillée au chapitre 3. La **consommation non restreinte de ressources** (API4) rappelle qu'une API doit limiter le débit, la taille des requêtes, la pagination et le coût des opérations, sous peine de déni de service ou de facture cloud démesurée. L'**accès non restreint aux flux métier sensibles** (API6) concerne l'automatisation abusive d'un flux légitime, comme l'achat en masse de billets par des robots : la défense relève de la détection d'automatisation et de limites métier. Le **SSRF** (API7) est le même mécanisme qu'au chapitre 7 du cours Sécurité Web. La **mauvaise gestion de l'inventaire** (API9) rappelle qu'une ancienne version `/v1` oubliée, moins protégée, reste une porte d'entrée. Enfin, la **consommation non sécurisée d'API tierces** (API10) demande de valider les réponses d'un partenaire comme n'importe quelle entrée non fiable.

<AuditCallout>
Un inventaire à jour des API exposées, avec leurs versions, leur propriétaire et leur documentation (par exemple une spécification OpenAPI), est la base de toute gestion de la sécurité des API. L'ISO/IEC 27001:2022 exige l'inventaire des actifs informationnels (thème A.5), et le NIST CSF 2.0 place la gestion des actifs dans la fonction Identify.
</AuditCallout>

## Angle offensif et défensif

<AttackDefenseTable rows={[
  { phase: "BOLA", attack: "Changer l'identifiant d'objet pour atteindre la ressource d'un autre client", defense: "Verifier la propriete de l'objet a chaque requete, cote serveur" },
  { phase: "BOPLA", attack: "Lire des champs internes ou modifier une propriete comme le role", defense: "Liste explicite des champs renvoyes et des champs modifiables" },
  { phase: "BFLA", attack: "Appeler une fonction d'administration avec un compte standard", defense: "Controle de role centralise, refus par defaut" },
  { phase: "Ressources", attack: "Saturer l'API ou abuser d'un flux metier", defense: "Limitation de debit, quotas, pagination bornee, detection d'automatisation" },
  { phase: "Inventaire", attack: "Cibler une ancienne version oubliee", defense: "Inventaire des API, decommissionnement des versions obsoletes" },
]} />

## Erreurs fréquentes

L'erreur la plus courante est de vérifier l'authentification en pensant avoir vérifié l'autorisation. La deuxième est de renvoyer l'objet complet de la base « parce que le front-end n'affiche que ce qu'il faut ». La troisième est de lier directement le corps de la requête au modèle de données, ouvrant la porte à l'assignation de masse. La quatrième est de laisser en ligne d'anciennes versions d'API non maintenues. Enfin, beaucoup d'équipes oublient de limiter le débit sur les endpoints coûteux ou sensibles, comme la connexion ou l'envoi de SMS.

## Lab — Mise en pratique

**Environnement** : Kali Linux (terminal Nyx Shell) et API de lab (observation et correction)

<Steps steps={[
  { title: "Inventorier l'API", description: "A partir de la documentation OpenAPI de l'API de lab, liste les endpoints, leur methode et le role cense y acceder." },
  { title: "Observer une réponse brute", description: "Appelle un endpoint de profil avec ton propre jeton et examine la reponse JSON complete : contient-elle des champs que l'interface n'affiche pas ?", code: "curl -s -H \"Authorization: Bearer <ton_jeton>\" http://10.10.0.10/api/profil | python3 -m json.tool" },
  { title: "Analyser le contrôle d'objet", description: "Dans le code du lab, repere la fonction qui charge une commande et verifie si la requete est restreinte au proprietaire authentifie." },
  { title: "Corriger BOLA", description: "Ajoute la restriction au proprietaire dans la requete et renvoie un 404 si l'objet n'appartient pas a l'appelant." },
  { title: "Corriger BOPLA", description: "Remplace la serialisation de l'objet complet par une liste explicite de champs, et filtre les champs acceptes en ecriture." },
  { title: "Ajouter une limitation de débit", description: "Configure une limite de requetes par client sur les endpoints sensibles et observe la reponse 429 au-dela du seuil." },
  { title: "Vérifier les corrections", description: "Avec deux comptes de test, confirme que chacun ne voit plus que ses propres objets et que les champs internes ont disparu des reponses." },
]} />

## À retenir

- L'OWASP API Security Top 10 (2023) est distinct du Top 10 web, adapté à la structure orientée ressources des API.
- BOLA (API1) est la vulnérabilité API la plus critique : une IDOR appliquée aux objets d'une API.
- BOPLA (API3) fusionne exposition excessive de données et assignation de masse ; on la corrige par des listes explicites de champs.
- BFLA (API5) concerne l'accès à des fonctions entières réservées à un rôle, et se corrige par un contrôle de rôle centralisé.
- La limitation de débit (API4), l'inventaire des API (API9) et la validation des API tierces (API10) complètent la défense.
- Une API ne doit jamais compter sur le client pour filtrer les données sensibles.

## Questions de révision

1. Pourquoi les API nécessitent-elles un référentiel distinct de l'OWASP Top 10 web ?
2. En quoi BOLA se rapproche-t-elle d'une IDOR, et pourquoi est-elle si répandue dans les API ?
3. Quelle est la différence entre BOLA et l'exposition excessive de données ?
4. Quelles anciennes catégories de 2019 ont été fusionnées dans BOPLA, et comment la corriger ?
5. En quoi BFLA diffère-t-elle de BOLA ?
6. Pourquoi l'absence de limitation de débit est-elle une vulnérabilité à part entière ?
7. Pourquoi une ancienne version d'API oubliée constitue-t-elle un risque ?
