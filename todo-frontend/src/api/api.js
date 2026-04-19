import axios from 'axios';

// URL de base de l'API.
// On utilise un chemin RELATIF ('/api') plutôt qu'une URL absolue pour deux raisons :
//   1. En développement (npm run dev) : Vite intercepte /api/* et y applique son proxy
//      (configuré dans vite.config.js) → redirige vers http://localhost:8080. Cela évite
//      les erreurs CORS car la requête part du serveur Vite, pas du navigateur.
//   2. En production (Docker / Nginx) : Nginx intercepte /api/* et le proxifie vers
//      http://backend:8080 (configuré dans nginx.conf). Le navigateur ne voit que
//      des requêtes vers la même origine, sans problème CORS.
const API_URL = '/api';

// Instance Axios configurée avec l'URL de base
const api = axios.create({
    baseURL: API_URL,
});

// Intercepteur pour ajouter le Token JWT à chaque requête
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = (username, password) => api.post('/auth/login', { username, password });
export const getTasks = () => api.get('/tasks');
export const createTask = (title) => api.post('/tasks', title, {
    headers: { 'Content-Type': 'text/plain' }
});
export const toggleTask = (id) => api.put(`/tasks/${id}/toggle`);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);

export default api;