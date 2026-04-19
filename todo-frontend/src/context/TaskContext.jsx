/**
 * TaskContext.jsx
 * ---------------
 * Contexte de gestion des tâches (Todo items).
 *
 * Rôle : extraire toute la logique métier liée aux tâches hors de App.jsx
 * pour la centraliser ici. Les composants peuvent ainsi lire et modifier
 * les tâches sans prop drilling, et sans que App.jsx ne soit surchargé.
 *
 * Opérations exposées :
 *   - fetchTasks  : charge la liste depuis l'API
 *   - addTask     : crée une nouvelle tâche
 *   - toggleTask  : bascule l'état complété/non-complété
 *   - deleteTask  : supprime une tâche
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getTasks, createTask, toggleTask, deleteTask } from '../api/api';
import { useAuth } from './AuthContext';

// ─── 1. Création du contexte ─────────────────────────────────────────────────
const TaskContext = createContext(null);

// ─── 2. Provider ─────────────────────────────────────────────────────────────
/**
 * TaskProvider gère l'état de la liste de tâches et expose les actions CRUD.
 * Il est monté uniquement quand l'utilisateur est connecté (voir App.jsx),
 * ce qui garantit que toutes les requêtes API sont authentifiées.
 */
export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const { logout } = useAuth(); // Pour déconnecter si le token expire (403)

  /**
   * fetchTasks : récupère les tâches depuis l'API et met à jour l'état.
   * Enveloppé dans useCallback pour que sa référence soit stable :
   * cela évite des boucles d'effet infini si d'autres hooks en dépendent.
   */
  const fetchTasks = useCallback(async () => {
    try {
      const response = await getTasks();
      setTasks(response.data);
    } catch (err) {
      // Si le serveur répond 403, le token est invalide ou expiré → déconnexion
      if (err.response?.status === 403) logout();
    }
  }, [logout]);

  // Chargement initial des tâches dès que le provider est monté.
  // fetchTasks est stable grâce à useCallback, donc l'effet ne se déclenchera
  // qu'une seule fois (équivalent à un componentDidMount).
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /**
   * addTask : envoie un POST vers l'API, puis rafraîchit la liste.
   * @param {string} title - Le titre de la nouvelle tâche
   */
  const addTask = async (title) => {
    if (!title.trim()) return; // Garde-fou : ne pas créer une tâche vide
    await createTask(title);
    fetchTasks(); // Resynchronisation avec la source de vérité (le serveur)
  };

  /**
   * toggleTask : bascule le statut complété d'une tâche (PUT /tasks/:id/toggle).
   * @param {number|string} id - L'identifiant de la tâche
   */
  const handleToggleTask = async (id) => {
    await toggleTask(id);
    fetchTasks();
  };

  /**
   * deleteTask : supprime une tâche (DELETE /tasks/:id).
   * @param {number|string} id - L'identifiant de la tâche
   */
  const handleDeleteTask = async (id) => {
    await deleteTask(id);
    fetchTasks();
  };

  // Valeur exposée : données + actions
  const contextValue = {
    tasks,
    fetchTasks,
    addTask,
    toggleTask: handleToggleTask,
    deleteTask: handleDeleteTask,
  };

  return (
    <TaskContext.Provider value={contextValue}>
      {children}
    </TaskContext.Provider>
  );
}

// ─── 3. Custom Hook ───────────────────────────────────────────────────────────
/**
 * useTasks : hook personnalisé pour consommer le contexte des tâches.
 *
 * Usage :
 *   const { tasks, addTask, toggleTask, deleteTask } = useTasks();
 */
export function useTasks() {
  return useContext(TaskContext);
}
