/**
 * Routes du panier pour SPARK
 * Gestion du panier avec persistance et synchronisation
 */

const express = require('express')
const { body, validationResult } = require('express-validator')
const Cart = require('../models/Cart')
const Product = require('../models/Product')
const { authenticate, optionalAuth } = require('../middleware/auth')

const router = express.Router()

/**
 * GET /api/cart
 * Récupérer le panier de l'utilisateur ou de la session
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    let cart

    if (req.user) {
      // Utilisateur connecté - récupérer le panier utilisateur
      cart = await Cart.findOne({ user: req.user._id })
    } else {
      // Utilisateur anonyme - récupérer le panier de session
      const sessionId = req.headers['x-session-id'] || req.cookies.sessionId
      if (sessionId) {
        cart = await Cart.findOne({ sessionId })
      }
    }

    if (!cart) {
      // Créer un nouveau panier
      cart = new Cart({
        user: req.user ? req.user._id : null,
        sessionId: req.user ? null : (req.headers['x-session-id'] || req.cookies.sessionId)
      })
      await cart.save()
    }

    // Peupler les informations des produits
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name brand category price images specifications stock isActive')
      .lean()

    res.json({
      cart: populatedCart,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération du panier:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération du panier',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * POST /api/cart/items
 * Ajouter un produit au panier
 */
router.post('/items', optionalAuth, [
  body('productId')
    .isMongoId()
    .withMessage('ID de produit invalide'),
  body('quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('La quantité doit être entre 1 et 100'),
  body('size')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('La taille ne peut pas dépasser 50 caractères'),
  body('color')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('La couleur ne peut pas dépasser 50 caractères')
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

    const { productId, quantity, size, color } = req.body

    // Vérifier que le produit existe et est actif
    const product = await Product.findOne({
      _id: productId,
      isActive: true
    })

    if (!product) {
      return res.status(404).json({
        error: 'Produit non trouvé',
        message: 'Le produit demandé n\'existe pas ou n\'est plus disponible',
        timestamp: new Date().toISOString()
      })
    }

    // Vérifier le stock
    if (product.stock < quantity) {
      return res.status(400).json({
        error: 'Stock insuffisant',
        message: `Seulement ${product.stock} unité(s) disponible(s)`,
        timestamp: new Date().toISOString()
      })
    }

    // Récupérer ou créer le panier
    let cart
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id })
      if (!cart) {
        cart = new Cart({ user: req.user._id })
      }
    } else {
      const sessionId = req.headers['x-session-id'] || req.cookies.sessionId
      cart = await Cart.findOne({ sessionId })
      if (!cart) {
        cart = new Cart({ sessionId })
      }
    }

    // Préparer les données du produit pour le panier
    const productData = {
      _id: product._id,
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price,
      image: product.primaryImage?.url || '',
      specifications: product.specifications
    }

    // Ajouter l'article au panier
    await cart.addItem(productData, quantity, { size, color })

    // Peupler les informations des produits
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name brand category price images specifications stock isActive')
      .lean()

    res.json({
      message: 'Produit ajouté au panier',
      cart: populatedCart,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de l\'ajout au panier:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de l\'ajout au panier',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * PUT /api/cart/items/:itemIndex
 * Mettre à jour la quantité d'un article dans le panier
 */
router.put('/items/:itemIndex', optionalAuth, [
  body('quantity')
    .isInt({ min: 0, max: 100 })
    .withMessage('La quantité doit être entre 0 et 100')
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

    const { itemIndex } = req.params
    const { quantity } = req.body

    // Récupérer le panier
    let cart
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id })
    } else {
      const sessionId = req.headers['x-session-id'] || req.cookies.sessionId
      cart = await Cart.findOne({ sessionId })
    }

    if (!cart) {
      return res.status(404).json({
        error: 'Panier non trouvé',
        message: 'Aucun panier trouvé',
        timestamp: new Date().toISOString()
      })
    }

    // Vérifier l'index de l'article
    if (itemIndex < 0 || itemIndex >= cart.items.length) {
      return res.status(400).json({
        error: 'Index invalide',
        message: 'L\'index de l\'article est invalide',
        timestamp: new Date().toISOString()
      })
    }

    // Mettre à jour la quantité
    await cart.updateItemQuantity(parseInt(itemIndex), quantity)

    // Peupler les informations des produits
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name brand category price images specifications stock isActive')
      .lean()

    res.json({
      message: 'Quantité mise à jour',
      cart: populatedCart,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la quantité:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la mise à jour de la quantité',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * DELETE /api/cart/items/:itemIndex
 * Supprimer un article du panier
 */
router.delete('/items/:itemIndex', optionalAuth, async (req, res) => {
  try {
    const { itemIndex } = req.params

    // Récupérer le panier
    let cart
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id })
    } else {
      const sessionId = req.headers['x-session-id'] || req.cookies.sessionId
      cart = await Cart.findOne({ sessionId })
    }

    if (!cart) {
      return res.status(404).json({
        error: 'Panier non trouvé',
        message: 'Aucun panier trouvé',
        timestamp: new Date().toISOString()
      })
    }

    // Vérifier l'index de l'article
    if (itemIndex < 0 || itemIndex >= cart.items.length) {
      return res.status(400).json({
        error: 'Index invalide',
        message: 'L\'index de l\'article est invalide',
        timestamp: new Date().toISOString()
      })
    }

    // Supprimer l'article
    await cart.removeItem(parseInt(itemIndex))

    // Peupler les informations des produits
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name brand category price images specifications stock isActive')
      .lean()

    res.json({
      message: 'Article supprimé du panier',
      cart: populatedCart,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'article:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la suppression de l\'article',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * DELETE /api/cart
 * Vider le panier
 */
router.delete('/', optionalAuth, async (req, res) => {
  try {
    // Récupérer le panier
    let cart
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id })
    } else {
      const sessionId = req.headers['x-session-id'] || req.cookies.sessionId
      cart = await Cart.findOne({ sessionId })
    }

    if (!cart) {
      return res.status(404).json({
        error: 'Panier non trouvé',
        message: 'Aucun panier trouvé',
        timestamp: new Date().toISOString()
      })
    }

    // Vider le panier
    await cart.clear()

    res.json({
      message: 'Panier vidé',
      cart,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors du vidage du panier:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors du vidage du panier',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * POST /api/cart/merge
 * Fusionner le panier de session avec le panier utilisateur
 */
router.post('/merge', authenticate, async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'] || req.cookies.sessionId

    if (!sessionId) {
      return res.status(400).json({
        error: 'Session ID manquant',
        message: 'Aucun panier de session à fusionner',
        timestamp: new Date().toISOString()
      })
    }

    // Récupérer le panier de session
    const sessionCart = await Cart.findOne({ sessionId })
    if (!sessionCart) {
      return res.status(404).json({
        error: 'Panier de session non trouvé',
        message: 'Aucun panier de session trouvé',
        timestamp: new Date().toISOString()
      })
    }

    // Récupérer ou créer le panier utilisateur
    let userCart = await Cart.findOne({ user: req.user._id })
    if (!userCart) {
      userCart = new Cart({ user: req.user._id })
    }

    // Fusionner les paniers
    await userCart.mergeWith(sessionCart)

    // Supprimer le panier de session
    await Cart.findByIdAndDelete(sessionCart._id)

    // Peupler les informations des produits
    const populatedCart = await Cart.findById(userCart._id)
      .populate('items.product', 'name brand category price images specifications stock isActive')
      .lean()

    res.json({
      message: 'Paniers fusionnés avec succès',
      cart: populatedCart,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la fusion des paniers:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la fusion des paniers',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * POST /api/cart/apply-coupon
 * Appliquer un code promo au panier
 */
router.post('/apply-coupon', optionalAuth, [
  body('couponCode')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Le code promo doit contenir entre 3 et 20 caractères')
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

    const { couponCode } = req.body

    // Récupérer le panier
    let cart
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id })
    } else {
      const sessionId = req.headers['x-session-id'] || req.cookies.sessionId
      cart = await Cart.findOne({ sessionId })
    }

    if (!cart) {
      return res.status(404).json({
        error: 'Panier non trouvé',
        message: 'Aucun panier trouvé',
        timestamp: new Date().toISOString()
      })
    }

    // Ici on devrait vérifier le code promo dans une collection dédiée
    // Pour l'instant, on simule une remise de 10%
    const discountAmount = cart.subtotal * 0.1

    await cart.applyCoupon(couponCode, discountAmount, 'Remise de 10%')

    // Peupler les informations des produits
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name brand category price images specifications stock isActive')
      .lean()

    res.json({
      message: 'Code promo appliqué',
      cart: populatedCart,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de l\'application du code promo:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de l\'application du code promo',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * DELETE /api/cart/coupon
 * Supprimer le code promo du panier
 */
router.delete('/coupon', optionalAuth, async (req, res) => {
  try {
    // Récupérer le panier
    let cart
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id })
    } else {
      const sessionId = req.headers['x-session-id'] || req.cookies.sessionId
      cart = await Cart.findOne({ sessionId })
    }

    if (!cart) {
      return res.status(404).json({
        error: 'Panier non trouvé',
        message: 'Aucun panier trouvé',
        timestamp: new Date().toISOString()
      })
    }

    await cart.removeCoupon()

    // Peupler les informations des produits
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name brand category price images specifications stock isActive')
      .lean()

    res.json({
      message: 'Code promo supprimé',
      cart: populatedCart,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la suppression du code promo:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la suppression du code promo',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * POST /api/cart/validate
 * Valider le panier (vérifier la disponibilité des produits)
 */
router.post('/validate', optionalAuth, async (req, res) => {
  try {
    // Récupérer le panier
    let cart
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id })
    } else {
      const sessionId = req.headers['x-session-id'] || req.cookies.sessionId
      cart = await Cart.findOne({ sessionId })
    }

    if (!cart) {
      return res.status(404).json({
        error: 'Panier non trouvé',
        message: 'Aucun panier trouvé',
        timestamp: new Date().toISOString()
      })
    }

    // Vérifier la disponibilité des produits
    const unavailableItems = await cart.checkAvailability()

    res.json({
      isValid: unavailableItems.length === 0,
      unavailableItems,
      cart,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la validation du panier:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la validation du panier',
      timestamp: new Date().toISOString()
    })
  }
})

module.exports = router
