/**
 * AuthContext.jsx
 * ---------------
 * Contexte d'authentification de l'application.
 *
 * Rôle : centraliser l'état lié à la session utilisateur (token JWT)
 * et exposer les méthodes login/logout à tous les composants enfants,
 * sans avoir à passer ces données en props à chaque niveau (prop drilling).
 *
 * Pattern : Context API (React.createContext + Provider + custom hook)
 */

import React, { createContext, useContext, useState } from 'react';
import { login as apiLogin } from '../api/api';

// ─── 1. Création du contexte ─────────────────────────────────────────────────
// createContext() retourne un objet { Provider, Consumer }.
// La valeur par défaut (null) est utilisée uniquement si un composant
// consomme le contexte sans être enveloppé dans le Provider.
const AuthContext = createContext(null);

// ─── 2. Provider ─────────────────────────────────────────────────────────────
/**
 * AuthProvider enveloppe l'arbre de composants qui ont besoin d'accéder
 * à l'état d'authentification. Il gère :
 *   - le token JWT (persisté dans localStorage)
 *   - la fonction login (appel API + mise à jour de l'état)
 *   - la fonction logout (nettoyage du token)
 */
export function AuthProvider({ children }) {
  // Initialisation depuis localStorage : si un token existe déjà
  // (rechargement de page), l'utilisateur reste connecté.
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  /**
   * login : appelle l'API d'authentification, persiste le token JWT
   * dans localStorage et met à jour l'état React.
   * @param {string} username
   * @param {string} password
   * @throws {Error} si les identifiants sont incorrects (rejeté par l'API)
   */
  const login = async (username, password) => {
    const res = await apiLogin(username, password);
    const jwt = res.data.token;
    localStorage.setItem('token', jwt);
    setToken(jwt);
  };

  /**
   * logout : supprime le token JWT du localStorage et réinitialise l'état.
   * Cela provoque un re-rendu de App.jsx qui réaffiche la page de connexion.
   */
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // La valeur exposée aux consommateurs du contexte
  const contextValue = { token, login, logout };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── 3. Custom Hook ───────────────────────────────────────────────────────────
/**
 * useAuth : hook personnalisé pour consommer le contexte d'authentification.
 * Évite d'avoir à importer AuthContext dans chaque composant consommateur.
 *
 * Usage :
 *   const { token, login, logout } = useAuth();
 */
export function useAuth() {
  return useContext(AuthContext);
}
