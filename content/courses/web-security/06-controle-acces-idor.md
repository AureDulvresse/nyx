---
title: Contrôle d'accès cassé et IDOR
chapter: 6
course: web-security
difficulty: intermediate
duration: 55
tags: [web, idor, controle-acces, autorisation, moindre-privilege]
ceh_modules: ["Module 14 - Hacking Web Applications"]
objectives:
  - Comprendre pourquoi le contrôle d'accès cassé est la catégorie n°1 de l'OWASP Top 10
  - Reconnaître une référence directe non sécurisée à un objet (IDOR) dans le code
  - Distinguer élévation de privilèges verticale et horizontale
  - Concevoir et vérifier un contrôle d'accès centralisé et appliqué côté serveur
---

## Introduction

Depuis l'édition 2021 de l'OWASP Top 10, le contrôle d'accès cassé (**Broken Access Control**) occupe la première place, devant l'injection, et il la conserve dans l'édition 2025. C'est l'une des vulnérabilités les plus simples à comprendre conceptuellement, mais parmi les plus difficiles à couvrir exhaustivement, car elle dépend entièrement de la logique métier propre à chaque application : aucun outil ne connaît, à votre place, qui a le droit d'accéder à quoi.

Ce chapitre t'apprend à reconnaître les deux grandes formes de contrôle d'accès cassé, à les repérer dans le code, et à concevoir une autorisation robuste, centralisée et vérifiable. L'angle offensif reste conceptuel et sert à comprendre ce que la défense doit garantir.

## IDOR : référence directe non sécurisée à un objet

Une **IDOR** (Insecure Direct Object Reference) survient quand une application expose une référence directe à une ressource, souvent un identifiant numérique dans une URL ou un paramètre, sans vérifier que l'utilisateur courant est autorisé à y accéder. L'application confond alors deux questions distinctes : « l'utilisateur est-il authentifié ? » et « a-t-il le droit d'accéder à cet objet précis ? ».

```text
Requete legitime (l'utilisateur consulte sa propre facture) :
GET /facture?id=1042

Requete modifiee (IDOR) :
GET /facture?id=1043
-> Si l'application ne verifie pas que la facture 1043 appartient a l'utilisateur
   connecte, celui-ci accede a la facture d'un autre client.
```

<CehCallout>
L'IDOR est l'une des vulnérabilités les plus simples à comprendre : il suffit qu'une application s'appuie sur un identifiant fourni par le client sans revérifier la propriété de la ressource côté serveur. La correction tient en une règle : à chaque accès, vérifier que la ressource demandée appartient bien à l'utilisateur authentifié, ou qu'il a le rôle requis pour y accéder.
</CehCallout>

## Élévation de privilèges verticale et horizontale

<CompareTable
  titleA="Type"
  titleB="Definition"
  rows={[
    { a: "Horizontale", b: "Un utilisateur accede aux donnees d'un AUTRE utilisateur de meme niveau de privilege (ex : la facture d'un autre client)" },
    { a: "Verticale", b: "Un utilisateur accede a des fonctionnalites reservees a un niveau de privilege SUPERIEUR (ex : un utilisateur standard atteint le panneau d'administration)" },
  ]}
/>

```text
Exemple d'elevation verticale : un endpoint d'administration non protege cote serveur
GET /admin/users -> accessible directement meme sans role admin,
                    si seule l'INTERFACE (un bouton cache) empechait normalement d'y acceder.
```

La distinction est importante car les deux formes appellent la même discipline : l'autorisation doit être vérifiée côté serveur à chaque requête, pour chaque objet et pour chaque fonction.

<WarningCallout>
Masquer un bouton ou un lien côté frontend — « l'utilisateur ne voit pas le lien, donc il ne peut pas y accéder » — n'est PAS un contrôle d'accès, c'est de la sécurité par l'obscurité. Un utilisateur peut toujours appeler directement l'endpoint correspondant. Le contrôle doit systématiquement être appliqué côté serveur, indépendamment de l'interface affichée.
</WarningCallout>

## Reconnaître le défaut dans le code

Le signal d'alerte en revue de code est une opération qui charge une ressource à partir d'un identifiant fourni par le client **sans clause restreignant la ressource au propriétaire ou au rôle autorisé**.

```python
# VULNERABLE : la ressource est chargee par identifiant sans verifier le proprietaire
facture = Facture.get(request.args["id"])
return facture.to_json()

# CORRIGE : la requete elle-meme restreint au proprietaire authentifie
facture = Facture.get(id=request.args["id"], owner=current_user.id)
if facture is None:
    abort(404)
return facture.to_json()
```

De même, une route d'administration doit être protégée par une vérification de rôle centralisée, appliquée par un intergiciel (middleware) sur toutes les routes concernées, et non laissée à l'appréciation de chaque contrôleur.

## Concevoir un contrôle d'accès robuste

<Steps steps={[
  { title: "Centraliser l'autorisation", description: "Appliquer la verification d'acces via un intergiciel ou une couche dediee, traversee par chaque requete, plutot que de la disperser dans le code." },
  { title: "Vérifier la propriété de chaque objet", description: "Pour tout acces a une ressource identifiee par le client, confirmer cote serveur qu'elle appartient bien a l'utilisateur ou que son role l'autorise." },
  { title: "Refuser par défaut", description: "Adopter une politique de refus par defaut : tout acces non explicitement autorise est interdit (fail-safe)." },
  { title: "Préférer des références indirectes", description: "Utiliser des identifiants non predictibles ou une table de correspondance par session reduit la facilite d'enumeration, sans jamais remplacer la verification d'acces." },
  { title: "Journaliser les refus", description: "Consigner les tentatives d'acces refusees pour detecter une enumeration en cours." },
]} />

<AuditCallout>
Une méthodologie de test croisé (matrice rôles × endpoints) est directement issue des bonnes pratiques d'audit : un tableau listant chaque endpoint et le résultat attendu pour chaque rôle constitue une preuve de couverture solide. Le principe du moindre privilège qui la sous-tend est au cœur des contrôles d'accès de l'ISO/IEC 27001:2022 (annexe A) et du NIST CSF 2.0.
</AuditCallout>

<AttackDefenseTable rows={[
  { phase: "IDOR", attack: "Modifier un identifiant pour acceder a la ressource d'un autre utilisateur", defense: "Verifier cote serveur, a chaque acces, que la ressource appartient a l'utilisateur authentifie" },
  { phase: "Elevation verticale", attack: "Appeler directement un endpoint d'administration non protege", defense: "Intergiciel d'autorisation centralise applique a chaque route, jamais delegue au frontend" },
  { phase: "Principe general", attack: "Confiance implicite dans les donnees envoyees par le client", defense: "Ne jamais faire confiance a un identifiant, un role ou une permission fourni par le client sans le revalider" },
]} />

## Erreurs fréquentes

Le débutant protège l'interface mais pas les endpoints, croyant qu'un lien caché suffit. Il vérifie l'authentification mais oublie l'autorisation sur l'objet précis, laissant une IDOR béante. Il disperse les contrôles d'accès dans chaque contrôleur, ce qui garantit qu'un oubli surviendra tôt ou tard. Il mise sur des identifiants « difficiles à deviner » comme s'ils remplaçaient la vérification, alors qu'ils ne font que la compléter. Enfin, il teste avec un seul compte, incapable de détecter une faille horizontale qui ne se révèle qu'entre deux utilisateurs de même niveau.

## Lab — Mise en pratique

**Environnement** : Kali Linux (terminal Nyx Shell) et navigateur de test (observation et correction)

<Steps steps={[
  { title: "Cartographier les rôles", description: "Identifie les niveaux d'utilisateurs de l'application de lab (anonyme, standard, administrateur) et les endpoints associes." },
  { title: "Observer une référence directe", description: "Repere une URL ou un parametre contenant un identifiant de ressource et, avec deux comptes de meme niveau, verifie si l'un peut acceder a la ressource de l'autre." },
  { title: "Localiser la cause dans le code", description: "Trouve l'endroit ou la ressource est chargee par identifiant sans clause de propriete ni verification de role." },
  { title: "Corriger l'accès à l'objet", description: "Modifie la requete pour qu'elle restreigne la ressource au proprietaire authentifie, et renvoie un 404 ou 403 sinon." },
  { title: "Centraliser le contrôle de rôle", description: "Protege les routes d'administration par un intergiciel d'autorisation unique, applique par defaut." },
  { title: "Vérifier avec la matrice rôles × endpoints", description: "Rejoue chaque endpoint avec un compte de chaque niveau et confirme que les acces non autorises sont desormais refuses." },
  { title: "Activer la journalisation des refus", description: "Ajoute un journal des acces refuses pour detecter d'eventuelles tentatives d'enumeration." },
]} />

## À retenir

- Le contrôle d'accès cassé est la catégorie n°1 de l'OWASP Top 10 en 2021 comme en 2025.
- Une IDOR permet d'accéder à la ressource d'un autre utilisateur faute de vérification de propriété côté serveur.
- L'élévation horizontale touche un utilisateur de même niveau ; la verticale atteint un niveau supérieur.
- Masquer un élément dans l'interface n'est jamais un contrôle d'accès : la vérification doit être côté serveur, à chaque requête.
- Un contrôle d'accès robuste est centralisé, refuse par défaut, vérifie la propriété de chaque objet, et se teste par une matrice rôles × endpoints.

## Questions de révision

1. Pourquoi le contrôle d'accès cassé est-il à la fois simple à comprendre et difficile à couvrir exhaustivement ?
2. Qu'est-ce qu'une IDOR, et quelle confusion de l'application en est la cause ?
3. Quelle est la différence entre une élévation de privilèges horizontale et verticale ?
4. Pourquoi masquer un bouton côté frontend n'est-il pas un contrôle d'accès valide ?
5. Quel signal, à la lecture du code, trahit une IDOR ?
6. Pourquoi faut-il au moins deux comptes de même niveau pour tester le contrôle d'accès horizontal ?
7. Pourquoi des identifiants non prédictibles ne remplacent-ils pas la vérification d'accès ?
