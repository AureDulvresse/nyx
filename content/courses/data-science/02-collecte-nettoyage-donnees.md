---
title: Collecte et nettoyage de données
chapter: 2
course: data-science
difficulty: beginner
duration: 35
tags: [data-science, nettoyage, qualite-donnees]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Identifier les sources de données courantes en sécurité
  - Traiter les valeurs manquantes, dupliquées et aberrantes
  - Comprendre les conséquences d'un nettoyage bâclé
---

## Introduction

"Garbage in, garbage out" — aucun modèle, aussi sophistiqué soit-il, ne peut compenser des données de mauvaise qualité en entrée. Ce chapitre couvre les techniques fondamentales de nettoyage, à appliquer avant toute exploration ou modélisation.

## Sources de données courantes en sécurité

<CompareTable
  titleA="Source"
  titleB="Exemple d'usage"
  rows={[
    { a: "Logs applicatifs et système", b: "Détection d'anomalies, investigation post-incident (lien avec le cours DFIR)" },
    { a: "Capture de trafic réseau (PCAP)", b: "Détection de comportements réseau suspects" },
    { a: "Bases de vulnérabilités publiques (CVE, NVD)", b: "Analyse de tendances, priorisation de correctifs" },
    { a: "Emails et échantillons de phishing", b: "Entraînement de modèles de détection de phishing" },
]}
/>

## Traiter les valeurs manquantes

<Steps steps={[
  { title: "Identifier le motif de l'absence", description: "Une valeur manquante au hasard n'a pas le même traitement qu'une absence systématique (ex : un champ jamais rempli pour un type d'événement particulier)." },
  { title: "Suppression", description: "Retirer les lignes ou colonnes avec trop de valeurs manquantes — acceptable si la perte d'information reste limitée." },
  { title: "Imputation", description: "Remplacer par une valeur estimée (moyenne, médiane, ou valeur prédite) — préserve la taille du jeu de données mais introduit une estimation." },
]} />

<WarningCallout>
Supprimer systématiquement toute ligne contenant une valeur manquante peut introduire un biais silencieux : si les valeurs manquantes ne sont pas réparties au hasard (par exemple, un capteur réseau qui ne journalise pas certains types de paquets), les données restantes ne représentent plus fidèlement la réalité du trafic.
</WarningCallout>

## Doublons et valeurs aberrantes

<CehCallout>
Des doublons dans un jeu de données d'entraînement peuvent artificiellement gonfler l'importance de certains exemples — un même email de phishing dupliqué 50 fois dans le jeu d'entraînement biaise le modèle vers ce cas précis, au détriment de la généralisation.
</CehCallout>

<CompareTable
  titleA="Valeur aberrante (outlier)"
  titleB="Traitement possible"
  rows={[
    { a: "Erreur de saisie ou de capture (ex : âge de 999 ans)", b: "Correction ou suppression — c'est une erreur, pas une donnée réelle" },
    { a: "Événement rare mais réel (ex : pic de trafic légitime lors d'un lancement produit)", b: "Conservation — c'est une information précieuse, pas du bruit" },
    { a: "Anomalie de sécurité (ex : exfiltration de données)", b: "Conservation ET investigation — c'est potentiellement l'objet même de la détection" },
]}
/>

<WarningCallout>
Confondre une valeur aberrante liée à une véritable attaque avec une simple erreur à corriger est une erreur méthodologique grave en sécurité : nettoyer trop agressivement un jeu de données peut supprimer précisément les exemples d'attaques que le modèle devait apprendre à détecter.
</WarningCallout>

## Normaliser et standardiser les données

<Steps steps={[
  { title: "Standardisation (z-score)", description: "Recentre les données autour d'une moyenne de 0 avec un écart-type de 1 — utile quand des variables ont des échelles très différentes (ex : durée en secondes vs taille en octets)." },
  { title: "Normalisation min-max", description: "Ramène toutes les valeurs entre 0 et 1 — utile quand on veut préserver la forme de la distribution d'origine." },
]} />

<TipCallout>
Sans standardisation, une variable exprimée en millions (taille d'un transfert réseau en octets) peut totalement dominer une variable exprimée en unités (nombre de connexions), faussant les calculs de distance vus au cours Algèbre Linéaire (chapitre 6) utilisés par de nombreux algorithmes de classification.
</TipCallout>

## Lab — Mise en Pratique

**Environnement** : Python 3 (terminal Nyx Shell ou environnement local avec `pandas`/`numpy`/`matplotlib` installés)

<Steps steps={[
  { title: "Créer un jeu de connexions réseau brut", description: "Construis un petit DataFrame de connexions contenant une valeur manquante, un doublon exact et une valeur de taille clairement aberrante — les trois problèmes vus dans ce chapitre.", code: 'import pandas as pd\nimport numpy as np\n\ndata = {\n    "ip_source": ["10.0.0.5", "10.0.0.6", "10.0.0.6", "10.0.0.7", "10.0.0.8"],\n    "duree_s": [12, 45, 45, np.nan, 9],\n    "taille_octets": [2400, 5100, 5100, 3200, 9000000]\n}\ndf = pd.DataFrame(data)\nprint(df)' },
  { title: "Traiter les valeurs manquantes et les doublons", description: "Impute la durée manquante par la médiane (robuste aux valeurs extrêmes) puis supprime les lignes strictement dupliquées.", code: '# Imputer la duree manquante par la mediane (robuste aux valeurs extremes)\ndf["duree_s"] = df["duree_s"].fillna(df["duree_s"].median())\n\n# Supprimer les doublons exacts\ndf = df.drop_duplicates()\nprint(df)' },
  { title: "Standardiser une colonne (z-score)", description: "Standardise la taille en octets — la valeur aberrante de 9 000 000 octets doit ressortir avec un z-score nettement supérieur aux autres.", code: 'moyenne = df["taille_octets"].mean()\necart_type = df["taille_octets"].std()\ndf["taille_standardisee"] = (df["taille_octets"] - moyenne) / ecart_type\nprint(df[["taille_octets", "taille_standardisee"]])' },
  { title: "Relier ce nettoyage aux données de sécurité", description: "Un jeu de données de connexions réseau a 2% de valeurs manquantes réparties uniformément sur une colonne peu importante : suppression ou imputation, et pourquoi ? La ligne à 9 000 000 octets isolée ci-dessus pourrait aussi être une exfiltration réelle plutôt qu'une erreur de capture : faut-il la traiter comme une erreur à nettoyer ou comme un signal à investiguer ? Justifie les deux réponses." },
]} />

## En résumé

- La qualité des données conditionne directement la qualité de tout modèle — aucun algorithme ne compense des données médiocres.
- Les valeurs manquantes peuvent être supprimées ou imputées, selon que leur absence est aléatoire ou systématique.
- En sécurité, une valeur aberrante peut être une erreur à corriger ou une attaque réelle à préserver — les confondre est une erreur méthodologique grave.

## Questions de Révision

1. Pourquoi supprimer systématiquement toute ligne avec une valeur manquante peut-il introduire un biais ?
2. Donne un exemple où un doublon dans les données peut biaiser un modèle de détection.
3. Pourquoi faut-il être particulièrement prudent avant de "nettoyer" une valeur aberrante dans un jeu de données de sécurité ?
