---
title: Système de fichiers et permissions
chapter: 2
course: linux
difficulty: beginner
duration: 55
tags: [linux, permissions, filesystem, suid, acl, capabilities]
ceh_modules: ["Module 01 - Introduction to Ethical Hacking"]
objectives:
  - Connaître la hiérarchie du système de fichiers Linux (FHS) et savoir où chercher
  - Maîtriser les permissions classiques et les bits spéciaux SUID, SGID et sticky bit
  - Utiliser les ACL et les capabilities pour un contrôle d'accès plus fin
  - Identifier les vecteurs d'élévation de privilèges liés aux permissions
---

## Introduction

Après avoir pris en main le terminal, ce chapitre approfondit un sujet qui revient dans chaque test d'intrusion et chaque audit : la gestion des fichiers et de leurs permissions. Une permission mal configurée est l'une des causes les plus fréquentes d'élévation de privilèges — c'est-à-dire le passage d'un accès limité à un contrôle total de la machine (root).

À la fin de ce chapitre, tu sauras te repérer instantanément dans l'arborescence d'un système inconnu, lire et modifier des permissions avec précision, reconnaître les bits spéciaux qui transforment un fichier anodin en vecteur d'attaque, et utiliser les mécanismes modernes que sont les ACL et les capabilities. C'est le socle de la phase de post-exploitation sur Linux.

## Le Filesystem Hierarchy Standard (FHS)

Le **FHS** (Filesystem Hierarchy Standard) est la norme qui définit le rôle de chaque répertoire sur un système Unix ou Linux. La connaître te permet, en investigation comme en exploitation, de savoir immédiatement où chercher une information sans tâtonner. Voici les répertoires essentiels et ce qu'ils contiennent réellement.

| Répertoire | Rôle |
| --- | --- |
| `/bin`, `/usr/bin` | Programmes exécutables accessibles à tous les utilisateurs |
| `/sbin`, `/usr/sbin` | Programmes d'administration système, réservés à root |
| `/etc` | Fichiers de configuration du système et des services |
| `/home` | Répertoires personnels des utilisateurs standards |
| `/root` | Répertoire personnel de l'administrateur root |
| `/var` | Données variables : journaux (`/var/log`), files d'attente, caches |
| `/var/log` | Journaux système et applicatifs, centraux en investigation |
| `/tmp` | Fichiers temporaires, inscriptibles par tous, effaçables au redémarrage |
| `/opt` | Logiciels tiers installés en dehors des dépôts |
| `/proc` | Système de fichiers virtuel exposant l'état du noyau et des processus |
| `/dev` | Fichiers représentant les périphériques matériels |
| `/usr/share` | Données partagées indépendantes de l'architecture, dont les wordlists |

Quelques fichiers sous `/etc` reviennent constamment en sécurité. Le fichier `/etc/passwd` liste les comptes du système (nom, identifiant numérique UID, shell associé) et reste **lisible par tous**. Le fichier `/etc/shadow` contient les empreintes des mots de passe et n'est lisible que par root. Le fichier `/etc/group` décrit les groupes. Les tâches planifiées vivent dans `/etc/crontab` et `/etc/cron.d`.

<AttackDefenseTable rows={[
  { phase: "Reconnaissance", attack: "Lire /etc/passwd pour énumérer les comptes et leurs shells", defense: "Limiter les comptes disposant d'un shell interactif au strict nécessaire" },
  { phase: "Persistance", attack: "Déposer une tâche planifiée dans /etc/cron.d pour relancer un accès", defense: "Auditer régulièrement les tâches planifiées et comparer à une baseline" },
  { phase: "Élévation de privilèges", attack: "Exploiter un binaire SUID mal configuré pour obtenir un shell root", defense: "Inventorier les binaires SUID et retirer le bit des binaires non essentiels" }
]} />

## Lire les permissions classiques

Chaque élément du système de fichiers appartient à un **propriétaire** (un utilisateur) et à un **groupe**, et porte trois types de droits : lecture (`r`), écriture (`w`) et exécution (`x`). Ces droits sont définis séparément pour trois catégories : le propriétaire (`u` pour user), le groupe (`g`), et les autres (`o` pour others).

La commande `ls -l` affiche ces permissions dans une chaîne de dix caractères. Le premier indique le type (`-` pour un fichier ordinaire, `d` pour un répertoire, `l` pour un lien symbolique). Les neuf suivants se lisent par blocs de trois : propriétaire, groupe, autres.

```bash
# Afficher les permissions détaillées d'un fichier
ls -l /etc/shadow
```

```text
-rw-r----- 1 root shadow 1420 nov.   9 09:41 /etc/shadow
```

Ici, `rw-` pour root, `r--` pour le groupe `shadow`, et `---` pour les autres : personne hors de root et du groupe `shadow` ne peut même lire le fichier. C'est volontaire, puisqu'il contient les empreintes de mots de passe.

Sur un répertoire, le droit d'exécution `x` a un sens particulier : il autorise à **traverser** le répertoire, c'est-à-dire à y accéder et à atteindre les fichiers qu'il contient, tandis que `r` autorise seulement à en lister le contenu.

### Notation octale

Les permissions se résument souvent en **notation octale** : lecture vaut 4, écriture vaut 2, exécution vaut 1, et on additionne par bloc. Ainsi `rwx` fait 7, `r-x` fait 5, `r--` fait 4. L'ensemble `rwxr-xr-x` s'écrit donc 755, et `rw-r--r--` s'écrit 644.

<CompareTable
  titleA="Notation symbolique"
  titleB="Notation octale"
  rows={[
    { a: "rwxr-xr-x", b: "755" },
    { a: "rw-r--r--", b: "644" },
    { a: "rw-------", b: "600" },
    { a: "rwx------", b: "700" }
  ]}
/>

```bash
# Rendre un script lisible et exécutable par tous, modifiable par le seul propriétaire
chmod 755 script.sh

# Restreindre une clé privée au seul propriétaire (exigence de SSH)
chmod 600 ~/.ssh/id_ed25519

# Changer propriétaire et groupe d'un fichier
sudo chown www-data:www-data /var/www/html/index.php
```

## Les bits spéciaux

Au-delà des neuf permissions classiques, trois **bits spéciaux** modifient le comportement d'un fichier ou d'un répertoire. Ils sont au cœur de nombreux scénarios d'élévation de privilèges.

### SUID — Set User ID

Le bit **SUID** (`chmod u+s`) fait qu'un programme s'exécute avec les droits de son **propriétaire**, et non de l'utilisateur qui le lance. Si le propriétaire est root, le programme tourne alors avec les droits de root même lancé par un compte limité. C'est nécessaire pour certains outils légitimes (`passwd` doit modifier `/etc/shadow`), mais un binaire SUID mal choisi devient une porte vers root. Dans la sortie de `ls -l`, le bit SUID apparaît comme un `s` à la place du `x` du propriétaire, par exemple `-rwsr-xr-x`.

### SGID — Set Group ID

Le bit **SGID** (`chmod g+s`) fait qu'un programme s'exécute avec les droits de son **groupe** propriétaire. Appliqué à un répertoire, il force les fichiers créés à hériter du groupe du répertoire plutôt que du groupe de leur créateur — pratique pour des dossiers partagés. La différence clé avec SUID tient donc à l'identité empruntée : SUID emprunte celle du propriétaire, SGID celle du groupe.

### Sticky bit

Le **sticky bit** (`chmod +t`) s'applique aux répertoires partagés : il garantit que seul le propriétaire d'un fichier peut le supprimer ou le renommer, même si le répertoire est inscriptible par tous. C'est exactement pourquoi `/tmp` le porte par défaut (permissions `1777`) : tout le monde peut y écrire, mais personne ne peut effacer les fichiers d'autrui. Le sticky bit apparaît comme un `t` à la fin : `drwxrwxrwt`.

```bash
# Trouver tous les binaires SUID du système (réflexe de post-exploitation)
find / -perm -4000 -type f 2>/dev/null

# Trouver les binaires SGID
find / -perm -2000 -type f 2>/dev/null

# Créer un répertoire partagé protégé par le sticky bit
mkdir /srv/partage && chmod 1777 /srv/partage
ls -ld /srv/partage
```

```text
/usr/bin/sudo
/usr/bin/passwd
/usr/bin/chsh
/usr/bin/newgrp
drwxrwxrwt 2 root root 4096 nov.   9 09:55 /srv/partage
```

La redirection `2>/dev/null` envoie les messages d'erreur (les « permission denied » sur les répertoires que tu ne peux pas lire) vers le néant, pour ne garder que les résultats utiles.

<CehCallout>
L'énumération des binaires SUID et SGID est l'un des tout premiers réflexes de post-exploitation. Des outils comme LinPEAS automatisent cette recherche et la croisent avec une base de vecteurs connus. Attends-toi à y être confronté en certification pratique (CEH v13, OSCP+).
</CehCallout>

## GTFOBins : savoir si un binaire est exploitable

Une fois un binaire SUID identifié, comment savoir s'il est réellement abusable ? Le projet **GTFOBins** référence, pour des centaines de binaires Unix courants, la commande exacte permettant d'en détourner l'usage afin d'élever ses privilèges, de contourner une restriction ou d'exfiltrer un fichier. Beaucoup de binaires offrent en effet un moyen détourné de lancer un shell ; s'ils portent le bit SUID root, ce shell hérite des droits de root.

```bash
# Exemple documenté par GTFOBins : si /usr/bin/find porte le bit SUID,
# l'option -exec permet de lancer un shell qui conserve les privilèges (-p)
find . -exec /bin/sh -p \; -quit
```

Le réflexe à automatiser : dès que tu repères un binaire SUID non standard, vérifie-le sur GTFOBins avant de chercher une exploitation plus complexe. La même logique s'applique aux commandes autorisées via `sudo`, que l'on inspecte avec `sudo -l`.

## Au-delà du modèle classique

### Les ACL : des permissions par utilisateur

Les permissions Unix traditionnelles ont une limite : impossible d'accorder un droit spécifique à un second utilisateur sans le placer dans le même groupe. Les **ACL** (Access Control Lists, listes de contrôle d'accès) lèvent cette limite en attachant au fichier des règles par utilisateur ou par groupe.

```bash
# Accorder la lecture à un utilisateur précis, sans toucher au groupe
setfacl -m u:audit:r rapport_sensible.log

# Consulter les ACL appliquées à un fichier
getfacl rapport_sensible.log
```

<TipCallout>
Un fichier portant des ACL affiche un `+` à la fin de sa ligne dans `ls -l`, par exemple `-rw-r--r--+`. C'est un signal à repérer en investigation : les ACL sont souvent oubliées lors des audits de permissions classiques et peuvent cacher un accès accordé discrètement.
</TipCallout>

### Les capabilities : découper les privilèges de root

Depuis le noyau 2.2, Linux propose les **capabilities** : un découpage des privilèges de root en dizaines de permissions indépendantes (`CAP_NET_RAW` pour forger des paquets réseau, `CAP_SYS_ADMIN` pour des opérations système étendues, `CAP_SETUID` pour changer d'identité). On peut ainsi donner à un binaire exactement le privilège dont il a besoin, au lieu du bit SUID root qui lui accorde tout.

```bash
# Lister les capabilities d'un binaire
getcap /usr/bin/ping

# Rechercher tous les binaires porteurs de capabilities
getcap -r / 2>/dev/null
```

```text
/usr/bin/ping cap_net_raw=ep
/usr/bin/python3.12 cap_setuid=ep
```

Attention : une capability mal choisie est tout aussi dangereuse qu'un SUID. Un interpréteur comme Python doté de `cap_setuid` permet à n'importe quel utilisateur d'acquérir l'identité de root — c'est un vecteur d'élévation direct, comme le signale la seconde ligne de l'exemple.

<AuditCallout>
Remplacer un bit SUID par une capability précise (par exemple `CAP_NET_RAW` pour `ping`) applique le principe du moindre privilège au niveau du binaire. L'inventaire et la justification des droits d'accès à privilèges relèvent, dans la norme ISO/IEC 27001:2022, des contrôles A.8.2 (droits d'accès à privilèges) et A.8.18 (utilisation de programmes utilitaires à privilèges).
</AuditCallout>

## Erreurs fréquentes

- **Confondre `chmod 777` et « ça marche »** : donner tous les droits à tous résout un problème de permission en en créant un bien plus grave. Cible le besoin réel.
- **Oublier `2>/dev/null`** dans les recherches `find`, et se noyer sous les erreurs « permission denied » au point de rater les vrais résultats.
- **Ignorer le `+` de `ls -l`** et conclure à tort qu'un fichier est bien protégé alors qu'une ACL accorde un accès caché.
- **Croire que SUID sur un script shell fonctionne** : sur Linux moderne, le noyau ignore le bit SUID sur les scripts interprétés, pour des raisons de sécurité. Il ne s'applique qu'aux binaires compilés.
- **Mettre une clé SSH privée en 644** : SSH refusera de l'utiliser. Une clé privée doit être en 600.

## Angle offensif et défensif

Côté attaquant, la chaîne est claire : énumérer les binaires SUID/SGID et les capabilities, vérifier les droits `sudo` avec `sudo -l`, croiser chaque résultat avec GTFOBins, et rechercher les fichiers inscriptibles par tous (`find / -perm -0002 -type f 2>/dev/null`) qui permettraient d'altérer un script privilégié.

Côté défenseur, la parade tient en trois mouvements : réduire l'inventaire des binaires SUID au strict nécessaire, préférer les capabilities ciblées au SUID complet, et surveiller l'intégrité des fichiers sensibles. Un outil d'intégrité comme AIDE établit une empreinte de référence du système et alerte sur toute modification d'un binaire ou d'une permission.

## Lab — Mise en pratique

**Environnement** : Kali Linux (terminal Nyx Shell)

<Steps steps={[
  { title: "Explorer le FHS", description: "Parcours les répertoires clés et observe leurs permissions. Note que /etc/shadow est illisible pour les non-root alors que /etc/passwd est lisible par tous.", code: "ls -ld /etc /var/log /tmp /root\nls -l /etc/passwd /etc/shadow" },
  { title: "Lire des permissions en octal", description: "Entraîne-toi à traduire la sortie symbolique en octal avec stat, qui affiche les deux formats.", code: "stat -c '%A %a %U %G %n' /etc/passwd /tmp" },
  { title: "Inventorier les binaires SUID", description: "Recherche tous les binaires porteurs du bit SUID. Repère ceux qui ne font pas partie des outils système habituels.", code: "find / -perm -4000 -type f 2>/dev/null" },
  { title: "Inventorier les capabilities", description: "Liste les binaires dotés de capabilities. Une capability comme cap_setuid sur un interpréteur est un signal d'alerte.", code: "getcap -r / 2>/dev/null" },
  { title: "Observer le sticky bit", description: "Vérifie les permissions de /tmp. Le t final confirme que seul le propriétaire d'un fichier peut l'y supprimer.", code: "ls -ld /tmp" },
  { title: "Manipuler une ACL", description: "Crée un fichier, accorde un accès en lecture à un utilisateur précis via une ACL, puis repère le + dans ls -l.", code: "touch /tmp/secret.txt\nsetfacl -m u:nobody:r /tmp/secret.txt\nls -l /tmp/secret.txt\ngetfacl /tmp/secret.txt" },
  { title: "Trouver les fichiers inscriptibles par tous", description: "Recherche les fichiers modifiables par n'importe quel utilisateur, un vecteur classique de persistance ou d'élévation.", code: "find /etc -xdev -type f -perm -0002 2>/dev/null" }
]} />

## À retenir

- Le FHS normalise le rôle de chaque répertoire : `/etc` pour la configuration, `/var/log` pour les journaux, `/proc` pour l'état du noyau.
- `/etc/passwd` est lisible par tous, `/etc/shadow` (empreintes de mots de passe) est réservé à root.
- Les permissions `rwx` se notent en octal (4, 2, 1) et se lisent par blocs propriétaire, groupe, autres.
- SUID exécute un programme avec les droits de son propriétaire, SGID avec ceux de son groupe, le sticky bit protège les fichiers dans un répertoire partagé comme `/tmp`.
- L'énumération SUID (`find / -perm -4000`) et capabilities (`getcap -r /`) est un réflexe systématique de post-exploitation, à croiser avec GTFOBins.
- Les ACL ajoutent des droits par utilisateur et laissent un `+` visible dans `ls -l` ; les capabilities découpent finement les privilèges de root.
- Côté conformité, la gestion des droits à privilèges relève d'ISO/IEC 27001:2022 (A.8.2 et A.8.18).

## Questions de révision

1. Que signifie l'acronyme FHS et à quoi sert cette norme en pratique ?
2. Que fait le bit SUID sur un exécutable, et en quoi diffère-t-il du bit SGID ?
3. Quelle commande trouve tous les binaires SUID du système, et à quoi sert le `2>/dev/null` ?
4. Pourquoi le sticky bit est-il appliqué à `/tmp` par défaut ?
5. Comment accorder un accès en lecture à un seul utilisateur sans le placer dans le groupe du fichier ?
6. Que signale la présence d'un `+` à la fin d'une ligne de `ls -l` ?
7. À quoi sert GTFOBins une fois un binaire SUID identifié ?
8. En quoi une capability comme `cap_setuid` sur un interpréteur peut-elle être aussi dangereuse qu'un bit SUID root ?
