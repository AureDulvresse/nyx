---
title: Supervision et monitoring
chapter: 6
course: administration-si
difficulty: intermediate
duration: 50
tags: [sysadmin, supervision, monitoring, observabilite, siem]
ceh_modules: ["Module 6 - System Hacking"]
objectives:
  - Distinguer métriques, logs et traces dans une stratégie d'observabilité
  - Concevoir des seuils d'alerte pertinents sans saturer les équipes
  - Comprendre le lien entre supervision infrastructure et détection SOC
  - Centraliser les journaux et les corréler pour détecter un incident
---

## Introduction

« On ne corrige que ce que l'on détecte. » La supervision est ce qui transforme un incident silencieux, comme un disque qui se remplit lentement ou un service qui répond de plus en plus mollement, en un signal actionnable avant qu'il ne devienne une panne visible des utilisateurs. Sans supervision, on administre à l'aveugle et on ne découvre les problèmes qu'au moment où ils deviennent critiques.

Ce chapitre couvre les fondamentaux de l'observabilité côté infrastructure, en lien direct avec le travail d'un analyste SOC abordé dans le cours Analyse SOC. À la fin, tu sauras distinguer les trois piliers de l'observabilité, calibrer des seuils d'alerte sans provoquer la fatigue des équipes, et comprendre pourquoi un signal de supervision peut être le premier indice d'une attaque.

## Les trois piliers de l'observabilité

L'observabilité, c'est la capacité à comprendre ce qui se passe à l'intérieur d'un système à partir de ce qu'il émet vers l'extérieur. Elle repose sur trois types de données complémentaires.

<CompareTable
  titleA="Pilier"
  titleB="Ce qu'il apporte"
  rows={[
    { a: "Métriques", b: "Valeurs numériques dans le temps (CPU, mémoire, latence), pour détecter des tendances et déclencher des alertes sur seuil" },
    { a: "Logs", b: "Événements textuels détaillés, pour comprendre précisément ce qui s'est passé une fois l'alerte déclenchée" },
    { a: "Traces", b: "Suivi d'une même requête à travers plusieurs services, indispensable en architecture microservices pour localiser un ralentissement" },
]}
/>

<TipCallout>
Les métriques répondent à la question « quelque chose ne va pas ? », les logs répondent à « pourquoi ? ». Une bonne stratégie de supervision a besoin des deux, pas de l'un sans l'autre : des métriques sans logs détaillés ralentissent le diagnostic, et des logs sans métriques ratent les tendances qui précèdent une panne. Les traces, elles, répondent à « où, dans la chaîne de services ? ».
</TipCallout>

Les traces méritent une précision, car elles sont le pilier le moins intuitif. Dans une application découpée en microservices, une seule action utilisateur peut traverser dix services différents. Une trace relie tous les maillons de ce parcours avec un identifiant commun, ce qui permet de voir lequel a introduit le ralentissement. Sans trace, on ne verrait qu'une lenteur globale, sans savoir d'où elle vient.

## L'outillage de la supervision

Les trois piliers s'appuient sur des familles d'outils bien établies. Pour les métriques, Prometheus collecte et stocke les séries temporelles, et Grafana les affiche dans des tableaux de bord. Zabbix est une solution historique couvrant métriques et alertes. Pour les logs, la pile Elastic (Elasticsearch, Logstash, Kibana) ou Loki centralisent et indexent les journaux. Pour les traces, des outils comme Jaeger ou Tempo, souvent alimentés par le standard OpenTelemetry, reconstituent les parcours de requêtes.

```text
Flux de supervision typique :

  Serveurs ─┬─► métriques ─► Prometheus ─► Grafana (tableaux de bord)
            ├─► logs ──────► Loki / Elastic ─► Kibana (recherche)
            └─► traces ────► Tempo / Jaeger (parcours de requêtes)
                                   │
                                   └─► Alertmanager ─► notification
```

## Concevoir des seuils d'alerte pertinents

Une alerte n'a de valeur que si elle appelle une action. Le plus grand risque d'une supervision n'est pas d'alerter trop peu, mais d'alerter trop.

<WarningCallout>
Une supervision qui déclenche des dizaines d'alertes non critiques chaque jour conduit inévitablement à la fatigue d'alerte (alert fatigue) : les équipes finissent par ignorer les notifications, y compris celles qui signalent un incident réel. C'est l'un des facteurs les plus documentés derrière les incidents de sécurité manqués malgré une alerte existante. Trop d'alertes revient, en pratique, à ne plus en avoir aucune.
</WarningCallout>

<Steps steps={[
  { title: "Alerter sur des seuils actionnables", description: "Un seuil qui n'appelle aucune action possible, par exemple « CPU à 60 % » sur un serveur stable, n'a pas sa place en alerte : au mieux sur un tableau de bord de suivi." },
  { title: "Distinguer criticité et urgence", description: "Un disque à 90 % de remplissage est important mais rarement urgent (on a des heures pour agir) ; un service arrêté est urgent (on a des minutes) : les canaux de notification doivent refléter cette différence." },
  { title: "Prévoir des seuils progressifs", description: "Un avertissement à 80 % de remplissage disque, puis une alerte critique à 95 %, plutôt qu'un seuil unique et brutal qui laisse peu de marge d'action." },
  { title: "Réviser régulièrement les seuils", description: "Un seuil pertinent il y a un an peut devenir obsolète après une montée en charge : la supervision elle-même doit être maintenue." },
]} />

## Supervision infrastructure et détection SOC — un continuum

<CehCallout>
Un pic anormal de CPU sur un serveur, remonté d'abord comme un simple problème de performance à l'équipe infrastructure, peut en réalité être le symptôme d'un logiciel de minage de cryptomonnaie déployé par un attaquant. La frontière entre supervision d'exploitation et détection de sécurité est poreuse : un même signal technique peut relever de l'une ou de l'autre, et une bonne coordination entre les deux équipes accélère considérablement la détection d'incidents.
</CehCallout>

<CompareTable
  titleA="Supervision infrastructure classique"
  titleB="Détection SOC (SIEM)"
  rows={[
    { a: "Disponibilité, performance, capacité", b: "Comportements anormaux, tentatives d'intrusion, corrélation d'événements" },
    { a: "Souvent opérée par l'équipe infrastructure ou DevOps", b: "Opérée par l'équipe SOC (cours Analyse SOC)" },
    { a: "Exemples : Prometheus, Grafana, Zabbix", b: "Exemples : Splunk, Elastic Security, Microsoft Sentinel" },
]}
/>

Un SIEM (Security Information and Event Management) centralise les journaux de toute l'infrastructure et applique des règles de corrélation : il relie des événements isolés pour détecter un schéma d'attaque qu'aucun log pris seul ne révélerait. Par exemple, plusieurs échecs d'authentification suivis d'un succès, puis d'une connexion depuis une adresse inhabituelle, forment ensemble un signal fort.

<AttackDefenseTable rows={[
  { phase: "Reconnaissance", attack: "Balayage de ports, requêtes anormales", defense: "Corréler les pics de connexions refusées dans le SIEM" },
  { phase: "Persistance d'un mineur", attack: "Processus consommant durablement le CPU", defense: "Alerter sur une charge CPU soutenue inhabituelle et investiguer le processus" },
  { phase: "Exfiltration", attack: "Trafic sortant volumineux et inhabituel", defense: "Surveiller le volume de données sortant et alerter sur les écarts" },
]} />

## Centraliser les journaux

Des journaux éparpillés sur chaque machine sont inexploitables en cas d'incident, et un attaquant peut les effacer localement. La centralisation des logs, vers un serveur dédié ou un SIEM, répond à deux besoins : accélérer le diagnostic et préserver les preuves. Sous Linux, journald peut transférer ses journaux vers un collecteur distant ; les équipements réseau émettent en syslog.

<AuditCallout>
La centralisation et la protection des journaux correspondent au contrôle A.8.15 (journalisation) de la norme ISO/IEC 27001:2022, et la surveillance des activités au contrôle A.8.16. Le NIST CSF 2.0 place cette capacité dans sa fonction Detect. Des journaux centralisés et horodatés de façon fiable sont aussi indispensables à toute investigation post-incident, abordée dans le cours DFIR.
</AuditCallout>

## Erreurs fréquentes

On collecte des métriques sans jamais conserver les logs détaillés, et le diagnostic s'enlise faute de savoir pourquoi. On configure des dizaines d'alertes non actionnables, provoquant la fatigue d'alerte qui fait rater les vraies. On fixe un seuil unique et brutal au lieu de seuils progressifs. On laisse les journaux sur chaque machine, où ils sont peu exploitables et effaçables par un attaquant. Enfin, on cloisonne supervision et sécurité, si bien qu'un signal révélateur reste traité comme un simple souci de performance.

## Lab — Mise en pratique

**Environnement** : Réflexion guidée et observation sur le lab.

<Steps steps={[
  { title: "Classer des signaux par pilier", description: "Pour chacun des éléments suivants, indique s'il relève des métriques, des logs ou des traces : l'utilisation CPU, un message d'erreur d'authentification, le parcours d'une requête à travers trois microservices." },
  { title: "Concevoir des seuils progressifs", description: "Pour un serveur dont l'espace disque se remplit, propose deux seuils (avertissement et critique) avec le canal de notification approprié à chacun." },
  { title: "Rédiger une règle de corrélation", description: "Formule une règle SIEM qui combine plusieurs échecs d'authentification, un succès, puis une connexion depuis une adresse inhabituelle." },
  { title: "Relier supervision et sécurité", description: "Un pic de trafic réseau sortant inhabituel est détecté sur un serveur habituellement peu bavard. Explique pourquoi ce signal, remonté par la supervision infrastructure, mérite d'être transmis à l'équipe SOC." },
  { title: "Identifier une fatigue d'alerte", description: "Une équipe reçoit soixante alertes par jour et en ignore la plupart. Propose deux actions concrètes pour réduire le bruit sans perdre les signaux importants." },
  { title: "Justifier la centralisation", description: "Explique en deux phrases pourquoi centraliser les journaux améliore à la fois le diagnostic et la préservation des preuves." },
]} />

## À retenir

- Métriques, logs et traces forment les trois piliers complémentaires de l'observabilité d'un système.
- Les métriques répondent à « quelque chose ne va pas ? », les logs à « pourquoi ? », les traces à « où, dans la chaîne de services ? ».
- Les traces suivent une même requête à travers plusieurs services, ce qui est indispensable en architecture microservices.
- Des seuils d'alerte mal calibrés provoquent une fatigue d'alerte qui fait manquer les incidents réels, y compris de sécurité.
- La frontière entre supervision infrastructure et détection SOC est poreuse : un même signal peut révéler une attaque.
- Un SIEM (Splunk, Elastic Security, Microsoft Sentinel) centralise les journaux et les corrèle pour détecter des schémas d'attaque invisibles isolément.

## Questions de révision

1. Quelle est la différence de rôle entre métriques et logs dans une stratégie de supervision ?
2. Parmi les trois piliers de l'observabilité, lequel permet de suivre une requête à travers plusieurs services ?
3. À quelle question répondent les métriques, par opposition aux logs ?
4. Qu'est-ce que la fatigue d'alerte, et pourquoi est-elle dangereuse du point de vue sécurité ?
5. Pourquoi prévoir des seuils progressifs plutôt qu'un seuil unique pour un disque qui se remplit ?
6. Pourquoi la frontière entre supervision infrastructure et détection SOC est-elle qualifiée de poreuse ?
7. Parmi les outils cités, lesquels relèvent de la détection SOC (SIEM) plutôt que de la supervision infrastructure classique ?
8. Pourquoi centraliser les journaux plutôt que les laisser sur chaque machine ?
