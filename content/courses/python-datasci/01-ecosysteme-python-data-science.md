---
title: Python pour la data science — l'écosystème
chapter: 1
course: python-datasci
difficulty: beginner
duration: 25
tags: [python, numpy, pandas, ecosysteme]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Comprendre le rôle de chaque bibliothèque de l'écosystème Python data science
  - Comprendre pourquoi Python domine ce domaine
  - Préparer son environnement de travail
---

## Introduction

Ce cours met en pratique avec du code réel chaque notion théorique du cours Data Science Complète — nettoyage, exploration, modélisation — sur des jeux de données de sécurité. Ce premier chapitre présente l'écosystème Python indispensable avant d'écrire la moindre ligne de code d'analyse.

## Pourquoi Python domine la data science

<CehCallout>
Python s'est imposé en data science non pas pour sa rapidité brute (un langage compilé comme C serait plus rapide), mais pour la richesse de son écosystème de bibliothèques optimisées (NumPy, Pandas) qui délèguent les calculs lourds à du code C/Fortran sous-jacent, tout en gardant une syntaxe simple et lisible pour l'utilisateur.
</CehCallout>

## Panorama des bibliothèques essentielles

<CompareTable
  titleA="Bibliothèque"
  titleB="Rôle"
  rows={[
    { a: "NumPy", b: "Calcul numérique vectorisé sur des tableaux — la fondation de tout le reste (chapitre 2)" },
    { a: "Pandas", b: "Manipulation de données tabulaires (DataFrames) — chargement, nettoyage, agrégation (chapitre 3)" },
    { a: "Matplotlib / Seaborn", b: "Visualisation de données — graphiques statiques pour l'exploration (chapitre 5)" },
    { a: "scikit-learn", b: "Algorithmes de machine learning prêts à l'emploi — classification, clustering, évaluation (chapitre 7)" },
    { a: "Jupyter Notebook", b: "Environnement interactif combinant code, résultats et texte explicatif dans un même document" },
]}
/>

<TipCallout>
Ces bibliothèques ne fonctionnent pas de façon isolée mais s'articulent naturellement : un DataFrame Pandas peut être directement passé à Matplotlib pour le visualiser, ou à scikit-learn pour entraîner un modèle — cette interopérabilité fluide est l'une des grandes forces de l'écosystème.
</TipCallout>

## Un premier aperçu de code

```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

# Un tableau NumPy : durées de connexions réseau (en secondes)
durees = np.array([12, 45, 8, 230, 15, 9])

# Un DataFrame Pandas : structure tabulaire avec colonnes nommées
df = pd.DataFrame({
    "duree": durees,
    "port": [80, 443, 22, 443, 80, 22]
})

print(df.describe())  # statistiques descriptives immédiates (rappel du cours Mathématiques Appliquées)
```

<WarningCallout>
Ce chapitre suppose une connaissance de base de la syntaxe Python (variables, fonctions, boucles) — approfondie au cours Linux pour la Cybersécurité pour son usage en scripting Bash/Python de sécurité. Ce cours se concentre spécifiquement sur les bibliothèques de data science, pas sur l'apprentissage du langage lui-même.
</WarningCallout>

## Préparer son environnement

<Steps steps={[
  { title: "Installer les bibliothèques essentielles", description: "pip install numpy pandas matplotlib seaborn scikit-learn" },
  { title: "Choisir un environnement de travail", description: "Jupyter Notebook/Lab pour l'exploration interactive, ou un simple script .py pour du code plus définitif." },
  { title: "Vérifier l'installation", description: "Importer chaque bibliothèque et afficher sa version pour confirmer que tout est correctement installé." },
]} />

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell)

<Steps steps={[
  { title: "Vérifier l'environnement Python", description: "Vérifie la version de Python installée et installe les bibliothèques essentielles.", code: 'python3 --version\npip install numpy pandas matplotlib seaborn scikit-learn' },
  { title: "Créer et afficher un DataFrame simple", description: "Dans un script connexions.py, crée un DataFrame de 3 connexions réseau fictives (durée, port) et affiche ses statistiques descriptives, puis exécute-le.", code: 'python3 connexions.py' },
]} />

## En résumé

- Python domine la data science grâce à un écosystème de bibliothèques optimisées, pas à sa rapidité brute intrinsèque.
- NumPy fournit le calcul vectorisé, Pandas la manipulation tabulaire, Matplotlib/Seaborn la visualisation, scikit-learn le machine learning.
- Ces bibliothèques s'articulent naturellement entre elles, formant un pipeline cohérent de bout en bout.

## Questions de Révision

1. Pourquoi Python s'est-il imposé en data science malgré ne pas être le langage le plus rapide ?
2. Quel est le rôle respectif de NumPy et Pandas dans l'écosystème ?
3. Pourquoi l'interopérabilité entre ces bibliothèques est-elle un atout majeur de l'écosystème Python ?
