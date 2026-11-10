---
title: Réduction de dimension et sélection de caractéristiques
chapter: 6
course: machine-learning
difficulty: advanced
duration: 60
tags: [pca, acp, reduction-dimension, feature-selection, fleau-dimension, detection-intrusion]
ceh_modules: []
objectives:
  - Comprendre le fléau de la dimension et le mesurer sur des distances
  - Comprendre le principe de l'ACP (PCA) et la dérouler sur un exemple chiffré (covariance, valeurs propres, variance expliquée)
  - Choisir le nombre de composantes et connaître les limites de l'ACP
  - Distinguer réduction de dimension et sélection de caractéristiques, et connaître les méthodes filtre, enveloppe et intégrée
  - Éviter la fuite de données lors de la sélection de caractéristiques
---

## Introduction

Ce chapitre aborde un problème pratique récurrent en machine learning : que faire quand un jeu de données contient un très grand nombre de variables — un scénario fréquent en cybersécurité (des centaines de caractéristiques réseau extraites pour de la détection d'intrusion, par exemple).

Les jeux de données académiques de détection d'intrusion en donnent une idée : NSL-KDD décrit chaque connexion par 41 caractéristiques, et CIC-IDS2017, produit avec l'outil CICFlowMeter, par environ 80 statistiques de flux. Un détecteur de malware statique peut extraire plusieurs milliers de caractéristiques d'un exécutable : imports, chaînes, histogrammes d'octets. Plus de variables, c'est potentiellement plus d'information, mais aussi plus de bruit, plus de redondance, des modèles plus lents et un risque accru de surapprentissage.

À la fin de ce chapitre, tu sauras mesurer pourquoi les distances perdent leur sens en grande dimension, dérouler une ACP à la main, choisir le nombre de composantes à conserver, sélectionner les variables utiles avec plusieurs familles de méthodes, et éviter le piège de la fuite de données qui fait paraître excellent un modèle qui ne vaut rien.

## Le fléau de la dimension

<WarningCallout>
Le "fléau de la dimension" (curse of dimensionality) désigne le fait que les données deviennent de plus en plus clairsemées à mesure que le nombre de variables augmente — au-delà d'un certain nombre de dimensions, les notions de distance et de proximité utilisées par des algorithmes comme k-NN ou k-means (chapitres précédents) perdent en partie leur pouvoir discriminant.
</WarningCallout>

<CehCallout>
Rappel du cours Algèbre Linéaire (chapitre 4) : chaque variable ajoutée est une dimension supplémentaire de l'espace des données — avec trop de dimensions, le volume de cet espace croît si rapidement que les points, même nombreux, deviennent relativement isolés les uns des autres, rendant plus difficile la détection de motifs.
</CehCallout>

### Le volume explose

Pour couvrir un segment de longueur 1 avec un point tous les dixièmes, il faut 10 points. Pour couvrir un carré avec la même densité, il en faut 100 ; pour un cube, 1 000 ; en 10 dimensions, dix milliards. Avec un nombre fixe d'exemples, l'espace devient donc vite presque vide.

### Les distances se ressemblent toutes

Plus contre-intuitif encore : en grande dimension, la distance au point le plus proche et la distance au point le plus éloigné deviennent presque égales. Mesurons-le en tirant 500 points uniformément dans un hypercube, puis en calculant leur distance à un point de référence :

```python
import numpy as np

rng = np.random.default_rng(0)
for d in [2, 10, 100, 1000]:
    points, reference = rng.random((500, d)), rng.random(d)
    distances = np.linalg.norm(points - reference, axis=1)
    print(d, round(distances.min(), 3), round(distances.max(), 3), round(distances.max() / distances.min(), 2))
```

```text
dimension   min      max      max / min
2           0.030    1.272    41.73
10          0.337    1.907     5.65
100         3.389    4.600     1.36
1000        12.324   13.628    1.11
```

En deux dimensions, le point le plus éloigné est 42 fois plus loin que le plus proche ; en 1 000 dimensions, à peine 11 % plus loin. Quand tous les points sont presque à la même distance, la notion de « plus proche voisin » ne veut plus dire grand-chose, et k-NN, k-means ou DBSCAN en souffrent directement.

### L'effet sur un modèle

Le problème s'aggrave quand la plupart des variables sont du bruit : chacune ajoute une contribution aléatoire à la distance, qui noie le signal des variables utiles. Sur un jeu synthétique de 1 000 exemples à 500 variables dont seulement 20 sont informatives, un k-NN obtient 0,563 de précision moyenne en validation croisée, à peine mieux que le hasard. Le même k-NN, restreint aux 20 variables les plus pertinentes, monte à 0,790. Moins de variables, mais les bonnes, donnent un bien meilleur modèle.

## L'Analyse en Composantes Principales (ACP / PCA)

<CehCallout>
L'ACP transforme un ensemble de variables potentiellement corrélées en un nouvel ensemble de variables non corrélées (les composantes principales), ordonnées par la quantité de variance des données qu'elles expliquent — en ne conservant que les premières composantes, on réduit le nombre de dimensions tout en préservant l'essentiel de l'information.
</CehCallout>

```mermaid
graph LR
    A[Données à N dimensions corrélées] --> B[Calcul des composantes principales]
    B --> C[Conserver les k premières composantes]
    C --> D[Données à k dimensions, variance maximale préservée]
```

<Steps steps={[
  { title: "Centrer et normaliser les données", description: "Chaque variable est centrée (moyenne nulle) et mise à la même échelle, sans quoi une variable à grande échelle dominerait artificiellement l'analyse." },
  { title: "Calculer les composantes principales", description: "Rappel du cours Algèbre Linéaire (chapitre 6, valeurs propres et vecteurs propres) : les composantes principales sont les vecteurs propres de la matrice de covariance des données, ordonnés par variance expliquée décroissante." },
  { title: "Projeter les données sur les k premières composantes", description: "Les données sont projetées sur un nouvel espace de dimension réduite, défini par les composantes qui expliquent le plus de variance." },
]} />

### L'intuition géométrique

Imagine un nuage de points en deux dimensions, allongé en diagonale comme un cigare. La première composante principale est la direction le long de laquelle le nuage s'étire le plus, c'est-à-dire la direction de variance maximale. La seconde est perpendiculaire à la première et capte la variance restante. Si le cigare est très fin, projeter chaque point sur la première direction perd très peu d'information : on passe de deux coordonnées à une seule.

Pourquoi les vecteurs propres de la matrice de covariance ? La variance des données projetées sur une direction unitaire u vaut uᵀ C u, où C est la matrice de covariance. La direction qui maximise cette quantité est le vecteur propre associé à la plus grande valeur propre, et cette valeur propre est précisément la variance obtenue. Chaque valeur propre mesure donc la variance expliquée par sa composante.

### Un exemple chiffré pas à pas

Cinq hôtes sont décrits par deux variables corrélées, par exemple un nombre de processus et un nombre de connexions : (2, 1), (3, 4), (5, 5), (6, 8) et (4, 2).

```text
1. Centrer : moyennes = (4, 4)
   points centrés : (-2,-3)  (-1,0)  (1,1)  (2,4)  (0,-2)

2. Matrice de covariance (division par n − 1 = 4) :
   var(x1)     = (4 + 1 + 1 + 4 + 0) / 4  = 2,5
   var(x2)     = (9 + 0 + 1 + 16 + 4) / 4 = 7,5
   cov(x1, x2) = (6 + 0 + 1 + 8 + 0) / 4  = 3,75
   C = [[2,5  3,75]
        [3,75 7,5 ]]

3. Valeurs propres de C : 9,507 et 0,493
   Variance expliquée : 9,507 / 10 = 95,1 %  et  0,493 / 10 = 4,9 %

4. Première composante (vecteur propre associé à 9,507) : (0,472 ; 0,882)
   Projection du point centré (2, 4) : 2 × 0,472 + 4 × 0,882 = 4,47
```

La trace de C, somme des variances (2,5 + 7,5 = 10), est égale à la somme des valeurs propres : l'ACP redistribue la variance totale sans en perdre. Ici, une seule composante conserve 95 % de l'information. On peut vérifier avec NumPy et scikit-learn :

```python
import numpy as np
from sklearn.decomposition import PCA

D = np.array([[2, 1], [3, 4], [5, 5], [6, 8], [4, 2]], dtype=float)
valeurs, vecteurs = np.linalg.eigh(np.cov(D, rowvar=False))
print(valeurs)                              # [0.49306091 9.50693909]
pca = PCA().fit(D)
print(pca.explained_variance_ratio_.round(3), pca.components_[0])
```

```text
[0.49306091 9.50693909]
[0.951 0.049] [0.47185793 0.8816746 ]
```

Note que scikit-learn ne calcule pas réellement la matrice de covariance : il centre les données et utilise une décomposition en valeurs singulières (SVD), mathématiquement équivalente et plus stable numériquement. Le signe d'un vecteur propre est arbitraire : une composante et son opposée décrivent la même direction.

### Pourquoi normaliser d'abord

L'ACP cherche la variance maximale. Si une variable s'exprime en octets, avec une variance de l'ordre de 10¹², et une autre en secondes, la première composante sera simplement la variable en octets, uniquement à cause de son unité. Après `StandardScaler`, chaque variable a une variance de 1, et l'ACP mesure alors des corrélations, pas des unités.

### Choisir le nombre de composantes

L'attribut `explained_variance_ratio_` donne la part de variance de chaque composante. On choisit souvent le nombre de composantes qui atteint un seuil cumulé, 90 ou 95 % : avec `PCA(n_components=0.95)`, scikit-learn le fait automatiquement. Sur le jeu à 20 variables du lab, dont 5 informatives, cinq composantes ne conservent que 45 % de la variance, et il en faut 16 pour atteindre 95 % : la variance est éparpillée, car beaucoup de variables sont du bruit indépendant.

<TipCallout>
L'ACP est fréquemment utilisée avant d'entraîner un modèle sur des données à très haute dimension (par exemple des centaines de caractéristiques réseau) : réduire les dimensions accélère l'entraînement, réduit le risque de surapprentissage, et permet parfois de visualiser les données en 2 ou 3 dimensions.
</TipCallout>

### Les limites de l'ACP

L'ACP est non supervisée : elle maximise la variance sans regarder la cible. Or variance n'est pas pertinence. Sur le jeu à 500 variables cité plus haut, un k-NN précédé d'une ACP à 20 composantes plafonne autour de 0,55 à 0,57 selon les exécutions, à peine mieux que sans réduction, alors que la sélection des 20 meilleures variables atteignait 0,790. Les directions de plus grande variance mélangeaient le bruit et le signal. L'ACP est par ailleurs linéaire : elle ne capte pas des structures courbes. Pour la seule visualisation de données complexes, on utilise des méthodes non linéaires comme t-SNE, disponible dans scikit-learn, ou UMAP, du paquet `umap-learn` ; leurs axes n'ont pas d'interprétation et les distances entre groupes éloignés n'y sont pas fiables.

## Réduction de dimension vs sélection de caractéristiques

<WarningCallout>
Il ne faut pas confondre réduction de dimension et sélection de caractéristiques : l'ACP crée de nouvelles variables (combinaisons des variables originales, difficiles à interpréter individuellement), tandis que la sélection de caractéristiques choisit un sous-ensemble des variables originales, en conservant leur interprétabilité.
</WarningCallout>

<CompareTable
  titleA="Réduction de dimension (ACP)"
  titleB="Sélection de caractéristiques"
  rows={[
    { a: "Crée de nouvelles variables combinées", b: "Conserve un sous-ensemble des variables originales" },
    { a: "Variables résultantes difficiles à interpréter", b: "Variables conservées restent directement interprétables" },
    { a: "Maximise la variance expliquée globale", b: "Peut cibler les variables les plus pertinentes pour une tâche spécifique (ex : importance des variables d'un Random Forest, chapitre 3)" },
]}
/>

Pour un analyste SOC qui doit expliquer à un manager pourquoi une alerte a été levée, la différence est décisive : « volume sortant anormal vers un port inhabituel » se comprend, « composante principale 3 élevée » ne veut rien dire pour personne.

### Les trois familles de méthodes de sélection

| Famille | Principe | Exemples scikit-learn | Avantages et limites |
| --- | --- | --- | --- |
| Filtre | Score statistique de chaque variable, indépendamment du modèle | `VarianceThreshold`, `SelectKBest(f_classif)`, `mutual_info_classif`, `chi2` | Très rapide ; ignore les interactions entre variables |
| Enveloppe (wrapper) | Évalue des sous-ensembles en entraînant le modèle | `RFE`, `SequentialFeatureSelector` | Tient compte du modèle ; coûteux |
| Intégrée (embedded) | La sélection est un effet de l'entraînement | Régularisation L1 (chapitre 2), importances d'arbres via `SelectFromModel` | Bon compromis coût et pertinence |

`VarianceThreshold` supprime les variables quasi constantes, fréquentes dans les caractéristiques de flux (un drapeau TCP jamais activé, par exemple). L'information mutuelle mesure toute dépendance, même non linéaire, entre une variable et la cible. L'élimination récursive `RFE` entraîne un modèle, retire la variable la moins importante, et recommence jusqu'au nombre voulu.

```python
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_selection import SelectFromModel

rf = RandomForestClassifier(random_state=0).fit(X, y)
selecteur = SelectFromModel(rf, prefit=True, max_features=5)
print(np.where(selecteur.get_support())[0])     # indices des variables conservées
```

```text
[ 9 11 14 15 16]
```

## Le piège de la fuite de données lors de la sélection

Sélectionner les variables sur tout le jeu de données, puis évaluer le modèle en validation croisée, est une fuite de données : la sélection a déjà vu les exemples de test et a choisi les variables qui, par hasard, y sont corrélées à la cible. La démonstration est frappante sur des données entièrement aléatoires, 200 exemples à 5 000 variables de bruit et des étiquettes tirées à pile ou face :

```python
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline

rng = np.random.default_rng(0)
X_bruit, y_hasard = rng.normal(size=(200, 5000)), rng.integers(0, 2, 200)

X_sel = SelectKBest(f_classif, k=20).fit_transform(X_bruit, y_hasard)      # fuite
print(cross_val_score(LogisticRegression(), X_sel, y_hasard, cv=5).mean())
propre = make_pipeline(SelectKBest(f_classif, k=20), LogisticRegression())
print(cross_val_score(propre, X_bruit, y_hasard, cv=5).mean())             # correct
```

```text
0.795
0.51
```

Avec la fuite, le modèle semble prédire le hasard à 80 % ; correctement évalué, il est à 51 %, c'est-à-dire au niveau du hasard. Placer la sélection dans un `Pipeline` garantit qu'elle est refaite sur chaque pli d'entraînement uniquement. Le chapitre 7 généralise cette règle à toute la préparation des données.

<AttackDefenseTable rows={[
  { phase: "Détection d'intrusion", attack: "Scans, force brute et C2 décrits par des dizaines de statistiques de flux redondantes", defense: "VarianceThreshold puis sélection par information mutuelle ou importances, modèle plus rapide et plus robuste" },
  { phase: "Évasion par variables faibles", attack: "Un modèle qui s'appuie sur des variables faciles à manipuler (taille de paquet, ports) est contourné à peu de frais", defense: "Préférer des variables coûteuses à falsifier, vérifier par permutation sur quelles variables repose la décision" },
  { phase: "Explicabilité d'une alerte", attack: "Un modèle opaque génère des alertes que personne ne peut justifier, et finit ignoré", defense: "Sélection de variables interprétables plutôt qu'ACP quand l'alerte doit être expliquée à un humain" },
]} />

## Erreurs fréquentes

- **Lancer une ACP sans normaliser** : la variable à la plus grande unité accapare la première composante.
- **Croire que la variance égale la pertinence** : l'ACP peut écarter la petite direction qui sépare justement les classes.
- **Interpréter une composante principale comme une variable métier** : c'est une combinaison de toutes les variables.
- **Sélectionner les variables sur tout le jeu avant la validation** : fuite de données garantie, et score illusoire.
- **Utiliser t-SNE ou UMAP comme prétraitement d'un modèle** : ce sont des outils de visualisation, non des transformations stables.
- **Garder des variables quasi constantes ou dupliquées** : elles alourdissent les calculs sans rien apporter.

## Lab — Mise en pratique

**Environnement** : Python 3.12 ou plus récent avec scikit-learn et NumPy (terminal Nyx Shell ou environnement local).

<Steps steps={[
  { title: "Mesurer le fléau de la dimension", description: "Tire 500 points aléatoires en 2, 10, 100 et 1 000 dimensions et compare la distance minimale et maximale à un point de référence. Observe le rapport max/min s'effondrer vers 1.", code: "import numpy as np\nrng = np.random.default_rng(0)\nfor d in [2, 10, 100, 1000]:\n    P, q = rng.random((500, d)), rng.random(d)\n    dist = np.linalg.norm(P - q, axis=1)\n    print(d, round(dist.max() / dist.min(), 2))" },
  { title: "Dérouler l'ACP à la main", description: "Reproduis l'exemple chiffré : centre les cinq points, calcule la matrice de covariance et ses valeurs propres, puis compare avec PCA de scikit-learn.", code: "from sklearn.decomposition import PCA\nD = np.array([[2, 1], [3, 4], [5, 5], [6, 8], [4, 2]], dtype=float)\nC = np.cov(D, rowvar=False)\nprint(C)\nprint(np.linalg.eigh(C)[0])\nprint(PCA().fit(D).explained_variance_ratio_)" },
  { title: "Générer un jeu de données à haute dimension", description: "Crée un jeu de données synthétique avec de nombreuses caractéristiques corrélées, comparable à des caractéristiques réseau extraites pour la détection d'intrusion.", code: "from sklearn.datasets import make_classification\nX, y = make_classification(n_samples=200, n_features=20, n_informative=5, random_state=0)" },
  { title: "Centrer et normaliser les données", description: "Rappel de la première étape de l'ACP décrite plus haut : chaque variable doit être centrée et mise à la même échelle avant tout calcul de composantes.", code: "from sklearn.preprocessing import StandardScaler\nX_scaled = StandardScaler().fit_transform(X)" },
  { title: "Appliquer l'ACP et inspecter la variance expliquée", description: "Réduis les 20 variables à 5 composantes principales et observe quelle part de la variance totale ces composantes préservent, puis combien de composantes il faut pour atteindre 95 %.", code: "pca = PCA(n_components=5).fit(X_scaled)\nratios = pca.explained_variance_ratio_\nprint('variance expliquee par composante:', ratios)\nprint('variance cumulee:', ratios.sum())\nprint('composantes pour 95 %:', PCA(n_components=0.95).fit(X_scaled).n_components_)" },
  { title: "Comparer avec la sélection de caractéristiques", description: "Utilise l'importance des variables d'une Random Forest (chapitre 3) pour sélectionner directement les variables originales les plus pertinentes, et compare l'interprétabilité de ce résultat à celui de l'ACP.", code: "from sklearn.ensemble import RandomForestClassifier\nfrom sklearn.feature_selection import SelectFromModel\nrf = RandomForestClassifier(random_state=0).fit(X, y)\nselector = SelectFromModel(rf, prefit=True, max_features=5)\nprint('variables originales conservees:', selector.get_support())" },
  { title: "Comparer k-NN brut, sélection et ACP", description: "Sur 500 variables dont 20 informatives, compare en validation croisée un k-NN sur toutes les variables, sur les 20 meilleures (SelectKBest) et sur 20 composantes principales.", code: "from sklearn.feature_selection import SelectKBest, f_classif\nfrom sklearn.neighbors import KNeighborsClassifier\nfrom sklearn.pipeline import make_pipeline\nfrom sklearn.model_selection import cross_val_score\nX5, y5 = make_classification(n_samples=1000, n_features=500, n_informative=20, n_redundant=0, random_state=0)\nfor nom, etape in [('tout', 'passthrough'), ('selection', SelectKBest(f_classif, k=20)), ('acp', PCA(n_components=20))]:\n    m = make_pipeline(StandardScaler(), etape, KNeighborsClassifier())\n    print(nom, cross_val_score(m, X5, y5, cv=5).mean().round(3))" },
  { title: "Démontrer la fuite de données", description: "Sur des données et des étiquettes entièrement aléatoires, compare une sélection faite avant la validation croisée et une sélection placée dans un Pipeline. Seule la seconde donne le score honnête, proche de 0,5.", code: "from sklearn.linear_model import LogisticRegression\nXb, yb = rng.normal(size=(200, 5000)), rng.integers(0, 2, 200)\nXs = SelectKBest(f_classif, k=20).fit_transform(Xb, yb)\nprint('avec fuite:', cross_val_score(LogisticRegression(), Xs, yb, cv=5).mean())\nprint('correct:', cross_val_score(make_pipeline(SelectKBest(f_classif, k=20), LogisticRegression()), Xb, yb, cv=5).mean())" },
]} />

## À retenir

- Le fléau de la dimension rend les données clairsemées et dégrade la pertinence des notions de distance à mesure que le nombre de variables augmente : en 1 000 dimensions, le point le plus proche et le plus éloigné sont presque à la même distance.
- L'ACP réduit la dimension en projetant les données sur les composantes principales, les vecteurs propres de la matrice de covariance, ordonnés par variance expliquée décroissante ; chaque valeur propre est la variance de sa composante.
- Avant une ACP, chaque variable doit être centrée et normalisée ; le nombre de composantes se choisit par un seuil de variance cumulée.
- L'ACP accélère l'entraînement et réduit le risque de surapprentissage, mais elle est non supervisée : variance n'est pas pertinence.
- Contrairement à l'ACP, la sélection de caractéristiques conserve un sous-ensemble des variables originales, préservant leur interprétabilité ; elle se fait par filtre, enveloppe ou méthode intégrée.
- Toute sélection de variables doit être faite à l'intérieur d'un Pipeline évalué en validation croisée, sous peine de fuite de données.

## Questions de révision

1. Qu'est-ce que le fléau de la dimension, et pourquoi affecte-t-il des algorithmes comme k-NN ?
2. Que représentent les composantes principales calculées par l'ACP ?
3. Pourquoi préférer la sélection de caractéristiques à l'ACP quand l'interprétabilité des variables est importante ?
4. Pour une matrice de covariance de valeurs propres 6, 3 et 1, quelle part de variance conservent les deux premières composantes ?
5. Pourquoi faut-il normaliser les variables avant une ACP ? Donne un exemple avec des variables réseau.
6. Pourquoi un k-NN entraîné sur 500 caractéristiques réseau peut-il moins bien fonctionner qu'un k-NN entraîné sur les 20 plus pertinentes ?
7. Explique pourquoi sélectionner les variables sur tout le jeu de données avant une validation croisée produit un score trompeur.
