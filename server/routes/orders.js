/**
 * Routes des commandes pour SPARK
 * Gestion des commandes et du processus de checkout
 */

const express = require('express')
const { body, validationResult } = require('express-validator')
const Order = require('../models/Order')
const Cart = require('../models/Cart')
const Product = require('../models/Product')
const { authenticate, authorize } = require('../middleware/auth')
const emailService = require('../services/emailService')

const router = express.Router()

/**
 * GET /api/orders
 * Récupérer les commandes de l'utilisateur connecté
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sort = '-createdAt'
    } = req.query

    // Construire les filtres
    const filters = { user: req.user._id }
    if (status) {
      filters.status = status
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
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération des commandes',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * GET /api/orders/:id
 * Récupérer une commande par son ID
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('user', 'firstName lastName email')

    if (!order) {
      return res.status(404).json({
        error: 'Commande non trouvée',
        message: 'La commande demandée n\'existe pas ou ne vous appartient pas',
        timestamp: new Date().toISOString()
      })
    }

    res.json({
      order,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération de la commande',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * POST /api/orders/create
 * Créer une nouvelle commande depuis le panier
 */
router.post('/create', authenticate, [
  body('billingAddress.street')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('L\'adresse de facturation doit contenir entre 5 et 100 caractères'),
  body('billingAddress.city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('La ville de facturation doit contenir entre 2 et 50 caractères'),
  body('billingAddress.postalCode')
    .trim()
    .isLength({ min: 5, max: 10 })
    .withMessage('Le code postal de facturation doit contenir entre 5 et 10 caractères'),
  body('billingAddress.country')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le pays de facturation doit contenir entre 2 et 50 caractères'),
  body('shippingAddress.street')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('L\'adresse de livraison doit contenir entre 5 et 100 caractères'),
  body('shippingAddress.city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('La ville de livraison doit contenir entre 2 et 50 caractères'),
  body('shippingAddress.postalCode')
    .trim()
    .isLength({ min: 5, max: 10 })
    .withMessage('Le code postal de livraison doit contenir entre 5 et 10 caractères'),
  body('shippingAddress.country')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le pays de livraison doit contenir entre 2 et 50 caractères'),
  body('paymentMethod')
    .isIn(['stripe', 'paypal', 'bank_transfer'])
    .withMessage('Méthode de paiement invalide')
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

    const { billingAddress, shippingAddress, paymentMethod, notes } = req.body

    // Récupérer le panier de l'utilisateur
    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        error: 'Panier vide',
        message: 'Votre panier est vide',
        timestamp: new Date().toISOString()
      })
    }

    // Vérifier la disponibilité des produits
    const unavailableItems = await cart.checkAvailability()
    if (unavailableItems.length > 0) {
      return res.status(400).json({
        error: 'Produits indisponibles',
        message: 'Certains produits ne sont plus disponibles',
        unavailableItems,
        timestamp: new Date().toISOString()
      })
    }

    // Créer la commande
    const order = new Order({
      user: req.user._id,
      items: cart.items.map(item => ({
        product: item.product,
        name: item.name,
        brand: item.brand,
        category: item.category,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: item.image,
        specifications: item.specifications
      })),
      billingAddress,
      shippingAddress,
      paymentMethod,
      notes,
      subtotal: cart.subtotal,
      shippingCost: cart.shippingCost,
      tax: cart.tax,
      discount: cart.discount,
      total: cart.total,
      couponCode: cart.couponCode,
      discountReason: cart.discountReason,
      gdpr: {
        dataProcessingConsent: req.user.gdpr.dataProcessingConsent,
        marketingConsent: req.user.gdpr.marketingConsent
      }
    })

    await order.save()

    // Mettre à jour le stock des produits
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
        $set: { lastSold: new Date() }
      })
    }

    // Vider le panier
    await cart.clear()

    // Envoyer l'email de confirmation
    await emailService.sendOrderConfirmation(order)

    res.status(201).json({
      message: 'Commande créée avec succès',
      order,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la création de la commande',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * POST /api/orders/:id/cancel
 * Annuler une commande
 */
router.post('/:id/cancel', authenticate, [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La raison ne peut pas dépasser 500 caractères')
], async (req, res) => {
  try {
    const { reason } = req.body

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    })

    if (!order) {
      return res.status(404).json({
        error: 'Commande non trouvée',
        message: 'La commande demandée n\'existe pas ou ne vous appartient pas',
        timestamp: new Date().toISOString()
      })
    }

    // Vérifier si la commande peut être annulée
    if (order.status === 'delivered') {
      return res.status(400).json({
        error: 'Commande non annulable',
        message: 'Cette commande a déjà été livrée et ne peut pas être annulée',
        timestamp: new Date().toISOString()
      })
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({
        error: 'Commande déjà annulée',
        message: 'Cette commande a déjà été annulée',
        timestamp: new Date().toISOString()
      })
    }

    // Annuler la commande
    await order.cancel(reason)

    // Restaurer le stock des produits
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      })
    }

    res.json({
      message: 'Commande annulée avec succès',
      order,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de l\'annulation de la commande:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de l\'annulation de la commande',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * POST /api/orders/:id/pay
 * Marquer une commande comme payée (simulation)
 */
router.post('/:id/pay', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id
    })

    if (!order) {
      return res.status(404).json({
        error: 'Commande non trouvée',
        message: 'La commande demandée n\'existe pas ou ne vous appartient pas',
        timestamp: new Date().toISOString()
      })
    }

    if (order.status !== 'pending') {
      return res.status(400).json({
        error: 'Commande non payable',
        message: 'Cette commande ne peut pas être payée',
        timestamp: new Date().toISOString()
      })
    }

    // Marquer comme payée
    await order.updateStatus('paid')

    res.json({
      message: 'Paiement confirmé',
      order,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors du paiement:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors du paiement',
      timestamp: new Date().toISOString()
    })
  }
})

// Routes d'administration (nécessitent une authentification admin)
/**
 * GET /api/orders/admin/all
 * Récupérer toutes les commandes (admin seulement)
 */
router.get('/admin/all', authenticate, authorize('admin'), async (req, res) => {
  try {
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
    if (status) filters.status = status
    if (paymentStatus) filters.paymentStatus = paymentStatus
    if (user) filters.user = user

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
 * GET /api/orders/admin/:id
 * Récupérer une commande par son ID (admin seulement)
 */
router.get('/admin/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email')

    if (!order) {
      return res.status(404).json({
        error: 'Commande non trouvée',
        message: 'La commande demandée n\'existe pas',
        timestamp: new Date().toISOString()
      })
    }

    res.json({
      order,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération de la commande admin:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération de la commande',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * PUT /api/orders/admin/:id/status
 * Mettre à jour le statut d'une commande (admin seulement)
 */
router.put('/admin/:id/status', authenticate, authorize('admin'), [
  body('status')
    .isIn(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'])
    .withMessage('Statut invalide'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Les notes ne peuvent pas dépasser 500 caractères')
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

    const { status, notes } = req.body

    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({
        error: 'Commande non trouvée',
        message: 'La commande demandée n\'existe pas',
        timestamp: new Date().toISOString()
      })
    }

    // Mettre à jour le statut
    await order.updateStatus(status, notes)

    // Envoyer un email de notification si nécessaire
    if (['shipped', 'delivered'].includes(status)) {
      await emailService.sendOrderStatusUpdate(order, status)
    }

    res.json({
      message: 'Statut mis à jour avec succès',
      order,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la mise à jour du statut',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * POST /api/orders/admin/:id/tracking
 * Ajouter un numéro de suivi (admin seulement)
 */
router.post('/admin/:id/tracking', authenticate, authorize('admin'), [
  body('trackingNumber')
    .trim()
    .isLength({ min: 5, max: 50 })
    .withMessage('Le numéro de suivi doit contenir entre 5 et 50 caractères'),
  body('carrier')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le transporteur doit contenir entre 2 et 50 caractères'),
  body('trackingUrl')
    .optional()
    .isURL()
    .withMessage('L\'URL de suivi doit être valide')
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

    const { trackingNumber, carrier, trackingUrl } = req.body

    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({
        error: 'Commande non trouvée',
        message: 'La commande demandée n\'existe pas',
        timestamp: new Date().toISOString()
      })
    }

    // Ajouter le numéro de suivi
    await order.addTracking(trackingNumber, carrier, trackingUrl)

    // Envoyer un email de notification
    await emailService.sendOrderStatusUpdate(order, 'shipped')

    res.json({
      message: 'Numéro de suivi ajouté avec succès',
      order,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de l\'ajout du numéro de suivi:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de l\'ajout du numéro de suivi',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * GET /api/orders/admin/stats
 * Récupérer les statistiques des commandes (admin seulement)
 */
router.get('/admin/stats', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    const stats = await Order.getOrderStats(startDate, endDate)

    res.json({
      stats: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        totalItems: 0
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération des statistiques',
      timestamp: new Date().toISOString()
    })
  }
})

module.exports = router
