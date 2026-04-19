/**
 * TaskItem.jsx
 * ------------
 * Composant représentant une seule tâche dans la liste.
 *
 * OPTIMISATION — React.memo :
 * Ce composant est enveloppé dans React.memo(). Cela signifie que React ne
 * re-rendra pas ce composant si ses props (task, onToggle, onDelete) n'ont
 * pas changé entre deux rendus du parent (TodoList).
 *
 * Sans React.memo : chaque frappe dans le champ de recherche ou toute
 * autre mise à jour de l'état parent re-rendrait TOUS les TaskItem, même
 * ceux dont les données n'ont pas bougé.
 *
 * IMPORTANT : React.memo ne fonctionne correctement avec les fonctions en
 * props (onToggle, onDelete) QUE si ces fonctions ont une référence stable,
 * c'est-à-dire si elles sont créées avec useCallback dans le composant parent.
 */

import React from 'react';

/**
 * @param {object} task       - L'objet tâche { id, title, completed }
 * @param {function} onToggle - Callback pour basculer le statut de la tâche
 * @param {function} onDelete - Callback pour supprimer la tâche
 */
function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li
      className={`list-group-item px-3 py-3 rounded mb-2 border d-flex justify-content-between align-items-center ${
        task.completed ? 'task-completed' : 'task-item'
      }`}
    >
      {/* Zone cliquable pour basculer le statut de la tâche */}
      <div className="d-flex align-items-center flex-grow-1">
        <div
          className="form-check mb-0 w-100"
          onClick={() => onToggle(task.id)}
          style={{ cursor: 'pointer' }}
        >
          <input
            className="form-check-input me-3 border-secondary"
            type="checkbox"
            readOnly
            checked={task.completed}
            style={{ cursor: 'pointer' }}
            // aria-label pour l'accessibilité (lecteurs d'écran)
            aria-label={`Marquer "${task.title}" comme ${task.completed ? 'non-terminée' : 'terminée'}`}
          />
          <span
            className={`fw-medium ${task.completed ? 'text-muted' : 'text-dark'}`}
            style={{ cursor: 'pointer' }}
          >
            {task.title}
          </span>
        </div>
      </div>

      {/* Bouton de suppression */}
      <button
        onClick={() => onDelete(task.id)}
        className="btn btn-sm btn-outline-danger border-0"
        title={`Supprimer "${task.title}"`}
        aria-label={`Supprimer la tâche "${task.title}"`}
      >
        <i className="bi bi-trash3"></i>
      </button>
    </li>
  );
}

// ─── Mémoïsation du composant ─────────────────────────────────────────────────
// React.memo effectue une comparaison superficielle (shallow comparison) des props.
// Si task, onToggle et onDelete ont les mêmes références qu'au rendu précédent,
// React ignore complètement le rendu de ce composant.
export default React.memo(TaskItem);
