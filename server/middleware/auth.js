/**
 * Middleware d'authentification pour SPARK
 * Gestion JWT et autorisation des rôles
 */

const jwt = require('jsonwebtoken')
const User = require('../models/User')

/**
 * Middleware d'authentification JWT
 */
const authenticate = async (req, res, next) => {
  try {
    // Récupérer le token depuis l'en-tête Authorization ou les cookies
    let token = null
    
    // Vérifier l'en-tête Authorization
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
    
    // Vérifier les cookies si pas de token dans l'en-tête
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token
    }
    
    if (!token) {
      return res.status(401).json({
        error: 'Accès non autorisé',
        message: 'Token d\'authentification requis',
        timestamp: new Date().toISOString()
      })
    }
    
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(decoded.userId).select('-password')
    
    if (!user) {
      return res.status(401).json({
        error: 'Token invalide',
        message: 'Utilisateur non trouvé',
        timestamp: new Date().toISOString()
      })
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Compte désactivé',
        message: 'Votre compte a été désactivé',
        timestamp: new Date().toISOString()
      })
    }
    
    // Ajouter l'utilisateur à la requête
    req.user = user
    next()
    
  } catch (error) {
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
        message: 'Votre session a expiré, veuillez vous reconnecter',
        timestamp: new Date().toISOString()
      })
    }
    
    console.error('Erreur d\'authentification:', error)
    res.status(500).json({
      error: 'Erreur d\'authentification',
      message: 'Une erreur est survenue lors de la vérification du token',
      timestamp: new Date().toISOString()
    })
  }
}

/**
 * Middleware d'authentification optionnelle
 * Ne bloque pas si pas de token, mais ajoute l'utilisateur si présent
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = null
    
    // Vérifier l'en-tête Authorization
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }
    
    // Vérifier les cookies
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token
    }
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.userId).select('-password')
        
        if (user && user.isActive) {
          req.user = user
        }
      } catch (error) {
        // Ignorer les erreurs de token pour l'auth optionnelle
        console.log('Token invalide dans optionalAuth:', error.message)
      }
    }
    
    next()
    
  } catch (error) {
    console.error('Erreur dans optionalAuth:', error)
    next()
  }
}

/**
 * Middleware de vérification des rôles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Accès non autorisé',
        message: 'Authentification requise',
        timestamp: new Date().toISOString()
      })
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Accès interdit',
        message: 'Vous n\'avez pas les permissions nécessaires',
        timestamp: new Date().toISOString()
      })
    }
    
    next()
  }
}

/**
 * Middleware pour vérifier que l'utilisateur est propriétaire de la ressource
 */
const checkOwnership = (resourceUserIdField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Accès non autorisé',
        message: 'Authentification requise',
        timestamp: new Date().toISOString()
      })
    }
    
    // Les administrateurs peuvent accéder à toutes les ressources
    if (req.user.role === 'admin') {
      return next()
    }
    
    // Vérifier que l'utilisateur est propriétaire de la ressource
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField]
    
    if (resourceUserId && resourceUserId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Accès interdit',
        message: 'Vous ne pouvez accéder qu\'à vos propres ressources',
        timestamp: new Date().toISOString()
      })
    }
    
    next()
  }
}

/**
 * Middleware pour vérifier l'email vérifié
 */
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Accès non autorisé',
      message: 'Authentification requise',
      timestamp: new Date().toISOString()
    })
  }
  
  if (!req.user.isEmailVerified) {
    return res.status(403).json({
      error: 'Email non vérifié',
      message: 'Veuillez vérifier votre adresse email avant de continuer',
      timestamp: new Date().toISOString()
    })
  }
  
  next()
}

/**
 * Middleware pour vérifier les permissions RGPD
 */
const checkGDPRConsent = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Accès non autorisé',
      message: 'Authentification requise',
      timestamp: new Date().toISOString()
    })
  }
  
  if (!req.user.gdpr.dataProcessingConsent) {
    return res.status(403).json({
      error: 'Consentement RGPD requis',
      message: 'Vous devez accepter le traitement de vos données personnelles',
      timestamp: new Date().toISOString()
    })
  }
  
  next()
}

/**
 * Middleware pour mettre à jour l'activité de l'utilisateur
 */
const updateUserActivity = async (req, res, next) => {
  if (req.user) {
    try {
      await User.findByIdAndUpdate(req.user._id, {
        lastActivity: new Date()
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'activité:', error)
    }
  }
  next()
}

/**
 * Middleware pour logger les tentatives d'accès
 */
const logAccess = (req, res, next) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.user ? req.user._id : null,
    timestamp: new Date().toISOString()
  }
  
  console.log('🔍 Accès API:', logData)
  next()
}

/**
 * Middleware de validation des tokens spéciaux (email, reset password)
 */
const validateSpecialToken = (tokenType) => {
  return async (req, res, next) => {
    try {
      const token = req.params.token || req.body.token
      
      if (!token) {
        return res.status(400).json({
          error: 'Token manquant',
          message: 'Token requis pour cette opération',
          timestamp: new Date().toISOString()
        })
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      
      if (decoded.type !== tokenType) {
        return res.status(400).json({
          error: 'Token invalide',
          message: 'Type de token incorrect',
          timestamp: new Date().toISOString()
        })
      }
      
      const user = await User.findById(decoded.userId)
      
      if (!user) {
        return res.status(400).json({
          error: 'Utilisateur non trouvé',
          message: 'Token associé à un utilisateur inexistant',
          timestamp: new Date().toISOString()
        })
      }
      
      // Vérifier que le token correspond à celui stocké en base
      if (tokenType === 'email_verification' && user.emailVerificationToken !== token) {
        return res.status(400).json({
          error: 'Token invalide',
          message: 'Token de vérification email invalide',
          timestamp: new Date().toISOString()
        })
      }
      
      if (tokenType === 'password_reset') {
        if (user.passwordResetToken !== token || user.passwordResetExpires < new Date()) {
          return res.status(400).json({
            error: 'Token expiré',
            message: 'Token de réinitialisation expiré ou invalide',
            timestamp: new Date().toISOString()
          })
        }
      }
      
      req.user = user
      req.token = token
      next()
      
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(400).json({
          error: 'Token invalide',
          message: 'Format de token invalide',
          timestamp: new Date().toISOString()
        })
      }
      
      if (error.name === 'TokenExpiredError') {
        return res.status(400).json({
          error: 'Token expiré',
          message: 'Le token a expiré',
          timestamp: new Date().toISOString()
        })
      }
      
      console.error('Erreur de validation du token spécial:', error)
      res.status(500).json({
        error: 'Erreur de validation',
        message: 'Une erreur est survenue lors de la validation du token',
        timestamp: new Date().toISOString()
      })
    }
  }
}

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  checkOwnership,
  requireEmailVerification,
  checkGDPRConsent,
  updateUserActivity,
  logAccess,
  validateSpecialToken
}
