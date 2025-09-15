#!/bin/bash

# Script de démarrage SPARK E-commerce
echo "🚀 Démarrage de SPARK E-commerce..."

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé. Veuillez installer Node.js d'abord."
    exit 1
fi

# Vérifier que MongoDB est installé
if ! command -v mongod &> /dev/null; then
    print_error "MongoDB n'est pas installé. Veuillez installer MongoDB d'abord."
    exit 1
fi

print_status "Vérification des dépendances..."

# Installer les dépendances si nécessaire
if [ ! -d "server/node_modules" ]; then
    print_status "Installation des dépendances du backend..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    print_status "Installation des dépendances du frontend..."
    cd client && npm install && cd ..
fi

# Créer le fichier .env s'il n'existe pas
if [ ! -f "server/.env" ]; then
    print_status "Création du fichier .env..."
    cp env.production server/.env
    print_warning "N'oubliez pas de configurer vos clés dans server/.env !"
fi

# Démarrer MongoDB
print_status "Démarrage de MongoDB..."
mongod --dbpath /opt/homebrew/var/mongodb &
MONGODB_PID=$!

# Attendre que MongoDB soit prêt
sleep 3

# Démarrer le backend
print_status "Démarrage du backend..."
cd server
npm start &
BACKEND_PID=$!
cd ..

# Attendre que le backend soit prêt
sleep 5

# Démarrer le frontend
print_status "Démarrage du frontend..."
cd client
npm run dev &
FRONTEND_PID=$!
cd ..

# Afficher les informations
echo ""
print_success "SPARK E-commerce est maintenant en cours d'exécution !"
echo ""
echo -e "${BLUE}🌐 Accédez à l'application :${NC}"
echo "   Frontend: http://localhost:5173"
echo "   Backend: http://localhost:3000"
echo "   API: http://localhost:3000/api"
echo "   Health Check: http://localhost:3000/api/health"
echo ""
echo -e "${BLUE}👤 Comptes de test :${NC}"
echo "   Utilisateur: user@test.com / password123"
echo "   Admin: admin@test.com / admin123"
echo ""
echo -e "${BLUE}📋 Pour arrêter les services :${NC}"
echo "   kill $MONGODB_PID $BACKEND_PID $FRONTEND_PID"
echo ""
print_success "Profitez de votre boutique en ligne ! 🛍️"

# Fonction de nettoyage
cleanup() {
    echo ""
    print_status "Arrêt des services..."
    kill $MONGODB_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null
    print_success "Services arrêtés."
    exit 0
}

# Capturer Ctrl+C
trap cleanup INT

# Garder le script en vie
wait
