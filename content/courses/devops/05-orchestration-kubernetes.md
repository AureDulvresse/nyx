---
title: Orchestration avec Kubernetes
chapter: 5
course: devops
difficulty: intermediate
duration: 55
tags: [kubernetes, orchestration, conteneurs, kubectl]
ceh_modules: []
objectives:
  - Comprendre pourquoi l'orchestration devient nécessaire au-delà de docker-compose
  - Connaître l'architecture Kubernetes et ses objets fondamentaux (Pod, Deployment, Service, Namespace)
  - Manipuler un cluster avec kubectl et écrire un manifeste de Deployment
  - Distinguer ConfigMaps et Secrets, et comprendre le scaling horizontal avec les probes
---

## Introduction

Docker Compose suffit tant qu'une application tourne sur une seule machine. Mais dès qu'il faut répartir des conteneurs sur plusieurs serveurs, remplacer automatiquement un conteneur qui plante, ou faire évoluer le nombre de répliques d'un service en fonction de la charge, docker-compose atteint ses limites : il n'a aucune notion de cluster, de nœuds multiples, ni de réconciliation automatique de l'état désiré.

Kubernetes (souvent abrégé K8s) répond à ce problème : c'est un orchestrateur de conteneurs qui gère un cluster de machines, distribue les charges de travail, redémarre ce qui échoue, et expose des mécanismes déclaratifs pour décrire l'état voulu de l'infrastructure plutôt que la suite d'actions pour y parvenir. Ce chapitre pose les bases indispensables avant d'aborder, dans les chapitres suivants, le déploiement continu vers un cluster.

Nous allons voir pourquoi orchestrer, comment un cluster Kubernetes est structuré, les objets qu'on manipule au quotidien (Pod, Deployment, Service, Namespace), les commandes `kubectl` essentielles, la gestion de la configuration et des secrets, et enfin comment Kubernetes assure le scaling horizontal et l'auto-réparation (self-healing) des applications.

## Pourquoi orchestrer au-delà de docker-compose

`docker-compose` décrit et démarre un ensemble de conteneurs sur **une seule machine**. Cela fonctionne très bien en développement ou pour un petit projet, mais pose plusieurs problèmes à l'échelle d'une production sérieuse :

<CompareTable
  titleA="Limite de docker-compose"
  titleB="Besoin réel en production"
  rows={[
    { a: "Un seul hôte Docker", b: "Répartir les conteneurs sur plusieurs machines (nœuds) pour la capacité et la résilience" },
    { a: "Pas de redémarrage intelligent en cas de panne d'un nœud entier", b: "Reprogrammer automatiquement les conteneurs sur un autre nœud disponible" },
    { a: "Scaling manuel via `docker-compose up --scale`", b: "Scaling automatique basé sur la charge (CPU, mémoire, métriques custom)" },
    { a: "Pas de mise à jour progressive native", b: "Rolling updates sans interruption de service, avec rollback automatique en cas d'échec" },
  ]}
/>

Kubernetes répond à chacun de ces besoins grâce à une **boucle de réconciliation** : on décrit l'état désiré (ex: « 3 répliques de mon API doivent tourner »), et le cluster travaille en permanence pour que la réalité corresponde à cette déclaration — si un conteneur meurt, un autre est recréé automatiquement, sans intervention humaine.

<TipCallout>
Kubernetes n'est pas un remplaçant de Docker : Docker (ou containerd) reste souvent le runtime qui exécute réellement les conteneurs sur chaque machine. Kubernetes est la couche qui orchestre *où* et *combien* de conteneurs tournent.
</TipCallout>

## Architecture d'un cluster Kubernetes

Un cluster Kubernetes se divise en deux grandes catégories de machines : le **control plane** (le cerveau) et les **nodes** (les muscles, qui exécutent réellement les conteneurs).

```text
┌─────────────────────────────────────────┐
│              CONTROL PLANE               │
│  ┌───────────┐  ┌────────┐  ┌─────────┐  │
│  │ API Server│  │  etcd  │  │Scheduler│  │
│  └───────────┘  └────────┘  └─────────┘  │
│              ┌───────────────┐           │
│              │Controller Mgr │           │
│              └───────────────┘           │
└─────────────────────────────────────────┘
              │ (API REST/gRPC)
   ┌──────────┼──────────┐
   ▼          ▼          ▼
┌───────┐ ┌───────┐  ┌───────┐
│ Node 1│ │ Node 2│  │ Node 3│
│kubelet│ │kubelet│  │kubelet│
│ Pods  │ │ Pods  │  │ Pods  │
└───────┘ └───────┘  └───────┘
```

- **API Server** : point d'entrée unique du cluster — toutes les commandes (y compris `kubectl`) transitent par lui.
- **etcd** : base de données clé-valeur distribuée qui stocke l'état complet et unique de vérité du cluster (quels objets existent, leur configuration).
- **Scheduler** : décide sur quel nœud placer chaque nouveau Pod, selon les ressources disponibles et les contraintes définies.
- **Controller Manager** : fait tourner en continu les boucles de réconciliation (ex: si un Deployment demande 3 répliques et qu'il n'y en a que 2, il en recrée une).
- **kubelet** : agent présent sur chaque node, qui reçoit les instructions du control plane et démarre/arrête réellement les conteneurs via le runtime.

<CehCallout>
En pentest cloud-native, l'API Server exposé sans authentification correcte (ou un `kubeconfig` volé) donne un contrôle quasi total du cluster — c'est une cible de choix, au même titre qu'un contrôleur de domaine Active Directory dans un environnement Windows.
</CehCallout>

## Les objets clés : Pod, Deployment, Service, Namespace

Kubernetes ne manipule jamais directement des conteneurs Docker — tout passe par des **objets** décrits en YAML et envoyés à l'API Server.

<CompareTable
  titleA="Objet"
  titleB="Rôle"
  rows={[
    { a: "Pod", b: "Plus petite unité déployable — un ou plusieurs conteneurs qui partagent le même réseau et le même stockage" },
    { a: "Deployment", b: "Gère un ensemble de Pods identiques (répliques), leur mise à jour progressive et leur remplacement automatique" },
    { a: "Service", b: "Adresse réseau stable et répartition de charge vers un groupe de Pods, même quand ceux-ci sont recréés avec de nouvelles IP" },
    { a: "Namespace", b: "Espace de noms virtuel qui isole logiquement des ressources (ex: `dev`, `staging`, `prod` dans le même cluster)" },
  ]}
/>

Voici un manifeste de Deployment commenté, exposant une API via un Service :

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nyx-api            # Nom du Deployment
  namespace: production    # Namespace cible
spec:
  replicas: 3               # Nombre de Pods identiques à maintenir en permanence
  selector:
    matchLabels:
      app: nyx-api          # Le Deployment gère les Pods portant ce label
  template:                 # Modèle utilisé pour créer chaque Pod
    metadata:
      labels:
        app: nyx-api
    spec:
      containers:
        - name: api
          image: nyx/api:1.4.0
          ports:
            - containerPort: 3000
          resources:         # Limites de ressources — équivalent K8s de --memory/--cpus
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: nyx-api-svc
  namespace: production
spec:
  selector:
    app: nyx-api             # Cible tous les Pods portant ce label
  ports:
    - port: 80
      targetPort: 3000
  type: ClusterIP             # Adresse stable interne au cluster
```

<WarningCallout>
Sans `resources.limits`, un conteneur défaillant peut consommer toute la mémoire ou le CPU d'un nœud et affecter les autres Pods qui y tournent — définir des limites est une pratique de base, pas une option.
</WarningCallout>

## Les commandes kubectl essentielles

`kubectl` est le client en ligne de commande qui dialogue avec l'API Server.

```bash
# Lister les objets d'un type donné
kubectl get pods -n production
kubectl get deployments -n production
kubectl get services -n production

# Obtenir le détail complet d'un objet (événements, erreurs, config)
kubectl describe pod nyx-api-7d9f8c-x2k9p -n production

# Consulter les logs d'un conteneur dans un Pod
kubectl logs nyx-api-7d9f8c-x2k9p -n production

# Ouvrir un shell interactif dans un conteneur en cours d'exécution
kubectl exec -it nyx-api-7d9f8c-x2k9p -n production -- /bin/sh

# Appliquer (créer ou mettre à jour) un manifeste YAML
kubectl apply -f deployment.yaml

# Augmenter manuellement le nombre de répliques
kubectl scale deployment nyx-api --replicas=5 -n production
```

<TipCallout>
`kubectl describe` est souvent le premier réflexe de debug : la section `Events` en bas de sa sortie explique presque toujours pourquoi un Pod reste bloqué en `Pending` ou en `CrashLoopBackOff` (image introuvable, ressources insuffisantes, probe qui échoue…).
</TipCallout>

## ConfigMaps et Secrets

Séparer la configuration du code est une pratique fondamentale (voir le chapitre sur les variables d'environnement) — Kubernetes fournit deux objets dédiés :

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: nyx-api-config
data:
  LOG_LEVEL: "info"
  API_TIMEOUT: "30s"
---
apiVersion: v1
kind: Secret
metadata:
  name: nyx-api-secret
type: Opaque
data:
  DATABASE_PASSWORD: bnl4X2Rldl9zZWNyZXQ=   # base64 de "nyx_dev_secret"
```

<LegalCallout>
Un objet `Secret` Kubernetes n'est **chiffré ni au repos ni en mémoire par défaut** : la valeur est simplement encodée en base64, ce qui est trivialement réversible (`echo bnl4X2Rldl9zZWNyZXQ= | base64 -d`). Ce n'est pas un mécanisme de protection contre un attaquant ayant accès à `etcd` ou aux droits `get` sur le Secret dans le cluster — c'est un simple formatage. Le chiffrement au repos, la rotation et l'intégration à un coffre-fort externe (Vault, KMS) seront traités en détail dans le cours **DevSecOps Avancé**.
</LegalCallout>

Un ConfigMap ou un Secret peut être injecté dans un Pod comme variable d'environnement ou comme fichier monté, ce qui évite de coder en dur des valeurs sensibles dans l'image du conteneur.

## Scaling horizontal et self-healing

Le **scaling horizontal** consiste à ajouter ou retirer des répliques d'un Pod plutôt que d'augmenter les ressources d'une seule instance (scaling vertical). Un Deployment peut être mis à l'échelle manuellement (`kubectl scale`) ou automatiquement via un `HorizontalPodAutoscaler` basé sur des métriques comme l'usage CPU.

Le **self-healing** repose sur deux types de sondes (probes) que l'on déclare dans le manifeste du conteneur :

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 15
readinessProbe:
  httpGet:
    path: /ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
```

- **livenessProbe** : si elle échoue de façon répétée, Kubernetes considère le conteneur comme bloqué et le redémarre automatiquement.
- **readinessProbe** : si elle échoue, le Pod reste en vie mais est retiré temporairement du Service — il ne reçoit plus de trafic tant qu'il n'est pas de nouveau prêt (utile pendant un démarrage lent ou une surcharge temporaire).

<AuditCallout>
L'absence de `readinessProbe` est une cause fréquente d'incidents en production : un Pod qui redémarre reçoit du trafic avant d'être réellement prêt (connexion base de données non établie, cache non chargé), ce qui génère des erreurs 5xx visibles par les utilisateurs pendant un déploiement pourtant censé être transparent.
</AuditCallout>

## Lab — Mise en Pratique

**Environnement** : cluster Kubernetes local (minikube ou kind) accessible depuis le terminal Nyx Shell

<Steps steps={[
  { title: "Vérifier l'état du cluster", description: "Confirme que le control plane et les nodes sont opérationnels.", code: "kubectl get nodes" },
  { title: "Déployer l'application", description: "Applique le manifeste de Deployment et de Service créé plus haut.", code: "kubectl apply -f deployment.yaml" },
  { title: "Observer les Pods créés", description: "Liste les Pods du namespace et vérifie qu'il y en a bien 3.", code: "kubectl get pods -n production" },
  { title: "Inspecter un Pod en détail", description: "Consulte les événements pour comprendre son cycle de vie.", code: "kubectl describe pod <nom-du-pod> -n production" },
  { title: "Tester le scaling horizontal", description: "Passe de 3 à 6 répliques et observe les nouveaux Pods apparaître.", code: "kubectl scale deployment nyx-api --replicas=6 -n production" },
  { title: "Décoder un Secret (à des fins pédagogiques)", description: "Vérifie par toi-même que le Secret n'est pas chiffré, juste encodé.", code: "kubectl get secret nyx-api-secret -n production -o jsonpath='{.data.DATABASE_PASSWORD}' | base64 -d" },
]} />

## En résumé

- Docker Compose ne suffit plus dès qu'il faut répartir des conteneurs sur plusieurs machines, s'auto-réparer ou scaler automatiquement — c'est le rôle de Kubernetes.
- Le control plane (API Server, etcd, Scheduler, Controller Manager) décide et mémorise l'état désiré ; les nodes, via le kubelet, exécutent réellement les conteneurs.
- Les objets fondamentaux sont le Pod (unité de base), le Deployment (gestion des répliques), le Service (adresse réseau stable) et le Namespace (isolation logique).
- `kubectl get/describe/logs/exec/apply` couvrent l'essentiel du travail quotidien avec un cluster.
- Les ConfigMaps stockent la configuration non sensible ; les Secrets ne sont encodés en base64 que par défaut — **ce n'est pas du chiffrement**, un sujet approfondi dans le cours DevSecOps Avancé.
- Le scaling horizontal ajoute des répliques ; le self-healing repose sur les `livenessProbe` (redémarrage) et `readinessProbe` (retrait temporaire du trafic).
- La sécurité approfondie de Kubernetes (RBAC, network policies, durcissement de l'API Server) fait l'objet d'un chapitre dédié du cours **DevSecOps Avancé**.

## Questions de Révision

1. Pourquoi docker-compose devient-il insuffisant dès qu'une application doit tourner sur plusieurs machines ?
2. Quel composant du control plane stocke l'état complet et unique de vérité du cluster ?
3. Quelle est la différence de rôle entre un Pod et un Deployment ?
4. Pourquoi un Secret Kubernetes ne doit-il jamais être considéré comme une donnée chiffrée par défaut ?
5. Que se passe-t-il concrètement quand une `readinessProbe` échoue, par opposition à une `livenessProbe` ?
6. Quelle commande permettrait de savoir pourquoi un Pod reste bloqué en état `Pending` ?
