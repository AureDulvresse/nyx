---
title: Rédiger un rapport DFIR et clôturer une investigation
chapter: 8
course: dfir
difficulty: advanced
duration: 60
tags: [dfir, rapport, cloture, retour-experience, ioc, mitre-attack, tlp, post-mortem]
ceh_modules: ["Module 7 - Malware Threats"]
objectives:
  - Structurer un rapport d'investigation DFIR complet adapté à plusieurs publics
  - Distinguer explicitement les faits établis des hypothèses, avec un niveau de confiance
  - Présenter chronologie, vecteur d'accès, portée et indicateurs de façon exploitable (ATT&CK, IOC neutralisés, TLP)
  - Définir les critères de clôture d'une investigation et l'archivage des preuves
  - Conduire un retour d'expérience actionnable centré sur les défaillances de détection
---

## Introduction

Ce dernier chapitre referme le cours en réunissant l'ensemble des compétences précédentes, acquisition, mémoire, disque, journaux, réseau et malware, dans un livrable structuré. Il est directement lié au cours Rédaction de Rapports, dont les principes sont ici appliqués au contexte particulier de l'investigation post-incident.

Le rapport est souvent la seule trace durable d'une investigation. C'est lui que liront la direction pour décider, le service juridique pour évaluer les obligations de notification, l'assureur pour instruire un sinistre, les équipes techniques pour corriger, et parfois un juge des mois plus tard. Une investigation excellente mal restituée perd l'essentiel de sa valeur. À la fin de ce chapitre, tu sauras structurer un rapport DFIR, formuler des conclusions graduées, présenter des indicateurs exploitables, décider quand une investigation peut être close, et conduire un retour d'expérience utile.

## Écrire pour plusieurs publics

Un rapport DFIR s'adresse à des lecteurs aux besoins très différents. La **direction** veut savoir ce qui s'est passé, ce que cela coûte, si c'est terminé et ce qu'il faut décider, en une page. Les **équipes techniques** veulent les détails : machines, comptes, indicateurs, actions de remédiation. Le **service juridique** et le délégué à la protection des données veulent savoir quelles données ont été touchées et à partir de quand l'organisation en a eu connaissance. Un **assureur** ou une **autorité** veut une chronologie fiable et des preuves.

La solution classique consiste à superposer les niveaux : un résumé exécutif court et sans jargon, un corps de rapport structuré, et des annexes techniques détaillées. Chaque lecteur s'arrête au niveau qui le concerne.

<LegalCallout>
Le rapport alimente souvent des obligations légales à délai court : notification d'une violation de données personnelles à l'autorité de contrôle sous 72 heures après en avoir pris connaissance (article 33 du RGPD), alerte précoce sous 24 heures puis notification sous 72 heures pour les entités soumises à NIS2. Les éléments factuels doivent donc être disponibles très tôt, sous forme de points d'étape, sans attendre le rapport final. Ces cadres sont détaillés dans le cours Droit et Réglementation.
</LegalCallout>

## Structurer un rapport d'investigation DFIR

<Steps steps={[
  { title: "Résumé de l'incident", description: "Ce qui s'est passé, quand, quel impact, si la menace est contenue et quelles décisions sont attendues, en une page lisible par une direction non technique." },
  { title: "Périmètre et méthodologie", description: "Questions posées, systèmes examinés, sources de preuve disponibles et manquantes, outils utilisés, limites de l'investigation (rétention insuffisante, machines réinstallées)." },
  { title: "Chronologie complète (timeline)", description: "Reconstruite à partir des sources corroborées (chapitre 5), en UTC, avec un niveau de confiance indiqué pour chaque événement." },
  { title: "Vecteur d'accès initial", description: "Comment l'attaquant est entré, par hameçonnage, exploitation d'une vulnérabilité ou identifiants compromis, avec les preuves qui l'établissent ou l'explication de pourquoi il reste incertain." },
  { title: "Portée de la compromission", description: "Systèmes touchés, comptes utilisés par l'attaquant, données consultées ou exfiltrées, persistances identifiées." },
  { title: "Actions de confinement et d'éradication", description: "Ce qui a été fait, quand, par qui, et comment l'efficacité de ces actions a été vérifiée." },
  { title: "Preuves techniques détaillées", description: "Hash de fichiers malveillants, indicateurs réseau, artefacts identifiés, règles de détection, en annexe technique séparée du résumé, selon le principe vu au cours Rédaction de Rapports, chapitre 2." },
  { title: "Recommandations et retour d'expérience", description: "Ce qui doit changer pour éviter une récidive, au-delà du simple nettoyage immédiat, priorisé et attribué à des responsables." },
]} />

### Rédiger le résumé exécutif

Le résumé exécutif est la partie la plus lue et la plus difficile à écrire. Il répond en quelques paragraphes aux questions que se pose un dirigeant, sans sigles ni identifiants techniques. Voici un exemple :

```text
RÉSUMÉ EXÉCUTIF — INC-2026-031

Le 11 mars 2026 au soir, un attaquant a exploité une faille de l'application web
de catalogue, exposée sur Internet, pour prendre le contrôle du serveur qui
l'héberge. Il a ensuite utilisé un compte de service pour accéder au serveur de
fichiers. L'intrusion a été détectée le 12 mars à 09h41 (heure de Paris) par
l'outil de protection des postes, et contenue le même jour à 10h49.

Aucune preuve d'exfiltration de données personnelles n'a été trouvée. Toutefois,
les journaux réseau ne couvrent que 7 jours : une exfiltration antérieure au
5 mars ne peut pas être exclue.

Décisions attendues : (1) valider la notification préventive à l'autorité de
contrôle préparée avec le DPO ; (2) financer la mise en place d'un pare-feu
applicatif devant les applications exposées ; (3) porter la rétention des
journaux réseau à 90 jours.
```

Remarque que la limite de l'investigation, la rétention de sept jours, figure dans le résumé : la direction doit connaître ce qui n'a pas pu être vérifié, car cela conditionne ses décisions.

## Distinguer faits établis et hypothèses

<CehCallout>
Un rapport DFIR rigoureux distingue explicitement ce qui est un fait établi par une preuve corroborée (par exemple : « le fichier X a été exécuté à 14:32 UTC, confirmé par le Prefetch et l'Event ID 4688 ») de ce qui reste une hypothèse non entièrement confirmée (par exemple : « l'attaquant a probablement exfiltré la base clients, bien qu'aucune preuve directe de transfert ne subsiste »). Mélanger les deux sans le signaler nuit gravement à la crédibilité du rapport en cas de contestation.
</CehCallout>

```text
Exemple de formulation rigoureuse dans un rapport DFIR :

FAIT ÉTABLI : Le compte "svc-backup" a été utilisé pour s'authentifier
sur SRV-02 à 03:14:22 UTC le 12/03/2026 (Event ID 4624, corroboré par
les journaux du pare-feu).

HYPOTHÈSE NON CONFIRMÉE : Il est probable que ce compte ait été compromis
par Kerberoasting, bien qu'aucune demande de ticket de service anormale
n'ait pu être retrouvée dans les journaux disponibles (rétention
insuffisante sur la période concernée).
```

Pour rendre ces nuances lisibles, reprends l'échelle de confiance introduite au chapitre 1 et applique-la de façon cohérente dans tout le rapport :

| Niveau | Définition | Formulation type |
| --- | --- | --- |
| Confirmé | Au moins deux sources indépendantes concordent, sans contradiction | « L'analyse établit que… » |
| Probable | Une source le montre, ou plusieurs indices convergents, sans contradiction | « Il est probable que… » |
| Possible | Cohérent avec les données, sans preuve directe | « Il ne peut être exclu que… » |
| Écarté | Contredit par les données | « L'hypothèse … a été écartée car… » |

<WarningCallout>
Présenter une hypothèse comme un fait établi dans un rapport DFIR, notamment si ce rapport sert de base à une décision juridique, à une déclaration à l'autorité de contrôle ou à une communication publique, expose l'organisation à un risque de crédibilité majeur si l'hypothèse s'avère ensuite incorrecte. L'inverse est aussi dangereux : minimiser un fait établi pour rassurer la direction peut constituer un manquement grave.
</WarningCallout>

## Présenter la chronologie et les techniques

La chronologie du rapport est une version épurée de la chronologie de travail du chapitre 5 : on garde les événements significatifs, en UTC, avec leur source et leur niveau de confiance. Il est très utile d'y associer les techniques **MITRE ATT&CK**, qui offrent un vocabulaire commun avec les équipes de détection et permettent de vérifier, technique par technique, si la défense aurait pu voir l'attaque.

| Phase | Technique ATT&CK | Observation | Détectée ? |
| --- | --- | --- | --- |
| Accès initial | T1190, exploitation d'une application exposée | Injection SQL dans le journal web | Non |
| Persistance | T1505.003, webshell | POST vers un fichier PHP dans le dossier de téléversement | Non |
| Accès aux identifiants | T1003.001, mémoire de LSASS | Accès à lsass.exe par un processus inconnu (télémétrie EDR) | Oui, alerte de faible priorité ignorée |
| Mouvement latéral | T1569.002, exécution de service | 4624 de type 3 puis 7045 sur SRV-FILE-01 | Oui, alerte à l'origine de la détection |
| Effacement de traces | T1070.001, effacement des journaux | Event ID 1102 sur SRV-WEB-02 | Non, pas de règle |

La colonne « Détectée ? » est la plus précieuse pour le retour d'expérience : elle montre exactement où la défense a manqué.

## Les indicateurs de compromission en annexe

L'annexe technique liste les indicateurs de façon exploitable par d'autres équipes : type, valeur, contexte, première et dernière observation. Deux bonnes pratiques s'imposent.

D'abord, on **neutralise** (*defang*) les indicateurs réseau pour éviter qu'un lecteur ne clique dessus par erreur ou qu'un logiciel ne les transforme en liens actifs : `hxxp` au lieu de `http`, et des crochets autour des points, comme `203.0.113[.]47` ou `gate[.]example[.]net`. Ensuite, on indique le niveau de diffusion avec le **TLP** (*Traffic Light Protocol*), dans sa version 2.0 publiée par le FIRST en 2022 : TLP:RED (destinataires nommés uniquement), TLP:AMBER+STRICT (organisation du destinataire uniquement), TLP:AMBER (organisation et ses clients si nécessaire), TLP:GREEN (communauté) et TLP:CLEAR (diffusion libre).

```text
ANNEXE B — Indicateurs de compromission (TLP:AMBER)

Type     Valeur                                    Contexte                    Vu le (UTC)
sha256   9b2c4f...e81d                             Chargeur facture_mars.exe   2026-03-11
ipv4     203.0.113[.]47                            Serveur C2 (HTTPS, 443)     2026-03-11 → 03-12
url      hxxp://203.0.113[.]47/gate.php            Point de contact du C2      2026-03-11
fichier  C:\inetpub\wwwroot\uploads\img_4821.php   Webshell                    2026-03-11
compte   svc-backup                                Compte de service abusé     2026-03-12
```

Pour un partage à grande échelle avec une communauté ou un CERT, ces indicateurs peuvent être exportés au format standard **STIX** ou partagés via une plateforme comme **MISP**.

## Clôturer une investigation

### Les critères de clôture

Une investigation ne se clôt pas parce que l'équipe est fatiguée, mais quand des critères explicites sont remplis. Les principaux sont les suivants : les questions initiales ont reçu une réponse, ou l'on a documenté pourquoi elles ne peuvent pas en recevoir ; toutes les persistances identifiées ont été supprimées ; les comptes compromis ont été réinitialisés, y compris les comptes de service, et, en cas de compromission d'Active Directory, le mot de passe du compte krbtgt a été réinitialisé deux fois ; les systèmes compromis ont été réinstallés ou restaurés depuis une source saine ; une surveillance renforcée, fondée sur les indicateurs de l'incident, n'a révélé aucune nouvelle activité pendant une période convenue.

### Archiver les preuves

Les preuves ne sont pas détruites à la clôture. Elles sont archivées avec leur chaîne de custody close, leurs hash vérifiés une dernière fois, dans un stockage à accès restreint. La durée de conservation dépend des suites possibles : procédure judiciaire, contentieux avec un prestataire, déclaration de sinistre. En cas de procédure annoncée, le service juridique peut imposer une conservation conservatoire (*legal hold*) qui suspend toute destruction.

## Le retour d'expérience

<Steps steps={[
  { title: "Organiser une réunion post-mortem", description: "Rassembler toutes les équipes impliquées, DFIR, SOC, IT, métiers et direction, pour partager la chronologie complète et les enseignements, dans les deux à trois semaines suivant la clôture, tant que les souvenirs sont frais." },
  { title: "Identifier les défaillances de détection", description: "Pourquoi l'incident n'a-t-il pas été détecté plus tôt ? Quel signal aurait dû déclencher une alerte ? Quelle alerte a été émise mais ignorée, et pourquoi ?" },
  { title: "Prioriser les actions correctives", description: "Distinguer ce qui doit être corrigé immédiatement, comme la vulnérabilité exploitée, de ce qui relève d'une amélioration structurelle à plus long terme, comme un modèle d'administration en tiers ou la segmentation." },
  { title: "Mettre à jour les runbooks et les détections", description: "Intégrer les enseignements dans les procédures opérationnelles et transformer les indicateurs comportementaux en règles de détection (lien direct avec le chapitre 4 du cours Rédaction de Rapports)." },
  { title: "Suivre les actions jusqu'au bout", description: "Chaque action a un responsable et une échéance, et son avancement est revu ; un retour d'expérience dont les actions ne sont jamais réalisées n'a servi à rien." },
]} />

Un bon retour d'expérience est **sans recherche de coupable** (*blameless*) : on cherche ce qui, dans les processus, les outils et l'organisation, a permis l'incident, pas qui punir. Si l'analyste qui a ignoré une alerte craint d'être sanctionné, il ne dira pas pourquoi il l'a ignorée, et l'on ne découvrira jamais que cette règle produisait cent faux positifs par jour.

Quelques métriques aident à objectiver les progrès d'un incident à l'autre : le **temps de présence** de l'attaquant (*dwell time*, entre la compromission initiale et la détection), le **temps moyen de détection** (MTTD) et le **temps moyen de réponse ou de rétablissement** (MTTR).

<TipCallout>
Un retour d'expérience qui se contente de conclure « nous avons corrigé la vulnérabilité » sans interroger pourquoi la détection a été tardive rate l'essentiel de la valeur de l'exercice. La question la plus utile après un incident n'est pas seulement « comment est-il entré ? » mais « pourquoi ne l'avons-nous pas vu plus tôt, et qu'est-ce qui nous permettra de le voir la prochaine fois ? ».
</TipCallout>

## Angle offensif et défensif : ce que le rapport doit faire changer

Un attaquant réutilise ce qui a marché. Si le rapport se limite à corriger la faille exploitée, la même équipe adverse reviendra par un autre point d'entrée et utilisera les mêmes techniques de mouvement latéral, que personne n'a appris à détecter. La valeur défensive du rapport tient donc dans sa capacité à généraliser.

<AttackDefenseTable rows={[
  { phase: "Accès initial", attack: "Exploitation d'une application exposée non corrigée (T1190)", defense: "Inventaire des services exposés, correctifs priorisés selon le catalogue CISA KEV et le score EPSS, pare-feu applicatif" },
  { phase: "Identifiants", attack: "Réutilisation d'un compte de service aux droits excessifs (T1078)", defense: "Comptes de service gérés (gMSA), moindre privilège, rotation des secrets, détection des usages anormaux" },
  { phase: "Mouvement latéral", attack: "Exécution à distance par service sur le serveur de fichiers (T1569.002)", defense: "Segmentation, restriction de l'administration à distance, règle Sigma sur 4624 type 3 suivi de 7045" },
  { phase: "Effacement", attack: "Vidage des journaux locaux (T1070.001)", defense: "Centralisation des journaux en temps réel, alerte sur l'Event ID 1102" },
]} />

## Erreurs fréquentes

Les erreurs les plus fréquentes sont de **mélanger faits et hypothèses**, de **taire les limites** de l'investigation, d'écrire un **résumé exécutif truffé de jargon**, et de **livrer des indicateurs non neutralisés** qui deviennent des liens cliquables dans un client de messagerie.

On voit aussi des **chronologies sans fuseau horaire**, des **recommandations vagues** du type « renforcer la sécurité » sans responsable ni échéance, une **clôture prématurée** avant d'avoir vérifié l'absence de nouvelle activité, et des **preuves détruites** à la fin de l'incident alors qu'une procédure judiciaire ou une déclaration de sinistre pouvait encore les exiger.

## Lab — Mise en pratique

**Environnement** : Kali Linux (terminal Nyx). Tu vas préparer les éléments d'un rapport : neutraliser des indicateurs, produire un manifeste d'intégrité des preuves, générer un tableau de chronologie et rédiger les parties clés.

<Steps steps={[
  { title: "Préparer le dossier du rapport", description: "Crée un dossier et un fichier d'indicateurs bruts tels qu'ils sortent de l'analyse.", code: "mkdir -p ~/rapport-inc031 && cd ~/rapport-inc031\nprintf '%s\\n' 'ipv4 203.0.113.47' 'url http://203.0.113.47/gate.php' 'domaine gate.example.net' > ioc_bruts.txt\ncat ioc_bruts.txt" },
  { title: "Neutraliser les indicateurs", description: "Transforme http en hxxp et place les points entre crochets dans les adresses et domaines. Vérifie qu'aucun indicateur n'est plus cliquable.", code: "sed -E 's#http#hxxp#g; s#\\.#[.]#g' ioc_bruts.txt | tee ioc_defang.txt" },
  { title: "Produire un manifeste d'intégrité", description: "Simule trois pièces à conviction, calcule leurs hash dans un manifeste, puis vérifie-le comme tu le ferais à l'archivage final.", code: "mkdir -p preuves && for p in mem.raw disque.dd capture.pcap; do head -c 4096 /dev/urandom > preuves/$p; done\n(cd preuves && sha256sum * > ../MANIFESTE.sha256)\n(cd preuves && sha256sum -c ../MANIFESTE.sha256)" },
  { title: "Générer un tableau de chronologie", description: "Convertis une chronologie au format CSV en tableau lisible, trié par horodatage UTC. Observe que chaque ligne porte une source et un niveau de confiance.", code: "printf '%s\\n' '2026-03-11T22:09:52Z;SRV-WEB-02;access.log;POST vers le webshell;Confirmé' '2026-03-11T22:05:17Z;SRV-WEB-02;access.log;Injection SQL;Confirmé' '2026-03-11T22:32:00Z;SRV-FILE-01;déduction;Mouvement latéral de type PsExec;Probable' > chrono.csv\nsort chrono.csv | column -s ';' -t" },
  { title: "Distinguer fait et hypothèse", description: "Reformule cette phrase pour séparer clairement le fait établi de l'hypothèse, avec un niveau de confiance : « L'attaquant a exploité une injection SQL puis a probablement installé une porte dérobée persistante sur le serveur. » Écris ta version dans le fichier.", code: "nano reformulation.txt" },
  { title: "Rédiger le résumé exécutif", description: "En moins de 200 mots et sans sigle, rédige le résumé exécutif de l'incident du lab : ce qui s'est passé, l'impact, l'état actuel, une limite de l'investigation et deux décisions attendues. Compte les mots.", code: "nano resume_executif.txt\nwc -w resume_executif.txt" },
  { title: "Proposer des questions de retour d'expérience", description: "Raisonnement : l'incident a été détecté six jours après la compromission initiale, et une alerte d'accès à lsass avait été émise puis ignorée. Formule trois questions de retour d'expérience qui vont au-delà de « comment corriger la faille exploitée ? », sans désigner de coupable." },
]} />

## À retenir

- Un rapport DFIR superpose un résumé exécutif sans jargon, un corps structuré (périmètre, chronologie, vecteur, portée, actions, recommandations) et des annexes techniques.
- Distinguer explicitement faits établis et hypothèses, avec une échelle de confiance cohérente, est indispensable à la crédibilité du rapport.
- Les limites de l'investigation, comme une rétention insuffisante, doivent figurer dans le rapport, y compris dans le résumé.
- Associer chaque étape aux techniques MITRE ATT&CK et indiquer si elle a été détectée révèle précisément les lacunes de la défense.
- Les indicateurs sont neutralisés et accompagnés d'un niveau TLP 2.0 ; ils peuvent être partagés en STIX ou via MISP.
- Une investigation se clôt sur des critères explicites, et les preuves sont archivées avec leur chaîne de custody, éventuellement sous conservation conservatoire.
- Le retour d'expérience, sans recherche de coupable, interroge d'abord les défaillances de détection et suit ses actions jusqu'à leur réalisation.

## Questions de révision

1. Pourquoi un rapport DFIR doit-il distinguer explicitement les faits établis des hypothèses non confirmées ?
2. Quel risque concret prend une organisation qui présente une hypothèse comme un fait établi dans un rapport ?
3. Que doit contenir un résumé exécutif, et pourquoi doit-il mentionner les limites de l'investigation ?
4. Où doivent figurer les preuves techniques détaillées, et sous quelle forme présenterais-tu les indicateurs réseau ?
5. Pourquoi la question « pourquoi n'avons-nous pas détecté l'incident plus tôt ? » est-elle souvent plus utile que « comment corriger la faille exploitée ? » ?
6. Quels critères te permettent de déclarer qu'une investigation peut être close ?
7. En quoi un retour d'expérience sans recherche de coupable produit-il de meilleures actions correctives ?

Félicitations, tu viens de terminer le cours **Forensics & DFIR** ! Ces compétences complètent directement le cours Active Directory & Windows (investiguer les attaques que tu as appris à reconnaître) et s'appuient sur le cours Rédaction de Rapports pour produire un livrable crédible. Direction le cours Cryptographie Avancée pour la suite de la roadmap.
