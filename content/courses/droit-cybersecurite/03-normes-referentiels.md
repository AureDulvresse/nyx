---
title: Normes et référentiels — ISO 27001, NIST, PCI-DSS
chapter: 3
course: droit-cybersecurite
difficulty: intermediate
duration: 35
tags: [droit, normes, iso27001, nist, pci-dss]
ceh_modules: ["Module 1 - Introduction to Ethical Hacking"]
objectives:
  - Situer ISO 27001, NIST CSF et PCI-DSS les uns par rapport aux autres
  - Comprendre la logique d'un Système de Management de la Sécurité de l'Information (SMSI)
  - Identifier quand une norme devient une obligation contractuelle
---

## Introduction

Contrairement aux lois, les normes et référentiels de sécurité ne sont pas toujours des obligations légales — mais ils le deviennent souvent par la voie contractuelle (un client exige la certification de son prestataire) ou sectorielle (PCI-DSS pour quiconque traite des cartes bancaires). Ce chapitre situe les trois référentiels les plus rencontrés dans une carrière en cybersécurité.

## ISO 27001 — le management de la sécurité, pas juste la technique

<AuditCallout>
ISO 27001 ne certifie pas "des systèmes sécurisés" — elle certifie l'existence d'un Système de Management de la Sécurité de l'Information (SMSI) : un processus continu d'identification des risques, de mise en œuvre de mesures, de contrôle et d'amélioration. Une entreprise certifiée ISO 27001 peut avoir des vulnérabilités techniques — ce qui compte est qu'elle ait un processus structuré pour les identifier et les traiter.
</AuditCallout>

Le cœur de ISO 27001 est le cycle **PDCA (Plan-Do-Check-Act)** appliqué à la sécurité :

<Steps steps={[
  { title: "Plan", description: "Identifier les risques (analyse de risque), définir les mesures de sécurité (Annexe A, 93 contrôles dans la version 2022)." },
  { title: "Do", description: "Mettre en œuvre les mesures décidées — techniques (pare-feu, chiffrement) et organisationnelles (politiques, formations)." },
  { title: "Check", description: "Auditer régulièrement (audits internes, revues de direction) l'efficacité réelle des mesures." },
  { title: "Act", description: "Corriger les non-conformités identifiées et améliorer le SMSI en continu." },
]} />

## NIST Cybersecurity Framework — un langage commun

Le NIST CSF, très utilisé aux États-Unis mais adopté largement ailleurs, structure la sécurité autour de 5 (puis 6 depuis 2024) fonctions :

<CompareTable
  titleA="Fonction NIST CSF"
  titleB="Question à laquelle elle répond"
  rows={[
    { a: "Identify (Identifier)", b: "Quels sont nos actifs, nos risques, notre surface d'exposition ?" },
    { a: "Protect (Protéger)", b: "Quelles mesures préventives mettons-nous en place ?" },
    { a: "Detect (Détecter)", b: "Comment savons-nous qu'un incident est en cours ?" },
    { a: "Respond (Répondre)", b: "Que faisons-nous une fois l'incident détecté ?" },
    { a: "Recover (Récupérer)", b: "Comment revenons-nous à un fonctionnement normal ?" },
]}
/>

<CehCallout>
Un analyste SOC travaille en très grande majorité dans les fonctions Detect et Respond du NIST CSF — c'est le vocabulaire utilisé pour structurer les runbooks et les métriques de performance (temps de détection, temps de réponse) évoqués au chapitre 4 du cours sur la rédaction de rapports.
</CehCallout>

## PCI-DSS — la norme sectorielle contraignante

Contrairement à ISO 27001 (volontaire) et NIST CSF (référentiel de bonnes pratiques), le **PCI-DSS (Payment Card Industry Data Security Standard)** est imposé contractuellement par les réseaux de cartes bancaires (Visa, Mastercard...) à toute organisation qui stocke, traite ou transmet des données de cartes.

<CompareTable
  titleA="Exigence PCI-DSS"
  titleB="Exemple concret"
  rows={[
    { a: "Ne jamais stocker certaines données", b: "Le cryptogramme visuel (CVV) ne doit jamais être stocké après autorisation" },
    { a: "Chiffrer les données de carte en transit et au repos", b: "TLS pour la transmission, chiffrement fort pour le stockage" },
    { a: "Tester régulièrement la sécurité", b: "Scans de vulnérabilité trimestriels, pentest annuel obligatoire" },
    { a: "Segmenter le réseau", b: "Isoler l'environnement de traitement des cartes (CDE) du reste du réseau" },
]}
/>

<LegalCallout>
Le non-respect du PCI-DSS n'est pas une infraction pénale mais expose à des sanctions contractuelles sévères : amendes des réseaux de cartes, augmentation des frais de transaction, voire perte du droit d'accepter les paiements par carte — un risque business qui rend cette norme aussi contraignante qu'une loi en pratique.
</LegalCallout>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Situer une exigence", description: "Une entreprise doit réaliser un pentest annuel de son système de paiement en ligne. Quelle norme impose cette exigence, et pourquoi cette obligation n'est-elle pas légale mais 'contractuelle' ?" },
  { title: "Classer par fonction NIST", description: "Classe ces activités selon les fonctions du NIST CSF : mise à jour de l'inventaire des serveurs, déploiement d'un EDR, restauration d'un service après ransomware, analyse d'une alerte SIEM." },
]} />

## En résumé

- ISO 27001 certifie un processus de management de la sécurité (SMSI, cycle PDCA), pas l'absence de vulnérabilités techniques.
- Le NIST CSF structure la sécurité en fonctions (Identify, Protect, Detect, Respond, Recover) qui servent de vocabulaire commun, notamment en SOC.
- PCI-DSS est une norme sectorielle imposée contractuellement, avec des sanctions business en cas de non-conformité.

## Questions de Révision

1. Que certifie réellement ISO 27001 si ce n'est pas l'absence de vulnérabilités techniques ?
2. Dans quelle(s) fonction(s) du NIST CSF se situe principalement le travail quotidien d'un analyste SOC ?
3. Pourquoi le PCI-DSS est-il aussi contraignant qu'une loi alors qu'il ne s'agit pas d'un texte légal ?
