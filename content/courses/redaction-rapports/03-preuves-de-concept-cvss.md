---
title: Rédiger des preuves de concept claires et scorer avec CVSS
chapter: 3
course: redaction-rapports
difficulty: intermediate
duration: 35
tags: [redaction, poc, cvss, preuve]
ceh_modules: ["Module 20 - Penetration Testing Fundamentals"]
objectives:
  - Rédiger une fiche de vulnérabilité complète et reproductible
  - Calculer et justifier un score CVSS de base
  - Éviter les erreurs qui rendent une preuve de concept non crédible
---

## Introduction

Ce chapitre s'attaque au cœur technique du rapport : la fiche de vulnérabilité. C'est l'endroit où la rédaction doit être la plus rigoureuse, car c'est elle qui permet au client de reproduire, de vérifier et, une fois corrigée, de valider que la faille a bien disparu.

## Anatomie d'une fiche de vulnérabilité

<Steps steps={[
  { title: "Titre", description: "Court, précis, incluant le composant concerné. Ex : 'Injection SQL sur le paramètre id de /produit.php'." },
  { title: "Sévérité et score CVSS", description: "Score numérique + niveau (critique/élevé/moyen/faible) + vecteur CVSS complet." },
  { title: "Description", description: "En langage clair : quel est le mécanisme de la faille, pourquoi elle existe (validation manquante, logique métier cassée...)." },
  { title: "Preuve de concept (PoC)", description: "La requête EXACTE (ou commande, ou payload) permettant de reproduire la faille, avec la réponse observée." },
  { title: "Impact", description: "Ce qu'un attaquant réel pourrait faire avec cette faille, en termes métier (pas juste techniques)." },
  { title: "Recommandation", description: "Le correctif précis et actionnable — jamais une formule vague." },
]} />

## Une preuve de concept reproductible, pas une affirmation

<WarningCallout>
"J'ai trouvé une injection SQL sur ce endpoint" sans la requête exacte n'est pas une preuve — c'est une affirmation. Le client ne peut ni la vérifier, ni confirmer après correction que le problème a disparu. Une PoC doit toujours être copiable-collable telle quelle par quelqu'un d'autre.
</WarningCallout>

```text
Mauvaise PoC (affirmation) :
"Le paramètre id est vulnérable à une injection SQL permettant de dumper la base."

Bonne PoC (reproductible) :
Requête : GET /produit.php?id=1' UNION SELECT username,password FROM users-- -
Réponse observée : la page affiche "admin | 5f4dcc3b5aa765d61d8327deb882cf99"
Outil utilisé : sqlmap -u "http://cible/produit.php?id=1" --batch --dump -T users
```

## Calculer un score CVSS de base

Le score CVSS v3.1 se construit à partir de 6 métriques de base :

<CompareTable
  titleA="Métrique"
  titleB="Question à laquelle elle répond"
  rows={[
    { a: "AV (Attack Vector)", b: "D'où l'attaque est-elle lançable ? (Réseau, Local, Physique)" },
    { a: "AC (Attack Complexity)", b: "Faut-il des conditions particulières pour réussir ?" },
    { a: "PR (Privileges Required)", b: "Faut-il déjà un compte pour exploiter la faille ?" },
    { a: "UI (User Interaction)", b: "Faut-il qu'une victime clique/agisse ?" },
    { a: "C / I / A (Impact)", b: "Impact sur la confidentialité, l'intégrité, la disponibilité ?" },
  ]}
/>

<CehCallout>
Une injection SQL exploitable sans authentification, à distance, sans interaction utilisateur, et donnant accès à l'intégralité de la base de données obtient typiquement : AV:N/AC:L/PR:N/UI:N/C:H/I:H/A:H — soit un score proche de 9.8 (Critique).
</CehCallout>

<TipCallout>
Un calculateur CVSS officiel (first.org) permet de générer le score et le vecteur exact — ne calcule jamais un score CVSS "à l'instinct" dans un rapport professionnel, toujours à partir du vecteur explicite, que tu inclus dans le rapport pour justifier le chiffre.
</TipCallout>

## Erreurs fréquentes sur les PoC et le scoring

- Copier-coller une sortie d'outil brute (100 lignes de sqlmap) sans extraire la ligne pertinente pour le corps du rapport.
- Donner un score CVSS sans le vecteur qui le justifie — le client ne peut alors pas vérifier le calcul.
- Confondre sévérité technique et impact métier réel : une faille "critique" CVSS sur un environnement de test isolé sans données réelles n'a pas le même impact métier qu'en production.

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell) + réflexion guidée

<Steps steps={[
  { title: "Rédiger une PoC reproductible", description: "Reprends l'injection SQL du lab web-001 et rédige sa PoC exacte (requête + réponse observée), sans sortie brute non filtrée." },
  { title: "Calculer un vecteur CVSS", description: "Pour cette même injection SQL (exploitable sans authentification, à distance, donnant accès en lecture à la base), construis le vecteur CVSS et déduis le niveau de sévérité." },
]} />

## En résumé

- Une fiche de vulnérabilité complète comprend : titre, sévérité/CVSS, description, PoC, impact métier, recommandation.
- Une preuve de concept doit être reproductible telle quelle, jamais une simple affirmation.
- Le score CVSS doit toujours être accompagné de son vecteur complet pour rester vérifiable.

## Questions de Révision

1. Pourquoi une PoC sans requête/commande exacte n'a-t-elle aucune valeur probatoire ?
2. Cite trois des six métriques de base du score CVSS v3.1.
3. Pourquoi ne faut-il jamais donner un score CVSS sans son vecteur ?
