---
title: Authentification et gestion de sessions
chapter: 5
course: web-security
difficulty: intermediate
duration: 60
tags: [web, authentification, sessions, jwt, mfa]
ceh_modules: ["Module 14 - Hacking Web Applications"]
objectives:
  - Identifier les failles courantes d'authentification et de gestion de session
  - Comprendre le principe du bruteforce automatisé et comment le détecter et le contrer
  - Comprendre la structure d'un JWT et ses faiblesses classiques
  - Appliquer les défenses fiables : MFA, verrouillage, messages génériques, validation stricte des jetons
---

## Introduction

L'authentification et la gestion de session sont le pilier de tout contrôle d'accès web. Un défaut à ce niveau compromet potentiellement l'intégralité de l'application, quelle que soit la qualité du reste du code. Cette famille de failles correspond à la catégorie **A07 - Identification and Authentication Failures** de l'OWASP Top 10 2021.

Ce chapitre adopte l'angle du défenseur : comprendre comment ces failles naissent pour mieux les éliminer. Tu apprendras à reconnaître une authentification faible, à comprendre pourquoi le bruteforce fonctionne et comment le détecter, à lire la structure d'un JWT et ses pièges, et à mettre en place les contre-mesures qui tiennent réellement, à commencer par l'authentification multifacteur.

## Failles d'authentification courantes

<CompareTable
  titleA="Faille"
  titleB="Impact"
  rows={[
    { a: "Absence de limitation de tentatives", b: "Permet un bruteforce ou une attaque par dictionnaire sans blocage" },
    { a: "Messages d'erreur differencies", b: "Distinguer 'utilisateur inconnu' de 'mot de passe incorrect' permet d'enumerer les comptes valides" },
    { a: "Identifiants transmis en GET", b: "Visibles dans les journaux serveur, l'historique du navigateur et l'en-tete Referer" },
    { a: "Identifiant de session previsible", b: "Un identifiant sequentiel ou faiblement aleatoire peut etre devine" },
    { a: "Absence de MFA", b: "Un seul facteur compromis suffit a prendre le controle du compte" },
  ]}
/>

<CehCallout>
L'énumération de comptes via des messages d'erreur différenciés est un classique de reconnaissance passive : même sans casser un seul mot de passe, un attaquant peut constituer une liste de comptes valides à cibler ensuite. La défense consiste à renvoyer un message d'erreur générique unique, identique quel que soit le cas, et à égaliser les temps de réponse pour éviter une énumération par le délai.
</CehCallout>

## Le bruteforce : principe, détection, défense

Le bruteforce (ou attaque par dictionnaire) consiste à essayer de nombreuses combinaisons d'identifiants jusqu'à trouver la bonne. Des outils comme **Hydra** automatisent ces essais contre divers protocoles et formulaires web. Il est important pour un défenseur d'en comprendre le fonctionnement, car cela éclaire directement la détection.

Pour attaquer un formulaire web, un tel outil a besoin de trois informations : le chemin du formulaire, la liste des paramètres à soumettre avec des marqueurs pour l'identifiant et le mot de passe, et surtout une **condition d'échec** — généralement une chaîne de texte présente dans la réponse en cas de connexion ratée. C'est cette condition qui permet à l'outil de distinguer un échec d'une réussite. Cette dépendance est instructive : une application qui renvoie des réponses indiscernables et qui limite le débit prive l'attaquant de ce signal.

```text
# Structure logique d'une tentative de bruteforce de formulaire (a comprendre, pas a reproduire)
chemin du formulaire : /login
parametres           : identifiant + mot de passe (valeurs testees successivement)
condition d'echec    : texte present dans la reponse quand la connexion echoue
```

Côté détection, une rafale de tentatives de connexion échouées depuis une même source, ou sur un même compte depuis plusieurs sources, est le signal caractéristique. La défense combine la **limitation de débit** (rate limiting), le **verrouillage temporaire** de compte après plusieurs échecs, un **CAPTCHA** après un seuil, et la journalisation des tentatives pour alerter.

<AuditCallout>
La détection des tentatives d'authentification anormales relève de la journalisation et de la surveillance (OWASP A09, et contrôles de journalisation de l'ISO/IEC 27001:2022, annexe A). Un compte verrouillé ou une alerte déclenchée au bout de quelques échecs transforme une attaque silencieuse en incident visible et traçable.
</AuditCallout>

## JWT : structure et faiblesses

De nombreuses applications modernes remplacent les sessions côté serveur par des **JWT** (JSON Web Tokens), auto-porteurs et signés. Un JWT se compose de trois parties séparées par des points.

```text
Structure d'un JWT (3 parties separees par des points) :
en-tete.charge_utile.signature

En-tete      : algorithme de signature utilise
Charge utile : les informations (claims) - identite, role, expiration
Signature    : garantit que le jeton n'a pas ete altere depuis son emission
```

Un point essentiel, souvent mal compris : un JWT est **signé, pas chiffré** par défaut. Sa charge utile est seulement encodée en Base64, donc lisible par quiconque intercepte le jeton. Il ne faut jamais y stocker d'information sensible en clair. La signature garantit l'intégrité, pas la confidentialité.

<CompareTable
  titleA="Faiblesse JWT"
  titleB="Principe"
  rows={[
    { a: "Algorithme 'none' accepte", b: "Une implementation mal configuree accepte un jeton sans signature si l'en-tete indique alg:none" },
    { a: "Secret de signature faible", b: "Un secret HS256 court ou previsible peut etre retrouve, permettant de forger des jetons valides" },
    { a: "Confusion d'algorithme (RS256 vers HS256)", b: "Le serveur est amene a verifier avec une cle publique connue utilisee comme secret symetrique" },
    { a: "Expiration non verifiee", b: "Un jeton expire reste accepte si le serveur ne controle pas le claim exp" },
  ]}
/>

<WarningCallout>
La racine de la plupart des failles JWT est que le serveur laisse le jeton lui dicter la façon de le vérifier. La défense est de **fixer côté serveur l'algorithme attendu** et de ne jamais le déduire de l'en-tête du jeton, de rejeter `alg:none`, d'utiliser des secrets robustes, et de vérifier systématiquement l'expiration et l'émetteur.
</WarningCallout>

## Corriger : les défenses fiables

<AttackDefenseTable rows={[
  { phase: "Bruteforce", attack: "Tentatives de connexion illimitees", defense: "Limitation de debit, verrouillage temporaire, CAPTCHA, journalisation" },
  { phase: "Enumeration", attack: "Messages d'erreur differencies et temps de reponse variables", defense: "Message generique unique et temps de reponse egalise" },
  { phase: "Session", attack: "Identifiant de session previsible ou transmis en GET", defense: "Identifiant aleatoire fort, transmis via cookie HttpOnly/Secure, renouvele a la connexion" },
  { phase: "JWT", attack: "Algorithme none / confusion d'algorithme", defense: "Algorithme attendu fixe cote serveur, verification de exp et de l'emetteur" },
]} />

<AuditCallout>
L'authentification multifacteur (MFA) reste la mesure la plus efficace contre l'ensemble de ces failles combinées : même un mot de passe compromis par bruteforce ne suffit plus à accéder au compte. C'est un contrôle explicitement recommandé par le NIST CSF 2.0 et attendu dans les exigences d'accès de l'ISO/IEC 27001:2022.
</AuditCallout>

## Erreurs fréquentes

Le débutant laisse des messages d'erreur différenciés par souci d'ergonomie, sans voir qu'ils permettent l'énumération de comptes. Il transmet des identifiants en GET, où ils finissent dans les journaux et l'historique. Il croit qu'un JWT est confidentiel parce qu'il est « signé », et y place des données sensibles. Il laisse le serveur faire confiance à l'en-tête du jeton pour choisir l'algorithme de vérification. Enfin, il considère un mot de passe fort comme suffisant, en négligeant la MFA qui neutralise la compromission d'un seul facteur.

## Lab — Mise en pratique

**Environnement** : Kali Linux (terminal Nyx Shell) et navigateur de test (observation et correction)

<Steps steps={[
  { title: "Observer les messages d'erreur", description: "Tente une connexion avec un compte inexistant puis avec un compte existant et un mauvais mot de passe ; compare les messages et les temps de reponse pour reperer une fuite d'information." },
  { title: "Analyser la gestion de session", description: "Inspecte le cookie de session : est-il marque HttpOnly et Secure, et son identifiant semble-t-il suffisamment aleatoire ?" },
  { title: "Décoder un JWT", description: "Decode la charge utile d'un JWT de lab pour constater que son contenu est lisible, preuve qu'il n'est pas chiffre.", code: "echo 'eyJhbGciOiJIUzI1NiJ9' | base64 -d" },
  { title: "Corriger les messages et le débit", description: "Remplace les messages par un message generique unique et ajoute une limitation de debit et un verrouillage temporaire sur l'authentification." },
  { title: "Durcir la vérification JWT", description: "Configure le serveur pour imposer l'algorithme attendu, rejeter alg:none et verifier l'expiration." },
  { title: "Activer la MFA", description: "Mets en place un second facteur sur le compte de test et verifie qu'un mot de passe seul ne suffit plus a se connecter." },
  { title: "Vérifier les corrections", description: "Reproduis les observations des etapes 1 a 3 et confirme que les fuites et faiblesses ont disparu." },
]} />

## À retenir

- Un défaut d'authentification ou de session compromet toute l'application ; c'est la catégorie A07 de l'OWASP Top 10 2021.
- Les messages d'erreur différenciés permettent l'énumération de comptes ; la réponse générique et le temps égalisé l'empêchent.
- Le bruteforce dépend d'un signal distinguant succès et échec ; limitation de débit, verrouillage et journalisation le neutralisent.
- Un JWT est signé mais pas chiffré : sa charge utile est lisible en Base64, aucune donnée sensible ne doit y figurer.
- Les failles JWT viennent souvent du serveur faisant confiance à l'en-tête du jeton ; fixer l'algorithme et vérifier l'expiration les évite.
- La MFA est la contre-mesure la plus efficace contre l'ensemble des failles d'authentification.

## Questions de révision

1. Pourquoi des messages d'erreur différenciés constituent-ils une faille de sécurité ?
2. De quel signal un outil de bruteforce de formulaire a-t-il besoin, et comment en priver l'attaquant ?
3. Un JWT est-il chiffré ? Justifie ta réponse à partir de sa structure.
4. En quoi consiste la faille « algorithme none », et comment s'en protéger côté serveur ?
5. Pourquoi la confusion d'algorithme RS256 vers HS256 est-elle possible, et quelle règle l'empêche ?
6. Pourquoi un identifiant de session doit-il être fortement aléatoire et transmis par cookie plutôt qu'en GET ?
7. Pourquoi la MFA reste-t-elle la mesure la plus efficace même si le mot de passe est compromis ?
