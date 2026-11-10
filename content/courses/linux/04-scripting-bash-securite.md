---
title: Scripting Bash pour la sécurité
chapter: 4
course: linux
difficulty: intermediate
duration: 60
tags: [linux, bash, scripting, automation, grep, awk]
ceh_modules: ["Module 06 - System Hacking"]
objectives:
  - Écrire des scripts Bash structurés et robustes (variables, conditions, boucles, fonctions)
  - Automatiser des tâches de reconnaissance et d'audit reproductibles
  - Traiter du texte avec grep, sed et awk pour parser la sortie des outils
  - Éviter les failles de sécurité classiques dans un script Bash
---

## Introduction

En test d'intrusion comme en administration, une bonne partie du travail consiste à automatiser des tâches répétitives : scanner une liste de cibles, parser la sortie d'un outil, générer un rapport. Bash reste le langage de script le plus universel des systèmes Unix : il est présent partout, ne nécessite aucune installation, et sait enchaîner des commandes existantes avec une efficacité redoutable.

À la fin de ce chapitre, tu sauras écrire des scripts Bash robustes qui s'arrêtent proprement en cas d'erreur, automatiser une reconnaissance reproductible sur plusieurs cibles, extraire l'information utile d'une sortie brute avec le trio grep, sed et awk, et surtout éviter les pièges de sécurité qui transforment un script en vulnérabilité. Une méthodologie automatisée et reproductible est d'ailleurs explicitement valorisée dans les certifications pratiques comme l'eJPT et l'OSCP+.

## Structure d'un script robuste

Tout script commence par un **shebang**, la première ligne qui indique au système quel interpréteur utiliser. Vient ensuite une ligne de sûreté trop souvent oubliée, qui change radicalement le comportement du script face aux erreurs.

```bash
#!/bin/bash
# Shebang : indique au système d'exécuter ce fichier avec bash

set -euo pipefail
# -e : arrête le script dès qu'une commande échoue (code de retour non nul)
# -u : provoque une erreur si une variable non définie est utilisée
# -o pipefail : une erreur dans un pipe fait échouer toute la chaîne

TARGET="${1:-}"
if [ -z "$TARGET" ]; then
  echo "Usage: $0 <cible>" >&2
  exit 1
fi

echo "[+] Scan de $TARGET en cours..."
```

L'option `set -euo pipefail` mérite d'être systématique. Sans elle, un script continue aveuglément après une erreur, laissant potentiellement le système dans un état incohérent ; avec elle, il s'arrête net à la première défaillance. Chaque composante compte : `-e` stoppe à la première commande en échec, `-u` empêche les bugs dus à une variable mal nommée, et `pipefail` fait remonter l'échec d'une commande même quand elle est au milieu d'un pipe.

<TipCallout>
Place `set -euo pipefail` en tête de chaque script, juste après le shebang. C'est la différence entre un script qui échoue silencieusement en continuant à travailler sur des données corrompues, et un script qui s'arrête proprement pour que tu saches exactement où le problème est survenu.
</TipCallout>

## Variables, conditions et boucles

Une **variable** stocke une valeur réutilisable. En Bash, on l'affecte sans espace autour du `=` et on la lit avec `$`. Il faut presque toujours entourer les variables de guillemets doubles pour éviter les mauvaises surprises quand une valeur contient des espaces.

Les **conditions** (`if`) et les **boucles** (`for`, `while`) permettent d'enchaîner des actions selon le contexte ou de les répéter sur un ensemble de cibles.

```bash
# Boucle for sur une liste de cibles définie dans un tableau
TARGETS=("10.10.0.10" "10.10.0.11" "10.10.0.12")
for ip in "${TARGETS[@]}"; do
  if ping -c 1 -W 1 "$ip" &>/dev/null; then
    echo "[+] $ip est en ligne"
  else
    echo "[-] $ip ne repond pas"
  fi
done

# Boucle while lisant un fichier ligne par ligne
while IFS= read -r ip; do
  nmap -Pn -p 80,443 "$ip"
done < targets.txt
```

La construction `while IFS= read -r ip; do ... done < targets.txt` est un idiome à connaître par cœur : elle lit un fichier ligne par ligne, une ligne à la fois, en préservant l'intégralité du contenu. Le `IFS=` neutralise le découpage sur les espaces, et l'option `-r` empêche `read` d'interpréter les antislashs — sans elle, un chemin Windows ou une valeur contenant un `\` serait corrompu.

## Cas pratique : reconnaissance automatisée

Assembler ces briques donne un script de reconnaissance réutilisable, qui organise ses résultats dans un répertoire dédié par cible.

```bash
#!/bin/bash
set -euo pipefail

TARGET="${1:?Usage: $0 <cible>}"
OUTDIR="recon_${TARGET}"
mkdir -p "$OUTDIR"

echo "[+] Scan des ports sur $TARGET"
nmap -sS -T4 -oN "$OUTDIR/ports.txt" "$TARGET"

echo "[+] Detection des versions de services"
nmap -sV -oN "$OUTDIR/versions.txt" "$TARGET"

echo "[+] Resultats disponibles dans $OUTDIR/"
```

La syntaxe `"${1:?message}"` est élégante : elle affecte le premier argument à la variable, mais interrompt le script avec le message indiqué si cet argument est absent. On combine ainsi validation et affectation en une seule ligne.

<CehCallout>
Automatiser sa reconnaissance avec des scripts réutilisables fait partie des compétences évaluées à l'eJPT et à l'OSCP+. Les examinateurs valorisent une méthodologie reproductible et documentée plutôt que des commandes tapées au hasard, car elle garantit qu'aucune étape n'est oubliée d'une cible à l'autre.
</CehCallout>

## Structurer avec des fonctions

Au-delà de quelques commandes séquentielles, découper un script en **fonctions** le rend lisible et réutilisable. Une fonction regroupe une logique sous un nom, qu'on appelle ensuite comme une commande.

```bash
#!/bin/bash
set -euo pipefail

# Fonction de journalisation : uniformise le format de toutes les sorties
log() {
  local level="$1"; shift
  echo "[$(date +%H:%M:%S)] [$level] $*"
}

scan_host() {
  local ip="$1"
  if ping -c 1 -W 1 "$ip" &>/dev/null; then
    log "INFO" "$ip est en ligne"
    nmap -sV -oN "resultats_${ip}.txt" "$ip"
  else
    log "WARN" "$ip ne repond pas"
  fi
}

for ip in "$@"; do
  scan_host "$ip"
done
```

Une fonction comme `log()` centralise le format des messages : horodatage, niveau, texte. En l'appelant partout, tu obtiens une sortie homogène et facile à filtrer, ce qui simplifie grandement la rédaction du rapport final. Le mot-clé `local` confine une variable à la fonction, évitant qu'elle n'écrase une variable du script principal.

## Traitement de texte : grep, sed et awk

Automatiser la reconnaissance implique presque toujours de parser la sortie d'autres outils. Trois utilitaires couvrent l'essentiel des besoins, et savoir les enchaîner est une compétence de base attendue en pentest.

<CompareTable
  titleA="Outil"
  titleB="Usage typique"
  rows={[
    { a: "grep", b: "Filtrer les lignes correspondant à un motif, par exemple extraire les ports ouverts d'un scan" },
    { a: "sed", b: "Remplacer ou transformer du texte en flux, par exemple nettoyer une sortie avant traitement" },
    { a: "awk", b: "Extraire des colonnes précises et faire des calculs sur du texte structuré" }
  ]}
/>

```bash
# grep : ne garder que les lignes contenant "open" dans un scan Nmap
grep "open" ports.txt

# awk : extraire la deuxième colonne (champs séparés par des virgules)
awk -F',' '{print $2}' hosts.csv

# sed : remplacer toutes les occurrences d'un motif dans un fichier (-i = en place)
sed -i 's/ancien_domaine/nouveau_domaine/g' rapport.txt

# Enchaînement : extraire la liste propre des ports ouverts
grep "open" ports.txt | awk -F'/' '{print $1}' | tr -d ' '
```

Quand il s'agit d'isoler une colonne d'un fichier structuré comme un CSV, `awk` avec son option `-F` (qui définit le séparateur de champs) est l'outil le plus direct. Pour un simple remplacement de texte en flux, `sed` est le choix naturel. Et pour filtrer des lignes selon un motif, `grep` reste imbattable.

## Sécuriser ses scripts

Un script mal écrit, surtout s'il tourne avec des privilèges élevés, devient une vulnérabilité. Trois pièges reviennent systématiquement.

<AttackDefenseTable rows={[
  { phase: "Injection de commande", attack: "Un script exécute eval sur une entrée utilisateur non filtrée", defense: "Ne jamais utiliser eval sur une entrée externe ; valider avec une regex stricte" },
  { phase: "Détournement de PATH", attack: "Un script privilégié appelle une commande sans chemin absolu", defense: "Toujours utiliser des chemins absolus (/usr/bin/id) dans les scripts à privilèges" },
  { phase: "Fuite de secret", attack: "Un mot de passe passé en argument devient visible dans ps aux", defense: "Passer les secrets par variable d'environnement ou fichier à permissions restreintes" }
]} />

Le danger d'**eval** mérite une explication : cette commande exécute la chaîne qu'on lui donne comme du code Bash. Si cette chaîne provient d'une entrée utilisateur, un attaquant peut y glisser ses propres commandes — c'est une injection de commande directe. On évite `eval` sur toute entrée externe.

Le **détournement de PATH** (PATH hijacking) exploite le fait que le shell cherche les commandes dans les répertoires listés par la variable `$PATH`. Si un script privilégié appelle `id` sans préciser `/usr/bin/id`, et qu'un attaquant place un faux `id` dans un répertoire prioritaire du `$PATH`, c'est son code qui s'exécute, avec les privilèges du script.

```bash
# Toujours exécuter du nettoyage à la sortie, même en cas d'interruption
#!/bin/bash
set -euo pipefail
TMPFILE="$(mktemp)"
trap 'rm -f "$TMPFILE"; echo "Nettoyage effectue"' EXIT

echo "Travail en cours avec $TMPFILE..."
# ... traitement ...
```

La commande **trap** associe du code à un événement. Avec `trap '...' EXIT`, le code de nettoyage s'exécute quoi qu'il arrive — fin normale, erreur, ou interruption par Ctrl-C. C'est la garantie de ne jamais laisser traîner de fichier temporaire ni de processus orphelin, ce qui compte autant pour la propreté que pour la discrétion lors d'un test.

<WarningCallout>
Un script qui s'exécute avec des privilèges élevés (bit SUID, tâche cron root, service systemd) doit impérativement appeler chaque commande par son chemin absolu, par exemple `/usr/bin/id` plutôt que `id`. Sans cela, un attaquant qui contrôle le `$PATH` peut détourner l'exécution vers un binaire malveillant portant le même nom.
</WarningCallout>

## Erreurs fréquentes

- **Oublier `set -euo pipefail`** et laisser le script poursuivre sur des données incohérentes après une erreur silencieuse.
- **Ne pas entourer les variables de guillemets** : `rm -rf $DIR` devient catastrophique si `DIR` est vide ou contient un espace.
- **Utiliser `read` sans `-r`** et corrompre toute ligne contenant un antislash.
- **Employer `eval` sur une entrée externe**, ouvrant une injection de commande.
- **Appeler des commandes sans chemin absolu dans un script privilégié**, exposant au détournement de PATH.
- **Passer un mot de passe en argument**, où il reste visible par tous via `ps aux`.

## Angle offensif et défensif

Côté offensif, Bash sert à industrialiser la reconnaissance : balayer une plage d'adresses, enchaîner plusieurs outils, normaliser leurs sorties pour alimenter l'étape suivante. Un one-liner comme `nmap ... | grep open | awk '{print $1}'` produit instantanément une liste de ports réutilisable.

Côté défensif, l'analyse des scripts présents sur un système fait partie de l'audit : un script inscriptible lancé par une tâche cron root est un vecteur d'élévation classique, et un script qui manipule des secrets en clair est une fuite potentielle. Durcir ses propres scripts (chemins absolus, pas d'`eval`, secrets hors de la ligne de commande, `set -euo pipefail`) est une compétence défensive directement exigée par les référentiels de développement sécurisé.

## Lab — Mise en pratique

**Environnement** : Kali Linux (terminal Nyx Shell)

<Steps steps={[
  { title: "Créer un script robuste", description: "Écris un script minimal avec shebang et set -euo pipefail, et teste qu'il refuse de tourner sans argument.", code: "cat > recon.sh <<'EOF'\n#!/bin/bash\nset -euo pipefail\nTARGET=\"${1:?Usage: $0 <cible>}\"\necho \"[+] Cible : $TARGET\"\nEOF\nchmod +x recon.sh\n./recon.sh" },
  { title: "Rendre le script exécutable et le lancer", description: "Attribue les droits d'exécution puis lance le script avec un argument valide.", code: "chmod +x recon.sh\n./recon.sh 10.10.0.10" },
  { title: "Écrire une boucle de ping sweep", description: "Teste la disponibilité d'une plage d'adresses. Observe quelles adresses répondent.", code: "for i in $(seq 1 20); do ping -c1 -W1 10.10.0.$i &>/dev/null && echo \"10.10.0.$i UP\"; done" },
  { title: "Lire un fichier de cibles ligne par ligne", description: "Crée un fichier de cibles puis parcours-le avec l'idiome while read -r.", code: "printf '10.10.0.10\\n10.10.0.11\\n' > targets.txt\nwhile IFS= read -r ip; do echo \"Traitement de $ip\"; done < targets.txt" },
  { title: "Parser une sortie avec awk", description: "Simule une sortie structurée et extrais-en une colonne précise.", code: "printf 'web,10.10.0.10\\ndb,10.10.0.11\\n' | awk -F',' '{print $2}'" },
  { title: "Nettoyer un fichier avec sed", description: "Remplace un motif dans un fichier en place et vérifie le résultat.", code: "echo 'ancien_domaine.lab' > note.txt\nsed -i 's/ancien_domaine/nouveau_domaine/g' note.txt\ncat note.txt" },
  { title: "Garantir le nettoyage avec trap", description: "Crée un fichier temporaire protégé par un trap EXIT et observe sa suppression automatique.", code: "bash -c 'set -e; TMP=$(mktemp); trap \"rm -f $TMP; echo nettoye\" EXIT; echo \"fichier: $TMP\"; ls -l $TMP'" }
]} />

## À retenir

- Tout script commence par un shebang, puis `set -euo pipefail` pour échouer proprement à la première erreur.
- Entoure toujours les variables de guillemets doubles et utilise `read -r` pour lire un fichier sans corruption.
- L'idiome `while IFS= read -r ligne; do ... done < fichier` lit un fichier ligne par ligne de façon fiable.
- Les fonctions, comme un `log()` centralisé, rendent les scripts lisibles et uniformisent les sorties.
- grep filtre des lignes, sed transforme du texte en flux, awk extrait des colonnes.
- Ne jamais utiliser `eval` sur une entrée externe ; toujours des chemins absolus dans un script privilégié ; jamais de secret en argument de commande.
- `trap '...' EXIT` garantit le nettoyage même en cas d'interruption du script.

## Questions de révision

1. Que fait précisément chacune des trois composantes de `set -euo pipefail` ?
2. Pourquoi faut-il éviter `eval` sur une entrée utilisateur non filtrée ?
3. Que fait la boucle `while IFS= read -r ip; do ... done < targets.txt`, et à quoi sert l'option `-r` ?
4. Quel outil du trio grep/sed/awk est le plus adapté pour extraire une colonne précise d'un CSV ?
5. Quel outil du trio est le plus adapté pour remplacer du texte en flux ?
6. Que garantit un `trap '...' EXIT` dans un script qui manipule un fichier temporaire ?
7. Pourquoi un script privilégié doit-il appeler ses commandes par un chemin absolu ?
8. À quoi sert une fonction comme `log()` dans un script modulaire ?
