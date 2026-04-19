import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  server: {
    // Indispensable pour Docker : permet d'accéder au serveur depuis l'extérieur du conteneur
    host: true, 
    port: 5173,
    // Configuration du Proxy pour éviter les erreurs CORS lors du développement local.
    // - En local (npm run dev) : Vite intercepte /api et le redirige vers le backend sur le port 8080.
    // - En production (Docker) : Vite n'est pas utilisé, c'est Nginx qui sert les fichiers statiques
    //   et le proxy applicatif est géré ailleurs.
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Backend Spring Boot exposé sur le port 8080
        changeOrigin: true, // Réécrit l'en-tête Host pour correspondre à la cible
        secure: false,      // Accepte les certificats auto-signés (si HTTPS local)
      }
    }
  },
  build: {
    // Dossier de sortie (utilisé par le Dockerfile pour Nginx)
    outDir: 'dist',
  }
})