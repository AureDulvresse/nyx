---
title: Élévation de privilèges Windows locale
chapter: 5
course: active-directory
difficulty: intermediate
duration: 35
tags: [active-directory, windows, privesc]
ceh_modules: ["Module 6 - System Hacking"]
objectives:
  - Identifier les vecteurs d'élévation de privilèges Windows les plus courants
  - Utiliser des outils d'énumération automatisée (WinPEAS, PowerUp)
  - Comprendre l'exploitation des services mal configurés
---

## Introduction

Avant de pouvoir se déplacer dans le domaine (chapitre 4) ou d'exploiter Kerberos (chapitre 3), un attaquant qui accède à un poste avec un compte non privilégié cherche d'abord à obtenir des droits administrateur LOCAUX sur cette machine — l'équivalent Windows de l'escalade de privilèges Linux vue dans le TP dédié du cours Linux.

## Vecteurs d'élévation de privilèges Windows courants

<CompareTable
  titleA="Vecteur"
  titleB="Mécanisme"
  rows={[
    { a: "Services mal configurés", b: "Un service tourne en SYSTEM mais son binaire est modifiable par un utilisateur standard" },
    { a: "Chemins de service non quotés (unquoted service path)", b: "Windows interprète mal un chemin contenant des espaces sans guillemets, permettant l'exécution d'un binaire malveillant placé au bon endroit" },
    { a: "AlwaysInstallElevated", b: "Une clé de registre mal configurée permet d'installer un package MSI avec des droits SYSTEM" },
    { a: "Jetons d'accès mal gérés (token impersonation)", b: "Un processus disposant de privilèges spécifiques (SeImpersonatePrivilege) peut être détourné pour obtenir SYSTEM" },
    { a: "Informations sensibles en clair", b: "Mots de passe stockés en clair dans des scripts, fichiers de configuration ou l'historique PowerShell" },
]}
/>

<CehCallout>
Un chemin de service non quoté comme `C:\Program Files\Mon Service\service.exe` peut être interprété par Windows comme une tentative d'exécuter `C:\Program.exe`, puis `C:\Program Files\Mon.exe` — si un attaquant dispose des droits d'écriture sur l'un de ces emplacements intermédiaires, il peut y placer un exécutable malveillant qui sera lancé avec les privilèges du service.
</CehCallout>

## Automatiser l'énumération avec WinPEAS

<Steps steps={[
  { title: "Lancer WinPEAS", description: "Un script/binaire qui énumère automatiquement services, tâches planifiées, permissions de fichiers, informations sensibles en clair, et bien plus." },
  { title: "Trier les résultats par couleur", description: "WinPEAS met en évidence (souvent en rouge/jaune) les vecteurs les plus probables — mais chaque piste doit être vérifiée manuellement avant exploitation." },
  { title: "Croiser avec des bases de connaissances", description: "Un service vulnérable identifié peut correspondre à une technique documentée (ex: sur GTFOBins pour l'équivalent Linux, ou des bases dédiées Windows)." },
]} />

<WarningCallout>
Les outils d'énumération automatisée comme WinPEAS produisent de nombreux faux positifs — un service "signalé comme suspect" n'est pas automatiquement exploitable ; la vérification manuelle des permissions réelles reste indispensable avant de tenter une exploitation.
</WarningCallout>

## PowerUp — recherche ciblée de vecteurs de privesc

<CompareTable
  titleA="Fonction PowerUp"
  titleB="Ce qu'elle recherche"
  rows={[
    { a: "Get-ServiceUnquoted", b: "Services avec un chemin non quoté et un espace dans le chemin" },
    { a: "Get-ModifiableServiceFile", b: "Services dont le binaire est modifiable par l'utilisateur courant" },
    { a: "Get-RegistryAlwaysInstallElevated", b: "Vérifie si la clé AlwaysInstallElevated est activée" },
]}
/>

## Se défendre contre l'élévation de privilèges locale

<Steps steps={[
  { title: "Toujours quoter les chemins de service", description: "Élimine mécaniquement toute une classe de vulnérabilités liées aux chemins non quotés." },
  { title: "Restreindre les permissions sur les binaires de service", description: "Seuls les administrateurs doivent pouvoir modifier les exécutables lancés avec des privilèges élevés." },
  { title: "Ne jamais stocker de mots de passe en clair", description: "Ni dans des scripts, ni dans des fichiers de configuration, ni dans l'historique de commandes." },
  { title: "Auditer régulièrement avec les mêmes outils que l'attaquant", description: "Faire tourner WinPEAS/PowerUp de façon défensive, en amont, plutôt que de découvrir ces vecteurs lors d'un incident réel." },
]} />

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Identifier un vecteur d'élévation", description: "Un service tourne en SYSTEM avec le chemin `C:\\Program Files\\App Sécurité\\service.exe`, non quoté, et un utilisateur standard a un accès en écriture sur `C:\\Program Files\\`. Explique le vecteur d'attaque exact que cela ouvre." },
  { title: "Proposer une correction", description: "Pour le vecteur identifié ci-dessus, quelle correction simple élimine définitivement le risque ?" },
]} />

## En résumé

- Les services mal configurés, les chemins non quotés et les jetons d'accès mal gérés comptent parmi les vecteurs d'élévation de privilèges Windows les plus courants.
- WinPEAS et PowerUp automatisent l'énumération, mais chaque piste doit être vérifiée manuellement pour éliminer les faux positifs.
- Quoter systématiquement les chemins de service et restreindre les permissions sur les binaires élimine une classe entière de vulnérabilités.

## Questions de Révision

1. Pourquoi un chemin de service non quoté contenant des espaces peut-il être exploité pour une élévation de privilèges ?
2. Pourquoi faut-il toujours vérifier manuellement les résultats de WinPEAS avant de tenter une exploitation ?
3. Que vérifie la clé de registre AlwaysInstallElevated, et pourquoi est-elle dangereuse si activée sans contrôle ?
