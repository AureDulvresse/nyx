---
title: Réponse à incident — méthodologie complète
chapter: 6
course: cyber-defensive
difficulty: advanced
duration: 60
tags: [reponse-incident, dfir, soc, coordination, crise, rgpd, nis2, dora, nist-800-61r3]
ceh_modules: ["Module 1 - Introduction to Ethical Hacking"]
objectives:
  - Réunir les compétences SOC et DFIR dans une méthodologie de réponse à incident complète
  - Distinguer confinement, éradication et remédiation, et choisir une stratégie de confinement
  - Coordonner SOC, DFIR, direction, juridique et équipes techniques dans une cellule de crise
  - Préserver les preuves selon l'ordre de volatilité pendant le confinement
  - Intégrer dès le début les obligations légales (RGPD, NIS2, DORA) et leurs délais
  - Clôturer un incident par un retour d'expérience qui améliore la détection
---

## Introduction

Ce chapitre réunit, dans une méthodologie de réponse à incident complète, les compétences déjà détaillées séparément aux cours Analyse SOC (playbooks, chapitre 6) et Forensics & DFIR (investigation complète, chapitres 1 à 8).

Le SOC sait trier une alerte et appliquer un playbook ; l'analyste DFIR sait reconstituer une compromission à partir de la mémoire, du disque et des journaux. Mais un incident grave, comme un ransomware ou une compromission de l'annuaire, ne se gère pas avec des compétences isolées. Il faut décider vite avec des informations incomplètes, arbitrer entre la continuité de l'activité et la préservation des preuves, informer la direction, respecter des délais légaux et coordonner des dizaines de personnes sous pression. Les organisations qui s'en sortent le mieux ne sont pas forcément les plus outillées : ce sont celles qui avaient préparé et répété leur réponse.

À la fin de ce chapitre, tu sauras dérouler une réponse à incident de bout en bout, choisir une stratégie de confinement, organiser la coordination entre équipes, identifier les obligations légales et leurs délais, et conduire un retour d'expérience utile.

## Les cadres de référence

Deux référentiels structurent le métier. Le **NIST SP 800-61**, dans sa révision 3 publiée en avril 2025, ne présente plus la réponse à incident comme un cycle isolé en quatre phases, mais l'intègre dans les six fonctions du NIST CSF 2.0 : la préparation relève de Govern, Identify et Protect, la gestion de l'incident de Detect et Respond, et le rétablissement de Recover. L'ancien modèle de la révision 2, préparation, détection et analyse, confinement éradication et rétablissement, puis activité post-incident, reste très utilisé dans les formations et les examens. Le **SANS** propose un découpage voisin en six étapes, souvent résumé par l'acronyme PICERL : préparation, identification, confinement, éradication, rétablissement et retour d'expérience.

En France, l'ANSSI publie des guides de gestion de crise d'origine cyber et qualifie des prestataires de réponse aux incidents, dits PRIS. Le CERT-FR et les CSIRT régionaux peuvent accompagner les victimes.

## Une méthodologie de réponse à incident réunie

```mermaid
graph LR
    A[Détection - SIEM/EDR, ch.5] --> B[Triage SOC - cours Analyse SOC]
    B --> C[Confinement immédiat - playbook, ch.6 SOC]
    C --> D[Investigation approfondie - cours DFIR]
    D --> E[Éradication et remédiation]
    E --> F[Retour d'expérience - post-mortem]
```

Ce schéma présente l'enchaînement logique : la détection, vue au chapitre 5, produit une alerte ; le triage SOC confirme qu'il s'agit d'un vrai incident et en évalue la gravité ; le confinement immédiat stoppe la propagation ; l'investigation approfondie détermine l'étendue réelle ; l'éradication et la remédiation suppriment la cause et corrigent durablement ; le retour d'expérience améliore la défense. Dans la réalité, ces étapes se chevauchent : l'investigation révèle souvent de nouvelles machines compromises, qui exigent un nouveau confinement.

<CehCallout>
Rappel du cours Forensics & DFIR (chapitre 1) : confinement, éradication et remédiation sont trois temporalités distinctes — le confinement stoppe la propagation immédiatement, l'éradication supprime la cause, la remédiation corrige durablement pour éviter la récidive.
</CehCallout>

### La préparation : tout se joue avant l'incident

La préparation conditionne tout le reste. Elle comprend un plan de réponse à incident approuvé par la direction, avec des rôles nommés et des suppléants. Elle comprend aussi une échelle de gravité partagée, des listes de contacts à jour, y compris hors des outils de l'entreprise, des playbooks pour les scénarios les plus probables, des accès d'urgence testés, et éventuellement un contrat avec un prestataire de réponse à incident pour ne pas négocier un contrat en pleine crise.

Un point est souvent oublié : le **canal de communication hors bande**. Si l'attaquant contrôle l'annuaire, il peut lire la messagerie et la messagerie instantanée de l'entreprise. La cellule de crise doit pouvoir basculer sur un canal indépendant préparé à l'avance.

| Gravité | Exemple | Qui est mobilisé | Délai de prise en charge |
| --- | --- | --- | --- |
| Faible | Logiciel indésirable bloqué sur un poste | SOC | Dans la journée |
| Moyenne | Compte utilisateur compromis sans élévation | SOC et équipe technique | Moins de 4 heures |
| Élevée | Serveur compromis, données potentiellement exposées | SOC, DFIR, RSSI, juridique | Moins d'une heure |
| Critique | Ransomware actif, compromission de l'annuaire | Cellule de crise complète, direction générale | Immédiat |

### Le confinement : arrêter la propagation sans détruire les preuves

Le confinement est la décision la plus délicate. Il existe plusieurs stratégies. Le **confinement court terme** isole immédiatement les machines ou les comptes touchés : isolement réseau par l'EDR, désactivation du compte, révocation des sessions et des jetons, blocage d'une adresse à la périphérie. Le **confinement long terme** met en place des mesures provisoires qui permettent à l'activité de reprendre partiellement pendant l'investigation, par exemple une segmentation d'urgence ou un serveur reconstruit dans un réseau isolé.

Dans certains cas, l'équipe peut choisir l'**observation contrôlée** : laisser l'attaquant actif quelques heures sous surveillance étroite, pour comprendre son étendue avant d'agir partout en même temps. Confiner une seule machine alerte l'attaquant, qui peut alors accélérer ou détruire ses traces ailleurs. Cette option exige une équipe expérimentée et un accord explicite de la direction ; face à un ransomware en cours de propagation, elle n'est pas envisageable.

<WarningCallout>
Éteindre brutalement une machine compromise détruit la mémoire vive, qui contient souvent les preuves les plus précieuses : processus malveillants, connexions actives, clés de chiffrement. Sauf urgence absolue, privilégie l'isolement réseau, qui stoppe la propagation tout en gardant la machine allumée pour l'acquisition. Ne lance jamais d'antivirus de nettoyage ni de réinstallation avant d'avoir collecté les preuves.
</WarningCallout>

### Préserver les preuves pendant le confinement

L'acquisition suit l'ordre de volatilité décrit dans la RFC 3227 : on collecte d'abord ce qui disparaît le plus vite. Les registres et la mémoire vive viennent en premier, puis l'état du réseau et des processus, ensuite les fichiers temporaires, puis le disque, enfin les journaux distants et les sauvegardes. Chaque élément collecté est horodaté, haché et consigné dans une chaîne de custody, qui retrace qui a manipulé quoi et quand.

Sur une machine Linux isolée, une collecte de premier niveau peut ressembler à ceci, en écrivant sur un support externe et non sur le disque de la machine.

```bash
OUT=/mnt/collecte/srv-web01_$(date -u +%Y%m%dT%H%M%SZ); mkdir -p "$OUT"
date -u                      > "$OUT/date_utc.txt"     # référence temporelle
ss -tanp                     > "$OUT/connexions.txt"   # connexions TCP et processus associés
ps auxwwf                    > "$OUT/processus.txt"    # arbre des processus, lignes complètes
ls -l /proc/*/exe 2>/dev/null > "$OUT/binaires_proc.txt"  # repère les binaires supprimés mais actifs
last -F                      > "$OUT/connexions_utilisateurs.txt"
# Mémoire vive avec AVML (outil libre de Microsoft), avant tout redémarrage
sudo ./avml "$OUT/memoire.lime"
sha256sum "$OUT"/* > "$OUT/empreintes.sha256"
```

```text
State  Recv-Q Send-Q Local Address:Port   Peer Address:Port   Process
ESTAB  0      0      10.0.30.15:43822     203.0.113.47:443    users:(("kworkerd",pid=31337,fd=5))
ESTAB  0      0      10.0.30.15:22        10.0.99.10:51022    users:(("sshd",pid=2201,fd=4))
```

La première ligne mérite l'attention : un processus nommé pour ressembler à un fil du noyau maintient une connexion sortante vers une adresse externe. C'est un indice fort de canal de commande, qui sera confirmé par l'analyse mémoire vue au cours Forensics & DFIR.

### Éradication et remédiation

L'éradication supprime la cause : comptes créés par l'attaquant, mécanismes de persistance, outils déposés, et surtout identifiants compromis. Après une compromission de l'annuaire, cela implique de réinitialiser les mots de passe à privilèges, de faire tourner deux fois le mot de passe du compte `krbtgt` qui signe les tickets Kerberos, en respectant un délai entre les deux rotations, et souvent de reconstruire les machines plutôt que de les nettoyer. Une machine dont on ne connaît pas toute l'étendue de la compromission ne doit pas être considérée comme saine.

La remédiation corrige durablement ce qui a permis l'incident : correctif de la vulnérabilité exploitée, durcissement, segmentation, MFA, nouvelles règles de détection. Le rétablissement remet ensuite les services en production de façon progressive et surveillée, depuis des sauvegardes vérifiées, comme le détaille le chapitre 7.

<AttackDefenseTable rows={[
  { phase: "Persistance", attack: "Création de comptes, tâches planifiées ou services pour revenir après nettoyage", defense: "Inventaire complet des persistances pendant l'investigation, éradication simultanée sur toutes les machines" },
  { phase: "Identifiants volés", attack: "Réutilisation des mots de passe et jetons récupérés", defense: "Réinitialisation des comptes touchés, révocation des sessions, double rotation de krbtgt si l'annuaire est compromis" },
  { phase: "Retour de l'attaquant", attack: "Nouvel accès par le même vecteur initial", defense: "Remédiation de la cause racine, surveillance renforcée pendant plusieurs semaines" },
  { phase: "Destruction des traces", attack: "Effacement des journaux ou des outils après détection", defense: "Journaux centralisés hors d'atteinte, acquisition mémoire avant toute action visible" }
]} />

## La coordination entre équipes

<CompareTable
  titleA="Équipe"
  titleB="Rôle dans la réponse"
  rows={[
    { a: "SOC (cours Analyse SOC)", b: "Détection initiale, triage, premier confinement selon playbook" },
    { a: "DFIR (cours Forensics & DFIR)", b: "Investigation approfondie, détermination de l'étendue réelle de la compromission" },
    { a: "Direction / RSSI", b: "Décisions à fort impact (communication, obligations légales), rappel du cours Droit et Réglementation" },
    { a: "Équipes techniques (Administration Systèmes et Réseaux)", b: "Exécution technique de la remédiation (durcissement, correctifs)" },
]}
/>

Dans un incident critique, ces équipes se réunissent dans une **cellule de crise**. On distingue souvent une cellule stratégique, autour de la direction, qui prend les décisions d'impact métier, de communication et de relation avec les autorités, et une cellule opérationnelle, qui pilote le travail technique. Un coordinateur d'incident fait le lien, tient la main courante, c'est-à-dire le journal horodaté de toutes les décisions et actions, et organise des points de situation réguliers. La communication, interne et externe, est confiée à des personnes désignées : un message improvisé auprès des clients ou de la presse peut aggraver la situation juridique et réputationnelle.

## Les obligations légales pendant la réponse

<WarningCallout>
Rappel du cours Droit et Réglementation (chapitre 2) : une violation de données personnelles déclenche une obligation de notification à l'autorité de contrôle sous 72 heures — cette contrainte légale doit être intégrée dès le début de la réponse à incident, pas traitée comme une préoccupation secondaire une fois l'aspect technique résolu.
</WarningCallout>

<Steps steps={[
  { title: "Évaluer rapidement si des données personnelles sont concernées", description: "Cette évaluation précoce détermine si l'horloge des 72 heures RGPD a commencé à courir." },
  { title: "Documenter en parallèle de l'investigation technique", description: "Rappel du cours Rédaction de Rapports (chapitre 4) : la documentation ne peut pas attendre la fin de l'investigation complète si une échéance légale est en jeu." },
  { title: "Impliquer le juridique dès le début, pas à la fin", description: "Une décision de communication ou de notification prise sans consultation juridique préalable peut aggraver l'exposition légale de l'organisation." },
]} />

<LegalCallout>
Le RGPD, à son article 33, impose de notifier une violation de données personnelles à l'autorité de contrôle, la CNIL en France, dans les 72 heures après en avoir pris connaissance, sauf si la violation est peu susceptible d'engendrer un risque pour les personnes ; une notification initiale incomplète peut être complétée ensuite. L'article 34 impose d'informer les personnes concernées en cas de risque élevé. La directive NIS2, à son article 23, impose aux entités essentielles et importantes une alerte précoce au CSIRT ou à l'autorité compétente dans les 24 heures pour un incident important, une notification dans les 72 heures, puis un rapport final dans un délai d'un mois. Le règlement DORA impose au secteur financier la déclaration des incidents majeurs liés aux TIC selon ses propres délais. Ces obligations se cumulent : un même incident peut en déclencher plusieurs.
</LegalCallout>

Un point clé concerne le scénario du ransomware qui chiffre une base de données clients sans preuve d'exfiltration. Une violation de données personnelles ne se limite pas à la fuite : la perte de disponibilité ou d'intégrité des données en est aussi une. L'absence de preuve d'exfiltration n'est pas la preuve de l'absence d'exfiltration, d'autant que de nombreux groupes pratiquent la double extorsion, qui combine vol et chiffrement. Il faut donc évaluer immédiatement la présence de données personnelles et documenter le raisonnement, quelle que soit la décision finale.

Deux autres sujets relèvent de la cellule stratégique. Le **dépôt de plainte** auprès des services spécialisés permet l'enquête judiciaire et conditionne souvent l'indemnisation : en France, la loi impose depuis 2023 un dépôt de plainte dans les 72 heures pour que l'assurance indemnise les pertes liées à une cyberattaque. Le **paiement d'une rançon** est fortement déconseillé par les autorités : il ne garantit ni la restitution des données ni la non-publication, et finance de nouvelles attaques.

## Clôturer une réponse à incident

<CehCallout>
Rappel du cours Forensics & DFIR (chapitre 8) : une réponse à incident se clôture par un retour d'expérience qui interroge non seulement « comment corriger la faille exploitée » mais surtout « pourquoi n'avons-nous pas détecté l'incident plus tôt » — cette seconde question, souvent négligée, est celle qui améliore réellement la posture de détection pour l'avenir.
</CehCallout>

Un incident est clos lorsque la cause est éradiquée, les services rétablis et surveillés, les obligations légales remplies et le retour d'expérience réalisé. Ce dernier, détaillé au chapitre 10, produit une chronologie factuelle, une analyse des causes, et des actions d'amélioration avec un responsable et une échéance. Il mesure aussi les indicateurs clés : le délai moyen de détection, ou MTTD, et le délai moyen de réponse, ou MTTR.

## Erreurs fréquentes

La première erreur est de **nettoyer avant d'investiguer** : supprimer le fichier malveillant et redémarrer la machine détruit les preuves et laisse les autres persistances en place.

La deuxième est de **confiner au compte-gouttes**. Isoler une machine par jour, au fil des découvertes, laisse à l'attaquant le temps de s'adapter. Lorsque c'est possible, l'éradication doit être coordonnée et simultanée.

La troisième est de **communiquer sur les canaux compromis**. Discuter de la réponse dans la messagerie d'entreprise alors que l'annuaire est compromis informe l'attaquant.

La quatrième est d'**oublier l'horloge légale**. Les 72 heures du RGPD courent pendant que l'équipe technique se concentre sur le confinement.

La cinquième est de **déclarer l'incident clos trop tôt**, avant d'avoir surveillé l'environnement assez longtemps pour s'assurer que l'attaquant ne revient pas.

## Lab — Mise en pratique

**Environnement** : réflexion guidée, puis terminal Kali pour une collecte de premier niveau sur ta propre machine.

<Steps steps={[
  { title: "Retracer une réponse complète", description: "Pour un incident de compte compromis détecté par le SIEM (rappel du cours Analyse SOC, chapitre 5), retrace les étapes de confinement, investigation, éradication et remédiation, en précisant quelle équipe intervient à chaque étape." },
  { title: "Identifier une obligation légale déclenchée", description: "Un incident de ransomware a chiffré une base de données clients sans preuve d'exfiltration. Quelle obligation légale doit être évaluée en priorité, et sous quel délai ? Si l'organisation est une entité essentielle au sens de NIS2, quelles échéances s'ajoutent ?" },
  { title: "Choisir une stratégie de confinement", description: "Pour deux cas, un poste isolé exécutant un logiciel malveillant connu et un attaquant présent depuis des semaines sur plusieurs serveurs, choisis entre confinement immédiat et observation contrôlée. Justifie avec les risques de chaque option." },
  { title: "Réaliser une collecte volatile", description: "Sur ta machine Kali, collecte l'état volatil dans un dossier dédié, puis calcule les empreintes. Observe les connexions établies et repère les processus que tu ne reconnais pas.", code: "OUT=~/collecte_$(date -u +%Y%m%dT%H%M%SZ); mkdir -p \"$OUT\"\ndate -u > \"$OUT/date_utc.txt\"\nss -tanp > \"$OUT/connexions.txt\"\nps auxwwf > \"$OUT/processus.txt\"\nlast -F > \"$OUT/connexions_utilisateurs.txt\"\nsha256sum \"$OUT\"/* | tee \"$OUT/empreintes.sha256\"" },
  { title: "Vérifier l'intégrité de la collecte", description: "Vérifie les empreintes, puis modifie volontairement un fichier et relance la vérification. Observe l'échec : c'est ce qui garantit la valeur probante de la collecte.", code: "cd \"$OUT\" && sha256sum -c empreintes.sha256\necho modif >> processus.txt && sha256sum -c empreintes.sha256" },
  { title: "Rédiger une main courante", description: "Imagine les deux premières heures d'un incident de gravité élevée et rédige une main courante de dix entrées horodatées en UTC : heure, auteur, décision ou action, justification." }
]} />

## À retenir

- Une réponse à incident complète enchaîne détection, triage, confinement, investigation approfondie, éradication, remédiation et retour d'expérience.
- Le confinement stoppe la propagation immédiatement, l'éradication supprime la cause, la remédiation corrige durablement pour éviter la récidive.
- La préparation, avec rôles, échelle de gravité, playbooks et canal hors bande, conditionne la qualité de la réponse.
- Le confinement doit préserver les preuves : isolement réseau plutôt qu'extinction, collecte selon l'ordre de volatilité, empreintes et chaîne de custody.
- SOC, DFIR, direction ou RSSI et équipes techniques doivent coordonner leurs rôles respectifs tout au long de la réponse, au sein d'une cellule de crise.
- Les obligations légales, notification RGPD sous 72 heures, alerte NIS2 sous 24 heures, DORA pour la finance, doivent être évaluées dès le début de la réponse, avec le juridique.
- Le NIST SP 800-61r3 aligne désormais la réponse à incident sur les six fonctions du NIST CSF 2.0.

## Questions de révision

1. Quelle est la différence entre confinement, éradication et remédiation dans une réponse à incident ?
2. Pourquoi le juridique doit-il être impliqué dès le début d'une réponse à incident plutôt qu'à la fin ?
3. Quelle question de retour d'expérience est souvent négligée, alors qu'elle améliore réellement la détection future ?
4. Pourquoi faut-il éviter d'éteindre une machine compromise, et quelle alternative privilégier ?
5. Dans quels cas une équipe peut-elle choisir l'observation contrôlée plutôt qu'un confinement immédiat ?
6. Pourquoi un ransomware sans preuve d'exfiltration peut-il malgré tout constituer une violation de données personnelles ?
7. Pourquoi la cellule de crise a-t-elle besoin d'un canal de communication hors bande ?
