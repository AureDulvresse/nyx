---
title: Statistiques descriptives
chapter: 6
course: maths
difficulty: intermediate
duration: 30
tags: [maths, statistiques, moyenne, ecart-type]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Calculer moyenne, médiane et écart-type d'un jeu de données
  - Comprendre ce que révèle la dispersion d'une distribution
  - Relier les statistiques descriptives à la détection d'anomalies
---

## Introduction

Les statistiques descriptives résument un jeu de données en quelques indicateurs clés — une compétence directement mobilisée dans les cours Data Science et IA & Cybersécurité, notamment pour la détection d'anomalies en SOC (cours Analyse SOC) : une activité "anormale" n'est souvent qu'une valeur statistiquement éloignée du comportement habituel.

## Les indicateurs de tendance centrale

<CompareTable
  titleA="Indicateur"
  titleB="Calcul et usage"
  rows={[
    { a: "Moyenne", b: "Somme des valeurs divisée par leur nombre — sensible aux valeurs extrêmes" },
    { a: "Médiane", b: "Valeur qui sépare le jeu de données en deux moitiés égales — insensible aux valeurs extrêmes" },
    { a: "Mode", b: "Valeur la plus fréquente dans le jeu de données" },
]}
/>

```text
Jeu de données : 2, 3, 3, 4, 5, 100

Moyenne = (2+3+3+4+5+100) / 6 ≈ 19,5   ← fortement tirée vers le haut par 100
Médiane = (3+4) / 2 = 3,5              ← reste représentative de la majorité des valeurs
Mode = 3                                ← valeur la plus fréquente
```

<CehCallout>
Ce jeu de données illustre un piège classique : la moyenne (19,5) donne une impression trompeuse du jeu de données, largement déformée par la valeur extrême 100 — en analyse de logs ou de trafic réseau, une seule valeur aberrante (un pic de trafic exceptionnel) peut fausser une moyenne, alors que la médiane reste robuste à ce type de distorsion.
</CehCallout>

## L'écart-type — mesurer la dispersion

<Steps steps={[
  { title: "Calculer l'écart à la moyenne", description: "Pour chaque valeur, calculer sa distance à la moyenne du jeu de données." },
  { title: "Élever au carré et moyenner", description: "Élever chaque écart au carré (pour éliminer les signes négatifs) puis calculer la moyenne de ces carrés (la variance)." },
  { title: "Prendre la racine carrée", description: "La racine carrée de la variance donne l'écart-type, exprimé dans la même unité que les données originales." },
]} />

<TipCallout>
Un écart-type faible signifie que les valeurs sont regroupées près de la moyenne (comportement stable et prévisible) ; un écart-type élevé signifie une forte dispersion — deux serveurs avec la même latence moyenne peuvent avoir des profils de performance radicalement différents selon leur écart-type.
</TipCallout>

## Application à la détection d'anomalies

<CehCallout>
Une approche statistique simple de détection d'anomalies consiste à signaler toute valeur s'écartant de plus de 2 ou 3 écarts-types de la moyenne habituelle (règle empirique liée à la distribution normale) — un volume de connexions sortantes dépassant largement cette plage déclenche une alerte, un principe utilisé par de nombreux outils de supervision vus au cours Administration Systèmes et Réseaux.
</CehCallout>

<WarningCallout>
Cette approche statistique simple a une limite importante : elle suppose une distribution stable dans le temps. Un trafic réseau qui évolue naturellement (croissance de l'activité, changement d'horaires de travail) peut nécessiter un recalcul périodique de la moyenne et de l'écart-type de référence, sous peine de générer soit des faux positifs, soit de manquer de vraies anomalies.
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (calculs à la main)

<Steps steps={[
  { title: "Calculer moyenne et médiane", description: "Pour ce jeu de temps de réponse serveur (en ms) : 45, 48, 50, 47, 46, 300 — calcule la moyenne et la médiane. Laquelle représente mieux le comportement typique du serveur ?" },
  { title: "Justifier un seuil d'alerte", description: "Pourquoi un seuil de détection basé sur 'moyenne + 3 écarts-types' est-il plus robuste qu'un seuil fixe arbitraire (ex: 'plus de 1000 connexions par minute') pour un service dont l'activité varie fortement selon l'heure ?" },
]} />

## En résumé

- La moyenne est sensible aux valeurs extrêmes, contrairement à la médiane qui reste robuste face aux valeurs aberrantes.
- L'écart-type mesure la dispersion d'un jeu de données autour de sa moyenne.
- La détection d'anomalies statistique repose souvent sur l'écart à la moyenne exprimé en écarts-types, une approche à recalibrer périodiquement.

## Questions de Révision

1. Pourquoi la médiane est-elle plus robuste que la moyenne face à des valeurs extrêmes ?
2. Que mesure l'écart-type, et que signifie un écart-type faible par rapport à un écart-type élevé ?
3. Pourquoi un seuil de détection statistique doit-il parfois être recalculé périodiquement plutôt que fixé une fois pour toutes ?
