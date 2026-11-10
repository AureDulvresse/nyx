---
title: Entraîner un modèle deep learning — GPU, batchs, régularisation
chapter: 6
course: deep-learning
difficulty: advanced
duration: 65
tags: [entrainement, gpu, mini-batch, optimiseurs, adamw, regularisation, dropout, early-stopping, pytorch]
ceh_modules: []
objectives:
  - Expliquer pourquoi les GPU accélèrent le deep learning et écrire du code PyTorch indépendant du matériel
  - Distinguer batch complet, mini-batch et exemple unique, et définir époque et itération
  - Choisir un optimiseur (SGD avec momentum, Adam, AdamW) et un plan de taux d'apprentissage
  - Diagnostiquer le surapprentissage avec les courbes d'entraînement et de validation
  - Appliquer dropout, weight decay, arrêt précoce et augmentation de données dans une boucle d'entraînement complète
  - Sécuriser le cycle d'entraînement (intégrité des données, chargement sûr des checkpoints)
---

## Introduction

Les chapitres précédents ont présenté des architectures : réseaux denses, CNN, RNN, Transformers. Mais une architecture n'est qu'une fonction avec des poids aléatoires. Ce qui en fait un modèle utile, c'est l'**entraînement**, et l'entraînement d'un réseau profond est autant un problème d'ingénierie que de mathématiques : il faut le bon matériel, découper les données intelligemment, choisir un optimiseur, surveiller le surapprentissage et savoir quand s'arrêter.

Ce chapitre est le plus pratique du cours. Il explique pourquoi on entraîne sur GPU, ce que sont un mini-batch et une époque, comment fonctionnent les optimiseurs modernes, et comment les techniques de régularisation empêchent un réseau de simplement mémoriser ses données. Il se termine par une boucle d'entraînement PyTorch complète, avec validation et arrêt précoce, que tu pourras réutiliser.

L'angle sécurité n'est pas absent. Les données d'entraînement et les fichiers de poids sont des actifs à protéger : un jeu de données altéré produit un modèle altéré, et un fichier de checkpoint mal chargé peut exécuter du code arbitraire. On y revient en fin de chapitre.

À la fin de ce chapitre, tu sauras écrire et diagnostiquer une boucle d'entraînement complète, choisir les principaux hyperparamètres, et lire des courbes d'apprentissage pour repérer le surapprentissage.

## Pourquoi le deep learning nécessite des GPU

### Des multiplications de matrices à grande échelle

Comme tu l'as vu au chapitre 2 et dans le cours Algèbre Linéaire, l'essentiel des calculs d'un réseau de neurones, propagation avant comme rétropropagation, se ramène à d'immenses **multiplications de matrices**. Une multiplication de deux matrices 4096 × 4096 représente environ 69 milliards de multiplications-additions, toutes indépendantes les unes des autres.

Un **CPU** possède quelques cœurs puissants, optimisés pour des tâches séquentielles variées, avec beaucoup de logique de contrôle. Un **GPU**, conçu à l'origine pour le rendu graphique, possède des **milliers de cœurs plus simples**, optimisés pour appliquer la même opération en parallèle sur d'immenses volumes de données. Les GPU récents ajoutent des unités spécialisées dans les produits matriciels en précision réduite, comme les Tensor Cores de NVIDIA.

<CompareTable
  titleA="CPU"
  titleB="GPU"
  rows={[
    { a: "Quelques cœurs puissants, optimisés pour des tâches séquentielles variées", b: "Des milliers de cœurs plus simples, optimisés pour la même opération en parallèle sur d'immenses volumes de données" },
    { a: "Adapté à la majorité des tâches informatiques générales et au prétraitement des données", b: "Particulièrement adapté aux multiplications matricielles massives du deep learning" },
    { a: "Accès à toute la mémoire vive du système", b: "Mémoire dédiée (VRAM) limitée, qui fixe la taille du modèle et du batch" },
  ]}
/>

### La mémoire, souvent le vrai facteur limitant

Pendant l'entraînement, la mémoire du GPU doit contenir les poids, leurs gradients, l'état de l'optimiseur (Adam stocke deux valeurs supplémentaires par poids) et les activations intermédiaires de chaque couche, conservées pour la rétropropagation. C'est souvent la mémoire, plus que la puissance de calcul, qui limite la taille du modèle et du batch. L'erreur « CUDA out of memory » se règle en réduisant la taille du batch, en utilisant la **précision mixte**, ou en accumulant les gradients sur plusieurs petits batchs.

### Écrire du code indépendant du matériel

Avec PyTorch, on choisit le périphérique une fois, puis on y déplace le modèle et chaque batch :

```python
import torch

if torch.cuda.is_available():
    device = torch.device("cuda")          # GPU NVIDIA (ou AMD avec ROCm)
elif torch.backends.mps.is_available():
    device = torch.device("mps")           # GPU Apple Silicon
else:
    device = torch.device("cpu")
print("Entraînement sur :", device)

# model = model.to(device)
# xb, yb = xb.to(device), yb.to(device)   # à faire pour chaque batch
```

La **précision mixte** effectue la plupart des calculs en 16 bits (bfloat16 ou float16) au lieu de 32, ce qui réduit la mémoire et accélère nettement les GPU récents. Dans PyTorch, on entoure la propagation avant d'un bloc `with torch.autocast(device_type="cuda", dtype=torch.bfloat16):`. Enfin, `torch.compile(model)`, introduit avec PyTorch 2.0, compile le modèle pour réduire le surcoût de l'exécution opération par opération.

## L'entraînement par mini-batchs

### Trois façons de calculer le gradient

La descente de gradient du chapitre 1 a besoin d'un gradient. Trois options existent :

- **batch complet** : le gradient est la moyenne sur tout le jeu de données. Il est précis, mais chaque mise à jour coûte un passage complet sur des millions d'exemples, ce qui est extrêmement lent et impossible à faire tenir en mémoire ;
- **exemple unique** (descente de gradient stochastique au sens strict) : on met à jour les poids après chaque exemple. C'est rapide par mise à jour, mais le gradient est très bruité, l'entraînement instable, et le GPU est sous-utilisé ;
- **mini-batch** : on divise les données en petits groupes, typiquement de 16 à 512 exemples, et on calcule le **gradient moyen sur chaque batch** avant de mettre à jour les poids.

Le mini-batch est un **compromis** : il permet de paralléliser efficacement le calcul sur GPU, puisque tout le batch est traité en une seule multiplication de matrices, tout en gardant un entraînement suffisamment stable, puisque la moyenne sur plusieurs exemples lisse le bruit. Dans le langage courant, le « SGD » des frameworks désigne d'ailleurs la descente par mini-batchs.

### Exemple chiffré

Sur un jeu jouet de 20 exemples suivant `y = 2x + bruit`, avec un poids initial `w = 0`, le gradient de l'erreur quadratique vaut selon la façon de le calculer :

```text
Gradient (batch complet, 20 exemples) : -4.21
Gradient (1 seul exemple)             : -11.55
Gradient (mini-batch de 4 exemples)   : -9.00

Écart-type du gradient, exemple par exemple : 5.52
Écart-type du gradient, mini-batchs de 4    : 2.85
```

Tous les gradients pointent dans la bonne direction (augmenter `w`), mais leur amplitude varie beaucoup. Le mini-batch de 4 divise environ par deux la variabilité par rapport à un exemple unique : il lisse le bruit, tout en restant bien moins coûteux que le batch complet. En théorie, l'écart-type de la moyenne de `B` exemples indépendants décroît comme `1 / √B`.

### Époque et itération

Une **itération** (ou pas) est une mise à jour des poids, sur un batch. Une **époque** (epoch) est un **passage complet sur l'ensemble du jeu de données d'entraînement**. Avec 200 exemples et des batchs de 32, une époque compte 7 itérations (la dernière, incomplète, contient 8 exemples). Un modèle est typiquement entraîné sur plusieurs dizaines d'époques ; les très grands modèles de langage, eux, ne voient souvent leurs données qu'une fois ou peu de fois. On **mélange** les données au début de chaque époque pour que les batchs ne soient pas toujours composés des mêmes exemples.

```mermaid
flowchart LR
    A["Jeu d'entraînement"] --> B["Mélanger"]
    B --> C["Découper en mini-batchs"]
    C --> D["Propagation avant + perte"]
    D --> E["Rétropropagation"]
    E --> F["optimizer.step()"]
    F -->|"batch suivant"| D
    F -->|"fin d'époque"| G["Évaluer sur la validation"]
    G -->|"amélioration"| B
    G -->|"plus d'amélioration"| H["Arrêt précoce, garder le meilleur modèle"]
```

## Les optimiseurs et le taux d'apprentissage

### Au-delà de la descente de gradient simple

| Optimiseur | Principe | Usage courant |
| --- | --- | --- |
| SGD | `w ← w - η·g` | Référence pédagogique |
| SGD avec momentum | Accumule une moyenne mobile des gradients, comme une bille qui prend de l'élan | Vision, CNN classiques |
| Adam | Adapte le pas de chaque poids selon la moyenne et la variance de ses gradients récents | Choix par défaut robuste |
| AdamW | Adam avec une pénalité sur les poids (weight decay) découplée de la mise à jour | Transformers et LLM, très répandu en 2026 |

Le **taux d'apprentissage** reste l'hyperparamètre le plus important. On le fait souvent varier au cours de l'entraînement avec un **plan** (scheduler) : une phase d'échauffement (warmup) où il augmente progressivement, puis une décroissance, par exemple en cosinus. PyTorch fournit ces plans dans `torch.optim.lr_scheduler`.

## Le surapprentissage à grande échelle

### Un risque structurel

Un réseau de neurones profond compte des milliers à des milliards de paramètres. Avec autant de liberté, il peut **mémoriser** le jeu d'entraînement au lieu d'apprendre des motifs généralisables, surtout si les données sont limitées par rapport à la taille du modèle. C'est le surapprentissage, déjà rencontré avec les arbres de décision dans le cours Machine Learning, mais amplifié.

### Le lire sur les courbes

On découpe les données en trois ensembles : **entraînement** pour ajuster les poids, **validation** pour régler les hyperparamètres et décider quand s'arrêter, **test** pour l'évaluation finale, consulté une seule fois. Les courbes de perte racontent l'histoire :

```text
époque   1  train 0.577  val 0.611
époque   2  train 0.457  val 0.512
époque   5  train 0.179  val 0.262
époque  10  train 0.048  val 0.188
arrêt précoce à l'époque 14, meilleure val 0.179
```

Cette sortie provient de la boucle complète présentée plus bas, sur un réseau volontairement trop gros pour 200 exemples. La perte d'entraînement continue de chuter vers 0, mais la perte de validation stagne puis remonte : à partir de là, le modèle mémorise. L'écart croissant entre les deux courbes est la signature du surapprentissage.

## Les techniques de régularisation

### Le dropout

Le **dropout** désactive aléatoirement une fraction des neurones à chaque étape d'entraînement, typiquement 10 à 50 %. Le réseau ne peut plus compter sur un neurone précis, ce qui l'empêche de développer des dépendances excessives à des neurones spécifiques et favorise des représentations redondantes et plus robustes.

Un détail d'implémentation est essentiel : le dropout « inversé ». Pendant l'entraînement, après application du masque, on **divise les activations restantes par `(1 - taux)`**. Cela compense la perte des activations désactivées et conserve une échelle cohérente : en moyenne, la sortie a la même valeur qu'avec tous les neurones. À l'inférence, le dropout est désactivé et aucun ajustement n'est nécessaire. Dans PyTorch, c'est `model.train()` qui active le dropout et `model.eval()` qui le désactive.

```text
Activations originales    : 0.9  0.2  0.7  0.5  0.3  0.8  0.1  0.6
Masque (taux 0.5)         : 0    0    1    0    1    0    0    0
Après dropout             : 0    0    1.4  0    0.6  0    0    0
Moyenne sur 100 000 masques : 0.902 0.200 0.696 0.499 0.302 0.803 0.101 0.599
```

La dernière ligne montre qu'en moyenne, grâce à la division par 0.5, chaque activation retrouve sa valeur d'origine.

### Le weight decay

Le **weight decay** pénalise les poids de grande amplitude, ce qui pousse vers des solutions plus simples ; c'est l'équivalent de la régularisation L2 du cours Machine Learning. Avec AdamW, on le règle par le paramètre `weight_decay`.

### L'arrêt précoce

L'**arrêt précoce** (early stopping) surveille la perte de validation à chaque époque et arrête l'entraînement dès qu'elle cesse de s'améliorer pendant un nombre d'époques donné, appelé **patience**. On conserve alors les poids de la meilleure époque, pas ceux de la dernière. C'est la régularisation la plus simple et l'une des plus efficaces.

### L'augmentation de données

L'**augmentation de données** génère artificiellement des variantes des données d'entraînement : rotations, recadrages, retournements ou changements de luminosité pour des images, avec `torchvision.transforms`. Le modèle voit plus de diversité sans qu'on collecte de nouvelles données. La règle d'or est que la transformation **ne doit pas changer l'étiquette** : retourner horizontalement une photo de chat donne toujours un chat, mais retourner l'ordre des octets d'un exécutable ne donne plus un exécutable.

### La normalisation des activations

La **batch normalization** et la **layer normalization** renormalisent les activations à chaque couche. Elles stabilisent et accélèrent l'entraînement, et ont un léger effet régularisant. La layer normalization est celle des Transformers.

<TipCallout>
Ces techniques s'ajoutent aux principes du cours Machine Learning, comme la validation croisée. Combinées à une évaluation rigoureuse sur un ensemble de test totalement indépendant, elles permettent de vérifier qu'un modèle généralise réellement au lieu de mémoriser ses données. En sécurité, découpe tes ensembles par date : entraîne sur le passé, teste sur une période postérieure, comme en production.
</TipCallout>

## Une boucle d'entraînement complète avec PyTorch 2.x

```python
import torch
from torch import nn
from torch.utils.data import TensorDataset, DataLoader

torch.manual_seed(0)
# Données synthétiques : 600 exemples, 20 caractéristiques, étiquette binaire bruitée
X = torch.randn(600, 20)
y = ((X @ torch.randn(20) + 0.5 * torch.randn(600)) > 0).float().unsqueeze(1)
X_train, y_train, X_val, y_val = X[:200], y[:200], X[200:], y[200:]

loader = DataLoader(TensorDataset(X_train, y_train), batch_size=32, shuffle=True)

model = nn.Sequential(                 # volontairement trop gros pour 200 exemples
    nn.Linear(20, 256), nn.ReLU(),
    nn.Linear(256, 256), nn.ReLU(),
    nn.Linear(256, 1),
)
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-2)
loss_fn = nn.BCEWithLogitsLoss()

best, patience, bad = float("inf"), 5, 0
for epoch in range(1, 201):
    model.train()                                  # active dropout et batchnorm en mode entraînement
    for xb, yb in loader:                          # un mini-batch par itération
        optimizer.zero_grad()
        loss = loss_fn(model(xb), yb)
        loss.backward()
        optimizer.step()

    model.eval()                                   # mode inférence
    with torch.no_grad():
        val_loss = loss_fn(model(X_val), y_val).item()

    if val_loss < best - 1e-4:                     # amélioration : on sauvegarde
        best, bad = val_loss, 0
        torch.save(model.state_dict(), "best.pt")
    else:
        bad += 1
        if bad >= patience:
            print(f"arrêt précoce à l'époque {epoch}, meilleure val {best:.3f}")
            break

model.load_state_dict(torch.load("best.pt", weights_only=True))  # on repart du meilleur modèle
```

Pour aller plus loin, essaie d'ajouter `nn.Dropout(0.3)` après chaque `ReLU` et compare la meilleure perte de validation.

## Sécuriser le cycle d'entraînement

### L'intégrité des données

Un modèle apprend ce que ses données lui montrent. Si un attaquant peut insérer ou modifier des exemples dans le jeu d'entraînement, par exemple en soumettant des échantillons étiquetés à une plateforme d'analyse alimentée par les utilisateurs, il peut dégrader le modèle ou y implanter une porte dérobée : c'est l'**empoisonnement de données**, détaillé au chapitre 7 et répertorié par l'OWASP Top 10 for LLM Applications 2025 sous « Data and Model Poisoning ». Versionne tes jeux de données, contrôle qui peut les modifier et conserve des empreintes cryptographiques (SHA-256) des fichiers utilisés pour chaque entraînement.

### Le chargement sûr des checkpoints

Le format historique des fichiers PyTorch repose sur `pickle`, un format Python capable d'exécuter du code arbitraire au chargement. Charger un modèle téléchargé revient alors à exécuter un programme inconnu. Depuis PyTorch 2.6, `torch.load` utilise par défaut `weights_only=True`, qui refuse les objets arbitraires ; ne désactive jamais cette protection pour un fichier dont tu ne maîtrises pas l'origine. Pour distribuer des poids, préfère le format **safetensors**, qui ne contient que des tenseurs.

<WarningCallout>
`torch.load(fichier, weights_only=False)` sur un modèle récupéré sur Internet équivaut à exécuter un script inconnu avec tes droits. Les modèles publiés sur des plateformes de partage ont déjà fait l'objet d'abus de ce type : traite un fichier de poids comme un exécutable, analyse-le et charge-le dans un environnement isolé.
</WarningCallout>

<AuditCallout>
Dans un système de management de la sécurité selon ISO/IEC 27001:2022, les jeux de données d'entraînement et les modèles sont des actifs informationnels à inventorier (contrôle A.5.9), dont l'accès doit être restreint (A.8.3) et les modifications tracées. L'ISO/IEC 42001:2023, norme de système de management de l'IA, complète ce cadre pour le cycle de vie des modèles.
</AuditCallout>

## Erreurs fréquentes

- **Oublier `model.eval()` à l'évaluation.** Le dropout reste actif et la batchnorm utilise les statistiques du batch : les scores de validation sont faux et instables.
- **Oublier `optimizer.zero_grad()`.** Les gradients s'accumulent d'une itération à l'autre.
- **Évaluer sur le jeu de test à chaque époque** pour choisir le meilleur modèle. Le test devient un jeu de validation et le score final est optimiste.
- **Garder les poids de la dernière époque** au lieu de ceux de la meilleure époque de validation.
- **Ne pas mélanger les données d'entraînement**, alors qu'elles sont triées par classe ou par date : chaque batch ne contient qu'une seule classe et l'entraînement oscille.
- **Augmenter un batch sans ajuster le taux d'apprentissage.** Un batch plus grand donne un gradient moins bruité, et le taux optimal change en conséquence.
- **Appliquer une augmentation de données qui change l'étiquette**, ou qui n'a pas de sens pour le domaine.
- **Fuite de données entre entraînement et validation**, par exemple des sessions d'un même utilisateur ou des variantes d'un même malware réparties dans les deux ensembles.

## Lab — Mise en pratique

**Environnement** : Python 3.12 avec `numpy`, puis `torch` pour les dernières étapes. Garde la même session Python d'une étape à l'autre.

<Steps steps={[
  { title: "Comparer batch complet, mini-batch et exemple unique", description: "Calcule le gradient d'une régression simple sur l'ensemble des données, sur un seul exemple, puis sur un mini-batch de 4. Tu dois obtenir environ -4.21, -11.55 et -9.00 : même direction, amplitudes très différentes.", code: "import numpy as np\nnp.random.seed(0)\n\n# Jeu de donnees jouet : 20 exemples, relation y = 2x + bruit\nX = np.random.randn(20)\ny = 2 * X + np.random.randn(20) * 0.1\n\nw = 0.0\n\ndef gradient(w, X_batch, y_batch):\n    y_pred = w * X_batch\n    error = y_pred - y_batch\n    return np.mean(2 * error * X_batch)\n\nprint('Gradient (batch complet, 20 exemples) :', gradient(w, X, y))\nprint('Gradient (1 seul exemple)             :', gradient(w, X[:1], y[:1]))\nprint('Gradient (mini-batch de 4 exemples)   :', gradient(w, X[:4], y[:4]))" },
  { title: "Mesurer la stabilité du gradient selon la taille du batch", description: "Compare l'écart-type du gradient calculé exemple par exemple à celui des mini-batchs de 4. Tu dois obtenir environ 5.52 contre 2.85 : le mini-batch lisse la variabilité du gradient.", code: "single_grads = [gradient(w, X[i:i+1], y[i:i+1]) for i in range(20)]\nmini_batch_grads = [gradient(w, X[i:i+4], y[i:i+4]) for i in range(0, 20, 4)]\n\nprint('Ecart-type gradient (exemple par exemple) :', np.std(single_grads))\nprint('Ecart-type gradient (mini-batchs de 4)    :', np.std(mini_batch_grads))" },
  { title: "Implémenter le dropout à la main", description: "Applique un masque de dropout à une couche de 8 neurones. Observe que les activations conservées sont divisées par (1 - dropout_rate), donc doublées pour un taux de 0.5, pour compenser les activations désactivées.", code: "activations = np.array([0.9, 0.2, 0.7, 0.5, 0.3, 0.8, 0.1, 0.6])\ndropout_rate = 0.5\n\nmask = (np.random.rand(*activations.shape) > dropout_rate).astype(float)\nactivations_dropped = activations * mask / (1 - dropout_rate)\n\nprint('Activations originales    :', activations)\nprint('Masque de dropout         :', mask)\nprint('Activations apres dropout :', np.round(activations_dropped, 2))" },
  { title: "Vérifier que l'échelle est conservée en moyenne", description: "Répète le dropout sur 100 000 masques et calcule la moyenne de chaque activation. Les valeurs doivent retrouver les activations d'origine à 0.01 près, ce qui justifie la division par (1 - dropout_rate).", code: "masks = (np.random.rand(100_000, 8) > dropout_rate) / (1 - dropout_rate)\nprint(np.round((activations * masks).mean(axis=0), 3))" },
  { title: "Observer nn.Dropout en mode entraînement et en mode évaluation", description: "Applique nn.Dropout(0.5) à un vecteur de 1 en mode train puis en mode eval. En mode train, certaines valeurs valent 0 et les autres 2 ; en mode eval, le vecteur est inchangé.", code: "import torch\nfrom torch import nn\n\ntorch.manual_seed(0)\ndrop = nn.Dropout(0.5)\nones = torch.ones(8)\ndrop.train()\nprint('train :', drop(ones))\ndrop.eval()\nprint('eval  :', drop(ones))" },
  { title: "Entraîner avec validation et arrêt précoce", description: "Copie la boucle complète du chapitre et exécute-la en affichant les pertes d'entraînement et de validation à chaque époque. Repère l'époque où la validation cesse de s'améliorer alors que l'entraînement continue de baisser.", code: "# Reprends la boucle d'entrainement complete du chapitre,\n# en ajoutant dans la boucle des epoques :\n#   train_loss = loss_fn(model(X_train), y_train).item()\n#   print(epoch, round(train_loss, 3), round(val_loss, 3))" },
  { title: "Comparer avec dropout et weight decay", description: "Ajoute nn.Dropout(0.3) après chaque ReLU et passe weight_decay à 0.1, puis relance. Compare la meilleure perte de validation et l'époque d'arrêt avec l'exécution précédente, et note l'écart entre perte d'entraînement et perte de validation.", code: "model = nn.Sequential(\n    nn.Linear(20, 256), nn.ReLU(), nn.Dropout(0.3),\n    nn.Linear(256, 256), nn.ReLU(), nn.Dropout(0.3),\n    nn.Linear(256, 1),\n)\noptimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=0.1)\n# puis relance la meme boucle d'entrainement" },
]} />

## À retenir

- Les GPU accélèrent le deep learning parce qu'ils disposent de milliers de cœurs adaptés à la parallélisation massive des multiplications matricielles ; leur mémoire limite souvent la taille du modèle et du batch.
- L'entraînement par mini-batchs calcule le gradient moyen sur un petit groupe d'exemples avant chaque mise à jour : un compromis entre parallélisation efficace et stabilité.
- Une époque est un passage complet sur le jeu d'entraînement ; une itération est une mise à jour sur un batch.
- AdamW et un plan de taux d'apprentissage (échauffement puis décroissance) sont les choix par défaut actuels.
- Un réseau profond, avec ses nombreux paramètres, est particulièrement sujet au surapprentissage, qui se lit dans l'écart entre courbes d'entraînement et de validation.
- Dropout, arrêt précoce et augmentation de données sont les trois régularisations clés, complétées par le weight decay et la normalisation ; le dropout divise les activations restantes par (1 - taux) pour conserver l'échelle.
- Les données d'entraînement et les checkpoints sont des actifs de sécurité : contrôle leur intégrité et charge les poids avec `weights_only=True` ou au format safetensors.

## Questions de révision

1. Pourquoi les GPU sont-ils plus adaptés que les CPU à l'entraînement du deep learning, et quelle ressource du GPU est souvent le vrai facteur limitant ?
2. Compare batch complet, exemple unique et mini-batch selon le coût, la stabilité et l'usage du GPU.
3. Avec 10 000 exemples et des batchs de 64, combien d'itérations compte une époque ?
4. Pourquoi divise-t-on les activations restantes par (1 - taux) dans le dropout, et pourquoi faut-il appeler `model.eval()` avant l'évaluation ?
5. Décris les courbes de perte typiques d'un modèle qui surapprend, et la décision que prend l'arrêt précoce.
6. Donne un exemple d'augmentation de données valide et un exemple invalide pour un détecteur de phishing basé sur des captures d'écran.
7. Pourquoi charger un checkpoint PyTorch téléchargé peut-il compromettre une machine, et quelles protections appliques-tu ?
