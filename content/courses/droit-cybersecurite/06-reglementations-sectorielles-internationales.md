---
title: Réglementations sectorielles et internationales
chapter: 6
course: droit-cybersecurite
difficulty: advanced
duration: 60
tags: [droit, nis2, dora, cyber-resilience-act, ai-act, reglementation, malabo, international]
ceh_modules: ["Module 1 - Introduction to Ethical Hacking"]
objectives:
  - Situer NIS2, DORA, le Cyber Resilience Act et l'AI Act parmi les réglementations européennes récentes
  - Comprendre la notion d'entité essentielle et d'entité importante au sens de NIS2, et la responsabilité des dirigeants
  - Connaître les délais de notification d'incident imposés par NIS2, et les comparer à ceux du RGPD et du Cyber Resilience Act
  - Comprendre ce qu'est un TLPT au sens de DORA et en quoi il diffère d'un pentest classique
  - Identifier les principales réglementations hors Europe, y compris en Afrique, et la manière de gérer plusieurs régimes à la fois
---

## Introduction

Ce dernier chapitre referme le cours en élargissant le regard au-delà du RGPD vu au chapitre 2. L'Union européenne a considérablement étoffé son arsenal en cybersécurité ces dernières années, avec des textes qui imposent directement des obligations de sécurité technique et organisationnelle, et plus seulement de protection des données personnelles : **NIS2** pour les secteurs critiques, **DORA** pour la finance, le **Cyber Resilience Act** pour les produits numériques, et l'**AI Act** pour les systèmes d'intelligence artificielle.

Ces textes changent concrètement le métier : ils créent une demande de tests d'intrusion avancés, de gestion des vulnérabilités, de réponse à incident capable de notifier en 24 heures, et de gouvernance impliquant la direction. À la fin de ce chapitre, tu sauras à qui s'applique chacun de ces textes, quelles obligations clés ils imposent, quels délais respecter, et comment s'orienter parmi les réglementations hors d'Europe, y compris en Afrique.

## NIS2 : la cybersécurité des secteurs critiques et au-delà

La directive **NIS2** (directive (UE) 2022/2555) remplace la directive NIS de 2016. Comme toute directive, elle devait être **transposée** dans le droit de chaque État membre, au plus tard le 17 octobre 2024. Plusieurs États, dont la France, ont pris du retard ; pour une entité donnée, ce sont les dispositions nationales de transposition qui s'appliquent, et il faut vérifier le texte en vigueur dans chaque pays.

### Qui est concerné ?

NIS2 étend considérablement le périmètre de son prédécesseur. Elle couvre les **secteurs hautement critiques** de son annexe I, comme l'énergie, les transports, la banque, les infrastructures des marchés financiers, la santé, l'eau potable et les eaux usées, les infrastructures numériques, la gestion des services informatiques entre entreprises, l'administration publique et l'espace, et les **autres secteurs critiques** de son annexe II, comme les services postaux, la gestion des déchets, la chimie, l'alimentation, la fabrication de certains produits (dont les dispositifs médicaux et les équipements électroniques), les fournisseurs numériques et la recherche. En règle générale, elle s'applique aux entreprises de taille moyenne ou grande de ces secteurs, certaines entités étant visées quelle que soit leur taille.

<CompareTable
  titleA="Entités essentielles"
  titleB="Entités importantes"
  rows={[
    { a: "Principalement les grandes entités des secteurs hautement critiques : énergie, transport, santé, eau, infrastructures numériques...", b: "Les autres entités couvertes : services postaux, gestion des déchets, fabrication de dispositifs médicaux, fournisseurs numériques..." },
    { a: "Supervision proactive (ex ante) : audits, inspections, contrôles sans incident préalable", b: "Supervision réactive (ex post) : contrôles déclenchés par des indices de non-conformité ou un incident" },
    { a: "Amendes d'au moins 10 millions d'euros ou 2 % du chiffre d'affaires mondial (plafond maximal fixé par les États)", b: "Amendes d'au moins 7 millions d'euros ou 1,4 % du chiffre d'affaires mondial (plafond maximal fixé par les États)" },
  ]}
/>

### Gouvernance et responsabilité des dirigeants

<LegalCallout>
NIS2 introduit une nouveauté significative : l'implication et la responsabilité des organes de direction. Selon son article 20, la direction doit approuver les mesures de gestion des risques de cybersécurité, superviser leur mise en œuvre, suivre une formation, et peut être tenue responsable des manquements. Pour les entités essentielles, les autorités peuvent même aller jusqu'à demander l'interdiction temporaire d'exercer des fonctions de direction. Ce n'est plus seulement l'entreprise qui est exposée, mais ses décideurs.
</LegalCallout>

### Les obligations principales

<Steps steps={[
  { title: "Analyse de risque et politiques de sécurité", description: "Identifier, documenter et traiter les risques pesant sur les réseaux et systèmes d'information de l'entité, selon une approche tous risques." },
  { title: "Mesures techniques et organisationnelles minimales", description: "L'article 21 liste au moins dix domaines : gestion des incidents, continuité d'activité et sauvegardes, sécurité de la chaîne d'approvisionnement, sécurité du développement et gestion des vulnérabilités, évaluation de l'efficacité des mesures, cyberhygiène et formation, cryptographie, sécurité des ressources humaines et contrôle d'accès, authentification multifacteur et communications sécurisées." },
  { title: "Notification d'incident en trois temps", description: "Pour un incident important : une alerte précoce sous 24 heures au CSIRT ou à l'autorité compétente, une notification d'incident sous 72 heures avec une première évaluation, puis un rapport final au plus tard un mois après la notification." },
  { title: "Gestion de la chaîne d'approvisionnement", description: "Évaluer et encadrer la sécurité de ses fournisseurs et prestataires critiques, y compris dans les contrats : c'est une nouveauté majeure par rapport à NIS1." },
]} />

<CehCallout>
Pour les examens et les entretiens, retiens trois points sur NIS2 : la distinction entre entités essentielles (supervision proactive) et entités importantes (supervision réactive) ; le calendrier de notification en 24 heures, 72 heures et un mois ; et les deux nouveautés phares par rapport à NIS1, la responsabilité des organes de direction et la sécurité de la chaîne d'approvisionnement.
</CehCallout>

## DORA : la résilience numérique du secteur financier

**DORA** (*Digital Operational Resilience Act*, règlement (UE) 2022/2554) est applicable depuis le 17 janvier 2025. Étant un règlement, il s'applique directement sans transposition. Il cible spécifiquement le secteur financier européen, banques, assurances, entreprises d'investissement, établissements de paiement, prestataires de services sur crypto-actifs, avec une exigence de résilience opérationnelle numérique plus détaillée encore que NIS2. Pour ces entités, DORA prévaut sur NIS2 en tant que texte sectoriel spécifique.

<CompareTable
  titleA="Pilier DORA"
  titleB="Contenu"
  rows={[
    { a: "Gestion des risques liés aux TIC", b: "Cadre de gouvernance des risques informatiques sous la responsabilité de l'organe de direction, cartographie, protection, détection, continuité" },
    { a: "Gestion et notification des incidents liés aux TIC", b: "Classification des incidents selon des critères harmonisés, notification des incidents majeurs à l'autorité dans des délais très courts, précisés par des normes techniques" },
    { a: "Tests de résilience opérationnelle numérique", b: "Programme de tests pour toutes les entités ; tests de pénétration fondés sur la menace (TLPT) au moins tous les trois ans pour les entités désignées" },
    { a: "Gestion du risque lié aux prestataires tiers de TIC", b: "Registre des contrats avec les prestataires, clauses contractuelles obligatoires, et supervision européenne directe des prestataires critiques, comme les grands fournisseurs cloud" },
    { a: "Partage d'informations", b: "Échange volontaire de renseignements sur les menaces entre entités financières" },
  ]}
/>

<TipCallout>
Le TLPT (Threat-Led Penetration Testing) imposé par DORA n'est pas un pentest classique. Il simule une attaque avancée et ciblée, inspirée des groupes de menace réels qui visent l'entité, sur ses fonctions critiques et en production, en suivant un cadre méthodologique européen strict, TIBER-EU, élaboré par la Banque centrale européenne. Il implique un fournisseur de renseignement sur les menaces, une équipe rouge externe, une « équipe blanche » restreinte au courant du test, et se termine par un exercice de restitution avec l'équipe de défense.
</TipCallout>

## Le Cyber Resilience Act : la sécurité des produits numériques

Le **Cyber Resilience Act** (CRA, règlement (UE) 2024/2847) est entré en vigueur le 10 décembre 2024. Il impose des exigences de cybersécurité à tous les **produits comportant des éléments numériques** mis sur le marché européen : logiciels, objets connectés, équipements réseau, avec des exceptions pour les secteurs déjà régulés comme les dispositifs médicaux ou l'automobile.

Ses obligations principales portent sur les fabricants : concevoir des produits sûrs dès la conception et par défaut, les mettre sur le marché sans vulnérabilité exploitable connue, gérer les vulnérabilités pendant toute la période de support, qui doit en principe durer au moins cinq ans sauf si la durée d'utilisation attendue est plus courte, fournir des mises à jour de sécurité, documenter les composants logiciels, notamment au moyen d'une nomenclature logicielle (SBOM), et apposer le marquage CE. Les produits jugés plus sensibles, classés comme « importants » ou « critiques », sont soumis à des procédures d'évaluation de conformité plus exigeantes.

Le calendrier est progressif. Depuis le 11 septembre 2026, les fabricants doivent **signaler les vulnérabilités activement exploitées et les incidents graves** via une plateforme unique gérée par l'ENISA, selon un schéma proche de NIS2 : alerte précoce sous 24 heures, notification sous 72 heures, puis rapport final. L'ensemble des obligations s'appliquera à partir du 11 décembre 2027. Les manquements aux exigences essentielles peuvent être sanctionnés jusqu'à 15 millions d'euros ou 2,5 % du chiffre d'affaires mondial.

Pour un professionnel de la sécurité, le CRA crée une forte demande de tests de sécurité des produits, de processus de divulgation coordonnée des vulnérabilités (chapitre 1) et de gestion des composants tiers.

## L'AI Act : l'intelligence artificielle et sa sécurité

L'**AI Act** (règlement (UE) 2024/1689) est entré en vigueur le 1er août 2024. Il classe les systèmes d'intelligence artificielle selon leur niveau de risque : les **pratiques interdites** (par exemple certaines formes de notation sociale ou de manipulation), applicables depuis le 2 février 2025 ; les systèmes **à haut risque**, soumis à des exigences strictes ; les systèmes soumis à des obligations de **transparence**, comme les assistants conversationnels et les contenus générés ; et les systèmes à risque minimal. Les obligations des fournisseurs de modèles d'IA à usage général s'appliquent depuis le 2 août 2025, et la plupart des autres dispositions à partir du 2 août 2026, avec un délai supplémentaire pour les systèmes à haut risque intégrés à des produits déjà réglementés. Fin 2025, la Commission a proposé d'ajuster le calendrier de certaines obligations relatives au haut risque dans le cadre d'un paquet de simplification : vérifie le calendrier effectivement en vigueur.

L'article 15 intéresse directement les professionnels de la sécurité : les systèmes à haut risque doivent atteindre un niveau approprié d'exactitude, de robustesse et de **cybersécurité**, et résister notamment aux tentatives d'empoisonnement des données d'entraînement, de manipulation par des exemples contradictoires et d'exploitation des failles du modèle. Le référentiel OWASP Top 10 pour les applications fondées sur des grands modèles de langage, dans sa version 2025, est un bon point de départ pour tester ces systèmes. Les amendes les plus élevées, pour les pratiques interdites, peuvent atteindre 35 millions d'euros ou 7 % du chiffre d'affaires mondial.

## Un aperçu des réglementations hors Europe

<CompareTable
  titleA="Réglementation"
  titleB="Périmètre"
  rows={[
    { a: "HIPAA (États-Unis)", b: "Protection des données de santé : sa Security Rule impose des obligations de sécurité aux acteurs du système de santé et à leurs prestataires" },
    { a: "Règles de la SEC sur la cybersécurité (États-Unis, 2023)", b: "Les sociétés cotées doivent publier un incident de cybersécurité significatif dans les quatre jours ouvrés suivant la détermination de son caractère significatif" },
    { a: "CCPA modifié par le CPRA (Californie)", b: "Droits des consommateurs sur leurs données personnelles, proche du RGPD dans son esprit" },
    { a: "PIPL (Chine, 2021)", b: "Protection des informations personnelles, avec des règles strictes sur les transferts de données hors de Chine" },
    { a: "LGPD (Brésil)", b: "Loi générale de protection des données, fortement inspirée du RGPD européen" },
  ]}
/>

### Le continent africain

L'Afrique s'est dotée d'un cadre de plus en plus structuré. La **Convention de Malabo** de l'Union africaine, adoptée en 2014 et entrée en vigueur en 2023, couvre la protection des données personnelles, la cybersécurité et la cybercriminalité. De nombreux États ont adopté leurs propres lois de protection des données, souvent inspirées du RGPD, comme le Nigeria avec sa loi de 2023, le Kenya avec sa loi de 2019 ou l'Afrique du Sud avec la loi POPIA. La République du Congo s'est également dotée de textes sur la protection des données à caractère personnel, la cybersécurité et la lutte contre la cybercriminalité. Pour un professionnel basé à Brazzaville ou à Pointe-Noire, la démarche est donc la même qu'en Europe : identifier les textes nationaux applicables et leur autorité de contrôle, vérifier les conventions ratifiées, et ne pas oublier que le RGPD peut s'appliquer dès que l'on cible des personnes situées dans l'Union européenne.

## Gérer plusieurs régimes à la fois

Une organisation opérant à l'international doit souvent se conformer simultanément à plusieurs de ces textes. Une banque européenne cotée aux États-Unis qui utilise de l'IA pour l'octroi de crédit relève du RGPD, de DORA, de l'AI Act et des règles de la SEC. La stratégie la plus courante consiste à appliquer le standard le plus exigeant comme socle commun, puis à ajouter les obligations spécifiques de chaque juridiction. Côté réponse à incident, cela impose un **tableau des notifications** préparé à l'avance : quelle autorité, sous quel délai, avec quel contenu, déclenché par quel critère.

| Texte | Destinataire | Premier délai | Suite |
| --- | --- | --- | --- |
| RGPD, article 33 | Autorité de protection des données | 72 heures après la prise de connaissance | Compléments échelonnés, information des personnes si risque élevé |
| NIS2, article 23 | CSIRT ou autorité compétente | Alerte précoce sous 24 heures | Notification sous 72 heures, rapport final sous un mois |
| CRA | CSIRT coordinateur et ENISA via la plateforme unique | Alerte précoce sous 24 heures | Notification sous 72 heures, puis rapport final |
| DORA | Autorité financière compétente | Notification initiale en quelques heures après classification comme majeur | Rapports intermédiaire et final |

Un même incident peut déclencher plusieurs de ces notifications, avec des délais et des contenus différents : c'est pourquoi l'équipe DFIR doit produire très tôt des faits établis et datés, comme vu au chapitre 8 du cours DFIR.

## Erreurs fréquentes

La première erreur est de **croire que NIS2 ne concerne que les opérateurs d'importance vitale** : son périmètre est bien plus large. La deuxième est de **confondre la directive et sa transposition** : ce sont les textes nationaux qui s'appliquent, avec des variations. La troisième est de **présenter un TLPT comme un pentest web** un peu plus long.

On voit aussi des organisations **oublier leurs fournisseurs** dans l'analyse de risque, alors que la chaîne d'approvisionnement est au cœur de NIS2 et de DORA, des éditeurs **ignorer le CRA** en pensant qu'il ne concerne que le matériel, et des entreprises africaines **ignorer le RGPD** alors qu'elles servent des clients européens.

## Lab — Mise en pratique

**Environnement** : Kali Linux (terminal Nyx), Python 3. Tu vas construire un petit outil d'aide à la qualification NIS2, calculer les échéances de notification d'un incident, puis raisonner sur des cas.

<Steps steps={[
  { title: "Écrire un qualificateur NIS2 simplifié", description: "Écris un script qui, à partir du secteur et de la taille, propose une qualification indicative. Il simplifie volontairement les règles (seuils de taille, annexes) : en pratique, il faut toujours vérifier le texte national.", code: "mkdir -p ~/lab-nis2 && cd ~/lab-nis2\ncat > nis2.py <<'PY'\nimport sys\nANNEXE1 = {'energie', 'transport', 'banque', 'sante', 'eau', 'numerique', 'administration'}\nANNEXE2 = {'postal', 'dechets', 'chimie', 'alimentation', 'fabrication', 'fournisseur_numerique', 'recherche'}\ndef qualifier(secteur, salaries, ca_millions):\n    grande = salaries >= 250 or ca_millions > 50\n    moyenne = salaries >= 50 or ca_millions > 10\n    if secteur in ANNEXE1 and grande:\n        return 'entite essentielle (supervision ex ante)'\n    if (secteur in ANNEXE1 or secteur in ANNEXE2) and moyenne:\n        return 'entite importante (supervision ex post)'\n    return 'hors champ par defaut (verifier les cas particuliers)'\nfor arg in sys.argv[1:]:\n    s, n, ca = arg.split(':')\n    print(f'{s:22} {n:>5} salaries {ca:>5} M EUR -> {qualifier(s, int(n), float(ca))}')\nPY\npython3 nis2.py sante:1200:90 fabrication:180:30 sante:120:15 alimentation:20:3" },
  { title: "Observer les limites", description: "Constate qu'un hôpital de 1 200 personnes est classé essentiel et un fabricant de dispositifs médicaux de taille moyenne important. Note aussi ce que le script ignore : entités visées quelle que soit leur taille, désignations nationales, appartenance à un groupe." },
  { title: "Calculer les échéances d'un incident", description: "Un incident important est détecté le 12 mars 2026 à 09:41 UTC et touche aussi des données personnelles. Calcule les échéances NIS2 et RGPD.", code: "T='2026-03-12 09:41 UTC'\necho \"NIS2 alerte precoce : $(date -u -d \"$T + 24 hours\" '+%F %H:%M UTC')\"\necho \"NIS2 notification   : $(date -u -d \"$T + 72 hours\" '+%F %H:%M UTC')\"\necho \"RGPD autorite       : $(date -u -d \"$T + 72 hours\" '+%F %H:%M UTC')\"" },
  { title: "Préparer un tableau des notifications", description: "Crée un fichier qui recense, pour ton organisation fictive, chaque autorité à notifier, le délai, le déclencheur et la personne responsable. Ce document se prépare avant l'incident, pas pendant.", code: "printf '%s\\n' 'texte;destinataire;delai;declencheur;responsable' 'RGPD;autorite de protection des donnees;72h;violation de donnees personnelles;DPO' 'NIS2;CSIRT national;24h puis 72h puis 1 mois;incident important;RSSI' > notifications.csv\ncolumn -s ';' -t notifications.csv" },
  { title: "Qualifier deux entités NIS2", description: "Raisonnement : un grand hôpital public et un fabricant de dispositifs médicaux de taille moyenne sont-ils concernés par NIS2 ? Dans quelle catégorie, et pourquoi cette distinction change-t-elle la façon dont l'autorité les contrôle ?" },
  { title: "Comparer pentest classique et TLPT", description: "Raisonnement : en quoi un TLPT imposé par DORA diffère-t-il d'un pentest de sécurité web tel qu'étudié dans le cours Sécurité Web ? Compare le périmètre, le scénario, les acteurs, l'environnement et la fréquence." },
  { title: "Analyser un cas international", description: "Raisonnement : une fintech installée à Brazzaville propose une application de paiement à des clients en France et au Congo, et s'appuie sur un fournisseur cloud européen. Liste les textes qui peuvent la concerner et les questions à poser à un juriste local." },
]} />

## À retenir

- NIS2 (directive 2022/2555, transposition attendue au 17 octobre 2024) élargit fortement le périmètre des entités soumises à des obligations de cybersécurité, distingue entités essentielles (supervision ex ante) et importantes (supervision ex post), et engage la responsabilité des dirigeants.
- NIS2 impose une alerte précoce sous 24 heures, une notification sous 72 heures et un rapport final sous un mois, ainsi que la sécurité de la chaîne d'approvisionnement.
- DORA (règlement 2022/2554, applicable depuis le 17 janvier 2025) impose au secteur financier une résilience numérique renforcée, incluant des TLPT selon le cadre TIBER-EU et la supervision des prestataires TIC critiques.
- Le Cyber Resilience Act (règlement 2024/2847) impose la sécurité dès la conception des produits numériques, le signalement des vulnérabilités activement exploitées depuis septembre 2026 et une pleine application en décembre 2027.
- L'AI Act (règlement 2024/1689) classe les systèmes d'IA par niveau de risque et exige des systèmes à haut risque un niveau approprié de robustesse et de cybersécurité.
- Hors Europe, HIPAA, les règles de la SEC, le CCPA, la PIPL et la LGPD, ainsi qu'en Afrique la Convention de Malabo et les lois nationales, dont celles du Congo, complètent le paysage ; un tableau des notifications préparé à l'avance est indispensable.

## Questions de révision

1. Quelle nouveauté majeure NIS2 introduit-elle concernant la responsabilité des dirigeants, et jusqu'où peuvent aller les autorités pour une entité essentielle ?
2. Quelles différences de supervision et de sanctions existe-t-il entre entités essentielles et entités importantes ?
3. Quel est le calendrier de notification d'un incident important sous NIS2, et en quoi diffère-t-il du délai du RGPD ?
4. Quel secteur DORA cible-t-il, et en quoi un TLPT diffère-t-il d'un pentest classique ?
5. Quelles obligations le Cyber Resilience Act impose-t-il aux éditeurs de logiciels, et depuis quand doivent-ils signaler les vulnérabilités activement exploitées ?
6. Pourquoi l'article 15 de l'AI Act concerne-t-il directement les professionnels de la sécurité ?
7. Cite deux réglementations hors Europe inspirées du RGPD, et explique comment une entreprise africaine peut être soumise à la fois à sa loi nationale et au RGPD.

Félicitations, tu viens de terminer le cours **Droit et Réglementation de la Cybersécurité** ! Ce socle juridique s'applique à chaque mission que tu mèneras : reviens-y dès qu'un doute se présente sur l'autorisation, la preuve ou la conformité, et vérifie toujours le texte officiel en vigueur dans le pays concerné.
