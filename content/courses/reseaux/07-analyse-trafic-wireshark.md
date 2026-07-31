---
title: Analyse de trafic avec Wireshark et tcpdump
chapter: 7
course: reseaux
difficulty: intermediate
duration: 45
tags: [réseaux, wireshark, tcpdump, analyse]
ceh_modules: ["Module 03 - Scanning Networks", "Module 13 - Hacking Web Servers"]
objectives:
  - Capturer du trafic réseau avec tcpdump en ligne de commande
  - Utiliser les filtres Wireshark pour isoler un trafic pertinent
  - Reconnaître des motifs de trafic suspects dans une capture
---

## Introduction

Savoir capturer et lire du trafic réseau est une compétence transversale : elle sert au pentester pour comprendre un protocole propriétaire, à l'analyste SOC pour investiguer un incident, et au développeur pour déboguer une API. Ce chapitre couvre tcpdump (ligne de commande) et les filtres Wireshark (interface graphique, à l'analyse identique).

## tcpdump : capturer en ligne de commande

```bash
# Capturer sur toutes les interfaces, limité à 20 paquets
tcpdump -i any -c 20

# Capturer uniquement le trafic HTTP (port 80)
tcpdump -i any port 80 -A

# Sauvegarder une capture pour analyse ultérieure dans Wireshark
tcpdump -i any -w capture.pcap
```

<CompareTable
  titleA="Option tcpdump"
  titleB="Effet"
  rows={[
    { a: "-i any", b: "Capture sur toutes les interfaces disponibles" },
    { a: "-c N", b: "Limite la capture à N paquets" },
    { a: "-w fichier.pcap", b: "Enregistre la capture dans un fichier au format pcap" },
    { a: "-X", b: "Affiche le contenu hexadécimal et ASCII de chaque paquet" },
    { a: "-A", b: "Affiche le contenu en ASCII lisible (utile pour du texte clair comme HTTP)" },
  ]}
/>

<TipCallout>
Un fichier `.pcap` généré par tcpdump s'ouvre directement dans Wireshark pour une analyse graphique — les deux outils sont complémentaires plutôt que concurrents : capture en ligne de commande sur un serveur distant, analyse fine en local.
</TipCallout>

## Les filtres Wireshark

Wireshark propose un langage de filtre puissant pour isoler le trafic pertinent parmi des milliers de paquets.

<CompareTable
  titleA="Filtre Wireshark"
  titleB="Effet"
  rows={[
    { a: "ip.addr == 10.10.0.10", b: "Trafic vers ou depuis cette adresse IP" },
    { a: "tcp.port == 80", b: "Trafic sur le port TCP 80" },
    { a: "http.request", b: "Uniquement les requêtes HTTP" },
    { a: "tcp.flags.syn == 1 && tcp.flags.ack == 0", b: "Uniquement les paquets SYN (début de connexion)" },
    { a: "dns", b: "Uniquement le trafic DNS" },
]}
/>

<CehCallout>
Filtrer sur `http.request.method == "POST"` combiné à `http contains "password"` est une technique classique pour repérer des identifiants transmis en clair — un rappel direct de l'importance de HTTPS partout.
</CehCallout>

## Reconnaître un trafic suspect

<AttackDefenseTable rows={[
  { phase: "Reconnaissance", attack: "Rafale de paquets SYN vers de nombreux ports différents en peu de temps", defense: "Détection de scan par l'IDS/IPS (seuil de connexions par seconde)" },
  { phase: "Exfiltration", attack: "Volume de trafic sortant anormalement élevé vers une IP externe inconnue", defense: "Surveillance des flux sortants et alerte sur volumétrie inhabituelle (DLP)" },
  { phase: "C2 (Command & Control)", attack: "Requêtes DNS périodiques vers un domaine généré aléatoirement (DGA)", defense: "Détection d'anomalies DNS, blocklists de threat intelligence" },
]} />

<WarningCallout>
La capture de trafic réseau, même à des fins d'apprentissage, doit toujours se limiter à des environnements que tu es autorisé à observer — capturer le trafic d'un réseau public ou d'un tiers sans consentement est illégal dans la plupart des juridictions (voir le chapitre sur le cadre légal du cours Introduction à la Cybersécurité).
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell)

<Steps steps={[
  { title: "Capturer et sauvegarder du trafic", description: "Capture 30 secondes de trafic sur l'interface principale et sauvegarde-le.", code: "timeout 30 tcpdump -i any -w /tmp/capture.pcap" },
  { title: "Filtrer le trafic HTTP en clair", description: "Génère une requête HTTP puis observe son contenu en clair dans la capture.", code: "curl http://10.10.0.10 & tcpdump -i any port 80 -A -c 20" },
  { title: "Identifier les débuts de connexion TCP", description: "Isole uniquement les paquets SYN de ta capture pour repérer les tentatives de connexion.", code: "tcpdump -i any 'tcp[tcpflags] & tcp-syn != 0' -c 10" },
]} />

## Pour aller plus loin

### Filtres de capture vs filtres d'affichage : ne pas confondre

Wireshark et tcpdump distinguent deux moments de filtrage, souvent confondus par les débutants :

<CompareTable
  titleA="Filtre de capture (BPF)"
  titleB="Filtre d'affichage (Wireshark)"
  rows={[
    { a: "Appliqué AVANT l'enregistrement des paquets", b: "Appliqué APRÈS, sur une capture déjà enregistrée" },
    { a: "Syntaxe tcpdump : `port 80`, `host 10.10.0.10`", b: "Syntaxe Wireshark : `tcp.port == 80`, `ip.addr == 10.10.0.10`" },
    { a: "Réduit la taille du fichier capturé", b: "Ne modifie rien, filtre juste la vue" },
]}
/>

<TipCallout>
Sur une interface à fort trafic, toujours appliquer un filtre de capture (BPF) le plus tôt possible — capturer "tout" puis filtrer après dans Wireshark peut générer des fichiers de plusieurs gigaoctets ingérables.
</TipCallout>

### Suivre un flux TCP complet

Wireshark propose la fonctionnalité "Follow TCP Stream" (clic droit sur un paquet) qui reconstitue l'intégralité d'une conversation TCP dans l'ordre, bien plus lisible que de parcourir chaque paquet individuellement — particulièrement utile pour reconstituer une session HTTP complète ou un transfert de fichier FTP.

```bash
# Équivalent en ligne de commande avec tcpflow
tcpflow -i any port 80
```

<CehCallout>
"Follow TCP Stream" est la méthode standard pour extraire rapidement un identifiant/mot de passe transmis en clair lors d'un test d'intrusion — bien plus rapide que de décoder manuellement chaque paquet HTTP individuellement.
</CehCallout>

### Statistiques Wireshark : voir la forêt derrière les arbres

Au-delà de l'analyse paquet par paquet, le menu Statistics de Wireshark (Protocol Hierarchy, Conversations, I/O Graph) donne une vue d'ensemble immédiate d'une capture volumineuse : quels protocoles dominent, quelles machines communiquent le plus, à quel moment un pic de trafic est survenu. C'est souvent le premier réflexe à avoir face à une capture de plusieurs milliers de paquets, avant de plonger dans le détail d'un flux spécifique.

## En résumé

- tcpdump capture du trafic en ligne de commande ; Wireshark permet une analyse graphique du même format `.pcap`.
- Les filtres Wireshark (`ip.addr`, `tcp.port`, `http.request`...) permettent d'isoler rapidement le trafic pertinent.
- Un scan de ports, une exfiltration ou un trafic C2 laissent des motifs identifiables dans une capture.
- Capturer du trafic réseau sans autorisation, même par curiosité, est illégal.

## Questions de Révision

1. Quelle option tcpdump permet de sauvegarder une capture pour l'ouvrir plus tard dans Wireshark ?
2. Quel filtre Wireshark permet d'isoler uniquement les paquets SYN ?
3. Quel motif de trafic DNS peut indiquer une communication avec un serveur de Command & Control ?
