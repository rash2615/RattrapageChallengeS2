# 🚀 Guide de Déploiement - SPARK E-commerce

## 📋 Prérequis

### Logiciels requis
- **Docker** (version 20.10+)
- **Docker Compose** (version 2.0+)
- **Git** (pour cloner le projet)

### Services externes (optionnels)
- **Stripe** (pour les paiements)
- **PayPal** (pour les paiements)
- **Gmail SMTP** (pour les emails)

## 🛠️ Installation

### 1. Cloner le projet
```bash
git clone <votre-repo>
cd Rattrapage
```

### 2. Configuration des variables d'environnement

Copiez le fichier `env.production` vers `.env` et configurez vos clés :

```bash
cp env.production .env
```

Éditez le fichier `.env` avec vos vraies clés :

```env
# Base de données (déjà configurée pour Docker)
MONGODB_URI=mongodb://admin:spark123@mongodb:27017/spark?authSource=admin

# JWT (changez ces clés en production)
JWT_SECRET=votre-cle-jwt-secrete
JWT_REFRESH_SECRET=votre-cle-refresh-secrete

# Email (configurez avec vos identifiants Gmail)
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-application

# Stripe (obtenez vos clés sur https://stripe.com)
STRIPE_SECRET_KEY=sk_test_votre_cle_stripe
STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique_stripe

# PayPal (obtenez vos clés sur https://developer.paypal.com)
PAYPAL_CLIENT_ID=votre_client_id_paypal
PAYPAL_CLIENT_SECRET=votre_client_secret_paypal
```

### 3. Déploiement avec Docker

#### Option A : Script automatique
```bash
./deploy.sh
```

#### Option B : Commandes manuelles
```bash
# Construire les images
docker-compose build

# Démarrer les services
docker-compose up -d

# Vérifier le statut
docker-compose ps
```

## 🌐 Accès à l'application

Une fois déployée, l'application sera accessible sur :

- **Frontend (Vue.js)** : http://localhost:5173
- **Backend API** : http://localhost:3000/api
- **Health Check** : http://localhost:3000/api/health
- **MongoDB** : mongodb://localhost:27017

## 📊 Gestion des services

### Voir les logs
```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Arrêter les services
```bash
# Arrêt simple
docker-compose down

# Arrêt avec suppression des volumes
docker-compose down -v
```

### Redémarrer un service
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Mise à jour du code
```bash
# Arrêter les services
docker-compose down

# Reconstruire les images
docker-compose build --no-cache

# Redémarrer
docker-compose up -d
```

## 🗄️ Base de données

### Accès à MongoDB
```bash
# Via Docker
docker exec -it spark-mongodb mongosh -u admin -p spark123

# Via client externe
mongodb://admin:spark123@localhost:27017/spark?authSource=admin
```

### Sauvegarde
```bash
# Créer une sauvegarde
docker exec spark-mongodb mongodump --uri="mongodb://admin:spark123@localhost:27017/spark?authSource=admin" --out=/backup

# Copier la sauvegarde
docker cp spark-mongodb:/backup ./backup
```

### Restauration
```bash
# Copier la sauvegarde dans le conteneur
docker cp ./backup spark-mongodb:/backup

# Restaurer
docker exec spark-mongodb mongorestore --uri="mongodb://admin:spark123@localhost:27017/spark?authSource=admin" /backup/spark
```

## 🔧 Configuration avancée

### Variables d'environnement importantes

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `MONGODB_URI` | URL de connexion MongoDB | `mongodb://admin:spark123@mongodb:27017/spark` |
| `JWT_SECRET` | Clé secrète JWT | **À changer en production** |
| `EMAIL_USER` | Email pour l'envoi de notifications | **À configurer** |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe | **À configurer** |
| `PAYPAL_CLIENT_ID` | ID client PayPal | **À configurer** |

### Ports utilisés

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 5173 | Interface utilisateur Vue.js |
| Backend | 3000 | API Node.js |
| MongoDB | 27017 | Base de données |

## 🚨 Dépannage

### Problèmes courants

#### 1. Erreur de connexion à la base de données
```bash
# Vérifier que MongoDB est démarré
docker-compose ps mongodb

# Redémarrer MongoDB
docker-compose restart mongodb
```

#### 2. Erreur CORS
Vérifiez que `CORS_ORIGIN` dans `.env` correspond à l'URL du frontend.

#### 3. Erreur d'email
Vérifiez vos identifiants Gmail et activez l'authentification à 2 facteurs avec un mot de passe d'application.

#### 4. Erreur de paiement
Vérifiez que vos clés Stripe/PayPal sont correctes et que vous utilisez les clés de test.

### Logs détaillés
```bash
# Logs avec timestamps
docker-compose logs -f --timestamps

# Logs des 100 dernières lignes
docker-compose logs --tail=100
```

## 📈 Monitoring

### Vérification de l'état des services
```bash
# Statut des conteneurs
docker-compose ps

# Utilisation des ressources
docker stats

# Espace disque
docker system df
```

### Health Check
```bash
# Vérifier l'API
curl http://localhost:3000/api/health

# Réponse attendue
{
  "status": "OK",
  "timestamp": "2024-12-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0"
}
```

## 🔒 Sécurité

### Recommandations pour la production

1. **Changez toutes les clés par défaut** dans `.env`
2. **Utilisez HTTPS** en production
3. **Configurez un firewall** pour limiter l'accès aux ports
4. **Sauvegardez régulièrement** la base de données
5. **Surveillez les logs** pour détecter les anomalies
6. **Mettez à jour** régulièrement les images Docker

### Variables sensibles à sécuriser
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `EMAIL_PASS`
- `STRIPE_SECRET_KEY`
- `PAYPAL_CLIENT_SECRET`

## 📞 Support

En cas de problème :

1. Vérifiez les logs : `docker-compose logs -f`
2. Consultez ce guide de déploiement
3. Vérifiez la configuration des variables d'environnement
4. Redémarrez les services : `docker-compose restart`

## 🎉 Félicitations !

Votre application SPARK E-commerce est maintenant déployée et fonctionnelle !

- **Frontend** : http://localhost:5173
- **API** : http://localhost:3000/api
- **Admin** : http://localhost:5173/admin (après connexion)

Profitez de votre boutique en ligne ! 🛍️
