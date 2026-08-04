---
title: Visualisation avec Matplotlib et Seaborn
chapter: 5
course: python-datasci
difficulty: intermediate
duration: 30
tags: [python, matplotlib, seaborn, visualisation]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Créer les visualisations de base vues au cours Data Science Complète avec du code
  - Comprendre la différence de niveau d'abstraction entre Matplotlib et Seaborn
  - Construire des graphiques lisibles et pertinents pour l'analyse de sécurité
---

## Introduction

Ce chapitre met en pratique avec du code les types de visualisations déjà présentés au cours Data Science Complète (chapitre 3) : histogrammes, nuages de points, boxplots et matrices de corrélation, appliqués à des données de sécurité.

## Matplotlib — le socle de la visualisation Python

```python
import matplotlib.pyplot as plt

durees = [12, 450, 8, 230, 15, 9, 600, 45, 20]

plt.hist(durees, bins=10)
plt.xlabel("Durée de connexion (secondes)")
plt.ylabel("Nombre de connexions")
plt.title("Distribution des durées de connexion")
plt.show()
```

<CehCallout>
Matplotlib offre un contrôle très fin sur chaque élément d'un graphique (couleurs, axes, annotations) mais nécessite plus de code pour des graphiques statistiques standards — c'est précisément le vide que Seaborn vient combler.
</CehCallout>

## Seaborn — des graphiques statistiques en une ligne

```python
import seaborn as sns
import pandas as pd

df = pd.DataFrame({
    "duree": [12, 450, 8, 230, 15, 9, 600],
    "port": [443, 22, 80, 443, 80, 22, 443]
})

# Boxplot par catégorie (rappel du cours Data Science Complète, chapitre 3)
sns.boxplot(data=df, x="port", y="duree")
plt.show()

# Matrice de corrélation
sns.heatmap(df.corr(numeric_only=True), annot=True, cmap="coolwarm")
plt.show()
```

<TipCallout>
Seaborn est construit directement au-dessus de Matplotlib — il génère des graphiques statistiques plus riches (boxplots par catégorie, heatmaps de corrélation) avec une syntaxe bien plus concise, tout en restant compatible avec les fonctions Matplotlib pour un réglage fin si nécessaire.
</TipCallout>

## Construire un graphique lisible et pertinent

<Steps steps={[
  { title: "Toujours nommer les axes et le titre", description: "Un graphique sans légende claire est inutilisable pour quelqu'un d'autre que son auteur, même techniquement correct." },
  { title: "Choisir une échelle adaptée", description: "Une distribution avec des valeurs très étalées peut nécessiter une échelle logarithmique pour rester lisible." },
  { title: "Éviter la surcharge visuelle", description: "Un graphique avec trop de couleurs ou de catégories simultanées devient illisible — préférer plusieurs graphiques simples à un seul graphique surchargé." },
]} />

<WarningCallout>
Un graphique mal légendé ou à l'échelle trompeuse peut induire en erreur, y compris involontairement — rappel du piège de sur-interprétation visuelle vu au cours Data Science Complète (chapitre 3) : la façon de présenter un graphique influence directement l'interprétation qui en sera faite, une responsabilité à prendre au sérieux lors de la présentation de résultats de sécurité.
</WarningCallout>

## Visualiser une série temporelle de logs

```python
df["timestamp"] = pd.to_datetime(df["timestamp"])
df_par_heure = df.set_index("timestamp").resample("1H").size()

df_par_heure.plot(figsize=(10, 4))
plt.ylabel("Nombre de connexions")
plt.title("Volume de connexions par heure")
plt.show()
```

<CehCallout>
`resample` est l'outil Pandas central pour l'analyse temporelle — il regroupe automatiquement les événements par intervalle de temps (heure, jour...), une étape indispensable avant de visualiser ou détecter une rupture dans un volume de trafic au fil du temps.
</CehCallout>

## Lab — Mise en Pratique

**Environnement** : Python 3 (terminal Nyx Shell ou environnement local avec `pandas`/`numpy`/`matplotlib` installés)

<Steps steps={[
  { title: "Créer un histogramme des durées de connexion", description: "Génère un histogramme des durées de connexion, avec axes et titre correctement légendés.", code: 'import matplotlib.pyplot as plt\n\ndurees = [12, 450, 8, 230, 15, 9, 600, 45, 20]\n\nplt.hist(durees, bins=10)\nplt.xlabel("Duree de connexion (secondes)")\nplt.ylabel("Nombre de connexions")\nplt.title("Distribution des durees de connexion")\nplt.show()' },
  { title: "Créer un DataFrame à 3 colonnes numériques", description: "Construis un DataFrame avec trois colonnes numériques corrélées entre elles.", code: 'import pandas as pd\n\ndf = pd.DataFrame({\n    "duree": [12, 450, 8, 230, 15, 9, 600],\n    "octets": [2400, 89000, 1200, 45000, 3000, 1800, 120000],\n    "port": [443, 22, 80, 443, 80, 22, 443]\n})' },
  { title: "Afficher la matrice de corrélation en heatmap", description: "Calcule et visualise la matrice de corrélation des colonnes numériques avec Seaborn.", code: 'import seaborn as sns\n\nsns.heatmap(df.corr(numeric_only=True), annot=True, cmap="coolwarm")\nplt.show()' },
]} />

## En résumé

- Matplotlib offre un contrôle fin mais verbeux ; Seaborn, construit dessus, simplifie les graphiques statistiques courants.
- Un graphique doit toujours être clairement légendé (axes, titre) et à une échelle adaptée pour rester interprétable honnêtement.
- `resample` regroupe des événements par intervalle de temps, une étape clé avant toute visualisation ou détection de rupture temporelle.

## Questions de Révision

1. Quelle est la différence de niveau d'abstraction entre Matplotlib et Seaborn ?
2. Pourquoi un graphique sans axes légendés est-il problématique, même s'il est techniquement correct ?
3. À quoi sert la fonction `resample` de Pandas pour l'analyse de logs ?
