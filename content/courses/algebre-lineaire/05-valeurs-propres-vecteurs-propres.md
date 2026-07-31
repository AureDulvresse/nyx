---
title: Valeurs propres et vecteurs propres
chapter: 5
course: algebre-lineaire
difficulty: advanced
duration: 35
tags: [algebre-lineaire, valeurs-propres, vecteurs-propres]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Comprendre intuitivement ce que représentent valeurs et vecteurs propres
  - Comprendre leur rôle dans la réduction de dimension (PCA)
  - Relier cette notion à l'analyse de données de sécurité
---

## Introduction

Les valeurs et vecteurs propres forment l'une des notions les plus puissantes — et les plus utilisées en pratique — de l'algèbre linéaire appliquée aux données. Elles sont au cœur de l'Analyse en Composantes Principales (PCA), une technique de réduction de dimension omniprésente en data science.

## L'intuition — des directions privilégiées

<CehCallout>
Un vecteur propre d'une matrice M est un vecteur qui, après transformation par M (chapitre 4), garde exactement la même direction — il est seulement étiré ou compressé, jamais tourné. Le facteur d'étirement associé est la valeur propre correspondante.
</CehCallout>

```text
Définition mathématique :
M × v = λ × v

où v est un vecteur propre (non nul) et λ (lambda) sa valeur propre associée.
```

<TipCallout>
Concrètement : si tu appliques une transformation (rotation, étirement...) à des milliers de vecteurs différents, la plupart changeront de direction — mais quelques directions très particulières (les vecteurs propres) resteront inchangées, seulement mises à l'échelle par leur valeur propre.
</TipCallout>

## Pourquoi c'est utile pour les données

<CehCallout>
En analyse de données, la matrice de covariance d'un jeu de données mesure comment ses différentes variables varient ensemble. Ses vecteurs propres indiquent les directions de variance maximale dans les données — les axes le long desquels les données sont le plus "étalées" — et ses valeurs propres indiquent l'importance (la quantité de variance) de chacune de ces directions.
</CehCallout>

## L'Analyse en Composantes Principales (PCA)

<Steps steps={[
  { title: "Calculer la matrice de covariance des données", description: "Mesure comment chaque paire de variables du jeu de données varie ensemble." },
  { title: "Calculer les vecteurs et valeurs propres de cette matrice", description: "Les vecteurs propres deviennent les nouveaux axes (composantes principales), ordonnés par leur valeur propre décroissante." },
  { title: "Ne garder que les premières composantes principales", description: "Celles associées aux plus grandes valeurs propres, qui capturent l'essentiel de la variance des données." },
  { title: "Projeter les données sur ces nouveaux axes", description: "Réduit le nombre de dimensions tout en conservant le maximum d'information possible." },
]} />

<CompareTable
  titleA="Avant PCA"
  titleB="Après PCA"
  rows={[
    { a: "Un jeu de données réseau avec 50 caractéristiques par connexion", b: "Réduit à 2-3 composantes principales capturant l'essentiel de la variance" },
    { a: "Impossible à visualiser directement (trop de dimensions)", b: "Visualisable sur un graphique 2D ou 3D" },
    { a: "Calcul de détection d'anomalies coûteux sur 50 dimensions", b: "Calcul bien plus rapide sur les quelques composantes retenues" },
]}
/>

<WarningCallout>
La réduction de dimension par PCA n'est pas sans perte : les composantes principales écartées contiennent une part de variance (donc d'information) qui n'est plus disponible ensuite — un compromis à assumer consciemment entre simplicité de calcul/visualisation et fidélité complète aux données originales.
</WarningCallout>

## Application à la détection d'anomalies en sécurité

<CehCallout>
Le trafic réseau normal se concentre généralement autour de quelques directions principales dans l'espace des caractéristiques (volume, fréquence, ports utilisés...) — une connexion dont la représentation s'écarte fortement de ces directions principales peut signaler une anomalie, un principe utilisé par certains outils de détection statistique évoqués au cours IA & Agents en Cybersécurité.
</CehCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Vérifier un vecteur propre", description: "Pour la matrice [[2,0],[0,3]], vérifie que le vecteur [1,0] est un vecteur propre, et détermine sa valeur propre associée." },
  { title: "Expliquer l'intérêt de la PCA", description: "Pourquoi réduire un jeu de données de 50 caractéristiques à 3 composantes principales facilite-t-il à la fois la visualisation et la détection d'anomalies ?" },
]} />

## En résumé

- Un vecteur propre d'une matrice garde la même direction après transformation, seulement mis à l'échelle par sa valeur propre.
- La PCA utilise les vecteurs propres de la matrice de covariance pour identifier les directions de variance maximale d'un jeu de données.
- Réduire la dimension via PCA facilite la visualisation et accélère les calculs, au prix d'une perte partielle d'information.

## Questions de Révision

1. Que signifie qu'un vecteur reste "dans la même direction" après une transformation matricielle ?
2. Quel rôle jouent les valeurs propres dans le choix des composantes principales à conserver en PCA ?
3. Pourquoi la PCA peut-elle faciliter la détection d'anomalies dans du trafic réseau ?
