/**
 * TodoList.jsx
 * ------------
 * Vue principale affichant la liste des tâches, le formulaire d'ajout,
 * la barre de recherche et le panneau de statistiques.
 *
 * Hooks avancés utilisés :
 *
 *  ┌─────────────────┬──────────────────────────────────────────────────────┐
 *  │ Hook            │ Rôle dans ce composant                               │
 *  ├─────────────────┼──────────────────────────────────────────────────────┤
 *  │ useMemo         │ Recalcule filteredTasks uniquement quand tasks ou     │
 *  │                 │ filterQuery changent (évite un map/filter à chaque   │
 *  │                 │ rendu non lié à ces données).                        │
 *  ├─────────────────┼──────────────────────────────────────────────────────┤
 *  │ useCallback     │ Stabilise les références de handleToggle et          │
 *  │                 │ handleDelete pour que React.memo sur TaskItem         │
 *  │                 │ fonctionne efficacement.                             │
 *  ├─────────────────┼──────────────────────────────────────────────────────┤
 *  │ useTransition   │ Marque la mise à jour de filterQuery comme non-      │
 *  │                 │ urgente. La saisie dans l'input reste fluide même si │
 *  │                 │ la liste à filtrer est longue (React peut interrompre│
 *  │                 │ le rendu de filteredTasks pour prioriser l'UI).      │
 *  ├─────────────────┼──────────────────────────────────────────────────────┤
 *  │ React.lazy      │ Stats.jsx est chargé à la demande (voir l'import).  │
 *  │ + Suspense      │ Le JS du panneau Stats n'est téléchargé qu'au clic. │
 *  └─────────────────┴──────────────────────────────────────────────────────┘
 */

import React, {
  useState,
  useMemo,
  useCallback,
  useTransition,
  Suspense,
  lazy,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import TaskItem from './TaskItem';

// ─── Chargement différé (Lazy Loading) ───────────────────────────────────────
// React.lazy() attend une fonction qui retourne une promesse résolvant
// vers un module avec un export default.
// Le bundle de Stats.jsx sera un chunk JavaScript séparé généré par Vite,
// téléchargé uniquement quand `showStats` passe à true.
const Stats = lazy(() => import('./Stats'));

function TodoList() {
  // ── Données et actions depuis les contextes ─────────────────────────────
  const { tasks, addTask, toggleTask, deleteTask } = useTasks();
  const { logout } = useAuth();
  const navigate = useNavigate();

  // ── État local (scope limité à cette vue) ────────────────────────────────
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [searchInput, setSearchInput] = useState('');   // Valeur affichée dans l'input (rendu urgent)
  const [filterQuery, setFilterQuery] = useState('');   // Valeur utilisée pour filtrer (rendu différé)
  const [showStats, setShowStats] = useState(false);    // Contrôle l'affichage du panneau Stats

  // ── useTransition ────────────────────────────────────────────────────────
  // isPending : booléen — true pendant que React traite la transition
  // startTransition : wrapper pour les mises à jour non-urgentes
  const [isPending, startTransition] = useTransition();

  /**
   * handleSearchChange : met à jour l'input immédiatement (haute priorité)
   * puis déclenche la mise à jour du filtre dans une transition (basse priorité).
   * Résultat : l'input ne "lag" jamais, même sur de grandes listes.
   */
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value); // Mise à jour synchrone et prioritaire → UI réactive

    startTransition(() => {
      setFilterQuery(value); // Mise à jour différable → peut être interrompue par React
    });
  };

  // ── useMemo ──────────────────────────────────────────────────────────────
  // filteredTasks n'est recalculé que si tasks ou filterQuery changent.
  // Sans useMemo, ce filtre s'exécuterait à chaque rendu du composant,
  // y compris pour des changements d'état non liés (ex: toggle showStats).
  const filteredTasks = useMemo(() => {
    if (!filterQuery.trim()) return tasks; // Pas de filtre actif → toute la liste
    const query = filterQuery.toLowerCase();
    return tasks.filter(task =>
      task.title.toLowerCase().includes(query)
    );
  }, [tasks, filterQuery]);

  // ── useCallback ───────────────────────────────────────────────────────────
  // Les fonctions handleToggle et handleDelete ont des références stables
  // entre les rendus (grâce à useCallback + dépendances vides ou stables).
  // Cela permet à React.memo dans TaskItem de comparer "prev props === new props"
  // et de sauter le re-rendu si rien n'a changé.
  const handleToggle = useCallback((id) => {
    toggleTask(id);
  }, [toggleTask]);

  const handleDelete = useCallback((id) => {
    deleteTask(id);
  }, [deleteTask]);

  /**
   * handleAddTask : traite la soumission du formulaire d'ajout.
   */
  const handleAddTask = async (e) => {
    e.preventDefault();
    await addTask(newTaskTitle);
    setNewTaskTitle(''); // Réinitialise l'input après ajout
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="card premium-card p-4">

            {/* ── En-tête : titre + bouton déconnexion ──────────────────── */}
            <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
              <h2 className="fw-bold mb-0 fs-4 text-dark">
                <i className="bi bi-card-checklist me-2 text-primary"></i>
                Ma Todo List
              </h2>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="btn btn-outline-danger btn-sm rounded-pill px-3 shadow-sm"
              >
                <i className="bi bi-box-arrow-right me-1"></i> Déconnexion
              </button>
            </div>

            {/* ── Formulaire d'ajout de tâche ───────────────────────────── */}
            <form onSubmit={handleAddTask} className="mb-3">
              <div className="input-group input-group-lg shadow-sm">
                <input
                  id="new-task-input"
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="form-control"
                  placeholder="Que voulez-vous faire aujourd'hui ?"
                  aria-label="Nouvelle tâche"
                />
                <button className="btn btn-primary px-4" type="submit" aria-label="Ajouter la tâche">
                  <i className="bi bi-plus-lg"></i>
                </button>
              </div>
            </form>

            {/* ── Barre de recherche avec useTransition ─────────────────── */}
            <div className="mb-3 position-relative">
              <span className="search-icon">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                id="search-input"
                type="text"
                className={`form-control ps-5 ${isPending ? 'searching' : ''}`}
                placeholder="Rechercher une tâche…"
                value={searchInput}
                onChange={handleSearchChange}
                aria-label="Rechercher une tâche"
              />
              {/* Indicateur visuel pendant la transition (liste en cours de filtrage) */}
              {isPending && (
                <span className="position-absolute end-0 top-50 translate-middle-y me-3">
                  <span className="spinner-border spinner-border-sm text-secondary" role="status"></span>
                </span>
              )}
            </div>

            {/* ── Liste des tâches filtrées ──────────────────────────────── */}
            <ul className="list-group list-group-flush mb-0">
              {filteredTasks.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-inbox fs-1 d-block mb-3 text-opacity-50"></i>
                  <p>
                    {filterQuery
                      ? `Aucune tâche ne correspond à "${filterQuery}".`
                      : 'Aucune tâche pour le moment. Ajoutez-en une !'}
                  </p>
                </div>
              ) : (
                filteredTasks.map(task => (
                  // Chaque TaskItem est mémoïsé (React.memo).
                  // handleToggle et handleDelete ont des références stables (useCallback).
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </ul>

            {/* ── Bouton pour afficher/masquer les statistiques ─────────── */}
            <div className="mt-4 text-center">
              <button
                id="toggle-stats-btn"
                className="btn btn-sm btn-outline-secondary rounded-pill px-4"
                onClick={() => setShowStats(prev => !prev)}
              >
                <i className={`bi bi-bar-chart-line me-2`}></i>
                {showStats ? 'Masquer les statistiques' : 'Afficher les statistiques'}
              </button>
            </div>

            {/* ── Panneau de statistiques (chargé en lazy) ───────────────── */}
            {showStats && (
              // Suspense affiche le fallback pendant que le bundle Stats.jsx
              // est téléchargé depuis le serveur (une seule fois, puis mis en cache).
              <Suspense fallback={
                <div className="text-center text-muted py-3">
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Chargement des statistiques…
                </div>
              }>
                <Stats />
              </Suspense>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default TodoList;
