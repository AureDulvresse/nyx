---
title: Clustering approfondi — k-means, DBSCAN et hiérarchique
chapter: 5
course: machine-learning
difficulty: advanced
duration: 35
tags: [clustering, kmeans, dbscan]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Approfondir le fonctionnement mathématique de k-means
  - Comprendre DBSCAN et le clustering par densité
  - Comprendre le clustering hiérarchique et son dendrogramme
---

## Introduction

Ce chapitre approfondit le clustering déjà introduit de façon appliquée au cours Data Science Complète (chapitre 6) — trois approches complémentaires, chacune adaptée à des formes de données différentes, un choix particulièrement pertinent pour regrouper des familles de malwares ou détecter des comportements réseau atypiques.

## k-means en détail

<CehCallout>
Rappel du cours Data Science Complète (chapitre 6) : k-means partitionne les données en k groupes en minimisant la distance entre chaque point et le centre (centroïde) de son groupe — ce chapitre détaille comment cet algorithme trouve itérativement ces centroïdes.
</CehCallout>

<Steps steps={[
  { title: "Initialiser k centroïdes aléatoirement", description: "k points sont choisis (souvent aléatoirement parmi les données) comme centroïdes initiaux." },
  { title: "Assigner chaque point au centroïde le plus proche", description: "Chaque point est rattaché au groupe dont le centroïde est le plus proche (distance euclidienne)." },
  { title: "Recalculer les centroïdes", description: "Chaque centroïde est repositionné à la moyenne des points de son groupe." },
  { title: "Répéter jusqu'à stabilisation", description: "Les étapes 2 et 3 se répètent jusqu'à ce que les assignations ne changent plus (convergence)." },
]} />

<WarningCallout>
k-means nécessite de choisir k à l'avance et suppose des groupes de forme sphérique et de taille comparable — deux limites importantes : un mauvais choix de k ou des groupes de forme irrégulière (en croissant, imbriqués) donnent des résultats médiocres.
</WarningCallout>

## DBSCAN — le clustering par densité

<CehCallout>
DBSCAN (Density-Based Spatial Clustering) ne nécessite pas de choisir un nombre de groupes à l'avance — il regroupe les points densément proches les uns des autres et marque comme "bruit" les points isolés, une capacité directement utile pour la détection d'anomalies (un point de bruit est potentiellement une anomalie).
</CehCallout>

```mermaid
graph LR
    A[Point de densité élevée] --> B[Cœur de cluster]
    C[Point proche d'un cœur] --> D[Bordure de cluster]
    E[Point isolé, faible densité] --> F[Bruit - anomalie potentielle]
```

<TipCallout>
Cette capacité à identifier le "bruit" distingue fondamentalement DBSCAN de k-means, qui force chaque point dans l'un des k groupes même s'il ne ressemble à aucun d'entre eux — un atout majeur pour la détection d'anomalies réseau (cours Analyse SOC, chapitre 5), où les points de bruit correspondent souvent aux comportements les plus intéressants à investiguer.
</TipCallout>

## Le clustering hiérarchique

<CehCallout>
Le clustering hiérarchique construit une hiérarchie de groupes emboîtés, visualisable sous forme de dendrogramme — un arbre qui montre à quel niveau de similarité chaque paire de groupes fusionne, permettant de choisir a posteriori le nombre de groupes en "coupant" l'arbre au niveau souhaité.
</CehCallout>

```mermaid
graph TD
    A[Fusion finale] --> B[Groupe A+B]
    A --> C[Groupe C+D]
    B --> D1[Point A]
    B --> D2[Point B]
    C --> D3[Point C]
    C --> D4[Point D]
```

<CompareTable
  titleA="Méthode"
  titleB="Avantage distinctif"
  rows={[
    { a: "k-means", b: "Rapide, efficace sur de grands volumes, mais nécessite de fixer k à l'avance" },
    { a: "DBSCAN", b: "Détecte le bruit/les anomalies, aucune forme de groupe imposée, aucun k requis" },
    { a: "Hiérarchique", b: "Fournit une vue à tous les niveaux de granularité via le dendrogramme, mais coûteux en calcul sur de grands volumes" },
]}
/>

## Lab — Mise en Pratique

**Environnement** : Python 3 (terminal Nyx Shell ou environnement local avec `scikit-learn`/`pandas`/`numpy` installés)

<Steps steps={[
  { title: "Générer des données en croissants imbriqués", description: "Crée un jeu de données dont la forme n'est pas sphérique, exactement le cas limite de k-means évoqué plus haut.", code: "from sklearn.datasets import make_moons\nX, y_true = make_moons(n_samples=200, noise=0.05, random_state=0)" },
  { title: "Appliquer k-means", description: "Partitionne ces données avec k-means (k=2) et observe que la frontière sphérique imposée découpe mal les deux croissants.", code: "from sklearn.cluster import KMeans\nkm = KMeans(n_clusters=2, n_init=10, random_state=0).fit(X)\nprint('labels k-means (20 premiers):', km.labels_[:20])" },
  { title: "Appliquer DBSCAN", description: "Sur les mêmes données, exécute DBSCAN et compare : il doit retrouver les deux croissants et identifier les points de bruit isolés.", code: "from sklearn.cluster import DBSCAN\ndb = DBSCAN(eps=0.2, min_samples=5).fit(X)\nprint('labels DBSCAN (20 premiers):', db.labels_[:20])\nprint('nombre de points de bruit:', (db.labels_ == -1).sum())" },
  { title: "Appliquer le clustering hiérarchique", description: "Termine par un clustering hiérarchique sur les mêmes données et compare les trois résultats obtenus, en te reliant au tableau comparatif des trois méthodes vu plus haut.", code: "from sklearn.cluster import AgglomerativeClustering\nagg = AgglomerativeClustering(n_clusters=2).fit(X)\nprint('labels hierarchique (20 premiers):', agg.labels_[:20])" },
]} />

## En résumé

- k-means partitionne itérativement les données en k groupes en minimisant la distance aux centroïdes, mais nécessite de fixer k et suppose des groupes sphériques.
- DBSCAN regroupe par densité sans nécessiter de k prédéfini, et identifie explicitement les points isolés comme du bruit — utile pour la détection d'anomalies.
- Le clustering hiérarchique construit un dendrogramme permettant de choisir le nombre de groupes après coup, à n'importe quel niveau de granularité.

## Questions de Révision

1. Quelles sont les principales étapes itératives de l'algorithme k-means ?
2. Pourquoi DBSCAN est-il particulièrement adapté à la détection d'anomalies, contrairement à k-means ?
3. Qu'est-ce qu'un dendrogramme, et quel avantage offre-t-il par rapport à k-means ?
