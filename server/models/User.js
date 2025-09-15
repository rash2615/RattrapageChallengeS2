/**
 * Modèle User pour SPARK - Conformité RGPD
 * Gestion des données personnelles avec droits d'accès et suppression
 */

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
  // Informations personnelles
  firstName: {
    type: String,
    required: [true, 'Le prénom est obligatoire'],
    trim: true,
    maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
  },
  lastName: {
    type: String,
    required: [true, 'Le nom est obligatoire'],
    trim: true,
    maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est obligatoire'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire'],
    minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères'],
    select: false // Ne pas inclure par défaut dans les requêtes
  },
  
  // Rôle et statut
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // Tokens d'authentification
  emailVerificationToken: {
    type: String,
    select: false
  },
  passwordResetToken: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  },
  
  // Adresses (conformité RGPD - données structurées)
  addresses: [{
    type: {
      type: String,
      enum: ['billing', 'shipping'],
      required: true
    },
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    postalCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'France'
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  
  // Préférences utilisateur (conformité RGPD)
  preferences: {
    newsletter: {
      type: Boolean,
      default: false
    },
    marketing: {
      type: Boolean,
      default: false
    },
    cookies: {
      type: Boolean,
      default: false
    },
    analytics: {
      type: Boolean,
      default: false
    }
  },
  
  // Métadonnées RGPD
  gdpr: {
    consentDate: {
      type: Date,
      default: Date.now
    },
    dataProcessingConsent: {
      type: Boolean,
      default: false
    },
    marketingConsent: {
      type: Boolean,
      default: false
    },
    analyticsConsent: {
      type: Boolean,
      default: false
    },
    lastDataExport: Date,
    dataRetentionUntil: {
      type: Date,
      default: function() {
        // Conservation des données pendant 3 ans après la dernière activité
        return new Date(Date.now() + 3 * 365 * 24 * 60 * 60 * 1000)
      }
    }
  },
  
  // Statistiques (anonymisées)
  stats: {
    totalOrders: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    lastOrderDate: Date
  },
  
  // Timestamps
  lastLogin: Date,
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Index pour les performances
userSchema.index({ email: 1 })
userSchema.index({ role: 1 })
userSchema.index({ isActive: 1 })
userSchema.index({ 'gdpr.dataRetentionUntil': 1 })

// Virtual pour le nom complet
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`
})

// Middleware de hashage du mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  // Ne hasher que si le mot de passe a été modifié
  if (!this.isModified('password')) return next()
  
  try {
    // Hashage avec un salt de 12 rounds
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Méthode pour vérifier le mot de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Méthode pour générer un token JWT
userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      userId: this._id,
      email: this.email,
      role: this.role
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  )
}

// Méthode pour générer un token de vérification email
userSchema.methods.generateEmailVerificationToken = function() {
  const token = jwt.sign(
    { userId: this._id, type: 'email_verification' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  )
  this.emailVerificationToken = token
  return token
}

// Méthode pour générer un token de réinitialisation de mot de passe
userSchema.methods.generatePasswordResetToken = function() {
  const token = jwt.sign(
    { userId: this._id, type: 'password_reset' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  )
  this.passwordResetToken = token
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000 // 1 heure
  return token
}

// Méthode pour anonymiser les données (conformité RGPD)
userSchema.methods.anonymizeData = function() {
  this.firstName = 'Utilisateur'
  this.lastName = 'Supprimé'
  this.email = `deleted_${this._id}@spark.com`
  this.password = 'anonymized'
  this.addresses = []
  this.preferences = {
    newsletter: false,
    marketing: false,
    cookies: false,
    analytics: false
  }
  this.gdpr.dataProcessingConsent = false
  this.gdpr.marketingConsent = false
  this.gdpr.analyticsConsent = false
  this.isActive = false
  this.isEmailVerified = false
  this.emailVerificationToken = undefined
  this.passwordResetToken = undefined
  this.passwordResetExpires = undefined
  this.lastLogin = undefined
  this.lastActivity = new Date()
  
  return this
}

// Méthode pour exporter les données personnelles (conformité RGPD)
userSchema.methods.exportPersonalData = function() {
  return {
    personalInfo: {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      role: this.role,
      createdAt: this.createdAt,
      lastLogin: this.lastLogin
    },
    addresses: this.addresses,
    preferences: this.preferences,
    stats: this.stats,
    gdpr: {
      consentDate: this.gdpr.consentDate,
      dataProcessingConsent: this.gdpr.dataProcessingConsent,
      marketingConsent: this.gdpr.marketingConsent,
      analyticsConsent: this.gdpr.analyticsConsent
    }
  }
}

// Méthode statique pour trouver un utilisateur par email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() })
}

// Méthode statique pour trouver des utilisateurs inactifs (nettoyage RGPD)
userSchema.statics.findInactiveUsers = function() {
  const threeYearsAgo = new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000)
  return this.find({
    lastActivity: { $lt: threeYearsAgo },
    'gdpr.dataRetentionUntil': { $lt: new Date() }
  })
}

// Middleware pour mettre à jour lastActivity
userSchema.pre('findOneAndUpdate', function() {
  this.set({ lastActivity: new Date() })
})

// Validation personnalisée pour les adresses
userSchema.pre('save', function(next) {
  // Vérifier qu'il n'y a qu'une seule adresse par défaut par type
  const addresses = this.addresses
  const billingDefaults = addresses.filter(addr => addr.type === 'billing' && addr.isDefault)
  const shippingDefaults = addresses.filter(addr => addr.type === 'shipping' && addr.isDefault)
  
  if (billingDefaults.length > 1) {
    return next(new Error('Une seule adresse de facturation par défaut autorisée'))
  }
  
  if (shippingDefaults.length > 1) {
    return next(new Error('Une seule adresse de livraison par défaut autorisée'))
  }
  
  next()
})

module.exports = mongoose.model('User', userSchema)
