/**
 * Login.jsx
 * ---------
 * Composant de formulaire de connexion.
 *
 * Responsabilité unique : afficher le formulaire et déléguer la logique
 * d'authentification au AuthContext via le hook useAuth().
 * Ce composant ne contient aucun appel API direct — tout passe par le contexte.
 */

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Login() {
  // État local pour les champs du formulaire (scope limité à ce composant)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Récupération de la méthode login depuis le contexte d'authentification
  const { login } = useAuth();

  /**
   * handleSubmit : intercepte la soumission du formulaire,
   * appelle login() du contexte, et gère les cas d'erreur.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page (comportement HTML natif)
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      // En cas de succès, AuthContext met à jour `token` → App.jsx affiche TodoList
    } catch {
      setError('Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card premium-card p-5" style={{ maxWidth: '400px', width: '100%' }}>

        <div className="text-center mb-4">
          <h1 className="fw-bold fs-3">Connexion</h1>
          <p className="text-muted">Accédez à votre espace Todo</p>
        </div>

        {/* Affichage du message d'erreur si la connexion échoue */}
        {error && (
          <div className="alert alert-danger py-2 small" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="login-username" className="form-label">Nom d'utilisateur</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-person"></i>
              </span>
              <input
                id="login-username"
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Votre identifiant"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="login-password" className="form-label">Mot de passe</label>
            <div className="input-group">
              <span className="input-group-text bg-white">
                <i className="bi bi-lock"></i>
              </span>
              <input
                id="login-password"
                type="password"
                className="form-control border-start-0 ps-0"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2 fw-semibold shadow-sm"
            disabled={loading}
          >
            {loading
              ? <><span className="spinner-border spinner-border-sm me-2" role="status"></span>Connexion…</>
              : <><i className="bi bi-box-arrow-in-right me-2"></i>Se connecter</>
            }
          </button>
        </form>

      </div>
    </div>
  );
}

export default Login;
