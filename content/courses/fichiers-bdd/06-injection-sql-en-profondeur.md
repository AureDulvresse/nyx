---
title: Injection SQL en profondeur — au-delà des bases
chapter: 6
course: fichiers-bdd
difficulty: advanced
duration: 40
tags: [injection-sql, sqlmap, approfondissement]
ceh_modules: ["Module 14 - Hacking Web Applications"]
objectives:
  - Approfondir les techniques d'injection SQL déjà introduites au cours Sécurité Web
  - Comprendre l'injection SQL en aveugle (blind) en détail
  - Comprendre les techniques d'évasion de filtres
---

## Introduction

Ce chapitre approfondit l'injection SQL déjà introduite au cours Sécurité Web (chapitre 3), en s'appuyant sur la compréhension du modèle relationnel (chapitre 3 de ce cours) pour aborder des techniques plus subtiles : l'injection en aveugle et l'évasion de filtres.

## Rappel des types d'injection SQL

<CompareTable
  titleA="Type (rappel cours Sécurité Web, ch.3)"
  titleB="Principe"
  rows={[
    { a: "Union-based", b: "Utilise UNION SELECT pour combiner les résultats d'une requête malveillante à la requête originale" },
    { a: "Error-based", b: "Exploite les messages d'erreur de la base de données pour extraire des informations" },
    { a: "Boolean-blind", b: "Déduit des informations bit par bit selon que la page se comporte différemment (vrai/faux)" },
    { a: "Time-blind", b: "Déduit des informations selon le délai de réponse (ex : SLEEP())" },
]}
/>

## L'injection en aveugle en détail

<CehCallout>
Une injection en aveugle (blind) survient quand l'application ne renvoie aucune donnée directement exploitable (pas de message d'erreur, pas d'affichage de résultat) — l'attaquant doit alors déduire l'information caractère par caractère, en observant un signal indirect (une différence de comportement ou de temps de réponse).
</CehCallout>

```sql
-- Exemple de boolean-blind : déduire le premier caractère du mot de passe admin
' AND SUBSTRING((SELECT motdepasse FROM utilisateurs WHERE nom='admin'),1,1) = 'a' -- 

-- Si la page se comporte "normalement" (vrai), le premier caractère est 'a'
-- Sinon, on teste 'b', 'c', etc., un caractère à la fois
```

<TipCallout>
Rappel du TP sqlmap (cours Sécurité Web, chapitre 3) : ce processus de déduction caractère par caractère, fastidieux manuellement, est précisément ce que sqlmap automatise — comprendre le mécanisme sous-jacent explique pourquoi une injection en aveugle, bien que plus lente, reste exploitable même sans aucun message d'erreur visible.
</TipCallout>

## Techniques d'évasion de filtres

<Steps steps={[
  { title: "Variation de casse", description: "Un filtre cherchant uniquement 'UNION' en majuscules peut être contourné par 'UniOn', si le filtre n'est pas insensible à la casse." },
  { title: "Commentaires SQL insérés", description: "Insérer des commentaires SQL au milieu de mots-clés peut contourner certains filtres basés sur une correspondance de motif exacte." },
  { title: "Encodage alternatif", description: "Utiliser des représentations encodées (hexadécimal, URL) de caractères filtrés, décodées par la base de données mais pas reconnues par le filtre." },
]} />

<WarningCallout>
Ces techniques d'évasion illustrent pourquoi un filtrage basé uniquement sur une liste de mots interdits (blocklist) reste fondamentalement fragile — rappel du cours Sécurité Web (chapitre 3) : la seule défense réellement fiable contre l'injection SQL reste les requêtes préparées (prepared statements), qui séparent structurellement le code SQL des données, rendant ces techniques d'évasion sans objet.
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell)

<Steps steps={[
  { title: "Automatiser une injection en aveugle", description: "Rappel du TP sqlmap : utilise sqlmap avec l'option --technique pour cibler spécifiquement une injection boolean-blind ou time-blind sur le lab web-001.", code: 'sqlmap -u "http://10.10.0.10/produit.php?id=1" --batch --technique=BT' },
  { title: "Expliquer pourquoi les requêtes préparées neutralisent l'évasion de filtres", description: "Pourquoi une requête préparée rend-elle sans objet les techniques d'évasion de filtres présentées dans ce chapitre ?" },
]} />

## En résumé

- L'injection en aveugle déduit une information caractère par caractère via un signal indirect (comportement ou délai), sans message d'erreur exploitable directement.
- Variation de casse, commentaires insérés et encodage alternatif sont des techniques classiques d'évasion de filtres basés sur des listes de mots interdits.
- Les requêtes préparées restent la seule défense réellement fiable, rendant sans objet l'ensemble des techniques d'évasion de filtres.

## Questions de Révision

1. Qu'est-ce qui distingue une injection en aveugle (blind) d'une injection classique avec message d'erreur exploitable ?
2. Donne un exemple de technique d'évasion de filtre basé sur une liste de mots interdits.
3. Pourquoi les requêtes préparées neutralisent-elles l'ensemble des techniques d'évasion de filtres présentées ?
