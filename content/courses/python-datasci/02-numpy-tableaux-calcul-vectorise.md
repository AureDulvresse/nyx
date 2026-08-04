---
title: NumPy — tableaux et calcul vectorisé
chapter: 2
course: python-datasci
difficulty: beginner
duration: 30
tags: [python, numpy, vectorisation]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Comprendre la structure du tableau NumPy (ndarray)
  - Comprendre le principe de la vectorisation et son intérêt
  - Réaliser les opérations vues au cours Algèbre Linéaire avec NumPy
---

## Introduction

NumPy est la fondation de tout l'écosystème Python data science — Pandas, scikit-learn et de nombreuses autres bibliothèques utilisent ses tableaux (ndarray) en interne. Ce chapitre met en pratique avec du code les vecteurs et matrices déjà étudiés au cours Algèbre Linéaire.

## Le tableau NumPy (ndarray)

```python
import numpy as np

# Un vecteur (rappel du cours Algèbre Linéaire, chapitre 1)
v = np.array([15, 2, 1])  # caractéristiques d'un email

# Une matrice (rappel du cours Algèbre Linéaire, chapitre 2)
M = np.array([
    [15, 2, 1],
    [2, 45, 0],
    [8, 12, 1]
])

print(v.shape)  # (3,) — un vecteur de 3 éléments
print(M.shape)  # (3, 3) — une matrice 3x3
```

<CehCallout>
Contrairement à une liste Python classique, un tableau NumPy stocke ses éléments de façon contiguë en mémoire et de type unique — cette contrainte, en apparence restrictive, est précisément ce qui permet des calculs des milliers de fois plus rapides que des boucles Python classiques sur de grands volumes de données.
</CehCallout>

## Le principe de la vectorisation

<WarningCallout>
Écrire une boucle Python explicite pour additionner deux vecteurs élément par élément fonctionne, mais devient extrêmement lent sur de grands tableaux (des millions de valeurs, comme un an de logs réseau) — la vectorisation NumPy remplace cette boucle explicite par une opération unique optimisée en code compilé.
</WarningCallout>

```python
# Sans vectorisation (lent sur de grands tableaux)
resultat = []
for i in range(len(v1)):
    resultat.append(v1[i] + v2[i])

# Avec vectorisation NumPy (rapide, lisible)
resultat = v1 + v2
```

## Réaliser les opérations du cours Algèbre Linéaire avec NumPy

<CompareTable
  titleA="Opération (cours Algèbre Linéaire)"
  titleB="Code NumPy équivalent"
  rows={[
    { a: "Produit scalaire (ch.1)", b: "np.dot(v1, v2) ou v1 @ v2" },
    { a: "Norme d'un vecteur (ch.1, ch.6)", b: "np.linalg.norm(v)" },
    { a: "Multiplication matricielle (ch.2)", b: "A @ B ou np.matmul(A, B)" },
    { a: "Déterminant (ch.3)", b: "np.linalg.det(M)" },
    { a: "Inverse d'une matrice (ch.3)", b: "np.linalg.inv(M)" },
    { a: "Valeurs et vecteurs propres (ch.5)", b: "np.linalg.eig(M)" },
]}
/>

<TipCallout>
Ce tableau de correspondance illustre concrètement pourquoi le cours Algèbre Linéaire n'était pas un détour théorique : chaque notion mathématique vue s'exprime en une seule ligne de code NumPy, directement réutilisable dans une analyse de sécurité réelle.
</TipCallout>

## Le slicing et le filtrage — sélectionner des données

```python
connexions = np.array([12, 450, 8, 230, 15, 9, 600])

# Slicing : les 3 premières valeurs
print(connexions[:3])

# Filtrage booléen : connexions durant plus de 200 secondes (potentiellement suspectes)
suspectes = connexions[connexions > 200]
print(suspectes)  # [450 230 600]
```

<CehCallout>
Le filtrage booléen NumPy (`connexions > 200`) est l'un des outils les plus utilisés en pratique pour isoler rapidement des observations suspectes selon un seuil — une opération vectorisée qui remplace élégamment une boucle avec condition explicite.
</CehCallout>

## Lab — Mise en Pratique

**Environnement** : Python 3 (terminal Nyx Shell ou environnement local avec `pandas`/`numpy`/`matplotlib` installés)

<Steps steps={[
  { title: "Créer un vecteur et une matrice NumPy", description: "Recrée le vecteur et la matrice d'exemple du chapitre et affiche leurs dimensions.", code: 'import numpy as np\n\nv = np.array([15, 2, 1])\nM = np.array([\n    [15, 2, 1],\n    [2, 45, 0],\n    [8, 12, 1]\n])\n\nprint(v.shape)\nprint(M.shape)' },
  { title: "Calculer un produit scalaire et une norme", description: "Vérifie en code le calcul du chapitre 1 du cours Algèbre Linéaire à l'aide de NumPy.", code: 'v1 = np.array([2, 3, 1])\nv2 = np.array([1, 0, 4])\n\nprint(np.dot(v1, v2))\nprint(np.linalg.norm(v1))' },
  { title: "Comparer boucle Python et vectorisation", description: "Additionne deux vecteurs avec une boucle explicite puis avec la vectorisation NumPy, pour constater l'équivalence du résultat.", code: 'resultat_boucle = []\nfor i in range(len(v1)):\n    resultat_boucle.append(v1[i] + v2[i])\n\nresultat_vectorise = v1 + v2\nprint(resultat_boucle)\nprint(resultat_vectorise)' },
  { title: "Filtrer des connexions suspectes", description: "Filtre, dans un tableau de durées de connexion, celles dépassant 300 secondes.", code: 'connexions = np.array([12, 450, 8, 230, 15, 9, 600])\nsuspectes = connexions[connexions > 300]\nprint(suspectes)' },
]} />

## En résumé

- Le tableau NumPy (ndarray) stocke des données de façon contiguë et typée, permettant un calcul vectorisé bien plus rapide qu'une boucle Python classique.
- Chaque opération d'algèbre linéaire vue précédemment (produit scalaire, déterminant, valeurs propres...) s'exprime en une ligne de code NumPy.
- Le filtrage booléen vectorisé permet d'isoler rapidement des observations selon un seuil, un outil central en analyse de sécurité.

## Questions de Révision

1. Pourquoi un tableau NumPy permet-il des calculs bien plus rapides qu'une boucle Python classique ?
2. Quelle fonction NumPy calcule le déterminant d'une matrice ?
3. À quoi sert le filtrage booléen (`tableau[tableau > seuil]`) en analyse de sécurité ?
