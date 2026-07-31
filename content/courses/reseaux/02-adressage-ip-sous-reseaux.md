---
title: Adressage IP et sous-réseaux
chapter: 2
course: reseaux
difficulty: beginner
duration: 45
tags: [réseaux, ip, subnetting, cidr]
ceh_modules: ["Module 03 - Scanning Networks"]
objectives:
  - Comprendre la structure d'une adresse IPv4 et la notation CIDR
  - Calculer un masque de sous-réseau et découper un réseau en sous-réseaux
  - Distinguer adresses privées, publiques et réservées
---

## Introduction

Avant de scanner un réseau, tu dois savoir le lire : combien de machines peut-il contenir, quelle est son adresse de broadcast, quelles adresses sont routables sur Internet. Ce chapitre couvre l'adressage IPv4 et le découpage en sous-réseaux (subnetting) — une compétence directement testée dans la quasi-totalité des certifications réseau et sécurité.

## Structure d'une adresse IPv4

Une adresse IPv4 est composée de 32 bits, représentés en notation décimale pointée (4 nombres de 0 à 255).

```
192.168.1.10
= 11000000.10101000.00000001.00001010
```

La notation CIDR (Classless Inter-Domain Routing) exprime le masque de sous-réseau sous forme d'un nombre de bits réseau : `192.168.1.0/24` signifie que les 24 premiers bits identifient le réseau, et les 8 bits restants les hôtes.

<CompareTable
  titleA="Notation CIDR"
  titleB="Masque décimal / Hôtes disponibles"
  rows={[
    { a: "/24", b: "255.255.255.0 — 254 hôtes utilisables" },
    { a: "/25", b: "255.255.255.128 — 126 hôtes utilisables" },
    { a: "/26", b: "255.255.255.192 — 62 hôtes utilisables" },
    { a: "/30", b: "255.255.255.252 — 2 hôtes utilisables (liaison point-à-point)" },
  ]}
/>

<TipCallout>
Formule à retenir : nombre d'hôtes utilisables = 2^(32 - préfixe) - 2. Les 2 adresses soustraites sont l'adresse réseau (tous les bits hôte à 0) et l'adresse de broadcast (tous les bits hôte à 1), non attribuables à une machine.
</TipCallout>

## Adresses privées et publiques

<CompareTable
  titleA="Plage privée (RFC 1918)"
  titleB="Usage typique"
  rows={[
    { a: "10.0.0.0/8", b: "Grands réseaux d'entreprise" },
    { a: "172.16.0.0/12", b: "Réseaux de taille moyenne" },
    { a: "192.168.0.0/16", b: "Réseaux domestiques et petites entreprises" },
  ]}
/>

Ces plages ne sont jamais routées sur Internet public — elles nécessitent une traduction d'adresse (NAT) pour communiquer vers l'extérieur.

<CehCallout>
Repérer qu'une adresse appartient à une plage privée (RFC 1918) t'indique immédiatement que tu es sur un réseau interne — un signal utile en phase de reconnaissance pour cartographier l'architecture d'une cible.
</CehCallout>

## Calculer un sous-réseau : méthode pratique

<Steps steps={[
  { title: "Identifier le préfixe cible", description: "Exemple : découper 192.168.1.0/24 en 4 sous-réseaux égaux nécessite d'emprunter 2 bits supplémentaires → /26." },
  { title: "Calculer le nombre d'adresses par sous-réseau", description: "Avec un /26, chaque sous-réseau contient 2^(32-26) = 64 adresses (62 utilisables)." },
  { title: "Lister les sous-réseaux obtenus", description: "192.168.1.0/26, 192.168.1.64/26, 192.168.1.128/26, 192.168.1.192/26." },
]} />

```bash
# Calculer rapidement un sous-réseau en ligne de commande
ipcalc 192.168.1.0/26
```

<WarningCallout>
Une erreur de calcul de sous-réseau en environnement réel peut créer des chevauchements d'adresses ou isoler des machines du reste du réseau — vérifie toujours tes calculs avec un outil comme `ipcalc` avant modification d'une configuration en production.
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell)

<Steps steps={[
  { title: "Identifier ton adressage actuel", description: "Relève ton adresse IP et ton masque de sous-réseau.", code: "ip -4 addr show" },
  { title: "Calculer les caractéristiques du réseau", description: "Utilise ipcalc pour obtenir l'adresse réseau, de broadcast et la plage d'hôtes.", code: "ipcalc $(ip -4 addr show | grep -oP '(?<=inet\\s)\\d+(\\.\\d+){3}/\\d+' | head -1)" },
  { title: "Découper un réseau donné", description: "Découpe 10.10.0.0/24 en 4 sous-réseaux égaux et note les plages obtenues.", code: "ipcalc -s 4 10.10.0.0/24" },
]} />

## Pour aller plus loin

### VLSM : des sous-réseaux de tailles différentes

Le subnetting classique découpe un réseau en sous-réseaux de taille identique — mais en pratique, un service compte 100 postes, un autre 10 serveurs, un troisième une seule liaison point-à-point. Le **VLSM (Variable Length Subnet Masking)** permet d'adapter la taille de chaque sous-réseau à son besoin réel, sans gaspiller d'adresses.

```text
Exemple : découper 192.168.1.0/24 selon les besoins réels
- Service A (100 postes)  → 192.168.1.0/25   (126 hôtes utilisables)
- Service B (50 postes)   → 192.168.1.128/26 (62 hôtes utilisables)
- Service C (10 serveurs) → 192.168.1.192/28 (14 hôtes utilisables)
- Liaison routeur-routeur → 192.168.1.208/30 (2 hôtes utilisables)
```

<TipCallout>
Le VLSM est la norme en entreprise : découper systématiquement en sous-réseaux égaux (tous en /26 par exemple) gaspille souvent des centaines d'adresses inutilisées sur les petits segments — un problème d'autant plus critique en IPv4, où l'espace d'adressage reste une ressource limitée.
</TipCallout>

### IPv6 : la notation qui remplace le manque d'adresses IPv4

L'épuisement des adresses IPv4 (32 bits, ~4,3 milliards d'adresses) a motivé IPv6 (128 bits, un espace d'adressage astronomiquement plus grand). Le pentester doit savoir le lire, car de plus en plus d'infrastructures l'activent en parallèle d'IPv4 (dual-stack).

```text
Adresse IPv6 complète :  2001:0db8:0000:0000:0000:ff00:0042:8329
Forme compressée :        2001:db8::ff00:42:8329
```

<CompareTable
  titleA="Élément IPv6"
  titleB="Équivalent / rôle"
  rows={[
    { a: "::1", b: "Équivalent de 127.0.0.1 (loopback)" },
    { a: "fe80::/10", b: "Adresses link-local, auto-configurées, non routées" },
    { a: "::/0", b: "Route par défaut (équivalent de 0.0.0.0/0 en IPv4)" },
]}
/>

<WarningCallout>
Un réseau audité "sécurisé" en IPv4 peut rester totalement exposé en IPv6 si le pare-feu ne filtre que le trafic v4 — un oubli de configuration fréquent, à vérifier systématiquement (`ip -6 addr show`) lors d'un audit réseau.
</WarningCallout>

### Nmap et la notation CIDR : scanner un sous-réseau entier

La maîtrise du CIDR se traduit directement en efficacité opérationnelle : plutôt que de scanner IP par IP, la notation CIDR permet de cibler un sous-réseau entier en une seule commande.

```bash
# Scanner tout un sous-réseau /24 (254 adresses potentielles)
nmap -sn 192.168.1.0/24

# Scanner uniquement une plage précise dans un sous-réseau plus large
nmap -sn 192.168.1.1-50
```

## En résumé

- Une adresse IPv4 fait 32 bits ; la notation CIDR (/24, /26...) exprime le nombre de bits réseau.
- Le nombre d'hôtes utilisables se calcule par 2^(bits hôte) - 2.
- Les plages RFC 1918 (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) sont privées et non routées sur Internet.
- Le subnetting permet de découper un réseau en segments plus petits et mieux isolés.

## Questions de Révision

1. Combien d'hôtes utilisables contient un réseau en /28 ?
2. Pourquoi les adresses 192.168.0.0/16 ne sont-elles jamais routées sur Internet public ?
3. Que représentent l'adresse réseau et l'adresse de broadcast dans un sous-réseau ?
