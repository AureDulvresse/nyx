---
title: Sécurité des conteneurs et des images
chapter: 4
course: devsecops
difficulty: intermediate
duration: 55
tags: [docker, container-security, trivy, distroless, cosign]
ceh_modules: []
objectives:
  - Scanner une image Docker et interpréter un rapport de vulnérabilités
  - Réduire la surface d'attaque d'une image avec une approche distroless et un utilisateur non-root
  - Identifier les risques de configuration (ADD distant, --privileged) menant à un container escape
---

## Introduction

Tu sais déjà construire et faire tourner des conteneurs Docker. Ce chapitre change de focale : il ne s'agit plus de faire fonctionner un conteneur, mais de le sécuriser à chaque étape de son cycle de vie, de l'image de base jusqu'à l'exécution en production. Un conteneur mal configuré n'est pas juste une mauvaise pratique — c'est une porte d'entrée directe vers l'hôte qui l'exécute.

Trois angles structurent ce chapitre : d'abord la surface d'attaque de l'**image** elle-même (vulnérabilités connues dans les paquets embarqués, taille inutile, contenu superflu) ; ensuite les erreurs de **configuration du Dockerfile** qui transforment un conteneur inoffensif en cible facile (exécution root, récupération de fichiers distants non vérifiés) ; enfin les risques liés à l'**exécution** du conteneur sur l'hôte (privilèges excessifs, évasion vers le système hôte). Tu verras aussi une introduction à la signature d'images avec cosign, sujet qui sera approfondi au chapitre 6 sur la sécurité de la chaîne d'approvisionnement (supply chain).

L'objectif n'est pas de mémoriser une liste d'outils, mais de comprendre pourquoi chaque recommandation existe — pour pouvoir l'appliquer même face à un cas que ce chapitre ne couvre pas explicitement.

## Scanner une image avec Trivy

Une image Docker embarque un système d'exploitation minimal et des bibliothèques — chacune peut contenir des CVE connues. Un scanner de vulnérabilités compare le contenu de l'image à des bases de données publiques (NVD, GitHub Security Advisories, etc.) pour détecter ces failles avant le déploiement.

```bash
# Scanner une image locale ou distante
trivy image nginx:1.21.0

# Ne remonter que les vulnérabilités HIGH et CRITICAL
trivy image --severity HIGH,CRITICAL nginx:1.21.0

# Générer un rapport exploitable en CI (JSON)
trivy image --format json --output report.json nginx:1.21.0
```

```text
nginx:1.21.0 (debian 11.3)
=========================
Total: 102 (HIGH: 18, CRITICAL: 4)

┌────────────┬────────────────┬──────────┬───────────────────┬───────────────┬──────────────────────────────┐
│  Library   │ Vulnerability  │ Severity │ Installed Version │ Fixed Version │             Title             │
├────────────┼────────────────┼──────────┼───────────────────┼───────────────┼──────────────────────────────┤
│ libssl1.1  │ CVE-2022-0778  │ CRITICAL │ 1.1.1n-0+deb11u1  │ 1.1.1n-0+deb11u3 │ openssl: Infinite loop in BN_mod_sqrt() │
│ zlib1g     │ CVE-2022-37434 │ HIGH     │ 1:1.2.11.dfsg-2   │ 1:1.2.11.dfsg-2+deb11u2 │ zlib: heap-based buffer over-read │
└────────────┴────────────────┴──────────┴───────────────────┴───────────────┴──────────────────────────────┘
```

La colonne **Fixed Version** est la plus actionnable du rapport : si elle est renseignée, la remédiation consiste simplement à reconstruire l'image sur une base plus récente ou à mettre à jour le paquet concerné.

<TipCallout>
Grype (Anchore) suit une logique équivalente à Trivy et s'utilise de façon très similaire (`grype nginx:1.21.0`) — les deux outils sont couramment combinés en CI pour croiser leurs bases de vulnérabilités, car aucune base unique n'est exhaustive.
</TipCallout>

<CehCallout>
Un scan d'image en `--exit-code 1` combiné aux severities HIGH/CRITICAL est l'intégration CI la plus courante : le pipeline échoue automatiquement si une image contient une vulnérabilité critique corrigeable, avant même d'atteindre l'environnement de staging.
</CehCallout>

## Réduire la surface d'attaque : images distroless

Chaque paquet présent dans une image est une surface d'attaque potentielle : un shell, un gestionnaire de paquets ou un compilateur inutiles à l'exécution de l'application sont autant d'outils qu'un attaquant pourra détourner après une compromission initiale. Les images **distroless** (projet Google) poussent cette logique à l'extrême : elles ne contiennent que le runtime strictement nécessaire à l'application (ex: la libc et le runtime Node.js), sans shell, sans gestionnaire de paquets, sans utilitaires système.

<CompareTable
  titleA="Ubuntu complet (ubuntu:22.04)"
  titleB="Distroless (gcr.io/distroless/nodejs20)"
  rows={[
    { a: "Taille de l'image : ~77 Mo de base, souvent 300+ Mo avec les dépendances", b: "Taille de l'image : ~40-60 Mo, runtime applicatif inclus" },
    { a: "Shell (bash/sh) présent — utilisable par un attaquant pour explorer le système", b: "Aucun shell — un attaquant qui exploite l'application ne peut pas obtenir de shell interactif" },
    { a: "Gestionnaire de paquets (apt) présent — permet d'installer des outils post-compromission", b: "Aucun gestionnaire de paquets — impossible d'installer quoi que ce soit dans le conteneur en cours d'exécution" },
    { a: "Centaines de paquets système = surface CVE large", b: "Dizaines de paquets seulement = surface CVE fortement réduite" },
    { a: "Débogage facile (on peut entrer avec `docker exec -it ... bash`)", b: "Débogage plus difficile — nécessite une image de debug dédiée (`:debug` tag) en développement" },
  ]}
/>

```dockerfile
# Build multi-stage : compiler avec une image complète, exécuter avec distroless
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build

FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["dist/server.js"]
```

<WarningCallout>
L'absence de shell dans une image distroless n'est pas qu'un confort de sécurité en cas d'intrusion : elle empêche aussi certaines techniques de post-exploitation classiques (téléchargement d'un reverse shell, énumération manuelle) qui supposent un interpréteur de commandes disponible dans le conteneur compromis.
</WarningCallout>

## Exécution non-root dans le Dockerfile

Par défaut, un conteneur Docker s'exécute avec l'utilisateur `root` si aucun `USER` n'est spécifié dans le Dockerfile. Si l'application est compromise (ex: exécution de code arbitraire via une dépendance vulnérable), le processus de l'attaquant hérite des privilèges root **à l'intérieur du conteneur** — ce qui facilite grandement une éventuelle évasion vers l'hôte.

```dockerfile
# ❌ Dockerfile vulnérable — root implicite, aucune restriction
FROM ubuntu:latest
RUN apt-get update && apt-get install -y curl
ADD http://example.com/app-latest.tar.gz /app/
WORKDIR /app
RUN tar -xzf app-latest.tar.gz
CMD ["./app"]
```

```dockerfile
# ✅ Version corrigée — image versionnée, utilisateur dédié, COPY local
FROM ubuntu:22.04

RUN groupadd -r appgroup && useradd -r -g appgroup -d /app appuser

COPY ./app-latest.tar.gz /app/app-latest.tar.gz
WORKDIR /app
RUN tar -xzf app-latest.tar.gz && \
    chown -R appuser:appgroup /app

USER appuser
CMD ["./app"]
```

La directive `USER appuser` doit apparaître **après** toutes les instructions nécessitant des privilèges élevés (installation de paquets, changement de propriétaire de fichiers) et avant le `CMD`/`ENTRYPOINT` final : c'est l'utilisateur actif au moment du `USER` qui s'applique à toutes les instructions suivantes et à l'exécution du conteneur.

<AuditCallout>
Le contrôle CIS Docker Benchmark 4.1 ("Ensure a user for the container has been created") est l'un des contrôles les plus fréquemment échoués en audit — de nombreuses images publiques du Docker Hub tournent encore root par défaut, ce qu'un simple `docker inspect --format '{{.Config.User}}' <image>` permet de vérifier avant déploiement.
</AuditCallout>

## ADD distant vs COPY : un risque souvent ignoré

La différence entre `ADD` et `COPY` semble anodine, mais elle a une conséquence de sécurité directe : `ADD` peut récupérer un fichier depuis une URL distante et l'extraire automatiquement s'il s'agit d'une archive, alors que `COPY` ne fait que copier un fichier local du contexte de build.

```dockerfile
# ❌ Dangereux : téléchargement non vérifié, exécuté à chaque build
ADD http://example.com/app-latest.tar.gz /app/
```

Ce pattern pose trois problèmes concrets :

1. **Aucune intégrité vérifiée** — si le serveur distant est compromis ou si la connexion est interceptée (absence de TLS, certificat non validé), le contenu injecté dans l'image peut être arbitraire.
2. **Non-reproductibilité** — le tag `latest` de l'URL signifie que deux builds à des dates différentes peuvent produire des images différentes, rendant les scans et audits incohérents dans le temps.
3. **Extraction automatique non maîtrisée** — `ADD` décompresse automatiquement les archives reconnues (`.tar.gz`, `.zip`), un comportement surprenant qui peut écraser des fichiers existants dans l'image de façon inattendue.

```dockerfile
# ✅ Correct : fichier local versionné, intégrité vérifiable en amont (checksum en CI)
COPY ./dist/app-v2.4.1.tar.gz /app/app.tar.gz
RUN tar -xzf /app/app.tar.gz -C /app --strip-components=1 && rm /app/app.tar.gz
```

<TipCallout>
Réserve `ADD` au seul cas où son comportement d'extraction automatique d'une archive locale est explicitement souhaité — dans tous les autres cas (fichiers locaux, récupération distante), `COPY` associé à une étape de téléchargement vérifiée en amont (checksum SHA-256 comparé) est la pratique recommandée.
</TipCallout>

## Container escape : --privileged et capabilities Linux

Un conteneur partage le noyau de la machine hôte — contrairement à une machine virtuelle, il n'y a pas d'hyperviseur qui isole complètement l'exécution. L'isolation repose sur des mécanismes du noyau Linux (namespaces, cgroups, capabilities), qui peuvent être affaiblis par une mauvaise configuration au lancement du conteneur.

```bash
# ❌ Extrêmement dangereux : désactive quasiment toute l'isolation du conteneur
docker run --privileged -v /:/host maligne-image
```

Le flag `--privileged` donne au conteneur l'accès à **tous** les périphériques de l'hôte et désactive la plupart des restrictions de sécurité normalement appliquées — un attaquant qui obtient l'exécution de code dans un tel conteneur peut typiquement monter le système de fichiers de l'hôte et en prendre le contrôle total.

Les **capabilities Linux** offrent une alternative bien plus fine : au lieu du tout-ou-rien de root, elles découpent les privilèges root en unités indépendantes (`CAP_NET_ADMIN` pour la configuration réseau, `CAP_SYS_ADMIN` pour des opérations d'administration système, etc.).

```bash
# ✅ N'accorder que les capabilities strictement nécessaires
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE mon-image
```

<AttackDefenseTable rows={[
  { phase: "Lancement du conteneur", attack: "`--privileged` ou montage de `/var/run/docker.sock` dans le conteneur", defense: "`--cap-drop=ALL` puis ajout ciblé des seules capabilities requises" },
  { phase: "Exécution applicative", attack: "Processus applicatif tournant en root dans le conteneur", defense: "Directive `USER` non-root dans le Dockerfile + `--security-opt=no-new-privileges`" },
  { phase: "Construction de l'image", attack: "`ADD` d'une archive distante non vérifiée, image de base `latest` non figée", defense: "`COPY` de fichiers locaux vérifiés (checksum), tag de version explicite et figé" },
  { phase: "Distribution / déploiement", attack: "Image non signée, provenance non vérifiable, tirée de n'importe quel registre", defense: "Signature cosign/Sigstore + politique d'admission qui rejette les images non signées" },
]} />

<WarningCallout>
Monter `/var/run/docker.sock` à l'intérieur d'un conteneur (pratique courante pour des outils de CI "Docker-in-Docker") équivaut presque à `--privileged` : ce socket donne un accès complet à l'API Docker de l'hôte, permettant de créer un nouveau conteneur monté sur `/` et d'en sortir trivialement.
</WarningCallout>

## Signer ses images avec cosign (introduction)

Scanner et durcir une image ne garantit pas qu'au moment du déploiement, l'image réellement récupérée depuis le registre est bien celle qui a été construite et validée — un registre compromis ou une attaque de type *tag mutation* peut substituer une image malveillante portant le même tag. **cosign**, projet du framework Sigstore, répond à ce problème par la signature cryptographique des images.

```bash
# Signer une image après le build (clé keyless via OIDC, ou clé locale)
cosign sign --key cosign.key registry.example.com/app:v2.4.1

# Vérifier la signature avant déploiement
cosign verify --key cosign.pub registry.example.com/app:v2.4.1
```

Ce mécanisme garantit l'**intégrité** (l'image n'a pas été modifiée après signature) et la **provenance** (l'image provient bien du pipeline de build attendu) — deux propriétés qu'un simple scan de vulnérabilités ne peut pas fournir. Ce sujet sera repris en profondeur au chapitre 6, consacré à la sécurité de la chaîne d'approvisionnement logicielle (supply chain), avec l'intégration en CI/CD et les politiques d'admission Kubernetes qui rejettent automatiquement les images non signées.

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell) + Docker local

<Steps steps={[
  { title: "Scanner une image vulnérable", description: "Lance un scan Trivy sur une ancienne image nginx et identifie les CVE critiques.", code: "trivy image --severity HIGH,CRITICAL nginx:1.21.0" },
  { title: "Corriger le Dockerfile fourni", description: "Récupère le Dockerfile du dossier lab (FROM ubuntu:latest, ADD distant, pas de USER) et corrige les trois problèmes : image versionnée, COPY local, utilisateur non-root.", code: "docker build -t app-corrigee:1.0 ." },
  { title: "Vérifier l'utilisateur d'exécution", description: "Confirme que l'image corrigée ne tourne pas root.", code: "docker inspect --format '{{.Config.User}}' app-corrigee:1.0" },
  { title: "Comparer les tailles d'image", description: "Compare la taille de l'image Ubuntu complète à une version distroless équivalente.", code: "docker images | grep -E 'ubuntu|distroless'" },
  { title: "Aller plus loin (optionnel)", description: "Recherche si l'image publique que tu utilises le plus souvent en développement est disponible en variante distroless, et évalue ce qu'il faudrait adapter dans ton workflow de debug si elle n'a plus de shell." },
]} />

## En résumé

- Trivy et Grype scannent une image pour détecter des CVE connues dans ses paquets ; la colonne "Fixed Version" du rapport indique directement l'action de remédiation.
- Les images distroless suppriment shell et gestionnaire de paquets, réduisant fortement la surface d'attaque et les possibilités de post-exploitation en cas de compromission de l'application.
- La directive `USER` dans un Dockerfile doit être placée juste avant le `CMD`/`ENTRYPOINT`, après toutes les opérations nécessitant des privilèges élevés.
- `ADD` depuis une URL distante contourne toute vérification d'intégrité et casse la reproductibilité du build — `COPY` associé à une vérification de checksum en amont est la pratique recommandée.
- `--privileged` désactive quasiment toute l'isolation du conteneur ; les capabilities Linux (`--cap-drop=ALL` + ajout ciblé) offrent un contrôle beaucoup plus fin des privilèges réellement nécessaires.
- cosign/Sigstore permet de signer et vérifier la provenance d'une image, un sujet approfondi au chapitre 6 sur la sécurité de la chaîne d'approvisionnement.

## Questions de Révision

1. Pourquoi la colonne "Fixed Version" d'un rapport Trivy est-elle l'information la plus actionnable pour la remédiation ?
2. Quels sont les deux éléments absents d'une image distroless qui limitent concrètement la post-exploitation après une compromission applicative ?
3. Où doit être placée la directive `USER` dans un Dockerfile, et pourquoi son emplacement compte-t-il ?
4. Quels sont les deux risques concrets d'utiliser `ADD` avec une URL distante plutôt que `COPY` avec un fichier local vérifié ?
5. En quoi monter `/var/run/docker.sock` dans un conteneur est-il presque équivalent à lancer ce conteneur en `--privileged` ?
6. Quelles deux propriétés la signature cosign d'une image apporte-t-elle qu'un simple scan de vulnérabilités ne garantit pas ?
