/**
 * Routes des produits pour SPARK
 * Gestion du catalogue de produits téléphoniques
 */

const express = require('express')
const { body, query, validationResult } = require('express-validator')
const Product = require('../models/Product')
const { authenticate, authorize, optionalAuth } = require('../middleware/auth')

const router = express.Router()

/**
 * GET /api/products
 * Récupérer la liste des produits avec filtres et pagination
 */
router.get('/', [
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
  query('brand')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('La marque ne peut pas dépasser 50 caractères'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le prix minimum doit être positif'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Le prix maximum doit être positif'),
  query('inStock')
    .optional()
    .isBoolean()
    .withMessage('inStock doit être un booléen'),
  query('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured doit être un booléen'),
  query('isOnSale')
    .optional()
    .isBoolean()
    .withMessage('isOnSale doit être un booléen'),
  query('sort')
    .optional()
    .isIn(['name', '-name', 'price', '-price', 'createdAt', '-createdAt', 'rating', '-rating'])
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
      brand,
      minPrice,
      maxPrice,
      inStock,
      isFeatured,
      isOnSale,
      sort = '-createdAt'
    } = req.query

    // Construire les filtres
    const filters = { isActive: true }

    if (search) {
      filters.$text = { $search: search }
    }

    if (category) {
      filters.category = category
    }

    if (brand) {
      filters.brand = { $regex: brand, $options: 'i' }
    }

    if (minPrice || maxPrice) {
      filters.price = {}
      if (minPrice) filters.price.$gte = parseFloat(minPrice)
      if (maxPrice) filters.price.$lte = parseFloat(maxPrice)
    }

    if (inStock === 'true') {
      filters.stock = { $gt: 0 }
    }

    if (isFeatured === 'true') {
      filters.isFeatured = true
    }

    if (isOnSale === 'true') {
      filters.isOnSale = true
    }

    // Calculer la pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Construire la requête
    let query = Product.find(filters)

    // Appliquer le tri
    if (sort) {
      query = query.sort(sort)
    }

    // Appliquer la pagination
    query = query.skip(skip).limit(parseInt(limit))

    // Exécuter la requête
    const [products, totalCount] = await Promise.all([
      query.populate('category').lean(),
      Product.countDocuments(filters)
    ])

    // Calculer les informations de pagination
    const totalPages = Math.ceil(totalCount / parseInt(limit))
    const hasNextPage = parseInt(page) < totalPages
    const hasPrevPage = parseInt(page) > 1

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalCount,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      },
      filters: {
        search,
        category,
        brand,
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        inStock: inStock === 'true',
        isFeatured: isFeatured === 'true',
        isOnSale: isOnSale === 'true',
        sort
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération des produits',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * GET /api/products/categories
 * Récupérer les catégories disponibles
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true })
    
    const categoryInfo = {
      chargers: { name: 'Chargeurs', icon: '🔌', description: 'Chargeurs rapides, sans fil et accessoires de charge' },
      cases: { name: 'Coques', icon: '📱', description: 'Coques de protection, étuis et films protecteurs' },
      cables: { name: 'Câbles', icon: '🔗', description: 'Câbles USB-C, Lightning et micro-USB' },
      headphones: { name: 'Écouteurs', icon: '🎧', description: 'Casques, écouteurs Bluetooth et filaires' },
      accessories: { name: 'Accessoires', icon: '📸', description: 'Supports, trépieds, batteries et accessoires photo' }
    }

    const categoriesWithInfo = categories.map(category => ({
      id: category,
      ...categoryInfo[category]
    }))

    res.json({
      categories: categoriesWithInfo,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération des catégories',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * GET /api/products/brands
 * Récupérer les marques disponibles
 */
router.get('/brands', async (req, res) => {
  try {
    const brands = await Product.distinct('brand', { isActive: true })
      .sort({ brand: 1 })

    res.json({
      brands,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des marques:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération des marques',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * GET /api/products/featured
 * Récupérer les produits mis en avant
 */
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8

    const products = await Product.find({
      isActive: true,
      isFeatured: true
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()

    res.json({
      products,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des produits en vedette:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération des produits en vedette',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * GET /api/products/popular
 * Récupérer les produits populaires
 */
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8

    const products = await Product.getPopularProducts(limit)

    res.json({
      products,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des produits populaires:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération des produits populaires',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * GET /api/products/on-sale
 * Récupérer les produits en promotion
 */
router.get('/on-sale', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8

    const products = await Product.find({
      isActive: true,
      isOnSale: true,
      saleEndDate: { $gt: new Date() }
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()

    res.json({
      products,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des produits en promotion:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération des produits en promotion',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * GET /api/products/:id
 * Récupérer un produit par son ID
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true
    }).lean()

    if (!product) {
      return res.status(404).json({
        error: 'Produit non trouvé',
        message: 'Le produit demandé n\'existe pas ou n\'est plus disponible',
        timestamp: new Date().toISOString()
      })
    }

    // Récupérer des produits similaires
    const similarProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isActive: true
    })
    .limit(4)
    .select('name brand price images ratings')
    .lean()

    res.json({
      product,
      similarProducts,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération du produit',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * GET /api/products/slug/:slug
 * Récupérer un produit par son slug
 */
router.get('/slug/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true
    }).lean()

    if (!product) {
      return res.status(404).json({
        error: 'Produit non trouvé',
        message: 'Le produit demandé n\'existe pas ou n\'est plus disponible',
        timestamp: new Date().toISOString()
      })
    }

    res.json({
      product,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération du produit par slug:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération du produit',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * POST /api/products/search
 * Recherche avancée de produits
 */
router.post('/search', [
  body('query')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La requête ne peut pas dépasser 100 caractères'),
  body('filters')
    .optional()
    .isObject()
    .withMessage('Les filtres doivent être un objet'),
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La page doit être un entier positif'),
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100')
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

    const { query, filters = {}, page = 1, limit = 20 } = req.body

    // Construire les filtres de recherche
    const searchFilters = {
      isActive: true,
      ...filters
    }

    // Exécuter la recherche
    const products = await Product.searchProducts(query, searchFilters)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    const totalCount = await Product.countDocuments(searchFilters)

    res.json({
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit
      },
      searchQuery: query,
      filters,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la recherche:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la recherche',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * POST /api/products/:id/view
 * Enregistrer une vue d'un produit (pour les statistiques)
 */
router.post('/:id/view', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    
    if (!product) {
      return res.status(404).json({
        error: 'Produit non trouvé',
        message: 'Le produit demandé n\'existe pas',
        timestamp: new Date().toISOString()
      })
    }

    // Ici on pourrait enregistrer la vue dans une collection séparée
    // ou mettre à jour des statistiques de vue du produit
    // Pour l'instant, on retourne juste un succès

    res.json({
      message: 'Vue enregistrée',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la vue:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de l\'enregistrement de la vue',
      timestamp: new Date().toISOString()
    })
  }
})

// Routes d'administration (nécessitent une authentification admin)
/**
 * POST /api/products
 * Créer un nouveau produit (admin seulement)
 */
router.post('/', authenticate, authorize('admin'), [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Le nom doit contenir entre 3 et 100 caractères'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('La description doit contenir entre 10 et 1000 caractères'),
  body('category')
    .isIn(['chargers', 'cases', 'cables', 'headphones', 'accessories'])
    .withMessage('Catégorie invalide'),
  body('brand')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('La marque doit contenir entre 2 et 50 caractères'),
  body('price')
    .isFloat({ min: 0, max: 10000 })
    .withMessage('Le prix doit être entre 0 et 10000'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Le stock doit être un entier positif')
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

    const productData = req.body
    productData.createdBy = req.user._id

    const product = new Product(productData)
    await product.save()

    res.status(201).json({
      message: 'Produit créé avec succès',
      product,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la création du produit:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la création du produit',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * PUT /api/products/:id
 * Mettre à jour un produit (admin seulement)
 */
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    
    if (!product) {
      return res.status(404).json({
        error: 'Produit non trouvé',
        message: 'Le produit demandé n\'existe pas',
        timestamp: new Date().toISOString()
      })
    }

    // Mettre à jour les champs fournis
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        product[key] = req.body[key]
      }
    })

    product.updatedBy = req.user._id
    await product.save()

    res.json({
      message: 'Produit mis à jour avec succès',
      product,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la mise à jour du produit',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * DELETE /api/products/:id
 * Supprimer un produit (admin seulement)
 */
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    
    if (!product) {
      return res.status(404).json({
        error: 'Produit non trouvé',
        message: 'Le produit demandé n\'existe pas',
        timestamp: new Date().toISOString()
      })
    }

    // Soft delete - désactiver au lieu de supprimer
    product.isActive = false
    product.deletedBy = req.user._id
    product.deletedAt = new Date()
    await product.save()

    res.json({
      message: 'Produit supprimé avec succès',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la suppression du produit',
      timestamp: new Date().toISOString()
    })
  }
})

module.exports = router
