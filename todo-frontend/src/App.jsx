/**
 * App.jsx
 * -------
 * Point d'entrée et orchestrateur de l'application.
 *
 * Après refactorisation, ce fichier a un rôle minimaliste :
 *   1. Envelopper l'arbre avec AuthProvider (authentification globale)
 *   2. Lire le `token` depuis le contexte pour décider quelle vue afficher
 *   3. Si connecté : monter TaskProvider + afficher TodoList (chargée en lazy)
 *   4. Si non connecté : afficher le composant Login
 *
 * ────────────────────────────────────────────────────────────────────────────
 * PATTERN — React.lazy + Suspense (Code Splitting)
 * ────────────────────────────────────────────────────────────────────────────
 * TodoList est chargée de manière dynamique. Vite génère un chunk JS séparé
 * pour ce composant. Il n'est téléchargé que lorsque l'utilisateur est
 * authentifié, ce qui allège le bundle initial servi à la page de connexion.
 *
 * Suspense affiche un fallback (spinner) pendant le téléchargement du chunk.
 * ────────────────────────────────────────────────────────────────────────────
 */

import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import Login from './components/Login';

// Chargement différé de la vue principale (lazy loading).
// Le bundle TodoList.jsx + tout ce qu'il importe (TaskItem, etc.)
// est séparé du bundle principal par Vite au moment du build.
const TodoList = lazy(() => import('./components/TodoList'));

// ─── Composant interne : logique de routage conditionnel ─────────────────────
/**
 * AppContent doit être un composant enfant de AuthProvider pour pouvoir
 * utiliser useAuth() (qui appelle useContext(AuthContext) en interne).
 * Si on appelait useAuth() directement dans App, le Provider n'aurait
 * pas encore été monté — cela provoquerait une valeur null.
 */
/**
 * ProtectedRoute : Composant wrapper pour sécuriser l'accès à certaines routes.
 * Si l'utilisateur n'est pas connecté, il est redirigé vers la page de connexion.
 */
function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/**
 * PublicRoute : Redirige vers l'accueil si l'utilisateur est déjà connecté.
 */
function PublicRoute({ children }) {
  const { token } = useAuth();
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppContent() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <TaskProvider>
              <Suspense fallback={
                <div className="d-flex align-items-center justify-content-center min-vh-100">
                  <div className="text-center text-muted">
                    <div className="spinner-border text-primary mb-3" role="status"></div>
                    <p>Chargement de l'application…</p>
                  </div>
                </div>
              }>
                <TodoList />
              </Suspense>
            </TaskProvider>
          </ProtectedRoute>
        }
      />
      {/* Redirection par défaut pour les routes inconnues */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ─── Composant racine ─────────────────────────────────────────────────────────
/**
 * App est le composant racine monté par main.jsx.
 * Il n'a qu'une seule responsabilité : fournir le contexte d'authentification
 * à l'ensemble de l'arbre de composants.
 */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;