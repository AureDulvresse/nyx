---
title: Forensique réseau — capture et analyse de trafic
chapter: 6
course: dfir
difficulty: intermediate
duration: 60
tags: [dfir, reseau, wireshark, tshark, pcap, zeek, beaconing, tls, ja4]
ceh_modules: ["Module 7 - Malware Threats", "Module 8 - Sniffing"]
objectives:
  - Comprendre la place du réseau dans une investigation DFIR et les différents types de données réseau
  - Capturer du trafic proprement avec tcpdump et sceller la capture
  - Analyser une capture avec Wireshark, tshark et Zeek pour identifier un C2 ou une exfiltration
  - Mesurer la régularité d'un beaconing et reconnaître les anomalies DNS
  - Exploiter les métadonnées TLS (SNI, JA3, JA4) et connaître les limites liées au chiffrement
---

## Introduction

Alors que les chapitres précédents se concentrent sur les artefacts locaux, mémoire, disque et journaux, ce chapitre s'intéresse au **réseau**. C'est souvent la seule source de preuve disponible quand une machine compromise a été réinstallée avant le début de l'investigation, et c'est la source principale pour mesurer l'ampleur d'une exfiltration de données : qu'est-ce qui est sorti, vers où, et en quelle quantité ?

Le réseau a une autre qualité précieuse : il voit toutes les machines à la fois. Une seule capture au bon endroit peut révéler que dix postes contactent le même serveur de commande. À la fin de ce chapitre, tu sauras quelles données réseau collecter, comment capturer proprement, comment analyser une capture avec Wireshark, tshark et Zeek, et comment tirer des conclusions même lorsque le trafic est chiffré.

## Pourquoi le réseau est une source de preuve à part

<CehCallout>
Contrairement à la mémoire (chapitre 3) ou au disque (chapitre 4), une capture réseau enregistrée en continu par une sonde ou un NDR (Network Detection and Response) survit même si l'attaquant efface toutes ses traces locales sur la machine compromise, car elle est collectée à un point du réseau indépendant du système attaqué. Pour l'examen, retiens aussi la différence entre filtre de capture (syntaxe BPF, appliqué pendant l'enregistrement) et filtre d'affichage (syntaxe Wireshark, appliqué à la lecture).
</CehCallout>

<CompareTable
  titleA="Source de preuve"
  titleB="Résiste à un nettoyage local par l'attaquant ?"
  rows={[
    { a: "Journaux locaux de la machine compromise", b: "Non : supprimables par l'attaquant s'il obtient les privilèges suffisants" },
    { a: "Mémoire vive", b: "Non : disparaît au redémarrage" },
    { a: "Capture réseau par une sonde externe", b: "Oui : collectée indépendamment de la machine attaquée" },
    { a: "Journaux du pare-feu, du proxy et du DNS centralisés", b: "Oui, tant que ces équipements ne sont pas eux-mêmes compromis" },
  ]}
/>

## Les différents types de données réseau

Toutes les données réseau n'ont pas le même coût ni la même valeur. On distingue quatre niveaux.

| Type de donnée | Contenu | Volume et rétention | Usage en investigation |
| --- | --- | --- | --- |
| Capture complète (PCAP, PCAPNG) | Tous les paquets, en-têtes et contenu | Très volumineux, quelques jours au mieux | Reconstituer des sessions, extraire des fichiers transférés |
| Flux (NetFlow, IPFIX) | Qui a parlé à qui, quand, combien d'octets, sans contenu | Léger, rétention de plusieurs mois possible | Mesurer une exfiltration, repérer les machines touchées |
| Journaux Zeek | Résumé structuré par protocole : connexions, DNS, HTTP, TLS, fichiers | Intermédiaire | Chasse et corrélation rapides, métadonnées riches |
| Alertes IDS (Suricata, Snort) | Correspondances avec des signatures connues | Faible | Point de départ d'une investigation |

S'y ajoutent les journaux des équipements : pare-feu, proxy web, serveur DNS, VPN. Dans beaucoup d'incidents réels, aucune capture complète n'existe, et ce sont les flux et les journaux DNS et proxy qui permettent de reconstruire l'activité réseau.

**Zeek** (anciennement Bro) mérite une mention particulière. C'est un analyseur de trafic open source qui transforme une capture ou un flux en direct en fichiers de journaux par protocole : `conn.log` pour chaque connexion, `dns.log` pour chaque requête, `http.log`, `ssl.log`, `files.log`. Ces journaux sont beaucoup plus faciles à interroger qu'une capture brute.

## Capturer proprement

### Où capturer

Sur un réseau commuté, une machine ne voit que son propre trafic. Pour observer celui des autres, on utilise un **port miroir** (SPAN) configuré sur le commutateur, qui copie le trafic d'un ou plusieurs ports vers la sonde, ou un **TAP** réseau, un boîtier passif inséré sur le câble, plus fiable car il ne perd pas de paquets sous forte charge. Le point de capture le plus utile est souvent la sortie vers Internet, juste derrière le pare-feu, pour voir toutes les communications externes.

### Avec tcpdump

```bash
# Capture sur l'interface eth0, paquets complets, fichiers tournants de 500 Mo
sudo tcpdump -i eth0 -s 0 -w /mnt/collecte/INC031_%Y%m%d_%H%M.pcap -G 3600 -C 500 -Z root

# Capture limitée à un hôte suspect grâce à un filtre BPF
sudo tcpdump -i eth0 -w suspect.pcap host 10.10.0.15

# Scellement de la capture une fois terminée
sha256sum suspect.pcap > suspect.pcap.sha256
```

L'option `-i` choisit l'interface, `-s 0` capture les paquets en entier, `-w` écrit dans un fichier au lieu d'afficher, `-G` fait tourner le fichier toutes les N secondes et `-C` tous les N millions d'octets. L'expression finale, ici `host 10.10.0.15`, est un **filtre de capture BPF** : seuls les paquets correspondants sont enregistrés. Utilise-le avec prudence en investigation, car ce qui n'est pas capturé est perdu.

<LegalCallout>
Capturer le trafic réseau revient à intercepter des communications qui peuvent contenir des données personnelles et des correspondances privées. Cette collecte doit reposer sur un cadre clair : politique de sécurité connue des utilisateurs, mandat de l'organisation, proportionnalité au besoin de l'investigation, et respect du RGPD vu au chapitre 2 du cours Droit et Réglementation. En pentest ou en lab, ne capture que sur les réseaux couverts par ton autorisation.
</LegalCallout>

## Analyser une capture avec Wireshark et tshark

### La démarche

<Steps steps={[
  { title: "Avoir une vue d'ensemble", description: "Dans Wireshark, les menus Statistiques, Hiérarchie des protocoles et Conversations montrent quels protocoles dominent et quelles paires de machines échangent le plus d'octets." },
  { title: "Filtrer par hôte suspect", description: "Isoler tout le trafic impliquant une adresse interne identifiée comme potentiellement compromise." },
  { title: "Examiner les résolutions DNS", description: "Des requêtes vers des domaines générés algorithmiquement (DGA), récemment enregistrés ou aux sous-domaines anormalement longs sont des indicateurs de C2 ou de tunnel." },
  { title: "Identifier des volumes de transfert anormaux", description: "Un volume sortant inhabituellement élevé, surtout hors des horaires d'activité, suggère une exfiltration de données." },
  { title: "Repérer des connexions régulières (beaconing)", description: "Des connexions sortantes à intervalles très réguliers vers la même destination sont caractéristiques d'un implant C2 qui contacte périodiquement son serveur." },
  { title: "Reconstituer et extraire", description: "Suivre un flux TCP pour lire une session en clair, et exporter les objets HTTP pour récupérer les fichiers transférés, à hacher puis analyser au chapitre 7." },
]} />

### Les filtres d'affichage utiles

Les filtres d'affichage de Wireshark n'ont pas la même syntaxe que les filtres de capture BPF. Voici les plus utiles en investigation :

```text
dns and ip.addr == 10.10.0.15                     Requêtes DNS impliquant un hôte suspect
http.request and ip.src == 10.10.0.15             Requêtes HTTP émises par cet hôte
http.request.method == "POST"                     Envois de données en HTTP
tls.handshake.type == 1                           Messages Client Hello (début de session TLS)
tls.handshake.extensions_server_name contains "cdn"   Sessions TLS dont le SNI contient « cdn »
tcp.flags.syn == 1 and tcp.flags.ack == 0         Tentatives de connexion (balayage, propagation)
!(ip.dst == 10.0.0.0/8) and ip.src == 10.10.0.15  Trafic de l'hôte suspect vers l'extérieur
tcp.analysis.retransmission                       Retransmissions, parfois signe d'un canal instable
```

### tshark, Wireshark en ligne de commande

`tshark` applique les mêmes filtres en ligne de commande, ce qui permet d'automatiser l'analyse et de traiter de gros fichiers.

```bash
# Conversations IP triées par volume
tshark -r capture.pcap -q -z conv,ip

# Domaines demandés en DNS, avec leur nombre d'occurrences
tshark -r capture.pcap -Y "dns.flags.response == 0" -T fields -e dns.qry.name | sort | uniq -c | sort -rn | head

# Destinations TLS et SNI correspondant
tshark -r capture.pcap -Y "tls.handshake.type == 1" -T fields -e ip.dst -e tls.handshake.extensions_server_name | sort | uniq -c
```

```text
     312 a7xk2q9vbn4p.example-cdn.net
      48 www.microsoft.com
      12 login.microsoftonline.com
       3 qw8z1lmc0t7r.example-cdn.net
```

Un nom de domaine qui ressemble à une suite aléatoire de caractères, demandé plus de trois cents fois par un seul poste, mérite une enquête approfondie.

### Zeek, pour passer de la capture aux journaux

```bash
# Analyse d'une capture : Zeek produit conn.log, dns.log, http.log, ssl.log... dans le dossier courant
zeek -r capture.pcap
# Extraire quelques colonnes de conn.log
zeek-cut ts id.orig_h id.resp_h id.resp_p duration orig_bytes resp_bytes < conn.log | head
```

La colonne `orig_bytes` indique le volume envoyé par l'initiateur de la connexion : un poste interne qui envoie plusieurs gigaoctets vers une adresse externe inconnue en une nuit est un candidat sérieux à l'exfiltration (T1041 si elle passe par le canal C2, T1048 si elle passe par un autre protocole).

## Reconnaître les signaux d'un C2 et d'une exfiltration

### Le beaconing

Un implant de commande et contrôle contacte son serveur à intervalles réguliers pour demander des instructions : c'est le **beaconing** (T1071.001 quand il passe par le Web). Les frameworks de C2 ajoutent souvent une variation aléatoire, appelée *jitter*, pour casser cette régularité, mais même avec 10 ou 20 % de variation, le motif reste statistiquement visible sur des milliers de connexions.

<TipCallout>
Le beaconing, des connexions périodiques régulières, par exemple toutes les 60 secondes à quelques secondes près, est l'un des signaux les plus fiables de présence d'un implant C2, car un trafic humain normal n'a presque jamais cette régularité mécanique, surtout la nuit. Attention aux faux positifs : mises à jour logicielles, agents de supervision et synchronisations de messagerie sont aussi réguliers. Compare toujours avec une liste de destinations connues et légitimes.
</TipCallout>

Pour mesurer la régularité, il suffit de calculer l'intervalle entre connexions successives vers la même destination. L'outil open source **RITA** automatise cette analyse sur des journaux Zeek, mais le principe se démontre en quelques lignes :

```bash
# Instants des Client Hello vers une IP suspecte, puis intervalles successifs en secondes
tshark -r capture.pcap -Y "ip.dst == 203.0.113.47 and tls.handshake.type == 1" -T fields -e frame.time_epoch \
  | awk 'NR>1{printf "%.1f\n", $1-prev} {prev=$1}' | sort -n | uniq -c
```

```text
      4 58.7
     11 59.4
     27 60.1
     12 60.8
      3 61.6
```

Presque toutes les connexions sont espacées de 58 à 62 secondes : c'est un beaconing typique avec une faible variation.

### Les anomalies DNS

Le DNS est utilisé de deux manières par les attaquants. D'abord, pour trouver le serveur de C2 grâce à des **algorithmes de génération de domaines** (DGA, T1568.002) : l'implant calcule chaque jour une liste de noms pseudo-aléatoires et l'attaquant n'en enregistre que quelques-uns. On observe alors de nombreuses requêtes vers des domaines inexistants, avec des réponses NXDOMAIN. Ensuite, pour **transporter des données** dans les requêtes elles-mêmes (tunnel DNS, T1071.004) : les sous-domaines sont alors très longs, encodés, et souvent de type TXT. Un nombre anormal de sous-domaines uniques pour un même domaine parent est un indicateur fort.

## Les limites face au chiffrement

<WarningCallout>
La quasi-totalité du trafic malveillant moderne transite en HTTPS, ce qui rend l'inspection du contenu impossible sans déchiffrement, lui-même souvent impraticable ou juridiquement encadré. L'analyste doit alors s'appuyer sur les métadonnées observables même quand le contenu est chiffré : volume, timing, destination, nom de serveur annoncé, empreinte du client TLS, certificat.
</WarningCallout>

<CompareTable
  titleA="Métadonnée exploitable malgré le chiffrement"
  titleB="Ce qu'elle révèle"
  rows={[
    { a: "SNI (Server Name Indication) du Client Hello TLS", b: "Le nom de domaine visé, même si le contenu de la session reste chiffré" },
    { a: "Empreintes JA3 et JA3S", b: "Une signature de la façon dont le client (JA3) et le serveur (JA3S) négocient TLS, parfois caractéristique d'un outil offensif connu" },
    { a: "Empreintes JA4+ (JA4, JA4S, JA4X...)", b: "Successeur de JA3, plus robuste face à la randomisation de l'ordre des extensions TLS par les navigateurs récents" },
    { a: "Certificat du serveur (en TLS 1.2)", b: "Émetteur, date d'émission, certificat auto-signé ou très récent" },
    { a: "Taille et timing des paquets", b: "Des motifs de trafic (beaconing, transferts massifs) même sans lire le contenu" },
  ]}
/>

Deux évolutions réduisent encore la visibilité. En **TLS 1.3**, le certificat du serveur est chiffré et n'est plus lisible dans une capture passive. L'extension **ECH** (*Encrypted Client Hello*), en cours de déploiement, chiffre jusqu'au SNI. De même, le **DNS sur HTTPS** (DoH) fait disparaître les requêtes DNS du trafic visible. Les défenseurs compensent en s'appuyant davantage sur la télémétrie des postes (EDR), sur les journaux du proxy d'entreprise et, quand le cadre légal et la politique interne le permettent, sur une inspection TLS au niveau du proxy.

Dans un lab ou sur une machine que tu contrôles, tu peux déchiffrer ton propre trafic : les navigateurs et curl acceptent la variable d'environnement `SSLKEYLOGFILE`, qui enregistre les clés de session dans un fichier que Wireshark sait ensuite utiliser.

## Angle offensif et défensif

Pourquoi ces techniques fonctionnent-elles ? Parce qu'un réseau d'entreprise laisse généralement sortir le HTTPS et le DNS vers Internet, et que le volume de trafic légitime est énorme : un canal discret se fond dans la masse. La défense consiste à réduire ce qui peut sortir et à rendre visibles les comportements anormaux.

<AttackDefenseTable rows={[
  { phase: "Commande et contrôle", attack: "Canal HTTPS régulier vers un serveur de l'attaquant, parfois derrière un CDN (T1071.001, T1090)", defense: "Analyse statistique du beaconing (RITA, NDR), empreintes JA4, proxy sortant obligatoire avec catégorisation des domaines" },
  { phase: "Résolution du C2", attack: "Domaines générés algorithmiquement (T1568.002)", defense: "Journaliser le DNS, alerter sur les pics de NXDOMAIN, bloquer les domaines très récents" },
  { phase: "Tunnel DNS", attack: "Données encodées dans des sous-domaines (T1071.004)", defense: "Forcer l'usage des résolveurs internes, alerter sur la longueur et l'entropie des noms" },
  { phase: "Exfiltration", attack: "Transfert massif vers un stockage cloud ou par le canal C2 (T1041, T1567)", defense: "Seuils de volume sortant par hôte, journaux de flux, DLP, filtrage sortant restrictif" },
]} />

## Erreurs fréquentes

La première erreur est de **filtrer trop strictement à la capture** : ce qui n'a pas été enregistré est perdu, alors qu'un filtre d'affichage peut toujours être modifié. La deuxième est de **chercher du contenu dans du trafic chiffré** au lieu d'exploiter les métadonnées. La troisième est d'**oublier de sceller la capture** par un hash avant de l'analyser.

On voit aussi des analystes **conclure au C2 sur la seule régularité** sans éliminer les services légitimes, **confondre adresse IP et identité** alors que de nombreux domaines partagent la même adresse derrière un CDN, ou **ignorer le décalage horaire** entre l'horloge de la sonde et celle des machines, ce qui complique la corrélation avec les journaux du chapitre 5.

## Lab — Mise en pratique

**Environnement** : Kali Linux (terminal Nyx). Tu vas générer toi-même un trafic de type beaconing et un envoi volumineux sur l'interface locale, les capturer, puis les analyser comme un enquêteur. Aucun trafic ne sort de ta machine de lab.

<Steps steps={[
  { title: "Installer tshark", description: "Installe tshark en mode non interactif. Vérifie ensuite sa version.", code: "sudo apt update && sudo DEBIAN_FRONTEND=noninteractive apt install -y tshark\ntshark --version | head -n 1\nmkdir -p ~/lab-net && cd ~/lab-net" },
  { title: "Démarrer un serveur local et la capture", description: "Lance un petit serveur web local en arrière-plan, puis démarre une capture sur l'interface loopback limitée au port 8000.", code: "python3 -m http.server 8000 >/dev/null 2>&1 &\nsudo tcpdump -i lo -s 0 -w beacon.pcap 'tcp port 8000' >/dev/null 2>&1 &\nsleep 2" },
  { title: "Simuler un beaconing puis un envoi", description: "Envoie une requête toutes les 5 secondes environ, avec une petite variation aléatoire, puis un envoi POST volumineux qui simule une exfiltration.", code: "for i in $(seq 1 12); do curl -s -o /dev/null -A 'Updater/1.0' http://127.0.0.1:8000/check; sleep $((4 + RANDOM % 3)); done\nhead -c 300000 /dev/urandom > archive.bin\ncurl -s -o /dev/null -X POST --data-binary @archive.bin http://127.0.0.1:8000/upload\nsleep 1; sudo pkill tcpdump; kill %1\nsha256sum beacon.pcap | tee beacon.pcap.sha256" },
  { title: "Vue d'ensemble", description: "Affiche les conversations et la hiérarchie des protocoles. Repère la conversation qui transporte le plus d'octets.", code: "tshark -r beacon.pcap -q -z conv,tcp | head -n 20\ntshark -r beacon.pcap -q -z io,phs" },
  { title: "Lister les requêtes HTTP", description: "Affiche la méthode, l'URI et l'agent utilisateur de chaque requête. Observe la répétition de GET /check et le POST final.", code: "tshark -r beacon.pcap -Y http.request -T fields -e frame.time_relative -e http.request.method -e http.request.uri -e http.user_agent" },
  { title: "Mesurer la régularité", description: "Calcule les intervalles entre requêtes GET successives. Des valeurs groupées entre 4 et 6 secondes trahissent un comportement automatique.", code: "tshark -r beacon.pcap -Y 'http.request.method == \"GET\"' -T fields -e frame.time_epoch | awk 'NR>1{printf \"%.1f\\n\", $1-p} {p=$1}' | sort -n | uniq -c" },
  { title: "Mesurer le volume envoyé", description: "Compare le volume transmis par le client dans la requête POST avec celui des requêtes GET. C'est ce déséquilibre sortant qui signale une exfiltration.", code: "tshark -r beacon.pcap -Y 'http.request' -T fields -e http.request.method -e http.content_length | sort | uniq -c" },
  { title: "Raisonner sur un trafic chiffré", description: "Raisonnement : un poste contacte en HTTPS la même adresse externe toutes les 58 à 62 secondes, 24 heures sur 24. Le contenu est chiffré. Liste les métadonnées que tu exploiterais (SNI, JA3 ou JA4, certificat, volumes), les faux positifs à écarter, et les sources à corréler au chapitre 5." },
]} />

## À retenir

- Une capture réseau collectée par une sonde indépendante résiste au nettoyage local par l'attaquant, contrairement aux journaux et à la mémoire de la machine compromise.
- Captures complètes, flux, journaux Zeek et alertes IDS se complètent ; en pratique, les flux et les journaux DNS et proxy sont souvent les seules données disponibles.
- On capture avec tcpdump depuis un port miroir ou un TAP, on scelle la capture par un hash, et l'on distingue filtre de capture BPF et filtre d'affichage Wireshark.
- Volumes sortants anormaux, anomalies DNS (DGA, tunnel) et beaconing régulier comptent parmi les signaux les plus révélateurs ; la régularité se mesure par les intervalles entre connexions.
- Le chiffrement TLS limite l'inspection du contenu, mais le SNI, les empreintes JA3, JA3S et JA4, les certificats et le timing restent exploitables.
- TLS 1.3, ECH et le DNS sur HTTPS réduisent la visibilité réseau, ce qui renforce le rôle des journaux de proxy et de la télémétrie des postes.

## Questions de révision

1. Pourquoi une capture réseau collectée par une sonde externe résiste-t-elle à un nettoyage effectué par l'attaquant sur la machine compromise ?
2. Qu'est-ce que le beaconing, pourquoi est-ce un indicateur fiable, et quels faux positifs faut-il écarter ?
3. Quelles métadonnées restent exploitables sur un trafic entièrement chiffré en TLS, et quelles évolutions récentes en réduisent la portée ?
4. Écris le filtre Wireshark qui isole les requêtes DNS impliquant l'hôte 10.10.0.15, et explique la différence avec un filtre de capture BPF.
5. Comment distinguerais-tu, dans des journaux DNS, un malware utilisant un DGA d'un tunnel DNS ?
6. Pourquoi les flux NetFlow ou IPFIX sont-ils précieux pour mesurer une exfiltration, alors qu'ils ne contiennent aucun contenu ?
7. Pourquoi l'empreinte JA4 a-t-elle été proposée pour succéder à JA3 ?
