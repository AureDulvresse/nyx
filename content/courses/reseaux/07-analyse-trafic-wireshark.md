---
title: Analyse de trafic avec Wireshark et tcpdump
chapter: 7
course: reseaux
difficulty: intermediate
duration: 65
tags: [réseaux, wireshark, tshark, tcpdump, bpf, pcap, analyse, détection]
ceh_modules: ["Module 03 - Scanning Networks", "Module 08 - Sniffing"]
objectives:
  - Choisir un point de capture (hôte, port miroir, TAP) et capturer proprement avec tcpdump
  - Écrire des filtres de capture BPF et des filtres d'affichage Wireshark, et savoir lequel utiliser
  - Analyser une capture avec Wireshark et tshark : suivi de flux, statistiques, extraction de champs
  - Reconnaître dans une capture les motifs d'un balayage, d'un trafic en clair, d'une anomalie ARP ou DNS et d'un beaconing
  - Situer l'analyse de paquets par rapport aux journaux de flux et aux outils de détection (Zeek, Suricata)
---

## Introduction

Les journaux d'une application disent ce que l'application a voulu raconter. Une **capture réseau** montre ce qui a réellement circulé sur le fil. C'est pour cela que l'analyse de paquets est une compétence transversale : l'analyste SOC l'utilise pour confirmer ou infirmer une alerte, l'investigateur DFIR pour reconstituer une exfiltration, l'administrateur pour comprendre pourquoi une connexion échoue, et le pentester, dans un cadre autorisé, pour comprendre un protocole ou vérifier qu'une donnée sensible ne passe pas en clair.

Deux outils dominent. **tcpdump** est un capteur en ligne de commande, présent sur presque tous les systèmes Unix, idéal sur un serveur distant. **Wireshark** est un analyseur graphique qui décode plusieurs milliers de protocoles ; sa version en ligne de commande, **tshark**, permet d'automatiser les mêmes analyses. Les deux partagent le format de fichier **pcap** (et son successeur pcapng), si bien que l'on capture souvent avec l'un et que l'on analyse avec l'autre.

À la fin de ce chapitre, tu sauras où et comment capturer, filtrer efficacement avant et après la capture, naviguer dans une capture volumineuse grâce aux statistiques, reconstituer une conversation, extraire des champs pour les analyser en script et reconnaître les motifs de trafic suspects les plus courants.

## Où capturer

### Les points de capture

Une carte réseau ne voit que ce qui arrive jusqu'à elle. Sur un réseau commuté, une machine ne reçoit que son propre trafic et les diffusions : capturer sur ton poste ne te montre donc pas le trafic des autres. Pour observer un segment, il existe trois approches.

| Point de capture | Principe | Avantages et limites |
| --- | --- | --- |
| Sur l'hôte | Capture directement sur la machine concernée | Simple ; ne voit que le trafic de cette machine |
| Port miroir (SPAN) | Le switch copie le trafic d'un ou plusieurs ports ou VLANs vers un port d'analyse | Pas de matériel supplémentaire ; peut perdre des paquets si le lien d'analyse sature |
| TAP réseau | Boîtier inséré physiquement sur un lien, qui duplique tout le trafic | Copie fidèle et passive ; nécessite une coupure pour l'installer |

Le **mode promiscuous** demande à la carte de remonter toutes les trames qu'elle reçoit, même celles qui ne lui sont pas adressées ; il est utile sur un port miroir. En Wi-Fi, il existe un **mode monitor** distinct, qui capture les trames radio elles-mêmes.

### Les droits de capture

Capturer exige des privilèges, car c'est une opération sensible. Plutôt que de lancer Wireshark en root, ce qui exposerait à une faille de l'un de ses très nombreux décodeurs, la bonne pratique consiste à donner les capacités nécessaires au seul programme de capture, **dumpcap**, et à ajouter ton utilisateur au groupe `wireshark`. Wireshark délègue alors la capture à dumpcap et analyse les paquets sans privilège.

```bash
# Debian, Ubuntu, Kali : autoriser les membres du groupe wireshark à capturer
sudo dpkg-reconfigure wireshark-common
sudo usermod -aG wireshark "$USER"     # se déconnecter puis se reconnecter

# Vérifier les capacités accordées à dumpcap
getcap /usr/bin/dumpcap
```

```text
/usr/bin/dumpcap cap_net_admin,cap_net_raw=eip
```

<WarningCallout>
La capture de trafic, même à des fins d'apprentissage, doit se limiter aux réseaux que tu es autorisé à observer. Capturer le trafic d'un réseau public ou d'un tiers sans autorisation est une interception illégale dans la plupart des juridictions ; en France, elle tombe notamment sous l'article 226-15 du Code pénal. En entreprise, la capture doit aussi être encadrée : elle peut contenir des données personnelles soumises au RGPD, et doit être conservée et détruite selon une procédure définie.
</WarningCallout>

## tcpdump : capturer en ligne de commande

### Les options essentielles

```bash
# Lister les interfaces disponibles
tcpdump -D

# Capturer 20 paquets sur toutes les interfaces, sans résolution de noms ni de ports
sudo tcpdump -i any -nn -c 20

# Afficher le contenu en ASCII (utile pour un protocole texte comme HTTP)
sudo tcpdump -i any -nn -A port 80

# Enregistrer dans un fichier pcap pour l'analyser ensuite dans Wireshark
sudo tcpdump -i eth0 -nn -w capture.pcap

# Relire un fichier, avec l'en-tête Ethernet et l'hexadécimal complet
tcpdump -nn -e -XX -r capture.pcap | head -20
```

<CompareTable
  titleA="Option tcpdump"
  titleB="Effet"
  rows={[
    { a: "-i eth0 ou -i any", b: "Interface de capture ; any capture sur toutes les interfaces disponibles" },
    { a: "-n et -nn", b: "Pas de résolution DNS des adresses ; -nn désactive aussi la traduction des ports en noms de services" },
    { a: "-c N", b: "Arrête la capture après N paquets" },
    { a: "-w fichier.pcap", b: "Enregistre la capture dans un fichier au format pcap, lisible par Wireshark" },
    { a: "-r fichier.pcap", b: "Relit un fichier de capture au lieu d'écouter une interface" },
    { a: "-X", b: "Affiche le contenu hexadécimal et ASCII de chaque paquet, à partir de l'en-tête IP" },
    { a: "-XX", b: "Comme -X, mais en incluant l'en-tête Ethernet" },
    { a: "-A", b: "Affiche uniquement le contenu en ASCII lisible, pratique pour du texte en clair comme HTTP" },
    { a: "-e", b: "Affiche l'en-tête de couche 2 : adresses MAC, EtherType, tag VLAN" },
    { a: "-s 0", b: "Capture les paquets entiers ; c'est le comportement par défaut des versions récentes" },
    { a: "-v, -vv", b: "Décodage plus détaillé des en-têtes : TTL, options, sommes de contrôle" },
    { a: "-G 3600 -W 24", b: "Rotation : un nouveau fichier par heure, 24 fichiers au maximum" },
  ]}
/>

La différence entre `-X` et `-A` revient souvent : `-X` montre à la fois l'hexadécimal et sa traduction ASCII, `-A` ne montre que l'ASCII. Pour analyser l'en-tête Ethernet, comme au premier chapitre, utilise `-XX`.

### Les filtres de capture BPF

tcpdump, Wireshark et dumpcap filtrent la capture avec la syntaxe **BPF** (Berkeley Packet Filter). Le filtre est compilé et exécuté dans le noyau : les paquets qui ne correspondent pas ne sont même pas copiés vers le programme, ce qui économise mémoire, disque et processeur.

```bash
# Primitives de base, combinables avec and, or, not
host 10.10.0.10                 # vers ou depuis cette adresse
src net 10.10.0.0/24            # depuis ce réseau
port 53                         # port source ou destination 53
tcp dst port 443                # TCP vers le port 443
icmp or arp                     # ICMP ou ARP
not port 22                     # tout sauf SSH (utile quand on capture via SSH)
vlan 10                         # trames taguées dans le VLAN 10

# Accès aux champs : uniquement les paquets SYN sans ACK, donc les débuts de connexion
'tcp[tcpflags] & (tcp-syn|tcp-ack) == tcp-syn'
```

<TipCallout>
Quand tu captures sur un serveur auquel tu es connecté en SSH, ajoute toujours `not port 22` : sinon, chaque paquet affiché génère du trafic SSH, qui est lui-même capturé, et ta capture se remplit de son propre écho. Sur une interface chargée, applique toujours un filtre de capture le plus tôt possible : capturer tout puis filtrer dans Wireshark produit vite des fichiers de plusieurs gigaoctets.
</TipCallout>

## Wireshark : analyser

### Lire l'interface

L'écran de Wireshark est découpé en trois volets. La **liste des paquets** montre une ligne par paquet avec son numéro, son horodatage, ses adresses, son protocole et un résumé. Le **détail du paquet** décode chaque couche sous forme d'arbre : trame, Ethernet, IP, TCP, puis protocole applicatif ; c'est ici que tu trouves le nom exact de chaque champ, utilisable dans un filtre par un clic droit. Les **octets** montrent le paquet brut en hexadécimal, le champ sélectionné étant surligné. Cette correspondance entre arbre et octets est le meilleur moyen d'apprendre la structure d'un protocole.

### Les filtres d'affichage

Les **filtres d'affichage** utilisent une syntaxe propre à Wireshark, fondée sur les noms de champs des décodeurs. Ils ne modifient pas la capture : ils masquent simplement les paquets qui ne correspondent pas.

<CompareTable
  titleA="Filtre Wireshark"
  titleB="Effet"
  rows={[
    { a: "ip.addr == 10.10.0.10", b: "Trafic vers ou depuis cette adresse IP" },
    { a: "tcp.port == 80", b: "Trafic sur le port TCP 80, en source ou en destination" },
    { a: "http.request", b: "Uniquement les requêtes HTTP" },
    { a: "http.request.method == \"POST\"", b: "Uniquement les requêtes HTTP POST, typiques des envois de formulaires" },
    { a: "tcp.flags.syn == 1 && tcp.flags.ack == 0", b: "Uniquement les paquets SYN initiaux, qui marquent le début d'une connexion" },
    { a: "tcp.flags.reset == 1", b: "Connexions refusées ou interrompues" },
    { a: "dns", b: "Uniquement le trafic DNS" },
    { a: "dns.qry.type == 16", b: "Requêtes DNS de type TXT" },
    { a: "arp.duplicate-address-detected", b: "Une même adresse IP annoncée par deux adresses MAC différentes" },
    { a: "tls.handshake.extensions_server_name contains \"example\"", b: "Connexions TLS dont le SNI contient ce texte" },
    { a: "tcp.analysis.retransmission", b: "Retransmissions TCP, signe de perte ou de congestion" },
  ]}
/>

Les opérateurs `==`, `!=`, `contains`, `matches` (expression régulière), `&&`, `||` et `!` se combinent librement. La barre de filtre devient verte quand la syntaxe est valide et rouge sinon.

### Filtres de capture et filtres d'affichage : ne pas confondre

<CompareTable
  titleA="Filtre de capture (BPF)"
  titleB="Filtre d'affichage (Wireshark)"
  rows={[
    { a: "Appliqué AVANT l'enregistrement des paquets", b: "Appliqué APRÈS, sur une capture déjà enregistrée" },
    { a: "Syntaxe BPF : port 80, host 10.10.0.10", b: "Syntaxe Wireshark : tcp.port == 80, ip.addr == 10.10.0.10" },
    { a: "Réduit la taille du fichier capturé, mais ce qui est exclu est perdu", b: "Ne modifie rien, filtre seulement la vue ; on peut le changer à volonté" },
    { a: "Connaît les en-têtes, pas les protocoles applicatifs", b: "Connaît des milliers de protocoles et leurs champs" },
  ]}
/>

### Suivre un flux TCP

La fonction **Follow TCP Stream**, accessible par clic droit sur un paquet puis Follow, puis TCP Stream, reconstitue l'intégralité d'une conversation TCP dans l'ordre, en colorant différemment ce qu'a envoyé chaque côté. C'est bien plus lisible que de parcourir les paquets un par un, notamment pour relire une session HTTP, un échange SMTP ou un transfert FTP. Wireshark applique au passage un filtre `tcp.stream eq N`, où N est l'index de la conversation. Le même suivi existe pour UDP, TLS (une fois déchiffré) et HTTP/2.

```bash
# Équivalent en ligne de commande : afficher la conversation TCP numéro 0 en ASCII
tshark -r capture.pcap -q -z follow,tcp,ascii,0
```

<CehCallout>
« Follow TCP Stream » est la méthode standard pour lire rapidement une conversation complète, et donc pour constater qu'un identifiant ou un mot de passe est transmis en clair. Côté défense, c'est l'argument le plus parlant pour faire disparaître HTTP, FTP, Telnet et les protocoles d'authentification non chiffrés : une seule capture suffit à le démontrer.
</CehCallout>

### Les statistiques : voir la forêt avant les arbres

Face à une capture de plusieurs milliers de paquets, ne commence jamais par le détail. Le menu **Statistics** donne une vue d'ensemble immédiate. **Protocol Hierarchy** montre la répartition des protocoles : un protocole inattendu saute aux yeux. **Conversations** et **Endpoints** classent les couples de machines et les machines par volume échangé, ce qui révèle un transfert massif. **I/O Graphs** trace le débit dans le temps, pour repérer un pic ou une activité régulière. **Expert Information** résume les anomalies détectées par Wireshark, comme les retransmissions ou les connexions réinitialisées.

### Déchiffrer TLS dans un environnement que tu contrôles

La quasi-totalité du trafic web étant chiffrée, une capture n'en montre que les métadonnées : adresses, SNI, certificats, tailles et horaires. Pour analyser le contenu d'une application que tu développes ou que tu testes, les navigateurs basés sur Chromium et Firefox, ainsi que curl, savent écrire les clés de session dans le fichier désigné par la variable d'environnement **SSLKEYLOGFILE**. Il suffit ensuite d'indiquer ce fichier dans les préférences TLS de Wireshark, champ « (Pre)-Master-Secret log filename ». Ce fichier permet de déchiffrer toutes les sessions qu'il couvre : traite-le comme un secret.

## tshark : la même analyse, en script

**tshark** applique les décodeurs et les filtres de Wireshark en ligne de commande, ce qui permet d'automatiser une analyse ou de traiter des captures sur un serveur sans interface graphique.

```bash
# Vue d'ensemble : informations sur le fichier et hiérarchie des protocoles
capinfos capture.pcap
tshark -r capture.pcap -q -z io,phs

# Conversations IP classées par volume
tshark -r capture.pcap -q -z conv,ip

# Extraire des champs : horodatage, client et nom demandé pour chaque requête DNS
tshark -r capture.pcap -Y 'dns.flags.response == 0' \
  -T fields -e frame.time_relative -e ip.src -e dns.qry.name
```

```text
0.000000000	10.10.0.5	example.com
0.412871000	10.10.0.5	www.example.com
1.087340000	10.10.0.5	api.example.com
```

Les utilitaires livrés avec Wireshark complètent la panoplie : `capinfos` résume un fichier (durée, nombre de paquets, débit), `editcap` découpe ou convertit une capture, `mergecap` fusionne plusieurs fichiers dans l'ordre chronologique.

## Reconnaître un trafic suspect

L'analyse de trafic ne consiste pas à lire chaque paquet, mais à repérer ce qui s'écarte de la normale. Voici les motifs les plus classiques, avec la façon de les isoler.

<AttackDefenseTable rows={[
  { phase: "Reconnaissance", attack: "Rafale de paquets SYN vers de nombreux ports différents en peu de temps, suivis de RST", defense: "Filtre tcp.flags.syn == 1 && tcp.flags.ack == 0, statistiques Conversations ; détection de balayage par l'IDS avec un seuil de connexions par seconde" },
  { phase: "Identifiants en clair", attack: "Authentification HTTP, FTP, Telnet ou POP3 lisible dans le flux", defense: "Follow TCP Stream pour le constater ; migration vers HTTPS, SFTP et SSH" },
  { phase: "Usurpation ARP", attack: "Une même adresse IP annoncée par deux adresses MAC, réponses ARP non sollicitées", defense: "Filtre arp.duplicate-address-detected ; inspection ARP dynamique sur les switches" },
  { phase: "Exfiltration", attack: "Volume sortant anormalement élevé vers une adresse externe inconnue", defense: "Statistics, Conversations triées par octets ; surveillance des flux sortants et alerte sur volumétrie inhabituelle (DLP)" },
  { phase: "Commande et contrôle (C2)", attack: "Requêtes DNS périodiques vers des domaines générés aléatoirement (DGA), ou connexions HTTPS à intervalle régulier (beaconing)", defense: "Analyse des noms demandés, I/O Graph pour repérer la périodicité, listes de réputation issues du renseignement sur la menace" },
  { phase: "Tunnel DNS", attack: "Requêtes très longues, nombreuses et de type TXT vers un même domaine", defense: "Filtre dns.qry.type == 16, longueur et entropie des noms, DNS sortant direct bloqué" },
]} />

Un **DGA** (Domain Generation Algorithm) est un algorithme qui génère chaque jour des centaines de noms de domaine pseudo-aléatoires, dont l'attaquant n'enregistre que quelques-uns ; le malware les essaie tous. Dans une capture, cela se traduit par de nombreuses réponses NXDOMAIN (domaine inexistant) pour des noms sans signification. Le **beaconing** désigne un malware qui contacte son serveur à intervalle régulier ; même chiffré, ce trafic se trahit par sa régularité, visible dans un graphe d'activité.

## Au-delà des paquets : flux et sondes de détection

Capturer tous les paquets en permanence coûte cher en stockage et pose des questions de confidentialité. En production, on combine donc plusieurs niveaux. Les **journaux de flux** (NetFlow, IPFIX, ou VPC Flow Logs dans le cloud) enregistrent seulement qui a parlé à qui, quand, sur quel port et avec quel volume ; ils suffisent souvent à repérer une exfiltration ou un mouvement latéral. **Zeek** transforme le trafic en journaux structurés par protocole (connexions, requêtes DNS, sessions HTTP, certificats TLS), idéaux pour un SIEM. **Suricata** est un moteur de détection et de prévention d'intrusion qui compare le trafic à des signatures. La capture complète, elle, est déclenchée de façon ciblée lors d'une investigation.

<AuditCallout>
Dans ISO/IEC 27001:2022, la surveillance du réseau relève du contrôle A.8.16 (activités de surveillance) et la conservation des journaux du contrôle A.8.15 (journalisation). Un auditeur vérifiera que les captures et journaux réseau ont une durée de conservation définie, un accès restreint et une justification, notamment parce qu'ils contiennent des données personnelles.
</AuditCallout>

## Erreurs fréquentes

La première erreur est de capturer sur son propre poste en espérant voir le trafic des autres : sur un réseau commuté, il faut un port miroir ou un TAP. La deuxième est de confondre les deux syntaxes de filtre, par exemple en tapant `port 80` dans la barre d'affichage de Wireshark ou `tcp.port == 80` dans tcpdump. La troisième est de laisser la résolution de noms activée : tcpdump génère alors ses propres requêtes DNS, qui ralentissent la capture et polluent l'analyse ; utilise `-nn`.

On oublie aussi souvent que l'horodatage d'une capture dépend de l'horloge de la machine : sans synchronisation NTP, corréler une capture avec les journaux d'un SIEM devient hasardeux. Enfin, lancer Wireshark en root, ou conserver indéfiniment des captures contenant des identifiants et des données personnelles, crée un risque bien réel.

## Lab — Mise en pratique

**Environnement** : Kali Linux (terminal Nyx Shell), avec la cible du lab en 10.10.0.10 qui expose un serveur web. Utilise deux terminaux : l'un capture, l'autre génère le trafic.

<Steps steps={[
  { title: "Préparer la capture", description: "Liste les interfaces, puis lance une capture enregistrée dans un fichier, sans résolution de noms et en excluant SSH. Laisse-la tourner pendant les deux étapes suivantes.", code: "tcpdump -D\nsudo tcpdump -i any -nn -w /tmp/lab.pcap 'not port 22'" },
  { title: "Générer du trafic connu", description: "Dans le second terminal, produis une résolution DNS, une requête HTTP en clair contenant un formulaire de test, puis une requête HTTPS. Tu sauras ainsi exactement ce que la capture doit contenir.", code: "dig example.com A +short\ncurl -s -d 'user=demo&password=Test123' http://10.10.0.10/login > /dev/null\ncurl -s https://example.com > /dev/null" },
  { title: "Relire et résumer la capture", description: "Arrête la capture avec Ctrl+C, puis affiche son résumé et la hiérarchie des protocoles. Vérifie que tu retrouves DNS, HTTP et TLS.", code: "capinfos /tmp/lab.pcap | head -12\ntshark -r /tmp/lab.pcap -q -z io,phs" },
  { title: "Constater les données en clair", description: "Affiche la requête POST en ASCII avec tcpdump, puis reconstitue la conversation avec tshark. Le mot de passe de test apparaît en clair : c'est exactement ce que voit quiconque se trouve sur le chemin.", code: "tcpdump -nn -A -r /tmp/lab.pcap 'tcp port 80' | grep -A3 POST\ntshark -r /tmp/lab.pcap -Y http.request -T fields -e tcp.stream\ntshark -r /tmp/lab.pcap -q -z follow,tcp,ascii,0 | head -20" },
  { title: "Comparer avec HTTPS", description: "Pour la connexion HTTPS, extrais le SNI et la version TLS. Constate que tu vois le nom du site mais aucun contenu : c'est la limite de visibilité du défenseur sans déchiffrement.", code: "tshark -r /tmp/lab.pcap -Y tls.handshake.type==1 -T fields -e ip.dst -e tls.handshake.extensions_server_name" },
  { title: "Isoler les débuts de connexion", description: "Isole uniquement les paquets SYN initiaux avec un filtre BPF, puis avec le filtre d'affichage équivalent. Compte les connexions ouvertes : tu dois en trouver une par requête TCP générée.", code: "tcpdump -nn -r /tmp/lab.pcap 'tcp[tcpflags] & (tcp-syn|tcp-ack) == tcp-syn'\ntshark -r /tmp/lab.pcap -Y 'tcp.flags.syn == 1 && tcp.flags.ack == 0' | wc -l" },
  { title: "Extraire les requêtes DNS", description: "Liste chaque requête DNS avec son type. Dans une vraie investigation, c'est ce tableau que tu analyserais pour repérer des noms aléatoires, très longs ou interrogés à intervalle régulier.", code: "tshark -r /tmp/lab.pcap -Y 'dns.flags.response == 0' -T fields -e frame.time_relative -e ip.src -e dns.qry.name -e dns.qry.type" },
  { title: "Analyser dans Wireshark", description: "Si tu disposes d'une interface graphique, ouvre le fichier dans Wireshark. Explore Statistics puis Protocol Hierarchy et Conversations, puis utilise Follow TCP Stream sur la requête HTTP. Supprime enfin la capture, qui contient un mot de passe.", code: "wireshark /tmp/lab.pcap &\n# une fois l'analyse terminée :\nshred -u /tmp/lab.pcap" },
]} />

Extrait attendu à l'étape 4, première commande :

```text
POST /login HTTP/1.1
Host: 10.10.0.10
User-Agent: curl/8.11.1
--
user=demo&password=Test123
```

## À retenir

- Sur un réseau commuté, on capture sur l'hôte, sur un port miroir (SPAN) ou avec un TAP ; dumpcap avec des capacités limitées évite de lancer Wireshark en root.
- tcpdump capture : `-w` enregistre au format pcap, `-r` relit, `-nn` évite la résolution, `-X` montre l'hexadécimal et l'ASCII, `-A` l'ASCII seul, `-XX` et `-e` ajoutent la couche 2.
- Le filtre de capture BPF agit avant l'enregistrement et réduit le fichier ; le filtre d'affichage Wireshark agit après, sur une capture déjà faite.
- Le filtre `tcp.flags.syn == 1 && tcp.flags.ack == 0` isole les débuts de connexion, `dns` isole le trafic DNS, `http.request` les requêtes HTTP.
- Follow TCP Stream reconstitue une conversation ; le menu Statistics (Protocol Hierarchy, Conversations, I/O Graphs) donne la vue d'ensemble à consulter en premier.
- tshark automatise l'analyse : `-Y` pour filtrer, `-T fields -e` pour extraire des champs, `-z` pour les statistiques.
- Balayage, identifiants en clair, anomalies ARP, exfiltration, DGA et beaconing laissent des motifs reconnaissables ; en production, on combine journaux de flux, Zeek, Suricata et capture ciblée.

## Questions de révision

1. Pourquoi une capture lancée sur ton poste ne te montre-t-elle pas le trafic des autres machines d'un réseau commuté, et quelles solutions existent ?
2. Quelle option tcpdump permet d'enregistrer une capture pour l'ouvrir plus tard dans Wireshark, et laquelle permet de la relire ?
3. Quelle est la différence entre les options `-X`, `-XX` et `-A` de tcpdump ?
4. Explique la différence entre un filtre de capture BPF et un filtre d'affichage Wireshark, et donne pour chacun la syntaxe qui isole le port TCP 80.
5. Quel filtre Wireshark isole uniquement les paquets SYN initiaux, et à quoi sert-il en détection ?
6. Face à une capture de plusieurs milliers de paquets, par quelles fonctions de Wireshark commences-tu, et pourquoi ?
7. Quels motifs dans le trafic DNS peuvent indiquer une communication avec un serveur de commande et contrôle ?
8. Pourquoi une capture de trafic HTTPS ne montre-t-elle pas le contenu des échanges, et dans quel cadre peut-on légitimement la déchiffrer ?
