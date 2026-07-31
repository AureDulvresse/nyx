---
title: Exploration et visualisation de données (EDA)
chapter: 3
course: data-science
difficulty: beginner
duration: 30
tags: [data-science, eda, visualisation]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Comprendre l'objectif de l'analyse exploratoire de données (EDA)
  - Choisir le bon type de visualisation selon la question posée
  - Identifier des motifs révélateurs pour la sécurité via la visualisation
---

## Introduction

L'analyse exploratoire de données (Exploratory Data Analysis, EDA) est l'étape où l'on se familiarise avec un jeu de données avant toute modélisation — une étape trop souvent négligée par impatience d'arriver au machine learning, alors qu'elle révèle souvent les informations les plus utiles.

## L'objectif de l'EDA

<CehCallout>
L'EDA répond à des questions simples mais essentielles : quelle est la distribution de chaque variable ? Y a-t-il des corrélations entre variables ? Des groupes ou motifs se dégagent-ils visuellement ? Ces réponses orientent directement les choix de nettoyage (chapitre 2) et de modélisation (chapitres 5-6) à venir.
</CehCallout>

## Choisir la bonne visualisation

<CompareTable
  titleA="Type de graphique"
  titleB="Usage typique"
  rows={[
    { a: "Histogramme", b: "Visualiser la distribution d'une variable numérique unique (ex : durée des connexions)" },
    { a: "Nuage de points (scatter plot)", b: "Visualiser la relation entre deux variables numériques (ex : taille de paquet vs durée)" },
    { a: "Diagramme en boîte (boxplot)", b: "Comparer la distribution d'une variable entre plusieurs groupes, et repérer les valeurs aberrantes" },
    { a: "Matrice de corrélation (heatmap)", b: "Visualiser les corrélations entre de nombreuses variables simultanément" },
    { a: "Graphique temporel (time series)", b: "Visualiser l'évolution d'une variable dans le temps (ex : volume de trafic par heure)" },
]}
/>

<TipCallout>
Un boxplot est particulièrement utile en sécurité : il affiche directement la médiane, les quartiles et les valeurs aberrantes d'une distribution — un pic de trafic apparaissant comme un point isolé au-delà des "moustaches" du boxplot est visuellement immédiat à repérer, sans calcul supplémentaire.
</TipCallout>

## Repérer des motifs révélateurs

<Steps steps={[
  { title: "Examiner les distributions individuelles", description: "Une distribution bimodale (deux pics) peut indiquer que la variable mélange en réalité deux populations distinctes (ex : trafic légitime et trafic automatisé)." },
  { title: "Examiner les corrélations entre variables", description: "Une forte corrélation entre deux variables peut indiquer une redondance (l'une des deux suffit) ou une relation causale à creuser." },
  { title: "Examiner l'évolution temporelle", description: "Une rupture nette dans une série temporelle (volume de connexions, taux d'erreur) coïncide souvent avec un changement d'infrastructure ou un incident." },
]} />

<CehCallout>
Une matrice de corrélation peut révéler qu'un ensemble de caractéristiques censées être indépendantes évoluent en réalité fortement ensemble — un signal utile pour simplifier un modèle (via la réduction de dimension du cours Algèbre Linéaire, chapitre 5) ou pour repérer une variable redondante voire fuyant de l'information sur la cible à prédire.
</CehCallout>

## Le piège de la sur-interprétation visuelle

<WarningCallout>
Une corrélation visuelle entre deux variables sur un graphique ne prouve jamais une relation de cause à effet — deux variables peuvent varier ensemble simplement parce qu'elles dépendent toutes deux d'une troisième variable cachée (par exemple, le volume de trafic ET le taux d'erreur peuvent tous deux augmenter simplement parce que c'est une heure de forte charge, sans lien causal direct entre eux).
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Choisir une visualisation adaptée", description: "Pour repérer si un jeu de connexions réseau contient des valeurs de durée anormalement élevées, quel type de graphique choisirais-tu, et pourquoi ?" },
  { title: "Interpréter une corrélation avec prudence", description: "Un graphique montre que le nombre de tickets de support et le nombre de tentatives de connexion échouées augmentent ensemble chaque lundi. Peut-on conclure que l'un cause l'autre ? Propose une explication alternative." },
]} />

## En résumé

- L'EDA permet de comprendre les distributions, corrélations et motifs d'un jeu de données avant toute modélisation.
- Le choix du type de graphique (histogramme, scatter plot, boxplot, heatmap, série temporelle) dépend de la question posée.
- Une corrélation visuelle n'implique jamais automatiquement une relation de cause à effet.

## Questions de Révision

1. Pourquoi l'EDA doit-elle précéder la modélisation plutôt que d'être sautée par impatience ?
2. Quel type de graphique est particulièrement adapté pour repérer des valeurs aberrantes dans une distribution ?
3. Pourquoi une forte corrélation visuelle entre deux variables ne prouve-t-elle pas un lien de cause à effet ?
