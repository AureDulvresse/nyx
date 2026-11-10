---
title: Durcissement des systèmes (synthèse pratique)
chapter: 2
course: cyber-defensive
difficulty: intermediate
duration: 60
tags: [durcissement, hardening, synthese, cis-benchmarks, patch-management, cvss, epss, kev, linux, windows]
ceh_modules: ["Module 1 - Introduction to Ethical Hacking", "Module 5 - Vulnerability Analysis", "Module 6 - System Hacking"]
objectives:
  - Réutiliser en synthèse la checklist de durcissement déjà vue
  - Contrer directement les vecteurs d'attaque étudiés côté offensif
  - Prioriser les actions de durcissement selon le risque réel (exposition, CVSS 4.0, EPSS, CISA KEV)
  - Appliquer les mesures essentielles de durcissement Linux (SSH, SUID, sysctl) et Windows (SMB, comptes, ASR)
  - Utiliser les CIS Benchmarks et des outils d'audit comme Lynis ou OpenSCAP sans les appliquer mécaniquement
  - Traiter le cas des systèmes legacy par isolement et surveillance
---

## Introduction

Ce chapitre met en pratique, du point de vue défensif, le durcissement déjà détaillé au cours Administration Systèmes et Réseaux (chapitre 8), en le reliant explicitement à chaque vecteur d'attaque étudié au cours Cybersécurité Offensive. Le but est de comprendre précisément ce que chaque mesure contre concrètement.

Le durcissement, en anglais *hardening*, consiste à réduire la surface d'attaque d'un système : retirer ce qui n'est pas nécessaire, configurer le reste de façon sûre et corriger les vulnérabilités connues. C'est la couche « système » de la défense en profondeur vue au chapitre 1, et c'est l'une des plus rentables. Une grande partie des intrusions réelles n'exploite pas de faille exotique, mais une configuration par défaut, un service oublié, un correctif non appliqué ou un droit trop large.

À la fin de ce chapitre, tu sauras relier une mesure de durcissement au mécanisme d'attaque qu'elle neutralise, prioriser un plan de durcissement selon le risque réel, appliquer les mesures essentielles sur Linux et Windows, et utiliser les référentiels comme les CIS Benchmarks avec discernement.

## Contrer directement les vecteurs offensifs étudiés

Le premier réflexe du défenseur consiste à partir des techniques d'attaque connues. Chaque technique exploite un mécanisme précis ; la bonne contre-mesure est celle qui supprime ce mécanisme.

<CompareTable
  titleA="Vecteur offensif (cours Cybersécurité Offensive)"
  titleB="Mesure de durcissement défensive"
  rows={[
    { a: "Binaires SUID exploitables (ch.6)", b: "Audit régulier des binaires SUID, suppression des droits non indispensables" },
    { a: "Services mal configurés Windows (ch.6)", b: "Vérification des permissions de service, principe du moindre privilège" },
    { a: "Énumération SMB anonyme (ch.3)", b: "Désactivation de l'accès anonyme, restriction de l'énumération" },
    { a: "Identifiants par défaut (ch.5)", b: "Changement systématique de toute configuration par défaut au déploiement" },
]}
/>

Prenons chaque ligne et expliquons le mécanisme, sans entrer dans une procédure d'attaque.

Un binaire **SUID** sous Linux s'exécute avec les droits de son propriétaire, souvent root, quel que soit l'utilisateur qui le lance. C'est indispensable pour quelques programmes, comme `passwd`, qui doit modifier un fichier réservé à root. Mais si un binaire SUID permet d'ouvrir un shell, de lire un fichier arbitraire ou d'exécuter une commande, n'importe quel utilisateur peut s'en servir pour devenir root. La contre-mesure consiste à garder la liste la plus courte possible et à surveiller toute apparition nouvelle.

Un **service Windows mal configuré** est un service qui tourne avec un compte privilégié, souvent `LocalSystem`, mais dont le binaire, le dossier ou la configuration peuvent être modifiés par un utilisateur standard. Celui qui modifie ce que le service exécute hérite de ses privilèges. La contre-mesure est de vérifier les permissions sur les binaires et les clés de registre des services, et de faire tourner chaque service avec un compte dédié aux droits minimaux.

L'**énumération SMB anonyme** permet à quelqu'un qui n'a aucun compte d'obtenir la liste des utilisateurs, des groupes ou des partages via une session dite nulle. Ces informations alimentent ensuite les attaques par mot de passe. La contre-mesure est de désactiver l'accès anonyme et de restreindre l'énumération.

Les **identifiants par défaut**, comme `admin` avec `admin` sur une interface d'équipement réseau, sont publiés dans les documentations constructeurs. La contre-mesure est de changer systématiquement toute configuration par défaut au déploiement, idéalement de façon automatisée.

<CehCallout>
Ce tableau illustre le principe central de la défense en profondeur (chapitre 1) : chaque technique offensive étudiée en détail dans le parcours a une contre-mesure défensive précise et directe — comprendre l'attaque rend le durcissement bien plus ciblé qu'une checklist générique appliquée sans compréhension du « pourquoi ». À l'examen CEH v13, retiens le couple « vecteur, contre-mesure » plutôt qu'une liste de réglages.
</CehCallout>

## Prioriser le durcissement selon le risque réel

Aucune organisation n'a le temps de tout durcir en même temps. Il faut donc un ordre, et cet ordre doit suivre l'exposition réelle et la probabilité des vecteurs d'attaque, pas un traitement uniforme.

<Steps steps={[
  { title: "Identifier les vecteurs les plus probables", description: "Rappel du cours Analyse SOC (chapitre 4, MITRE ATT&CK) : cartographier les techniques les plus fréquentes pour son secteur d'activité." },
  { title: "Évaluer l'exposition réelle", description: "Un service exposé à Internet mérite une priorité de durcissement supérieure à un service interne isolé." },
  { title: "Traiter les systèmes legacy en priorité isolée", description: "Rappel du cours Administration Systèmes et Réseaux (chapitre 8) : un système non durcissable immédiatement doit être isolé et surveillé activement." },
]} />

<WarningCallout>
Un durcissement appliqué uniformément sans priorisation peut consommer un temps précieux sur des systèmes à faible risque, pendant qu'un système critique exposé reste vulnérable plus longtemps — la priorisation par risque réel (rappel du cours Data Science Complète, chapitre 7, sur l'évaluation) doit guider l'ordre des actions.
</WarningCallout>

### Les trois indicateurs modernes de priorisation des vulnérabilités

Pour les correctifs, trois sources de données complémentaires sont aujourd'hui la référence.

Le **CVSS**, *Common Vulnerability Scoring System*, mesure la gravité technique d'une vulnérabilité sur une échelle de 0 à 10. La version 4.0, publiée par le FIRST fin 2023, distingue plusieurs groupes de métriques : les métriques de base, qui décrivent la vulnérabilité elle-même, les métriques de menace, qui tiennent compte de l'existence d'un code d'exploitation, et les métriques environnementales, qui adaptent le score à ton contexte. Un score de base seul ne dit pas si la faille est réellement exploitée.

L'**EPSS**, *Exploit Prediction Scoring System*, également maintenu par le FIRST, estime la probabilité qu'une vulnérabilité soit exploitée dans les trente jours suivants. Il est recalculé quotidiennement à partir d'observations réelles. Une faille notée 9,8 en CVSS mais avec un EPSS très faible est souvent moins urgente qu'une faille notée 7,5 activement exploitée.

Le catalogue **CISA KEV**, *Known Exploited Vulnerabilities*, recense les vulnérabilités dont l'exploitation réelle est confirmée par l'agence américaine CISA. Toute vulnérabilité présente dans ce catalogue et dans ton parc doit être traitée en priorité absolue.

| Vulnérabilité (exemple fictif) | CVSS | EPSS | Dans KEV | Exposition | Priorité |
| --- | --- | --- | --- | --- | --- |
| Faille A sur le VPN | 9,8 | Élevé | Oui | Internet | 1 — immédiat |
| Faille B sur le serveur web | 7,5 | Élevé | Oui | Internet | 2 — sous quelques jours |
| Faille C sur un serveur interne | 9,1 | Faible | Non | Interne isolé | 3 — cycle normal |
| Faille D sur un poste de test | 5,3 | Faible | Non | Laboratoire | 4 — prochaine maintenance |

Ce tableau montre que l'exposition et l'exploitation réelle pèsent autant que la gravité théorique. Les équipements de bordure, comme les VPN, les pare-feu et les passerelles d'accès distant, figurent depuis plusieurs années parmi les cibles les plus exploitées : ils méritent un traitement particulier.

### Le cas des systèmes legacy

Un système legacy est un système ancien qu'on ne peut pas mettre à jour, parce que l'éditeur ne le supporte plus ou parce qu'une application métier critique en dépend. Le débrancher sans réflexion n'est pas une option, et l'ignorer non plus. La bonne réponse est d'**isoler et surveiller activement** : le placer dans un segment réseau dédié, n'autoriser que les flux strictement nécessaires, désactiver tout ce qui peut l'être, surveiller ses journaux de près, et planifier son remplacement avec une date.

## Durcissement Linux : les mesures essentielles

### Auditer les binaires SUID

La commande suivante, déjà vue dans le TP privesc du cours Linux, liste tous les fichiers ayant le bit SUID.

```bash
# -perm -4000 : bit SUID positionné ; -type f : fichiers uniquement
# 2>/dev/null : masque les erreurs de permission sur /proc et autres
find / -perm -4000 -type f 2>/dev/null
```

```text
/usr/bin/passwd
/usr/bin/sudo
/usr/bin/su
/usr/bin/mount
/usr/bin/umount
/usr/bin/chsh
/usr/bin/chfn
/usr/bin/gpasswd
/usr/bin/newgrp
/usr/bin/pkexec
/usr/lib/openssh/ssh-keysign
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
```

Cette liste est typique d'une distribution Debian. Chaque entrée doit être justifiable. Par exemple, `pkexec` a été au cœur de la vulnérabilité PwnKit, CVE-2021-4034, qui permettait à tout utilisateur local de devenir root : sur un serveur sans interface graphique, il est souvent inutile. Retirer le bit SUID se fait avec `chmod u-s`, mais il faut vérifier au préalable qu'aucune fonction légitime n'en dépend, et que le gestionnaire de paquets ne le remettra pas à la prochaine mise à jour.

Le plus important est la **surveillance de la dérive** : enregistre la liste de référence et compare-la régulièrement. Un nouveau binaire SUID dans un dossier utilisateur est un signal d'alerte fort.

```bash
# Créer une référence, puis comparer plus tard
find / -perm -4000 -type f 2>/dev/null | sort > /root/suid-reference.txt
find / -perm -4000 -type f 2>/dev/null | sort | diff /root/suid-reference.txt -
```

### Durcir SSH

SSH est souvent le seul service d'administration exposé. Les distributions récentes chargent les fichiers du dossier `/etc/ssh/sshd_config.d/`, ce qui permet d'ajouter un fichier dédié sans modifier le fichier principal.

```bash
# /etc/ssh/sshd_config.d/50-durcissement.conf
PermitRootLogin no              # pas de connexion directe en root
PasswordAuthentication no       # clés uniquement : supprime le bruteforce de mots de passe
KbdInteractiveAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
LoginGraceTime 30
X11Forwarding no
AllowGroups ssh-admins          # seuls les membres de ce groupe peuvent se connecter
```

```bash
sudo sshd -t                     # vérifie la syntaxe avant tout redémarrage
sudo sshd -T | grep -Ei 'permitrootlogin|passwordauthentication|allowgroups'
sudo systemctl reload ssh        # le service s'appelle sshd sur les distributions Red Hat
```

```text
permitrootlogin no
passwordauthentication no
allowgroups ssh-admins
```

<WarningCallout>
Avant de recharger SSH avec `PasswordAuthentication no`, vérifie que ta clé publique est bien installée et garde une session ouverte pendant le test. Une erreur de configuration sur un serveur distant peut te couper définitivement l'accès.
</WarningCallout>

### Paramètres noyau et services

Le noyau Linux expose des paramètres de sécurité via `sysctl`. Quelques réglages courants, issus des recommandations CIS et ANSSI :

```bash
# /etc/sysctl.d/60-durcissement.conf
kernel.kptr_restrict = 2                    # masque les adresses noyau aux utilisateurs
kernel.dmesg_restrict = 1                   # réserve dmesg aux administrateurs
kernel.yama.ptrace_scope = 1                # limite l'inspection mémoire d'autres processus
fs.protected_symlinks = 1
fs.protected_hardlinks = 1
net.ipv4.conf.all.accept_redirects = 0      # ignore les redirections ICMP
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.all.rp_filter = 1             # filtre les adresses source usurpées
```

```bash
sudo sysctl --system                         # applique tous les fichiers de /etc/sysctl.d
systemctl list-unit-files --type=service --state=enabled   # services démarrés au boot
```

Chaque service activé doit avoir une raison d'exister. Un serveur web n'a pas besoin de `cups`, le service d'impression, ni d'`avahi-daemon`, la découverte réseau locale.

## Durcissement Windows : les mesures essentielles

### SMB et énumération anonyme

Sur Windows, le protocole SMB concentre plusieurs mesures historiques. SMBv1 est obsolète et désactivé par défaut sur les versions récentes ; il doit le rester. La signature SMB empêche les attaques par relais : Windows 11 24H2 et Windows Server 2025 l'exigent désormais par défaut dans davantage de configurations, mais les parcs plus anciens doivent l'imposer par stratégie de groupe.

```powershell
# État de SMBv1 et de la signature côté serveur
Get-SmbServerConfiguration | Select-Object EnableSMB1Protocol, RequireSecuritySignature

# Désactiver SMBv1 et exiger la signature
Set-SmbServerConfiguration -EnableSMB1Protocol $false -RequireSecuritySignature $true -Force

# Restreindre l'énumération anonyme (comptes SAM et partages)
Get-ItemProperty -Path 'HKLM:\SYSTEM\CurrentControlSet\Control\Lsa' |
  Select-Object RestrictAnonymous, RestrictAnonymousSAM
```

```text
EnableSMB1Protocol RequireSecuritySignature
------------------ ------------------------
             False                     True

RestrictAnonymous RestrictAnonymousSAM
----------------- --------------------
                1                    1
```

Dans un domaine, ces réglages se déploient par GPO, notamment via les options de sécurité « Accès réseau : ne pas autoriser l'énumération anonyme des comptes et partages SAM ». La désactivation des protocoles de résolution de noms hérités, LLMNR et NetBIOS sur TCP/IP, supprime en outre un vecteur classique d'interception d'identifiants sur le réseau local.

### Comptes, services et réduction de surface

Les autres mesures prioritaires sur Windows sont les suivantes. Les utilisateurs travaillent sans droits d'administration locaux. Les mots de passe des administrateurs locaux sont uniques par machine grâce à Windows LAPS, intégré nativement depuis 2023 et détaillé au chapitre 4. Les macros Office provenant d'Internet sont bloquées. Les règles de réduction de la surface d'attaque, ou règles ASR, de Microsoft Defender sont activées, par exemple celle qui bloque le vol d'identifiants depuis le processus LSASS. Enfin, la protection LSA et Credential Guard isolent les secrets d'authentification.

Pour les services, vérifie le chemin de chaque binaire et les permissions sur celui-ci : un chemin non entre guillemets contenant des espaces, ou un dossier modifiable par les utilisateurs, est un défaut de configuration classique.

```powershell
# Services dont le chemin contient un espace sans guillemets
Get-CimInstance Win32_Service |
  Where-Object { $_.PathName -notmatch '^"' -and $_.PathName -match ' ' -and $_.PathName -notmatch '^C:\\Windows\\' } |
  Select-Object Name, StartName, PathName
```

## Les référentiels de durcissement — un point de départ, pas une fin

<TipCallout>
Rappel du cours Administration Systèmes et Réseaux (chapitre 8) : les CIS Benchmarks fournissent des checklists détaillées par système — un excellent point de départ, mais qui doit être adapté au contexte réel de l'organisation plutôt qu'appliqué mécaniquement sans compréhension des compromis fonctionnels que chaque règle implique.
</TipCallout>

Les CIS Benchmarks existent en deux niveaux. Le niveau 1 regroupe des réglages raisonnables avec peu d'impact fonctionnel. Le niveau 2 vise les environnements très sensibles et peut casser des usages. En France, les guides de l'ANSSI, comme les recommandations de configuration d'un système GNU/Linux, jouent un rôle équivalent. Microsoft publie de son côté des *security baselines* pour Windows.

Des outils permettent de mesurer l'écart avec ces référentiels. **Lynis** est un outil d'audit libre pour Linux qui produit un indice de durcissement et une liste de suggestions. **OpenSCAP** évalue un système contre des profils SCAP, dont des profils CIS ou ANSSI selon les distributions.

```bash
sudo lynis audit system --quick
```

```text
  Lynis security scan details:

  Hardening index : 64 [############        ]
  Tests performed : 262
  Plugins enabled : 0

  -[ Suggestions ]-
  * Install a PAM module for password strength testing like pam_cracklib or pam_passwdqc [AUTH-9262]
  * Consider hardening SSH configuration [SSH-7408]
  * Enable process accounting [ACCT-9622]
```

L'indice ne vaut pas validation : une suggestion peut ne pas s'appliquer à ton contexte, et un score élevé ne garantit pas l'absence de faille. L'outil sert à repérer les écarts, la décision reste humaine.

<AuditCallout>
Dans l'ISO/IEC 27001:2022, le durcissement relève notamment du contrôle A.8.9 sur la gestion des configurations, apparu dans la version 2022, et du contrôle A.8.8 sur la gestion des vulnérabilités techniques. Un auditeur attendra une configuration de référence documentée, la preuve que les écarts sont détectés, et un processus de correctifs avec des délais liés au niveau de risque.
</AuditCallout>

### Industrialiser pour éviter la dérive

Un durcissement appliqué à la main dérive avec le temps : un administrateur réactive un service pour dépanner, un nouveau serveur est installé sans la configuration de référence. La réponse moderne est de décrire la configuration sous forme de code, avec Ansible, des GPO versionnées ou des images de référence, puis de contrôler régulièrement l'écart. Le chapitre 10 revient sur cette logique d'amélioration continue.

## Erreurs fréquentes

La première erreur est d'**appliquer un benchmark complet en production sans test**. Un réglage de niveau 2 peut bloquer une application métier ; la bonne pratique consiste à tester sur un groupe pilote.

La deuxième est de **prioriser au seul score CVSS**. Une faille notée 9 sur un serveur isolé est souvent moins urgente qu'une faille notée 7 exploitée activement sur un équipement exposé à Internet.

La troisième est d'**oublier les équipements non standard** : imprimantes, caméras, interfaces d'administration de serveurs, équipements industriels. Ce sont souvent eux qui gardent leurs identifiants par défaut.

La quatrième est de **durcir une fois puis ne plus contrôler**. Sans détection de dérive, le niveau de sécurité baisse silencieusement.

La cinquième est de **supprimer un droit sans comprendre son usage**, par exemple retirer le SUID de `passwd`, ce qui empêche les utilisateurs de changer leur mot de passe.

## Lab — Mise en pratique

**Environnement** : Kali Linux (terminal Nyx Shell). Les étapes Windows sont à réaliser sur une machine virtuelle de test si tu en disposes.

<Steps steps={[
  { title: "Auditer les binaires SUID d'un système", description: "Rappel du TP privesc (cours Linux) : liste les binaires SUID d'un système et identifie ceux qui pourraient être retirés sans casser de fonctionnalité légitime.", code: "find / -perm -4000 -type f 2>/dev/null" },
  { title: "Créer une référence et détecter la dérive", description: "Enregistre la liste de référence, crée un fichier SUID de test dans /tmp, puis relance la comparaison. Observe la ligne ajoutée signalée par diff, puis supprime le fichier de test.", code: "find / -perm -4000 -type f 2>/dev/null | sort > ~/suid-ref.txt\ncp /bin/true /tmp/test-suid && sudo chown root /tmp/test-suid && sudo chmod u+s /tmp/test-suid\nfind / -perm -4000 -type f 2>/dev/null | sort | diff ~/suid-ref.txt -\nsudo rm /tmp/test-suid" },
  { title: "Lire la configuration SSH effective", description: "Affiche la configuration réellement appliquée par sshd, qui tient compte des fichiers inclus. Repère si l'authentification par mot de passe et la connexion root sont autorisées.", code: "sudo sshd -T | grep -Ei 'permitrootlogin|passwordauthentication|maxauthtries'" },
  { title: "Mesurer l'écart avec Lynis", description: "Lance un audit rapide et note l'indice de durcissement. Choisis trois suggestions et décide, pour chacune, si elle est pertinente dans ton contexte et pourquoi.", code: "sudo apt install -y lynis\nsudo lynis audit system --quick" },
  { title: "Vérifier SMB sous Windows", description: "Sur une machine Windows de test, contrôle l'état de SMBv1, de la signature et des restrictions d'énumération anonyme.", code: "Get-SmbServerConfiguration | Select-Object EnableSMB1Protocol, RequireSecuritySignature\nGet-ItemProperty 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Lsa' | Select-Object RestrictAnonymous, RestrictAnonymousSAM" },
  { title: "Prioriser trois actions de durcissement", description: "Pour un serveur web exposé à Internet exécutant un service SSH avec authentification par mot de passe, un service SMB avec énumération anonyme active, et un compte administrateur au mot de passe par défaut, priorise l'ordre de durcissement de ces trois éléments. Justifie chaque rang par l'exposition et la probabilité d'exploitation." }
]} />

## À retenir

- Chaque technique offensive étudiée dans le parcours a une contre-mesure défensive précise, rendant le durcissement bien plus ciblé qu'une checklist générique.
- La priorisation du durcissement doit suivre l'exposition réelle et la probabilité des vecteurs d'attaque, pas un traitement uniforme.
- Pour les correctifs, combine CVSS 4.0 pour la gravité, EPSS pour la probabilité d'exploitation et le catalogue CISA KEV pour l'exploitation confirmée.
- Un système legacy non durcissable immédiatement doit être isolé et surveillé activement, avec un plan de remplacement daté.
- Sur Linux, surveille les binaires SUID, durcis SSH et les paramètres noyau ; sur Windows, désactive SMBv1, exige la signature SMB et restreins l'énumération anonyme.
- Les référentiels comme les CIS Benchmarks sont un point de départ à adapter, jamais une checklist à appliquer mécaniquement sans réflexion contextuelle.
- Le durcissement doit être industrialisé et contrôlé dans le temps pour éviter la dérive de configuration.

## Questions de révision

1. Quelle mesure de durcissement contre directement l'énumération SMB anonyme étudiée côté offensif ?
2. Pourquoi un durcissement uniforme sans priorisation peut-il laisser un système critique vulnérable plus longtemps que nécessaire ?
3. Pourquoi les CIS Benchmarks doivent-ils être adaptés au contexte plutôt qu'appliqués mécaniquement ?
4. Explique la différence entre ce que mesurent le CVSS, l'EPSS et le catalogue CISA KEV.
5. Pourquoi un nouveau binaire SUID apparu dans un dossier utilisateur est-il un signal d'alerte ?
6. Quelle stratégie adopter face à un serveur legacy qui ne peut plus recevoir de correctifs ?
7. Pourquoi l'indice de durcissement de Lynis ne suffit-il pas à prouver qu'un système est sûr ?
