---
title: Durcissement et maintenance en conditions réelles
chapter: 8
course: administration-si
difficulty: advanced
duration: 40
tags: [sysadmin, durcissement, hardening, maintenance]
ceh_modules: ["Module 6 - System Hacking"]
objectives:
  - Appliquer une checklist de durcissement système reproductible
  - Gérer la dette technique et les systèmes legacy en production
  - Construire une routine de maintenance préventive durable
---

## Introduction

Ce dernier chapitre referme le cours en réunissant les compétences précédentes (AD, Linux, virtualisation, sauvegarde, supervision, IAM) dans une discipline transversale : le durcissement (hardening) et la maintenance continue d'un système d'information réel, avec ses contraintes budgétaires, ses systèmes anciens qu'on ne peut pas remplacer du jour au lendemain, et son besoin permanent de rester à la fois fonctionnel et sécurisé.

## Une checklist de durcissement reproductible

<Steps steps={[
  { title: "Réduire la surface d'attaque", description: "Désinstaller les services non utilisés, fermer les ports inutiles — un service qui ne tourne pas ne peut pas être exploité." },
  { title: "Configuration par défaut jamais conservée", description: "Changer systématiquement les identifiants et paramètres par défaut de tout équipement/logiciel déployé." },
  { title: "Appliquer le moindre privilège", description: "Voir chapitre 7 — comptes de service, droits d'administration, accès réseau tous limités au strict nécessaire." },
  { title: "Chiffrement au repos et en transit", description: "Disques sensibles chiffrés, communications internes elles-mêmes en TLS quand c'est réalisable." },
  { title: "Journalisation activée et centralisée", description: "Sans logs suffisants, une investigation post-incident (cours DFIR) devient quasiment impossible." },
]} />

<CehCallout>
Les référentiels de durcissement publics comme les CIS Benchmarks fournissent des checklists détaillées, système par système (Windows Server, distributions Linux, équipements réseau) — un point de départ solide plutôt que de réinventer une politique de durcissement depuis zéro.
</CehCallout>

## Gérer la dette technique et les systèmes legacy

<WarningCallout>
Un système legacy (ancien, non mis à jour, parfois non remplaçable à court terme pour des raisons métier ou budgétaires) n'est pas un problème à ignorer — c'est un risque à isoler et à surveiller activement, en attendant sa migration ou son remplacement planifié.
</WarningCallout>

<CompareTable
  titleA="Mesure compensatoire pour un système legacy"
  titleB="Objectif"
  rows={[
    { a: "Segmentation réseau stricte (VLAN dédié, pare-feu renforcé)", b: "Limiter la portée d'une éventuelle compromission" },
    { a: "Surveillance renforcée (logs, alertes spécifiques)", b: "Détecter rapidement toute activité anormale, faute de pouvoir corriger la faille elle-même" },
    { a: "Absence totale d'accès direct depuis Internet", b: "Réduire drastiquement la surface d'attaque exposée" },
    { a: "Plan de migration daté, même à long terme", b: "Éviter qu'un système 'temporaire' ne le reste indéfiniment sans échéance" },
]}
/>

## Construire une routine de maintenance préventive

<Steps steps={[
  { title: "Fenêtre de maintenance régulière", description: "Un créneau récurrent et communiqué (ex: le premier mardi du mois) plutôt que des interventions ad hoc anxiogènes pour les utilisateurs." },
  { title: "Revue périodique des accès", description: "Application concrète du cycle de vie IAM vu au chapitre 7 — des comptes orphelins découverts régulièrement plutôt que jamais." },
  { title: "Test de restauration périodique", description: "Application concrète de la discipline de sauvegarde vue au chapitre 5." },
  { title: "Revue des seuils de supervision", description: "Ajuster les alertes devenues obsolètes après une montée en charge ou un changement d'architecture (chapitre 6)." },
  { title: "Documentation tenue à jour", description: "Un schéma d'architecture ou un runbook obsolète est presque aussi dangereux qu'une absence totale de documentation (cours Rédaction de Rapports)." },
]} />

<TipCallout>
La maintenance préventive et régulière est systématiquement moins coûteuse — en temps, en stress, et en risque — que la maintenance corrective menée dans l'urgence après un incident. C'est un investissement récurrent qui se traduit directement en résilience du système d'information.
</TipCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Prioriser un durcissement", description: "Un serveur applicatif expose encore un service FTP non chiffré datant d'une ancienne intégration, jamais utilisé depuis deux ans. Quelle est la première action de durcissement à appliquer, et pourquoi ?" },
  { title: "Isoler un système legacy", description: "Une application métier critique tourne sur un système d'exploitation qui n'est plus maintenu par son éditeur, sans possibilité de migration avant 18 mois. Propose trois mesures compensatoires concrètes en attendant." },
]} />

## En résumé

- Une checklist de durcissement reproductible réduit la surface d'attaque : services inutiles supprimés, configurations par défaut changées, moindre privilège, chiffrement, journalisation.
- Un système legacy non remplaçable immédiatement doit être isolé et surveillé activement, avec un plan de migration daté, plutôt qu'ignoré.
- Une routine de maintenance préventive régulière (accès, sauvegardes, supervision, documentation) coûte systématiquement moins cher qu'une gestion uniquement corrective, menée dans l'urgence après incident.

## Questions de Révision

1. Pourquoi désinstaller un service non utilisé réduit-il directement le risque, même si ce service n'a jamais montré de vulnérabilité connue ?
2. Que signifie "isoler" un système legacy plutôt que de simplement l'ignorer ?
3. Pourquoi la maintenance préventive régulière coûte-t-elle généralement moins cher que la maintenance corrective menée dans l'urgence ?

Félicitations, tu viens de terminer le cours **Administration Systèmes et Réseaux d'Entreprise** ! Ces compétences complètent directement les cours plus offensifs (Active Directory, Cyber Offensive) en te donnant le point de vue de celui qui doit défendre et maintenir ce que tu apprends à auditer.
