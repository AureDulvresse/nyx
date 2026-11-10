---
title: Acquisition de preuves numériques
chapter: 2
course: dfir
difficulty: intermediate
duration: 60
tags: [dfir, acquisition, imagerie, write-blocker, hash, e01, memoire]
ceh_modules: ["Module 7 - Malware Threats"]
objectives:
  - Réaliser une acquisition forensique de disque conforme aux bonnes pratiques
  - Comprendre le rôle d'un write-blocker et du calcul de hash SHA-256
  - Choisir entre acquisition physique, logique et ciblée selon le contexte
  - Choisir un format d'image (brut, E01) et un outil adapté (dc3dd, dcfldd, ewfacquire)
  - Acquérir la mémoire vive et tenir compte des SSD, du chiffrement et du cloud
---

## Introduction

Ce chapitre met en pratique les principes juridiques vus au chapitre 5 du cours Droit et Réglementation, à savoir la chaîne de custody et la recevabilité de la preuve. La question est simple : comment acquérir concrètement une preuve numérique de façon à ce qu'elle reste utilisable, tant techniquement que légalement ?

L'acquisition est l'étape la plus irréversible de toute l'investigation. Une analyse ratée peut se refaire sur la copie ; une acquisition ratée, ou faite en modifiant l'original, ne se rattrape pas. À la fin de ce chapitre, tu sauras choisir le bon type d'acquisition, utiliser un bloqueur d'écriture, produire une image disque scellée par hash avec des outils forensiques, acquérir la mémoire vive, et documenter tout cela dans une fiche de collecte.

## Acquisition physique, logique ou ciblée

### Ce que contient réellement un disque

Pour comprendre la différence entre les types d'acquisition, il faut d'abord comprendre ce qu'un disque contient. Le **système de fichiers** (NTFS, ext4, APFS) tient une sorte d'index qui indique quels blocs appartiennent à quels fichiers. Les blocs qui ne sont attribués à aucun fichier actif forment l'**espace non alloué**. Quand tu supprimes un fichier, le système de fichiers marque généralement ses blocs comme libres, mais n'efface pas leur contenu : celui-ci reste lisible jusqu'à ce que de nouvelles données viennent l'écraser.

Il existe aussi l'**espace résiduel** (*slack space*) : un fichier occupe toujours un nombre entier de clusters, et la fin du dernier cluster peut contenir des restes d'anciennes données. Enfin, certains disques peuvent contenir des zones cachées au système d'exploitation, comme la HPA (*Host Protected Area*) ou la DCO (*Device Configuration Overlay*) sur les disques ATA, parfois utilisées pour dissimuler des données.

<CompareTable
  titleA="Acquisition physique (bit-à-bit)"
  titleB="Acquisition logique"
  rows={[
    { a: "Copie exacte de tout le support, y compris espace non alloué et espace résiduel", b: "Copie des fichiers actifs uniquement, tels que vus par le système de fichiers" },
    { a: "Permet de récupérer des fichiers supprimés par carving", b: "Plus rapide, mais ignore les données supprimées et l'espace non alloué" },
    { a: "Volume égal à la taille du disque, quel que soit le taux de remplissage", b: "Volume égal aux données sélectionnées" },
    { a: "Standard pour une investigation forensique complète", b: "Suffisant pour une réponse à incident rapide, ciblée, ou pour le cloud" },
  ]}
/>

Entre les deux, l'**acquisition ciblée** (ou collecte de triage) récupère uniquement une liste d'artefacts connus : registre, journaux d'événements, Prefetch, table MFT, historique des navigateurs. Des outils comme KAPE ou Velociraptor automatisent cette collecte en quelques minutes par machine. C'est la méthode privilégiée quand l'incident touche des dizaines de postes : on trie d'abord, puis on réalise une acquisition physique complète seulement sur les machines les plus pertinentes.

<CehCallout>
L'espace « non alloué » d'un disque, c'est-à-dire les zones marquées comme libres par le système de fichiers mais dont le contenu n'a pas été effacé physiquement, contient souvent des fragments de fichiers supprimés. C'est précisément ce que capture une acquisition physique et ce que manque une acquisition logique. Question d'examen classique : seule l'acquisition physique permet de récupérer des fichiers supprimés.
</CehCallout>

## Les formats d'image

Une image forensique peut être enregistrée sous plusieurs formats, avec des compromis différents.

| Format | Description | Avantages | Limites |
| --- | --- | --- | --- |
| Brut (raw, `.dd`, `.img`) | Copie octet par octet, sans en-tête | Universel, lisible par tous les outils | Aucune compression, aucune métadonnée intégrée |
| E01 (Expert Witness Format) | Format popularisé par EnCase, géré en open source par libewf | Compression, métadonnées d'affaire, sommes de contrôle par bloc, hash intégré | Format plus complexe, nécessite des outils compatibles |
| AFF4 | Format ouvert moderne, conçu pour les gros volumes et la mémoire | Très performant, extensible | Moins répandu dans les outils courants |

En pratique, l'**E01** est le format le plus utilisé dans les laboratoires, car il embarque le hash de l'acquisition et des informations comme le numéro d'affaire et le nom de l'examinateur. Le format **brut** reste incontournable pour sa simplicité et sa compatibilité.

## Le rôle du write-blocker

Un **bloqueur d'écriture** (*write-blocker*) est un dispositif qui laisse passer les commandes de lecture vers un disque mais bloque toutes les commandes d'écriture. Sans lui, le simple fait de brancher un disque sur un poste peut suffire à le modifier : le système d'exploitation monte automatiquement les volumes, met à jour des dates d'accès, rejoue un journal de système de fichiers, ou écrit des fichiers d'indexation.

<WarningCallout>
Brancher un disque suspect directement sur un poste d'analyse sans write-blocker, même en apparence « juste pour regarder », peut suffire à modifier des métadonnées du système de fichiers. Le montage d'un volume ext4 rejoue par exemple son journal, et Windows peut créer des dossiers système sur un support branché. L'intégrité de la preuve est alors rompue avant même le début de l'analyse.
</WarningCallout>

<Steps steps={[
  { title: "Write-blocker matériel", description: "Un boîtier physique interposé entre le disque suspect et le poste d'analyse (SATA, SAS, NVMe ou USB), qui empêche physiquement toute écriture. C'est la solution de référence en laboratoire." },
  { title: "Write-blocker logiciel", description: "Une configuration système qui empêche l'écriture sur un support : sous Linux, passer le périphérique en lecture seule avec blockdev et monter avec les options ro et noload. Moins fiable qu'une solution matérielle, mais utilisable en dépannage." },
  { title: "Vérification post-acquisition", description: "Calculer immédiatement un hash SHA-256 de l'image obtenue et le comparer, quand c'est possible, avec un hash calculé sur le support original." },
]} />

Sous Linux, la mise en lecture seule logicielle ressemble à ceci. L'option `noload` est importante pour ext3 et ext4 : sans elle, le montage en lecture seule peut quand même rejouer le journal et écrire sur le disque.

```bash
# Identifier le disque suspect (taille, modèle, numéro de série)
lsblk -o NAME,SIZE,MODEL,SERIAL,RO

# Passer le périphérique bloc en lecture seule au niveau du noyau
sudo blockdev --setro /dev/sdb
sudo blockdev --getro /dev/sdb   # doit afficher 1

# Si un montage est nécessaire, toujours en lecture seule et sans rejouer le journal
sudo mount -o ro,noload /dev/sdb1 /mnt/suspect
```

```text
NAME   SIZE MODEL              SERIAL           RO
sda  476.9G Samsung SSD 860    S3Z9NB0K123456A   0
sdb  931.5G WDC WD10EZEX-08W   WD-WCC6Y1234567   1
```

## Produire une image et en vérifier l'intégrité

### Avec dd, l'outil de base

`dd` est l'outil Unix historique de copie bloc par bloc. Il fonctionne partout, mais ne calcule aucun hash et ne journalise rien : tu dois le faire toi-même.

```bash
# Acquisition physique bit-à-bit du disque entier
sudo dd if=/dev/sdb of=/mnt/preuves/INC031_sdb.dd bs=4M status=progress

# Hash immédiatement après l'acquisition
sha256sum /mnt/preuves/INC031_sdb.dd > /mnt/preuves/INC031_sdb.dd.sha256

# Hash de l'original, pour comparaison
sudo sha256sum /dev/sdb

# Vérification ultérieure de l'intégrité de l'image
sha256sum -c /mnt/preuves/INC031_sdb.dd.sha256
```

Les options importantes sont `if` (fichier d'entrée, ici le disque), `of` (fichier de sortie), `bs` (taille de bloc, qui influe sur la vitesse) et `status=progress` (affichage de la progression). Sur un disque abîmé, on voit parfois l'option `conv=noerror,sync`, qui continue malgré les erreurs de lecture et remplit les blocs illisibles de zéros. Elle est à manier avec précaution, car avec une grande taille de bloc, une seule erreur fait perdre tout le bloc. Pour un disque défaillant, **GNU ddrescue** est plus adapté : il lit d'abord les zones saines, puis revient sur les zones difficiles, et tient un fichier de suivi.

### Avec les outils forensiques dc3dd et dcfldd

`dc3dd`, développé par le DoD Cyber Crime Center américain, et `dcfldd` sont des variantes forensiques de dd. Leur avantage principal est de **calculer le hash pendant l'acquisition**, sans étape séparée, et de produire un journal.

```bash
# dc3dd : acquisition avec hash SHA-256 et journal
sudo dc3dd if=/dev/sdb of=/mnt/preuves/INC031_sdb.dd hash=sha256 log=/mnt/preuves/INC031_dc3dd.log

# dcfldd : équivalent, avec écriture du hash dans un fichier dédié
sudo dcfldd if=/dev/sdb of=/mnt/preuves/INC031_sdb.dd hash=sha256 hashlog=/mnt/preuves/INC031_sdb.hash
```

```text
dc3dd started at 2026-03-12 09:31:04 +0000
command line: dc3dd if=/dev/sdb of=/mnt/preuves/INC031_sdb.dd hash=sha256 log=/mnt/preuves/INC031_dc3dd.log
device size: 1953525168 sectors (probed),  1,000,204,886,016 bytes
sector size: 512 bytes (probed)
1000204886016 bytes ( 932 G ) copied ( 100% ), 6702 s, 142 M/s

input results for device `/dev/sdb':
   1953525168 sectors in
   0 bad sectors replaced by zeros
   5e1f0c9a7d...b04c (sha256)

output results for file `/mnt/preuves/INC031_sdb.dd':
   1953525168 sectors out
```

Le journal indique le nombre de secteurs lus, le nombre de secteurs défectueux remplacés par des zéros, et le hash. Il s'archive avec l'image : c'est une pièce de la chaîne de custody.

### Avec ewfacquire, pour le format E01

La suite libewf fournit `ewfacquire`, qui crée une image E01 en demandant les informations de l'affaire, et `ewfverify`, qui recalcule et vérifie le hash stocké dans l'image.

```bash
# Acquisition au format E01 (l'outil pose des questions : numéro d'affaire, examinateur, compression...)
sudo ewfacquire /dev/sdb

# Vérification de l'intégrité d'une image E01
ewfverify /mnt/preuves/INC031_sdb.E01
```

Sous Windows, **FTK Imager** (Exterro) reste un outil gratuit très répandu pour créer des images brutes ou E01 et pour monter une image en lecture seule.

<TipCallout>
Choisis SHA-256 comme empreinte de référence. MD5 et SHA-1 apparaissent encore dans beaucoup d'outils et de procédures anciennes, mais des collisions pratiques ont été démontrées pour les deux. Si une procédure impose encore MD5, calcule SHA-256 en complément et considère-le comme la référence.
</TipCallout>

## Acquérir la mémoire vive

L'acquisition mémoire se fait par définition sur une machine allumée, ce qui en fait une collecte à chaud : l'outil lui-même occupe de la mémoire et modifie légèrement ce qu'il capture. C'est un compromis accepté, à condition de le documenter.

| Système | Outils courants | Remarques |
| --- | --- | --- |
| Windows | WinPmem, DumpIt (Magnet), Magnet RAM Capture, FTK Imager | Lancer depuis un support externe, écrire la sortie sur ce même support |
| Linux | AVML (Microsoft), LiME (module noyau) | AVML est un binaire statique sans module à compiler, pratique en urgence |
| Machine virtuelle | Instantané de l'hyperviseur (fichier `.vmem` sous VMware, par exemple) | Aucune exécution dans l'invité, empreinte minimale |

```bash
# Linux : acquisition mémoire avec AVML (binaire statique), sortie au format LiME
sudo ./avml /mnt/collecte/INC031_mem.lime
sha256sum /mnt/collecte/INC031_mem.lime > /mnt/collecte/INC031_mem.lime.sha256
```

Pense aussi aux artefacts mémoire stockés sur disque : le fichier d'hibernation `hiberfil.sys` et le fichier d'échange `pagefile.sys` sous Windows, ou la partition swap sous Linux, contiennent des fragments de mémoire qui survivent à l'extinction. Le chapitre 3 explique comment analyser un dump mémoire avec Volatility 3.

## Les cas difficiles : SSD, chiffrement, cloud et mobile

### SSD et NVMe

Sur un SSD, le contrôleur gère lui-même l'emplacement physique des données. La commande TRIM, envoyée par le système d'exploitation lors d'une suppression, permet au contrôleur d'effacer les blocs libérés en arrière-plan. Conséquence : les fichiers supprimés sont beaucoup moins souvent récupérables que sur un disque magnétique, et ce qui reste disparaît vite. Acquiers les SSD au plus tôt et ne t'étonne pas de trouver un espace non alloué rempli de zéros.

### Volumes chiffrés

Si le disque est chiffré avec BitLocker, LUKS ou FileVault, une image physique d'une machine éteinte ne contient que des données chiffrées. Si la machine est allumée et le volume déverrouillé, il est souvent préférable de réaliser en plus une **acquisition logique à chaud** du volume monté, et d'acquérir la mémoire vive, qui peut contenir les clés. Pense aussi à récupérer les clés de recouvrement auprès de l'organisation : pour BitLocker, elles sont fréquemment sauvegardées dans Active Directory ou dans Entra ID.

### Cloud et virtualisation

Dans le cloud, tu n'as pas accès au disque physique. L'acquisition passe par les mécanismes du fournisseur : instantané d'un volume (par exemple un snapshot EBS chez AWS), export d'un disque de machine virtuelle, et collecte des journaux de la plateforme (CloudTrail chez AWS, journaux d'activité chez Azure). Le hash se calcule sur l'image exportée, et la chaîne de custody doit mentionner les identifiants de ressource et le compte utilisé pour l'export.

### Téléphones mobiles

L'acquisition mobile est une spécialité à part entière, avec des outils commerciaux dédiés et des niveaux d'extraction (logique, système de fichiers complet, physique) qui dépendent du modèle et de la version du système. Retiens surtout qu'un téléphone saisi doit être isolé des réseaux, par exemple dans une pochette de Faraday, pour empêcher un effacement à distance.

## Documenter l'acquisition : la fiche de collecte

<Steps steps={[
  { title: "Identification du support", description: "Numéro de série, modèle, capacité, état physique, emplacement où il a été trouvé, photographies." },
  { title: "Outil et méthode utilisés", description: "Commande exacte exécutée, version de l'outil, référence du write-blocker utilisé, format de l'image produite." },
  { title: "Hash calculé immédiatement après acquisition", description: "Algorithme et valeur, point de référence pour toute vérification future d'intégrité, avec le hash de l'original quand il a pu être calculé." },
  { title: "Identité du collecteur et horodatage précis", description: "Qui, quand (en UTC), où, en présence de qui : c'est le premier maillon de la chaîne de custody vue au cours Droit et Réglementation." },
]} />

La fiche de collecte décrit l'acquisition, pas le contenu du système. Elle ne contient pas de mots de passe ou d'identifiants du système compromis : ces éléments, s'ils sont nécessaires, sont transmis par un canal séparé et sécurisé. Voici un exemple concis.

```text
FICHE DE COLLECTE — INC-2026-031 — Pièce n° 03
Support       : Disque WDC WD10EZEX, S/N WD-WCC6Y1234567, 1 To, extrait de SRV-WEB-02
Write-blocker : Tableau T35u, S/N 0003a1b2 (matériel)
Outil         : dc3dd (version et commande complète consignées dans INC031_dc3dd.log)
Image         : INC031_sdb.dd (brut), 1 000 204 886 016 octets
SHA-256 image : 5e1f0c9a7d...b04c
SHA-256 disque: 5e1f0c9a7d...b04c (identique)
Collecteur    : A. Mbemba, 2026-03-12 de 09:31Z à 11:23Z, salle serveurs bât. B
Témoin        : R. Okemba (RSSI)
```

## L'angle offensif : comment un attaquant complique l'acquisition

<AttackDefenseTable rows={[
  { phase: "Destruction", attack: "Lancer un effaceur de données (wiper, T1485 et T1561) pour rendre les disques inexploitables", defense: "Isoler rapidement, acquérir en priorité les systèmes les plus sensibles, conserver des sauvegardes hors ligne" },
  { phase: "Dissimulation", attack: "Cacher des données dans la HPA, dans l'espace résiduel ou dans des flux de données alternatifs NTFS", defense: "Acquisition physique complète, vérification de la taille réelle du disque, analyse des flux alternatifs" },
  { phase: "Chiffrement", attack: "Chiffrer ses outils ou utiliser un conteneur chiffré qui se referme à l'extinction", defense: "Acquérir la mémoire avant extinction, acquisition logique à chaud des volumes montés" },
  { phase: "Résidence en mémoire", attack: "Ne rien écrire sur disque pour que l'extinction efface toutes les traces", defense: "Suivre l'ordre de volatilité : la mémoire passe avant le disque" },
]} />

## Erreurs fréquentes

L'erreur la plus grave est d'**oublier le bloqueur d'écriture** ou de monter un volume sans l'option de lecture seule adaptée. Vient ensuite le **hash calculé trop tard**, par exemple après avoir déjà ouvert l'image dans un outil d'analyse, ce qui empêche de prouver que l'image n'a pas changé entre l'acquisition et le premier calcul.

On voit aussi des **images écrites sur le disque suspect lui-même**, ce qui écrase justement l'espace non alloué que l'on voulait préserver, des **supports de destination non stériles** qui contiennent des restes d'anciennes affaires, et des **commandes non consignées**, qu'il devient impossible de justifier ensuite. Enfin, **éteindre une machine chiffrée** avant d'avoir acquis la mémoire ou le volume déverrouillé peut rendre tout le disque définitivement illisible.

## Lab — Mise en pratique

**Environnement** : Kali Linux (terminal Nyx). Tu vas créer un petit « disque » FAT de test contenant un fichier, supprimer ce fichier sans jamais monter le volume (les outils mtools travaillent directement sur l'image, ce qui fonctionne dans un conteneur non privilégié), puis acquérir ce disque comme une vraie preuve et vérifier que le fichier supprimé est toujours présent dans l'image. Sur une vraie station d'analyse, tu utiliserais un write-blocker matériel ou un périphérique loop en lecture seule avec `losetup -r`.

<Steps steps={[
  { title: "Installer les outils", description: "Installe les utilitaires FAT, mtools, dc3dd et The Sleuth Kit. Vérifie ensuite que les commandes répondent.", code: "sudo apt update && sudo apt install -y dosfstools mtools dc3dd sleuthkit\nmkdir -p ~/lab-acq && cd ~/lab-acq\nwhich mkfs.fat mcopy dc3dd fls" },
  { title: "Créer un disque de test", description: "Crée une image FAT de 20 Mo. Ce fichier joue le rôle d'un disque suspect.", code: "mkfs.fat -C disque.img 20480\nfile disque.img\nls -lh disque.img" },
  { title: "Y déposer puis supprimer un fichier", description: "Copie un fichier contenant une phrase repérable dans l'image, liste le contenu, puis supprime le fichier. Il n'apparaît plus dans la liste.", code: "echo 'SECRET-NYX-2026 plan de sortie des donnees' > note.txt\nmcopy -i disque.img note.txt ::/\nmdir -i disque.img ::/\nmdel -i disque.img ::/note.txt\nmdir -i disque.img ::/\nrm note.txt" },
  { title: "Protéger l'original et l'acquérir", description: "Retire les droits d'écriture sur l'original, réalise une acquisition bit-à-bit, puis compare le hash de l'original et celui de l'image : les deux valeurs doivent être identiques.", code: "chmod a-w disque.img\ndd if=disque.img of=preuve.dd bs=4M status=progress\nsha256sum disque.img preuve.dd | tee empreintes.txt" },
  { title: "Essayer un outil forensique", description: "Refais l'acquisition avec dc3dd, qui calcule le hash pendant la copie et écrit un journal. Lis le journal : il contient la commande, la taille copiée et le hash.", code: "dc3dd if=disque.img of=preuve2.dd hash=sha256 log=acq.log\ncat acq.log" },
  { title: "Retrouver le fichier supprimé", description: "Cherche d'abord la phrase dans l'image brute, puis liste les entrées du système de fichiers avec fls. L'entrée marquée d'un astérisque est un fichier supprimé ; icat en extrait le contenu à partir de son numéro d'entrée.", code: "strings -t d preuve.dd | grep SECRET-NYX\nfls -r preuve.dd\n# remplace N par le numéro affiché devant NOTE.TXT\n# icat preuve.dd N" },
  { title: "Rédiger la fiche de collecte", description: "Rédige une fiche de collecte sur le modèle du chapitre : support, outil et version, commande, hash, collecteur, horodatage UTC. Récupère l'heure UTC et la version de dc3dd pour la compléter.", code: "date -u\ndc3dd --version 2>&1 | head -n 1" },
  { title: "Justifier un choix d'acquisition", description: "Raisonnement : une entreprise doit investiguer une fuite de données suspectée sur un poste utilisateur, et il faut examiner l'espace non alloué pour retrouver des fichiers supprimés. Acquisition physique ou logique ? Justifie, puis indique ce qui changerait si le poste avait un SSD chiffré encore allumé." },
]} />

## À retenir

- L'acquisition physique copie tout le support, y compris l'espace non alloué et l'espace résiduel, ce qui permet de récupérer des fichiers supprimés ; l'acquisition logique ne copie que les fichiers actifs.
- L'acquisition ciblée de triage, avec KAPE ou Velociraptor, permet de traiter rapidement un grand nombre de machines avant une acquisition complète des plus pertinentes.
- Un write-blocker, matériel de préférence, empêche toute écriture sur l'original ; sous Linux, blockdev et le montage avec ro et noload en sont l'équivalent logiciel.
- Le hash SHA-256 se calcule immédiatement après l'acquisition ; dc3dd, dcfldd et ewfacquire le calculent pendant la copie et produisent un journal.
- MD5 et SHA-1 sont obsolètes comme empreintes de référence à cause des collisions démontrées.
- La mémoire vive s'acquiert à chaud avec WinPmem, DumpIt, AVML ou LiME, avant toute extinction.
- SSD, chiffrement, cloud et mobiles imposent d'adapter la méthode : acquisition rapide, collecte logique à chaud, instantanés du fournisseur, isolement radio.

## Questions de révision

1. Pourquoi une acquisition physique permet-elle de récupérer des fichiers supprimés là où une acquisition logique ne le permet pas ?
2. Que risque-t-on à analyser un disque suspect sans write-blocker, même en pensant « juste regarder » ?
3. À quel moment précis faut-il calculer le hash d'une image forensique, et pourquoi ?
4. Quel avantage apportent dc3dd ou dcfldd par rapport à dd suivi d'un sha256sum séparé ?
5. Compare les formats brut et E01 : dans quel cas choisirais-tu l'un plutôt que l'autre ?
6. Pourquoi les fichiers supprimés sont-ils plus difficiles à récupérer sur un SSD que sur un disque magnétique ?
7. Face à un ordinateur portable allumé dont le disque est chiffré avec BitLocker, quelle séquence d'acquisition proposerais-tu ?
