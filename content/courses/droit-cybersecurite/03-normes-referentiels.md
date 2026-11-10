---
title: Normes et référentiels — ISO 27001, NIST, PCI-DSS
chapter: 3
course: droit-cybersecurite
difficulty: intermediate
duration: 55
tags: [droit, normes, iso27001, iso27002, nist-csf-2, pci-dss-4, cis-controls, conformite]
ceh_modules: ["Module 1 - Introduction to Ethical Hacking"]
objectives:
  - Situer ISO/IEC 27001:2022, le NIST CSF 2.0 et PCI DSS 4.0.1 les uns par rapport aux autres
  - Comprendre la logique d'un système de management de la sécurité de l'information (SMSI) et de sa certification
  - Connaître la structure de l'Annexe A d'ISO 27001:2022 (93 mesures en quatre thèmes) et la déclaration d'applicabilité
  - Classer des activités dans les six fonctions du NIST CSF 2.0, dont la fonction Govern
  - Identifier quand une norme devient une obligation contractuelle, et les exigences PCI DSS qui concernent le pentester
---

## Introduction

Contrairement aux lois, les normes et référentiels de sécurité ne sont pas, en eux-mêmes, des obligations légales. Mais ils le deviennent souvent par la voie **contractuelle**, quand un client exige la certification de son prestataire, ou **sectorielle**, comme PCI DSS pour quiconque traite des cartes bancaires. Les régulateurs s'y réfèrent aussi : une autorité qui contrôle la « sécurité appropriée » exigée par le RGPD ou par NIS2 regardera si l'organisation suit un référentiel reconnu.

Pour un professionnel de la sécurité, ces référentiels sont un langage commun. Un pentester relie ses constats à des mesures ISO 27001 ; un analyste SOC parle en fonctions du NIST CSF ; un auditeur PCI vérifie des exigences numérotées. À la fin de ce chapitre, tu sauras ce que certifie réellement ISO 27001, comment est organisée sa version 2022, comment utiliser le NIST CSF 2.0, et quelles exigences de PCI DSS 4.0.1 te concernent directement.

## Norme, référentiel, certification : clarifier les mots

Une **norme** est un document établi par consensus et approuvé par un organisme reconnu, comme l'ISO au niveau international. Certaines normes contiennent des **exigences** (le verbe « doit »), contre lesquelles une organisation peut être auditée et **certifiée** par un organisme tiers accrédité : c'est le cas d'ISO/IEC 27001. D'autres contiennent des **recommandations** et servent de guide, comme ISO/IEC 27002. Un **référentiel** ou **cadre** (*framework*), comme le NIST CSF, propose une structure et un vocabulaire sans certification officielle. Un **standard sectoriel** comme PCI DSS est imposé par les acteurs d'un secteur, ici les réseaux de cartes, avec ses propres évaluateurs.

| Référentiel | Nature | Certification | Qui l'impose |
| --- | --- | --- | --- |
| ISO/IEC 27001:2022 | Norme d'exigences pour un SMSI | Oui, par un organisme accrédité | Choix volontaire, souvent exigé par contrat |
| ISO/IEC 27002:2022 | Guide de mise en œuvre des mesures | Non | Sert d'appui à ISO 27001 |
| NIST CSF 2.0 | Cadre de gestion des risques cyber | Non | Volontaire, très utilisé comme langage commun |
| CIS Controls v8.1 | Liste priorisée de mesures techniques | Non | Volontaire, très opérationnel |
| PCI DSS 4.0.1 | Standard sectoriel de sécurité des données de cartes | Évaluation de conformité (QSA, auto-questionnaire) | Réseaux de cartes, via les contrats avec les banques |

## ISO/IEC 27001:2022 : le management de la sécurité

<AuditCallout>
ISO 27001 ne certifie pas des « systèmes sécurisés ». Elle certifie l'existence et le bon fonctionnement d'un système de management de la sécurité de l'information (SMSI) : un processus continu d'identification des risques, de choix et de mise en œuvre de mesures, de contrôle et d'amélioration. Une entreprise certifiée peut avoir des vulnérabilités techniques ; ce qui compte est qu'elle dispose d'un processus structuré pour les identifier, les traiter et le prouver.
</AuditCallout>

### La structure de la norme

La partie exigences d'ISO 27001 est organisée en clauses 4 à 10, communes à toutes les normes de management ISO : **contexte** de l'organisation (enjeux, parties intéressées, périmètre du SMSI), **leadership** (engagement de la direction, politique, rôles), **planification** (appréciation et traitement des risques, objectifs), **support** (ressources, compétences, sensibilisation, documentation), **fonctionnement** (mise en œuvre du traitement des risques), **évaluation des performances** (surveillance, audit interne, revue de direction) et **amélioration** (non-conformités, actions correctives).

Le cœur d'ISO 27001 est le cycle **PDCA** (*Plan-Do-Check-Act*) appliqué à la sécurité :

<Steps steps={[
  { title: "Plan", description: "Définir le périmètre, apprécier les risques, puis choisir les mesures de sécurité nécessaires en s'appuyant sur l'Annexe A, qui compte 93 mesures dans la version 2022." },
  { title: "Do", description: "Mettre en œuvre les mesures décidées, techniques (pare-feu, chiffrement, journalisation) et organisationnelles (politiques, formations, procédures)." },
  { title: "Check", description: "Mesurer et auditer régulièrement l'efficacité réelle des mesures : indicateurs, audits internes, tests d'intrusion, revues de direction." },
  { title: "Act", description: "Corriger les non-conformités identifiées et améliorer le SMSI en continu, puis relancer le cycle." },
]} />

### L'Annexe A de la version 2022

La version 2022 a profondément réorganisé l'Annexe A. Les 114 mesures réparties en 14 domaines de la version 2013 ont laissé place à **93 mesures regroupées en quatre thèmes**, avec une nouvelle numérotation. Si tu rencontres encore des références du type A.9 ou A.12, elles renvoient à l'ancienne version.

| Thème | Numérotation | Nombre de mesures | Exemples |
| --- | --- | --- | --- |
| Mesures organisationnelles | A.5 | 37 | Politiques, renseignement sur les menaces (A.5.7), sécurité du cloud (A.5.23), gestion des incidents (A.5.24 à A.5.28) |
| Mesures liées aux personnes | A.6 | 8 | Sélection, sensibilisation et formation, télétravail, signalement des événements |
| Mesures physiques | A.7 | 14 | Périmètres, surveillance de la sécurité physique (A.7.4), bureau propre |
| Mesures technologiques | A.8 | 34 | Gestion des vulnérabilités (A.8.8), journalisation (A.8.15), surveillance (A.8.16), développement sécurisé (A.8.25 à A.8.28) |

Onze mesures sont nouvelles en 2022, ce qui reflète l'évolution des menaces : renseignement sur les menaces (A.5.7), sécurité de l'utilisation des services cloud (A.5.23), préparation des TIC pour la continuité d'activité (A.5.30), surveillance de la sécurité physique (A.7.4), gestion de la configuration (A.8.9), suppression des informations (A.8.10), masquage des données (A.8.11), prévention des fuites de données (A.8.12), activités de surveillance (A.8.16), filtrage web (A.8.23) et codage sécurisé (A.8.28).

L'organisation n'est pas obligée d'appliquer les 93 mesures. Elle doit produire une **déclaration d'applicabilité** (*Statement of Applicability*), qui indique pour chaque mesure si elle est retenue ou exclue, et pourquoi. C'est l'un des documents que l'auditeur examine en premier.

### Le cycle de certification

La certification est délivrée pour trois ans par un organisme accrédité, après un audit initial en deux étapes : revue documentaire, puis audit de mise en œuvre. Des **audits de surveillance** ont lieu chaque année, et un audit de renouvellement intervient au bout de trois ans. La période de transition depuis la version 2013 s'est achevée le 31 octobre 2025 : les certificats encore fondés sur l'ancienne version ne sont plus valides. Un amendement publié en 2024 a par ailleurs ajouté la prise en compte du changement climatique dans l'analyse du contexte.

ISO 27001 s'appuie sur une famille de normes : ISO/IEC 27002 détaille la mise en œuvre de chaque mesure, ISO/IEC 27005 traite de la gestion des risques, ISO/IEC 27035 de la gestion des incidents, ISO/IEC 27701 de la vie privée, et ISO 22301 de la continuité d'activité.

## Le NIST Cybersecurity Framework 2.0 : un langage commun

Le NIST CSF, publié par l'institut américain des normes et de la technologie, est très utilisé aux États-Unis et largement adopté ailleurs. Sa version 2.0, publiée en février 2024, élargit son public à toutes les organisations, quelle que soit leur taille ou leur secteur, et ajoute une sixième fonction, **Govern**, aux cinq fonctions historiques.

<CompareTable
  titleA="Fonction du NIST CSF 2.0"
  titleB="Question à laquelle elle répond"
  rows={[
    { a: "Govern (gouverner)", b: "Quelle est notre stratégie de gestion des risques cyber, qui en est responsable, comment la direction la pilote-t-elle, comment gérons-nous les risques liés aux fournisseurs ?" },
    { a: "Identify (identifier)", b: "Quels sont nos actifs, nos risques, notre surface d'exposition ?" },
    { a: "Protect (protéger)", b: "Quelles mesures préventives mettons-nous en place ?" },
    { a: "Detect (détecter)", b: "Comment savons-nous qu'un incident est en cours ?" },
    { a: "Respond (répondre)", b: "Que faisons-nous une fois l'incident détecté ?" },
    { a: "Recover (rétablir)", b: "Comment revenons-nous à un fonctionnement normal ?" },
  ]}
/>

Chaque fonction se décline en **catégories** et **sous-catégories** de résultats attendus. Le CSF propose aussi des **profils** : un profil actuel décrit où en est l'organisation, un profil cible décrit où elle veut aller, et l'écart entre les deux donne un plan d'action. Les **niveaux** (*tiers*), de 1 (partiel) à 4 (adaptatif), décrivent la maturité de la gouvernance et de la gestion des risques.

<CehCallout>
Un analyste SOC travaille en très grande majorité dans les fonctions Detect et Respond du NIST CSF : c'est le vocabulaire utilisé pour structurer les runbooks et les indicateurs de performance comme le temps de détection et le temps de réponse, évoqués au chapitre 4 du cours Rédaction de Rapports. La fonction Identify répond à la question « quels sont nos actifs, nos risques et notre surface d'exposition ? ». Retiens aussi que la version 2.0 de 2024 compte six fonctions, avec Govern.
</CehCallout>

### Les CIS Controls, le complément opérationnel

Les **CIS Controls**, publiés par le Center for Internet Security, sont une liste priorisée de 18 mesures techniques et organisationnelles, dans leur version 8.1 de 2024. Ils sont organisés en trois groupes de mise en œuvre (IG1, IG2, IG3) selon la maturité de l'organisation. Le groupe IG1, appelé « hygiène cyber essentielle », est un excellent point de départ pour une petite structure. Le CIS publie aussi des guides de durcissement (*CIS Benchmarks*) pour les systèmes et les logiciels courants. En France, l'ANSSI publie un guide d'hygiène informatique qui joue un rôle comparable.

## PCI DSS 4.0.1 : la norme sectorielle contraignante

Contrairement à ISO 27001, volontaire, et au NIST CSF, référentiel de bonnes pratiques, le **PCI DSS** (*Payment Card Industry Data Security Standard*) est imposé contractuellement par les réseaux de cartes bancaires, via le PCI Security Standards Council, à toute organisation qui stocke, traite ou transmet des données de cartes, où qu'elle se trouve dans le monde. La version 4.0.1, publiée en juin 2024, est la version en vigueur ; la version 4.0 a été retirée fin 2024, et les exigences dites « datées », qui étaient de simples bonnes pratiques jusque-là, sont devenues obligatoires le 31 mars 2025.

Le standard compte **12 exigences principales**, regroupées en six objectifs : construire un réseau sécurisé, protéger les données de compte, gérer les vulnérabilités, contrôler les accès, surveiller et tester les réseaux, maintenir une politique de sécurité. La version 4 introduit aussi une **approche personnalisée**, qui permet d'atteindre l'objectif d'une exigence par d'autres moyens que ceux prévus, à condition de le démontrer.

<CompareTable
  titleA="Exigence PCI DSS"
  titleB="Exemple concret"
  rows={[
    { a: "Ne jamais stocker les données d'authentification sensibles après autorisation (exigence 3)", b: "Le cryptogramme visuel (CVV), la piste magnétique complète et le code PIN ne doivent jamais être conservés après l'autorisation de la transaction" },
    { a: "Rendre illisible le numéro de carte stocké (exigence 3)", b: "Troncature, tokenisation, hachage robuste ou chiffrement fort ; à l'affichage, on montre au plus le BIN (les premiers chiffres, qui identifient l'émetteur) et les quatre derniers chiffres" },
    { a: "Chiffrer les données de carte en transit (exigence 4)", b: "Protocoles robustes comme TLS 1.2 ou 1.3 sur les réseaux publics" },
    { a: "Authentification multifacteur (exigence 8)", b: "Obligatoire pour tous les accès à l'environnement des données de cartes depuis le 31 mars 2025" },
    { a: "Tester régulièrement la sécurité (exigence 11)", b: "Scans de vulnérabilités internes et externes au moins trimestriels, les externes par un prestataire agréé (ASV) ; test d'intrusion au moins annuel et après tout changement significatif" },
    { a: "Segmenter le réseau", b: "Isoler l'environnement des données de cartes (CDE) du reste du réseau pour réduire le périmètre ; vérifier l'efficacité de la segmentation par des tests" },
  ]}
/>

Pour un pentester, l'exigence 11.4 est la plus directe : elle impose une méthodologie de test d'intrusion documentée, couvrant le périmètre du CDE et les systèmes critiques, à la fois depuis l'extérieur et depuis l'intérieur, au moins une fois par an et après toute modification importante. Les tests de segmentation vérifient que les réseaux hors périmètre ne peuvent pas atteindre le CDE ; ils sont annuels pour un commerçant et semestriels pour un prestataire de services.

<LegalCallout>
Le non-respect de PCI DSS n'est pas une infraction pénale en soi, mais il expose à des sanctions contractuelles sévères : pénalités imposées par les réseaux de cartes via la banque acquéreuse, augmentation des frais de transaction, voire perte du droit d'accepter les paiements par carte. En cas de fuite, la non-conformité aggrave aussi la position de l'entreprise face à l'autorité de protection des données et aux victimes. C'est ce risque économique qui rend cette norme aussi contraignante qu'une loi en pratique.
</LegalCallout>

## Faire vivre plusieurs référentiels ensemble

Une organisation est rarement soumise à un seul référentiel. Une banque peut être certifiée ISO 27001, évaluée PCI DSS, soumise à DORA, et utiliser le NIST CSF pour son reporting à la direction. La bonne pratique consiste à construire un **socle de mesures unique**, puis à établir des **correspondances** (*mappings*) vers chaque référentiel. Le NIST publie des tables de correspondance entre le CSF et d'autres référentiels, dont ISO 27001, et le CIS fait de même pour ses contrôles. Ainsi, un même test d'intrusion annuel répond à l'exigence 11.4 de PCI DSS, à la mesure A.8.8 d'ISO 27001 sur la gestion des vulnérabilités techniques, et à la fonction Identify du NIST CSF.

D'autres référentiels peuvent apparaître selon le contexte : **SOC 2**, un rapport d'audit américain fondé sur les critères de services de confiance de l'AICPA, très demandé aux éditeurs SaaS ; en France, la qualification **PASSI** de l'ANSSI pour les prestataires d'audit de sécurité, et **SecNumCloud** pour les offres cloud de confiance. Ces normes internationales s'appliquent de la même façon à une organisation située en Afrique : une banque congolaise qui émet des cartes de paiement internationales, ou une entreprise qui répond à un appel d'offres exigeant ISO 27001, est concernée au même titre qu'une entreprise européenne.

## Erreurs fréquentes

La première erreur est de **croire qu'une certification garantit l'absence de failles** : elle garantit l'existence d'un processus. La deuxième est de **citer l'ancienne numérotation** de l'Annexe A (A.9, A.12) dans un rapport rédigé aujourd'hui. La troisième est de **présenter le NIST CSF avec cinq fonctions** en oubliant Govern.

On voit aussi des organisations **stocker le CVV « temporairement »** pour faciliter les remboursements, ce qui est interdit, **réduire le périmètre PCI sur le papier** sans segmentation réelle, et **traiter la conformité comme un projet ponctuel** avant l'audit, au lieu d'un cycle continu.

## Lab — Mise en pratique

**Environnement** : Kali Linux (terminal Nyx), Python 3. Tu vas mesurer l'avancement d'une mini-déclaration d'applicabilité, classer des activités selon le NIST CSF 2.0, et rechercher des numéros de carte stockés en clair, comme le ferait un auditeur PCI DSS.

<Steps steps={[
  { title: "Créer une mini-déclaration d'applicabilité", description: "Crée un fichier CSV listant quelques mesures de l'Annexe A 2022 avec leur statut. Observe la numérotation A.5 à A.8.", code: "mkdir -p ~/lab-normes && cd ~/lab-normes\nprintf '%s\\n' 'mesure;theme;statut' 'A.5.7 Renseignement sur les menaces;A.5;partiel' 'A.5.24 Planification des incidents;A.5;fait' 'A.6.3 Sensibilisation;A.6;fait' 'A.7.4 Surveillance physique;A.7;exclu' 'A.8.8 Vulnerabilites techniques;A.8;partiel' 'A.8.15 Journalisation;A.8;fait' 'A.8.16 Surveillance;A.8;a_faire' > soa.csv\ncolumn -s ';' -t soa.csv" },
  { title: "Mesurer l'avancement par thème", description: "Calcule, par thème, le nombre de mesures faites sur le nombre de mesures applicables. Les mesures exclues ne comptent pas, mais leur exclusion doit être justifiée dans la vraie déclaration.", code: "awk -F';' 'NR>1 && $3!=\"exclu\" {tot[$2]++; if($3==\"fait\") ok[$2]++} END {for (t in tot) printf \"%s : %d/%d mesures faites\\n\", t, ok[t], tot[t]}' soa.csv | sort" },
  { title: "Classer des activités dans le NIST CSF", description: "Associe chaque activité à une fonction du CSF 2.0 dans un fichier, puis affiche le résultat trié par fonction. Activités : inventaire des serveurs, déploiement d'un EDR, restauration après rançongiciel, analyse d'une alerte SIEM, validation de la politique de sécurité par la direction, isolement d'un poste compromis.", code: "nano csf.txt\nsort csf.txt" },
  { title: "Préparer un faux export applicatif", description: "Crée un fichier qui simule un export de base de données contenant, par erreur, un numéro de carte de test en clair et d'autres nombres sans rapport.", code: "printf '%s\\n' 'commande=1001;client=C77;carte=4111111111111111;montant=49.90' 'commande=1002;client=C78;ref=1234567890123456;montant=12.00' 'commande=1003;client=C79;carte=411111******1111;montant=8.50' > export.txt\ncat export.txt" },
  { title: "Détecter les numéros de carte avec l'algorithme de Luhn", description: "Écris un script qui repère les suites de 13 à 19 chiffres et ne garde que celles qui passent le contrôle de Luhn, utilisé par les numéros de carte. Seul le numéro de test en clair doit être signalé ; le numéro tronqué est conforme.", code: "cat > pan.py <<'PY'\nimport re, sys\ndef luhn(n):\n    s = 0\n    for i, d in enumerate(reversed(n)):\n        d = int(d)\n        if i % 2:\n            d = d * 2 - 9 if d > 4 else d * 2\n        s += d\n    return s % 10 == 0\nfor num, ligne in enumerate(open(sys.argv[1]), 1):\n    for m in re.findall(r'(?<!\\d)\\d{13,19}(?!\\d)', ligne):\n        if luhn(m):\n            print(f'ligne {num}: numero de carte probable {m[:6]}******{m[-4:]}')\nPY\npython3 pan.py export.txt" },
  { title: "Situer une exigence", description: "Raisonnement : une entreprise doit réaliser un test d'intrusion annuel de son système de paiement en ligne. Quelle norme et quelle exigence l'imposent, pourquoi cette obligation est-elle contractuelle plutôt que légale, et à quelle mesure ISO 27001:2022 ce même test répond-il ?" },
]} />

## À retenir

- Les normes ne sont pas des lois, mais elles deviennent obligatoires par contrat, par décision sectorielle ou parce que les régulateurs s'y réfèrent pour apprécier une sécurité appropriée.
- ISO/IEC 27001 certifie un processus de management de la sécurité (SMSI, cycle PDCA), pas l'absence de vulnérabilités ; la certification dure trois ans avec des audits de surveillance annuels.
- L'Annexe A de la version 2022 compte 93 mesures en quatre thèmes (A.5 organisationnelles, A.6 personnes, A.7 physiques, A.8 technologiques), dont onze nouvelles ; la déclaration d'applicabilité justifie les mesures retenues et exclues.
- Le NIST CSF 2.0 de 2024 compte six fonctions, Govern, Identify, Protect, Detect, Respond, Recover ; le travail du SOC relève surtout de Detect et Respond.
- PCI DSS 4.0.1 est imposé par les réseaux de cartes : le CVV n'est jamais stocké après autorisation, le CDE doit être segmenté, l'authentification multifacteur est obligatoire, et le test d'intrusion est au moins annuel.
- Une organisation mutualise ses mesures et établit des correspondances entre référentiels plutôt que de gérer chaque conformité séparément.

## Questions de révision

1. Que certifie réellement ISO 27001 si ce n'est pas l'absence de vulnérabilités techniques ?
2. Combien de mesures compte l'Annexe A d'ISO 27001:2022, et comment sont-elles organisées ? Pourquoi ne faut-il plus citer A.12 dans un rapport ?
3. À quoi sert une déclaration d'applicabilité, et que doit-elle contenir pour une mesure exclue ?
4. Quelles sont les six fonctions du NIST CSF 2.0, et dans lesquelles se situe principalement le travail d'un analyste SOC ?
5. Pourquoi PCI DSS est-il aussi contraignant qu'une loi alors qu'il ne s'agit pas d'un texte légal ?
6. Quelle donnée de carte ne doit jamais être stockée après autorisation, et comment un auditeur pourrait-il détecter des numéros de carte stockés en clair ?
7. Explique comment un même test d'intrusion peut répondre à la fois à PCI DSS, à ISO 27001 et au NIST CSF.
