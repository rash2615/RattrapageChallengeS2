# Dockerfile pour le backend Node.js
FROM node:18-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Créer le répertoire uploads
RUN mkdir -p uploads

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]
