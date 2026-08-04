---
title: Supply Chain Security — SBOM et Signature
chapter: 6
course: devsecops
difficulty: advanced
duration: 55
tags: [supply-chain, sbom, sigstore, cosign, slsa, cyclonedx, spdx]
ceh_modules: []
objectives:
  - Générer et exploiter un SBOM (CycloneDX/SPDX) pour réagir en minutes à une vulnérabilité critique
  - Comprendre les attaques de dependency confusion et de typosquatting à travers des cas réels
  - Signer des artefacts et des images avec Sigstore/cosign en keyless signing
  - Situer la maturité d'une chaîne de build sur les niveaux SLSA 0 à 3
---

## Introduction

Un chapitre précédent de la sécurité des applications a évoqué la vérification des dépendances applicatives — audit de `package.json` ou `requirements.txt` avant de merger. Ce chapitre change d'échelle : il ne s'agit plus de savoir *quelles bibliothèques* un développeur a choisi d'importer, mais de savoir *ce qui compose réellement* un artefact au moment où il quitte le pipeline de build — jusqu'aux dépendances transitives, aux images de base, aux binaires vendus, et à la provenance de chaque étape de compilation.

Le 9 décembre 2021, la faille Log4Shell (CVE-2021-44228) a explosé sur des dizaines de milliers de systèmes en quelques heures. Les équipes qui possédaient un inventaire précis de leurs composants ont pu répondre en quelques minutes : « nous utilisons Log4j 2.14.1 dans ces douze services, patch en cours ». Celles qui ne l'avaient pas ont passé des jours, parfois des semaines, à grep des JAR sur des milliers de serveurs pour savoir si elles étaient exposées. Cette différence de vélocité — minutes contre jours — est exactement ce que ce chapitre vise à construire : un inventaire fiable (SBOM), une chaîne de confiance vérifiable (signature), et un cadre pour mesurer la maturité de ta chaîne de build (SLSA).

## Le SBOM : l'inventaire vérifiable d'un artefact

Un SBOM (Software Bill of Materials) est une liste structurée, lisible par une machine, de tous les composants qui entrent dans la fabrication d'un artefact logiciel — bibliothèques directes et transitives, versions exactes, licences, hashes cryptographiques, et parfois relations de dépendance entre composants.

Deux formats dominent le paysage, normalisés et interopérables avec l'outillage de sécurité moderne :

<CompareTable
  titleA="CycloneDX"
  titleB="SPDX"
  rows={[
    { a: "Porté par l'OWASP, orienté sécurité applicative (vulnérabilités, VEX)", b: "Porté par la Linux Foundation, orienté conformité licence et audit légal" },
    { a: "Format natif JSON/XML, léger, facile à générer en CI", b: "Format tabulaire historique (tag-value), plus verbeux, aussi disponible en JSON" },
    { a: "Standard de facto pour l'écosystème DevSecOps (Dependency-Track, Grype)", b: "Standard ISO/IEC 5962:2021, exigé dans certains contrats gouvernementaux US" },
  ]}
/>

```json
// Extrait d'un SBOM CycloneDX (format JSON simplifié)
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.5",
  "components": [
    {
      "type": "library",
      "name": "log4j-core",
      "version": "2.14.1",
      "purl": "pkg:maven/org.apache.logging.log4j/log4j-core@2.14.1",
      "hashes": [{ "alg": "SHA-256", "content": "a1b2c3..." }],
      "licenses": [{ "license": { "id": "Apache-2.0" } }]
    }
  ]
}
```

### Générer un SBOM automatiquement en CI

La génération manuelle n'a aucun intérêt : le SBOM doit être produit à chaque build, sans intervention humaine, et archivé aux côtés de l'artefact.

```yaml
# Extrait d'un pipeline GitLab CI / GitHub Actions
generate-sbom:
  stage: build
  script:
    # Syft génère un SBOM à partir du code source OU d'une image Docker
    - syft packages dir:. -o cyclonedx-json=sbom.cdx.json
    - syft packages myapp:${CI_COMMIT_SHA} -o cyclonedx-json=sbom-image.cdx.json
  artifacts:
    paths:
      - sbom.cdx.json
      - sbom-image.cdx.json
```

<TipCallout>
Génère toujours deux SBOM distincts quand c'est possible : un pour le code source (dépendances déclarées) et un pour l'image finale (ce qui est réellement embarqué, y compris les paquets système de l'image de base) — les deux divergent souvent, et c'est le second qui compte en cas d'incident.
</TipCallout>

### Le SBOM à l'épreuve d'un incident

<CompareTable
  titleA="Sans SBOM ni signature"
  titleB="Avec SBOM à jour et signature"
  rows={[
    { a: "Identifier les services touchés par une CVE : SSH sur chaque serveur, grep manuel, plusieurs jours", b: "Requête sur l'inventaire centralisé (ex: Dependency-Track) : réponse en quelques minutes" },
    { a: "Aucune certitude que le binaire déployé correspond au code audité", b: "Vérification cryptographique immédiate de la provenance avant tout rollback ou patch" },
    { a: "Communication de crise basée sur des estimations approximatives", b: "Rapport précis et daté à fournir aux clients ou régulateurs dans l'heure" },
    { a: "Risque de re-déployer une image compromise sans le savoir", b: "Rejet automatique par la politique d'admission si la signature ou le SBOM est absent" },
  ]}
/>

<CehCallout>
Log4Shell reste le cas d'école cité dans toutes les formations DevSecOps : les organisations dotées d'un SBOM à jour ont pu circonscrire l'incident en interrogeant leur inventaire, quand d'autres ont dû mener un audit manuel à l'échelle de leur parc entier.
</CehCallout>

## Dependency confusion et typosquatting

Le SBOM répond à « que possédons-nous ? » — mais une autre classe d'attaques exploite directement la manière dont les gestionnaires de paquets résolvent les noms de dépendances.

**Dependency confusion** : un attaquant publie sur un registre public (npm, PyPI) un paquet portant le même nom qu'un paquet interne d'une entreprise, avec un numéro de version supérieur. Si la configuration du gestionnaire de paquets ne force pas la priorité au registre privé, l'installation récupère silencieusement la version malveillante publique. En 2021, le chercheur Alex Birsan a démontré cette technique contre plus de 35 entreprises (Apple, Microsoft, Tesla, PayPal, Uber...), en publiant des paquets homonymes sur npm et PyPI qui exécutaient du code exfiltrant des informations dès l'installation — le tout de façon totalement légale, chaque entreprise ayant ensuite versé une prime via son programme de bug bounty.

**Typosquatting** : l'attaquant publie un paquet dont le nom est une faute de frappe plausible d'un paquet populaire (`reqeusts` au lieu de `requests`, `crossenv` au lieu de `cross-env`). Un développeur pressé qui tape mal la commande d'installation récupère le paquet malveillant. Le paquet `event-stream` compromis en 2018 illustre une variante plus insidieuse : un mainteneur légitime mais épuisé a transféré la maintenance à un inconnu, qui a ensuite injecté une dépendance malveillante ciblant spécifiquement les wallets de cryptomonnaie d'une application utilisant ce paquet.

<WarningCallout>
Ces deux attaques contournent tout audit de licence ou de qualité de code classique : le paquet malveillant n'est visible dans aucun diff de code applicatif, car il n'a jamais été ajouté intentionnellement — c'est la résolution de nom elle-même qui est piégée.
</WarningCallout>

Contre-mesures concrètes : scoper les paquets internes (`@monentreprise/paquet-interne`), configurer les registres pour interdire explicitement la résolution externe des scopes privés, verrouiller les versions avec des lockfiles (`package-lock.json`, `poetry.lock`) et vérifier leurs hashes, et scanner les nouvelles dépendances avec des outils dédiés (ex: Socket.dev, OSV-Scanner) qui détectent les comportements suspects à l'installation (accès réseau, lecture de variables d'environnement).

## Signer les artefacts avec Sigstore et cosign

Un SBOM dit ce qu'un artefact contient ; une signature prouve *qui* l'a produit et *qu'il n'a pas été altéré* depuis. Historiquement, signer des artefacts impliquait de gérer des clés privées à vie longue — un fardeau opérationnel (rotation, révocation, stockage sécurisé) que peu d'équipes géraient correctement.

Sigstore résout ce problème avec le **keyless signing** : plutôt qu'une clé privée statique, chaque signature utilise une clé éphémère générée à la volée, certifiée via OpenID Connect (l'identité du pipeline CI, ex: un compte GitHub Actions), puis journalisée dans un registre public et immuable (Rekor, un log transparent basé sur un arbre de Merkle). La clé n'existe que le temps de la signature — impossible à voler ou à faire fuiter, car elle n'est jamais stockée.

```bash
# Signer une image de conteneur en keyless signing (identité OIDC du pipeline CI)
cosign sign myregistry.io/myapp:${CI_COMMIT_SHA}

# Vérifier la signature avant déploiement
cosign verify myregistry.io/myapp:${CI_COMMIT_SHA} \
  --certificate-identity-regexp "https://github.com/myorg/myapp/.*" \
  --certificate-oidc-issuer "https://token.actions.githubusercontent.com"

# Attacher le SBOM à l'image comme attestation signée
cosign attest --predicate sbom-image.cdx.json --type cyclonedx myregistry.io/myapp:${CI_COMMIT_SHA}
```

<TipCallout>
`cosign attest` ne se contente pas de stocker le SBOM à côté de l'image : il produit une attestation signée cryptographiquement liant le SBOM à ce hash d'image précis — un outil de vérification peut ainsi refuser un déploiement si le SBOM attaché ne correspond pas exactement à l'artefact.
</TipCallout>

## Le framework SLSA

SLSA (Supply-chain Levels for Software Artifacts, prononcé « salsa ») définit quatre niveaux de maturité croissante pour la sécurité d'une chaîne de build, du plus basique au plus rigoureux.

<AttackDefenseTable rows={[
  { phase: "Niveau 0", attack: "Aucune garantie — build manuel ou non tracé, artefact modifiable sans trace", defense: "Aucune exigence — point de départ implicite de tout projet non instrumenté" },
  { phase: "Niveau 1", attack: "Build scripté mais sans preuve vérifiable de son exécution", defense: "Processus de build documenté et automatisé, provenance générée (même non signée)" },
  { phase: "Niveau 2", attack: "Provenance falsifiable si l'infrastructure de build est compromise", defense: "Build hébergé sur une plateforme CI managée, provenance signée par le service de build" },
  { phase: "Niveau 3", attack: "Compromission résiduelle possible via un accès admin à l'infrastructure", defense: "Build isolé et durci contre la falsification, provenance non-falsifiable même par un administrateur de la plateforme" },
]} />

<AuditCallout>
Atteindre SLSA niveau 3 exige une plateforme de build qui génère elle-même la provenance de façon isolée du code utilisateur (ex: GitHub Actions avec des workflows réutilisables signés, ou des builders dédiés comme ceux du projet SLSA) — un simple ajout de `cosign sign` en fin de pipeline ne suffit pas à lui seul à atteindre ce niveau.
</AuditCallout>

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell) — image applicative de démonstration avec dépendances vulnérables connues

<Steps steps={[
  { title: "Générer un SBOM de l'image", description: "Produis un SBOM CycloneDX à partir d'une image Docker locale.", code: "syft packages myapp:latest -o cyclonedx-json=sbom.cdx.json" },
  { title: "Scanner le SBOM pour des vulnérabilités connues", description: "Utilise le SBOM généré pour détecter des CVE sans re-scanner l'image entière.", code: "grype sbom:sbom.cdx.json" },
  { title: "Simuler la détection Log4Shell", description: "Cherche instantanément si log4j-core est présent et dans quelle version, via le SBOM plutôt que par accès SSH.", code: "cat sbom.cdx.json | jq '.components[] | select(.name==\"log4j-core\")'" },
  { title: "Signer l'image en keyless signing", description: "Signe l'image avec cosign en t'authentifiant via ton identité OIDC (navigateur).", code: "cosign sign myapp:latest" },
  { title: "Vérifier la signature", description: "Vérifie que la signature correspond bien à l'identité attendue avant tout déploiement simulé.", code: "cosign verify myapp:latest --certificate-identity-regexp \".*\" --certificate-oidc-issuer \".*\"" },
]} />

## En résumé

- Un SBOM (CycloneDX ou SPDX) est un inventaire structuré et généré automatiquement en CI, indispensable pour répondre en minutes plutôt qu'en jours à une CVE critique comme Log4Shell.
- La dependency confusion (paquets internes homonymes publiés publiquement) et le typosquatting (fautes de frappe de noms populaires) contournent les audits de code classiques en piégeant la résolution de noms elle-même.
- Sigstore/cosign permet le keyless signing : signature via identité OIDC éphémère et log de transparence public (Rekor), sans gestion de clé privée à vie longue.
- Un SBOM peut être attaché à une image comme attestation signée (`cosign attest`), liant cryptographiquement l'inventaire à l'artefact exact.
- SLSA définit quatre niveaux de maturité (0 à 3) pour la provenance d'un build, du script non tracé jusqu'à la provenance non-falsifiable même par un administrateur de la plateforme.

## Questions de Révision

1. Pourquoi un SBOM permet-il de répondre en quelques minutes à une CVE comme Log4Shell, là où son absence peut demander plusieurs jours ?
2. Quelle est la différence d'usage principale entre les formats CycloneDX et SPDX ?
3. En quoi la dependency confusion exploite-t-elle la configuration du gestionnaire de paquets plutôt qu'une faille de code ?
4. Qu'apporte le keyless signing de Sigstore par rapport à une signature classique basée sur une clé privée à vie longue ?
5. Que garantit une attestation produite par `cosign attest` que le SBOM seul ne garantit pas ?
6. Que faut-il en plus d'une simple signature de fin de pipeline pour atteindre le niveau SLSA 3 ?
