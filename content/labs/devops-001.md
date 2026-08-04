---
title: Le Pipeline Compromis
slug: devops-001
category: devops
difficulty: intermediate
---

## Scénario

L'équipe DevOps de Nyx Corp a poussé dans l'urgence un nouveau pipeline CI/CD et un lot de manifests Kubernetes en production, sans revue de sécurité. Le dossier `~/data/` contient un instantané de ce qui a été committé : un pipeline GitHub Actions, des manifests Kubernetes, un Dockerfile applicatif et une configuration Terraform. Ta mission : auditer ces fichiers comme le ferait un œil DevSecOps entraîné (ou un scanner de configuration type Trivy/tfsec en conditions réelles) et remonter les deux failles critiques.

## Objectifs

1. Trouver le secret cloud committé en clair dans le pipeline CI (`~/data/pipeline/deploy.yml`) — c'est le premier flag.
2. Parmi les deux déploiements Kubernetes de `~/data/k8s/deployment.yaml`, identifier celui qui tourne en mode privilégié (`privileged: true`, `runAsUser: 0`) et lire le tag de son image — c'est le second flag.
3. (Bonus, non noté) Repère les autres mauvaises pratiques du Dockerfile applicatif (`~/data/docker/Dockerfile`) et de la configuration Terraform (`~/data/terraform/main.tf`) : `ADD` depuis une URL distante non vérifiée, exécution en `root`, port SSH ouvert à `0.0.0.0/0`, bucket S3 en accès public. Pour chacune, formule la correction que tu proposerais en revue de code.

## Indices

- `grep -r "SECRET\|AKIA" data/pipeline/` isole immédiatement la variable d'environnement contenant le secret en clair.
- Compare les deux blocs `securityContext` du fichier YAML à l'œil nu (ou avec `grep -B5 -A2 "privileged: true"`) — un seul des deux déploiements tourne en mode privilégié.
- Le tag de l'image du conteneur privilégié n'est pas une version sémantique classique : lis-le attentivement.

<TipCallout>
```bash
grep -rn "SECRET\|AKIA" data/pipeline/
grep -B5 -A2 "privileged: true" data/k8s/deployment.yaml
```
En conditions réelles, un outil comme `trivy config .` ou `tfsec` automatise ce travail et détecte en prime les soucis du Dockerfile applicatif et de la configuration Terraform (objectif bonus).
</TipCallout>

<WarningCallout>
La clé `AKIAIOSFODNN7EXAMPLE` utilisée ici est l'exemple officiel documenté par AWS pour illustrer le format d'un Access Key ID — elle n'a jamais été une clé valide. Dans un vrai pipeline, tout secret retrouvé en clair dans un commit doit être considéré comme compromis et immédiatement révoqué, même après suppression du fichier : l'historique Git le conserve.
</WarningCallout>
