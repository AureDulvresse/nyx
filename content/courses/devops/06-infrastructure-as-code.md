---
title: Infrastructure as Code — Terraform et Ansible
chapter: 6
course: devops
difficulty: intermediate
duration: 55
tags: [iac, terraform, ansible, cloud, automatisation]
ceh_modules: []
objectives:
  - Comprendre les bénéfices de l'Infrastructure as Code (reproductibilité, revue de code, disaster recovery)
  - Distinguer l'approche déclarative (Terraform) de l'approche impérative (Ansible)
  - Maîtriser le workflow Terraform (init/plan/apply/destroy) et le rôle du fichier state
  - Écrire un playbook Ansible idempotent et savoir quand combiner les deux outils

---

## Introduction

Pendant des années, configurer un serveur signifiait se connecter en SSH, taper des commandes, ajuster des fichiers de configuration à la main — et espérer se souvenir de tout si le serveur devait être recréé. L'Infrastructure as Code (IaC) remplace cette approche artisanale par des fichiers texte versionnés qui décrivent l'infrastructure désirée : machines virtuelles, réseaux, bases de données, règles de pare-feu.

Cette bascule change fondamentalement la manière dont une équipe opère son infrastructure. Un serveur n'est plus un objet qu'on bricole au fil du temps, mais le résultat reproductible de l'exécution d'un fichier versionné dans Git. On peut relire ce fichier en revue de code avant de le déployer, exactement comme on relit une pull request applicative. On peut le recréer à l'identique sur un autre compte cloud en cas de sinistre. Et on peut suivre, commit par commit, l'historique complet de ce qui a changé et pourquoi.

Ce chapitre couvre les deux outils IaC les plus utilisés en entreprise : Terraform, pour provisionner l'infrastructure (les ressources elles-mêmes), et Ansible, pour configurer ce qui tourne dessus (paquets, fichiers, services). Tu verras leurs philosophies opposées — déclarative contre impérative —, le workflow Terraform et son fichier state souvent mal compris, un exemple de playbook Ansible idempotent, et enfin comment décider lequel utiliser selon le contexte. Les erreurs de configuration IaC les plus dangereuses (bucket de stockage public, groupe de sécurité ouvert à `0.0.0.0/0`) seront analysées en détail — avec des cas réels d'incidents — dans le cours "DevSecOps Avancé".

## Pourquoi l'Infrastructure as Code

Trois bénéfices concrets justifient l'adoption de l'IaC dans une équipe, même petite.

**Reproductibilité.** Un environnement de staging identique à la production n'est plus une promesse mais une garantie : les deux sont générés depuis le même code. Fini les différences de configuration accumulées manuellement au fil des mois qui causent des bugs uniquement reproductibles "en prod".

**Revue de code de l'infrastructure.** Une modification d'infrastructure passe par une pull request comme n'importe quel changement applicatif : un collègue peut relire le diff, repérer qu'une règle de pare-feu s'ouvre trop largement, et demander une correction avant que le changement ne soit appliqué.

**Disaster recovery.** Si une région cloud entière tombe, ou si un environnement est corrompu, l'infrastructure se recrée en relançant le code IaC sur une nouvelle région ou un nouveau compte — au lieu de reconstruire manuellement des dizaines de ressources en espérant ne rien oublier.

<TipCallout>
Une bonne mesure de la maturité IaC d'une équipe : peut-elle recréer entièrement son environnement de production à partir de zéro, sur un compte cloud neuf, en suivant uniquement son code versionné ? Si la réponse implique des étapes manuelles non documentées, l'IaC n'est encore que partielle.
</TipCallout>

## Déclaratif vs impératif : Terraform et Ansible

Les deux outils répondent à la même question — "comment automatiser l'infrastructure ?" — avec deux philosophies opposées.

Terraform est **déclaratif** : tu décris l'état final désiré ("je veux une instance EC2 de type t3.micro avec ce groupe de sécurité"), et Terraform calcule lui-même les actions nécessaires pour atteindre cet état, qu'il s'agisse de créer, modifier ou détruire des ressources.

Ansible est principalement **impératif** (avec des éléments déclaratifs) : tu décris une séquence d'étapes à exécuter ("installe nginx, copie ce fichier de configuration, redémarre le service"), dans l'ordre où elles sont écrites.

<CompareTable
  titleA="Terraform (déclaratif)"
  titleB="Ansible (impératif)"
  rows={[
    { a: "Décrit l'état final voulu ; l'outil calcule le chemin pour l'atteindre", b: "Décrit une séquence d'étapes à exécuter, dans l'ordre du fichier" },
    { a: "Excelle pour provisionner des ressources cloud (VM, réseaux, bases managées)", b: "Excelle pour configurer ce qui tourne sur une machine (paquets, fichiers, services)" },
    { a: "Maintient un fichier state qui reflète l'infrastructure réelle", b: "Sans état persistant — interroge la machine cible à chaque exécution" },
    { a: "Nécessite un provider par plateforme cloud (AWS, Azure, GCP...)", b: "Se connecte en SSH/WinRM — fonctionne sur quasi tout ce qui a un accès distant" },
  ]}
/>

## Le workflow Terraform : init, plan, apply, destroy

Un projet Terraform suit systématiquement les mêmes quatre commandes.

```bash
# Télécharge les providers nécessaires (ex: AWS, Azure) et initialise le backend
terraform init

# Calcule et affiche les changements qui seraient appliqués, sans rien modifier
terraform plan

# Applique réellement les changements après confirmation
terraform apply

# Détruit toutes les ressources gérées par ce projet Terraform
terraform destroy
```

`terraform plan` est l'étape la plus précieuse du workflow : elle affiche un diff exact (ressources créées en vert, modifiées en jaune, détruites en rouge) avant toute action réelle — l'équivalent d'un `git diff` pour l'infrastructure.

Voici un exemple concret : un fichier `.tf` qui provisionne un bucket de stockage cloud simple.

```hcl
# main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "eu-west-3"
}

resource "aws_s3_bucket" "app_uploads" {
  bucket = "nyx-app-uploads-prod"

  tags = {
    Environment = "production"
    ManagedBy   = "terraform"
  }
}

resource "aws_s3_bucket_public_access_block" "app_uploads" {
  bucket                  = aws_s3_bucket.app_uploads.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
```

<WarningCallout>
Le bloc `aws_s3_bucket_public_access_block` n'est pas optionnel en production : sans lui, un bucket S3 mal configuré (ou une policy ajoutée plus tard par erreur) peut devenir accessible publiquement. C'est précisément ce type de mauvaise configuration IaC — bucket public, règle de sécurité trop permissive — que tu analyseras en détail dans le cours "DevSecOps Avancé".
</WarningCallout>

### Le fichier state : pourquoi il est sensible

Terraform stocke l'état de l'infrastructure qu'il gère dans un fichier `terraform.tfstate`. Ce fichier est la seule source de vérité que Terraform utilise pour savoir quelles ressources existent déjà, avec quels attributs — c'est en comparant ce state au code `.tf` que `plan` calcule le diff à appliquer.

<AuditCallout>
Le fichier state contient souvent des données sensibles en clair : mots de passe de bases de données générés, clés privées, chaînes de connexion. Il ne doit **jamais** être commité dans Git ni stocké localement en équipe — il doit résider dans un backend distant chiffré (S3 + verrouillage DynamoDB, Terraform Cloud, etc.) avec un accès strictement contrôlé.
</AuditCallout>

Un state perdu ou corrompu est un incident grave : Terraform perd la trace de ce qu'il gère et peut tenter de recréer des ressources déjà existantes, causant doublons ou conflits de noms.

## Ansible : playbooks et idempotence

Un playbook Ansible est un fichier YAML décrivant une liste de tâches à exécuter sur un ou plusieurs hôtes distants, sans agent à installer (tout passe par SSH).

```yaml
# playbook.yml
- name: Configurer le serveur web
  hosts: webservers
  become: true
  tasks:
    - name: Installer nginx
      apt:
        name: nginx
        state: present
        update_cache: true

    - name: Déployer la configuration du site
      template:
        src: templates/nginx-site.conf.j2
        dest: /etc/nginx/sites-available/app.conf
        mode: "0644"
      notify: Redémarrer nginx

    - name: S'assurer que nginx est démarré et activé au boot
      service:
        name: nginx
        state: started
        enabled: true

  handlers:
    - name: Redémarrer nginx
      service:
        name: nginx
        state: restarted
```

La notion clé d'Ansible est l'**idempotence** : exécuter ce playbook une fois ou cent fois produit exactement le même résultat final. La tâche `apt` avec `state: present` n'installe nginx que s'il est absent — si le playbook tourne à nouveau alors que nginx est déjà installé, Ansible ne fait rien et le rapporte comme "ok" (inchangé), jamais comme une erreur.

<TipCallout>
Un module Ansible mal écrit (par exemple une tâche `shell: apt install nginx` brute plutôt que le module `apt`) casse l'idempotence : elle réexécuterait la commande à chaque run, sans vérifier l'état préalable. Privilégie toujours les modules dédiés (`apt`, `template`, `service`) plutôt que `shell`/`command` quand c'est possible.
</TipCallout>

## Quand utiliser lequel — ou les deux

En pratique, Terraform et Ansible ne sont pas concurrents mais complémentaires dans la majorité des architectures.

<AttackDefenseTable rows={[
  { phase: "Provisionner une ressource cloud (VM, VPC, base managée)", attack: "Terraform seul", defense: "Le déclaratif garantit un état cible cohérent et un diff clair avant chaque changement" },
  { phase: "Configurer un logiciel sur une VM déjà créée", attack: "Ansible seul", defense: "L'impératif est plus naturel pour une séquence d'installation/configuration" },
  { phase: "Pipeline complet (créer la VM puis la configurer)", attack: "Terraform + Ansible", defense: "Terraform provisionne l'instance et expose son IP en sortie ; Ansible s'y connecte ensuite pour la configurer" },
  { phase: "Infrastructure 100% conteneurisée (Kubernetes)", attack: "Terraform pour le cluster, manifestes Kubernetes pour le reste", defense: "Ansible devient souvent superflu une fois que Kubernetes gère le déploiement applicatif" },
]} />

En résumé : Terraform répond à "quelles ressources doivent exister ?", Ansible répond à "que doit-il se passer sur ces ressources ?". Une équipe DevOps mature utilise couramment les deux, chacun sur son périmètre naturel.

## Lab — Mise en Pratique

**Environnement** : terminal Nyx Shell (Terraform + Ansible installés)

<Steps steps={[
  { title: "Initialiser un projet Terraform", description: "Crée un fichier main.tf minimal (provider local ou null_resource) puis initialise le projet.", code: "terraform init" },
  { title: "Prévisualiser le plan", description: "Affiche le diff des changements qui seraient appliqués, sans rien modifier.", code: "terraform plan -out=tfplan" },
  { title: "Appliquer le plan validé", description: "Applique exactement le plan prévisualisé à l'étape précédente.", code: "terraform apply tfplan" },
  { title: "Écrire un playbook Ansible idempotent", description: "Crée un playbook.yml qui installe un paquet via le module apt (pas shell), puis exécute-le deux fois de suite pour observer que la deuxième exécution ne rapporte aucun changement.", code: "ansible-playbook -i localhost, -c local playbook.yml" },
  { title: "Nettoyer l'environnement", description: "Détruis les ressources Terraform créées pour ce lab.", code: "terraform destroy" },
]} />

## En résumé

- L'Infrastructure as Code transforme l'infrastructure en fichiers versionnés : reproductibilité, revue de code des changements, et disaster recovery en relançant simplement le code.
- Terraform est déclaratif (décrit l'état final voulu) ; Ansible est principalement impératif (décrit une séquence d'étapes).
- Le workflow Terraform suit toujours init → plan → apply → destroy ; `plan` affiche le diff avant toute modification réelle.
- Le fichier state de Terraform contient des données sensibles et doit résider dans un backend distant chiffré, jamais dans Git.
- L'idempotence est le principe central d'Ansible : réexécuter un playbook produit toujours le même résultat final, à condition d'utiliser les modules dédiés plutôt que `shell`/`command`.
- Terraform et Ansible se combinent naturellement : Terraform provisionne les ressources, Ansible les configure — les mauvaises configurations IaC (bucket public, règles trop permissives) seront approfondies dans "DevSecOps Avancé".

## Questions de Révision

1. Pourquoi la revue de code d'un changement d'infrastructure est-elle possible avec l'IaC mais pas avec une configuration manuelle en SSH ?
2. Quelle est la différence fondamentale entre l'approche déclarative de Terraform et l'approche impérative d'Ansible ?
3. Que se passe-t-il concrètement si le fichier `terraform.tfstate` est perdu ou corrompu ?
4. Pourquoi le fichier state ne doit-il jamais être commité dans un dépôt Git ?
5. Qu'est-ce que l'idempotence dans un playbook Ansible, et pourquoi une tâche `shell` brute risque-t-elle de la casser ?
6. Dans un pipeline combinant les deux outils, quel rôle joue typiquement Terraform, et quel rôle joue typiquement Ansible ?
