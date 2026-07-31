---
title: Linux réseau et durcissement
chapter: 5
course: linux
difficulty: intermediate
duration: 45
tags: [linux, réseau, hardening, firewall]
ceh_modules: ["Module 06 - System Hacking", "Module 16 - Hacking Wireless Networks"]
objectives:
  - Configurer et diagnostiquer la couche réseau d'un système Linux
  - Mettre en place un pare-feu avec iptables ou nftables
  - Appliquer les premières mesures de durcissement (hardening)
---

## Introduction

Ce dernier chapitre du cours Linux referme la boucle : après avoir appris à naviguer, gérer les processus et scripter, il est temps de voir comment configurer le réseau et durcir un système contre les attaques les plus courantes. C'est une compétence double — utile à l'attaquant qui doit comprendre la surface d'exposition d'une cible, et indispensable au défenseur qui doit la réduire.

## Diagnostic réseau

```bash
# Interfaces réseau et adresses IP
ip a

# Table de routage
ip route

# Résolution DNS
cat /etc/resolv.conf
dig example.com

# Test de connectivité et de latence
ping -c 4 8.8.8.8
traceroute 8.8.8.8
```

<CompareTable
  titleA="Ancienne commande"
  titleB="Commande moderne (iproute2)"
  rows={[
    { a: "ifconfig", b: "ip a" },
    { a: "route", b: "ip route" },
    { a: "netstat -tulpn", b: "ss -tulpn" },
  ]}
/>

<TipCallout>
La suite `net-tools` (ifconfig, route, netstat) est considérée comme obsolète depuis plusieurs années au profit d'`iproute2` (ip, ss). Beaucoup de distributions récentes ne l'installent même plus par défaut.
</TipCallout>

## Pare-feu avec iptables et nftables

`iptables` reste largement utilisé et compris, bien que `nftables` soit son successeur officiel sur les distributions modernes.

```bash
# Lister les règles actuelles
iptables -L -n -v

# Autoriser seulement SSH, HTTP, HTTPS en entrée, tout bloquer par défaut
iptables -P INPUT DROP
iptables -A INPUT -i lo -j ACCEPT
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

```bash
# Équivalent en nftables
nft add table inet filter
nft add chain inet filter input { type filter hook input priority 0 \; policy drop \; }
nft add rule inet filter input iif lo accept
nft add rule inet filter input tcp dport { 22, 80, 443 } accept
```

<CehCallout>
Une politique par défaut en DROP (deny-by-default) plutôt qu'en ACCEPT est le principe fondamental du hardening réseau — c'est un point systématiquement vérifié lors d'un audit de configuration.
</CehCallout>

## Durcissement système (hardening)

<AttackDefenseTable rows={[
  { phase: "Accès initial", attack: "Bruteforce SSH sur le port 22 par défaut", defense: "Désactiver l'authentification par mot de passe (clé SSH uniquement) + fail2ban" },
  { phase: "Reconnaissance", attack: "Scan de ports révélant des services inutiles exposés", defense: "Désactiver tout service non indispensable (systemctl disable)" },
  { phase: "Élévation", attack: "Exploitation d'un noyau obsolète", defense: "Politique de mise à jour régulière (unattended-upgrades)" },
]} />

```bash
# Désactiver l'authentification par mot de passe SSH (clé uniquement)
# Dans /etc/ssh/sshd_config
PasswordAuthentication no
PermitRootLogin no

# Installer et configurer fail2ban contre le bruteforce
apt install fail2ban
systemctl enable --now fail2ban
```

<AuditCallout>
La désactivation de l'authentification par mot de passe SSH et la mise en place de fail2ban répondent directement aux exigences du contrôle A.9.4.2 (procédures de connexion sécurisées) de la norme ISO 27001.
</AuditCallout>

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell)

<Steps steps={[
  { title: "Diagnostiquer la configuration réseau", description: "Relève l'adresse IP, la route par défaut et les serveurs DNS.", code: "ip a && ip route && cat /etc/resolv.conf" },
  { title: "Auditer les règles de pare-feu actuelles", description: "Liste les règles iptables en place sur la machine.", code: "iptables -L -n -v" },
  { title: "Mettre en place une politique deny-by-default", description: "Bloque tout le trafic entrant sauf loopback et connexions établies.", code: "iptables -P INPUT DROP && iptables -A INPUT -i lo -j ACCEPT" },
]} />

<WarningCallout>
Applique une politique de pare-feu restrictive uniquement dans l'environnement du lab. Sur une machine distante à laquelle tu accèdes par SSH, une règle DROP mal placée peut te couper l'accès immédiatement.
</WarningCallout>

## Pour aller plus loin

### AppArmor et SELinux : le contrôle d'accès obligatoire

Les permissions Unix classiques (DAC — Discretionary Access Control) laissent le propriétaire d'un fichier libre de ses choix. Les modules de sécurité du noyau comme **AppArmor** (Debian, Ubuntu, Kali) et **SELinux** (RHEL, Fedora) ajoutent une couche de contrôle d'accès obligatoire (MAC) : même root peut se voir refuser une action si elle sort du profil autorisé pour un processus.

```bash
# Vérifier le statut d'AppArmor
aa-status

# Passer un profil en mode "complain" (log sans bloquer) pendant les tests
aa-complain /etc/apparmor.d/usr.sbin.nginx

# Repasser en mode "enforce" (bloquant) une fois validé
aa-enforce /etc/apparmor.d/usr.sbin.nginx
```

<AuditCallout>
Un profil AppArmor/SELinux bien configuré peut contenir les dégâts d'une exploitation applicative : même si un attaquant obtient l'exécution de code dans un service, le profil MAC limite ce qu'il peut faire (fichiers accessibles, appels système autorisés), au-delà des simples permissions Unix.
</AuditCallout>

### Durcissement du noyau via sysctl

Le noyau Linux expose de nombreux paramètres réseau et sécurité ajustables à chaud via `sysctl`, sans recompilation ni redémarrage.

```bash
# Désactiver le routage IP (si la machine n'est pas un routeur)
sysctl -w net.ipv4.ip_forward=0

# Se protéger contre le SYN flooding
sysctl -w net.ipv4.tcp_syncookies=1

# Ignorer les paquets ICMP redirect (protection contre certaines attaques MITM)
sysctl -w net.ipv4.conf.all.accept_redirects=0

# Rendre les changements permanents dans /etc/sysctl.conf
echo "net.ipv4.tcp_syncookies=1" >> /etc/sysctl.conf
sysctl -p
```

<CehCallout>
Ces paramètres `sysctl` réseau font partie des points de contrôle classiques d'un audit de durcissement système (hardening) — des outils comme Lynis ou CIS-CAT les vérifient automatiquement.
</CehCallout>

### Auditer son propre durcissement avec Lynis

Plutôt que de vérifier manuellement chaque point de durcissement, l'outil **Lynis** (préinstallé sur beaucoup d'images Kali, sinon `apt install lynis`) audite automatiquement un système Linux et propose un score de durcissement avec des recommandations priorisées.

```bash
# Lancer un audit complet du système
lynis audit system

# Consulter le rapport détaillé généré
cat /var/log/lynis-report.dat
```

<TipCallout>
Faire tourner Lynis avant et après une phase de durcissement, puis comparer les scores, est une excellente façon de mesurer objectivement les progrès réalisés — et de documenter le travail effectué pour un rapport d'audit.
</TipCallout>

## En résumé

- `iproute2` (ip, ss) remplace progressivement `net-tools` (ifconfig, netstat) sur les distributions modernes.
- Une politique de pare-feu deny-by-default est le principe de base du hardening réseau.
- L'authentification SSH par clé plutôt que par mot de passe, associée à fail2ban, réduit fortement la surface d'attaque.
- Ces mesures rejoignent des exigences de conformité concrètes (ISO 27001, A.9.4.2).

## Questions de Révision

1. Quelle commande moderne remplace `ifconfig` ?
2. Pourquoi une politique de pare-feu "deny-by-default" est-elle recommandée ?
3. Quelles sont les deux mesures principales pour durcir l'accès SSH ?

Félicitations, tu viens de terminer le cours **Linux pour la Cybersécurité** ! Direction le cours **Réseaux Informatiques** pour approfondir les protocoles que tu viens de manipuler.
