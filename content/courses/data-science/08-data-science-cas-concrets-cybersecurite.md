---
title: Data science appliquée à la cybersécurité — cas concrets
chapter: 8
course: data-science
difficulty: advanced
duration: 40
tags: [data-science, cybersecurite, cas-usage]
ceh_modules: ["Module 20 - Cryptography"]
objectives:
  - Étudier des cas concrets d'application de la data science en sécurité
  - Comprendre les caractéristiques utilisées pour chaque cas
  - Identifier les défis spécifiques de chaque application
---

## Introduction

Ce chapitre réunit les notions des sept chapitres précédents autour de trois cas d'usage concrets et largement déployés en entreprise : la détection de phishing, la détection d'intrusion réseau, et la détection de fraude. Chacun illustre un défi méthodologique différent.

## Cas 1 — Détection de phishing par email

<Steps steps={[
  { title: "Caractéristiques extraites", description: "Présence de liens raccourcis, urgence du langage employé, domaine de l'expéditeur, présence de pièces jointes exécutables, fautes d'orthographe." },
  { title: "Type de modèle", description: "Classification supervisée (chapitre 5) — phishing ou légitime — entraînée sur des milliers d'emails déjà étiquetés." },
  { title: "Défi principal", description: "Les techniques de phishing évoluent constamment ; un modèle entraîné sur des données anciennes se dégrade progressivement (dérive de concept), nécessitant un réentraînement régulier." },
]} />

<CehCallout>
Le langage employé dans un email de phishing peut être analysé via des techniques de traitement automatique du langage (NLP), transformant le texte en vecteurs (rappel du cours Algèbre Linéaire, chapitre 1) exploitables par un modèle de classification.
</CehCallout>

## Cas 2 — Détection d'intrusion réseau

<Steps steps={[
  { title: "Caractéristiques extraites", description: "Volume de données transférées, durée de connexion, ports utilisés, fréquence des requêtes, entropie du trafic (rappel du cours Mathématiques Appliquées, chapitre 5)." },
  { title: "Type de modèle", description: "Souvent une combinaison de supervisé (attaques connues) et non supervisé (chapitre 6, pour les anomalies inédites)." },
  { title: "Défi principal", description: "Un très fort déséquilibre entre trafic normal et attaques réelles (chapitre 7) rend l'accuracy inutile comme métrique d'évaluation." },
]} />

<WarningCallout>
Un système de détection d'intrusion basé uniquement sur des règles statiques passe à côté des attaques nouvelles ; un système basé uniquement sur le ML peut générer un volume de faux positifs ingérable sans réglage soigneux — les déploiements réels combinent généralement les deux approches, avec une supervision humaine (cours Analyse SOC) pour trier les alertes.
</WarningCallout>

## Cas 3 — Détection de fraude financière

<Steps steps={[
  { title: "Caractéristiques extraites", description: "Montant de la transaction, localisation géographique, heure, historique récent du compte, écart par rapport au comportement habituel de l'utilisateur." },
  { title: "Type de modèle", description: "Souvent des modèles capables de traiter des flux en temps réel, la décision devant être prise en quelques millisecondes lors du passage de la carte." },
  { title: "Défi principal", description: "Les fraudeurs adaptent activement leurs techniques pour contourner les modèles connus — un défi qualifié d'adversarial, où l'attaquant cherche explicitement à tromper le modèle." },
]} />

<CehCallout>
Le défi "adversarial" de la détection de fraude rejoint une préoccupation centrale de l'IA appliquée à la sécurité : un attaquant qui connaît (ou devine) le fonctionnement d'un modèle de détection peut délibérément construire des exemples conçus pour le tromper — un sujet approfondi au cours IA & Agents en Cybersécurité.
</CehCallout>

## Un fil conducteur commun aux trois cas

<CompareTable
  titleA="Étape du cycle de vie (chapitre 1)"
  titleB="Application commune aux trois cas"
  rows={[
    { a: "Collecte et nettoyage (ch.2)", b: "Données souvent bruitées, incomplètes, nécessitant un nettoyage rigoureux" },
    { a: "Exploration (ch.3)", b: "Visualiser les distributions pour repérer les motifs distinctifs de la fraude/l'intrusion/le phishing" },
    { a: "Modélisation (ch.5-6)", b: "Combinaison fréquente de supervisé (menaces connues) et non supervisé (menaces inédites)" },
    { a: "Évaluation (ch.7)", b: "Précision/rappel plutôt qu'accuracy, du fait du fort déséquilibre des classes" },
]}
/>

## Lab — Mise en Pratique

**Environnement** : Python 3 (terminal Nyx Shell ou environnement local avec `pandas`/`numpy`/`matplotlib` installés)

<Steps steps={[
  { title: "Construire un tableau de caractéristiques d'emails", description: "Reprends les caractéristiques du cas 1 (lien raccourci, langage urgent, pièce jointe exécutable) sous forme de DataFrame étiqueté.", code: 'import pandas as pd\n\nemails = pd.DataFrame({\n    "lien_raccourci": [1, 0, 1, 0],\n    "langage_urgent": [1, 0, 1, 0],\n    "piece_jointe_exe": [1, 0, 0, 0],\n    "label": ["phishing", "legitime", "phishing", "legitime"]\n})\nprint(emails)' },
  { title: "Calculer un score de risque simple", description: "Combine ces caractéristiques en un score de risque basique, la même logique qu'un modèle de classification supervisée simplifié.", code: 'emails["score_risque"] = emails[["lien_raccourci", "langage_urgent", "piece_jointe_exe"]].sum(axis=1)\nprint(emails[["score_risque", "label"]])' },
  { title: "Calculer l'entropie du trafic pour la détection d'intrusion", description: "Reprends la caractéristique d'entropie du trafic mentionnée au cas 2 et calcule-la sur une distribution de ports observés.", code: 'import numpy as np\n\nports = pd.Series([80, 80, 443, 443, 443, 22, 8080, 8080, 8080, 8080])\nprobabilites = ports.value_counts(normalize=True)\nentropie = -np.sum(probabilites * np.log2(probabilites))\nprint("Entropie du trafic (ports) :", round(entropie, 3))' },
  { title: "Proposer des caractéristiques et identifier le défi adversarial", description: "En t'inspirant du tableau de caractéristiques ci-dessus, propose 4 caractéristiques pertinentes à extraire des données de connexion pour détecter un compte utilisateur compromis. En quoi la détection de fraude financière diffère-t-elle par ailleurs de la plupart des problèmes de classification classiques, du fait du comportement actif des fraudeurs ?" },
]} />

## En résumé

- La détection de phishing, d'intrusion réseau et de fraude illustrent chacune un défi méthodologique distinct : dérive de concept, déséquilibre extrême des classes, et comportement adversarial actif.
- Les déploiements réels combinent souvent supervisé et non supervisé, avec une supervision humaine pour trier les alertes.
- Le déséquilibre des classes, quasi systématique en sécurité, impose l'usage de métriques comme la précision et le rappel plutôt que l'accuracy seule.

## Questions de Révision

1. Pourquoi un modèle de détection de phishing nécessite-t-il un réentraînement régulier ?
2. Pourquoi combine-t-on souvent supervisé et non supervisé pour la détection d'intrusion réseau ?
3. Qu'est-ce qui rend la détection de fraude financière particulièrement "adversariale" par rapport à d'autres problèmes de classification ?
