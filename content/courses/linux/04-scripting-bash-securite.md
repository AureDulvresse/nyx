---
title: Scripting Bash pour la sécurité
chapter: 4
course: linux
difficulty: intermediate
duration: 50
tags: [linux, bash, scripting, automation]
ceh_modules: ["Module 06 - System Hacking"]
objectives:
  - Écrire des scripts Bash structurés (variables, conditions, boucles)
  - Automatiser des tâches de reconnaissance et d'audit
  - Éviter les erreurs de sécurité classiques dans un script Bash
---

## Introduction

En pentest comme en administration système, tu passeras une bonne partie de ton temps à automatiser des tâches répétitives : scanner une liste de cibles, parser une sortie d'outil, générer un rapport. Bash reste le langage de script le plus universel sur les systèmes Unix, et savoir l'utiliser efficacement te fait gagner un temps considérable — et t'évite des erreurs manuelles.

Ce chapitre te donne les bases solides du scripting Bash, orientées vers des cas d'usage réels de sécurité offensive et défensive.

## Structure d'un script Bash

```bash
#!/bin/bash
# Toujours commencer par le shebang et un commentaire de description

set -euo pipefail
# -e : arrête le script à la première erreur
# -u : erreur si une variable non définie est utilisée
# -o pipefail : une erreur dans un pipe fait échouer toute la commande

TARGET="$1"
if [ -z "$TARGET" ]; then
  echo "Usage: $0 <target>"
  exit 1
fi

echo "[+] Scan de $TARGET en cours..."
```

<TipCallout>
`set -euo pipefail` devrait être systématique en début de script. C'est la différence entre un script qui échoue silencieusement en laissant un système dans un état incohérent, et un script qui s'arrête proprement à la première erreur.
</TipCallout>

## Variables, conditions et boucles

```bash
# Boucle sur une liste de cibles
TARGETS=("10.10.0.10" "10.10.0.11" "10.10.0.12")
for ip in "${TARGETS[@]}"; do
  if ping -c 1 -W 1 "$ip" &>/dev/null; then
    echo "[+] $ip est en ligne"
  else
    echo "[-] $ip ne répond pas"
  fi
done

# Boucle sur les lignes d'un fichier (liste de cibles depuis un fichier)
while IFS= read -r ip; do
  nmap -Pn -p 80,443 "$ip"
done < targets.txt
```

## Cas pratique : script de reconnaissance automatisée

```bash
#!/bin/bash
set -euo pipefail

TARGET="$1"
OUTDIR="recon_${TARGET}"
mkdir -p "$OUTDIR"

echo "[+] Scan de ports sur $TARGET"
nmap -sS -T4 -oN "$OUTDIR/nmap.txt" "$TARGET"

echo "[+] Détection des versions de services"
nmap -sV -oN "$OUTDIR/versions.txt" "$TARGET"

echo "[+] Résultats disponibles dans $OUTDIR/"
```

<CehCallout>
Automatiser sa reconnaissance avec des scripts réutilisables fait partie des compétences évaluées à l'eJPT et à l'OSCP : les jurys valorisent une méthodologie reproductible plutôt que des commandes tapées au hasard.
</CehCallout>

## Erreurs de sécurité classiques dans un script

<AttackDefenseTable rows={[
  { phase: "Injection", attack: "Un script exécute `eval \"$INPUT\"` sur une entrée utilisateur non filtrée", defense: "Ne jamais utiliser eval sur une entrée externe ; valider avec une regex stricte" },
  { phase: "Élévation", attack: "Un script SUID appelle des commandes externes sans chemin absolu (PATH hijacking)", defense: "Toujours utiliser des chemins absolus (/usr/bin/id) dans les scripts privilégiés" },
  { phase: "Confidentialité", attack: "Un mot de passe est passé en argument de ligne de commande (visible dans `ps aux`)", defense: "Utiliser des variables d'environnement ou des fichiers de configuration à permissions restreintes" },
]} />

<WarningCallout>
Un script qui s'exécute avec des privilèges élevés (SUID, cron root, service systemd) doit systématiquement utiliser des chemins absolus pour chaque commande appelée. Sinon, un attaquant contrôlant le `$PATH` peut détourner l'exécution vers un binaire malveillant.
</WarningCallout>

## Lab — Mise en Pratique

**Environnement** : Kali Linux (terminal Nyx Shell)

<Steps steps={[
  { title: "Écrire un script de ping sweep", description: "Crée un script qui teste la disponibilité d'une plage d'adresses IP.", code: "for i in $(seq 1 20); do ping -c1 -W1 10.10.0.$i &>/dev/null && echo \"10.10.0.$i UP\"; done" },
  { title: "Rendre le script exécutable", description: "Attribue les droits d'exécution à ton script.", code: "chmod +x recon.sh" },
  { title: "Exécuter le script contre le lab", description: "Lance ta reconnaissance automatisée sur la cible du lab.", code: "./recon.sh 10.10.0.10" },
]} />

## Pour aller plus loin

### Fonctions et scripts modulaires

Au-delà d'une poignée de commandes séquentielles, structurer un script en fonctions le rend réutilisable et bien plus lisible.

```bash
#!/bin/bash
set -euo pipefail

log() {
  local level="$1"; shift
  echo "[$(date +%H:%M:%S)] [$level] $*"
}

scan_host() {
  local ip="$1"
  if ping -c 1 -W 1 "$ip" &>/dev/null; then
    log "INFO" "$ip est en ligne"
    nmap -sV -oN "results_${ip}.txt" "$ip"
  else
    log "WARN" "$ip ne répond pas"
  fi
}

for ip in "${@}"; do
  scan_host "$ip"
done
```

```bash
# Utilisation : passer la liste de cibles en arguments
./scan.sh 10.10.0.10 10.10.0.11 10.10.0.12
```

<TipCallout>
Extraire la logique répétée dans des fonctions comme `log()` te permet d'harmoniser le format de sortie de tous tes scripts — un vrai gain de temps lors de la rédaction du rapport final de pentest.
</TipCallout>

### Traitement de texte avec grep, sed et awk

Automatiser la reconnaissance implique souvent de parser la sortie d'autres outils. Ce trio couvre l'essentiel des besoins.

<CompareTable
  titleA="Outil"
  titleB="Usage typique"
  rows={[
    { a: "grep", b: "Filtrer des lignes correspondant à un motif (ex: extraire les ports ouverts d'un scan Nmap)" },
    { a: "sed", b: "Remplacer du texte en flux (ex: nettoyer une sortie avant traitement)" },
    { a: "awk", b: "Extraire des colonnes et faire des calculs simples sur du texte structuré" },
  ]}
/>

```bash
# Extraire uniquement les ports ouverts d'une sortie Nmap
grep "open" nmap_output.txt

# Extraire la deuxième colonne (les adresses IP) d'un fichier CSV
awk -F',' '{print $2}' hosts.csv

# Remplacer toutes les occurrences d'un mot dans un fichier
sed -i 's/ancien_domaine/nouveau_domaine/g' rapport.txt
```

<CehCallout>
Savoir enchaîner `nmap ... | grep open | awk '{print $1}'` pour extraire une liste propre de ports ouverts, directement réutilisable dans un autre outil, est une compétence de base attendue en pentest pratique.
</CehCallout>

### Piéger les erreurs avec trap

`trap` permet d'exécuter du code de nettoyage même si le script est interrompu (Ctrl+C, erreur, etc.) — utile pour ne jamais laisser de fichiers temporaires ou de processus orphelins.

```bash
#!/bin/bash
TMPFILE=$(mktemp)
trap 'rm -f "$TMPFILE"; echo "Nettoyage effectué"' EXIT

echo "Travail en cours avec $TMPFILE..."
# ... traitement ...
```

## En résumé

- `set -euo pipefail` doit être systématique en tête de script Bash.
- Les boucles `for`/`while` permettent d'automatiser reconnaissance et audit sur plusieurs cibles.
- Ne jamais utiliser `eval` sur une entrée non filtrée, et toujours utiliser des chemins absolus dans un script privilégié.
- Une méthodologie automatisée et reproductible est valorisée dans les certifications pratiques (eJPT, OSCP).

## Questions de Révision

1. Que fait l'option `set -euo pipefail` en tête de script ?
2. Pourquoi éviter `eval` sur une entrée utilisateur non filtrée ?
3. Pourquoi un script SUID doit-il utiliser des chemins absolus ?
