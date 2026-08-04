---
title: Observabilité — logs, métriques et alerting
chapter: 7
course: devops
difficulty: intermediate
duration: 45
tags: [devops, observabilite, prometheus, grafana, elk, sre]
ceh_modules: []
objectives:
  - Distinguer les trois piliers de l'observabilité (logs, métriques, traces) et comprendre en quoi elle diffère du monitoring traditionnel
  - Comprendre le modèle pull de Prometheus et écrire une requête PromQL simple
  - Construire un dashboard Grafana et centraliser des logs avec la stack ELK/EFK
  - Définir un SLO chiffré avec son error budget et calibrer un alerting qui évite l'alert fatigue
---

## Introduction

Un système en production ne se contente pas de fonctionner ou de tomber en panne : il traverse un continuum d'états dégradés, souvent invisibles tant qu'on ne les mesure pas. Le monitoring traditionnel répond à des questions qu'on a pensé à poser à l'avance ("le CPU dépasse-t-il 90 % ?"), via des seuils fixes sur des métriques connues. L'observabilité va plus loin : elle vise à pouvoir répondre à des questions qu'on n'avait **pas** anticipées ("pourquoi la latence a-t-elle doublé pour les utilisateurs du Brésil entre 14h02 et 14h07 ?"), en s'appuyant sur des données riches et corrélables.

Ce chapitre présente les trois piliers classiques de l'observabilité — logs, métriques et traces — puis les deux outils qui dominent l'écosystème DevOps moderne : Prometheus pour la collecte de métriques et Grafana pour leur visualisation, complétés par une stack ELK/EFK pour la centralisation des logs. Il introduit ensuite le vocabulaire SRE (Site Reliability Engineering) — SLI, SLO, error budget — qui permet de transformer une intuition ("ça doit être fiable") en objectif mesurable et négociable. Enfin, il aborde un piège fréquent des équipes qui débutent en observabilité : une alerting mal calibré, qui noie les signaux utiles sous un bruit permanent.

Ces compétences sont transversales : une architecture observable est aussi une architecture plus facile à sécuriser, puisque les mêmes logs et métriques servent de matière première à la détection d'incidents, comme tu le verras en résonance avec le cours SOC Analysis.

## Les trois piliers de l'observabilité

<CompareTable
  titleA="Pilier"
  titleB="Ce qu'il répond"
  rows={[
    { a: "Logs", b: "Que s'est-il passé, précisément, à un instant donné ? (événements discrets, souvent horodatés et structurés en JSON)" },
    { a: "Métriques", b: "Quelle est la tendance dans le temps ? (séries temporelles agrégées : latence moyenne, taux d'erreur, nombre de requêtes/seconde)" },
    { a: "Traces", b: "Par où une requête est-elle passée, et où a-t-elle perdu du temps ? (suivi de bout en bout à travers plusieurs microservices)" },
  ]}
/>

Le monitoring traditionnel se limite le plus souvent à quelques métriques système (CPU, RAM, disque) surveillées via des seuils statiques : utile pour détecter une panne connue, mais aveugle face à un problème émergent et jamais vu auparavant — typiquement une régression de performance causée par l'interaction entre deux services dans une architecture distribuée. L'observabilité part du principe qu'on ne peut pas prévoir toutes les questions à l'avance : elle capitalise sur des données suffisamment granulaires et corrélées (logs structurés, métriques finement labellisées, traces distribuées) pour permettre l'exploration ad hoc au moment de l'incident, plutôt que de se limiter à des dashboards figés.

<TipCallout>
Une bonne heuristique : le monitoring te dit **que** quelque chose ne va pas ; l'observabilité t'aide à comprendre **pourquoi**, sans avoir eu besoin d'anticiper la panne exacte au moment de l'instrumentation.
</TipCallout>

## Prometheus — collecte de métriques en mode pull

Contrairement à beaucoup d'outils de monitoring qui reçoivent passivement des métriques poussées par les applications (modèle push), Prometheus fonctionne en **pull** : il interroge lui-même, à intervalle régulier (le *scrape interval*, souvent 15s ou 30s), un endpoint HTTP `/metrics` exposé par chaque application ou *exporter*.

```yaml
# prometheus.yml — configuration minimale
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'api-backend'
    static_configs:
      - targets: ['api-backend:8080']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
```

Chaque métrique exposée suit un format texte simple, avec un nom, des labels (paires clé-valeur qui permettent le filtrage) et une valeur :

```text
http_requests_total{method="GET", status="200", route="/api/courses"} 15234
http_requests_total{method="GET", status="500", route="/api/courses"} 12
```

PromQL, le langage de requête de Prometheus, permet d'agréger et de transformer ces séries temporelles :

```promql
# Taux d'erreurs HTTP 5xx par seconde, moyenné sur les 5 dernières minutes
sum(rate(http_requests_total{status=~"5.."}[5m])) by (route)
```

Cette requête calcule, pour chaque route, le taux de requêtes en erreur serveur par seconde — la fonction `rate()` gère automatiquement les compteurs qui redémarrent (ex: après un redéploiement), ce qu'un simple calcul de différence ne ferait pas correctement.

<CehCallout>
Un endpoint `/metrics` mal protégé (accessible sans authentification depuis l'extérieur) peut fuiter des informations sensibles sur l'architecture interne — noms de routes, volumes de trafic par client, versions de dépendances. Il doit être restreint au réseau interne ou au scraper Prometheus uniquement.
</CehCallout>

## Grafana — visualiser et corréler

Grafana se branche sur Prometheus (et sur de nombreuses autres sources : Elasticsearch, Loki, InfluxDB) pour construire des dashboards. Sa valeur ajoutée n'est pas seulement esthétique : elle permet de corréler visuellement plusieurs métriques sur une même timeline pendant un incident (latence, taux d'erreur, nombre de pods actifs), et de définir des *alert rules* directement sur les panels.

```json
{
  "panel": "Taux d'erreur 5xx",
  "query": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) by (route)",
  "alert": {
    "condition": "avg() OF query(A, 5m, now) IS ABOVE 0.05",
    "for": "10m"
  }
}
```

<TipCallout>
Un dashboard Grafana efficace suit la règle des trois niveaux : une vue "santé globale" (SLO, taux d'erreur global), une vue "par service" pour localiser le problème, et une vue "détail" (logs, traces) pour l'investigation fine — évite de tout entasser sur un seul écran.
</TipCallout>

## Centraliser les logs avec ELK/EFK

Les logs, produits en continu par des dizaines de conteneurs éphémères, doivent être centralisés pour rester exploitables. La stack ELK (Elasticsearch, Logstash, Kibana) — ou sa variante EFK (avec Fluentd/Fluent Bit à la place de Logstash, plus légère en environnement Kubernetes) — répond à ce besoin :

<Steps steps={[
  { title: "Collecte", description: "Fluent Bit (ou Filebeat) tourne en agent sur chaque nœud et lit les fichiers de logs des conteneurs.", code: "" },
  { title: "Transport et transformation", description: "Les logs bruts sont parsés en JSON structuré (extraction du niveau, du service, du trace ID) et envoyés vers Elasticsearch.", code: "" },
  { title: "Indexation", description: "Elasticsearch indexe les logs pour permettre une recherche full-text rapide, même sur des volumes de plusieurs To.", code: "" },
  { title: "Visualisation", description: "Kibana permet de rechercher, filtrer et construire des dashboards de logs, souvent en complément de Grafana pour les métriques.", code: "" },
]} />

```json
// Exemple de log structuré (bien préférable aux logs texte brut)
{
  "timestamp": "2026-08-04T09:12:31Z",
  "level": "error",
  "service": "api-backend",
  "trace_id": "a3f9c1e2",
  "message": "Database connection timeout",
  "route": "/api/courses"
}
```

<WarningCallout>
Logger des informations sensibles (mots de passe, tokens, données personnelles) en clair dans une stack centralisée transforme ton système de logs en cible de choix : il concentre en un seul endroit ce qu'un attaquant chercherait autrement dans plusieurs bases. Toujours masquer (`***`) ou hacher ces champs avant l'indexation.
</WarningCallout>

## SLI, SLO et error budget

Une fois les données collectées, encore faut-il définir ce que "fiable" signifie concrètement. C'est le rôle du triptyque SRE :

- **SLI** (Service Level Indicator) : une mesure concrète, ex. le pourcentage de requêtes HTTP réussies (`status < 500`).
- **SLO** (Service Level Objective) : un objectif chiffré sur ce SLI, ex. "99.9 % de disponibilité sur 30 jours".
- **Error budget** : la marge d'erreur tolérée par le SLO — ce qu'il te reste "le droit" de casser.

```text
SLO de disponibilité : 99.9 % sur 30 jours (43 200 minutes)

Error budget = 100% - 99.9% = 0.1%
            = 0.001 × 43 200 minutes
            = 43,2 minutes d'indisponibilité tolérée sur le mois
```

Si une panne de 20 minutes survient en semaine 1, il reste 23,2 minutes d'error budget pour le reste du mois : ce chiffre objective la conversation entre équipes produit (qui veulent livrer vite) et équipes ops (qui veulent la stabilité), sans dépendre du ressenti de chacun.

<AuditCallout>
Un SLO n'a de sens que s'il est mesuré automatiquement via les métriques Prometheus (ex: `sum(rate(http_requests_total{status!~"5.."}[30d])) / sum(rate(http_requests_total[30d]))`) et revu périodiquement — un SLO jamais consulté est un SLO mort.
</AuditCallout>

## Calibrer l'alerting : éviter l'alert fatigue

Une alerte doit toujours être **actionnable** : si elle ne déclenche aucune action possible côté humain, elle ne devrait pas exister en tant que page (elle peut rester un simple indicateur sur un dashboard). Un service qui envoie 200 notifications par jour, dont 195 sans conséquence réelle, produit de l'*alert fatigue* : les opérateurs finissent par ignorer ou couper les notifications, y compris la 200ᵉ qui, elle, annonçait un incident critique. C'est exactement le même phénomène observé côté SOC (cours SOC Analysis) avec la saturation d'alertes de sécurité peu pertinentes, qui masque les véritables intrusions.

<AttackDefenseTable rows={[
  { phase: "Symptôme", attack: "Alertes basées sur des seuils bruts et instantanés (ex: CPU > 80% pendant 1 seconde)", defense: "Alerter sur des tendances soutenues (`for: 10m`) et sur l'impact utilisateur (taux d'erreur, latence perçue), pas sur des métriques internes volatiles" },
  { phase: "Volume", attack: "Une alerte par métrique et par instance, sans agrégation", defense: "Grouper les alertes par service et par cause probable (regroupement Alertmanager), avec une seule notification consolidée" },
  { phase: "Priorisation", attack: "Toutes les alertes ont la même sévérité et le même canal de notification", defense: "Distinguer page (réveille quelqu'un la nuit, lié à l'error budget) et notification (email/ticket, non urgent)" },
]} />

<WarningCallout>
Une alerte qui se déclenche systématiquement et qu'on désactive "temporairement" reste désactivée des mois plus tard, dans neuf cas sur dix — traite chaque alerte bruyante comme un bug à corriger (ajuster le seuil, la durée, ou la métrique) plutôt qu'un signal à faire taire.
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : conteneurs Docker (Prometheus, Grafana, un exporter d'exemple) — terminal Nyx Shell

<Steps steps={[
  { title: "Démarrer la stack d'observabilité", description: "Lance Prometheus et Grafana via Docker Compose.", code: "docker compose up -d prometheus grafana node-exporter" },
  { title: "Vérifier la collecte de métriques", description: "Consulte les cibles scrapées par Prometheus pour confirmer qu'elles sont UP.", code: "curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[].health'" },
  { title: "Exécuter une requête PromQL", description: "Interroge le taux d'utilisation CPU moyen sur 5 minutes directement via l'API.", code: "curl -s 'http://localhost:9090/api/v1/query?query=rate(node_cpu_seconds_total{mode=\"idle\"}[5m])'" },
  { title: "Construire un dashboard Grafana", description: "Connecte-toi à Grafana (localhost:3000), ajoute Prometheus comme source de données, puis crée un panel affichant le taux d'erreurs 5xx.", code: "" },
  { title: "Calculer un error budget", description: "En te basant sur un SLO de disponibilité de 99.9% sur 30 jours, calcule combien de minutes d'indisponibilité restent tolérées si le service a déjà subi une panne de 15 minutes ce mois-ci.", code: "" },
]} />

## En résumé

- Les trois piliers de l'observabilité — logs, métriques, traces — permettent de répondre à des questions imprévues, contrairement au monitoring traditionnel basé sur des seuils fixes connus à l'avance.
- Prometheus collecte des métriques en mode **pull** via un endpoint `/metrics`, interrogé à intervalle régulier ; PromQL permet d'agréger ces séries temporelles (ex: `rate()`, `sum() by()`).
- Grafana visualise ces métriques en dashboards corrélés et permet de définir des règles d'alerte directement sur les panels.
- La stack ELK/EFK centralise les logs structurés (JSON) de tous les conteneurs pour une recherche full-text rapide, à protéger des données sensibles en clair.
- Un SLO chiffré (ex: 99.9 % de disponibilité) définit un error budget concret — ex. 43,2 minutes tolérées sur 30 jours — qui objective les décisions entre vitesse de livraison et fiabilité.
- Un alerting bien calibré n'alerte que sur des signaux actionnables et soutenus dans le temps ; sinon, l'alert fatigue fait ignorer l'alerte qui comptait vraiment — un risque partagé avec la saturation d'alertes en SOC.

## Questions de Révision

1. En quoi l'observabilité diffère-t-elle du monitoring traditionnel basé sur des seuils fixes ?
2. Pourquoi Prometheus utilise-t-il un modèle pull plutôt qu'un modèle push, et quel est le rôle du `scrape_interval` ?
3. Que calcule la requête PromQL `sum(rate(http_requests_total{status=~"5.."}[5m])) by (route)` ?
4. Pour un SLO de disponibilité de 99.95 % sur 30 jours, combien de minutes d'indisponibilité l'error budget tolère-t-il ?
5. Pourquoi logger des tokens ou mots de passe en clair dans une stack ELK/EFK est-il particulièrement risqué ?
6. Quelles sont deux techniques concrètes pour réduire l'alert fatigue sans perdre en capacité de détection ?
