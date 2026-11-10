---
title: Cadre légal du hacking éthique et autorisation écrite
chapter: 1
course: droit-cybersecurite
difficulty: beginner
duration: 55
tags: [droit, legal, hacking-ethique, autorisation, code-penal, cfaa, budapest, divulgation]
ceh_modules: ["Module 1 - Introduction to Ethical Hacking"]
objectives:
  - Comprendre la frontière légale entre hacking éthique et infraction pénale
  - Connaître les incriminations françaises des articles 323-1 et suivants du Code pénal et leur logique
  - Identifier les éléments obligatoires d'une autorisation écrite de test et ses limites
  - Réagir correctement à un dépassement de périmètre et à la découverte fortuite d'une vulnérabilité
  - Situer les principaux textes étrangers et internationaux (CFAA, Computer Misuse Act, Convention de Budapest, Convention de Malabo)
---

## Introduction

Tout ce que tu apprends techniquement sur Nyx, scanner, exploiter, extraire des données, est **illégal sans autorisation préalable** dans la quasi-totalité des juridictions. Ce premier chapitre pose la limite la plus importante du métier de pentester : celle qui sépare le hacking éthique du délit pénal. Cette limite ne tient souvent qu'à un document signé et au respect scrupuleux de ce qu'il contient.

Le droit pénal de l'informatique protège un bien précis : l'intégrité et la confidentialité des systèmes d'information d'autrui. Il ne s'intéresse pas à tes intentions pédagogiques ou à ta curiosité. À la fin de ce chapitre, tu sauras quelles infractions s'appliquent, ce qui fait d'un test une activité légale, ce que doit contenir une autorisation écrite, comment réagir quand tu sors du périmètre, et comment ces règles se retrouvent d'un pays à l'autre. Ce chapitre prend comme exemple principal le droit français, très détaillé et souvent cité dans l'espace francophone, puis élargit aux textes internationaux et africains.

## Ce qui distingue le hacking éthique de l'infraction

<LegalCallout>
En France, l'accès ou le maintien frauduleux dans tout ou partie d'un système de traitement automatisé de données (STAD) est réprimé par l'article 323-1 du Code pénal, qui ouvre la série des articles 323-1 et suivants : jusqu'à 3 ans d'emprisonnement et 100 000 euros d'amende, même si l'auteur n'a rien endommagé et a « juste regardé ». L'autorisation du responsable du système est ce qui retire à l'accès son caractère frauduleux : c'est elle, et non la technique, qui distingue juridiquement un pentester d'un délinquant.
</LegalCallout>

La différence entre un pentester et un attaquant n'est **jamais technique** : les mêmes outils, Nmap, Burp Suite, sqlmap ou Metasploit, sont utilisés des deux côtés. La différence est intégralement juridique.

<CompareTable
  titleA="Hacking éthique (légal)"
  titleB="Intrusion (délit pénal)"
  rows={[
    { a: "Autorisation écrite préalable de la personne habilitée à disposer du système", b: "Absence d'autorisation, ou autorisation dépassée en périmètre ou en durée" },
    { a: "Périmètre défini et respecté", b: "Test hors du périmètre convenu, même par erreur ou par curiosité" },
    { a: "Méthodes convenues, données manipulées au strict nécessaire", b: "Extraction, conservation ou divulgation de données au-delà du besoin" },
    { a: "Objectif : identifier des failles pour les corriger, résultats remis au client", b: "Objectif : nuire, voler, extorquer ou simplement « voir si c'est possible »" },
  ]}
/>

Le mot « frauduleusement » est central. En droit pénal, une infraction suppose un élément matériel (l'acte, ici accéder ou se maintenir) et un élément moral (la conscience d'agir sans droit). Le pentester autorisé agit avec droit ; l'attaquant, ou le curieux qui sait qu'il n'a pas été invité, agit sans droit.

## Le Code pénal français, article par article

Les infractions informatiques françaises sont regroupées dans un chapitre du Code pénal consacré aux « atteintes aux systèmes de traitement automatisé de données ». Voici les plus importantes pour un professionnel de la sécurité.

| Article | Comportement visé | Peine principale |
| --- | --- | --- |
| 323-1 | Accéder ou se maintenir frauduleusement dans tout ou partie d'un STAD | 3 ans et 100 000 euros ; peines aggravées en cas de suppression ou de modification de données, ou d'altération du fonctionnement, et encore davantage pour certains systèmes de l'État |
| 323-2 | Entraver ou fausser le fonctionnement d'un STAD (par exemple un déni de service) | 5 ans et 150 000 euros |
| 323-3 | Introduire, extraire, détenir, reproduire, transmettre, supprimer ou modifier frauduleusement des données | 5 ans et 150 000 euros |
| 323-3-1 | Importer, détenir, offrir, céder ou mettre à disposition un outil conçu pour commettre ces infractions, sans motif légitime | Mêmes peines que l'infraction concernée |
| 323-4 | Participer à un groupement formé en vue de préparer ces infractions | Mêmes peines que l'infraction préparée |
| 323-7 | Tentative des délits prévus aux articles 323-1 à 323-3-1 | Mêmes peines que l'infraction consommée |

Plusieurs points méritent l'attention d'un pentester.

**Le maintien est une infraction autonome.** Même si tu accèdes à un système par hasard, par exemple parce qu'une page d'administration n'était pas protégée, rester dans ce système et en explorer le contenu une fois que tu sais que tu n'y as pas ta place peut constituer un maintien frauduleux. La Cour de cassation l'a illustré en 2015 dans une affaire très commentée, dite « Bluetouff » : une personne avait trouvé, via un moteur de recherche, des documents d'un organisme public sur un serveur mal protégé, avait constaté la présence d'un contrôle d'accès, puis avait continué à naviguer et à télécharger. Sa condamnation pour maintien frauduleux et vol de données a été confirmée. La leçon est claire : **l'absence de protection technique ne vaut pas autorisation**.

**La tentative est punie comme l'infraction.** Lancer une attaque par force brute contre un service hors périmètre, même sans succès, peut donc être poursuivi.

**Les outils sont à double usage.** L'article 323-3-1 vise la détention et la diffusion d'outils d'attaque, mais il prévoit l'exception du « motif légitime, notamment de recherche ou de sécurité informatique ». Un pentester qui détient Metasploit dans le cadre de son activité professionnelle a un motif légitime ; publier un outil d'exploitation clé en main sur un forum d'attaquants n'en a pas. Garde la trace du cadre professionnel ou pédagogique dans lequel tu utilises ces outils.

## Les éléments obligatoires d'une autorisation écrite

<Steps steps={[
  { title: "Identité des parties", description: "Qui commande le test (le client, représenté par une personne ayant pouvoir de l'engager) et qui l'exécute (le pentester ou le cabinet, avec les noms des intervenants)." },
  { title: "Périmètre exact", description: "Adresses IP, plages, domaines, applications et environnements précisément listés. Tout ce qui n'est pas listé est hors périmètre par défaut, et les exclusions explicites sont également écrites." },
  { title: "Fenêtre temporelle", description: "Dates et heures précises de début et de fin, avec le fuseau horaire, et les éventuelles plages interdites (heures de forte activité, clôture comptable)." },
  { title: "Type de test autorisé", description: "Boîte noire, grise ou blanche ; tests de déni de service autorisés ou non ; ingénierie sociale autorisée ou non ; exploitation et post-exploitation autorisées ou limitées à l'identification." },
  { title: "Contact d'urgence", description: "Une personne joignable côté client à tout moment de la fenêtre de test, pour arrêter le test ou réagir si un service est perturbé de façon imprévue." },
  { title: "Signature des deux parties", description: "Sans signature d'un représentant habilité, le document n'a pas de valeur d'autorisation. Un responsable technique sans délégation ne peut pas autoriser un test sur des systèmes que son entreprise ne lui a pas confiés." },
]} />

Une autorisation solide précise aussi les **règles d'engagement** (*rules of engagement*) : adresses IP sources utilisées par les testeurs, pour que le SOC puisse les reconnaître ; traitement des données sensibles rencontrées ; conduite à tenir en cas de découverte d'une vulnérabilité critique ou d'une compromission antérieure ; modalités de communication sécurisée des résultats.

### Qui peut autoriser quoi ?

Une question souvent négligée est celle de la **légitimité du signataire sur le système testé**. Un client ne peut autoriser un test que sur ce dont il dispose. Si son site est hébergé chez un prestataire, que sa messagerie est un service SaaS, ou que son application tourne chez un fournisseur cloud, une partie de l'infrastructure appartient à un tiers. Les grands fournisseurs cloud publient des politiques de test d'intrusion qui précisent ce que leurs clients peuvent tester sans accord préalable et ce qui reste interdit, comme le déni de service contre l'infrastructure partagée. Avant tout test, vérifie ces politiques et, pour un hébergeur ou un éditeur SaaS, obtiens si nécessaire son accord écrit.

<WarningCallout>
Un courriel informel du type « vas-y, teste notre site » ne constitue pas une autorisation fiable. Il ne précise ni périmètre, ni dates, ni type de test, et rien ne prouve que son auteur avait le pouvoir d'engager l'organisation. En cas de litige, seul un document écrit, signé par une personne habilitée et précisant le périmètre exact, protège réellement le pentester, y compris face à son propre client si un incident survient.
</WarningCallout>

## Le dépassement de périmètre (scope creep)

<CehCallout>
Le « scope creep », ou dépassement de périmètre, est l'erreur la plus fréquente et la plus dangereuse juridiquement : découvrir par hasard, en testant le système autorisé, un accès vers un système non listé dans l'autorisation, et l'explorer quand même. Même sans intention malveillante, c'est un accès non autorisé à ce second système. Question d'examen typique : face à un système hors périmètre, on documente, on s'arrête et on informe le client.
</CehCallout>

La règle professionnelle est simple et s'applique dans cet ordre : tu **documentes** la découverte (comment, quand, quelle information tu as vue sans aller plus loin), tu **t'arrêtes immédiatement** sur ce système, tu **informes** ton contact client par un canal convenu, et tu **attends une extension écrite** du périmètre avant toute nouvelle action. Si la découverte révèle un risque grave et immédiat, par exemple une base de données exposée publiquement, l'information du client devient urgente, mais elle ne t'autorise toujours pas à l'explorer.

## Découvrir une vulnérabilité hors de toute mission

Il arrive de découvrir une faille sans aucun contrat, en naviguant sur un site, en utilisant une application ou en faisant de la veille. Le cadre juridique est alors délicat, car tout test supplémentaire peut être qualifié d'accès ou de maintien frauduleux.

Plusieurs mécanismes encadrent la **divulgation responsable**. De nombreuses organisations publient une politique de divulgation de vulnérabilités (VDP) ou un programme de *bug bounty*, qui précise ce qui peut être testé et comment signaler, avec parfois un engagement à ne pas poursuivre les chercheurs de bonne foi (*safe harbor*). Le fichier `security.txt`, standardisé par la RFC 9116 et placé à l'adresse `/.well-known/security.txt` d'un site, indique le contact sécurité. Les normes ISO/IEC 29147 (divulgation de vulnérabilités) et ISO/IEC 30111 (traitement des vulnérabilités) décrivent les bonnes pratiques côté éditeur.

En France, l'article L. 2321-4 du Code de la défense, issu de la loi pour une République numérique de 2016, permet à une personne de bonne foi de signaler une vulnérabilité à l'ANSSI, qui préserve alors la confidentialité de son identité. Ce mécanisme protège la source du signalement ; il ne constitue pas une immunité pour des tests intrusifs menés sans autorisation.

<TipCallout>
Si tu découvres une faille sans mission, n'en démontre pas l'exploitation et ne télécharge aucune donnée « pour prouver ». Note ce que tu as observé, cherche le contact sécurité (security.txt, programme de bug bounty, CERT national) et signale de façon factuelle. Plus ton signalement est sobre, plus ta bonne foi est évidente.
</TipCallout>

## Panorama des textes étrangers et internationaux

Les mêmes principes se retrouvent presque partout, avec des différences de vocabulaire et de sanctions.

<CompareTable
  titleA="Texte et juridiction"
  titleB="Ce qu'il couvre"
  rows={[
    { a: "Code pénal, articles 323-1 à 323-8 (France)", b: "Accès et maintien frauduleux, entrave, atteintes aux données, outils, groupements, tentative" },
    { a: "Computer Fraud and Abuse Act, CFAA, codifié au 18 U.S.C. § 1030 (États-Unis)", b: "Accès sans autorisation ou au-delà de l'autorisation à un ordinateur protégé" },
    { a: "Computer Misuse Act 1990 (Royaume-Uni)", b: "Accès non autorisé, accès en vue d'autres infractions, actes non autorisés altérant un ordinateur, fourniture d'outils" },
    { a: "Convention sur la cybercriminalité dite de Budapest (Conseil de l'Europe, 2001)", b: "Harmonisation des incriminations et coopération internationale, ouverte aux États non européens" },
    { a: "Convention de Malabo (Union africaine, 2014)", b: "Cybersécurité, protection des données personnelles, transactions électroniques et cybercriminalité à l'échelle africaine" },
  ]}
/>

**Aux États-Unis**, le CFAA punit l'accès « sans autorisation » ou « en excédant un accès autorisé ». En 2021, dans l'arrêt *Van Buren v. United States*, la Cour suprême a interprété restrictivement cette seconde formule : elle vise l'accès à des zones d'un système auxquelles la personne n'a pas droit, pas le simple mauvais usage d'informations auxquelles elle avait légitimement accès. En 2022, le ministère de la Justice américain a par ailleurs annoncé qu'il ne poursuivrait pas, au titre du CFAA, la recherche en sécurité menée de bonne foi. Ces évolutions ne dispensent pas d'autorisation : elles réduisent le risque pour des chercheurs prudents, pas pour des testeurs imprudents.

**Au Royaume-Uni**, le Computer Misuse Act de 1990 distingue l'accès non autorisé (section 1), l'accès avec l'intention de commettre d'autres infractions (section 2), les actes non autorisés qui altèrent le fonctionnement d'un ordinateur (section 3) et la fabrication ou la fourniture d'outils (section 3A).

**La Convention de Budapest**, ouverte à la signature en 2001 et entrée en vigueur en 2004, est le premier traité international sur la cybercriminalité. Ses articles 2 à 6 demandent aux États d'incriminer l'accès illégal, l'interception illégale, l'atteinte à l'intégrité des données, l'atteinte à l'intégrité du système et l'abus de dispositifs. Elle organise surtout la coopération : entraide judiciaire, conservation rapide des données, réseau de points de contact disponibles en permanence. Un deuxième protocole additionnel, adopté en 2022, renforce la coopération pour l'obtention des preuves électroniques. Elle n'est pas une loi pénale directement applicable aux individus : ce sont les lois nationales prises pour l'appliquer qui le sont. Plusieurs États africains y sont parties, dont le Sénégal, le Maroc, le Ghana et le Nigeria.

**La Convention de Malabo**, adoptée par l'Union africaine en 2014, est entrée en vigueur en 2023 après avoir atteint le nombre de ratifications requis. Elle couvre à la fois la protection des données personnelles, la cybersécurité et la lutte contre la cybercriminalité. Enfin, l'Assemblée générale des Nations unies a adopté fin 2024 une convention contre la cybercriminalité, ouverte à la signature en 2025.

Pour un professionnel basé au Congo-Brazzaville ou ailleurs en Afrique, le réflexe est le même qu'en France : identifier la loi nationale applicable à la cybercriminalité et à la protection des données, la République du Congo s'étant dotée de textes sur ces sujets, vérifier les conventions ratifiées par l'État, et garder en tête qu'une intrusion peut relever de plusieurs droits à la fois : celui du pays depuis lequel tu agis, celui où se trouve le système, et celui où se trouve son propriétaire. Pour les articles précis et les peines, réfère-toi toujours au texte officiel en vigueur.

## Erreurs fréquentes

La première erreur est de **commencer avant la signature**, parce que le client est pressé et a donné son accord oral. La deuxième est de **tester une cible ajoutée oralement** en cours de mission, sans avenant écrit. La troisième est de **confondre le client et le propriétaire** de l'infrastructure, par exemple en testant agressivement un service hébergé par un tiers.

On voit aussi des pentesters **poursuivre après la fin de la fenêtre temporelle** pour « terminer un scan », **conserver des données** extraites au-delà de la mission, ou **prouver une faille sur un site tiers** découvert par hasard en extrayant quelques enregistrements. Chacune de ces erreurs transforme une activité légale en infraction potentielle.

## Lab — Mise en pratique

**Environnement** : Kali Linux (terminal Nyx). Tu vas transformer une autorisation écrite en garde-fou technique : un fichier de périmètre et un petit script qui refuse toute cible non autorisée, puis raisonner sur deux situations.

<Steps steps={[
  { title: "Rédiger le périmètre", description: "Crée un fichier de périmètre qui reprend ce qu'une autorisation pourrait contenir : plages et domaines autorisés, exclusions explicites et fenêtre de test en UTC.", code: "mkdir -p ~/mission-001 && cd ~/mission-001\nprintf '%s\\n' 'IN 10.10.0.0/24' 'IN app.client.lab' 'OUT 10.10.0.5' 'WINDOW 2026-03-10T08:00Z 2026-03-14T18:00Z' > perimetre.txt\ncat perimetre.txt" },
  { title: "Écrire un vérificateur de périmètre", description: "Écris un script Python qui lit le fichier et indique si une cible est dans le périmètre, en tenant compte des exclusions et de la fenêtre temporelle.", code: "cat > scope.py <<'PY'\nimport sys, ipaddress, datetime as dt\nrules = [l.split() for l in open('perimetre.txt') if l.strip()]\ndef ok(target):\n    now = dt.datetime.now(dt.timezone.utc)\n    for r in rules:\n        if r[0] == 'WINDOW':\n            start = dt.datetime.fromisoformat(r[1].replace('Z', '+00:00'))\n            end = dt.datetime.fromisoformat(r[2].replace('Z', '+00:00'))\n            if not start <= now <= end:\n                return False, 'hors fenetre temporelle'\n    if any(r[0] == 'OUT' and r[1] == target for r in rules):\n        return False, 'exclusion explicite'\n    for r in rules:\n        if r[0] != 'IN':\n            continue\n        try:\n            if ipaddress.ip_address(target) in ipaddress.ip_network(r[1]):\n                return True, 'plage ' + r[1]\n        except ValueError:\n            if target == r[1]:\n                return True, 'domaine ' + r[1]\n    return False, 'non liste donc hors perimetre'\nfor t in sys.argv[1:]:\n    print(t, ok(t))\nPY\npython3 scope.py 10.10.0.20 10.10.0.5 10.10.1.7 app.client.lab backup.client.lab" },
  { title: "Observer l'effet de la fenêtre", description: "Selon la date du jour, toutes les cibles peuvent être refusées pour « hors fenêtre temporelle ». Modifie la ligne WINDOW pour inclure aujourd'hui, relance, et observe que l'exclusion explicite et les cibles non listées restent refusées.", code: "nano perimetre.txt\npython3 scope.py 10.10.0.20 10.10.0.5 backup.client.lab" },
  { title: "Brancher le garde-fou sur un outil", description: "Utilise le vérificateur avant de lancer un scan : la commande n'est exécutée que si la cible est autorisée. C'est une habitude simple qui évite les erreurs de frappe coûteuses.", code: "cible=10.10.0.5\npython3 scope.py $cible | grep -q True && nmap -sV $cible || echo \"REFUS : $cible hors perimetre\"" },
  { title: "Tenir un journal de mission", description: "Crée un journal horodaté en UTC de tes actions. En cas de contestation, il prouve ce que tu as fait, quand, et que tu es resté dans le périmètre.", code: "log() { echo \"$(date -u +%Y-%m-%dT%H:%M:%SZ) $*\" >> journal_mission.txt; }\nlog 'Debut de mission, perimetre verifie'\ncat journal_mission.txt" },
  { title: "Identifier les manques d'une autorisation", description: "Raisonnement : un client autorise par courriel un test de « son serveur web », sans préciser de dates ni de périmètre technique, et le site est hébergé chez un prestataire. Liste tout ce qui manque et à qui il faut encore demander un accord." },
  { title: "Réagir à un dépassement de périmètre", description: "Raisonnement : pendant un test autorisé sur app.client.lab, tu découvres un accès non protégé vers backup.client.lab, absent de l'autorisation. Écris dans l'ordre les actions que tu effectues et le message que tu envoies au contact client." },
]} />

## À retenir

- La différence entre hacking éthique et délit pénal n'est jamais technique : elle repose sur une autorisation préalable de la personne habilitée et sur le respect de son périmètre.
- En France, l'article 323-1 du Code pénal punit l'accès ou le maintien frauduleux dans un STAD de 3 ans et 100 000 euros, même sans dommage ; l'entrave et les atteintes aux données sont punies plus sévèrement, et la tentative comme l'infraction.
- L'absence de protection technique ne vaut pas autorisation, et rester dans un système où l'on sait ne pas avoir sa place constitue un maintien frauduleux.
- Une autorisation valable précise les parties, le périmètre exact, la fenêtre temporelle, le type de test, un contact d'urgence et les signatures ; elle ne peut couvrir que ce dont le client dispose.
- Face à un système hors périmètre : documenter, s'arrêter, informer, attendre une extension écrite.
- Une vulnérabilité découverte hors mission se signale sobrement, sans exploitation, via les canaux de divulgation prévus.
- CFAA, Computer Misuse Act, Convention de Budapest et Convention de Malabo reprennent les mêmes principes ; la loi nationale applicable doit toujours être vérifiée dans son texte officiel.

## Questions de révision

1. Qu'est-ce qui distingue juridiquement un pentester d'un attaquant, si les outils utilisés sont identiques ?
2. Pourquoi l'accès à un serveur non protégé peut-il quand même conduire à une condamnation pour maintien frauduleux ?
3. Cite les six éléments d'une autorisation écrite de test d'intrusion et explique le rôle du contact d'urgence.
4. Que doit faire un pentester qui découvre, par hasard, un accès à un système hors périmètre ?
5. Pourquoi un client ne peut-il pas, à lui seul, autoriser un test agressif sur l'infrastructure de son hébergeur ?
6. Quel est le rôle de la Convention de Budapest, et pourquoi n'est-elle pas directement une loi pénale applicable aux individus ?
7. Comment réagirais-tu, juridiquement et concrètement, si tu découvrais une faille sur un site web en dehors de toute mission ?
