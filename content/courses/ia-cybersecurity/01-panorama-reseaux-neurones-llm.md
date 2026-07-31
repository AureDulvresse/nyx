---
title: Des réseaux de neurones aux LLM — panorama
chapter: 1
course: ia-cybersecurity
difficulty: intermediate
duration: 35
tags: [ia, reseaux-de-neurones, llm]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Comprendre le principe général d'un réseau de neurones
  - Situer les grands modèles de langage (LLM) dans le paysage de l'IA
  - Comprendre pourquoi l'IA générative change concrètement le paysage de la cybersécurité
---

## Introduction

Ce cours prolonge le machine learning classique vu aux cours Data Science Complète et Python pour la Data Science vers des approches plus récentes — réseaux de neurones profonds et grands modèles de langage — avant d'aborder leur usage concret en défense (agents SOC) et les risques qu'ils introduisent côté offensif.

## Du modèle classique au réseau de neurones

<CehCallout>
Un réseau de neurones peut être vu comme un empilement de transformations linéaires (rappel du cours Algèbre Linéaire — chaque couche applique une multiplication matricielle) suivies de fonctions non linéaires, permettant d'apprendre des motifs bien plus complexes qu'un modèle classique comme un arbre de décision ou un k-NN.
</CehCallout>

```mermaid
graph LR
    A[Entrée - vecteur de caractéristiques] --> B[Couche cachée 1]
    B --> C[Couche cachée 2]
    C --> D[Sortie - prédiction]
```

<CompareTable
  titleA="Machine learning classique (cours Data Science Complète)"
  titleB="Deep learning (réseaux de neurones profonds)"
  rows={[
    { a: "Nécessite souvent une extraction manuelle de caractéristiques", b: "Peut apprendre directement des caractéristiques pertinentes à partir de données brutes" },
    { a: "Fonctionne bien avec des jeux de données de taille modeste", b: "Nécessite généralement de très grands volumes de données pour être performant" },
    { a: "Modèles souvent plus interprétables (arbre de décision)", b: "Modèles souvent peu interprétables ('boîte noire')" },
]}
/>

## Les grands modèles de langage (LLM)

<CehCallout>
Un LLM (Large Language Model) est un réseau de neurones entraîné sur d'immenses volumes de texte pour prédire la suite probable d'une séquence de mots — cette capacité de prédiction, à grande échelle, produit des comportements qui semblent relever de la compréhension et du raisonnement, sans que le modèle "comprenne" au sens humain du terme.
</CehCallout>

<Steps steps={[
  { title: "Pré-entraînement", description: "Le modèle apprend des motifs linguistiques généraux sur d'immenses corpus de texte, sans tâche spécifique en tête." },
  { title: "Alignement (fine-tuning)", description: "Le modèle est ensuite ajusté pour suivre des instructions et adopter un comportement utile et sûr." },
  { title: "Utilisation via prompt", description: "L'utilisateur interagit avec le modèle en langage naturel, sans avoir besoin de connaître son fonctionnement interne." },
]} />

## Pourquoi l'IA générative change le paysage de la cybersécurité

<CompareTable
  titleA="Usage défensif"
  titleB="Usage offensif ou risque"
  rows={[
    { a: "Résumer automatiquement des alertes SOC (chapitre 5)", b: "Générer des emails de phishing très convaincants et personnalisés à grande échelle" },
    { a: "Assister la rédaction de rapports (cours Rédaction de Rapports)", b: "Générer du code malveillant ou des variantes de malware" },
    { a: "Détecter des anomalies dans des logs textuels (chapitre 3)", b: "Automatiser la reconnaissance et l'exploitation de vulnérabilités" },
]}
/>

<WarningCallout>
La même capacité générative qui permet à un analyste de gagner un temps précieux en résumant des centaines d'alertes permet à un attaquant de générer, à un coût dérisoire, des milliers de variantes de messages de phishing convaincants — cette dualité fondamentale (dual-use) traverse l'ensemble de ce cours.
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Distinguer ML classique et deep learning", description: "Pourquoi un jeu de données de seulement quelques centaines d'exemples se prête-t-il mieux à un modèle du cours Data Science Complète (k-NN, arbre) qu'à un réseau de neurones profond ?" },
  { title: "Identifier un usage dual-use", description: "Propose un usage défensif et un usage offensif possibles d'un LLM capable de générer du texte convaincant en français." },
]} />

## En résumé

- Un réseau de neurones empile des transformations linéaires et non linéaires pour apprendre des motifs complexes, au prix d'une interprétabilité souvent réduite.
- Un LLM prédit la suite probable d'un texte à partir d'un immense volume d'entraînement, produisant des comportements qui semblent relever du raisonnement.
- L'IA générative est fondamentalement à double usage (dual-use) : les mêmes capacités servent aussi bien la défense que l'attaque.

## Questions de Révision

1. Quelle est la principale différence entre le machine learning classique et le deep learning en termes de volume de données nécessaire ?
2. Que signifie le "pré-entraînement" d'un LLM ?
3. Donne un exemple concret de capacité d'IA générative à double usage (défensif et offensif).
