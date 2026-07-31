---
title: Administration Linux en production
chapter: 3
course: administration-si
difficulty: intermediate
duration: 35
tags: [sysadmin, linux, production]
ceh_modules: ["Module 6 - System Hacking"]
objectives:
  - Gérer les services et la disponibilité d'un serveur Linux en production
  - Automatiser les tâches d'administration récurrentes
  - Appliquer une politique de mise à jour sans casser la production
---

## Introduction

Le cours Linux pour la Cybersécurité aborde Linux du point de vue de l'attaquant qui l'utilise (Kali). Ce chapitre l'aborde à l'inverse du point de vue de celui qui doit le garder disponible, à jour et fonctionnel en production, sous contrainte de service continu.

## Gérer les services en production

<Steps steps={[
  { title: "systemd comme socle", description: "La quasi-totalité des distributions modernes utilisent systemd pour gérer le cycle de vie des services (démarrage, arrêt, redémarrage automatique en cas de crash)." },
  { title: "Dépendances entre services", description: "Un service applicatif dépend souvent d'un service de base de données — systemd permet de déclarer cet ordre de démarrage (After=, Requires=)." },
  { title: "Journalisation centralisée (journald)", description: "Toute sortie d'un service géré par systemd est capturée par journald, consultable de façon unifiée sans chercher dans des fichiers de logs épars." },
  { title: "Health checks applicatifs", description: "Au-delà de 'le processus tourne', vérifier que le service répond correctement (ex: endpoint /health qui interroge la base)." },
]} />

```bash
# Vérifier l'état et les dépendances d'un service
systemctl status nginx
systemctl list-dependencies nginx

# Consulter les logs récents d'un service précis
journalctl -u nginx --since "1 hour ago"
```

<TipCallout>
`journalctl -u nginx -f` (mode "follow") est l'équivalent systemd d'un `tail -f` sur un fichier de log classique — indispensable pour observer un service en temps réel pendant un diagnostic.
</TipCallout>

## Automatiser plutôt que répéter

<CehCallout>
Toute tâche manuelle répétée plus de deux fois en production est un candidat à l'automatisation — les erreurs humaines (oubli d'une étape, faute de frappe dans une commande destructrice) sont statistiquement la première cause d'incident en administration système, bien avant les attaques externes.
</CehCallout>

<CompareTable
  titleA="Outil"
  titleB="Cas d'usage"
  rows={[
    { a: "Cron / systemd timers", b: "Tâches planifiées récurrentes (sauvegardes, rotation de logs, nettoyage)" },
    { a: "Ansible", b: "Configuration déclarative reproductible d'un parc de serveurs" },
    { a: "Scripts Bash documentés", b: "Automatisations ponctuelles, avec logs et gestion d'erreur explicites" },
]}
/>

## Mises à jour en production — équilibrer sécurité et disponibilité

<WarningCallout>
Appliquer un correctif de sécurité critique immédiatement, sans fenêtre de test préalable, peut casser un service en production tout aussi sûrement qu'une attaque — mais reporter indéfiniment les mises à jour de sécurité expose le système à des vulnérabilités connues et déjà exploitées publiquement. Ni l'excès de prudence ni la précipitation ne sont acceptables.
</WarningCallout>

<Steps steps={[
  { title: "Classer par criticité", description: "Un correctif de sécurité critique (RCE activement exploitée) n'attend pas la prochaine fenêtre de maintenance mensuelle." },
  { title: "Tester en pré-production", description: "Reproduire la mise à jour sur un environnement identique à la production avant de l'appliquer réellement." },
  { title: "Planifier une fenêtre de maintenance", description: "Communiquer à l'avance une interruption de service planifiée plutôt que de mettre à jour sans prévenir." },
  { title: "Prévoir un rollback", description: "Toujours disposer d'un moyen de revenir en arrière rapidement si la mise à jour cause un problème imprévu." },
]} />

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell)

<Steps steps={[
  { title: "Diagnostiquer un service", description: "Vérifie l'état, les dépendances et les 20 dernières lignes de log d'un service de ton choix sur la machine Nyx Shell.", code: 'systemctl status ssh && journalctl -u ssh -n 20' },
  { title: "Planifier une tâche récurrente", description: "Ajoute une tâche cron qui exécute un script de nettoyage tous les jours à 3h du matin.", code: 'crontab -e\n# puis ajouter : 0 3 * * * /usr/local/bin/nettoyage.sh' },
]} />

## En résumé

- systemd centralise le cycle de vie des services et leur journalisation (journald) en production.
- Toute tâche manuelle répétée est un candidat à l'automatisation (cron, Ansible, scripts documentés).
- Une politique de mise à jour équilibrée classe les correctifs par criticité, teste avant d'appliquer, et prévoit toujours un rollback.

## Questions de Révision

1. À quoi sert `journalctl -u <service> -f` et en quoi diffère-t-il d'un simple fichier de log ?
2. Pourquoi une tâche manuelle répétée plusieurs fois est-elle un risque en administration système ?
3. Pourquoi ni la précipitation ni l'excès de prudence ne sont-ils acceptables face à un correctif de sécurité critique ?
