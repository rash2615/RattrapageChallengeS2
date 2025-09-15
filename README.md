# ⚡ SPARK - E-commerce de produits téléphoniques

Site e-commerce spécialisé dans la vente de produits téléphoniques : chargeurs, coques, câbles, écouteurs, accessoires...

## 🚀 Technologies utilisées

### Frontend
- **Vue.js 3** avec Composition API (sans librairies externes)
- **Vue Router** pour la navigation
- **Pinia** pour la gestion d'état
- **Vite** pour le build
- **CSS pur** pour le design (sans Bootstrap)
- **Canvas API** pour les graphiques analytics
- **Validation native** des formulaires

### Backend
- **Node.js** avec Express
- **MongoDB** avec Mongoose
- **JWT** pour l'authentification
- **Nodemailer** pour l'envoi d'emails
- **Stripe** pour les paiements
- **Multer** pour l'upload d'images

## 📋 Fonctionnalités

### 👤 Gestion des utilisateurs
- Inscription avec validation email
- Connexion sécurisée
- Réinitialisation de mot de passe
- Profil utilisateur avec adresses

### 🛍️ Catalogue produits
- Recherche et filtres avancés
- Détails produits avec galerie
- Catégories : chargeurs, coques, câbles, écouteurs, accessoires
- Gestion du stock en temps réel

### 🛒 Panier et commandes
- Panier persistant (localStorage + base de données)
- Processus de commande complet
- Paiement sécurisé Stripe
- Suivi des commandes

### 👨‍💼 Administration
- Gestion des utilisateurs
- Gestion des produits et commandes
- Analytics et statistiques
- Tableaux avec tri, recherche, export CSV

### 🔒 Conformité RGPD/EU
- Bannières de cookies
- Politique de confidentialité
- Gestion des données personnelles
- Consentement utilisateur

## 🏗️ Structure du projet

```
SPARK/
├── client/                 # Frontend Vue.js
│   ├── src/
│   │   ├── components/     # Composants réutilisables
│   │   ├── views/          # Pages de l'application
│   │   ├── stores/         # Stores Pinia
│   │   ├── services/       # Services API
│   │   ├── utils/          # Utilitaires (validation, etc.)
│   │   └── router/         # Configuration Vue Router
│   └── package.json
├── server/                 # Backend Node.js
│   ├── models/            # Modèles Mongoose
│   ├── routes/            # Routes API
│   ├── middleware/        # Middlewares
│   ├── services/          # Services métier
│   └── package.json
└── README.md
```

## 🚀 Installation et démarrage

### Prérequis
- Node.js 18+
- MongoDB
- Compte Stripe (pour les paiements)

### Installation
```bash
# Cloner le projet
git clone <repository-url>
cd SPARK

# Installer les dépendances backend
cd server
npm install

# Installer les dépendances frontend
cd ../client
npm install
```

### Configuration
1. Copier `server/.env.example` vers `server/.env`
2. Configurer les variables d'environnement
3. Démarrer MongoDB
4. Lancer les migrations

### Démarrage
```bash
# Backend (port 3000)
cd server
npm run dev

# Frontend (port 5173)
cd client
npm run dev
```

## 📱 Produits disponibles

- **Chargeurs** : Chargeurs rapides, sans fil, voiture
- **Coques** : Coques de protection, étuis, films
- **Câbles** : Câbles USB-C, Lightning, micro-USB
- **Écouteurs** : Casques, écouteurs Bluetooth, filaires
- **Accessoires** : Supports, trépieds, batteries externes

## 🔒 Conformité RGPD

Le site respecte le RGPD avec :
- Bannières de cookies configurables
- Politique de confidentialité claire
- Gestion des données personnelles
- Droit à l'oubli
- Export des données utilisateur

## 📊 Analytics

Tableau de bord administrateur avec :
- Chiffre d'affaires dans le temps
- Répartition des ventes par catégorie
- Valeur moyenne des paniers
- Nombre de nouveaux clients
- Graphiques interactifs

## 🧪 Tests

```bash
# Tests backend
cd server
npm test

# Tests frontend
cd client
npm test
```

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.