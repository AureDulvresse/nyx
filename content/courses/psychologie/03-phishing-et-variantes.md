---
title: Le phishing et ses variantes
chapter: 3
course: psychologie
difficulty: intermediate
duration: 35
tags: [psychologie, phishing, spear-phishing, vishing]
ceh_modules: ["Module 9 - Social Engineering"]
objectives:
  - Distinguer phishing, spear phishing et whaling
  - Comprendre le vishing et le smishing
  - Identifier les signaux d'alerte communs à ces variantes
---

## Introduction

Ce chapitre détaille les principales variantes de phishing — l'attaque d'ingénierie sociale la plus répandue — en s'appuyant sur les mécanismes psychologiques du chapitre 2 et les caractéristiques techniques déjà vues au cours Sécurité Web (chapitre 1).

## Phishing, spear phishing et whaling

<CompareTable
  titleA="Variante"
  titleB="Caractéristique"
  rows={[
    { a: "Phishing générique", b: "Envoyé en masse, peu personnalisé, vise un grand nombre de cibles avec un taux de succès faible mais un volume élevé" },
    { a: "Spear phishing", b: "Ciblé sur une personne ou un petit groupe précis, personnalisé avec des informations réelles collectées lors de la reconnaissance" },
    { a: "Whaling", b: "Spear phishing ciblant spécifiquement des dirigeants ou cadres à haute responsabilité, souvent lié à des fraudes financières importantes" },
]}
/>

<CehCallout>
Le spear phishing repose directement sur la reconnaissance déjà vue au cours Cybersécurité Offensive : plus un attaquant collecte d'informations réelles sur sa cible (nom du manager, projet en cours, événement récent), plus le prétexte devient crédible et difficile à distinguer d'une communication légitime.
</CehCallout>

## Le vishing — le phishing par téléphone

<CehCallout>
Le vishing (voice phishing) exploite les mêmes biais cognitifs que l'email (chapitre 2), mais via un appel téléphonique — la voix humaine en direct ajoute une pression sociale immédiate (impossibilité de "réfléchir tranquillement" comme face à un email) qui rend souvent le vishing plus efficace pour des demandes urgentes.
</CehCallout>

```text
Exemple de vishing :

"Bonjour, je suis Sophie du service fraude de votre banque.
Nous avons détecté une transaction suspecte de 850€ sur votre
compte il y a quelques minutes. Pour la bloquer immédiatement,
j'ai besoin de vérifier votre identité avec le code que vous
venez de recevoir par SMS."
```

<WarningCallout>
Ce scénario de vishing exploite une technique redoutable : demander à la victime de communiquer un code de vérification à usage unique qu'elle vient de recevoir légitimement — l'attaquant a en réalité initié lui-même une tentative de connexion ou de réinitialisation, et le "code de vérification" demandé sert en fait à authentifier l'ATTAQUANT, pas à protéger la victime.
</WarningCallout>

## Le smishing — le phishing par SMS

<CompareTable
  titleA="Caractéristique du smishing"
  titleB="Pourquoi c'est efficace"
  rows={[
    { a: "Format court et direct", b: "Moins d'espace pour des indices de suspicion (fautes, mise en forme incohérente)" },
    { a: "Souvent lié à des services du quotidien (livraison, banque)", b: "Correspond à une attente réelle fréquente, augmentant la plausibilité" },
    { a: "Lien raccourci masquant la destination réelle", b: "Difficile de vérifier visuellement le domaine avant de cliquer sur mobile" },
]}
/>

## Signaux d'alerte communs à toutes les variantes

<Steps steps={[
  { title: "Urgence artificielle", description: "Une échéance très courte, souvent sans justification solide (rappel du chapitre 2)." },
  { title: "Demande inhabituelle par rapport aux procédures normales", description: "Une banque légitime ne demande jamais un code de vérification par téléphone." },
  { title: "Canal de communication détourné", description: "Un message qui pousse à agir immédiatement sans passer par le canal officiel habituel de vérification." },
  { title: "Incohérence de détail", description: "Un domaine d'expéditeur légèrement différent, une mise en forme inhabituelle par rapport aux communications habituelles de l'organisation prétendue." },
]} />

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Classer un scénario", description: "Un email personnalisé, mentionnant le nom du projet actuel d'un directeur financier précis, lui demande d'autoriser un virement urgent. S'agit-il de phishing générique, spear phishing ou whaling ?" },
  { title: "Expliquer un piège de vishing", description: "Pourquoi demander à une victime de communiquer un code de vérification reçu par SMS est-il particulièrement dangereux, au-delà du simple vol d'information ?" },
]} />

## En résumé

- Le spear phishing et le whaling sont des formes ciblées de phishing, personnalisées grâce à la reconnaissance, contrairement au phishing générique de masse.
- Le vishing exploite la pression sociale immédiate de la voix humaine, le smishing la brièveté et l'attente réelle des SMS de services du quotidien.
- Urgence artificielle, demande inhabituelle, canal détourné et incohérences de détail sont des signaux d'alerte communs à toutes les variantes.

## Questions de Révision

1. Quelle est la différence entre spear phishing et whaling ?
2. Pourquoi le vishing peut-il être plus efficace que le phishing par email pour une demande urgente ?
3. Pourquoi demander un code de vérification SMS à une victime est-il un piège particulièrement dangereux ?
