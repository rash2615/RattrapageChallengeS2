#!/usr/bin/env node

/**
 * Script de démarrage pour SPARK Server
 * Vérifie les prérequis et démarre le serveur
 */

const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')

console.log('🚀 Démarrage de SPARK Server...')

// Vérifier si le fichier .env existe
const envPath = path.join(__dirname, '.env')
if (!fs.existsSync(envPath)) {
  console.log('⚠️  Fichier .env non trouvé, création d\'un fichier d\'exemple...')
  
  const envExample = `# Configuration du serveur SPARK
NODE_ENV=development
PORT=5000

# Base de données MongoDB
MONGODB_URI=mongodb://localhost:27017/spark

# JWT Configuration
JWT_SECRET=spark_super_secret_jwt_key_2024_secure_random_string
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration (Nodemailer)
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
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox

# RGPD Configuration
GDPR_RETENTION_DAYS=2555
GDPR_CONSENT_REQUIRED=true

# Analytics Configuration
ANALYTICS_ENABLED=true
ANALYTICS_RETENTION_DAYS=365

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=spark_session_secret_2024_secure_random_string

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/spark.log`

  fs.writeFileSync(envPath, envExample)
  console.log('✅ Fichier .env.example créé')
  console.log('📝 Veuillez configurer vos variables d\'environnement dans le fichier .env')
}

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log('✅ Dossier uploads créé')
}

// Créer le dossier logs s'il n'existe pas
const logsDir = path.join(__dirname, 'logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
  console.log('✅ Dossier logs créé')
}

// Démarrer le serveur
console.log('🔄 Démarrage du serveur...')

const server = spawn('node', ['index.js'], {
  stdio: 'inherit',
  cwd: __dirname
})

server.on('error', (error) => {
  console.error('❌ Erreur lors du démarrage du serveur:', error)
  process.exit(1)
})

server.on('close', (code) => {
  console.log(`🛑 Serveur arrêté avec le code ${code}`)
  process.exit(code)
})

// Gestion des signaux de fermeture
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...')
  server.kill('SIGINT')
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du serveur...')
  server.kill('SIGTERM')
})
