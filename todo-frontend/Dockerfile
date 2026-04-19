FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
# On copie tout (y compris vite.config.js et index.html)
COPY . . 
RUN npm run build

FROM nginx:stable-alpine
# Copie les fichiers statiques buildés
COPY --from=build /app/dist /usr/share/nginx/html
# Remplace la configuration Nginx par défaut par la nôtre :
# celle-ci sert le SPA React ET proxifie /api vers le backend Spring Boot.
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]