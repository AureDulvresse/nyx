---
title: Pandas — manipuler des DataFrames
chapter: 3
course: python-datasci
difficulty: intermediate
duration: 35
tags: [python, pandas, dataframe]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Comprendre la structure d'un DataFrame Pandas
  - Charger, filtrer et agréger des données avec Pandas
  - Réaliser les opérations de base sur un jeu de données de logs
---

## Introduction

Si NumPy fournit le calcul vectorisé brut, Pandas ajoute une couche indispensable pour le travail quotidien en data science : des colonnes nommées, des types hétérogènes, et des opérations de haut niveau pensées pour l'analyse de données tabulaires — exactement la forme que prennent la plupart des logs et jeux de données de sécurité.

## Le DataFrame — une table de données nommée

```python
import pandas as pd

df = pd.DataFrame({
    "ip_source": ["10.0.0.5", "10.0.0.12", "10.0.0.5", "192.168.1.3"],
    "port": [443, 22, 80, 443],
    "duree_s": [12, 340, 8, 450],
    "octets": [2400, 890000, 1200, 15000]
})

print(df.head())        # les 5 premières lignes
print(df.dtypes)        # le type de chaque colonne
```

<CehCallout>
Un DataFrame Pandas se charge presque toujours depuis un fichier réel plutôt que d'être construit à la main — `pd.read_csv("logs.csv")` ou `pd.read_json("logs.json")` transforment directement un export de logs en DataFrame exploitable, la première étape de toute analyse.
</CehCallout>

## Filtrer et sélectionner des données

```python
# Sélectionner une colonne
print(df["duree_s"])

# Filtrer les connexions longues (rappel du filtrage NumPy, chapitre 2)
longues = df[df["duree_s"] > 100]

# Filtrer sur plusieurs conditions
suspectes = df[(df["duree_s"] > 100) & (df["octets"] > 500000)]
```

<WarningCallout>
En Pandas, les opérateurs logiques `&` (et) et `|` (ou) remplacent les mots-clés Python `and`/`or` pour combiner des conditions sur des colonnes entières — une erreur fréquente chez les débutants est d'utiliser `and`/`or`, qui ne fonctionnent pas correctement sur des séries de valeurs et lèvent une erreur.
</WarningCallout>

## Agréger des données avec groupby

<CehCallout>
`groupby` est l'opération Pandas la plus puissante pour l'analyse de sécurité : elle permet de répondre à des questions comme "quel est le volume total de données par IP source ?" ou "combien de connexions par port ?", en une seule ligne de code, sans écrire de boucle.
</CehCallout>

```python
# Volume total (octets) par IP source
par_ip = df.groupby("ip_source")["octets"].sum()
print(par_ip)

# Nombre de connexions par port, trié par fréquence décroissante
par_port = df["port"].value_counts()
print(par_port)
```

## Trier et classer

```python
# Les connexions triées par volume décroissant
df_trie = df.sort_values("octets", ascending=False)

# Les 3 connexions avec le plus gros volume
top3 = df.nlargest(3, "octets")
```

<TipCallout>
`nlargest` et `nsmallest` sont plus efficaces et plus lisibles que trier l'ensemble du DataFrame puis prendre les premières lignes — un réflexe utile quand on ne s'intéresse qu'aux valeurs extrêmes d'un grand jeu de données, comme les plus gros volumes de trafic suspects.
</TipCallout>

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell)

<Steps steps={[
  { title: "Créer et filtrer un DataFrame de connexions", description: "Crée un DataFrame de connexions réseau fictives et filtre celles dont le volume dépasse 100 000 octets." },
  { title: "Agréger par IP source", description: "Utilise groupby pour calculer le volume total de données par IP source, puis identifie l'IP ayant transféré le plus de données." },
]} />

## En résumé

- Un DataFrame Pandas structure des données tabulaires avec des colonnes nommées et typées, la forme naturelle de la plupart des logs de sécurité.
- Le filtrage combine des conditions avec les opérateurs `&` et `|`, jamais `and`/`or` sur des colonnes entières.
- `groupby` permet d'agréger des données (sommes, comptages) par catégorie en une seule ligne de code, un outil central pour l'analyse de logs.

## Questions de Révision

1. Pourquoi utilise-t-on `&` et `|` plutôt que `and`/`or` pour combiner des conditions sur des colonnes Pandas ?
2. Que permet de faire l'opération `groupby` en une seule ligne de code ?
3. Pourquoi `nlargest` est-il préférable à un tri complet suivi d'une sélection des premières lignes ?
