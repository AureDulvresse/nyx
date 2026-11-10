---
title: Analyse de la mémoire vive avec Volatility
chapter: 3
course: dfir
difficulty: intermediate
duration: 65
tags: [dfir, memoire, volatility3, ram, injection, fileless, rootkit]
ceh_modules: ["Module 7 - Malware Threats"]
objectives:
  - Comprendre pourquoi l'analyse mémoire est indispensable en DFIR moderne
  - Connaître les différences entre Volatility 2 (profils) et Volatility 3 (tables de symboles)
  - Utiliser Volatility 3 pour extraire processus, lignes de commande, connexions réseau et injections
  - Reconnaître les relations parent-enfant normales des processus Windows et repérer les anomalies
  - Identifier des indicateurs de compromission en mémoire et les relier à MITRE ATT&CK
---

## Introduction

Une part croissante des attaques modernes ne laisse quasiment aucune trace sur le disque : malwares dits *fileless*, injections de code dans des processus légitimes, outils de post-exploitation chargés directement en mémoire, scripts PowerShell téléchargés et exécutés à la volée. Pour ces attaques, l'analyse de la mémoire vive est devenue une étape aussi indispensable que l'analyse disque traditionnelle, et souvent plus révélatrice.

La mémoire est aussi l'endroit où tout est « en clair » : les commandes réellement exécutées après décodage, les connexions réseau ouvertes, les clés de chiffrement, parfois des mots de passe. À la fin de ce chapitre, tu sauras ce que contient un dump mémoire, comment l'analyser avec **Volatility 3**, comment reconnaître les processus Windows normaux, et quels indicateurs signalent une compromission. Ce chapitre prépare directement le lab Nyx « Ce Que la Mémoire Se Souvient ».

## Pourquoi la mémoire révèle ce que le disque ne montre pas

<CehCallout>
Un malware « fileless » s'exécute entièrement en mémoire, souvent injecté dans un processus légitime comme powershell.exe ou explorer.exe, sans jamais écrire de fichier exécutable sur le disque. Une analyse disque seule ne trouvera rien, alors qu'un dump mémoire révèle le processus injecté et son code. Pour l'examen, retiens aussi l'ordre de volatilité : la mémoire se collecte avant le disque.
</CehCallout>

<CompareTable
  titleA="Analyse disque seule"
  titleB="Analyse mémoire complémentaire"
  rows={[
    { a: "Trouve les fichiers malveillants persistés", b: "Trouve les processus injectés, connexions réseau actives, clés de chiffrement en mémoire" },
    { a: "Ne révèle rien d'un malware fileless", b: "Révèle l'exécution même si aucun fichier n'a été écrit" },
    { a: "Voit des scripts obfusqués tels qu'ils ont été stockés", b: "Voit souvent les commandes après décodage, telles qu'elles ont été exécutées" },
    { a: "Analyse un état figé après extinction", b: "Capture l'état du système au moment précis de l'incident" },
  ]}
/>

## Ce que contient un dump mémoire

Un dump mémoire est une copie du contenu de la RAM à un instant donné. Il n'est pas organisé comme un disque avec des fichiers : c'est un grand tableau d'octets dans lequel le système d'exploitation a rangé ses propres structures. Tout l'art de l'analyse mémoire consiste à retrouver ces structures et à les interpréter.

Sous Windows, chaque processus est décrit par une structure du noyau appelée **EPROCESS**. Ces structures sont reliées entre elles par une liste doublement chaînée, que le système parcourt pour savoir quels processus existent. Chaque processus possède son propre espace d'adressage virtuel, découpé en régions décrites par des **VAD** (*Virtual Address Descriptors*), avec des droits d'accès : lecture, écriture, exécution. On y trouve aussi la liste des DLL chargées, les **handles** (références vers des fichiers, des clés de registre, des mutex), et les structures réseau qui décrivent les connexions TCP et UDP.

Un outil d'analyse mémoire doit donc savoir à quoi ressemblent ces structures pour la version exacte du système. La taille et la position des champs changent d'une version de Windows à l'autre, parfois d'une mise à jour à l'autre. C'est tout le rôle des profils et des tables de symboles.

## Volatility, l'outil de référence

### De Volatility 2 à Volatility 3

**Volatility** est le framework open source de référence pour l'analyse mémoire, maintenu par la Volatility Foundation. Deux générations coexistent dans la documentation et les formations.

<CompareTable
  titleA="Volatility 2 (obsolète)"
  titleB="Volatility 3 (version actuelle)"
  rows={[
    { a: "Écrit en Python 2, qui n'est plus maintenu", b: "Écrit en Python 3, développé activement" },
    { a: "Nécessite de choisir un profil (option --profile), identifié avec imageinfo ou kdbgscan", b: "Détecte automatiquement la version de Windows et télécharge les tables de symboles correspondantes" },
    { a: "Plugins nommés simplement : pslist, netscan, malfind", b: "Plugins préfixés par le système : windows.pslist, windows.netscan, windows.malfind" },
    { a: "Encore présent dans de vieux tutoriels et sujets de CTF", b: "Version à utiliser pour toute nouvelle investigation" },
  ]}
/>

Dans les deux cas, le principe est le même : **avant d'extraire quoi que ce soit, l'outil doit identifier précisément la version du système d'exploitation**, sinon il interprète mal les structures et produit des résultats incohérents. Avec Volatility 2, cette étape s'appelait l'identification du profil. Avec Volatility 3, elle est automatisée grâce à des **tables de symboles** au format ISF (*Intermediate Symbol Format*) : pour Windows, l'outil les construit à partir des fichiers de symboles publics de Microsoft. Pour Linux et macOS, il faut fournir une table de symboles correspondant exactement au noyau analysé, que l'on génère avec l'outil dwarf2json.

<TipCallout>
Volatility 3 télécharge les symboles Windows depuis le serveur de symboles de Microsoft lors de la première analyse. Sur une station d'analyse isolée d'Internet, prépare à l'avance les packs de symboles proposés par le projet, sinon l'analyse échoue avec un message indiquant qu'aucune table de symboles n'a été trouvée.
</TipCallout>

### Installation et première commande

Volatility 3 s'installe avec pip, idéalement dans un environnement virtuel. Sur l'image Kali de Nyx, il est déjà installé et la commande s'appelle `vol`.

```bash
# Installation dans un environnement virtuel (inutile sur la Kali de Nyx)
python3 -m venv ~/venv-vol && source ~/venv-vol/bin/activate
pip install volatility3

# Toujours commencer par identifier le système du dump
vol -f mem.raw windows.info
```

```text
Volatility 3 Framework 2.x
Progress:  100.00               PDB scanning finished
Variable                Value
Kernel Base             0xf80263400000
Is64Bit                 True
IsPAE                   False
layer_name              0 WindowsIntel32e
NtMajorVersion          10
NtMinorVersion          0
NtBuildLab              19041.1.amd64fre.vb_release.191206-1406
SystemTime              2026-03-12 08:52:41+00:00
```

Le champ `SystemTime` est précieux : c'est l'heure système au moment de l'acquisition, en UTC, qui te servira de point d'ancrage pour la chronologie.

## Une méthode d'analyse en cinq étapes

<Steps steps={[
  { title: "Acquérir le dump mémoire", description: "Réalisé en priorité absolue selon l'ordre de volatilité (chapitre 1), avec les outils vus au chapitre 2, et scellé par un hash SHA-256." },
  { title: "Identifier la version du système", description: "Avec windows.info sous Volatility 3, ou imageinfo pour choisir le profil sous Volatility 2. Sans cette étape, tous les résultats suivants sont suspects." },
  { title: "Lister et cartographier les processus", description: "windows.pslist, windows.pstree et windows.psscan révèlent les processus en cours au moment du dump, y compris ceux masqués aux outils normaux du système compromis." },
  { title: "Examiner les connexions réseau", description: "windows.netscan liste les connexions actives et récemment fermées, révélant une éventuelle communication avec un serveur de commande et contrôle (C2)." },
  { title: "Détecter les injections de code", description: "windows.malfind recherche des régions mémoire exécutables et modifiables qui ne correspondent à aucun fichier sur disque, signe typique d'injection." },
]} />

### Lister les processus : pslist, pstree et psscan

```bash
vol -f mem.raw windows.pslist
vol -f mem.raw windows.pstree
vol -f mem.raw windows.psscan
```

`pstree` présente les processus sous forme d'arbre, ce qui rend les relations parent-enfant immédiatement lisibles. Voici un extrait révélateur :

```text
PID     PPID    ImageFileName   CreateTime
* 4120  3988    explorer.exe    2026-03-12 07:58:10 UTC
** 5532 4120    OUTLOOK.EXE     2026-03-12 08:01:44 UTC
*** 6104 5532   powershell.exe  2026-03-12 08:37:02 UTC
**** 6280 6104  rundll32.exe    2026-03-12 08:37:09 UTC
```

Un client de messagerie qui lance PowerShell, lequel lance rundll32 sept secondes plus tard : ce n'est presque jamais légitime. Cette chaîne évoque une pièce jointe piégée (MITRE ATT&CK T1566.001), l'exécution PowerShell (T1059.001) puis l'exécution indirecte via rundll32 (T1218.011).

`pslist` énumère les processus en suivant la liste chaînée du noyau. Or un rootkit peut **détacher** son processus de cette liste, technique connue sous le nom de DKOM (*Direct Kernel Object Manipulation*) : le processus continue de tourner mais disparaît des outils du système. `psscan`, lui, parcourt la mémoire physique brute à la recherche de toute structure qui ressemble à un EPROCESS, sans se fier à la liste. Un processus présent dans `psscan` mais absent de `pslist` est donc soit un processus terminé dont la structure traîne encore en mémoire (il aura alors une date de fin), soit un processus volontairement dissimulé.

<WarningCallout>
Ne te fie jamais au seul nom d'un processus. Un attaquant nomme volontiers son outil svchost.exe, lsass.exe ou scvhost.exe pour se fondre dans la masse (T1036, Masquerading). Vérifie toujours le processus parent, le chemin de l'exécutable, la ligne de commande et l'heure de création, puis compare avec ce qui est normal.
</WarningCallout>

### Connaître les processus Windows normaux

Pour repérer l'anormal, il faut connaître le normal. Le tableau suivant résume les processus système les plus imités et leurs caractéristiques attendues sur un Windows 10 ou 11.

| Processus | Parent attendu | Nombre d'instances | Points de contrôle |
| --- | --- | --- | --- |
| `smss.exe` | System (PID 4) | Une instance maître | Lancé depuis `C:\Windows\System32` |
| `wininit.exe` | Instance de smss.exe qui s'est terminée | Une | Session 0 |
| `services.exe` | wininit.exe | Une | Parent de tous les svchost.exe légitimes |
| `svchost.exe` | services.exe | Plusieurs | Toujours lancé avec l'option `-k` suivie d'un groupe de services |
| `lsass.exe` | wininit.exe | Une seule | Ne doit jamais avoir de processus enfant |
| `explorer.exe` | userinit.exe, qui se termine ensuite | Une par session ouverte | Lancé depuis `C:\Windows` |

Un `lsass.exe` dont le parent n'est pas wininit.exe, un second lsass.exe, ou un svchost.exe dont le parent est explorer.exe sont des anomalies majeures.

### Lignes de commande, DLL et handles

```bash
vol -f mem.raw windows.cmdline --pid 6104
vol -f mem.raw windows.dlllist --pid 6280
vol -f mem.raw windows.handles --pid 6280
```

```text
PID     Process         Args
6104    powershell.exe  powershell.exe -nop -w hidden -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQA...
```

L'option `-enc` (abréviation de `-EncodedCommand`) indique une commande encodée en Base64, au format UTF-16LE. Combinée à `-nop` (pas de profil) et `-w hidden` (fenêtre cachée), c'est une signature classique d'obfuscation employée par de nombreux malwares. Tu peux décoder la chaîne pour lire la commande réelle :

```bash
echo 'SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQA' | base64 -d | iconv -f UTF-16LE -t UTF-8
```

```text
IEX (New-Object
```

`IEX` (Invoke-Expression) suivi de `New-Object Net.WebClient` est le début typique d'un téléchargement suivi d'une exécution en mémoire.

### Connexions réseau

```bash
vol -f mem.raw windows.netscan
```

```text
Offset          Proto   LocalAddr     LocalPort  ForeignAddr    ForeignPort  State        PID   Owner
0xc50b8a1e2010  TCPv4   10.10.0.15    49822      203.0.113.47   443          ESTABLISHED  6280  rundll32.exe
0xc50b8a3f1a20  TCPv4   10.10.0.15    49790      10.10.0.5      445          CLOSED       4     System
```

Une connexion HTTPS sortante portée par `rundll32.exe`, qui n'a normalement aucune raison de parler à Internet, confirme la piste. L'adresse distante devient un indicateur de compromission à rechercher dans les journaux du pare-feu et du proxy (chapitres 5 et 6). Le plugin `windows.netstat` existe aussi, mais il s'appuie sur les structures actives, alors que `netscan` cherche également des traces de connexions fermées.

### Injections de code avec malfind

```bash
vol -f mem.raw windows.malfind --pid 6280
```

```text
PID   Process        Start VPN       End VPN         Tag   Protection              CommitCharge  PrivateMemory
6280  rundll32.exe   0x1f0a0000      0x1f0b0fff      VadS  PAGE_EXECUTE_READWRITE  17            1

4d 5a 90 00 03 00 00 00 04 00 00 00 ff ff 00 00   MZ..............
b8 00 00 00 00 00 00 00 40 00 00 00 00 00 00 00   ........@.......
```

`malfind` signale les régions mémoire privées, non adossées à un fichier sur disque, qui sont à la fois inscriptibles et exécutables (`PAGE_EXECUTE_READWRITE`). Un code légitime est en général chargé depuis un fichier et protégé en lecture et exécution seulement. Ici, la région commence par `MZ`, la signature d'un exécutable Windows : un programme complet a été écrit dans la mémoire de rundll32. C'est la marque d'une injection de processus (T1055) ou d'un chargement réflexif (T1620). Attention, certains logiciels légitimes, comme les moteurs JavaScript ou les applications .NET, produisent aussi des régions de ce type : chaque résultat doit être examiné.

### Extraire pour analyser plus loin

Volatility peut extraire des fichiers et des régions mémoire pour une analyse ultérieure, par exemple au chapitre 7. Avec Volatility 3, la plupart des plugins acceptent l'option `--dump`, et l'option globale `-o` précise le dossier de sortie.

```bash
mkdir -p extraits
vol -f mem.raw -o extraits windows.malfind --pid 6280 --dump
vol -f mem.raw -o extraits windows.pslist --pid 6280 --dump
sha256sum extraits/*
```

Le plugin `windows.filescan` liste les objets fichier présents en mémoire, et `windows.dumpfiles` permet d'en extraire certains. Les plugins `windows.registry.hivelist` et `windows.registry.printkey` donnent accès aux ruches de registre chargées en mémoire, utiles pour retrouver une clé de persistance.

## Interpréter les résultats : les indicateurs classiques

<CompareTable
  titleA="Indicateur en mémoire"
  titleB="Ce qu'il suggère"
  rows={[
    { a: "Processus enfant inattendu (winword.exe ou outlook.exe lançant powershell.exe)", b: "Exécution de macro malveillante ou exploitation de document" },
    { a: "Connexion réseau vers une IP ou un port inhabituel, portée par un processus qui ne devrait pas communiquer", b: "Communication potentielle avec un serveur de commande et contrôle" },
    { a: "Code exécutable dans une région privée inscriptible (malfind)", b: "Injection de processus ou chargement réflexif" },
    { a: "Ligne de commande encodée en Base64 (option -enc de PowerShell)", b: "Technique classique d'obfuscation utilisée par de nombreux malwares" },
    { a: "Processus visible dans psscan mais absent de pslist, sans date de fin", b: "Dissimulation par un rootkit (DKOM)" },
    { a: "Processus système au mauvais parent ou au mauvais chemin", b: "Usurpation de nom de processus (masquerading)" },
  ]}
/>

## Angle offensif et défensif : la mémoire comme champ de bataille

La mémoire n'intéresse pas que l'enquêteur. Pour un attaquant, le processus `lsass.exe` est une cible de choix, car il conserve des éléments d'authentification des utilisateurs connectés. L'outil Mimikatz, ou un simple dump de lsass suivi d'une analyse hors ligne, permettent d'en extraire des secrets (T1003.001, *LSASS Memory*). C'est l'un des premiers gestes d'un attaquant qui a obtenu des privilèges administrateur, avant de se déplacer latéralement.

<AttackDefenseTable rows={[
  { phase: "Exécution", attack: "Script PowerShell encodé téléchargé et exécuté en mémoire (T1059.001)", defense: "Journalisation des blocs de script PowerShell (Event ID 4104), AMSI, analyse mémoire de powershell.exe" },
  { phase: "Évasion", attack: "Injection de code dans un processus légitime (T1055)", defense: "EDR surveillant les allocations mémoire distantes ; malfind en investigation" },
  { phase: "Dissimulation", attack: "Rootkit qui détache son processus de la liste du noyau (T1014)", defense: "Comparer pslist et psscan ; démarrage sécurisé et signature des pilotes" },
  { phase: "Accès aux identifiants", attack: "Dump de la mémoire de lsass.exe (T1003.001)", defense: "Activer la protection LSA (RunAsPPL) et Credential Guard ; alerter sur tout accès à lsass par un processus inhabituel" },
]} />

Pour Linux, Volatility 3 propose aussi des plugins comme `linux.pslist`, `linux.pstree` et `linux.bash`, ce dernier récupérant l'historique des commandes bash encore présent en mémoire, même si l'attaquant a vidé le fichier d'historique sur disque.

## Erreurs fréquentes

La première erreur est de **lancer les plugins sans avoir vérifié l'identification du système** : avec Volatility 2, un mauvais profil produit des listes vides ou absurdes ; avec Volatility 3, l'absence de symboles adéquats fait échouer les plugins. La deuxième est de **se limiter à pslist**, en oubliant psscan, pstree et malfind, et donc de passer à côté d'un processus caché ou d'une injection.

On voit aussi souvent des analystes **se fier aux noms de processus**, **considérer chaque résultat de malfind comme malveillant** sans tenir compte des faux positifs, ou **oublier que les horodatages de Volatility sont en UTC** et les comparer à des journaux en heure locale. Enfin, **analyser l'original du dump au lieu d'une copie** expose à une corruption accidentelle d'une preuve qu'il est impossible de recapturer.

## Lab — Mise en pratique

**Environnement** : Kali Linux (terminal Nyx), avec Volatility 3 préinstallé. Le lab Nyx « Ce Que la Mémoire Se Souvient » dépose un dump Windows dans `/forensics/` ; tu peux aussi utiliser un dump d'entraînement public issu d'un challenge de forensique mémoire.

<Steps steps={[
  { title: "Préparer une copie de travail", description: "Liste le contenu de /forensics/, copie le dump dans un dossier de travail sous le nom mem.raw (remplace NOM_DU_DUMP par le vrai nom), puis vérifie que les deux hash sont identiques. Tu n'analyseras que la copie.", code: "mkdir -p ~/mem && cd ~/mem\nls -lh /forensics/\ncp /forensics/NOM_DU_DUMP ./mem.raw\nsha256sum /forensics/NOM_DU_DUMP ./mem.raw" },
  { title: "Identifier le système", description: "Lance windows.info. Note la version de Windows et le champ SystemTime, qui sera ton point d'ancrage chronologique en UTC.", code: "vol -f mem.raw windows.info" },
  { title: "Cartographier les processus", description: "Affiche l'arbre des processus et cherche les relations parent-enfant anormales en t'aidant du tableau des processus Windows normaux.", code: "vol -f mem.raw windows.pstree | tee pstree.txt" },
  { title: "Chercher un processus caché", description: "Compare les PID obtenus avec pslist et psscan. Un PID présent uniquement dans psscan, sans date de fin, mérite une investigation.", code: "vol -q -f mem.raw windows.pslist | awk '$1 ~ /^[0-9]+$/ {print $1}' | sort -n > pslist.pid\nvol -q -f mem.raw windows.psscan | awk '$1 ~ /^[0-9]+$/ {print $1}' | sort -n > psscan.pid\ndiff pslist.pid psscan.pid" },
  { title: "Lire les lignes de commande", description: "Affiche les lignes de commande et repère les arguments encodés ou les chemins inhabituels comme AppData ou Temp.", code: "vol -q -f mem.raw windows.cmdline | grep -iE 'enc|temp|appdata|http'" },
  { title: "Examiner le réseau", description: "Liste les connexions et identifie les processus qui communiquent avec des adresses externes. Note chaque adresse suspecte comme indicateur.", code: "vol -q -f mem.raw windows.netscan | grep -vE '0.0.0.0|::' | tee netscan.txt" },
  { title: "Détecter les injections", description: "Lance malfind sur le processus suspect et cherche des régions PAGE_EXECUTE_READWRITE commençant par MZ. Extrais-les et calcule leur hash pour le chapitre 7.", code: "mkdir -p extraits\nvol -q -f mem.raw -o extraits windows.malfind --pid PID_SUSPECT --dump\nsha256sum extraits/*" },
  { title: "Synthétiser", description: "Rédige trois phrases : un fait établi (corroboré par au moins deux plugins), une hypothèse à vérifier sur disque ou dans les journaux, et une technique MITRE ATT&CK associée avec son identifiant." },
]} />

## À retenir

- L'analyse mémoire révèle des malwares fileless, des injections de processus et des connexions actives totalement invisibles sur le disque.
- Volatility 2 et ses profils sont obsolètes ; Volatility 3 identifie automatiquement la version de Windows grâce aux tables de symboles, mais cette identification reste une étape préalable indispensable.
- pslist suit la liste du noyau, psscan parcourt la mémoire brute : un écart entre les deux peut révéler un processus dissimulé par un rootkit.
- La connaissance des relations parent-enfant normales (services.exe parent des svchost.exe, un seul lsass.exe enfant de wininit.exe) permet de repérer l'usurpation de noms.
- Un processus enfant inattendu et une ligne de commande PowerShell encodée comptent parmi les indicateurs les plus fiables et les plus simples à repérer.
- malfind signale les régions privées inscriptibles et exécutables, signe typique d'injection, avec des faux positifs à écarter.
- La mémoire est aussi une cible offensive (dump de lsass, T1003.001) que la protection LSA et Credential Guard aident à défendre.

## Questions de révision

1. Pourquoi un malware fileless échappe-t-il totalement à une analyse disque traditionnelle ?
2. Quelle étape doit précéder l'utilisation des plugins d'extraction, et comment se déroule-t-elle avec Volatility 2 puis avec Volatility 3 ?
3. Que révèle le plugin malfind que pslist ne révèle pas ?
4. Pourquoi psscan peut-il montrer un processus que pslist ne montre pas, et comment distinguer un processus terminé d'un processus caché ?
5. Pourquoi un processus enfant inattendu, comme un lecteur de document lançant un interpréteur de commandes, est-il un indicateur de compromission fiable ?
6. Un svchost.exe a pour parent explorer.exe et tourne depuis le dossier AppData de l'utilisateur. Qu'en conclus-tu et que vérifies-tu ensuite ?
7. Comment décoderais-tu une commande PowerShell passée avec l'option -enc, et pourquoi faut-il préciser l'encodage UTF-16LE ?
