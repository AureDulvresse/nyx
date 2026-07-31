---
title: Playbooks et réponse à incident (SOAR)
chapter: 6
course: soc-analysis
difficulty: intermediate
duration: 35
tags: [soc, playbook, soar, reponse-incident]
ceh_modules: ["Module 1 - Introduction to Ethical Hacking"]
objectives:
  - Comprendre le rôle d'un playbook de réponse à incident
  - Comprendre le principe du SOAR (orchestration et automatisation)
  - Distinguer ce qui doit rester manuel de ce qui peut être automatisé
---

## Introduction

Ce chapitre couvre la mise en pratique opérationnelle du runbook déjà présenté au cours Rédaction de Rapports (chapitre 4) — dans le contexte spécifique du SOC, on parle plus précisément de "playbook", souvent intégré à une plateforme SOAR.

## Le playbook — une procédure opérationnelle précise

<CehCallout>
Rappel du cours Rédaction de Rapports (chapitre 4) : un playbook est un document vivant, prescriptif, écrit AVANT la crise — contrairement au rapport rédigé après. Un bon playbook donne des instructions exactes ("exécuter cette commande précise", "vérifier ce champ spécifique"), jamais des instructions vagues comme "analyser la situation".
</CehCallout>

```text
Exemple d'extrait de playbook — Compte potentiellement compromis :

1. Vérifier l'historique de connexion des 90 derniers jours (requête SIEM : ...)
2. Si géolocalisation ou horaire inhabituel confirmé :
   a. Désactiver le compte immédiatement (commande : ...)
   b. Révoquer toutes les sessions actives (commande : ...)
   c. Notifier le titulaire du compte via le canal secondaire (téléphone, pas email)
3. Escalader vers l'équipe DFIR si accès à des ressources sensibles confirmé
4. Documenter chaque action entreprise avec horodatage
```

## Le SOAR — orchestrer et automatiser la réponse

<CompareTable
  titleA="SIEM (chapitre 3)"
  titleB="SOAR"
  rows={[
    { a: "Collecte, corrèle et génère des alertes", b: "Orchestre et automatise les actions de réponse une fois l'alerte générée" },
    { a: "Répond à la question 'que se passe-t-il ?'", b: "Répond à la question 'que faire, et comment l'exécuter automatiquement ?'" },
    { a: "Sortie : une alerte à trier", b: "Sortie : des actions exécutées (isolement machine, blocage IP, notification)" },
]}
/>

<CehCallout>
Un SOAR peut automatiquement exécuter les premières étapes d'un playbook dès qu'une alerte de criticité suffisante se déclenche — par exemple, isoler automatiquement une machine du réseau dès la détection d'un comportement de ransomware caractéristique, avant même qu'un analyste humain n'ait pu intervenir manuellement.
</CehCallout>

## Ce qui doit rester manuel vs ce qui peut être automatisé

<WarningCallout>
Rappel du cours IA & Agents en Cybersécurité (chapitre 5) : automatiser une action réversible et à faible risque (isoler temporairement une machine suspecte) est raisonnable ; automatiser une action irréversible ou à fort impact métier (supprimer des comptes, arrêter un serveur de production) sans validation humaine expose à des dégâts collatéraux potentiellement pires que l'incident lui-même.
</WarningCallout>

<CompareTable
  titleA="Action typiquement automatisable"
  titleB="Action nécessitant une validation humaine"
  rows={[
    { a: "Isolation réseau temporaire d'une machine suspecte", b: "Arrêt complet d'un serveur de production" },
    { a: "Blocage d'une IP malveillante confirmée au pare-feu", b: "Suppression ou désactivation définitive d'un compte utilisateur" },
    { a: "Notification automatique à l'équipe concernée", b: "Communication publique ou déclaration réglementaire (cours Droit et Réglementation)" },
]}
/>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Rédiger un extrait de playbook", description: "Rédige les 3 premières étapes d'un playbook pour une alerte de ransomware détecté sur un poste utilisateur, à la manière de l'exemple ci-dessus." },
  { title: "Décider ce qui doit être automatisé", description: "Pour une alerte de connexion depuis un pays inhabituel, quelle action serait raisonnable d'automatiser immédiatement, et laquelle nécessiterait une validation humaine ?" },
]} />

## En résumé

- Un playbook est une procédure prescriptive et précise, écrite avant la crise, donnant des instructions exactes plutôt que vagues.
- Un SOAR orchestre et automatise l'exécution des actions de réponse une fois qu'une alerte a été générée par le SIEM.
- Les actions réversibles et à faible risque se prêtent à l'automatisation ; les actions irréversibles ou à fort impact exigent une validation humaine.

## Questions de Révision

1. Quelle est la différence de rôle entre un SIEM et un SOAR ?
2. Pourquoi un playbook doit-il donner des instructions exactes plutôt que des instructions vagues comme "analyser la situation" ?
3. Donne un exemple d'action qu'il serait risqué d'automatiser sans validation humaine, et explique pourquoi.
