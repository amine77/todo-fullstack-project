/**
 * Stats.jsx
 * ---------
 * Composant de statistiques de la liste de tâches.
 *
 * CHARGEMENT DIFFÉRÉ (Lazy Loading) :
 * Ce fichier est intentionnellement séparé pour être chargé via React.lazy()
 * depuis TodoList.jsx. Son bundle JavaScript ne sera téléchargé par le navigateur
 * qu'au moment où l'utilisateur clique sur "Afficher les statistiques".
 *
 * Avantage : le bundle initial de l'application est plus léger,
 * ce qui accélère le premier chargement de la page (amélioration LCP/TTI).
 *
 * Pattern : Code Splitting via React.lazy + Suspense (dans TodoList.jsx)
 */

import React from 'react';
import { useTasks } from '../context/TaskContext';

function Stats() {
  // Lecture des tâches depuis le contexte (pas de prop drilling nécessaire)
  const { tasks } = useTasks();

  // ── Calculs dérivés de la liste de tâches ─────────────────────────────────
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  // Calcul du pourcentage de progression (évite la division par zéro)
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="mt-4 p-3 rounded stats-panel">
      <h6 className="fw-bold mb-3 text-muted text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>
        <i className="bi bi-bar-chart-line me-2"></i>Statistiques
      </h6>

      {/* Grille de 3 chiffres clés */}
      <div className="row text-center g-2 mb-3">
        <div className="col-4">
          <div className="stat-box p-2 rounded">
            <div className="fs-4 fw-bold text-primary">{total}</div>
            <div className="small text-muted">Total</div>
          </div>
        </div>
        <div className="col-4">
          <div className="stat-box p-2 rounded">
            <div className="fs-4 fw-bold text-success">{completed}</div>
            <div className="small text-muted">Terminées</div>
          </div>
        </div>
        <div className="col-4">
          <div className="stat-box p-2 rounded">
            <div className="fs-4 fw-bold text-warning">{pending}</div>
            <div className="small text-muted">En cours</div>
          </div>
        </div>
      </div>

      {/* Barre de progression */}
      <div>
        <div className="d-flex justify-content-between mb-1">
          <small className="text-muted">Progression</small>
          <small className="fw-semibold text-primary">{progressPercent}%</small>
        </div>
        <div className="progress" style={{ height: '6px' }}>
          <div
            className="progress-bar"
            role="progressbar"
            style={{
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #4b6cb7 0%, #182848 100%)',
              transition: 'width 0.5s ease',
            }}
            aria-valuenow={progressPercent}
            aria-valuemin="0"
            aria-valuemax="100"
          ></div>
        </div>
      </div>
    </div>
  );
}

export default Stats;
