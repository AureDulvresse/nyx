---
title: Cadre légal et éthique du hacking
chapter: 2
course: intro-cyber
difficulty: beginner
duration: 55
tags: [légal, éthique, autorisation, godfrain, rgpd, nis2, divulgation, bug-bounty]
ceh_modules: ["Module 01 - Introduction to Ethical Hacking"]
objectives:
  - Expliquer pourquoi l'autorisation écrite est la seule frontière entre hacking éthique et cybercriminalité
  - Connaître les principaux textes applicables (loi Godfrain, CFAA, Convention de Budapest, RGPD, NIS2, DORA, Cyber Resilience Act) et leur logique
  - Identifier les éléments indispensables d'une autorisation de test et de règles d'engagement
  - Appliquer une démarche de divulgation coordonnée de vulnérabilité (security.txt, CERT, délai de 90 jours)
  - Situer les codes d'éthique professionnels et les programmes de bug bounty
---

## Introduction

Toutes les techniques que tu vas étudier sur Nyx, de la découverte de services à l'analyse de vulnérabilités, sont les mêmes que celles qu'utilisent les criminels. Un scan de ports lancé par un auditeur mandaté et le même scan lancé par un inconnu produisent exactement les mêmes paquets. Ce qui les distingue n'est ni l'outil, ni la compétence, ni même l'intention : c'est **l'autorisation**. Sans elle, le meilleur professionnel commet une infraction.

Ce chapitre pose ce cadre avant d'aller plus loin techniquement, car c'est un prérequis non négociable. Il ne fait pas de toi un juriste : en cas de doute réel, la seule bonne réponse est de demander l'avis d'un juriste. Mais il te donne les réflexes qui évitent les erreurs graves, et le vocabulaire pour dialoguer avec un client, un service juridique ou un délégué à la protection des données.

À la fin de ce chapitre, tu sauras pourquoi et comment obtenir une autorisation de test valable, quels textes s'appliquent en France, en Europe et ailleurs, comment signaler une vulnérabilité découverte par hasard sans te mettre en danger, et quels engagements éthiques prennent les professionnels certifiés.

## Hacking éthique et cybercriminalité

<CompareTable
  titleA="Hacking éthique"
  titleB="Cybercriminalité"
  rows={[
    { a: "Autorisation écrite préalable du propriétaire : périmètre, dates, techniques", b: "Aucune autorisation" },
    { a: "Objectif : identifier les failles pour qu'elles soient corrigées", b: "Objectif : exploiter les failles pour en tirer profit ou nuire" },
    { a: "Rapport détaillé remis au client, données traitées confidentiellement", b: "Aucune transparence, dissimulation des traces" },
    { a: "Encadré par un contrat : convention de service, NDA, règles d'engagement", b: "Aucun cadre contractuel" },
    { a: "Impact maîtrisé : on prouve sans nuire", b: "Impact recherché : vol, chiffrement, revente" },
  ]}
/>

Deux points méritent d'être soulignés. D'abord, l'autorisation doit venir de **la personne qui a le pouvoir de la donner** : le propriétaire du système, ou son représentant habilité. Un salarié du client qui « te donne son accord » sans en avoir le pouvoir ne te protège pas, pas plus qu'un client qui t'autorise à tester un service hébergé chez un tiers sans l'accord de ce tiers. Ensuite, l'autorisation est **limitée** : sortir du périmètre, même d'une seule adresse IP, ou dépasser la fenêtre de test, te replace hors du cadre légal.

<LegalCallout>
Sans autorisation écrite explicite, toute tentative d'intrusion, même « juste pour tester », même sur un système que tu penses mal protégé, est passible de poursuites pénales dans la quasi-totalité des juridictions. L'intention ne change rien au regard de la loi si l'autorisation fait défaut. Cela vaut aussi pour les tests « gentils » : vérifier qu'un formulaire d'un site public est vulnérable, essayer un mot de passe par défaut sur une caméra exposée ou parcourir un répertoire ouvert d'un serveur tiers.
</LegalCallout>

## Les bases légales à connaître

### France : la loi Godfrain et le Code pénal

La **loi n° 88-19 du 5 janvier 1988**, dite **loi Godfrain**, a créé les infractions d'atteinte aux **systèmes de traitement automatisé de données** (STAD). Elles figurent aujourd'hui aux **articles 323-1 à 323-8 du Code pénal**. La notion de STAD est très large : un serveur, un site web, un téléphone, une caméra connectée, un automate industriel en sont.

| Article | Infraction | Peine de base |
| --- | --- | --- |
| 323-1 | Accéder ou se maintenir frauduleusement dans tout ou partie d'un STAD | 3 ans d'emprisonnement et 100 000 € d'amende ; 5 ans et 150 000 € s'il en résulte une suppression ou modification de données ou une altération du fonctionnement |
| 323-2 | Entraver ou fausser le fonctionnement d'un STAD (par exemple un déni de service) | 5 ans et 150 000 € |
| 323-3 | Introduire, extraire, détenir, reproduire, transmettre, supprimer ou modifier frauduleusement des données | 5 ans et 150 000 € |
| 323-3-1 | Importer, détenir, offrir ou mettre à disposition, sans motif légitime, notamment de recherche ou de sécurité informatique, un outil conçu pour commettre ces infractions | Peines de l'infraction correspondante |
| 323-4 | Participer à un groupement formé en vue de préparer ces infractions | Peines de l'infraction correspondante |
| 323-7 | Tentative de ces délits | Mêmes peines que l'infraction |

Les peines sont aggravées quand le système visé est un traitement de données personnelles mis en œuvre par l'État, et des aggravations ont été ajoutées depuis, notamment pour les faits commis en bande organisée.

Trois enseignements pratiques en découlent. Premièrement, l'**accès** et le **maintien** sont deux infractions distinctes : le maintien frauduleux est punissable **même si l'accès initial était fortuit** et sans intention de nuire. Une URL mal protégée trouvée par hasard qui devient une exploration volontaire du système peut déjà constituer l'infraction ; la jurisprudence française l'a confirmé, notamment dans une affaire où un internaute avait téléchargé des documents d'une agence publique accessibles par simple navigation, puis continué alors qu'il savait l'espace non public. Deuxièmement, la **tentative** est punie comme l'infraction. Troisièmement, l'article 323-3-1 rend la détention d'outils offensifs licite seulement en présence d'un **motif légitime**, comme la recherche ou la sécurité informatique : ton activité professionnelle et ton cadre d'apprentissage doivent pouvoir le démontrer.

<WarningCallout>
Point souvent mal compris : le « maintien frauduleux » est puni même sans intention de nuire. Si tu tombes par hasard sur un accès que tu n'aurais pas dû avoir, la bonne réaction est de t'arrêter immédiatement, de ne rien télécharger ni modifier, de noter ce que tu as vu et de le signaler par un canal approprié. Continuer à explorer « pour voir jusqu'où ça va » transforme une découverte fortuite en infraction.
</WarningCallout>

D'autres textes français complètent ce socle : l'**article 226-15** du Code pénal réprime l'interception des correspondances, ce qui concerne la capture de trafic ; les articles **226-16 et suivants** sanctionnent les atteintes aux données personnelles ; et le **Code de la défense** organise les prérogatives de l'État en matière de cyberdéfense, abordées plus bas.

### Les autres juridictions

| Juridiction | Texte | À retenir |
| --- | --- | --- |
| États-Unis | Computer Fraud and Abuse Act (CFAA), 1986 | Texte large ; l'arrêt Van Buren de la Cour suprême (2021) a précisé la notion de dépassement d'accès autorisé, et le ministère de la Justice a indiqué en 2022 ne pas poursuivre la recherche en sécurité menée de bonne foi |
| Royaume-Uni | Computer Misuse Act 1990 | Accès non autorisé, accès en vue d'autres infractions, atteintes au fonctionnement |
| International | Convention de Budapest sur la cybercriminalité (Conseil de l'Europe, 2001) | Premier traité international : harmonise les infractions et la coopération entre États ; ouverte aux pays non européens |
| Nations unies | Convention des Nations unies contre la cybercriminalité, adoptée fin 2024 | Nouveau cadre mondial de coopération, critiqué par des défenseurs des droits pour son champ large |
| Afrique | Convention de l'Union africaine sur la cybersécurité et la protection des données (Convention de Malabo, 2014) | Entrée en vigueur en 2023 ; de nombreux États africains, dont le Congo-Brazzaville, se sont dotés de lois sur la cybersécurité, la cybercriminalité et la protection des données |

Un test peut impliquer plusieurs pays : le client en France, l'hébergeur aux Pays-Bas, un fournisseur SaaS aux États-Unis. Chaque juridiction concernée peut s'appliquer, ce qui renforce l'importance d'un périmètre précis et de l'accord de chaque propriétaire d'infrastructure.

### Europe : données personnelles et régulation de la cybersécurité

Le **RGPD** (Règlement général sur la protection des données, règlement UE 2016/679) s'applique dès qu'un test touche des données à caractère personnel, ce qui arrive presque toujours : annuaire, comptes utilisateurs, journaux, base clients. Le prestataire de test agit alors en **sous-traitant** au sens de l'article 28, ce qui impose un contrat précisant les mesures de sécurité, la confidentialité et la suppression des données à la fin de la mission. Le principe de **minimisation** s'applique : on prouve l'accès à une donnée sans la copier en masse. Le RGPD impose aussi à l'organisation de notifier une violation de données à l'autorité de contrôle, la CNIL en France, dans un délai de **72 heures** quand elle présente un risque pour les personnes.

Plusieurs textes européens récents encadrent désormais la cybersécurité des organisations et des produits. Tu les retrouveras en détail dans le cours Droit et réglementation de la cybersécurité.

| Texte | Objet | Lien avec les tests de sécurité |
| --- | --- | --- |
| NIS2 (directive UE 2022/2555) | Obligations de gestion des risques et de notification d'incidents pour les entités essentielles et importantes de nombreux secteurs | Exige des mesures dont les tests et audits font partie ; encourage la divulgation coordonnée des vulnérabilités, avec un rôle de coordination confié aux CSIRT nationaux |
| DORA (règlement UE 2022/2554) | Résilience opérationnelle numérique du secteur financier, applicable depuis le 17 janvier 2025 | Impose des programmes de tests et, pour certaines entités, des tests d'intrusion fondés sur la menace (TLPT) au moins tous les trois ans |
| Cyber Resilience Act (règlement UE 2024/2847) | Exigences de cybersécurité pour les produits comportant des éléments numériques | Oblige les fabricants à gérer les vulnérabilités et à signaler celles qui sont activement exploitées, avec une montée en charge progressive jusqu'en décembre 2027 |
| AI Act (règlement UE 2024/1689) | Encadrement des systèmes d'intelligence artificielle selon leur niveau de risque | Exige robustesse et cybersécurité pour les systèmes à haut risque, ce qui ouvre la voie aux tests adverses des modèles |

<AuditCallout>
Un test d'intrusion mené dans le cadre d'une certification ISO/IEC 27001:2022, d'une conformité NIS2 ou d'une exigence DORA doit être documenté : périmètre, autorisation, méthodologie, résultats et suivi des corrections. Dans ISO 27001, le contrôle A.8.8 (gestion des vulnérabilités techniques) et le contrôle A.5.35 (revue indépendante de la sécurité de l'information) en sont la base. En France, l'ANSSI qualifie des prestataires d'audit, les PASSI, dont le référentiel impose notamment une convention d'audit signée.
</AuditCallout>

### Les prérogatives de l'État

La loi réserve à l'État certaines actions qui seraient illégales pour un particulier. Les **lois de programmation militaire** successives (2013, 2018, puis 2023) ont inscrit dans le Code de la défense des prérogatives dérogatoires pour l'ANSSI et d'autres services habilités : par exemple caractériser une attaque en cours et en neutraliser les effets, ou, depuis la loi de 2018, déployer des dispositifs de détection chez les opérateurs de communications électroniques, sans consentement individuel de chaque cible. Ces mesures sont strictement encadrées et réservées à la cyberdéfense nationale. Elles ne bénéficient pas aux prestataires privés : même qualifié PASSI, un auditeur reste soumis à l'autorisation de son client.

## L'autorisation de test et les règles d'engagement

Un test commence par un document, pas par une commande. On distingue souvent la **convention** ou le contrat, qui fixe les engagements juridiques et commerciaux, et les **règles d'engagement** (Rules of Engagement, RoE), qui décrivent opérationnellement ce qui est permis.

1. **Le périmètre (scope)** : adresses IP, domaines, applications, comptes de test autorisés, et ce qui est **explicitement exclu**, comme un serveur de production fragile ou un service tiers.
2. **La fenêtre temporelle** : dates et heures autorisées, avec le fuseau horaire.
3. **Les techniques autorisées et interdites** : par exemple, un déni de service, l'ingénierie sociale ou les tests physiques sont souvent exclus ou nécessitent un accord spécifique.
4. **Les contacts et l'escalade** : une personne joignable en permanence côté client, la procédure si le test provoque une panne ou découvre une compromission réelle en cours, et le mot de code éventuel pour arrêter le test.
5. **La gestion des données** : confidentialité (NDA), chiffrement des preuves, durée de conservation et destruction.
6. **Les autorisations des tiers** : accord des hébergeurs ou fournisseurs cloud selon leurs politiques de test.
7. **Les livrables** : format du rapport, niveau de détail, réunion de restitution.
8. **La signature** de personnes habilitées des deux côtés.

<CehCallout>
Le CEH insiste sur les Rules of Engagement : un pentester professionnel ne lance jamais un scan sans document signé, même dans un contexte de confiance apparente. À l'examen, retiens que l'autorisation écrite, le périmètre et les limites du test sont des prérequis, et que tout ce qui n'est pas explicitement autorisé est interdit. Le chapitre suivant détaille comment cette phase de cadrage s'insère dans la méthodologie complète.
</CehCallout>

## La divulgation responsable

### Le principe

Si tu découvres une vulnérabilité en dehors d'un cadre de test formel, par exemple en utilisant normalement un site, la pratique éthique est la **divulgation responsable**, aujourd'hui appelée plus souvent **divulgation coordonnée de vulnérabilité** (Coordinated Vulnerability Disclosure, CVD). L'idée est de laisser à l'organisation le temps de corriger avant que l'information devienne publique, tout en garantissant que la correction aura bien lieu. Les normes **ISO/IEC 29147** (divulgation) et **ISO/IEC 30111** (traitement des vulnérabilités) décrivent ce processus côté organisations.

<Steps steps={[
  { title: "S'arrêter à la preuve minimale", description: "Ne pas exploiter la faille au-delà du strict nécessaire pour la décrire. Ne télécharger, modifier ni conserver aucune donnée, ne pas tester plus loin." },
  { title: "Trouver le bon canal", description: "Chercher un fichier security.txt (RFC 9116) à l'adresse /.well-known/security.txt, une page de divulgation ou un programme de bug bounty. À défaut, passer par le CERT national, CERT-FR en France, ou par l'ANSSI." },
  { title: "Signaler en privé", description: "Décrire la vulnérabilité, son impact potentiel et la façon de la reproduire, sans jamais la rendre publique en premier lieu." },
  { title: "Laisser un délai raisonnable", description: "Généralement 90 jours, un standard de l'industrie popularisé par Google Project Zero, avant toute publication. Le délai peut être ajusté d'un commun accord." },
  { title: "Publier de façon coordonnée", description: "Une fois le correctif disponible, publier éventuellement un avis, souvent avec un identifiant CVE attribué par une autorité de numérotation." },
]} />

```bash
# Vérifier si une organisation publie une politique de divulgation (fichier public, consultation normale)
curl -s https://www.example.com/.well-known/security.txt
```

```text
Contact: mailto:security@example.com
Expires: 2027-06-30T23:00:00.000Z
Preferred-Languages: fr, en
Policy: https://www.example.com/securite/divulgation
```

En France, l'article **L2321-4 du Code de la défense**, issu de la loi pour une République numérique de 2016, permet de signaler de bonne foi une vulnérabilité à l'ANSSI, qui peut préserver l'identité de la personne qui la signale. Ce dispositif ne couvre pas une exploitation abusive ; il protège un signalement fait de bonne foi et sans divulgation publique préalable.

## Les codes d'éthique et les cadres professionnels

Au-delà de la loi, la profession s'est dotée de codes de conduite. Les violer peut entraîner la perte d'une certification, et donc d'un emploi.

<CompareTable
  titleA="Cadre ou organisme"
  titleB="Ce qu'il impose"
  rows={[
    { a: "Code d'éthique EC-Council (CEH)", b: "Un engagement écrit à n'utiliser les compétences que dans un cadre légal et autorisé, à protéger la confidentialité des informations découvertes et à signaler les conflits d'intérêts" },
    { a: "Code d'éthique ISC2 (CISSP)", b: "Quatre canons, dont protéger la société, le bien commun et l'infrastructure, et agir honorablement, honnêtement, justement et légalement ; un manquement peut entraîner la révocation" },
    { a: "Programmes de bug bounty (HackerOne, Bugcrowd, YesWeHack, Intigriti)", b: "Le programme définit un périmètre précis et des règles, et apporte une clause de sauf-conduit (safe harbor) pour les chercheurs qui les respectent" },
  ]}
/>

<TipCallout>
Un programme de bug bounty est en réalité une autorisation de test permanente et publique, limitée à un périmètre défini. C'est le moyen le plus accessible de pratiquer légalement sur de vrais systèmes en production, avec une rémunération à la clé. Lis toujours la politique du programme en entier : les domaines exclus, les techniques interdites et les règles de traitement des données font partie de l'autorisation.
</TipCallout>

Les plateformes d'entraînement comme les labs Nyx, TryHackMe ou Hack The Box offrent un cadre encore plus simple : les machines sont conçues pour être attaquées et l'autorisation découle des conditions d'utilisation. Elles ne t'autorisent pas, en revanche, à attaquer l'infrastructure de la plateforme elle-même ou les autres utilisateurs.

## Erreurs fréquentes

L'erreur la plus grave est de croire qu'une bonne intention suffit. « Je voulais juste les prévenir » ne constitue pas une défense si tu as exploré un système sans autorisation. Viennent ensuite les erreurs de périmètre : tester une adresse IP voisine de celles autorisées, suivre un lien vers un sous-domaine hébergé par un tiers, ou continuer après la fin de la fenêtre. Une autre erreur consiste à obtenir l'accord d'une personne qui n'a pas le pouvoir de le donner, ou un accord oral.

Côté données, on oublie souvent qu'un rapport de test contient des informations très sensibles, et qu'une capture d'écran de base clients est elle-même un traitement de données personnelles. Enfin, publier une vulnérabilité sur un réseau social avant que l'organisation ait pu la corriger expose les utilisateurs et peut engager ta responsabilité.

## Lab — Mise en pratique

**Environnement** : réflexion guidée, avec deux étapes facultatives dans le terminal Nyx Shell qui consultent uniquement des informations publiques.

<Steps steps={[
  { title: "Rédiger un mini-périmètre", description: "Tu es mandaté pour tester le site interne d'une association locale. Rédige un périmètre en huit lignes maximum : cibles, exclusions, dates, techniques interdites, contact d'urgence, gestion des données, livrables, signataires." },
  { title: "Identifier les failles d'une autorisation", description: "On te propose cette autorisation : « Bob, technicien, t'autorise à tester notre site, fais ce que tu veux cette semaine. » Liste au moins cinq problèmes et réécris-la correctement." },
  { title: "Gérer une découverte fortuite", description: "Tu remarques qu'un site public de ta ville affiche une erreur de base de données détaillée quand tu ajoutes une apostrophe dans un champ de recherche. Décris étape par étape ce que tu fais et, surtout, ce que tu ne fais pas." },
  { title: "Chercher un canal de signalement", description: "Vérifie si quelques organisations publient un fichier security.txt. Note les champs Contact, Expires et Policy. Une simple requête vers ce fichier public relève de la navigation normale.", code: "for d in www.cloudflare.com www.google.com www.ssi.gouv.fr; do echo \"== $d\"; curl -s -m 5 https://$d/.well-known/security.txt | grep -iE '^(contact|expires|policy):'; done" },
  { title: "Lire une politique de bug bounty", description: "Choisis un programme public sur une plateforme de bug bounty et relève : le périmètre, les exclusions, les types de vulnérabilités refusés, les techniques interdites et la clause de sauf-conduit." },
  { title: "Appliquer le RGPD à un test", description: "Pendant un test autorisé, tu accèdes à une table contenant 50 000 adresses e-mail de clients. Explique comment prouver l'accès en respectant la minimisation, et ce que doit prévoir le contrat entre le client et ton employeur." },
]} />

## À retenir

- La seule différence fondamentale entre un pentester éthique et un cybercriminel est l'autorisation écrite préalable, donnée par une personne habilitée et limitée à un périmètre et une période.
- En France, la loi Godfrain (articles 323-1 à 323-8 du Code pénal) réprime l'accès et le maintien frauduleux dans un STAD, l'entrave, l'atteinte aux données et la détention d'outils sans motif légitime ; le maintien est punissable même sans intention de nuire.
- CFAA aux États-Unis, Computer Misuse Act au Royaume-Uni, Convention de Budapest et Convention de Malabo structurent le cadre international.
- Le RGPD s'applique dès qu'un test touche des données personnelles ; NIS2, DORA, le Cyber Resilience Act et l'AI Act rendent les tests et la gestion des vulnérabilités obligatoires dans de nombreux contextes.
- Les règles d'engagement fixent périmètre, exclusions, dates, techniques, contacts d'urgence, gestion des données et livrables.
- La divulgation coordonnée passe par un canal privé (security.txt, bug bounty, CERT) et un délai raisonnable, généralement 90 jours.
- Les codes d'éthique EC-Council et ISC2 engagent les certifiés, et les programmes de bug bounty offrent un cadre légal pour pratiquer sur des systèmes réels.

## Questions de révision

1. Quelle est la seule différence fondamentale entre un pentester éthique et un cybercriminel, et qui peut valablement donner l'autorisation ?
2. Quel texte français réprime l'accès et le maintien frauduleux dans un STAD, et pourquoi le maintien peut-il être punissable même après un accès fortuit ?
3. Pourquoi l'article 323-3-1 du Code pénal concerne-t-il directement les professionnels de la sécurité ?
4. Cite six éléments indispensables d'une autorisation de test ou de règles d'engagement.
5. En quoi le RGPD change-t-il la façon de mener un test d'intrusion qui touche une base clients ?
6. Que signifie la divulgation responsable ou coordonnée, quelles en sont les étapes, et quel délai est généralement considéré comme standard ?
7. Pourquoi un programme de bug bounty constitue-t-il une autorisation, et quelles en sont les limites ?
8. Les prérogatives dont dispose l'ANSSI en matière de cyberdéfense peuvent-elles bénéficier à un prestataire d'audit privé ? Justifie.
