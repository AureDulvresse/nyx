---
title: Agents IA pour l'automatisation SOC
chapter: 5
course: ia-cybersecurity
difficulty: advanced
duration: 40
tags: [ia, agents, soc, automatisation]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Comprendre où les agents IA apportent le plus de valeur dans un SOC
  - Comprendre le principe du triage assisté par IA
  - Comprendre les limites et garde-fous nécessaires
---

## Introduction

Ce chapitre applique les principes d'agents du chapitre précédent au contexte concret d'un SOC (Security Operations Center), en lien direct avec le cours Analyse SOC — le triage manuel d'alertes reste l'une des tâches les plus chronophages et répétitives d'un analyste, un candidat naturel à l'assistance par IA.

## Où les agents IA apportent le plus de valeur en SOC

<CompareTable
  titleA="Tâche SOC"
  titleB="Apport de l'agent IA"
  rows={[
    { a: "Triage initial d'alertes", b: "Résumer et prioriser automatiquement un grand volume d'alertes selon leur contexte" },
    { a: "Enrichissement de contexte", b: "Interroger automatiquement plusieurs sources (threat intel, historique utilisateur) sans action manuelle répétée" },
    { a: "Rédaction de rapports d'incident", b: "Générer un premier brouillon structuré à partir des logs et actions entreprises (lien avec le cours Rédaction de Rapports)" },
    { a: "Réponse à incident automatisée", b: "Exécuter des actions de confinement de premier niveau selon des règles strictes et validées" },
]}
/>

<CehCallout>
La priorisation automatique d'alertes par un agent IA ne remplace pas le jugement de l'analyste — elle réduit le temps passé à trier manuellement des centaines d'alertes à faible valeur, pour concentrer l'attention humaine sur les cas ambigus ou à fort enjeu, un principe similaire à l'automatisation des scripts vus au cours Linux pour la Cybersécurité.
</CehCallout>

## Le principe du triage assisté

```mermaid
graph TD
    A[Alerte brute] --> B[Agent : enrichissement automatique du contexte]
    B --> C[Agent : score de priorité + résumé]
    C --> D{Ambiguïté ou fort enjeu ?}
    D -->|Oui| E[Escalade vers analyste humain]
    D -->|Non, clairement bénin| F[Clôture automatique documentée]
```

<Steps steps={[
  { title: "Collecte automatique de contexte", description: "L'agent rassemble automatiquement les informations pertinentes (historique, géolocalisation, réputation IP) associées à l'alerte." },
  { title: "Résumé et score de priorité", description: "L'agent produit un résumé lisible et un score estimant l'urgence, à partir du contexte collecté." },
  { title: "Décision d'escalade", description: "Les cas clairement bénins peuvent être clôturés automatiquement (avec traçabilité) ; les cas ambigus sont transmis à un analyste humain avec le contexte déjà préparé." },
]} />

## Les garde-fous indispensables

<WarningCallout>
Un agent IA qui clôture automatiquement des alertes sans traçabilité claire ni possibilité d'audit a posteriori introduit un risque de sécurité en soi : une attaque réelle mal classée et clôturée silencieusement par l'agent peut passer complètement inaperçue, sans qu'aucun humain n'ait eu l'occasion de la repérer.
</WarningCallout>

<Steps steps={[
  { title: "Traçabilité complète", description: "Chaque décision de l'agent (clôture, escalade, action) doit être journalisée avec son raisonnement, consultable a posteriori." },
  { title: "Seuils de confiance conservateurs", description: "En cas de doute, l'agent doit systématiquement escalader vers un humain plutôt que de clôturer par excès de confiance." },
  { title: "Revue périodique des décisions automatisées", description: "Un échantillon des clôtures automatiques doit être régulièrement audité par un analyste pour détecter une dérive du comportement de l'agent." },
]} />

<CehCallout>
Ce principe de garde-fous rejoint directement le RGPD (cours Droit et Réglementation, chapitre 2) : une décision automatisée ayant un impact significatif (comme la clôture d'une alerte de sécurité potentiellement critique) doit rester encadrée, documentée et susceptible de révision humaine.
</CehCallout>

## Lab — Mise en Pratique

**Environnement** : Python 3 (terminal Nyx Shell ou environnement local avec `pandas`/`scikit-learn` installés)

<Steps steps={[
  { title: "Construire un tableau d'alertes avec contexte", description: "Rassemble quelques alertes avec leur réputation IP, leur historique et leur volume de données, comme le ferait l'étape de collecte de contexte de l'agent.", code: 'import pandas as pd\n\nalertes = pd.DataFrame({\n    "alerte_id": ["A1", "A2", "A3", "A4", "A5"],\n    "reputation_ip": [0.9, 0.1, 0.95, 0.05, 0.4],\n    "historique_normal": [False, True, False, True, True],\n    "volume_donnees_mo": [500, 2, 800, 1, 50]\n})\nprint(alertes)' },
  { title: "Calculer un score de priorité pondéré", description: "Combine les signaux disponibles en un score unique, comme le ferait l'étape de résumé et score de priorité de l'agent.", code: 'alertes["score_priorite"] = (\n    alertes["reputation_ip"] * 0.5\n    + (~alertes["historique_normal"]).astype(int) * 0.3\n    + (alertes["volume_donnees_mo"] > 100).astype(int) * 0.2\n)\nprint(alertes[["alerte_id", "score_priorite"]])' },
  { title: "Appliquer la règle d'escalade et journaliser la décision", description: "Applique un seuil de confiance conservateur et trace chaque décision, pour garantir la traçabilité exigée par ce chapitre.", code: 'SEUIL_ESCALADE = 0.5\njournal = []\nfor _, alerte in alertes.iterrows():\n    if alerte["score_priorite"] >= SEUIL_ESCALADE:\n        decision = "escalade vers analyste humain"\n    else:\n        decision = "cloture automatique"\n    journal.append({"alerte_id": alerte["alerte_id"], "decision": decision, "score": alerte["score_priorite"]})\n\njournal_df = pd.DataFrame(journal)\nprint(journal_df)' },
  { title: "Auditer un échantillon des clôtures automatiques", description: "Applique le garde-fou de revue périodique : tire un échantillon des clôtures automatiques pour vérification humaine.", code: 'clotures_auto = journal_df[journal_df["decision"] == "cloture automatique"]\nechantillon_audit = clotures_auto.sample(n=min(2, len(clotures_auto)), random_state=1)\nprint("Echantillon a revoir manuellement:")\nprint(echantillon_audit)' },
]} />

## En résumé

- Les agents IA apportent le plus de valeur au SOC sur le triage initial, l'enrichissement de contexte et la rédaction de premiers brouillons de rapport.
- Un cycle de triage assisté combine collecte de contexte, résumé/score de priorité, et escalade sélective vers un analyste humain.
- Traçabilité complète, seuils de confiance conservateurs et audit périodique sont des garde-fous indispensables face à un agent capable de clôturer des alertes de façon autonome.

## Questions de Révision

1. Sur quelles tâches SOC concrètes un agent IA apporte-t-il le plus de valeur ?
2. Pourquoi la traçabilité complète des décisions d'un agent est-elle indispensable, pas seulement souhaitable ?
3. En quoi le principe de garde-fous d'un agent SOC rejoint-il une exigence du RGPD vue au cours Droit et Réglementation ?
