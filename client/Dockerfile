# Dockerfile pour le frontend Vue.js
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Construire l'application
RUN npm run build

# Installer serve pour servir les fichiers statiques
RUN npm install -g serve

# Exposer le port
EXPOSE 5173

# Commande de démarrage
CMD ["serve", "-s", "dist", "-l", "5173"]
