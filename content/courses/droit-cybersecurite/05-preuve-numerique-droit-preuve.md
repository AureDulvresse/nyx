---
title: Preuve numérique et droit de la preuve
chapter: 5
course: droit-cybersecurite
difficulty: advanced
duration: 55
tags: [droit, preuve-numerique, forensics, chaine-custody, recevabilite, iso27037, eidas]
ceh_modules: ["Module 1 - Introduction to Ethical Hacking"]
objectives:
  - Comprendre les conditions de recevabilité et de force probante d'une preuve numérique
  - Distinguer les régimes de preuve en matière pénale et civile, et la question de la loyauté
  - Appliquer les principes de chaîne de custody et les normes ISO/IEC 27037 et suivantes
  - Identifier les erreurs qui rendent une preuve irrecevable ou fragile
  - Connaître les outils juridiques de la preuve électronique (écrit électronique, signature, horodatage, constat)
---

## Introduction

Ce chapitre fait le pont entre le droit et les compétences forensiques approfondies dans le cours DFIR. Une preuve technique parfaitement identifiée peut devenir juridiquement inutilisable, ou du moins perdre toute force de conviction, si sa collecte, sa conservation ou sa documentation ne respecte pas des règles précises. Un excellent analyste sans culture juridique de la preuve peut produire une investigation techniquement brillante mais inexploitable devant un tribunal, un conseil de prud'hommes ou un assureur.

À la fin de ce chapitre, tu sauras ce qui rend une preuve numérique recevable et convaincante, comment les juges apprécient la preuve en matière pénale et civile, comment tenir une chaîne de custody irréprochable, quelles normes encadrent la collecte, et quelles erreurs éviter absolument. Les exemples s'appuient sur le droit français ; les principes d'intégrité, de traçabilité et de licéité sont communs à la plupart des systèmes juridiques, y compris en Afrique francophone, où il faut se référer au code de procédure du pays concerné.

## Recevabilité et force probante : deux questions distinctes

Face à une preuve, un juge se pose deux questions. La première est celle de la **recevabilité** : cette preuve peut-elle être versée au débat, ou doit-elle être écartée, par exemple parce qu'elle a été obtenue de façon illicite ? La seconde est celle de la **force probante** : une fois admise, quel poids lui accorder ? Une capture d'écran sans contexte peut être recevable mais ne convaincre personne ; une image disque scellée par hash, collectée selon une procédure documentée, aura un poids bien supérieur.

<CompareTable
  titleA="Critère"
  titleB="En pratique"
  rows={[
    { a: "Intégrité", b: "La preuve n'a pas été altérée depuis sa collecte : son empreinte hash reste identique à chaque vérification" },
    { a: "Authenticité", b: "La preuve provient bien de la source qu'elle prétend représenter : tel disque, tel serveur, tel compte" },
    { a: "Traçabilité", b: "Chaque manipulation est documentée : qui, quand, comment, pourquoi, sans période non expliquée" },
    { a: "Licéité de la collecte", b: "La preuve n'a pas été obtenue par un moyen lui-même illégal, comme un accès non autorisé ou une atteinte disproportionnée à la vie privée" },
  ]}
/>

Ces quatre critères, intégrité, authenticité, traçabilité et licéité, sont la grille de lecture à garder en tête à chaque étape d'une investigation.

## Les régimes de preuve

### En matière pénale : la liberté de la preuve

En procédure pénale française, l'article 427 du Code de procédure pénale pose le principe de la **liberté de la preuve** : hors les cas où la loi en dispose autrement, les infractions peuvent être établies par tout mode de preuve, et le juge décide d'après son intime conviction. Une preuve numérique est donc admissible par principe, et c'est sa fiabilité qui fera la différence.

La question de la **loyauté** se pose différemment selon qui produit la preuve. Les enquêteurs publics sont tenus à une obligation de loyauté : ils ne peuvent pas provoquer une infraction ni contourner les règles de procédure. Pour les preuves apportées par une partie privée, par exemple une entreprise victime, la chambre criminelle de la Cour de cassation admet en principe qu'elles ne soient pas écartées au seul motif qu'elles auraient été obtenues de façon illicite ou déloyale, le juge en appréciant librement la valeur.

### En matière civile : l'écrit électronique et la loyauté encadrée

En matière civile, le Code civil reconnaît l'**écrit électronique**. Son article 1366 lui donne la même force probante que l'écrit sur papier, à condition que l'on puisse dûment identifier la personne dont il émane et qu'il soit établi et conservé dans des conditions de nature à en garantir l'intégrité. L'article 1367 encadre la **signature électronique**. Au niveau européen, le règlement eIDAS (règlement 910/2014, modifié en 2024 par le règlement 2024/1183 dit eIDAS 2) définit les signatures, cachets et horodatages électroniques, dont les versions **qualifiées** bénéficient d'une présomption de fiabilité.

Sur la loyauté, la jurisprudence civile a évolué. Dans une décision du 22 décembre 2023, l'assemblée plénière de la Cour de cassation a admis qu'une preuve obtenue de manière déloyale n'est pas automatiquement écartée : le juge vérifie si sa production est indispensable à l'exercice du droit à la preuve et si l'atteinte aux droits de l'autre partie est strictement proportionnée au but poursuivi.

<LegalCallout>
Ces assouplissements ne font pas d'une collecte illicite une collecte sans risque. D'abord, le juge peut toujours écarter une preuve, ou lui retirer tout poids, si l'atteinte aux droits de l'autre partie est disproportionnée. Ensuite, et surtout, celui qui collecte une preuve en accédant sans droit à un système commet lui-même une infraction (article 323-1 du Code pénal, chapitre 1). La légalité de la collecte reste donc la règle : une preuve obtenue hors du périmètre autorisé peut être jugée irrecevable et exposer l'enquêteur à des poursuites.
</LegalCallout>

### La collecte en entreprise et la vie privée

Une investigation interne touche souvent aux données de salariés. En droit du travail français, les fichiers et courriels présents sur un poste professionnel sont présumés avoir un caractère professionnel, et l'employeur peut y accéder. En revanche, depuis l'arrêt dit « Nikon » de la chambre sociale de la Cour de cassation en 2001, un employeur ne peut pas, en principe, prendre connaissance des fichiers identifiés comme personnels par le salarié hors de sa présence ou sans l'avoir appelé, sauf risque ou événement particulier. Une investigation interne doit donc être cadrée avec le service juridique et, si nécessaire, menée en présence du salarié ou d'un tiers de confiance, avec une collecte proportionnée au besoin.

## La chaîne de custody

La chaîne de custody (chaîne de conservation) documente le parcours complet d'une preuve, de sa collecte à sa présentation éventuelle devant une juridiction. Elle garantit qu'elle n'a pas pu être altérée sans que cela soit détecté.

<Steps steps={[
  { title: "Collecte initiale", description: "Qui a collecté la preuve, quand (en UTC), où, comment (outil et version), en présence de qui, avec calcul immédiat d'une empreinte cryptographique SHA-256." },
  { title: "Scellement et étiquetage", description: "Chaque pièce reçoit un identifiant unique ; les supports physiques sont placés sous scellé numéroté, photographiés, et le numéro est reporté dans le registre." },
  { title: "Stockage sécurisé", description: "Support identifié, accès restreint et journalisé, original préservé et copie de travail distincte pour l'analyse." },
  { title: "Chaque transfert documenté", description: "Toute personne qui reçoit la preuve, à quel moment, pour quelle raison, avec signature de celui qui remet et de celui qui reçoit, sans rupture dans la chronologie." },
  { title: "Vérification d'intégrité à chaque étape", description: "Recalcul du hash à chaque transfert et avant chaque analyse, pour prouver qu'aucune altération n'a eu lieu." },
]} />

```text
FICHE DE CHAÎNE DE CUSTODY — Pièce INC031-P03

Preuve : Image disque du serveur WEB-PROD-03
Hash SHA-256 à la collecte : 8f14e45fceea167a5a36dedd4bea2543...
Collecté par : J. Martin, le 12/03/2026 à 09:15 UTC, via dc3dd sur bloqueur d'écriture matériel
Témoin : R. Okemba (RSSI)
Stocké : coffre numérique chiffré, accès restreint à 2 personnes habilitées, accès journalisés
Transfert 1 : copie remise à l'analyste K. Diallo le 12/03/2026 à 14:00 UTC pour analyse
              Remis par : J. Martin (signature)   Reçu par : K. Diallo (signature)
Vérification du hash après transfert : 8f14e45fceea167a5a36dedd4bea2543... (identique, intègre)
```

<CehCallout>
En DFIR, l'utilisation d'un bloqueur d'écriture (write-blocker), matériel ou logiciel, lors de l'acquisition d'un disque n'est pas qu'une bonne pratique technique : c'est un élément de preuve en soi, qui démontre que l'original n'a subi aucune écriture accidentelle pendant sa copie. Points d'examen classiques : le hash prouve l'intégrité, la chaîne de custody prouve la traçabilité, et un transfert sans recalcul du hash est une rupture de la chaîne.
</CehCallout>

## Les normes qui encadrent la collecte

Plusieurs normes et guides décrivent les bonnes pratiques reconnues. S'y conformer renforce considérablement la force probante d'une investigation, car l'on peut montrer que la méthode suivie est celle de la profession.

| Référence | Objet |
| --- | --- |
| ISO/IEC 27037 | Identification, collecte, acquisition et préservation des preuves numériques |
| ISO/IEC 27041 | Assurance de l'aptitude et de l'adéquation des méthodes d'investigation |
| ISO/IEC 27042 | Analyse et interprétation des preuves numériques |
| ISO/IEC 27043 | Principes et processus d'investigation sur incident |
| RFC 3227 | Bonnes pratiques de collecte et d'archivage des preuves, dont l'ordre de volatilité |
| NIST SP 800-86 | Intégration des techniques forensiques dans la réponse à incident |

ISO/IEC 27037 introduit notamment la notion de **premier intervenant sur la preuve numérique** (*digital evidence first responder*), la personne autorisée et formée qui intervient la première sur les lieux, et insiste sur trois qualités de la démarche : elle doit être **auditable**, **reproductible** et **justifiable**. Un tiers compétent qui suit la même procédure doit obtenir le même résultat.

ISO/IEC 27001:2022 renvoie elle aussi à ce sujet dans sa mesure A.5.28, consacrée à la collecte des preuves : l'organisation doit établir des procédures pour identifier, collecter, acquérir et préserver les preuves liées aux incidents.

## Les autres outils juridiques de la preuve électronique

Tous les éléments à prouver ne sont pas des disques. Plusieurs outils renforcent la valeur d'une preuve électronique.

- **L'horodatage** permet de démontrer qu'un document ou une empreinte existait à une date donnée. Un horodatage qualifié au sens d'eIDAS bénéficie d'une présomption d'exactitude de la date et d'intégrité des données.
- **La signature électronique** des journaux, des manifestes de hash ou des rapports permet d'en garantir l'origine et l'intégrité.
- **La journalisation infalsifiable**, par exemple des journaux centralisés sur un stockage à écriture unique (WORM) ou chaînés cryptographiquement, renforce la valeur probante des journaux, que la défense pourrait sinon accuser d'avoir été modifiés.
- **Le constat par un commissaire de justice**, profession qui a remplacé celle d'huissier de justice en France en 2022, permet de faire constater officiellement le contenu d'un site web, d'une publication ou d'un écran, par exemple une fuite de données publiée sur un forum. La norme NF Z67-147 décrit le mode opératoire d'un constat sur Internet.

## Erreurs qui rendent une preuve irrecevable ou fragile

<WarningCallout>
Travailler directement sur le système original plutôt que sur une copie forensique, même en pensant « juste regarder », est l'erreur la plus classique. Une simple consultation de fichier peut modifier des métadonnées, comme la date de dernier accès, et rompre l'intégrité de la preuve originale. La défense n'aura alors aucune peine à soutenir que la preuve a pu être modifiée, y compris volontairement.
</WarningCallout>

Les autres erreurs fréquentes sont les suivantes. L'**absence de hash à la collecte** rend impossible de prouver ensuite que la preuve n'a pas été modifiée. Une **rupture dans la chaîne de custody**, c'est-à-dire une période non documentée pendant laquelle la preuve a été accessible sans traçabilité, ouvre la porte à la contestation. Une **collecte réalisée hors du périmètre légalement autorisé** expose à l'irrecevabilité et à des poursuites contre le collecteur. Une **documentation rédigée après coup**, de mémoire, plutôt qu'en temps réel pendant la collecte, introduit un doute sur l'exactitude de la traçabilité. Enfin, des **horodatages sans fuseau horaire** ou issus d'horloges non synchronisées fragilisent toute la chronologie.

## Lab — Mise en pratique

**Environnement** : Kali Linux (terminal Nyx). Tu vas tenir une chaîne de custody complète pour une pièce numérique : collecte scellée par hash, registre des transferts, manifeste signé, et détection d'une altération.

<Steps steps={[
  { title: "Collecter une pièce et la sceller", description: "Simule une pièce à conviction, calcule son hash et ouvre le registre de custody avec la première ligne : la collecte.", code: "mkdir -p ~/lab-preuve && cd ~/lab-preuve\nhead -c 1048576 /dev/urandom > INC031-P03_image.dd\nH=$(sha256sum INC031-P03_image.dd | cut -d' ' -f1)\necho \"horodatage_utc;piece;action;de;vers;sha256\" > custody.csv\necho \"$(date -u +%FT%TZ);INC031-P03;collecte;-;J.Martin;$H\" >> custody.csv\ncat custody.csv" },
  { title: "Signer le manifeste", description: "Crée une clé de test, puis signe le manifeste de hash. La signature prouve qui a établi le manifeste et qu'il n'a pas été modifié depuis.", code: "gpg --batch --pinentry-mode loopback --passphrase '' --quick-gen-key 'Analyste Lab <analyste@lab.local>' default default never\nsha256sum INC031-P03_image.dd > MANIFESTE.sha256\ngpg --batch --yes --clearsign MANIFESTE.sha256\ncat MANIFESTE.sha256.asc" },
  { title: "Transférer et vérifier", description: "Simule la remise de la pièce à un second analyste : copie dans un autre dossier, recalcul du hash à réception, et ajout d'une ligne au registre seulement si le hash est identique.", code: "mkdir -p analyste_kdiallo && cp INC031-P03_image.dd analyste_kdiallo/\nH2=$(sha256sum analyste_kdiallo/INC031-P03_image.dd | cut -d' ' -f1)\nH1=$(cut -d' ' -f1 MANIFESTE.sha256)\nif [ \"$H1\" = \"$H2\" ]; then echo \"$(date -u +%FT%TZ);INC031-P03;transfert;J.Martin;K.Diallo;$H2\" >> custody.csv; echo INTEGRE; else echo RUPTURE; fi\ncolumn -s ';' -t custody.csv" },
  { title: "Vérifier la signature", description: "Vérifie la signature du manifeste. Le message doit indiquer une bonne signature de l'analyste.", code: "gpg --verify MANIFESTE.sha256.asc" },
  { title: "Simuler une altération", description: "Modifie un seul octet de la copie de travail, puis recalcule le hash. Observe que la valeur change complètement : la moindre modification est détectable.", code: "printf 'X' | dd of=analyste_kdiallo/INC031-P03_image.dd bs=1 seek=100 conv=notrunc 2>/dev/null\nsha256sum INC031-P03_image.dd analyste_kdiallo/INC031-P03_image.dd" },
  { title: "Tenter de modifier le manifeste", description: "Modifie le manifeste signé, puis vérifie à nouveau la signature. Elle doit être rejetée : un manifeste signé ne peut pas être retouché discrètement.", code: "sed -i 's/[0-9a-f]\\{8\\}/deadbeef/' MANIFESTE.sha256.asc\ngpg --verify MANIFESTE.sha256.asc" },
  { title: "Identifier une rupture de chaîne", description: "Raisonnement : une image disque est collectée avec hash documenté, puis transmise par clé USB à un second analyste sans recalcul du hash à réception, et sans ligne dans le registre. Quels critères de recevabilité sont fragilisés, et comment la défense pourrait-elle l'exploiter ?" },
  { title: "Cadrer une investigation interne", description: "Raisonnement : un salarié est soupçonné d'avoir exfiltré des fichiers. Son poste contient un dossier nommé « Personnel ». Comment organises-tu la collecte pour qu'elle reste licite et proportionnée ?" },
]} />

## À retenir

- Une preuve numérique doit être intègre, authentique, traçable et collectée de façon licite ; la recevabilité et la force probante sont deux questions distinctes.
- En matière pénale, la preuve est libre et appréciée par le juge ; en matière civile, l'écrit électronique a la même force que le papier si l'auteur est identifiable et l'intégrité garantie, et eIDAS encadre signatures et horodatages.
- La jurisprudence admet parfois des preuves déloyales, mais la collecte par accès non autorisé reste une infraction pour celui qui la commet.
- La chaîne de custody documente chaque étape du parcours d'une preuve, avec un hash recalculé à chaque transfert.
- ISO/IEC 27037, 27041, 27042 et 27043, la RFC 3227 et le NIST SP 800-86 décrivent des méthodes auditables, reproductibles et justifiables.
- Horodatage, signature électronique, journalisation infalsifiable et constat de commissaire de justice renforcent la valeur des preuves électroniques.
- Travailler sur l'original, omettre le hash, laisser une période non documentée ou rédiger la traçabilité après coup fragilisent gravement une preuve.

## Questions de révision

1. Quels sont les quatre critères qui rendent une preuve numérique recevable, et en quoi la force probante est-elle une question différente ?
2. À quoi sert le calcul d'une empreinte hash SHA-256 lors de la collecte d'une preuve, et à quels moments faut-il le recalculer ?
3. Pourquoi un analyste DFIR ne travaille-t-il jamais directement sur le disque original d'une machine compromise ?
4. Que risque une preuve numérique obtenue par un accès hors du périmètre légalement autorisé, et que risque celui qui l'a collectée ?
5. Que documente exactement une chaîne de custody, et pourquoi doit-elle être rédigée en temps réel ?
6. Quelles conditions l'article 1366 du Code civil pose-t-il pour qu'un écrit électronique ait la même force probante qu'un écrit papier ?
7. Pourquoi la conformité à ISO/IEC 27037 renforce-t-elle la valeur d'une investigation devant un juge ?
