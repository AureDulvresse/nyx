---
title: Gestion des processus et services
chapter: 3
course: linux
difficulty: beginner
duration: 40
tags: [linux, processus, systemd]
ceh_modules: ["Module 06 - System Hacking"]
objectives:
  - Lister, filtrer et interpréter les processus en cours d'exécution
  - Comprendre le fonctionnement de systemd et des services
  - Identifier un processus suspect à des fins de détection d'intrusion
---

## Introduction

Un système compromis laisse presque toujours une trace au niveau des processus : un reverse shell qui tourne en arrière-plan, un service qui écoute sur un port inhabituel, une tâche planifiée qui relance un script malveillant. Savoir lire l'état des processus d'une machine est donc une compétence à double tranchant : elle sert à maintenir un accès en tant qu'attaquant, et à détecter une intrusion en tant que défenseur.

Ce chapitre couvre la gestion des processus sous Linux, le fonctionnement de systemd — le gestionnaire de services de la plupart des distributions modernes — et donne les premiers réflexes de détection d'anomalies.

## Processus : PID, parent et arborescence

Chaque processus Linux possède un identifiant unique, le PID (Process ID), et un processus parent (PPID). L'arborescence complète part du processus `init` (PID 1).

```bash
# Vue arborescente des processus
ps auxf

# Vue temps réel avec tri par consommation CPU
top

# Alternative moderne, plus lisible
htop
```

<CompareTable
  titleA="Commande"
  titleB="Usage"
  rows={[
    { a: "ps aux", b: "Liste tous les processus, tous utilisateurs confondus" },
    { a: "ps -ef --forest", b: "Affiche la hiérarchie parent/enfant" },
    { a: "kill -9 <pid>", b: "Termine un processus de force (SIGKILL)" },
    { a: "pkill <nom>", b: "Termine tous les processus correspondant à un nom" },
  ]}
/>

<TipCallout>
Un PPID à 1 pour un processus suspect signifie qu'il a été "orphelinisé" — souvent le signe d'un processus détaché volontairement de son terminal, technique classique pour faire persister un reverse shell.
</TipCallout>

## systemd et la gestion des services

systemd a remplacé les scripts SysV traditionnels sur la majorité des distributions modernes (Debian, Ubuntu, Kali, RHEL récents). Il gère le démarrage, l'arrêt et la supervision des services via des unités (`.service`, `.timer`, `.socket`).

```bash
# Statut d'un service
systemctl status ssh

# Démarrer / arrêter / activer au démarrage
systemctl start ssh
systemctl stop ssh
systemctl enable ssh

# Lister tous les services actifs
systemctl list-units --type=service --state=running
```

<CehCallout>
Un attaquant qui obtient un accès root persiste souvent en créant un service systemd malveillant (`/etc/systemd/system/`) qui relance un reverse shell à chaque redémarrage. C'est un point de vérification systématique en réponse à incident.
</CehCallout>

## Détecter un processus ou service suspect

<AttackDefenseTable rows={[
  { phase: "Persistence", attack: "Créer un service systemd déguisé en processus légitime", defense: "Auditer régulièrement /etc/systemd/system/ et comparer avec une baseline" },
  { phase: "Camouflage", attack: "Renommer un binaire malveillant avec un nom de processus système", defense: "Vérifier les hashs des binaires système avec un outil d'intégrité (AIDE, Tripwire)" },
  { phase: "Réseau", attack: "Ouvrir un port d'écoute non déclaré pour un reverse shell", defense: "Croiser ss -tulpn avec la liste des ports autorisés par la politique de sécurité" },
]} />

```bash
# Croiser processus et ports ouverts
ss -tulpn

# Rechercher les processus n'ayant pas de binaire correspondant sur disque (souvent supprimé après exécution)
ls -la /proc/*/exe 2>/dev/null | grep deleted
```

<WarningCallout>
`ls -la /proc/*/exe | grep deleted` est une technique légitime d'investigation forensique. Ne l'utilise que sur des systèmes que tu es autorisé à auditer.
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell)

<Steps steps={[
  { title: "Explorer l'arborescence des processus", description: "Affiche tous les processus avec leur hiérarchie parent/enfant.", code: "ps -ef --forest" },
  { title: "Inspecter les services actifs", description: "Liste les services systemd actuellement démarrés.", code: "systemctl list-units --type=service --state=running" },
  { title: "Croiser processus et ports réseau", description: "Identifie quels processus écoutent sur quels ports.", code: "ss -tulpn" },
]} />

## Pour aller plus loin

### Les signaux Unix, au-delà de kill -9

`kill` n'envoie pas qu'un simple ordre d'arrêt : c'est un mécanisme de signaux, et `-9` (SIGKILL) n'est que l'un d'entre eux — souvent le moins élégant.

<CompareTable
  titleA="Signal"
  titleB="Effet"
  rows={[
    { a: "SIGTERM (15, défaut)", b: "Demande poliment au processus de se terminer proprement" },
    { a: "SIGKILL (9)", b: "Termine immédiatement, sans possibilité de nettoyage — dernier recours" },
    { a: "SIGHUP (1)", b: "Souvent utilisé pour recharger la configuration d'un service sans l'arrêter" },
    { a: "SIGSTOP / SIGCONT", b: "Suspend puis reprend l'exécution d'un processus" },
  ]}
/>

```bash
# Recharger la configuration d'un service sans coupure
kill -HUP $(pgrep nginx)

# Toujours préférer SIGTERM avant SIGKILL en environnement réel
kill 1234       # SIGTERM implicite
kill -9 1234    # seulement si le processus ignore SIGTERM
```

<TipCallout>
Un processus malveillant bien conçu peut intercepter et ignorer SIGTERM pour éviter d'être arrêté proprement — c'est un signe que seul SIGKILL fera réellement effet, et un indice de sophistication à noter en investigation.
</TipCallout>

### cron et les tâches planifiées : l'autre vecteur de persistance

Au-delà des services systemd, les tâches cron restent un mécanisme de persistance très utilisé, car souvent moins surveillé.

```bash
# Lister les tâches cron de l'utilisateur courant
crontab -l

# Lister les tâches cron système
cat /etc/crontab
ls /etc/cron.d/

# Ajouter une tâche cron (à des fins d'audit ou de lab uniquement)
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/backup.sh") | crontab -
```

<CehCallout>
En réponse à incident, l'inspection de `/etc/cron.d/`, `/etc/crontab` et des crontabs de chaque utilisateur (`/var/spool/cron/`) fait partie des vérifications systématiques, au même titre que les services systemd.
</CehCallout>

### journalctl : la mémoire de systemd

systemd centralise les journaux de tous les services dans un format binaire interrogeable via `journalctl` — bien plus riche que les anciens fichiers texte de `/var/log`.

```bash
# Journaux d'un service précis
journalctl -u ssh

# Journaux depuis le dernier démarrage, en continu (comme tail -f)
journalctl -b -f

# Filtrer par période
journalctl --since "1 hour ago"
```

## En résumé

- Chaque processus a un PID et un PPID ; l'arborescence complète part du PID 1.
- systemd gère le cycle de vie des services sur la plupart des distributions modernes.
- La persistance via un service systemd malveillant est une technique de post-exploitation courante.
- Croiser processus, ports ouverts et intégrité des binaires permet de détecter une anomalie.

## Questions de Révision

1. Que signifie un PPID égal à 1 pour un processus suspect ?
2. Quelle commande permet de lister les services systemd actifs ?
3. Comment croiser processus en cours et ports réseau ouverts ?
