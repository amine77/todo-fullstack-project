# 📚 Guide d'apprentissage React Avancé

> Documentation technique de la refactorisation du projet `todo-frontend`.
> Ce guide explique **pourquoi** et **comment** chaque pattern avancé de React
> a été appliqué dans ce projet.

---

## Table des matières

1. [Vue d'ensemble de l'architecture](#1-vue-densemble-de-larchitecture)
2. [Context API — Centraliser l'état global](#2-context-api--centraliser-létat-global)
3. [useMemo & useTransition — Recherche fluide](#3-usememo--usetransition--recherche-fluide)
4. [useCallback & React.memo — Éviter les rendus inutiles](#4-usecallback--reactmemo--éviter-les-rendus-inutiles)
5. [React.lazy & Suspense — Chargement différé](#5-reactlazy--suspense--chargement-différé)
6. [React Router — Routage déclaratif et sécurisé](#6-react-router--routage-déclaratif-et-sécurisé)
7. [Arborescence des fichiers](#7-arborescence-des-fichiers)

---

## 1. Vue d'ensemble de l'architecture

### Avant la refactorisation

```
App.jsx
└── Tout : état auth, état tâches, appels API, rendu JSX (167 lignes)
```

**Problème :** `App.jsx` était un composant "God Object" — il gérait trop de responsabilités
simultanément. Cela rendait le code difficile à lire, à tester et à faire évoluer.

### Après la refactorisation

```
App.jsx                    ← Orchestrateur (AuthProvider + Routes)
├── context/
│   ├── AuthContext.jsx    ← État d'authentification (token, login, logout)
│   └── TaskContext.jsx    ← État des tâches + CRUD API
└── components/
    ├── Login.jsx          ← Route `/login`
    ├── TodoList.jsx       ← Route `/` (Dashboard, protégée)
    ├── TaskItem.jsx       ← Élément unitaire de liste
    └── Stats.jsx          ← Panneau statistiques (lazy)
```

**Principe appliqué :** [Single Responsibility Principle](https://fr.wikipedia.org/wiki/Principe_de_responsabilit%C3%A9_unique) —
chaque fichier a une seule raison de changer.

---

## 2. Context API — Centraliser l'état global

### Le problème : le Prop Drilling

Sans Context API, pour passer le `token` ou les fonctions `login`/`logout` à un composant
profondément imbriqué, on doit les transmettre via chaque niveau intermédiaire, même ceux
qui n'en ont pas besoin. C'est ce qu'on appelle le **prop drilling**.

```
App → TodoList → Header → UserMenu → LogoutButton  (token passe par tous les niveaux !)
```

### La solution : Context API

```jsx
// 1. Créer le contexte
const AuthContext = createContext(null);

// 2. Fournir la valeur au sous-arbre via le Provider
<AuthContext.Provider value={{ token, login, logout }}>
  {children}
</AuthContext.Provider>

// 3. Consommer n'importe où dans l'arbre (sans props)
const { token, logout } = useAuth(); // useAuth = useContext(AuthContext)
```

### Deux contextes séparés : pourquoi ?

| Contexte | Contenu | Durée de vie |
|---|---|---|
| `AuthContext` | token, login, logout | Toute l'application |
| `TaskContext` | tasks, CRUD | Seulement quand connecté |

**Bénéfice :** `TaskContext` est monté *uniquement* si l'utilisateur est authentifié.
Si le token expire, il est démonté proprement et toutes les souscriptions API s'arrêtent.

---

## 3. useMemo & useTransition — Recherche fluide

### Le problème : filtrage coûteux à chaque rendu

Sans optimisation, chaque mise à jour d'état (même sans rapport avec la recherche)
recalculerait le tableau filtré :

```jsx
// ❌ Recalculé à CHAQUE rendu, même si tasks et filterQuery n'ont pas changé
const filteredTasks = tasks.filter(t => t.title.includes(filterQuery));
```

### useMemo : mémoïser un calcul coûteux

```jsx
// ✅ Recalculé UNIQUEMENT si tasks ou filterQuery changent
const filteredTasks = useMemo(() => {
  if (!filterQuery.trim()) return tasks;
  return tasks.filter(t => t.title.toLowerCase().includes(filterQuery.toLowerCase()));
}, [tasks, filterQuery]); // ← tableau de dépendances
```

**Règle d'or :** n'utilisez `useMemo` que pour des calculs véritablement coûteux
(grandes listes, transformations complexes). Sur de petits tableaux, l'overhead de
la mémoïsation peut être supérieur au gain.

### useTransition : différer les mises à jour non-urgentes

```jsx
const [isPending, startTransition] = useTransition();

const handleSearchChange = (e) => {
  const value = e.target.value;

  // 🔴 URGENT → l'input doit répondre immédiatement
  setSearchInput(value);

  // 🟡 NON-URGENT → React peut différer la mise à jour de filteredTasks
  startTransition(() => {
    setFilterQuery(value);
  });
};
```

**Résultat concret :** l'utilisateur voit sa frappe apparaître instantanément dans
l'input. La liste filtrée se met à jour en arrière-plan. Sur une liste de milliers
d'éléments, cela évite que l'interface se fige.

`isPending` peut être utilisé pour afficher un indicateur de chargement pendant la
transition (voir le spinner dans `TodoList.jsx`).

---

## 4. useCallback & React.memo — Éviter les rendus inutiles

### Le problème : les fonctions recréées à chaque rendu

En JavaScript, chaque appel de fonction crée de nouvelles instances :

```jsx
// À chaque rendu de TodoList, ces deux fonctions sont de NOUVELLES références
const handleToggle = (id) => toggleTask(id);
const handleDelete = (id) => deleteTask(id);
```

### React.memo : ne re-rendre que si les props changent

```jsx
// TaskItem.jsx
export default React.memo(TaskItem);
// React compare les props avant/après. Si identiques → rendu ignoré.
```

**Sans useCallback**, même avec `React.memo`, `TaskItem` re-rendrait à chaque
frappe dans le champ de recherche, car `handleToggle` et `handleDelete` auraient
à chaque fois de nouvelles références (les props "changent" du point de vue de
la comparaison shallow).

### useCallback : stabiliser les références de fonctions

```jsx
// ✅ handleToggle a la MÊME référence entre les rendus
//    (sauf si toggleTask change, ce qui n'arrive jamais ici)
const handleToggle = useCallback((id) => {
  toggleTask(id);
}, [toggleTask]);
```

### Schéma de collaboration

```
TodoList (état: searchInput, filterQuery, showStats)
    │
    ├── [re-rendu] frappe dans searchInput
    │
    ├── handleToggle (useCallback) → référence stable ✓
    ├── handleDelete (useCallback) → référence stable ✓
    │
    └── TaskItem (React.memo)
            │
            ├── props.task      : inchangé pour cet item ? → ✓ pas de re-rendu
            ├── props.onToggle  : référence stable grâce à useCallback → ✓
            └── props.onDelete  : référence stable grâce à useCallback → ✓
```

---

## 5. React.lazy & Suspense — Chargement différé

### Le problème : un bundle monolithique

Sans code splitting, Vite construit un seul fichier JavaScript contenant **tout** le code
de l'application. Le navigateur doit télécharger et analyser l'intégralité de ce fichier
avant d'afficher quoi que ce soit.

### React.lazy : diviser le bundle à la demande

```jsx
// App.jsx — TodoList est dans un chunk JS séparé
const TodoList = lazy(() => import('./components/TodoList'));

// Stats.jsx est chargé uniquement si l'utilisateur clique sur "Afficher"
const Stats = lazy(() => import('./Stats'));
```

Vite génère automatiquement des chunks séparés pour chaque `import()` dynamique.
Vous pouvez le vérifier avec `npm run build` : vous verrez plusieurs fichiers `.js`
dans `dist/assets/`.

### Suspense : afficher un fallback pendant le téléchargement

```jsx
<Suspense fallback={<div>Chargement…</div>}>
  <TodoList />  {/* Téléchargé la première fois + mis en cache */}
</Suspense>
```

### Vérification dans les DevTools

1. Ouvrez les **Chrome DevTools** → onglet **Network**
2. Filtrez sur **JS**
3. Rechargez la page → observez le bundle initial chargé sur la page de login
4. Connectez-vous → un **nouveau chunk JS** apparaît (TodoList)
5. Cliquez sur "Afficher les statistiques" → un **autre chunk JS** apparaît (Stats)

### Impact sur les métriques Web Vitals

| Métrique | Explication |
|---|---|
| **LCP** (Largest Contentful Paint) | Bundle initial plus léger → page de login s'affiche plus vite |
| **TTI** (Time To Interactive) | Moins de JS à analyser au démarrage → UI interactive plus tôt |
| **TBT** (Total Blocking Time) | Le thread principal est moins bloqué |

---

## 6. React Router — Routage déclaratif et sécurisé

### Le problème : routage manuel conditionnel

Initialement, le changement de vue (Login ↔ Dashboard) était géré par un `if/else` simple dans `App.jsx`. Bien que fonctionnel, cela présente des limites :
- L'URL ne change jamais (`localhost:5173/` pour tout).
- On ne peut pas utiliser les boutons "Suivant" et "Précédent" du navigateur.
- On ne peut pas partager un lien vers une page spécifique.

### La solution : React Router v6

Le projet utilise désormais `react-router-dom` pour gérer la navigation via des composants déclaratifs.

#### Configuration globale (`main.jsx`)
On enveloppe l'application dans `<BrowserRouter>` pour activer la gestion de l'historique HTML5.

#### Définition des routes (`App.jsx`)
```jsx
<Routes>
  <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

### Sécurisation des accès (Guards)

Deux composants "wrapper" ont été créés pour sécuriser les routes :

1. **`ProtectedRoute`** : 
   - Vérifie si un `token` existe.
   - Si **non** → redirige vers `/login` via `<Navigate to="/login" />`.
   - Si **oui** → affiche le contenu (`children`).

2. **`PublicRoute`** : 
   - Empêche un utilisateur déjà connecté d'accéder à la page de login.
   - Si un `token` existe → redirige vers `/`.

### Navigation programmatique

Le hook `useNavigate()` est utilisé pour changer de page après une action :
- **Login** : `navigate('/')` après le succès de l'authentification.
- **Logout** : `navigate('/login')` après la suppression du token.

---

## 7. Arborescence des fichiers

```
todo-frontend/
└── src/
    ├── App.jsx                    ← Orchestrateur (AuthProvider + routage)
    ├── main.jsx                   ← Point d'entrée React DOM
    ├── index.css                  ← Styles globaux + utilitaires
    ├── api/
    │   └── api.js                 ← Instance Axios + fonctions API
    ├── context/
    │   ├── AuthContext.jsx        ← Context API : token, login, logout
    │   └── TaskContext.jsx        ← Context API : tasks + CRUD
    └── components/
        ├── Login.jsx              ← Formulaire de connexion
        ├── TodoList.jsx           ← Vue principale (useMemo, useCallback, useTransition)
        ├── TaskItem.jsx           ← Élément de liste (React.memo)
        └── Stats.jsx              ← Statistiques (React.lazy target)
```

---

> **Ressources complémentaires**
> - [React Docs — Context](https://react.dev/reference/react/createContext)
> - [React Docs — useMemo](https://react.dev/reference/react/useMemo)
> - [React Docs — useCallback](https://react.dev/reference/react/useCallback)
> - [React Docs — useTransition](https://react.dev/reference/react/useTransition)
> - [React Docs — lazy](https://react.dev/reference/react/lazy)
