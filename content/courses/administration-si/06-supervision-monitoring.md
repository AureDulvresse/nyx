---
title: Supervision et monitoring
chapter: 6
course: administration-si
difficulty: intermediate
duration: 35
tags: [sysadmin, supervision, monitoring, alerting]
ceh_modules: ["Module 6 - System Hacking"]
objectives:
  - Distinguer métriques, logs et traces dans une stratégie de supervision
  - Concevoir des seuils d'alerte pertinents, sans saturer les équipes
  - Comprendre le lien entre supervision infrastructure et détection SOC
---

## Introduction

"On ne corrige que ce que l'on détecte" — la supervision est ce qui transforme un incident silencieux (un disque qui se remplit lentement, un service qui répond de plus en plus lentement) en un signal actionnable avant qu'il ne devienne une panne visible des utilisateurs. Ce chapitre couvre les fondamentaux de la supervision côté infrastructure, en lien direct avec le travail d'un analyste SOC (cours Analyse SOC).

## Trois piliers de l'observabilité

<CompareTable
  titleA="Pilier"
  titleB="Ce qu'il apporte"
  rows={[
    { a: "Métriques", b: "Valeurs numériques dans le temps (CPU, mémoire, latence) — pour détecter des tendances et déclencher des alertes sur seuil" },
    { a: "Logs", b: "Événements textuels détaillés — pour comprendre PRÉCISÉMENT ce qui s'est passé une fois l'alerte déclenchée" },
    { a: "Traces", b: "Suivi d'une requête à travers plusieurs services — indispensable en architecture microservices pour localiser un ralentissement" },
]}
/>

<TipCallout>
Les métriques répondent à "quelque chose ne va pas", les logs répondent à "pourquoi" — une bonne stratégie de supervision a besoin des deux, pas de l'un sans l'autre : des métriques sans logs détaillés ralentissent le diagnostic, des logs sans métriques ratent les tendances qui précèdent une panne.
</TipCallout>

## Concevoir des seuils d'alerte pertinents

<WarningCallout>
Une supervision qui déclenche des dizaines d'alertes non critiques chaque jour conduit inévitablement à la "fatigue d'alerte" (alert fatigue) : les équipes finissent par ignorer les notifications, y compris celles qui signalent un incident réel — c'est un des facteurs les plus documentés derrière les incidents de sécurité manqués malgré une alerte existante.
</WarningCallout>

<Steps steps={[
  { title: "Alerter sur des seuils actionnables", description: "Un seuil qui ne déclenche aucune action possible côté équipe (ex: 'CPU à 60%' sur un serveur stable) n'a pas sa place en alerte — au mieux en tableau de bord de suivi." },
  { title: "Distinguer criticité et urgence", description: "Un disque à 90% de remplissage est important mais rarement urgent (heures pour agir) ; un service down est urgent (minutes pour agir) — les canaux de notification doivent refléter cette différence." },
  { title: "Prévoir des seuils progressifs", description: "Un avertissement à 80% de remplissage disque, une alerte critique à 95% — plutôt qu'un seul seuil brutal qui laisse peu de marge d'action." },
  { title: "Réviser régulièrement les seuils", description: "Un seuil pertinent il y a un an peut devenir obsolète après une montée en charge du service — la supervision elle-même doit être maintenue." },
]} />

## Supervision infrastructure et détection SOC — un continuum

<CehCallout>
Un pic anormal de CPU sur un serveur, remonté d'abord comme un simple problème de performance à l'équipe infrastructure, peut en réalité être le symptôme d'un cryptominer déployé par un attaquant — la frontière entre supervision "exploitation" et détection "sécurité" est poreuse, et une bonne coordination entre les deux équipes accélère considérablement la détection d'incidents.
</CehCallout>

<CompareTable
  titleA="Supervision infrastructure classique"
  titleB="Détection SOC (SIEM)"
  rows={[
    { a: "Disponibilité, performance, capacité", b: "Comportements anormaux, tentatives d'intrusion, corrélation d'événements" },
    { a: "Souvent opérée par l'équipe infrastructure/DevOps", b: "Opérée par l'équipe SOC (cours Analyse SOC)" },
    { a: "Ex : Prometheus, Grafana, Zabbix", b: "Ex : Splunk, Elastic Security, Microsoft Sentinel" },
]}
/>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Concevoir des seuils progressifs", description: "Pour un serveur dont l'espace disque se remplit, propose deux seuils (avertissement et critique) avec le canal de notification approprié pour chacun." },
  { title: "Relier supervision et sécurité", description: "Un pic de trafic réseau sortant inhabituel est détecté sur un serveur habituellement peu bavard. Explique pourquoi ce signal, remonté par la supervision infrastructure, mérite d'être également transmis à l'équipe SOC." },
]} />

## En résumé

- Métriques, logs et traces forment les trois piliers complémentaires de l'observabilité d'un système.
- Des seuils d'alerte mal calibrés provoquent une fatigue d'alerte qui fait manquer les incidents réels, y compris de sécurité.
- La frontière entre supervision infrastructure et détection SOC est poreuse — une bonne coordination entre les deux équipes accélère la détection d'incidents.

## Questions de Révision

1. Quelle est la différence de rôle entre métriques et logs dans une stratégie de supervision ?
2. Qu'est-ce que la "fatigue d'alerte" et pourquoi est-elle dangereuse du point de vue sécurité ?
3. Donne un exemple de signal remonté par la supervision infrastructure qui pourrait en réalité indiquer un incident de sécurité.
