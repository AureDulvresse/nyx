---
title: Reconnaissance et OSINT
chapter: 2
course: cyber-offensive
difficulty: intermediate
duration: 35
tags: [reconnaissance, osint, pentest]
ceh_modules: ["Module 2 - Footprinting and Reconnaissance"]
objectives:
  - Distinguer reconnaissance passive et active
  - Utiliser des sources OSINT courantes
  - Construire un profil de cible exploitable pour la suite du pentest
---

## Introduction

La reconnaissance est la première phase technique d'un pentest — rappel du cours Psychologie & Ingénierie Sociale (chapitre 3) : plus les informations collectées sont riches, plus les phases suivantes (exploitation, spear phishing) gagnent en précision et en efficacité.

## Reconnaissance passive vs active

<CompareTable
  titleA="Reconnaissance passive"
  titleB="Reconnaissance active"
  rows={[
    { a: "Aucune interaction directe avec la cible", b: "Interaction directe (requêtes, scans) détectable par la cible" },
    { a: "Sources publiques : réseaux sociaux, sites web, registres WHOIS", b: "Résolution DNS active, ping, requêtes HTTP directes" },
    { a: "Indétectable, aucun log généré côté cible", b: "Peut générer des logs détectables par un SOC (cours Analyse SOC)" },
]}
/>

<CehCallout>
Une méthodologie rigoureuse commence toujours par la reconnaissance passive, la moins risquée et la moins détectable, avant de passer à la reconnaissance active — un principe qui rejoint directement le scan discret étudié au TP Nmap (cours Réseaux, chapitre 3).
</CehCallout>

## Sources OSINT courantes

<Steps steps={[
  { title: "Registres WHOIS et DNS", description: "Révèlent le propriétaire d'un domaine, les serveurs de noms, parfois des sous-domaines oubliés." },
  { title: "Réseaux sociaux professionnels", description: "Révèlent l'organigramme, les technologies utilisées mentionnées par les employés, les projets en cours." },
  { title: "Moteurs de recherche spécialisés (dorking)", description: "Des requêtes de recherche avancées peuvent révéler des documents ou pages non destinés à être publics mais indexés par erreur." },
  { title: "Code source public (dépôts Git)", description: "Des identifiants ou clés d'API oubliés dans un historique de commit public constituent une découverte fréquente et critique." },
]} />

<WarningCallout>
Rappel du cours Droit et Réglementation (chapitre 1) : même la reconnaissance passive doit rester dans le périmètre autorisé — collecter des informations personnelles sur des employés au-delà de ce qui est strictement nécessaire au test peut poser un problème éthique et légal, même si l'information est techniquement publique.
</WarningCallout>

## Construire un profil de cible exploitable

```text
Exemple de profil de reconnaissance synthétique :

Domaine : entreprise-cible.com
Serveurs de noms : ns1.hebergeur.com, ns2.hebergeur.com
Sous-domaines identifiés : mail, vpn, dev (probable environnement de test)
Technologies détectées : WordPress (via en-têtes HTTP), Nginx
Employés IT identifiés : 3 profils LinkedIn mentionnant "administrateur systèmes"
Fuite potentielle : un dépôt GitHub public d'un développeur mentionne
le nom du domaine dans un fichier de configuration.
```

<TipCallout>
Le sous-domaine "dev" repéré ci-dessus est une découverte particulièrement précieuse : les environnements de développement ou de test sont statistiquement moins durcis que la production, un point d'entrée souvent privilégié pour la suite du pentest (chapitres 3-4).
</TipCallout>

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell)

<Steps steps={[
  { title: "Effectuer une reconnaissance passive DNS", description: "Interroge les enregistrements DNS et WHOIS d'un domaine de test.", code: 'whois example.com\ndig example.com ANY\nhost -t txt example.com' },
  { title: "Identifier une information exploitable", description: "À partir du profil de reconnaissance ci-dessus, quelle information mérite d'être investiguée en priorité lors de la phase de scan (chapitre 3) ?" },
]} />

## En résumé

- La reconnaissance passive (sans interaction directe) précède toujours la reconnaissance active, moins risquée et moins détectable.
- WHOIS, DNS, réseaux sociaux, dorking et dépôts Git publics sont des sources OSINT courantes et souvent très révélatrices.
- Même la reconnaissance passive doit rester dans le périmètre légalement autorisé, sans excès de collecte d'informations personnelles.

## Questions de Révision

1. Pourquoi commence-t-on toujours par la reconnaissance passive avant la reconnaissance active ?
2. Donne un exemple d'information sensible qui peut être découverte via un dépôt de code source public.
3. Pourquoi un sous-domaine "dev" ou "test" identifié en reconnaissance est-il souvent une piste privilégiée ?
