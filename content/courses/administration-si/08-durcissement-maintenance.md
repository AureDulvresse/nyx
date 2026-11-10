---
title: Durcissement et maintenance en conditions réelles
chapter: 8
course: administration-si
difficulty: advanced
duration: 55
tags: [sysadmin, durcissement, hardening, maintenance, cis, legacy]
ceh_modules: ["Module 6 - System Hacking"]
objectives:
  - Appliquer une checklist de durcissement système reproductible
  - Gérer la dette technique et les systèmes legacy en production
  - Construire une routine de maintenance préventive durable
  - S'appuyer sur les référentiels (CIS Benchmarks, ANSSI, NIST CSF 2.0)
---

## Introduction

Ce dernier chapitre referme le cours en réunissant les compétences précédentes (Active Directory, Linux, virtualisation, sauvegarde, supervision, IAM) dans une discipline transversale : le durcissement (hardening) et la maintenance continue d'un système d'information réel. Réel signifie avec ses contraintes budgétaires, ses systèmes anciens qu'on ne peut pas remplacer du jour au lendemain, et son besoin permanent de rester à la fois fonctionnel et sécurisé.

À la fin de ce chapitre, tu sauras appliquer une démarche de durcissement reproductible, gérer un système legacy sans le laisser devenir une brèche, et construire une routine de maintenance préventive qui coûte moins cher, à long terme, que la gestion de crise permanente.

## Une checklist de durcissement reproductible

Durcir un système, c'est réduire sa surface d'attaque et le rendre résistant par défaut. La démarche doit être reproductible : la même configuration appliquée à chaque nouveau serveur, vérifiée régulièrement.

<Steps steps={[
  { title: "Réduire la surface d'attaque", description: "Désinstaller les services non utilisés et fermer les ports inutiles : un service qui ne tourne pas ne peut pas être exploité, même s'il comportait une faille." },
  { title: "Ne jamais conserver la configuration par défaut", description: "Changer systématiquement les identifiants et paramètres par défaut de tout équipement ou logiciel déployé, car ils sont publics et connus des attaquants." },
  { title: "Appliquer le moindre privilège", description: "Comptes de service, droits d'administration et accès réseau tous limités au strict nécessaire (chapitre 7)." },
  { title: "Chiffrer au repos et en transit", description: "Disques sensibles chiffrés et communications internes en TLS quand c'est réalisable, pour protéger les données même en cas d'accès physique ou d'interception." },
  { title: "Activer et centraliser la journalisation", description: "Sans journaux suffisants, une investigation post-incident (cours DFIR) devient quasiment impossible (chapitre 6)." },
]} />

<CehCallout>
Les référentiels de durcissement publics comme les CIS Benchmarks fournissent des listes de contrôle détaillées, système par système (Windows Server, distributions Linux, équipements réseau, conteneurs). Ils constituent un point de départ solide plutôt que de réinventer une politique de durcissement depuis zéro. En France, l'ANSSI publie des guides de configuration équivalents, et le NIST CSF 2.0 structure l'ensemble autour de ses fonctions Govern, Identify, Protect, Detect, Respond et Recover.
</CehCallout>

### Pourquoi supprimer un service inutile réduit le risque

Un service que l'on n'utilise pas mais qui tourne reste une porte ouverte : il écoute sur un port, il contient du code susceptible de comporter une vulnérabilité, et il élargit la surface que l'attaquant peut sonder. Le désinstaller supprime ce risque entièrement, même si aucune faille n'y est connue aujourd'hui, car une faille peut être découverte demain. C'est le durcissement le plus rentable : on ne sécurise pas ce qui n'existe plus.

### L'infrastructure en tant que code et la conformité automatisée

Un durcissement reproductible s'appuie idéalement sur l'automatisation. Décrire la configuration durcie dans du code (avec Ansible, par exemple) permet de l'appliquer identiquement partout et de la rejouer. Des outils de conformité comme OpenSCAP vérifient automatiquement qu'une machine respecte un référentiel CIS, et produisent un rapport d'écarts. On passe ainsi d'un durcissement ponctuel et manuel à une conformité continue et mesurée.

```text
Extrait d'un rapport de conformité CIS (exemple) :

  [PASS] 1.1.1  Désactivation du montage des systèmes de fichiers inutiles
  [FAIL] 2.2.4  Service FTP actif et non chiffré
  [PASS] 5.2.1  Authentification par clé SSH imposée
  [FAIL] 4.1.3  Journalisation des commandes privilégiées non configurée
  Score de conformité : 86 %
```

## Gérer la dette technique et les systèmes legacy

<WarningCallout>
Un système legacy, c'est-à-dire ancien, non mis à jour et parfois non remplaçable à court terme pour des raisons métier ou budgétaires, n'est pas un problème à ignorer : c'est un risque à isoler et à surveiller activement, en attendant sa migration ou son remplacement planifié. L'ignorer revient à laisser une brèche connue ouverte au cœur du système d'information.
</WarningCallout>

Quand on ne peut pas corriger un système, on applique des mesures compensatoires : on réduit ce qu'une compromission permettrait d'atteindre, et on augmente la probabilité de la détecter rapidement.

<CompareTable
  titleA="Mesure compensatoire pour un système legacy"
  titleB="Objectif"
  rows={[
    { a: "Segmentation réseau stricte (VLAN dédié, pare-feu renforcé)", b: "Limiter la portée d'une éventuelle compromission" },
    { a: "Surveillance renforcée (journaux et alertes spécifiques)", b: "Détecter rapidement toute activité anormale, faute de pouvoir corriger la faille" },
    { a: "Absence totale d'accès direct depuis Internet", b: "Réduire drastiquement la surface d'attaque exposée" },
    { a: "Plan de migration daté, même à long terme", b: "Éviter qu'un système temporaire ne le reste indéfiniment sans échéance" },
]}
/>

Le plan de migration daté est essentiel : sans échéance, un système « temporaire » s'installe pour des années. Fixer une date, même lointaine, force l'organisation à budgéter et à planifier le remplacement, plutôt que de repousser indéfiniment.

## Construire une routine de maintenance préventive

La maintenance préventive consiste à agir régulièrement pour éviter les incidents, plutôt que de réagir dans l'urgence quand ils surviennent. Chaque tâche de cette routine est une application concrète d'un chapitre précédent.

<Steps steps={[
  { title: "Fenêtre de maintenance régulière", description: "Un créneau récurrent et communiqué, par exemple le premier mardi du mois, plutôt que des interventions ad hoc anxiogènes pour les utilisateurs." },
  { title: "Revue périodique des accès", description: "Application concrète du cycle de vie IAM vu au chapitre 7 : on découvre et on supprime régulièrement les comptes orphelins et les droits dérivés." },
  { title: "Test de restauration périodique", description: "Application concrète de la discipline de sauvegarde vue au chapitre 5 : on vérifie que les sauvegardes sont réellement restaurables." },
  { title: "Revue des seuils de supervision", description: "Ajuster les alertes devenues obsolètes après une montée en charge ou un changement d'architecture (chapitre 6)." },
  { title: "Documentation tenue à jour", description: "Un schéma d'architecture ou un runbook obsolète est presque aussi dangereux qu'une absence totale de documentation (cours Rédaction de Rapports)." },
]} />

<TipCallout>
La maintenance préventive et régulière est systématiquement moins coûteuse, en temps, en stress et en risque, que la maintenance corrective menée dans l'urgence après un incident. Corriger un disque qui se remplit avant la panne prend quelques minutes ; restaurer un service tombé à cause de ce disque plein, sous la pression des utilisateurs, prend des heures. C'est un investissement récurrent qui se traduit directement en résilience.
</TipCallout>

<AuditCallout>
La gestion des configurations et du durcissement correspond au contrôle A.8.9 de la norme ISO/IEC 27001:2022, la gestion des vulnérabilités au contrôle A.8.8, et la gestion de la dette technique s'inscrit dans l'approche par les risques de la norme. La directive NIS2 impose aux entités concernées une politique de maintenance et de gestion des vulnérabilités documentée, qui rejoint directement la routine décrite ici.
</AuditCallout>

## Erreurs fréquentes

On durcit un serveur à la main une fois, sans vérifier ensuite qu'il reste conforme dans le temps. On conserve des services et des comptes par défaut « au cas où ». On laisse un système legacy connecté au réseau général sans segmentation ni surveillance renforcée. On repousse indéfiniment une migration faute d'échéance datée. Enfin, on ne fait de la maintenance qu'en mode pompier, lors des incidents, ce qui coûte plus cher et laisse la documentation se périmer.

## Lab — Mise en pratique

**Environnement** : Audit et réflexion guidée sur le lab.

<Steps steps={[
  { title: "Dresser une surface d'attaque", description: "Liste les services en écoute sur une machine et identifie ceux qui pourraient être désinstallés.", code: "ss -tlnp" },
  { title: "Prioriser un durcissement", description: "Un serveur applicatif expose encore un service FTP non chiffré datant d'une ancienne intégration, inutilisé depuis deux ans. Indique la première action de durcissement à appliquer et pourquoi." },
  { title: "Lire un rapport de conformité", description: "À partir d'un rapport CIS fourni, repère les deux écarts les plus critiques et propose une correction pour chacun." },
  { title: "Isoler un système legacy", description: "Une application métier critique tourne sur un système d'exploitation qui n'est plus maintenu, sans migration possible avant 18 mois. Propose trois mesures compensatoires concrètes en attendant." },
  { title: "Planifier une routine de maintenance", description: "Construis un calendrier de maintenance préventive sur un trimestre, en reliant chaque tâche au chapitre du cours dont elle découle." },
  { title: "Justifier le préventif", description: "Explique, sur l'exemple d'un disque qui se remplit, pourquoi la maintenance préventive coûte moins cher que la corrective." },
]} />

## À retenir

- Une checklist de durcissement reproductible réduit la surface d'attaque : services inutiles supprimés, configurations par défaut changées, moindre privilège, chiffrement, journalisation.
- Désinstaller un service inutilisé supprime un risque entièrement, même en l'absence de faille connue aujourd'hui.
- Les CIS Benchmarks, les guides de l'ANSSI et le NIST CSF 2.0 fournissent des référentiels éprouvés, applicables et automatisables (Ansible, OpenSCAP).
- Un système legacy non remplaçable doit être isolé et surveillé activement, avec un plan de migration daté, plutôt qu'ignoré.
- Une routine de maintenance préventive (accès, sauvegardes, supervision, documentation) applique concrètement les chapitres précédents.
- La maintenance préventive régulière coûte systématiquement moins cher que la maintenance corrective menée dans l'urgence après incident.

## Questions de révision

1. Pourquoi désinstaller un service non utilisé réduit-il directement le risque, même sans vulnérabilité connue ?
2. Que recommandent les référentiels comme les CIS Benchmarks ?
3. Que signifie « isoler » un système legacy plutôt que de simplement l'ignorer ?
4. Parmi les mesures compensatoires pour un système legacy, laquelle vise à limiter la portée d'une compromission ?
5. Pourquoi un plan de migration daté est-il important pour un système legacy, même à long terme ?
6. Dans la routine de maintenance préventive, quelle action correspond à l'application du cycle de vie IAM du chapitre 7 ?
7. Pourquoi la maintenance préventive régulière coûte-t-elle généralement moins cher que la maintenance corrective dans l'urgence ?
8. Comment l'automatisation (Ansible, OpenSCAP) transforme-t-elle un durcissement ponctuel en conformité continue ?

Félicitations, tu viens de terminer le cours **Administration Systèmes et Réseaux d'Entreprise** ! Ces compétences complètent directement les cours plus offensifs (Active Directory, Cyber Offensive) en te donnant le point de vue de celui qui doit défendre et maintenir ce que tu apprends à auditer.
