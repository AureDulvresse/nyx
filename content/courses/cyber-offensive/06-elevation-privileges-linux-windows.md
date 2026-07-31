---
title: Élévation de privilèges (Linux et Windows)
chapter: 6
course: cyber-offensive
difficulty: advanced
duration: 40
tags: [privesc, linux, windows]
ceh_modules: ["Module 6 - System Hacking"]
objectives:
  - Réutiliser en synthèse la méthodologie d'élévation de privilèges Linux
  - Découvrir les vecteurs d'élévation de privilèges Windows courants
  - Comprendre l'énumération automatisée avec des scripts dédiés
---

## Introduction

Ce chapitre approfondit et complète le TP privilege escalation et le lab Élévation Silencieuse déjà réalisés au cours Linux, en ajoutant les vecteurs équivalents côté Windows, indispensables pour une mission de pentest complète en environnement d'entreprise mixte.

## Rappel de la méthodologie Linux (cours Linux, TP privesc)

<CompareTable
  titleA="Vecteur Linux"
  titleB="Rappel"
  rows={[
    { a: "Binaires SUID exploitables", b: "find / -perm -4000, croisé avec GTFOBins" },
    { a: "Entrées sudo mal configurées", b: "sudo -l pour lister les commandes exécutables sans mot de passe" },
    { a: "Énumération automatisée", b: "LinPEAS pour une recherche exhaustive de vecteurs" },
]}
/>

## Vecteurs d'élévation de privilèges Windows

<Steps steps={[
  { title: "Services mal configurés", description: "Un service Windows exécuté avec des privilèges élevés, mais dont le binaire ou son chemin est modifiable par un utilisateur standard, permet de faire exécuter du code arbitraire avec ces privilèges." },
  { title: "AlwaysInstallElevated", description: "Un paramètre de registre mal configuré permettant à tout utilisateur d'installer un package MSI avec des privilèges administrateur, exploitable pour exécuter du code arbitraire." },
  { title: "Jetons de privilèges (tokens)", description: "Certains comptes de service disposent de privilèges Windows spécifiques (comme SeImpersonatePrivilege) exploitables pour usurper un jeton administrateur." },
  { title: "Mots de passe stockés en clair", description: "Fichiers de configuration, scripts ou historique contenant des identifiants en clair, un classique aussi fréquent que sur Linux." },
]} />

<CehCallout>
L'exploitation de SeImpersonatePrivilege (via des techniques documentées comme "Potato") est l'un des vecteurs d'élévation Windows les plus documentés et les plus fréquemment rencontrés en environnement d'entreprise, car ce privilège est souvent accordé par défaut à des comptes de service IIS ou SQL Server.
</CehCallout>

## L'énumération automatisée côté Windows

```text
Rappel du principe LinPEAS (cours Linux), appliqué à Windows :

WinPEAS effectue une énumération exhaustive équivalente :
services mal configurés, permissions de fichiers/registre,
jetons de privilèges disponibles, mots de passe en clair
dans les fichiers de configuration courants.
```

<WarningCallout>
Comme pour LinPEAS, l'énumération automatisée par WinPEAS produit un volume important de résultats potentiels, dont une partie sont des faux positifs ou des vecteurs déjà atténués par d'autres contrôles — une analyse manuelle des résultats reste indispensable, rappel direct du principe déjà vu au TP privesc Linux.
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell) — lab linux-001

<Steps steps={[
  { title: "Réviser la méthodologie Linux", description: "Reproduis la méthodologie du TP privesc Linux sur le lab Élévation Silencieuse : find SUID, sudo -l, LinPEAS." },
  { title: "Identifier un vecteur Windows équivalent", description: "Pour un service Windows dont le binaire exécutable est modifiable par n'importe quel utilisateur mais s'exécute avec les privilèges SYSTEM, quel type d'exploitation cela permet-il ?" },
]} />

## En résumé

- La méthodologie d'élévation Linux (SUID, sudo, LinPEAS) trouve des équivalents directs côté Windows (services mal configurés, AlwaysInstallElevated, jetons de privilèges, WinPEAS).
- L'exploitation de jetons de privilèges comme SeImpersonatePrivilege est l'un des vecteurs Windows les plus documentés en environnement d'entreprise.
- L'énumération automatisée (LinPEAS/WinPEAS) accélère la recherche mais nécessite toujours une analyse manuelle des résultats.

## Questions de Révision

1. Quel est l'équivalent Windows du principe de recherche des binaires SUID sur Linux ?
2. Qu'est-ce que le paramètre AlwaysInstallElevated, et pourquoi est-il dangereux s'il est mal configuré ?
3. Pourquoi l'énumération automatisée (LinPEAS/WinPEAS) ne dispense-t-elle jamais d'une analyse manuelle ?
