---
title: Déploiement et limites du deep learning en sécurité
chapter: 7
course: deep-learning
difficulty: advanced
duration: 40
tags: [deploiement, adversarial, limites, synthese]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Comprendre les enjeux du déploiement d'un modèle de deep learning
  - Comprendre le principe des attaques adversariales
  - Construire une synthèse critique du deep learning appliqué à la cybersécurité
---

## Introduction

Ce dernier chapitre referme à la fois le cours Deep Learning et l'ensemble du parcours Machine Learning/Deep Learning, en abordant le déploiement pratique d'un modèle et, surtout, ses limites spécifiques en contexte de sécurité — un regard critique indispensable avant d'intégrer un modèle de deep learning dans une chaîne de décision sensible.

## Déployer un modèle de deep learning

<CehCallout>
Rappel du cours Machine Learning (chapitre 7, mise en production) : les mêmes principes s'appliquent au deep learning — sérialiser le modèle entraîné, l'exposer via une interface stable, surveiller sa dérive dans le temps — avec une contrainte supplémentaire propre au deep learning : la taille et le coût de calcul souvent bien plus importants des modèles profonds.
</CehCallout>

<CompareTable
  titleA="Contrainte"
  titleB="Implication pour le déploiement"
  rows={[
    { a: "Taille du modèle (souvent des centaines de Mo à plusieurs Go)", b: "Nécessite parfois une compression ou une simplification du modèle avant déploiement" },
    { a: "Coût de calcul de l'inférence", b: "Peut nécessiter du matériel spécialisé (GPU) même en production, pas seulement à l'entraînement" },
    { a: "Latence", b: "Un modèle profond peut être trop lent pour une décision en temps réel (ex : blocage instantané d'une connexion réseau)" },
]}
/>

## Les attaques adversariales

<WarningCallout>
Une attaque adversariale consiste à modifier légèrement une entrée — de façon souvent imperceptible pour un humain — spécifiquement pour tromper un modèle de deep learning, lui faisant produire une prédiction erronée avec une confiance élevée : une image légèrement perturbée peut ainsi faire classer un malware comme un fichier bénin par un CNN de détection (chapitre 3).
</WarningCallout>

```mermaid
graph LR
    A[Fichier malveillant] --> B[Perturbation adversariale minime]
    B --> C[Modèle de détection]
    C -->|Classé à tort| D[Bénin, avec forte confiance]
```

<CehCallout>
Rappel du cours Cybersécurité Offensive : de la même façon qu'un attaquant cherche des angles morts dans une défense périmétrique, une attaque adversariale cherche les angles morts mathématiques d'un modèle — les frontières de décision apprises par le modèle, qui ne coïncident jamais parfaitement avec la véritable frontière entre "malveillant" et "bénin".
</CehCallout>

<TipCallout>
Se défendre contre les attaques adversariales reste un domaine de recherche actif — l'entraînement adversarial (inclure volontairement des exemples perturbés dans l'entraînement) et la détection d'anomalies sur les entrées elles-mêmes (rappel cours Machine Learning, chapitre 5, DBSCAN) sont deux approches complémentaires, aucune n'étant une solution définitive.
</TipCallout>

## Les limites du deep learning en sécurité — synthèse critique

<WarningCallout>
Rappel du cours IA & Agents en Cybersécurité et du cours Analyse SOC : un modèle de deep learning, aussi performant soit-il sur ses données d'évaluation, reste une boîte largement opaque (contrairement à un arbre de décision, cours Machine Learning chapitre 3) — difficile à auditer précisément, vulnérable aux attaques adversariales, et sujet à la dérive de concept face à des menaces en constante évolution.
</WarningCallout>

<Steps steps={[
  { title: "Opacité (manque d'interprétabilité)", description: "Contrairement à un arbre de décision ou une régression, il est difficile d'expliquer précisément pourquoi un réseau profond a pris une décision donnée." },
  { title: "Vulnérabilité aux attaques adversariales", description: "Un modèle peut être délibérément trompé par des entrées conçues spécifiquement pour exploiter ses failles mathématiques." },
  { title: "Dérive de concept", description: "Rappel du cours Machine Learning (chapitre 7) : les techniques d'attaque évoluent, un modèle entraîné sur des données anciennes se dégrade avec le temps." },
  { title: "Dépendance à la qualité et au volume des données", description: "Un modèle de deep learning nécessite généralement bien plus de données étiquetées qu'un modèle de machine learning classique pour atteindre une performance comparable." },
]} />

<CehCallout>
Ces limites ne disqualifient pas le deep learning en cybersécurité — elles imposent simplement de le traiter comme un outil d'aide à la décision parmi d'autres, combiné à une supervision humaine, des règles explicites et une surveillance continue, jamais comme une autorité de décision autonome et infaillible.
</CehCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Expliquer le principe d'une attaque adversariale", description: "Pourquoi une perturbation imperceptible pour un humain peut-elle suffire à tromper un modèle de deep learning avec une confiance élevée ?" },
  { title: "Synthétiser les limites du deep learning en sécurité", description: "Pour un SOC envisageant de déployer un modèle de deep learning pour la détection d'intrusion, quelles précautions (rappel de ce chapitre et du cours Analyse SOC) devraient encadrer son utilisation ?" },
]} />

## En résumé

- Déployer un modèle de deep learning reprend les principes du cours Machine Learning, avec des contraintes supplémentaires de taille, de coût de calcul et de latence.
- Les attaques adversariales exploitent les failles mathématiques d'un modèle par des perturbations souvent imperceptibles pour un humain.
- Opacité, vulnérabilité adversariale, dérive de concept et forte dépendance aux données sont les limites majeures à garder en tête avant d'intégrer le deep learning dans une chaîne de décision sécuritaire.

## Questions de Révision

1. Quelles contraintes supplémentaires, propres au deep learning, compliquent le déploiement d'un modèle par rapport au machine learning classique ?
2. Qu'est-ce qu'une attaque adversariale, et pourquoi peut-elle tromper un modèle avec une confiance élevée ?
3. Pourquoi un modèle de deep learning ne devrait-il jamais constituer une autorité de décision autonome en cybersécurité ?

Félicitations, tu viens de terminer le cours **Deep Learning** — et avec lui, l'ensemble du parcours Machine Learning et Deep Learning de Nyx ! Des perceptrons aux Transformers, en passant par les CNN et les RNN/LSTM, tu disposes désormais d'une compréhension à la fois mathématique et critique de ces technologies, indispensable pour les utiliser judicieusement — et pour en reconnaître les limites — dans un contexte de cybersécurité.
