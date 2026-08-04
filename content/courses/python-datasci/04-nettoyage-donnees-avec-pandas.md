---
title: Nettoyage de données avec Pandas
chapter: 4
course: python-datasci
difficulty: intermediate
duration: 30
tags: [python, pandas, nettoyage]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Détecter et traiter les valeurs manquantes avec Pandas
  - Détecter et traiter les doublons avec Pandas
  - Convertir et normaliser des types de données
---

## Introduction

Ce chapitre met en pratique avec du code Pandas les principes de nettoyage vus au cours Data Science Complète (chapitre 2) — détection et traitement des valeurs manquantes, des doublons, et des types de données incohérents.

## Détecter les valeurs manquantes

```python
import pandas as pd
import numpy as np

df = pd.DataFrame({
    "ip": ["10.0.0.5", "10.0.0.12", None, "10.0.0.5"],
    "port": [443, np.nan, 80, 443]
})

print(df.isnull().sum())   # nombre de valeurs manquantes par colonne
print(df.isnull().mean())  # proportion de valeurs manquantes par colonne
```

<CehCallout>
Vérifier systématiquement `df.isnull().sum()` juste après le chargement d'un jeu de données est un réflexe de base — il révèle immédiatement quelles colonnes nécessitent un traitement avant toute analyse ultérieure, évitant des erreurs silencieuses plus loin dans le pipeline.
</CehCallout>

## Traiter les valeurs manquantes

<CompareTable
  titleA="Méthode Pandas"
  titleB="Effet"
  rows={[
    { a: "df.dropna()", b: "Supprime les lignes contenant au moins une valeur manquante" },
    { a: "df.fillna(valeur)", b: "Remplace les valeurs manquantes par une valeur fixe" },
    { a: "df.fillna(df.mean(numeric_only=True))", b: "Remplace par la moyenne de la colonne (imputation)" },
    { a: "df.ffill() / df.bfill()", b: "Propage la valeur précédente/suivante — utile pour des séries temporelles" },
]}
/>

<WarningCallout>
Rappel du cours Data Science Complète (chapitre 2) : `dropna()` appliqué sans réflexion peut introduire un biais si les valeurs manquantes ne sont pas réparties au hasard — toujours vérifier `isnull().mean()` par colonne avant de choisir entre suppression et imputation.
</WarningCallout>

## Détecter et traiter les doublons

```python
# Détecter les lignes dupliquées
print(df.duplicated().sum())

# Supprimer les doublons, en gardant la première occurrence
df_sans_doublons = df.drop_duplicates()

# Détecter les doublons sur un sous-ensemble de colonnes seulement
df.duplicated(subset=["ip"])
```

<TipCallout>
Un doublon exact sur toutes les colonnes est facile à repérer avec `duplicated()`, mais un "quasi-doublon" (même IP source, timestamps très proches, légères variations) nécessite une logique métier plus fine — souvent un filtrage combiné sur plusieurs colonnes plutôt qu'une détection automatique unique.
</TipCallout>

## Convertir et normaliser les types de données

```python
# Une colonne "date" chargée comme texte doit être convertie explicitement
df["timestamp"] = pd.to_datetime(df["timestamp"])

# Convertir une colonne numérique mal typée (chargée comme texte)
df["port"] = pd.to_numeric(df["port"], errors="coerce")  # les valeurs invalides deviennent NaN
```

<CehCallout>
Un fichier de logs exporté au format CSV charge presque toujours les dates comme du texte brut par défaut — oublier de les convertir explicitement en type datetime empêche tout tri chronologique correct ou calcul de durée entre deux événements, un piège fréquent lors d'une investigation temporelle.
</CehCallout>

## Lab — Mise en Pratique

**Environnement** : Python 3 (terminal Nyx Shell ou environnement local avec `pandas`/`numpy`/`matplotlib` installés)

<Steps steps={[
  { title: "Charger un DataFrame avec valeurs manquantes", description: "Recrée le DataFrame d'exemple contenant des valeurs manquantes et affiche leur proportion par colonne.", code: 'import pandas as pd\nimport numpy as np\n\ndf = pd.DataFrame({\n    "ip": ["10.0.0.5", "10.0.0.12", None, "10.0.0.5"],\n    "port": [443, np.nan, 80, 443]\n})\n\nprint(df.isnull().mean())' },
  { title: "Supprimer les doublons", description: "Détecte puis supprime les lignes dupliquées du DataFrame.", code: 'print(df.duplicated().sum())\ndf_sans_doublons = df.drop_duplicates()\nprint(df_sans_doublons)' },
  { title: "Imputer les valeurs manquantes par la médiane", description: "Remplace les valeurs manquantes numériques de la colonne port par sa médiane.", code: 'df["port"] = df["port"].fillna(df["port"].median())\nprint(df)' },
  { title: "Convertir une colonne en type numérique", description: "Force la conversion de la colonne port en type numérique, les valeurs invalides devenant NaN.", code: 'df["port"] = pd.to_numeric(df["port"], errors="coerce")\nprint(df.dtypes)' },
]} />

## En résumé

- `isnull().sum()` et `isnull().mean()` révèlent immédiatement l'ampleur des valeurs manquantes par colonne.
- `dropna()`, `fillna()` et l'imputation par moyenne/médiane sont les outils Pandas de base pour traiter les valeurs manquantes.
- La conversion explicite des types (notamment les dates avec `pd.to_datetime`) est indispensable après le chargement d'un fichier brut.

## Questions de Révision

1. Quelle méthode Pandas révèle la proportion de valeurs manquantes par colonne ?
2. Pourquoi faut-il convertir explicitement une colonne de dates chargée depuis un CSV ?
3. Pourquoi un "quasi-doublon" est-il plus difficile à détecter automatiquement qu'un doublon exact ?
