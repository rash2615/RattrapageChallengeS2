/**
 * Serveur Express pour SPARK - E-commerce de produits téléphoniques
 * Backend API avec MongoDB, JWT, et conformité RGPD
 */

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

const app = express()

// Configuration du port
const PORT = process.env.PORT || 3000

// Middlewares de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}))

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// Middlewares généraux
app.use(compression())
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limite par IP
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/', limiter)

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/spark', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connexion à MongoDB réussie')
})
.catch((error) => {
  console.error('❌ Erreur de connexion à MongoDB:', error)
  process.exit(1)
})

// Routes API
app.use('/api/auth', require('./routes/auth'))
app.use('/api/products', require('./routes/products'))
app.use('/api/cart', require('./routes/cart'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/payments', require('./routes/payments'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/analytics', require('./routes/analytics'))
app.use('/api/upload', require('./routes/upload'))

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  })
})

// Route pour servir les images uploadées
app.use('/uploads', express.static('uploads'))

// Middleware de gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    message: `La route ${req.method} ${req.originalUrl} n'existe pas`,
    timestamp: new Date().toISOString()
  })
})

// Middleware de gestion des erreurs globales
app.use((error, req, res, next) => {
  console.error('❌ Erreur serveur:', error)
  
  // Erreur de validation Mongoose
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message)
    return res.status(400).json({
      error: 'Erreur de validation',
      details: errors,
      timestamp: new Date().toISOString()
    })
  }
  
  // Erreur de duplication MongoDB
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0]
    return res.status(400).json({
      error: 'Données dupliquées',
      message: `${field} existe déjà`,
      timestamp: new Date().toISOString()
    })
  }
  
  // Erreur JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Token invalide',
      message: 'Token d\'authentification invalide',
      timestamp: new Date().toISOString()
    })
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expiré',
      message: 'Token d\'authentification expiré',
      timestamp: new Date().toISOString()
    })
  }
  
  // Erreur par défaut
  res.status(error.status || 500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'production' 
      ? 'Une erreur inattendue s\'est produite' 
      : error.message,
    timestamp: new Date().toISOString()
  })
})

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur SPARK démarré sur le port ${PORT}`)
  console.log(`📱 E-commerce de produits téléphoniques`)
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
})

// Gestion propre de l'arrêt du serveur
process.on('SIGTERM', () => {
  console.log('🛑 Signal SIGTERM reçu, arrêt du serveur...')
  mongoose.connection.close(() => {
    console.log('✅ Connexion MongoDB fermée')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('🛑 Signal SIGINT reçu, arrêt du serveur...')
  mongoose.connection.close(() => {
    console.log('✅ Connexion MongoDB fermée')
    process.exit(0)
  })
})

module.exports = app
