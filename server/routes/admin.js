/**
 * Routes d'administration pour SPARK
 * Gestion des utilisateurs, produits et commandes par les administrateurs
 */

const express = require('express')
const { body, query, validationResult } = require('express-validator')
const User = require('../models/User')
const Product = require('../models/Product')
const Order = require('../models/Order')
const Cart = require('../models/Cart')
const { authenticate, authorize } = require('../middleware/auth')
const emailService = require('../services/emailService')

const router = express.Router()

// Toutes les routes nécessitent une authentification admin
router.use(authenticate)
router.use(authorize('admin'))

/**
 * GET /api/admin/dashboard
 * Récupérer les statistiques du tableau de bord
 */
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    // Statistiques générales
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      lowStockProducts,
      pendingOrders
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $in: ['paid', 'processing', 'shipped', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'firstName lastName email'),
      Product.find({ stock: { $lte: 5 }, isActive: true })
        .select('name stock minStock')
        .limit(10),
      Order.countDocuments({ status: 'pending' })
    ])

    // Revenus par mois (12 derniers mois)
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          status: { $in: ['paid', 'processing', 'shipped', 'delivered'] },
          createdAt: { $gte: new Date(now.getFullYear() - 1, now.getMonth(), 1) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    // Ventes par catégorie
    const salesByCategory = await Order.aggregate([
      { $match: { status: { $in: ['paid', 'processing', 'shipped', 'delivered'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.category',
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          totalQuantity: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ])

    res.json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders,
        lowStockCount: lowStockProducts.length
      },
      charts: {
        monthlyRevenue,
        salesByCategory
      },
      recentOrders,
      lowStockProducts,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération du tableau de bord:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération du tableau de bord',
      timestamp: new Date().toISOString()
    })
  }
})

// === GESTION DES UTILISATEURS ===

/**
 * GET /api/admin/users
 * Récupérer la liste des utilisateurs avec filtres et pagination
 */
router.get('/users', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La page doit être un entier positif'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La recherche ne peut pas dépasser 100 caractères'),
  query('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Rôle invalide'),
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'pending'])
    .withMessage('Statut invalide'),
  query('sort')
    .optional()
    .isIn(['firstName', '-firstName', 'lastName', '-lastName', 'email', '-email', 'createdAt', '-createdAt'])
    .withMessage('Tri invalide')
], async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Paramètres invalides',
        details: errors.array(),
        timestamp: new Date().toISOString()
      })
    }

    const {
      page = 1,
      limit = 20,
      search,
      role,
      status,
      sort = '-createdAt'
    } = req.query

    // Construire les filtres
    const filters = {}

    if (search) {
      filters.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    if (role) {
      filters.role = role
    }

    if (status) {
      switch (status) {
        case 'active':
          filters.isActive = true
          filters.isEmailVerified = true
          break
        case 'inactive':
          filters.isActive = false
          break
        case 'pending':
          filters.isEmailVerified = false
          break
      }
    }

    // Construire la requête
    let query = User.find(filters).select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires')

    // Appliquer le tri
    if (sort) {
      query = query.sort(sort)
    }

    // Appliquer la pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    query = query.skip(skip).limit(parseInt(limit))

    // Exécuter la requête
    const [users, totalCount] = await Promise.all([
      query.lean(),
      User.countDocuments(filters)
    ])

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      },
      filters: {
        search,
        role,
        status,
        sort
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération des utilisateurs',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * GET /api/admin/users/:id
 * Récupérer un utilisateur par son ID
 */
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires')

    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'L\'utilisateur demandé n\'existe pas',
        timestamp: new Date().toISOString()
      })
    }

    // Récupérer les statistiques de l'utilisateur
    const userStats = await Order.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' }
        }
      }
    ])

    res.json({
      user: {
        ...user.toObject(),
        stats: userStats[0] || {
          totalOrders: 0,
          totalSpent: 0,
          averageOrderValue: 0
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération de l\'utilisateur',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * POST /api/admin/users
 * Créer un nouvel utilisateur
 */
router.post('/users', [
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
    .withMessage('Le mot de passe doit contenir au moins 8 caractères'),
  body('role')
    .isIn(['user', 'admin'])
    .withMessage('Rôle invalide'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive doit être un booléen')
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

    const { firstName, lastName, email, password, role, isActive = true } = req.body

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findByEmail(email)
    if (existingUser) {
      return res.status(400).json({
        error: 'Email déjà utilisé',
        message: 'Un compte existe déjà avec cette adresse email',
        timestamp: new Date().toISOString()
      })
    }

    // Créer l'utilisateur
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      isActive,
      isEmailVerified: true, // Les utilisateurs créés par l'admin sont automatiquement vérifiés
      gdpr: {
        dataProcessingConsent: true,
        consentDate: new Date()
      }
    })

    await user.save()

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la création de l\'utilisateur',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * PUT /api/admin/users/:id
 * Mettre à jour un utilisateur
 */
router.put('/users/:id', [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Adresse email invalide'),
  body('role')
    .optional()
    .isIn(['user', 'admin'])
    .withMessage('Rôle invalide'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive doit être un booléen'),
  body('isEmailVerified')
    .optional()
    .isBoolean()
    .withMessage('isEmailVerified doit être un booléen')
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

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'L\'utilisateur demandé n\'existe pas',
        timestamp: new Date().toISOString()
      })
    }

    // Vérifier l'email si modifié
    if (req.body.email && req.body.email !== user.email) {
      const existingUser = await User.findByEmail(req.body.email)
      if (existingUser) {
        return res.status(400).json({
          error: 'Email déjà utilisé',
          message: 'Un autre compte utilise déjà cette adresse email',
          timestamp: new Date().toISOString()
        })
      }
    }

    // Mettre à jour les champs fournis
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        user[key] = req.body[key]
      }
    })

    await user.save()

    res.json({
      message: 'Utilisateur mis à jour avec succès',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la mise à jour de l\'utilisateur',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * DELETE /api/admin/users/:id
 * Supprimer un utilisateur
 */
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'L\'utilisateur demandé n\'existe pas',
        timestamp: new Date().toISOString()
      })
    }

    // Vérifier qu'on ne supprime pas l'utilisateur connecté
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        error: 'Impossible de supprimer',
        message: 'Vous ne pouvez pas supprimer votre propre compte',
        timestamp: new Date().toISOString()
      })
    }

    // Soft delete - désactiver au lieu de supprimer
    user.isActive = false
    user.deletedBy = req.user._id
    user.deletedAt = new Date()
    await user.save()

    res.json({
      message: 'Utilisateur supprimé avec succès',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la suppression de l\'utilisateur',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * POST /api/admin/users/:id/reset-password
 * Réinitialiser le mot de passe d'un utilisateur
 */
router.post('/users/:id/reset-password', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({
        error: 'Utilisateur non trouvé',
        message: 'L\'utilisateur demandé n\'existe pas',
        timestamp: new Date().toISOString()
      })
    }

    // Générer un token de réinitialisation
    const resetToken = user.generatePasswordResetToken()
    await user.save()

    // Envoyer l'email de réinitialisation
    await emailService.sendPasswordReset(user, resetToken)

    res.json({
      message: 'Email de réinitialisation envoyé',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la réinitialisation du mot de passe',
      timestamp: new Date().toISOString()
    })
  }
})

// === GESTION DES PRODUITS ===

/**
 * GET /api/admin/products
 * Récupérer la liste des produits avec filtres et pagination
 */
router.get('/products', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La page doit être un entier positif'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La recherche ne peut pas dépasser 100 caractères'),
  query('category')
    .optional()
    .isIn(['chargers', 'cases', 'cables', 'headphones', 'accessories'])
    .withMessage('Catégorie invalide'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive doit être un booléen'),
  query('sort')
    .optional()
    .isIn(['name', '-name', 'price', '-price', 'createdAt', '-createdAt', 'stock', '-stock'])
    .withMessage('Tri invalide')
], async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Paramètres invalides',
        details: errors.array(),
        timestamp: new Date().toISOString()
      })
    }

    const {
      page = 1,
      limit = 20,
      search,
      category,
      isActive,
      sort = '-createdAt'
    } = req.query

    // Construire les filtres
    const filters = {}

    if (search) {
      filters.$text = { $search: search }
    }

    if (category) {
      filters.category = category
    }

    if (isActive !== undefined) {
      filters.isActive = isActive === 'true'
    }

    // Construire la requête
    let query = Product.find(filters)

    // Appliquer le tri
    if (sort) {
      query = query.sort(sort)
    }

    // Appliquer la pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    query = query.skip(skip).limit(parseInt(limit))

    // Exécuter la requête
    const [products, totalCount] = await Promise.all([
      query.lean(),
      Product.countDocuments(filters)
    ])

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      },
      filters: {
        search,
        category,
        isActive: isActive === 'true',
        sort
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des produits admin:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération des produits',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * GET /api/admin/products/low-stock
 * Récupérer les produits en rupture de stock
 */
router.get('/products/low-stock', async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      $expr: { $lte: ['$stock', '$minStock'] }
    })
    .select('name brand category stock minStock price')
    .sort({ stock: 1 })

    res.json({
      products,
      count: products.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des produits en rupture:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération des produits en rupture',
      timestamp: new Date().toISOString()
    })
  }
})

// === GESTION DES COMMANDES ===

/**
 * GET /api/admin/orders
 * Récupérer toutes les commandes avec filtres et pagination
 */
router.get('/orders', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La page doit être un entier positif'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100'),
  query('status')
    .optional()
    .isIn(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'])
    .withMessage('Statut invalide'),
  query('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'failed', 'refunded', 'partially_refunded'])
    .withMessage('Statut de paiement invalide'),
  query('user')
    .optional()
    .isMongoId()
    .withMessage('ID utilisateur invalide'),
  query('sort')
    .optional()
    .isIn(['createdAt', '-createdAt', 'total', '-total', 'status'])
    .withMessage('Tri invalide')
], async (req, res) => {
  try {
    // Vérifier les erreurs de validation
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Paramètres invalides',
        details: errors.array(),
        timestamp: new Date().toISOString()
      })
    }

    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      user,
      sort = '-createdAt'
    } = req.query

    // Construire les filtres
    const filters = {}

    if (status) {
      filters.status = status
    }

    if (paymentStatus) {
      filters.paymentStatus = paymentStatus
    }

    if (user) {
      filters.user = user
    }

    // Construire la requête
    let query = Order.find(filters)

    // Appliquer le tri
    if (sort) {
      query = query.sort(sort)
    }

    // Appliquer la pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)
    query = query.skip(skip).limit(parseInt(limit))

    // Exécuter la requête
    const [orders, totalCount] = await Promise.all([
      query.populate('user', 'firstName lastName email').lean(),
      Order.countDocuments(filters)
    ])

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      },
      filters: {
        status,
        paymentStatus,
        user,
        sort
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des commandes admin:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération des commandes',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * GET /api/admin/orders/stats
 * Récupérer les statistiques des commandes
 */
router.get('/orders/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    const matchStage = {}
    if (startDate || endDate) {
      matchStage.createdAt = {}
      if (startDate) matchStage.createdAt.$gte = new Date(startDate)
      if (endDate) matchStage.createdAt.$lte = new Date(endDate)
    }

    const stats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
          totalItems: { $sum: '$totalItems' }
        }
      }
    ])

    // Statistiques par statut
    const statusStats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      }
    ])

    res.json({
      stats: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        totalItems: 0
      },
      statusStats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques des commandes:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération des statistiques',
      timestamp: new Date().toISOString()
    })
  }
})

module.exports = router
