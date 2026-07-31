---
title: Forensique réseau — capture et analyse de trafic
chapter: 6
course: dfir
difficulty: intermediate
duration: 35
tags: [dfir, reseau, wireshark, pcap]
ceh_modules: ["Module 7 - Malware Threats"]
objectives:
  - Comprendre la place du réseau dans une investigation DFIR
  - Analyser une capture réseau pour identifier une exfiltration ou un C2
  - Reconnaître les limites de la forensique réseau face au chiffrement
---

## Introduction

Alors que les chapitres précédents se concentrent sur les artefacts locaux (mémoire, disque, logs), ce chapitre s'intéresse au réseau — souvent la seule source de preuve disponible quand une machine compromise a été réinstallée avant que l'investigation ne commence, ou quand l'objectif est de comprendre l'ampleur d'une exfiltration de données.

## Pourquoi capturer le trafic réseau

<CehCallout>
Contrairement à la mémoire (chapitre 3) ou au disque (chapitre 4), une capture réseau enregistrée en continu (via une sonde ou un NDR — Network Detection and Response) survit même si l'attaquant efface parfaitement toutes ses traces locales sur la machine compromise, car elle est collectée à un point du réseau totalement indépendant du système attaqué.
</CehCallout>

<CompareTable
  titleA="Source de preuve"
  titleB="Résiste à un nettoyage local par l'attaquant ?"
  rows={[
    { a: "Logs locaux de la machine compromise", b: "Non — supprimables par l'attaquant s'il obtient les privilèges suffisants" },
    { a: "Mémoire vive", b: "Non — disparaît au redémarrage" },
    { a: "Capture réseau (sonde externe)", b: "Oui — collectée indépendamment de la machine attaquée" },
]}
/>

## Analyser une capture avec Wireshark

<Steps steps={[
  { title: "Filtrer par hôte suspect", description: "Isoler tout le trafic impliquant une IP interne identifiée comme potentiellement compromise." },
  { title: "Examiner les résolutions DNS suspectes", description: "Des requêtes vers des domaines générés algorithmiquement (DGA) ou récemment enregistrés sont un indicateur de communication C2." },
  { title: "Identifier des volumes de transfert anormaux", description: "Un volume sortant inhabituellement élevé, notamment hors horaires normaux d'activité, suggère une exfiltration de données." },
  { title: "Repérer des balises régulières (beaconing)", description: "Des connexions sortantes à intervalles très réguliers vers la même destination sont caractéristiques d'un malware C2 qui 'appelle la maison' périodiquement." },
]} />

```bash
# Filtres Wireshark utiles pour une investigation
dns and ip.addr == 10.10.0.15          # Requêtes DNS d'un hôte suspect
http.request and ip.src == 10.10.0.15  # Requêtes HTTP sortantes de cet hôte
tcp.analysis.retransmission            # Retransmissions, parfois révélatrices d'un canal instable (tunnel C2 mal implémenté)
```

<TipCallout>
Le "beaconing" — des connexions périodiques régulières (ex: toutes les 60 secondes, à quelques secondes près) — est l'un des signaux les plus fiables de présence d'un malware C2, car un trafic humain normal n'a presque jamais cette régularité mécanique.
</TipCallout>

## Les limites de la forensique réseau face au chiffrement

<WarningCallout>
La quasi-totalité du trafic malveillant moderne transite désormais en HTTPS, rendant l'inspection du contenu impossible sans déchiffrement (lui-même souvent impraticable ou juridiquement encadré) — l'analyste doit alors se rabattre sur des métadonnées observables même chiffrées : volume, timing, destination, certificat TLS utilisé.
</WarningCallout>

<CompareTable
  titleA="Métadonnée exploitable malgré le chiffrement"
  titleB="Ce qu'elle révèle"
  rows={[
    { a: "SNI (Server Name Indication) du handshake TLS", b: "Le nom de domaine visé, même si le contenu de la session reste chiffré" },
    { a: "Empreinte JA3/JA3S du client TLS", b: "Une signature de la bibliothèque TLS utilisée, parfois caractéristique d'un outil offensif connu" },
    { a: "Taille et timing des paquets", b: "Des motifs de trafic (beaconing) même sans lire le contenu" },
]}
/>

## Lab — Mise en Pratique

**Environnement** : Réflexion guidée (sans terminal)

<Steps steps={[
  { title: "Identifier un signal de C2", description: "Une capture réseau montre qu'un poste effectue une requête HTTPS vers la même IP externe toutes les 58 à 62 secondes, 24h/24, y compris la nuit. Que suggère ce motif ?" },
  { title: "Exploiter une métadonnée malgré le chiffrement", description: "Le trafic vers une IP suspecte est entièrement chiffré en TLS. Quelle métadonnée du handshake permettrait malgré tout d'identifier le domaine visé ?" },
]} />

## En résumé

- Une capture réseau collectée par une sonde indépendante résiste à un nettoyage local par l'attaquant, contrairement aux logs et à la mémoire de la machine compromise.
- Volumes anormaux, résolutions DNS suspectes et beaconing régulier comptent parmi les signaux les plus révélateurs en analyse réseau.
- Le chiffrement TLS généralisé limite l'inspection de contenu, mais des métadonnées (SNI, JA3, timing) restent exploitables.

## Questions de Révision

1. Pourquoi une capture réseau collectée par une sonde externe résiste-t-elle à un nettoyage effectué par l'attaquant sur la machine compromise ?
2. Qu'est-ce que le "beaconing" et pourquoi est-ce un indicateur de compromission fiable ?
3. Quelles métadonnées restent exploitables sur un trafic entièrement chiffré en TLS ?
