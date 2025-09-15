# SPARK Server - Backend API

Backend API pour SPARK, site e-commerce spécialisé dans les produits téléphoniques.

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+ 
- MongoDB 6+
- npm ou yarn

### Installation
```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Configurer les variables d'environnement dans .env
# (Voir la section Configuration ci-dessous)

# Démarrer le serveur
npm start
```

### Développement
```bash
# Mode développement avec rechargement automatique
npm run dev

# Peupler la base de données avec des données d'exemple
npm run seed
```

## 📁 Structure du projet

```
server/
├── index.js              # Point d'entrée principal
├── start.js              # Script de démarrage
├── models/               # Modèles Mongoose
│   ├── User.js
│   ├── Product.js
│   ├── Order.js
│   └── Cart.js
├── routes/               # Routes API
│   ├── auth.js
│   ├── products.js
│   ├── cart.js
│   ├── orders.js
│   ├── admin.js
│   ├── analytics.js
│   └── upload.js
├── middleware/           # Middlewares personnalisés
│   └── auth.js
├── services/            # Services métier
│   └── emailService.js
├── scripts/             # Scripts utilitaires
│   └── migrate.js
├── uploads/             # Fichiers uploadés
└── logs/               # Fichiers de logs
```

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env` à la racine du dossier `server/` :

```env
# Configuration du serveur
NODE_ENV=development
PORT=5000

# Base de données MongoDB
MONGODB_URI=mongodb://localhost:27017/spark

# JWT Configuration
JWT_SECRET=spark_super_secret_jwt_key_2024_secure_random_string
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=SPARK <noreply@spark.com>

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# RGPD Configuration
GDPR_RETENTION_DAYS=2555
GDPR_CONSENT_REQUIRED=true
```

## 📚 API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/verify-email` - Vérification email
- `POST /api/auth/forgot-password` - Mot de passe oublié
- `POST /api/auth/reset-password` - Réinitialisation mot de passe
- `POST /api/auth/refresh` - Rafraîchir token
- `POST /api/auth/logout` - Déconnexion

### Produits
- `GET /api/products` - Liste des produits
- `GET /api/products/:id` - Détails d'un produit
- `GET /api/products/search` - Recherche de produits
- `GET /api/products/categories` - Liste des catégories

### Panier
- `GET /api/cart` - Récupérer le panier
- `POST /api/cart/add` - Ajouter au panier
- `PUT /api/cart/update` - Modifier le panier
- `DELETE /api/cart/remove` - Supprimer du panier
- `DELETE /api/cart/clear` - Vider le panier

### Commandes
- `GET /api/orders` - Liste des commandes
- `GET /api/orders/:id` - Détails d'une commande
- `POST /api/orders` - Créer une commande
- `PUT /api/orders/:id/status` - Modifier le statut

### Administration
- `GET /api/admin/dashboard` - Tableau de bord
- `GET /api/admin/users` - Gestion des utilisateurs
- `GET /api/admin/products` - Gestion des produits
- `GET /api/admin/orders` - Gestion des commandes

### Analytics
- `GET /api/analytics/revenue` - Données de revenus
- `GET /api/analytics/sales-by-category` - Ventes par catégorie
- `GET /api/analytics/top-products` - Produits les plus vendus
- `GET /api/analytics/customer-metrics` - Métriques clients

### Upload
- `POST /api/upload/images` - Upload d'images
- `POST /api/upload/single` - Upload d'une image
- `DELETE /api/upload/:filename` - Supprimer une image
- `GET /api/upload/list` - Liste des fichiers

## 🗄️ Base de données

### Modèles principaux

#### User
- Informations personnelles
- Authentification (email/password)
- Rôles (user/admin)
- Conformité RGPD

#### Product
- Informations produit
- Images et spécifications
- Compatibilité appareils
- Gestion des stocks

#### Order
- Référence utilisateur
- Produits commandés
- Adresses de facturation/livraison
- Statuts de paiement et livraison

#### Cart
- Panier utilisateur
- Persistance sans authentification
- Gestion des quantités

## 🔒 Sécurité

- **Helmet** : Headers de sécurité
- **CORS** : Configuration des origines autorisées
- **Rate Limiting** : Limitation des requêtes
- **JWT** : Authentification par tokens
- **bcrypt** : Hachage des mots de passe
- **Validation** : Validation des données d'entrée

## 📊 Monitoring

- **Morgan** : Logs des requêtes HTTP
- **Health Check** : `/api/health`
- **Gestion d'erreurs** : Middleware centralisé
- **Logs** : Fichiers de logs dans `/logs`

## 🧪 Tests

```bash
# Lancer les tests
npm test

# Tests en mode watch
npm run test:watch
```

## 🚀 Déploiement

### Production
```bash
# Installer les dépendances de production
npm install --production

# Démarrer le serveur
npm start
```

### Docker (optionnel)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📝 Logs

Les logs sont stockés dans le dossier `logs/` :
- `spark.log` : Logs généraux
- `error.log` : Logs d'erreurs
- `access.log` : Logs d'accès

## 🔧 Maintenance

### Sauvegarde de la base de données
```bash
# MongoDB
mongodump --db spark --out backup/

# Restauration
mongorestore --db spark backup/spark/
```

### Nettoyage des logs
```bash
# Nettoyer les logs anciens
find logs/ -name "*.log" -mtime +30 -delete
```

## 📞 Support

Pour toute question ou problème :
1. Vérifiez les logs dans `/logs`
2. Consultez la documentation API
3. Vérifiez la configuration `.env`

## 📄 Licence

MIT License - Voir le fichier LICENSE pour plus de détails.
