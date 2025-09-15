#!/bin/bash

# Script de déploiement pour SPARK E-commerce
echo "🚀 Déploiement de SPARK E-commerce..."

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker d'abord."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord."
    exit 1
fi

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose down

# Construire les images
echo "🔨 Construction des images Docker..."
docker-compose build --no-cache

# Démarrer les services
echo "▶️ Démarrage des services..."
docker-compose up -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 30

# Vérifier le statut des services
echo "📊 Vérification du statut des services..."
docker-compose ps

# Afficher les logs
echo "📝 Logs des services:"
echo "Frontend (Vue.js): http://localhost:5173"
echo "Backend (Node.js): http://localhost:3000"
echo "MongoDB: mongodb://localhost:27017"

echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "🌐 Accédez à l'application :"
echo "   Frontend: http://localhost:5173"
echo "   API: http://localhost:3000/api"
echo "   Health Check: http://localhost:3000/api/health"
echo ""
echo "📋 Commandes utiles :"
echo "   Voir les logs: docker-compose logs -f"
echo "   Arrêter: docker-compose down"
echo "   Redémarrer: docker-compose restart"
echo "   Supprimer tout: docker-compose down -v"
