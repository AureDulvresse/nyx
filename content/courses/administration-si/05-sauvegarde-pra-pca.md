---
title: Sauvegarde, PRA et PCA
chapter: 5
course: administration-si
difficulty: intermediate
duration: 35
tags: [sysadmin, sauvegarde, pra, pca, resilience]
ceh_modules: ["Module 1 - Introduction to Ethical Hacking"]
objectives:
  - Appliquer la règle 3-2-1 de sauvegarde
  - Distinguer Plan de Reprise d'Activité (PRA) et Plan de Continuité d'Activité (PCA)
  - Calculer et interpréter le RTO et le RPO d'un système
---

## Introduction

Une sauvegarde qui n'a jamais été testée en restauration n'est pas une sauvegarde — c'est une hypothèse non vérifiée. Ce chapitre couvre les fondamentaux de la résilience : comment sauvegarder correctement, et comment planifier la reprise après un incident majeur (panne matérielle, ransomware, catastrophe).

## La règle 3-2-1

<Steps steps={[
  { title: "3 copies des données", description: "L'original plus au moins deux copies — jamais une seule copie de sauvegarde." },
  { title: "2 supports différents", description: "Ex : disque local ET stockage cloud/bande — pour éviter qu'une même panne matérielle ne détruise toutes les copies." },
  { title: "1 copie hors site (offsite)", description: "Au moins une copie physiquement éloignée, protégeant contre un sinistre local (incendie, inondation, vol)." },
]} />

<CehCallout>
Un ransomware moderne cible spécifiquement les sauvegardes accessibles depuis le réseau compromis avant même de chiffrer les données de production — une copie de sauvegarde immuable (write-once) ou physiquement déconnectée (air-gapped) est la seule protection réellement fiable contre ce scénario.
</CehCallout>

## Tester la restauration — l'étape la plus souvent négligée

<WarningCallout>
De nombreuses organisations découvrent qu'une sauvegarde est corrompue, incomplète ou inutilisable au moment précis où elles en ont besoin — pendant un incident réel. Un test de restauration régulier et documenté est aussi important que la sauvegarde elle-même, et doit être planifié comme n'importe quelle tâche de maintenance récurrente.
</WarningCallout>

## PRA vs PCA — deux plans complémentaires

<CompareTable
  titleA="PRA (Plan de Reprise d'Activité)"
  titleB="PCA (Plan de Continuité d'Activité)"
  rows={[
    { a: "Comment reconstruire l'infrastructure après un sinistre", b: "Comment l'activité métier continue PENDANT le sinistre" },
    { a: "Centré sur les systèmes informatiques", b: "Centré sur les processus métier (mode dégradé, procédures papier temporaires...)" },
    { a: "Ex : restaurer le serveur de facturation depuis une sauvegarde", b: "Ex : comment le service commercial continue à facturer sans accès au système habituel" },
]}
/>

<TipCallout>
Un PRA sans PCA laisse l'entreprise sans réponse à la question "que fait-on en attendant que le PRA soit exécuté ?" — les deux plans doivent être pensés ensemble, pas l'un en remplacement de l'autre.
</TipCallout>

## RTO et RPO — quantifier la résilience

<CompareTable
  titleA="Indicateur"
  titleB="Ce qu'il mesure"
  rows={[
    { a: "RTO (Recovery Time Objective)", b: "Durée maximale acceptable d'indisponibilité avant reprise du service" },
    { a: "RPO (Recovery Point Objective)", b: "Volume maximal de données qu'il est acceptable de perdre, exprimé en temps" },
]}
/>

```text
Exemple concret :

RTO = 4 heures  → le service de facturation doit être de nouveau disponible
                   au maximum 4 heures après le début de l'incident.

RPO = 1 heure   → au pire, l'entreprise accepte de perdre les données
                   de la dernière heure précédant l'incident (donc des
                   sauvegardes au moins toutes les heures sont nécessaires).
```

<CehCallout>
Un RPO de 1 heure impose une fréquence de sauvegarde d'au moins une fois par heure pour le système concerné — c'est le RPO cible qui détermine la fréquence de sauvegarde à mettre en œuvre, pas l'inverse.
</CehCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Appliquer la règle 3-2-1", description: "Une entreprise sauvegarde ses données chaque nuit sur un second disque dans la même salle serveur. Quel(s) élément(s) de la règle 3-2-1 manque(nt), et quel risque concret cela laisse-t-il ouvert ?" },
  { title: "Calculer un RPO nécessaire", description: "Une base de données e-commerce ne doit jamais perdre plus de 15 minutes de commandes en cas d'incident. Quel RPO cela impose-t-il, et quelle fréquence de sauvegarde minimale en découle ?" },
]} />

## En résumé

- La règle 3-2-1 (3 copies, 2 supports, 1 hors site) reste la base d'une stratégie de sauvegarde solide.
- Une sauvegarde jamais testée en restauration n'offre aucune garantie réelle.
- Le PRA (reconstruire l'IT) et le PCA (continuer l'activité métier) sont deux plans complémentaires, à concevoir ensemble.
- Le RPO cible détermine la fréquence de sauvegarde nécessaire ; le RTO cible détermine la rapidité de reprise à préparer.

## Questions de Révision

1. Pourquoi une sauvegarde immuable ou air-gapped est-elle la seule protection réellement fiable contre un ransomware moderne ?
2. Quelle est la différence fondamentale entre un PRA et un PCA ?
3. Si le RPO cible d'un système est de 30 minutes, quelle fréquence de sauvegarde minimale cela impose-t-il ?
