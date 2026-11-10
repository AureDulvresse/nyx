---
title: RGPD et protection des données personnelles
chapter: 2
course: droit-cybersecurite
difficulty: intermediate
duration: 55
tags: [droit, rgpd, donnees-personnelles, violation-de-donnees, sous-traitant, article-32, cnil]
ceh_modules: ["Module 1 - Introduction to Ethical Hacking"]
objectives:
  - Comprendre le champ d'application du RGPD, y compris pour une organisation située hors de l'Union européenne
  - Appliquer les principes de l'article 5 et l'obligation de sécurité de l'article 32 aux choix techniques
  - Distinguer responsable de traitement et sous-traitant, et savoir quand un accord de sous-traitance est requis
  - Gérer une violation de données selon les articles 33 et 34 (72 heures, notification aux personnes)
  - Concilier journalisation de sécurité, pentest et protection des données
---

## Introduction

Le RGPD, Règlement général sur la protection des données, est le règlement (UE) 2016/679, applicable depuis le 25 mai 2018. C'est le texte européen qui structure le plus directement le travail quotidien d'un professionnel de la cybersécurité, bien au-delà du hacking éthique. Il définit ce qu'est une violation de données, impose des délais de notification stricts, exige une sécurité « appropriée au risque » et façonne les priorités de tout SOC.

Le RGPD n'est pas qu'une affaire de juristes. Le chiffrement, la gestion des accès, la journalisation, la pseudonymisation, les tests d'intrusion réguliers et la réponse à incident sont autant de façons de le mettre en œuvre. À la fin de ce chapitre, tu sauras à qui il s'applique, quels principes guident les choix techniques, comment se répartissent les responsabilités entre un client et son prestataire, et comment réagir à une violation de données dans les délais.

## Champ d'application et définitions

### Une donnée personnelle, c'est quoi ?

Une **donnée à caractère personnel** est toute information se rapportant à une personne physique identifiée ou identifiable, directement ou indirectement (article 4). Un nom ou une adresse électronique l'est évidemment. Mais un identifiant de connexion, un numéro de téléphone, une adresse IP dans de nombreux contextes, un identifiant de cookie ou une donnée de géolocalisation le sont aussi. Pour un analyste sécurité, cela signifie que **la plupart des journaux contiennent des données personnelles**.

Un **traitement** est toute opération sur ces données : collecte, enregistrement, consultation, conservation, transmission, effacement. Lire un journal pendant une investigation est un traitement.

Certaines catégories sont dites **particulières** (article 9) et bénéficient d'une protection renforcée : données de santé, données biométriques servant à identifier une personne, opinions politiques, convictions religieuses, orientation sexuelle, notamment. Les données relatives aux condamnations pénales sont aussi encadrées strictement.

Enfin, distingue bien **pseudonymisation** et **anonymisation**. Des données pseudonymisées, par exemple où les noms sont remplacés par des identifiants, restent des données personnelles, car l'on peut retrouver la personne avec une information complémentaire. Des données réellement anonymisées, de façon irréversible, sortent du champ du RGPD. En pratique, l'anonymisation véritable est difficile à atteindre.

### Qui est concerné, y compris hors d'Europe ?

Le RGPD s'applique aux organisations établies dans l'Union européenne, mais aussi, selon son article 3, aux organisations établies **hors de l'Union** lorsqu'elles proposent des biens ou des services à des personnes qui s'y trouvent, ou suivent leur comportement. Une entreprise de Brazzaville ou de Pointe-Noire qui vend en ligne à des clients en France, ou un prestataire africain qui traite des données pour le compte d'un client européen, peut donc être concerné. Par ailleurs, de nombreux pays africains se sont dotés de leurs propres lois de protection des données, souvent proches dans leurs principes, et la Convention de Malabo de l'Union africaine consacre une partie entière à ce sujet.

## Les principes fondamentaux de l'article 5

<CompareTable
  titleA="Principe"
  titleB="Implication pour la sécurité"
  rows={[
    { a: "Licéité, loyauté et transparence", b: "Un traitement de sécurité, comme la journalisation, doit reposer sur une base légale et être annoncé aux personnes, par exemple dans la charte informatique" },
    { a: "Limitation des finalités", b: "Des journaux collectés pour la sécurité ne doivent pas être réutilisés pour surveiller la productivité des salariés" },
    { a: "Minimisation des données", b: "Ne collecter et stocker que les données strictement nécessaires : cela réduit la surface d'exposition en cas de fuite" },
    { a: "Exactitude", b: "Des données fausses peuvent conduire à de mauvaises décisions, y compris en investigation" },
    { a: "Limitation de la conservation", b: "Supprimer les données au-delà de leur durée de conservation : une vieille sauvegarde oubliée est un risque juridique et technique" },
    { a: "Intégrité et confidentialité", b: "Obligation de sécurité appropriée au risque : chiffrement, contrôle d'accès, journalisation, sauvegardes" },
    { a: "Responsabilité (accountability)", b: "Le responsable de traitement doit pouvoir prouver sa conformité, pas seulement l'affirmer" },
  ]}
/>

<TipCallout>
Le principe d'accountability explique pourquoi la documentation, registre des traitements, analyses d'impact, politiques de sécurité écrites, journal des violations, est elle-même une obligation du RGPD. Ce n'est pas un détail administratif : c'est la preuve exigée en cas de contrôle. Une mesure de sécurité non documentée est, pour l'autorité, une mesure dont l'existence reste à démontrer.
</TipCallout>

### Les bases légales

Tout traitement doit reposer sur l'une des six bases légales de l'article 6 : le consentement, l'exécution d'un contrat, une obligation légale, la sauvegarde des intérêts vitaux, une mission d'intérêt public, ou l'intérêt légitime du responsable, à condition de ne pas porter une atteinte disproportionnée aux droits des personnes. Le considérant 49 du RGPD reconnaît explicitement que garantir la sécurité des réseaux et des informations peut constituer un intérêt légitime. C'est en général sur cette base que reposent la journalisation de sécurité, les solutions de détection et les investigations internes, à condition de rester proportionné.

## L'obligation de sécurité : articles 25 et 32

L'article 25 impose la **protection des données dès la conception et par défaut** (*privacy by design* et *by default*) : les mesures de protection doivent être pensées dès la conception d'un système, et les réglages par défaut doivent être les plus protecteurs.

L'article 32 est l'article de sécurité par excellence. Il impose de mettre en œuvre des mesures techniques et organisationnelles appropriées au risque, en tenant compte de l'état des connaissances, des coûts et de la gravité des risques pour les personnes. Il cite notamment la pseudonymisation et le chiffrement, la capacité à garantir la confidentialité, l'intégrité, la disponibilité et la résilience des systèmes, la capacité à rétablir rapidement l'accès aux données après un incident, et **une procédure visant à tester, analyser et évaluer régulièrement l'efficacité des mesures**. Les tests d'intrusion et les audits de sécurité sont une manière directe de répondre à cette dernière exigence.

Pour les traitements à risque élevé, par exemple une surveillance systématique à grande échelle ou le traitement massif de données sensibles, l'article 35 impose une **analyse d'impact relative à la protection des données** (AIPD) avant la mise en œuvre. L'article 30 impose de tenir un **registre des activités de traitement**, et l'article 37 impose dans certains cas la désignation d'un **délégué à la protection des données** (DPO), interlocuteur naturel de l'équipe sécurité.

## Responsable de traitement et sous-traitant

<CompareTable
  titleA="Responsable de traitement (data controller)"
  titleB="Sous-traitant (data processor)"
  rows={[
    { a: "Détermine les finalités et les moyens essentiels du traitement", b: "Traite les données pour le compte et selon les instructions documentées du responsable" },
    { a: "Ex : une entreprise qui gère les données de ses clients", b: "Ex : un hébergeur cloud, un éditeur SaaS, un prestataire de support, un cabinet d'audit qui accède aux données" },
    { a: "Responsabilité principale, notification de la violation à l'autorité", b: "Obligations propres de sécurité, et obligation d'informer le responsable de toute violation dans les meilleurs délais" },
    { a: "Doit choisir des sous-traitants présentant des garanties suffisantes", b: "Ne peut recruter un autre sous-traitant qu'avec l'autorisation du responsable" },
  ]}
/>

L'article 28 impose qu'un contrat, souvent appelé **accord de sous-traitance** ou DPA (*Data Processing Agreement*), lie le responsable et le sous-traitant. Il doit notamment préciser l'objet, la durée, la nature et la finalité du traitement, les catégories de données et de personnes, l'obligation de confidentialité des intervenants, les mesures de sécurité, le sort des données à la fin de la prestation (restitution ou suppression), et l'assistance du sous-traitant en cas de violation ou d'audit.

<CehCallout>
Un cabinet de pentest qui reçoit un accès à une base de données de production dans le cadre d'un audit devient, le temps de la mission, sous-traitant au sens du RGPD. Cela impose un accord de sous-traitance (DPA) avant le début du test, en plus de l'autorisation écrite et du NDA. En pratique : ne copier que le strict nécessaire pour prouver une vulnérabilité, masquer les données dans le rapport, et supprimer de façon vérifiable toutes les données collectées à la fin de la mission.
</CehCallout>

## Violation de données : l'obligation de notification

### Qu'est-ce qu'une violation ?

Selon l'article 4, une **violation de données à caractère personnel** est une violation de la sécurité entraînant, de manière accidentelle ou illicite, la destruction, la perte, l'altération, la divulgation non autorisée ou l'accès non autorisé à des données personnelles. Cette définition couvre donc la **confidentialité**, mais aussi l'**intégrité** et la **disponibilité**. Un rançongiciel qui chiffre une base clients sans l'exfiltrer est une violation de disponibilité ; un courriel contenant des données envoyé au mauvais destinataire est une violation de confidentialité ; une sauvegarde perdue est une violation de disponibilité, et de confidentialité si elle n'était pas chiffrée.

### Les étapes et les délais

<Steps steps={[
  { title: "Détection et prise de connaissance", description: "L'horloge légale démarre lorsque le responsable de traitement a une certitude raisonnable qu'une violation s'est produite, pas au moment où elle a eu lieu. Une courte phase d'investigation initiale est admise pour établir ce point." },
  { title: "Notification à l'autorité de contrôle (article 33)", description: "Dans les meilleurs délais et, si possible, 72 heures au plus tard après en avoir pris connaissance, sauf si la violation n'est pas susceptible d'engendrer un risque pour les droits et libertés des personnes. En France, l'autorité est la CNIL." },
  { title: "Évaluation du risque pour les personnes", description: "Nature des données, volume, facilité d'identification, gravité des conséquences possibles (usurpation d'identité, discrimination, perte financière)." },
  { title: "Communication aux personnes concernées (article 34)", description: "Si le risque est élevé, par exemple pour des mots de passe en clair ou des données de santé, les personnes sont informées dans les meilleurs délais, en termes clairs et simples." },
  { title: "Documentation interne", description: "Toute violation, même non notifiée, est consignée dans un registre interne avec ses faits, ses effets et les mesures prises (article 33, paragraphe 5)." },
]} />

La notification à l'autorité doit décrire au minimum la nature de la violation, les catégories et le nombre approximatif de personnes et d'enregistrements concernés, les coordonnées du DPO ou d'un point de contact, les conséquences probables et les mesures prises ou envisagées. Si toutes les informations ne sont pas disponibles, elles peuvent être fournies **de manière échelonnée** : on notifie avec ce que l'on sait, puis on complète. Si la notification intervient après 72 heures, elle doit être accompagnée des motifs du retard.

La communication aux personnes n'est pas exigée dans certains cas prévus par l'article 34, notamment lorsque les données étaient protégées par un chiffrement robuste les rendant incompréhensibles pour qui n'a pas la clé, ou lorsque des mesures ultérieures garantissent que le risque élevé ne se matérialisera plus.

| Scénario | Notification à l'autorité ? | Communication aux personnes ? |
| --- | --- | --- |
| Ordinateur portable perdu, disque chiffré avec une clé non compromise | En général non, mais documentation interne | Non |
| Rançongiciel sur la base clients, restaurée en quelques heures, sans exfiltration constatée | Oui, sauf si l'absence de risque est démontrée | Selon le risque, souvent non |
| Base d'utilisateurs avec mots de passe en clair publiée sur un forum | Oui | Oui, risque élevé |
| Dossiers médicaux consultés par un attaquant | Oui | Oui, données sensibles |

<WarningCallout>
Le délai de 72 heures est extrêmement court à l'échelle d'une investigation technique complète. Les organisations notifient donc avec les informations disponibles, puis complètent au fil de l'investigation, plutôt que d'attendre toutes les réponses. Pour l'équipe DFIR, cela signifie produire très tôt des points d'étape factuels, en séparant ce qui est établi de ce qui reste une hypothèse.
</WarningCallout>

### Les sanctions

L'article 83 prévoit deux plafonds d'amendes administratives. Les manquements aux obligations du responsable et du sous-traitant, dont la sécurité (article 32) et la notification des violations (articles 33 et 34), peuvent être sanctionnés jusqu'à 10 millions d'euros ou 2 % du chiffre d'affaires annuel mondial, le montant le plus élevé étant retenu. Les manquements aux principes fondamentaux, aux bases légales, aux droits des personnes ou aux règles de transfert peuvent atteindre 20 millions d'euros ou 4 % du chiffre d'affaires annuel mondial.

## Transferts hors de l'Union européenne

Le chapitre V du RGPD encadre les transferts de données vers des pays tiers. Un transfert est libre vers un pays bénéficiant d'une **décision d'adéquation** de la Commission européenne. Pour les États-Unis, le cadre de protection des données UE-États-Unis (*EU-US Data Privacy Framework*), adopté en 2023, permet les transferts vers les entreprises qui y ont adhéré. Ailleurs, le transfert doit reposer sur des garanties appropriées, le plus souvent les **clauses contractuelles types** adoptées par la Commission. Pour un SOC externalisé, un outil de sécurité en SaaS ou un prestataire situé hors de l'Union, la question du lieu de traitement des journaux doit donc être posée dès le contrat.

## Concilier sécurité et protection des données

La sécurité et la protection des données se renforcent l'une l'autre, mais elles peuvent entrer en tension. Une journalisation exhaustive aide l'investigation mais accumule des données personnelles ; une inspection du trafic chiffré améliore la détection mais expose des correspondances privées.

Quelques règles pratiques permettent de concilier les deux. La journalisation de sécurité repose sur l'intérêt légitime et doit être annoncée, par exemple dans la charte informatique. Les durées de conservation doivent être fixées et appliquées : la CNIL recommande, en règle générale, de conserver les journaux de sécurité entre six mois et un an. Les accès aux journaux sont restreints et eux-mêmes journalisés. Les rapports d'audit et d'incident masquent les données personnelles qui ne sont pas indispensables. Enfin, les pentests réalisés sur des données de production font l'objet d'un DPA et d'une suppression vérifiable des données en fin de mission.

<AuditCallout>
ISO/IEC 27001:2022 relie directement sécurité et vie privée dans son Annexe A : la mesure A.5.34 traite de la protection de la vie privée et des données à caractère personnel, A.8.11 du masquage des données, A.8.10 de la suppression des informations et A.5.33 de la protection des enregistrements. La norme ISO/IEC 27701 étend le système de management de la sécurité à la gestion de la vie privée.
</AuditCallout>

## Erreurs fréquentes

La première erreur est de **croire qu'une violation implique un vol** : une perte de disponibilité ou une altération en est une aussi. La deuxième est de **faire démarrer les 72 heures à la fin de l'investigation**, alors qu'elles démarrent à la prise de connaissance de la violation. La troisième est de **ne rien documenter** quand on décide de ne pas notifier.

On voit aussi des pentesters **télécharger des bases entières pour prouver une faille**, des équipes **conserver indéfiniment des journaux** « au cas où », des copies de production utilisées **sans masquage** en environnement de test, et des contrats de sous-traitance **signés après le début** de la prestation. Enfin, beaucoup d'organisations situées hors d'Europe **ignorent que le RGPD peut s'appliquer à elles** dès qu'elles ciblent des personnes dans l'Union.

## Lab — Mise en pratique

**Environnement** : Kali Linux (terminal Nyx), Python 3. Tu vas appliquer la minimisation et la pseudonymisation à un journal, repérer des données personnelles dans un export, et calculer une échéance de notification.

<Steps steps={[
  { title: "Créer un journal d'exemple", description: "Crée un petit journal d'accès contenant des adresses IP, des identifiants et des adresses électroniques, comme on en trouve dans un SOC.", code: "mkdir -p ~/lab-rgpd && cd ~/lab-rgpd\nprintf '%s\\n' '2026-03-12T08:01:10Z 192.0.2.10 alice.martin@example.org LOGIN_OK' '2026-03-12T08:03:44Z 198.51.100.23 bob.diallo@example.org LOGIN_FAIL' '2026-03-12T08:03:47Z 198.51.100.23 bob.diallo@example.org LOGIN_FAIL' > acces.log\ncat acces.log" },
  { title: "Repérer les données personnelles", description: "Recherche les adresses électroniques et les adresses IP avec des expressions régulières. Observe qu'un simple journal technique contient déjà plusieurs données personnelles.", code: "grep -oE '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+' acces.log | sort -u\ngrep -oE '([0-9]{1,3}\\.){3}[0-9]{1,3}' acces.log | sort -u" },
  { title: "Pseudonymiser avec une clé secrète", description: "Remplace chaque adresse électronique par un HMAC-SHA256 tronqué, calculé avec une clé secrète. Le même utilisateur garde le même pseudonyme, ce qui permet encore la corrélation, mais le nom n'apparaît plus. Sans la clé, il est très difficile de retrouver l'adresse ; avec elle, c'est possible : ce sont donc toujours des données personnelles.", code: "cat > pseudo.py <<'PY'\nimport hmac, hashlib, re, sys\ncle = b'cle-secrete-a-stocker-dans-un-coffre'\ndef p(m):\n    return 'user_' + hmac.new(cle, m.group(0).encode(), hashlib.sha256).hexdigest()[:12]\nfor ligne in open(sys.argv[1]):\n    print(re.sub(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+', p, ligne), end='')\nPY\npython3 pseudo.py acces.log | tee acces_pseudo.log" },
  { title: "Minimiser", description: "Produis une version minimisée qui ne garde que ce qui est utile à la détection de force brute : horodatage, adresse source et résultat. Compare le volume d'informations conservées.", code: "awk '{print $1, $2, $4}' acces.log | tee acces_min.log" },
  { title: "Appliquer une durée de conservation", description: "Simule une politique de conservation : liste les fichiers de journaux de plus de 365 jours dans un dossier d'archives. En production, cette commande serait suivie d'une suppression sécurisée et documentée.", code: "mkdir -p archives && touch -d '2024-01-15' archives/acces-2024-01.log && touch archives/acces-recent.log\nfind archives -name '*.log' -mtime +365 -print" },
  { title: "Calculer l'échéance des 72 heures", description: "La prise de connaissance d'une violation est actée le 12 mars 2026 à 09:41 UTC. Calcule l'heure limite de notification à l'autorité.", code: "date -u -d '2026-03-12 09:41 UTC + 72 hours' +'%Y-%m-%d %H:%M UTC'" },
  { title: "Qualifier une violation", description: "Raisonnement : un rançongiciel chiffre la base clients d'une entreprise sans preuve d'exfiltration, et la restauration prend trois jours. S'agit-il d'une violation au sens du RGPD ? Faut-il notifier l'autorité, informer les clients ? Justifie avec les articles 4, 33 et 34." },
  { title: "Déterminer les rôles", description: "Raisonnement : un cabinet de pentest reçoit temporairement un accès en lecture à une base de production pour un audit. Quel est son rôle au sens du RGPD, quel document faut-il signer avant le test, et que doit-il faire des données à la fin de la mission ?" },
]} />

## À retenir

- Le RGPD (règlement 2016/679) s'applique depuis 2018 aux organisations établies dans l'Union, et aussi à celles qui ciblent ou suivent des personnes qui s'y trouvent, même depuis l'Afrique.
- La plupart des journaux de sécurité contiennent des données personnelles ; la pseudonymisation ne les fait pas sortir du RGPD, seule une anonymisation irréversible le permet.
- Les principes de l'article 5, notamment minimisation, limitation de la conservation, intégrité et confidentialité, et accountability, guident directement les choix techniques.
- L'article 32 impose une sécurité appropriée au risque, y compris des tests réguliers de l'efficacité des mesures.
- Un prestataire qui accède à des données personnelles, comme un cabinet de pentest sur une base de production, est sous-traitant et doit signer un accord de sous-traitance.
- Une violation couvre la confidentialité, l'intégrité ou la disponibilité ; elle se notifie à l'autorité dans les 72 heures suivant la prise de connaissance, si nécessaire de manière échelonnée, et aux personnes en cas de risque élevé.
- Toute violation, même non notifiée, est documentée en interne.

## Questions de révision

1. Pourquoi un rançongiciel qui rend des données indisponibles, sans les exfiltrer, peut-il constituer une violation de données au sens du RGPD ?
2. Quel est le délai de notification d'une violation à l'autorité de contrôle, et à partir de quel moment court-il ?
3. Dans quel cas faut-il aussi informer directement les personnes concernées, et dans quel cas le chiffrement peut-il dispenser de le faire ?
4. Pourquoi un cabinet de pentest ayant accès à des données de production doit-il signer un accord de sous-traitance ?
5. Quel principe RGPD impose de supprimer une vieille sauvegarde oubliée, et pourquoi est-ce aussi un enjeu de sécurité ?
6. Sur quelle base légale repose généralement la journalisation de sécurité, et quelles limites faut-il respecter ?
7. Une entreprise installée au Congo vend en ligne à des clients situés en France. Le RGPD peut-il s'appliquer à elle ? Explique pourquoi.
