/**
 * Routes d'authentification pour SPARK
 * Inscription, connexion, vérification email, réinitialisation mot de passe
 */

const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const emailService = require('../services/emailService')
const { authenticate, validateSpecialToken } = require('../middleware/auth')

const router = express.Router()

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
router.post('/register', [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Adresse email invalide'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Les mots de passe ne correspondent pas')
      }
      return true
    })
], async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array(),
        timestamp: new Date().toISOString()
      })
    }

    const { firstName, lastName, email, password, gdprConsent } = req.body

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findByEmail(email)
    if (existingUser) {
      return res.status(400).json({
        error: 'Email déjà utilisé',
        message: 'Un compte existe déjà avec cette adresse email',
        timestamp: new Date().toISOString()
      })
    }

    // Vérifier le consentement RGPD
    if (!gdprConsent) {
      return res.status(400).json({
        error: 'Consentement RGPD requis',
        message: 'Vous devez accepter le traitement de vos données personnelles',
        timestamp: new Date().toISOString()
      })
    }

    // Créer l'utilisateur
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      gdpr: {
        dataProcessingConsent: gdprConsent,
        consentDate: new Date()
      }
    })

    // Générer le token de vérification email
    const verificationToken = user.generateEmailVerificationToken()
    await user.save()

    // Envoyer l'email de vérification
    await emailService.sendEmailVerification(user, verificationToken)

    // Générer le token d'authentification
    const authToken = user.generateAuthToken()

    // Définir le cookie de session
    res.cookie('token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    })

    res.status(201).json({
      message: 'Compte créé avec succès',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        role: user.role
      },
      token: authToken,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la création du compte',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur
 */
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Adresse email invalide'),
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
], async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array(),
        timestamp: new Date().toISOString()
      })
    }

    const { email, password } = req.body

    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.findByEmail(email).select('+password')
    if (!user) {
      return res.status(401).json({
        error: 'Identifiants invalides',
        message: 'Email ou mot de passe incorrect',
        timestamp: new Date().toISOString()
      })
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Identifiants invalides',
        message: 'Email ou mot de passe incorrect',
        timestamp: new Date().toISOString()
      })
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({
        error: 'Compte désactivé',
        message: 'Votre compte a été désactivé',
        timestamp: new Date().toISOString()
      })
    }

    // Mettre à jour la dernière connexion
    user.lastLogin = new Date()
    user.lastActivity = new Date()
    await user.save()

    // Générer le token d'authentification
    const authToken = user.generateAuthToken()

    // Définir le cookie de session
    res.cookie('token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    })

    res.json({
      message: 'Connexion réussie',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        role: user.role
      },
      token: authToken,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la connexion',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * POST /api/auth/logout
 * Déconnexion d'un utilisateur
 */
router.post('/logout', (req, res) => {
  // Supprimer le cookie de session
  res.clearCookie('token')
  
  res.json({
    message: 'Déconnexion réussie',
    timestamp: new Date().toISOString()
  })
})

/**
 * GET /api/auth/me
 * Récupérer les informations de l'utilisateur connecté
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires')

    res.json({
      user,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération du profil',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * POST /api/auth/verify-email
 * Vérifier l'adresse email avec le token
 */
router.post('/verify-email', validateSpecialToken('email_verification'), async (req, res) => {
  try {
    const user = req.user

    if (user.isEmailVerified) {
      return res.status(400).json({
        error: 'Email déjà vérifié',
        message: 'Cette adresse email est déjà vérifiée',
        timestamp: new Date().toISOString()
      })
    }

    // Marquer l'email comme vérifié
    user.isEmailVerified = true
    user.emailVerificationToken = undefined
    await user.save()

    // Envoyer l'email de bienvenue
    await emailService.sendWelcomeEmail(user)

    res.json({
      message: 'Email vérifié avec succès',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        role: user.role
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la vérification email:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la vérification de l\'email',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * POST /api/auth/resend-verification
 * Renvoyer l'email de vérification
 */
router.post('/resend-verification', authenticate, async (req, res) => {
  try {
    const user = req.user

    if (user.isEmailVerified) {
      return res.status(400).json({
        error: 'Email déjà vérifié',
        message: 'Cette adresse email est déjà vérifiée',
        timestamp: new Date().toISOString()
      })
    }

    // Générer un nouveau token de vérification
    const verificationToken = user.generateEmailVerificationToken()
    await user.save()

    // Envoyer l'email de vérification
    await emailService.sendEmailVerification(user, verificationToken)

    res.json({
      message: 'Email de vérification renvoyé',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors du renvoi de vérification:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors du renvoi de l\'email de vérification',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * POST /api/auth/forgot-password
 * Demander la réinitialisation du mot de passe
 */
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Adresse email invalide')
], async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array(),
        timestamp: new Date().toISOString()
      })
    }

    const { email } = req.body

    // Vérifier si l'utilisateur existe
    const user = await User.findByEmail(email)
    if (!user) {
      // Ne pas révéler si l'email existe ou non pour des raisons de sécurité
      return res.json({
        message: 'Si cette adresse email existe, vous recevrez un email de réinitialisation',
        timestamp: new Date().toISOString()
      })
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.json({
        message: 'Si cette adresse email existe, vous recevrez un email de réinitialisation',
        timestamp: new Date().toISOString()
      })
    }

    // Générer le token de réinitialisation
    const resetToken = user.generatePasswordResetToken()
    await user.save()

    // Envoyer l'email de réinitialisation
    await emailService.sendPasswordReset(user, resetToken)

    res.json({
      message: 'Si cette adresse email existe, vous recevrez un email de réinitialisation',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la demande de réinitialisation',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * POST /api/auth/reset-password
 * Réinitialiser le mot de passe avec le token
 */
router.post('/reset-password', [
  validateSpecialToken('password_reset'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Les mots de passe ne correspondent pas')
      }
      return true
    })
], async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array(),
        timestamp: new Date().toISOString()
      })
    }

    const { password } = req.body
    const user = req.user

    // Mettre à jour le mot de passe
    user.password = password
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    res.json({
      message: 'Mot de passe réinitialisé avec succès',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la réinitialisation du mot de passe',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * PUT /api/auth/profile
 * Mettre à jour le profil utilisateur
 */
router.put('/profile', authenticate, [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères')
], async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array(),
        timestamp: new Date().toISOString()
      })
    }

    const { firstName, lastName } = req.body
    const user = req.user

    // Mettre à jour les champs fournis
    if (firstName) user.firstName = firstName
    if (lastName) user.lastName = lastName

    await user.save()

    res.json({
      message: 'Profil mis à jour avec succès',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        role: user.role
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la mise à jour du profil',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * POST /api/auth/change-password
 * Changer le mot de passe (utilisateur connecté)
 */
router.post('/change-password', authenticate, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Le mot de passe actuel est requis'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Le nouveau mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le nouveau mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Les mots de passe ne correspondent pas')
      }
      return true
    })
], async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array(),
        timestamp: new Date().toISOString()
      })
    }

    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user._id).select('+password')

    // Vérifier le mot de passe actuel
    const isCurrentPasswordValid = await user.comparePassword(currentPassword)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Mot de passe actuel incorrect',
        message: 'Le mot de passe actuel fourni est incorrect',
        timestamp: new Date().toISOString()
      })
    }

    // Mettre à jour le mot de passe
    user.password = newPassword
    await user.save()

    res.json({
      message: 'Mot de passe modifié avec succès',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors du changement de mot de passe',
      timestamp: new Date().toISOString()
    })
  }
})

module.exports = router
