---
title: Système de fichiers et permissions
chapter: 2
course: linux
difficulty: beginner
duration: 40
tags: [linux, permissions, filesystem]
ceh_modules: ["Module 01 - Introduction to Ethical Hacking"]
objectives:
  - Approfondir la hiérarchie du système de fichiers Linux (FHS)
  - Manipuler les permissions avancées (SUID, SGID, sticky bit)
  - Identifier les vecteurs d'élévation de privilèges liés aux permissions
---

## Introduction

Après avoir découvert les bases du terminal, ce chapitre approfondit un sujet central : la gestion des fichiers et de leurs permissions. C'est un point d'attention permanent en pentest, car une permission mal configurée est l'une des causes les plus fréquentes d'élévation de privilèges.

## Le Filesystem Hierarchy Standard (FHS)

Le FHS définit l'emplacement standard des fichiers sur les systèmes Unix/Linux. Le connaître te permet, en investigation comme en exploitation, de savoir immédiatement où chercher une information.

<AttackDefenseTable rows={[
  { phase: "Reconnaissance", attack: "Lister /etc/passwd pour énumérer les comptes", defense: "Restreindre la lecture aux comptes nécessaires" },
  { phase: "Persistence", attack: "Ajouter une tâche cron dans /etc/cron.d", defense: "Auditer régulièrement les tâches planifiées" },
  { phase: "Élévation de privilèges", attack: "Exploiter un binaire SUID mal configuré", defense: "Auditer les binaires SUID avec des outils comme linpeas" },
]} />

## Permissions avancées

En plus des permissions classiques rwx, trois bits spéciaux existent :

- **SUID** (`chmod u+s`) : le binaire s'exécute avec les droits de son propriétaire
- **SGID** (`chmod g+s`) : le binaire s'exécute avec les droits de son groupe
- **Sticky bit** (`chmod +t`) : seul le propriétaire peut supprimer ses fichiers dans un répertoire partagé (ex. `/tmp`)

```bash
# Trouver tous les binaires SUID du système
find / -perm -4000 -type f 2>/dev/null

# Ajouter le bit SUID à un binaire
chmod u+s /usr/local/bin/monoutil
```

<CehCallout>
Lors d'un test d'intrusion, l'énumération des binaires SUID fait partie des tout premiers réflexes de post-exploitation. Des outils comme `linpeas.sh` ou `linenum.sh` automatisent cette recherche.
</CehCallout>

<AuditCallout>
Le contrôle A.9.4.4 de la norme ISO 27001 impose une gestion stricte des droits d'accès privilégiés — l'audit des binaires SUID s'y rattache directement.
</AuditCallout>

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell)

<Steps steps={[
  { title: "Identifier les binaires SUID", description: "Recherche tous les binaires disposant du bit SUID sur le système.", code: "find / -perm -4000 -type f 2>/dev/null" },
  { title: "Analyser les permissions d'un fichier sensible", description: "Inspecte les droits d'accès sur /etc/shadow.", code: "ls -l /etc/shadow" },
  { title: "Créer un répertoire partagé sécurisé", description: "Applique le sticky bit sur un répertoire de partage.", code: "mkdir /tmp/partage && chmod 1777 /tmp/partage" },
]} />

## Pour aller plus loin

### ACL : au-delà des permissions rwx classiques

Les permissions Unix traditionnelles (propriétaire/groupe/autres) ont une limite : impossible de donner un accès spécifique à un deuxième utilisateur sans le mettre dans le même groupe. Les listes de contrôle d'accès (ACL) lèvent cette limite.

```bash
# Donner un accès en lecture à un utilisateur précis, sans toucher au groupe
setfacl -m u:audit:r fichier_sensible.log

# Consulter les ACL appliquées à un fichier
getfacl fichier_sensible.log
```

<TipCallout>
Un fichier avec des ACL affiche un `+` à la fin de sa ligne dans `ls -l` (ex. `-rw-r--r--+`) — un signal à repérer en investigation, car les ACL sont souvent oubliées lors des audits de permissions classiques.
</TipCallout>

### GTFOBins : le catalogue des abus de binaires

Une fois un binaire SUID identifié, comment savoir s'il est réellement exploitable ? Le site **GTFOBins** référence, pour des centaines de binaires Unix courants, la commande exacte permettant d'en abuser pour élever ses privilèges, contourner des restrictions ou exfiltrer des fichiers.

```bash
# Exemple : si /usr/bin/find a le bit SUID, cette commande donne un shell root
find . -exec /bin/sh -p \; -quit
```

<CehCallout>
Réflexe à automatiser : dès que tu identifies un binaire SUID non standard sur une machine, vérifie-le immédiatement sur GTFOBins avant de chercher une exploitation plus complexe.
</CehCallout>

### Capabilities Linux : une alternative plus fine au SUID

Depuis le noyau 2.2, Linux propose les *capabilities* : un découpage fin des privilèges root en dizaines de permissions indépendantes (`CAP_NET_RAW`, `CAP_SYS_ADMIN`...), assignables à un binaire sans lui donner tous les droits root via SUID.

```bash
# Lister les capabilities d'un binaire
getcap /usr/bin/ping

# Trouver tous les binaires avec des capabilities sur le système
getcap -r / 2>/dev/null
```

<AuditCallout>
Remplacer un bit SUID par une capability précise (par exemple `CAP_NET_RAW` pour `ping`, au lieu du SUID complet) est une recommandation de durcissement fréquente — c'est le principe du moindre privilège appliqué au niveau binaire.
</AuditCallout>

## En résumé

- Le FHS standardise l'emplacement des fichiers système sur toute distribution Linux.
- SUID, SGID et sticky bit sont des permissions spéciales à connaître pour l'audit comme pour l'exploitation.
- L'énumération des binaires SUID est un réflexe systématique en post-exploitation.
- Ces contrôles rejoignent des exigences de conformité comme ISO 27001 (A.9.4.4).

## Questions de Révision

1. Que fait le bit SUID sur un exécutable ?
2. Pourquoi le sticky bit est-il appliqué à `/tmp` par défaut ?
3. Quel contrôle ISO 27001 concerne la gestion des droits d'accès privilégiés ?
