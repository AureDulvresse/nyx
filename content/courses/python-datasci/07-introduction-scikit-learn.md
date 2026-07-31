---
title: Introduction à scikit-learn — entraîner un premier modèle
chapter: 7
course: python-datasci
difficulty: advanced
duration: 40
tags: [python, scikit-learn, machine-learning]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Comprendre l'API commune de scikit-learn
  - Entraîner et évaluer un premier modèle de classification
  - Mettre en pratique les métriques vues au cours Data Science Complète
---

## Introduction

Ce chapitre met en pratique avec du code les concepts de machine learning supervisé vus au cours Data Science Complète (chapitres 5 et 7) — entraîner un premier modèle de classification avec scikit-learn, la bibliothèque de référence pour le machine learning classique en Python.

## L'API commune de scikit-learn

<CehCallout>
Presque tous les modèles scikit-learn partagent la même interface : `.fit(X, y)` pour entraîner, `.predict(X)` pour prédire — cette cohérence permet de changer d'algorithme (k-NN, arbre de décision, autre) en modifiant une seule ligne de code, sans réécrire tout le pipeline autour.
</CehCallout>

```python
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import classification_report

# X : caractéristiques (features), y : étiquettes (0 = normal, 1 = phishing)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

modele = KNeighborsClassifier(n_neighbors=5)  # rappel du cours Data Science Complète, ch.5
modele.fit(X_train, y_train)

predictions = modele.predict(X_test)
print(classification_report(y_test, predictions))
```

<WarningCallout>
Rappel du cours Data Science Complète (chapitre 7) : `train_test_split` sépare systématiquement les données en un jeu d'entraînement et un jeu de test JAMAIS utilisé pendant l'entraînement — évaluer un modèle sur les données qui ont servi à l'entraîner donnerait une estimation trompeusement optimiste de sa performance réelle.
</WarningCallout>

## Lire un rapport de classification

```text
              precision    recall  f1-score   support

           0       0.98      0.99      0.99       950
           1       0.85      0.72      0.78        50

    accuracy                           0.97      1000
```

<CehCallout>
Rappel du cours Data Science Complète (chapitre 7) : sur ce jeu déséquilibré (950 exemples normaux contre 50 phishing), l'accuracy globale de 0.97 est moins informative que le rappel de la classe 1 (0.72) — cela signifie que 28% des emails de phishing réels ne sont PAS détectés, une information cruciale masquée par l'accuracy globale.
</CehCallout>

## Comparer plusieurs modèles

```python
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier

modeles = {
    "k-NN": KNeighborsClassifier(n_neighbors=5),
    "Arbre de décision": DecisionTreeClassifier(max_depth=5),
    "Forêt aléatoire": RandomForestClassifier(n_estimators=100),
}

for nom, modele in modeles.items():
    modele.fit(X_train, y_train)
    score = modele.score(X_test, y_test)
    print(f"{nom} : {score:.3f}")
```

<TipCallout>
Une forêt aléatoire (Random Forest) combine de nombreux arbres de décision (chapitre 5 du cours Data Science Complète) entraînés sur des sous-échantillons différents des données, puis fait voter leurs prédictions — cette approche d'ensemble réduit généralement le risque de surapprentissage d'un arbre unique.
</TipCallout>

## Un exemple complet — détection de phishing simplifiée

```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

df = pd.read_csv("emails.csv")

X = df[["nb_liens", "contient_urgence", "domaine_recent", "nb_fautes"]]
y = df["est_phishing"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

modele = RandomForestClassifier(n_estimators=200, random_state=42)
modele.fit(X_train, y_train)

predictions = modele.predict(X_test)
print(classification_report(y_test, predictions))
```

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell)

<Steps steps={[
  { title: "Entraîner un premier modèle k-NN", description: "Sur un jeu de données fictif de connexions étiquetées (normal/suspect), entraîne un k-NN et affiche son rapport de classification." },
  { title: "Comparer deux modèles", description: "Compare les scores d'un k-NN et d'un arbre de décision sur le même jeu de données de test." },
]} />

## En résumé

- L'API commune de scikit-learn (`.fit`, `.predict`) permet de changer facilement d'algorithme sans réécrire tout le pipeline.
- `train_test_split` garantit une évaluation honnête, sur des données jamais vues pendant l'entraînement.
- Un rapport de classification révèle des informations (comme un rappel faible sur la classe minoritaire) masquées par la seule accuracy globale.

## Questions de Révision

1. Quelles sont les deux méthodes communes à presque tous les modèles scikit-learn ?
2. Pourquoi ne faut-il jamais évaluer un modèle sur les données utilisées pour l'entraîner ?
3. Pourquoi un rapport de classification est-il plus informatif qu'un simple score d'accuracy sur un jeu de données déséquilibré ?
