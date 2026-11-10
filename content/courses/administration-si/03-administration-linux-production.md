---
title: Administration Linux en production
chapter: 3
course: administration-si
difficulty: intermediate
duration: 55
tags: [sysadmin, linux, production, systemd, ansible]
ceh_modules: ["Module 6 - System Hacking"]
objectives:
  - Gérer les services et la disponibilité d'un serveur Linux en production avec systemd
  - Automatiser les tâches d'administration récurrentes (cron, timers, Ansible)
  - Appliquer une politique de mise à jour sans casser la production
  - Diagnostiquer un incident à partir des journaux et des métriques système
---

## Introduction

Le cours Linux pour la Cybersécurité aborde Linux du point de vue de celui qui l'utilise pour auditer (Kali). Ce chapitre l'aborde à l'inverse, du point de vue de celui qui doit le garder disponible, à jour et fonctionnel en production, sous contrainte de service continu. Un serveur de production n'est pas un poste de travail : on ne peut pas le redémarrer à la légère, et une erreur de manipulation peut interrompre l'activité de toute une entreprise.

À la fin de ce chapitre, tu sauras gérer le cycle de vie d'un service avec systemd, lire efficacement les journaux pour diagnostiquer un incident, automatiser les tâches récurrentes de façon fiable, et appliquer les correctifs de sécurité sans provoquer d'interruption subie.

## Gérer les services en production

Un service est un programme qui tourne en permanence en arrière-plan : un serveur web, une base de données, un planificateur. Sur les distributions Linux modernes, c'est systemd qui gère leur cycle de vie.

<Steps steps={[
  { title: "systemd comme socle", description: "La quasi-totalité des distributions modernes utilisent systemd pour gérer le cycle de vie des services : démarrage, arrêt, redémarrage automatique en cas de crash, et démarrage au bon moment au boot." },
  { title: "Dépendances entre services", description: "Un service applicatif dépend souvent d'un service de base de données. systemd permet de déclarer cet ordre et ces dépendances avec les directives After= et Requires= dans le fichier unité." },
  { title: "Journalisation centralisée (journald)", description: "Toute sortie d'un service géré par systemd est capturée par journald, consultable de façon unifiée avec journalctl, sans chercher dans des fichiers de logs épars." },
  { title: "Health checks applicatifs", description: "Au-delà de vérifier que le processus tourne, on contrôle que le service répond correctement, par exemple via un point d'accès /health qui interroge la base de données." },
]} />

### Les commandes essentielles

```bash
# Vérifier l'état et les dépendances d'un service
systemctl status nginx
systemctl list-dependencies nginx

# Activer un service au démarrage et le lancer immédiatement
systemctl enable --now nginx

# Consulter les logs récents d'un service précis
journalctl -u nginx --since "1 hour ago"
```

```text
● nginx.service - A high performance web server
     Loaded: loaded (/lib/systemd/system/nginx.service; enabled)
     Active: active (running) since Mon 2026-11-09 08:12:03 UTC; 3h ago
   Main PID: 812 (nginx)
      Tasks: 3 (limit: 2318)
     Memory: 12.4M
```

<TipCallout>
La commande `journalctl -u nginx -f`, en mode « follow », est l'équivalent systemd d'un `tail -f` sur un fichier de log classique : elle affiche les nouvelles lignes au fur et à mesure. Elle est indispensable pour observer un service en temps réel pendant un diagnostic, par exemple en reproduisant l'erreur dans un autre terminal.
</TipCallout>

### Anatomie d'un fichier unité

Un fichier unité décrit comment systemd gère un service. Comprendre sa structure permet de corriger un ordre de démarrage ou d'ajouter un redémarrage automatique.

```ini
[Unit]
Description=Application de facturation
After=network.target postgresql.service
Requires=postgresql.service

[Service]
ExecStart=/usr/local/bin/facturation
Restart=on-failure
User=facturation

[Install]
WantedBy=multi-user.target
```

Ici, `After=postgresql.service` garantit que la base démarre avant l'application, `Requires=postgresql.service` lie leur sort, `Restart=on-failure` relance l'application si elle plante, et `User=facturation` la fait tourner sous un compte dédié non privilégié, application concrète du moindre privilège.

## Diagnostiquer un incident

Quand un service ne répond plus, un diagnostic méthodique évite les manipulations hasardeuses. On vérifie d'abord l'état du service, puis ses journaux, puis l'état général de la machine.

```bash
# 1. Le service est-il actif ? A-t-il redémarré récemment ?
systemctl status facturation

# 2. Qu'ont dit les journaux au moment de l'incident ?
journalctl -u facturation --since "10 min ago" -p err

# 3. La machine manque-t-elle de ressources ?
df -h            # espace disque par système de fichiers
free -h          # mémoire disponible
ss -tlnp         # ports en écoute (remplace netstat)
```

Cette séquence répond aux questions dans le bon ordre : le service tourne-t-il, qu'a-t-il journalisé, et la machine a-t-elle les ressources nécessaires. Un disque plein, visible avec `df -h`, est l'une des causes les plus fréquentes et les plus faciles à manquer d'un service qui refuse de démarrer.

## Automatiser plutôt que répéter

<CehCallout>
Toute tâche manuelle répétée plus de deux fois en production est un candidat à l'automatisation. Les erreurs humaines, comme l'oubli d'une étape ou une faute de frappe dans une commande destructrice, sont statistiquement la première cause d'incident en administration système, bien avant les attaques externes. Automatiser une tâche, c'est la rendre reproductible et auditée.
</CehCallout>

<CompareTable
  titleA="Outil"
  titleB="Cas d'usage"
  rows={[
    { a: "cron et timers systemd", b: "Tâches planifiées récurrentes : sauvegardes, rotation de logs, nettoyage" },
    { a: "Ansible", b: "Configuration déclarative et reproductible d'un parc de serveurs" },
    { a: "Scripts Bash documentés", b: "Automatisations ponctuelles, avec logs et gestion d'erreur explicites" },
]}
/>

### cron et timers systemd

Les deux planifient des tâches récurrentes. cron est historique et universel ; les timers systemd offrent en plus la journalisation via journald et la gestion des dépendances.

```bash
# Tâche cron : nettoyage tous les jours à 3h du matin
# (via crontab -e)
0 3 * * * /usr/local/bin/nettoyage.sh >> /var/log/nettoyage.log 2>&1
```

### Ansible, la configuration déclarative

Ansible décrit l'état voulu d'un serveur dans des fichiers lisibles, puis applique cet état sur un parc entier. L'approche est déclarative : on décrit le résultat souhaité, pas la suite de commandes, et Ansible n'agit que si l'état réel diffère de l'état voulu. C'est ce qui rend l'opération reproductible et sûre à rejouer.

```yaml
- name: Assurer que nginx est installé et démarré
  hosts: serveurs_web
  become: true
  tasks:
    - name: Installer nginx
      ansible.builtin.package:
        name: nginx
        state: present
    - name: Démarrer et activer nginx
      ansible.builtin.service:
        name: nginx
        state: started
        enabled: true
```

## Mises à jour en production — équilibrer sécurité et disponibilité

<WarningCallout>
Appliquer un correctif de sécurité critique immédiatement, sans fenêtre de test préalable, peut casser un service en production tout aussi sûrement qu'une attaque. Mais reporter indéfiniment les mises à jour expose le système à des vulnérabilités connues et déjà exploitées publiquement. Ni l'excès de prudence ni la précipitation ne sont acceptables : il faut une politique.
</WarningCallout>

<Steps steps={[
  { title: "Classer par criticité", description: "Un correctif corrigeant une vulnérabilité d'exécution de code à distance activement exploitée n'attend pas la prochaine fenêtre mensuelle. Les référentiels comme le catalogue CISA KEV et le score EPSS aident à décider ce qui est urgent." },
  { title: "Tester en pré-production", description: "Reproduire la mise à jour sur un environnement identique à la production avant de l'appliquer réellement, pour détecter une régression avant les utilisateurs." },
  { title: "Planifier une fenêtre de maintenance", description: "Communiquer à l'avance une interruption planifiée plutôt que de mettre à jour sans prévenir, pour que l'activité s'organise." },
  { title: "Prévoir un rollback", description: "Toujours disposer d'un moyen de revenir en arrière rapidement, par instantané de machine virtuelle ou sauvegarde, si la mise à jour cause un problème imprévu." },
]} />

<AuditCallout>
La gestion des correctifs correspond au contrôle A.8.8 (gestion des vulnérabilités techniques) de la norme ISO/IEC 27001:2022. La priorisation moderne combine la sévérité CVSS 4.0, la probabilité d'exploitation EPSS, et la présence au catalogue CISA KEV, qui liste les vulnérabilités dont l'exploitation est avérée. Un correctif KEV se traite en priorité absolue.
</AuditCallout>

## Erreurs fréquentes

On redémarre un service de production sans avoir lu ses journaux, et on perd l'information sur la cause de l'incident. On lance une commande destructrice à la main, et une faute de frappe cause un dégât que l'automatisation aurait évité. On applique un correctif directement en production sans test ni rollback, puis on découvre une régression devant les utilisateurs. On repousse indéfiniment les mises à jour « par prudence », laissant des failles connues ouvertes. Enfin, on fait tourner un service sous le compte root alors qu'un compte dédié suffirait.

## Lab — Mise en pratique

**Environnement** : Kali Linux (terminal Nyx Shell).

<Steps steps={[
  { title: "Diagnostiquer un service", description: "Vérifie l'état, les dépendances et les vingt dernières lignes de journal d'un service de ton choix.", code: "systemctl status ssh && journalctl -u ssh -n 20" },
  { title: "Observer un service en temps réel", description: "Suis les journaux d'un service en mode follow pendant que tu le redémarres dans un autre terminal.", code: "journalctl -u ssh -f" },
  { title: "Vérifier l'état de la machine", description: "Contrôle l'espace disque, la mémoire et les ports en écoute, et identifie un éventuel point de saturation.", code: "df -h && free -h && ss -tlnp" },
  { title: "Planifier une tâche récurrente", description: "Ajoute une tâche cron qui exécute un script de nettoyage tous les jours à 3h du matin, avec journalisation.", code: "crontab -e\n# puis : 0 3 * * * /usr/local/bin/nettoyage.sh >> /var/log/nettoyage.log 2>&1" },
  { title: "Lire un fichier unité", description: "Ouvre le fichier unité d'un service et identifie ses directives After=, Requires= et Restart=, puis explique leur effet." },
  { title: "Rédiger une politique de mise à jour", description: "Pour une vulnérabilité d'exécution de code à distance figurant au catalogue CISA KEV, décris en quatre étapes comment tu appliquerais le correctif en production." },
]} />

## À retenir

- systemd gère le cycle de vie des services (démarrage, arrêt, redémarrage) et leur journalisation via journald.
- Les directives After= et Requires= déclarent l'ordre et les dépendances entre services dans le fichier unité.
- journalctl -u service -f suit les journaux d'un service en temps réel, à la manière d'un tail -f.
- Toute tâche manuelle répétée est un candidat à l'automatisation, car l'erreur humaine est la première cause d'incident.
- Ansible applique une configuration déclarative et reproductible sur un parc entier de serveurs.
- Une politique de mise à jour équilibrée classe les correctifs par criticité (CVSS, EPSS, CISA KEV), teste en pré-production et prévoit toujours un rollback.

## Questions de révision

1. À quoi sert `journalctl -u <service> -f` et en quoi diffère-t-il d'un simple fichier de log ?
2. Quel système centralise la journalisation des services gérés par systemd ?
3. Que permettent les directives systemd After= et Requires= dans un fichier unité ?
4. Pourquoi une tâche manuelle répétée plusieurs fois est-elle un risque en administration système ?
5. Quel outil est adapté à une configuration déclarative et reproductible d'un parc de serveurs ?
6. Pourquoi ni la précipitation ni l'excès de prudence ne conviennent-ils face à un correctif de sécurité critique ?
7. Quels référentiels permettent de décider qu'un correctif est urgent plutôt que reportable ?
8. Pourquoi faire tourner un service sous un compte dédié non privilégié plutôt que sous root ?
