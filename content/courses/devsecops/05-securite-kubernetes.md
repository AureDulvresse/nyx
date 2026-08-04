---
title: Sécurité de Kubernetes — RBAC, network policies et admission controllers
chapter: 5
course: devsecops
difficulty: advanced
duration: 55
tags: [kubernetes, rbac, network-policy, opa-gatekeeper, secrets]
ceh_modules: []
objectives:
  - Restreindre les permissions d'un compte de service avec RBAC (Role, RoleBinding, ClusterRole)
  - Isoler le trafic pod-à-pod par défaut avec les NetworkPolicies
  - Identifier les misconfigurations de sécurité les plus dangereuses (Pod Security Standards)
  - Comprendre le rôle des admission controllers (OPA/Gatekeeper) et les limites des Secrets natifs
---

## Introduction

Un cluster Kubernetes correctement déployé (tu maîtrises déjà Pods, Deployments et Services depuis le cours DevOps Fondamentaux) n'est pas pour autant un cluster sécurisé. Par défaut, Kubernetes est permissif : un pod compromis peut souvent contacter n'importe quel autre pod du cluster, un compte de service mal scopé peut lister des secrets dans tous les namespaces, et rien n'empêche a priori un manifeste de démarrer un conteneur en mode `privileged`. Ce chapitre couvre les quatre piliers qui transforment un cluster « qui fonctionne » en cluster « qui résiste à une compromission partielle » : le contrôle d'accès (RBAC), l'isolation réseau (NetworkPolicies), les standards de sécurité des pods (Pod Security Standards) et les contrôleurs d'admission qui appliquent des politiques avant même qu'un objet soit créé.

Le fil conducteur est le principe du moindre privilège, décliné à chaque couche : un compte de service ne doit voir que son namespace, un pod ne doit parler qu'aux pods dont il a réellement besoin, un conteneur ne doit jamais tourner en root s'il peut faire autrement, et un secret ne doit jamais rester en clair au repos. Chacune de ces couches est une ligne de défense indépendante : si une seule échoue, les autres limitent quand même le rayon d'action d'un attaquant.

## RBAC — Role, RoleBinding et ClusterRole

Le RBAC (Role-Based Access Control) de Kubernetes répond à une question simple : *qui a le droit de faire quoi, sur quelles ressources, dans quel namespace ?* Un `Role` définit un ensemble de permissions **limité à un namespace** ; un `ClusterRole` définit les mêmes permissions mais à l'échelle du cluster entier (ou pour des ressources non namespacées comme les `Node`). Un `RoleBinding` (ou `ClusterRoleBinding`) associe ensuite ce rôle à un utilisateur, un groupe ou un compte de service (`ServiceAccount`).

```yaml
# role.yaml — un compte de service ne peut lire que les Pods et ConfigMaps
# du namespace "billing", rien d'autre
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: billing
  name: billing-app-reader
rules:
  - apiGroups: [""]
    resources: ["pods", "configmaps"]
    verbs: ["get", "list", "watch"]
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: billing-app-sa
  namespace: billing
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: billing-app-binding
  namespace: billing
subjects:
  - kind: ServiceAccount
    name: billing-app-sa
    namespace: billing
roleRef:
  kind: Role
  name: billing-app-reader
  apiGroup: rbac.authorization.k8s.io
```

<WarningCallout>
L'erreur la plus fréquente est d'utiliser un `ClusterRoleBinding` « parce que ça marche partout » — c'est exactement ce qu'il faut éviter. Un `ClusterRoleBinding` donne les permissions **dans tous les namespaces**, y compris ceux qui contiennent des secrets sensibles (`kube-system`, `billing`, etc.). Toujours préférer un `Role` + `RoleBinding` scopé, et ne réserver les `ClusterRole` qu'aux besoins réellement transverses (ex: un opérateur de monitoring).
</WarningCallout>

```bash
# Vérifier concrètement ce qu'un compte de service peut faire
kubectl auth can-i list secrets --as=system:serviceaccount:billing:billing-app-sa -n billing
kubectl auth can-i list secrets --as=system:serviceaccount:billing:billing-app-sa --all-namespaces
```

<CehCallout>
Lors d'un audit ou d'un pentest de cluster, `kubectl auth can-i --list --as=system:serviceaccount:<ns>:<sa>` est la première commande à lancer une fois un token de compte de service récupéré (souvent monté automatiquement dans `/var/run/secrets/kubernetes.io/serviceaccount/token` à l'intérieur d'un pod compromis) — elle révèle immédiatement le rayon d'action réel de ce token.
</CehCallout>

## NetworkPolicies — isoler le trafic pod-à-pod

Sans NetworkPolicy, tous les pods d'un cluster peuvent communiquer librement entre eux, quel que soit leur namespace — c'est un réseau plat par défaut. Une NetworkPolicy fonctionne comme un firewall applicatif niveau pod : elle sélectionne des pods via un `podSelector` et définit les flux entrants (`ingress`) et sortants (`egress`) autorisés. Dès qu'une NetworkPolicy s'applique à un pod, **tout ce qui n'est pas explicitement autorisé est bloqué**.

```yaml
# deny-all.yaml — bloque tout le trafic entrant et sortant du namespace "billing"
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: billing
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```

Cette politique « deny all » est le point de départ recommandé sur tout namespace sensible. On ajoute ensuite des exceptions ciblées pour les flux réellement nécessaires :

```yaml
# allow-frontend-to-api.yaml — exception : le frontend peut appeler l'API sur le port 8080
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-api
  namespace: billing
spec:
  podSelector:
    matchLabels:
      app: billing-api
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: billing-frontend
      ports:
        - protocol: TCP
          port: 8080
```

<TipCallout>
Une NetworkPolicy ne fonctionne que si le CNI (Container Network Interface) du cluster l'implémente — Calico, Cilium ou Weave Net le font, mais le plugin réseau par défaut de certains clusters managés ne l'applique pas sans configuration additionnelle. Vérifie toujours que la politique est effectivement appliquée avant de t'y fier.
</TipCallout>

## Pod Security Standards — privileged, baseline, restricted

Kubernetes définit trois niveaux de Pod Security Standards, appliqués via l'admission controller `PodSecurity` intégré : **privileged** (aucune restriction — usage réservé aux composants système), **baseline** (bloque les escalades de privilèges les plus évidentes) et **restricted** (applique les meilleures pratiques de durcissement, recommandé pour toute charge applicative).

Trois réglages du `securityContext` d'un pod, combinés, constituent l'une des configurations les plus dangereuses qu'un cluster puisse héberger — c'est d'ailleurs exactement ce que tu dois repérer dans le lab **Le Pipeline Compromis** :

<AttackDefenseTable rows={[
  { phase: "privileged: true", attack: "Le conteneur a un accès quasi total au noyau de l'hôte — capacités désactivées par défaut réactivées, accès direct aux périphériques", defense: "Ne jamais activer `privileged: true` en production ; utiliser des capacités Linux (`capabilities.add`) ciblées si un accès spécifique est réellement nécessaire" },
  { phase: "runAsUser: 0", attack: "Le processus dans le conteneur tourne en root — une évasion de conteneur (container breakout) donne alors un accès root direct sur le nœud hôte", defense: "Forcer `runAsNonRoot: true` et définir un `runAsUser` non-zéro dans le `securityContext`, au niveau pod ou conteneur" },
  { phase: "hostNetwork: true", attack: "Le pod partage directement la pile réseau de l'hôte — il contourne toutes les NetworkPolicies et voit le trafic réseau du nœud", defense: "Ne jamais utiliser `hostNetwork: true` pour une charge applicative standard ; réserver ce réglage aux composants réseau système explicitement validés" },
]} />

```yaml
# Extrait dangereux — les trois misconfigurations combinées
spec:
  hostNetwork: true
  containers:
    - name: app
      image: app:latest
      securityContext:
        privileged: true
        runAsUser: 0
```

```yaml
# Version durcie équivalente — profil "restricted"
spec:
  hostNetwork: false
  containers:
    - name: app
      image: app:latest
      securityContext:
        privileged: false
        runAsNonRoot: true
        runAsUser: 10001
        allowPrivilegeEscalation: false
        capabilities:
          drop: ["ALL"]
        readOnlyRootFilesystem: true
```

<AuditCallout>
ISO 27001 (contrôle A.8.9 — configuration management) et le CIS Kubernetes Benchmark exigent que les charges applicatives ne tournent jamais en `privileged` ni en root sans justification documentée et validée. En audit, la présence d'un seul pod combinant les trois réglages ci-dessus dans un namespace applicatif doit être traitée comme une non-conformité critique.
</AuditCallout>

## Admission controllers — OPA/Gatekeeper

Un admission controller intercepte chaque requête de création ou modification d'objet **avant** qu'elle soit persistée dans etcd, et peut la valider, la modifier ou la rejeter. Le `PodSecurity` mentionné plus haut en est un exemple natif ; **OPA Gatekeeper** (Open Policy Agent) permet d'écrire des politiques personnalisées, arbitrairement riches, appliquées à l'admission de n'importe quel objet Kubernetes.

Le principe : une `ConstraintTemplate` définit une règle en langage Rego (le langage de policy d'OPA), puis une `Constraint` applique cette règle à un périmètre précis (namespaces, types de ressources).

```yaml
# Exemple conceptuel — rejeter tout pod sans limites de ressources définies
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequiredResources
metadata:
  name: require-resource-limits
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
  parameters:
    limits: ["cpu", "memory"]
```

Contrairement aux NetworkPolicies (appliquées au runtime réseau) ou au RBAC (appliqué à l'exécution des appels API), un admission controller agit **au moment du déploiement** : un manifeste non conforme n'est même jamais créé dans le cluster. C'est la couche idéale pour interdire `privileged: true` ou `hostNetwork: true` de façon systématique, plutôt que de compter sur la vigilance de chaque développeur.

## Secrets Kubernetes — une fausse impression de sécurité

Un objet `Secret` Kubernetes n'est, par défaut, **encodé en base64, pas chiffré**. N'importe qui disposant d'un accès `get` sur les secrets d'un namespace (via RBAC insuffisamment restreint) peut les décoder instantanément.

```bash
# Décoder un secret Kubernetes — trivial si l'accès RBAC le permet
kubectl get secret db-credentials -n billing -o jsonpath='{.data.password}' | base64 -d
```

<WarningCallout>
Le base64 n'est pas du chiffrement — c'est un simple encodage réversible sans clé. Un Secret Kubernetes non protégé davantage offre une sécurité illusoire : la vraie protection vient du RBAC qui restreint qui peut le lire, et idéalement du chiffrement au repos dans etcd (`EncryptionConfiguration`) ou d'un coffre-fort externe (HashiCorp Vault, AWS Secrets Manager via un opérateur comme External Secrets).
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell) — lab devops-001, « Le Pipeline Compromis »

<Steps steps={[
  { title: "Explorer les manifestes du cluster", description: "Liste les Deployments du namespace ciblé par le lab pour repérer les fichiers YAML suspects.", code: "kubectl get deployments -n <namespace> -o yaml > deployments.yaml" },
  { title: "Repérer les réglages de sécurité dangereux", description: "Recherche les trois marqueurs vus dans ce chapitre au milieu des déploiements correctement durcis.", code: "grep -E \"privileged: true|runAsUser: 0|hostNetwork: true\" deployments.yaml" },
  { title: "Confirmer la combinaison complète", description: "Isole le Deployment qui combine les trois réglages en même temps — c'est celui-ci qui contient le second flag du lab.", code: "kubectl describe deployment <nom-suspect> -n <namespace>" },
  { title: "Documenter la remédiation", description: "Pour valider ta compréhension, réécris mentalement (ou dans tes notes) le `securityContext` de ce Deployment selon le profil « restricted » présenté plus haut, avant de soumettre le flag." },
]} />

## En résumé

- RBAC (`Role`/`RoleBinding` namespacés, `ClusterRole`/`ClusterRoleBinding` pour les besoins transverses) applique le moindre privilège aux comptes de service — `kubectl auth can-i` permet de vérifier concrètement les permissions effectives.
- Les NetworkPolicies transforment le réseau plat par défaut de Kubernetes en réseau segmenté : une politique « deny all » par namespace, complétée par des exceptions ciblées, limite la propagation latérale en cas de compromission d'un pod.
- La combinaison `privileged: true` + `runAsUser: 0` + `hostNetwork: true` est l'une des configurations les plus dangereuses d'un cluster — elle donne un accès quasi total à l'hôte et contourne les NetworkPolicies.
- Les admission controllers (OPA/Gatekeeper) rejettent les manifestes non conformes avant même leur création, complétant le RBAC et les NetworkPolicies par un contrôle au moment du déploiement.
- Un Secret Kubernetes n'est que du base64 par défaut — la protection réelle vient du RBAC restrictif, du chiffrement au repos dans etcd, ou d'un coffre-fort externe.

## Questions de Révision

1. Pourquoi un `ClusterRoleBinding` est-il souvent une erreur quand un simple `Role` + `RoleBinding` namespacé suffirait ?
2. Que se passe-t-il par défaut sur le trafic pod-à-pod tant qu'aucune NetworkPolicy n'a été appliquée à un namespace ?
3. En quoi la combinaison `privileged: true`, `runAsUser: 0` et `hostNetwork: true` est-elle particulièrement dangereuse par rapport à chacun de ces réglages pris isolément ?
4. Quelle est la différence fondamentale entre une NetworkPolicy et un admission controller comme OPA Gatekeeper, en termes de moment où la politique s'applique ?
5. Pourquoi un objet Secret Kubernetes ne doit-il jamais être considéré comme suffisamment sécurisé par lui-même ?
