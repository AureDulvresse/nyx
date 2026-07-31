---
title: Chiffrement asymétrique — RSA et courbes elliptiques
chapter: 3
course: cryptographie
difficulty: intermediate
duration: 40
tags: [cryptographie, rsa, ecc, asymetrique]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Comprendre le principe mathématique de RSA
  - Comparer RSA et la cryptographie sur courbes elliptiques (ECC)
  - Identifier les erreurs classiques d'implémentation RSA
---

## Introduction

RSA a longtemps été LE standard du chiffrement asymétrique, encore massivement utilisé aujourd'hui, mais progressivement concurrencé par la cryptographie sur courbes elliptiques (ECC), plus performante à sécurité équivalente. Ce chapitre couvre les deux, avec un accent sur les erreurs d'implémentation qui rendent RSA vulnérable en pratique.

## Le principe mathématique de RSA (simplifié)

<CehCallout>
La sécurité de RSA repose sur un problème mathématique simple à énoncer mais très difficile à résoudre à grande échelle : étant donné un très grand nombre produit de deux nombres premiers, retrouver ces deux nombres premiers (factorisation) est extrêmement coûteux en temps de calcul dès que le nombre dépasse quelques centaines de chiffres.
</CehCallout>

<Steps steps={[
  { title: "Génération de la paire de clés", description: "Deux grands nombres premiers sont choisis et multipliés pour former le module utilisé dans les clés publique et privée." },
  { title: "Clé publique", description: "Dérivée du module, elle peut être diffusée librement — elle sert à chiffrer un message ou vérifier une signature." },
  { title: "Clé privée", description: "Dérivée des nombres premiers originaux, elle doit rester strictement secrète — elle sert à déchiffrer ou signer." },
  { title: "Sécurité du système", description: "Repose entièrement sur la difficulté de factoriser le module pour retrouver les nombres premiers d'origine sans connaître la clé privée." },
]} />

## RSA vs ECC — à sécurité équivalente, quelle taille de clé ?

<CompareTable
  titleA="Niveau de sécurité (bits)"
  titleB="Taille de clé RSA équivalente / ECC équivalente"
  rows={[
    { a: "112 bits", b: "RSA 2048 bits / ECC 224 bits" },
    { a: "128 bits", b: "RSA 3072 bits / ECC 256 bits" },
    { a: "256 bits", b: "RSA 15360 bits (impraticable) / ECC 512 bits" },
]}
/>

<TipCallout>
À sécurité équivalente, une clé ECC est considérablement plus petite qu'une clé RSA — un avantage décisif pour les environnements contraints (mobile, IoT) et pour la performance des connexions TLS à grande échelle, ce qui explique la migration progressive de nombreux services vers ECC (notamment ECDSA et ECDHE).
</TipCallout>

## Erreurs classiques d'implémentation RSA

<WarningCallout>
Utiliser des nombres premiers trop petits, générés de façon prévisible, ou réutiliser le même nombre premier entre plusieurs paires de clés (arrivé plusieurs fois en pratique sur des équipements embarqués mal configurés) permet de casser RSA bien plus facilement qu'en attaquant l'algorithme lui-même — la faiblesse vient presque toujours de l'implémentation, jamais des mathématiques sous-jacentes.
</WarningCallout>

<CompareTable
  titleA="Erreur d'implémentation"
  titleB="Conséquence"
  rows={[
    { a: "Nombres premiers générés par un générateur aléatoire faible", b: "Les clés deviennent prévisibles et factorisables" },
    { a: "Réutilisation d'un nombre premier entre deux clés différentes", b: "Le PGCD des deux modules révèle le facteur commun, cassant les deux clés" },
    { a: "Exposant public trop petit mal utilisé (e=3 sans padding)", b: "Attaque de Håstad permettant de retrouver le message clair" },
    { a: "Absence de padding sécurisé (ex: OAEP)", b: "Vulnérabilité à des attaques adaptatives sur le texte chiffré" },
]}
/>

<CehCallout>
L'attaque par PGCD (plus grand commun diviseur) entre deux modules RSA générés avec un nombre premier partagé par erreur est une découverte réelle documentée sur des millions de clés publiques exposées sur Internet, provenant d'équipements embarqués aux générateurs aléatoires insuffisamment initialisés au démarrage.
</CehCallout>

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell)

<Steps steps={[
  { title: "Générer une paire de clés RSA", description: "Génère une paire de clés RSA 4096 bits et examine sa structure.", code: 'openssl genrsa -out cle_privee.pem 4096\nopenssl rsa -in cle_privee.pem -pubout -out cle_publique.pem\nopenssl rsa -in cle_privee.pem -text -noout | head -20' },
  { title: "Comparer RSA et ECC", description: "Pour un service mobile avec des contraintes fortes de bande passante et de batterie, RSA ou ECC serait-il préférable, et pourquoi ?" },
]} />

## En résumé

- RSA repose sur la difficulté de factoriser un grand nombre produit de deux nombres premiers.
- À sécurité équivalente, ECC utilise des clés bien plus petites que RSA, un avantage décisif pour les environnements contraints.
- La quasi-totalité des failles pratiques de RSA viennent d'erreurs d'implémentation (génération faible, réutilisation de premiers, absence de padding), pas de l'algorithme lui-même.

## Questions de Révision

1. Sur quel problème mathématique repose la sécurité de RSA ?
2. Pourquoi ECC est-il de plus en plus préféré à RSA dans les environnements contraints (mobile, IoT) ?
3. Pourquoi la réutilisation d'un même nombre premier entre deux paires de clés RSA différentes est-elle catastrophique pour leur sécurité ?
