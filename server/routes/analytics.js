/**
 * Routes d'analytics pour SPARK
 * Graphiques et statistiques pour le tableau de bord administrateur
 */

const express = require('express')
const { query, validationResult } = require('express-validator')
const Order = require('../models/Order')
const Product = require('../models/Product')
const User = require('../models/User')
const Cart = require('../models/Cart')
const { authenticate, authorize } = require('../middleware/auth')

const router = express.Router()

// Toutes les routes nécessitent une authentification admin
router.use(authenticate)
router.use(authorize('admin'))

/**
 * GET /api/analytics/revenue
 * Récupérer les données de revenus dans le temps
 */
router.get('/revenue', [
  query('period')
    .optional()
    .isIn(['day', 'week', 'month', 'year'])
    .withMessage('Période invalide'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Date de début invalide'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Date de fin invalide')
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

    const { period = 'month', startDate, endDate } = req.query

    // Définir les dates par défaut
    let start, end
    if (startDate && endDate) {
      start = new Date(startDate)
      end = new Date(endDate)
    } else {
      end = new Date()
      switch (period) {
        case 'day':
          start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 jours
          break
        case 'week':
          start = new Date(end.getTime() - 12 * 7 * 24 * 60 * 60 * 1000) // 12 semaines
          break
        case 'month':
          start = new Date(end.getTime() - 12 * 30 * 24 * 60 * 60 * 1000) // 12 mois
          break
        case 'year':
          start = new Date(end.getTime() - 5 * 365 * 24 * 60 * 60 * 1000) // 5 ans
          break
      }
    }

    // Construire le groupement selon la période
    let groupBy
    switch (period) {
      case 'day':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        }
        break
      case 'week':
        groupBy = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        }
        break
      case 'month':
        groupBy = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        }
        break
      case 'year':
        groupBy = {
          year: { $year: '$createdAt' }
        }
        break
    }

    const revenueData = await Order.aggregate([
      {
        $match: {
          status: { $in: ['paid', 'processing', 'shipped', 'delivered'] },
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ])

    res.json({
      data: revenueData,
      period,
      startDate: start,
      endDate: end,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des données de revenus:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération des données de revenus',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * GET /api/analytics/sales-by-category
 * Récupérer les ventes par catégorie
 */
router.get('/sales-by-category', [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Date de début invalide'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Date de fin invalide')
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

    const { startDate, endDate } = req.query

    // Construire le filtre de date
    const dateFilter = {}
    if (startDate || endDate) {
      dateFilter.createdAt = {}
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate)
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate)
    }

    const salesByCategory = await Order.aggregate([
      { $match: { status: { $in: ['paid', 'processing', 'shipped', 'delivered'] }, ...dateFilter } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.category',
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          totalQuantity: { $sum: '$items.quantity' },
          orders: { $addToSet: '$_id' }
        }
      },
      {
        $project: {
          category: '$_id',
          totalRevenue: 1,
          totalQuantity: 1,
          orderCount: { $size: '$orders' }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ])

    // Ajouter les informations des catégories
    const categoryInfo = {
      chargers: { name: 'Chargeurs', color: '#3b82f6' },
      cases: { name: 'Coques', color: '#ef4444' },
      cables: { name: 'Câbles', color: '#10b981' },
      headphones: { name: 'Écouteurs', color: '#f59e0b' },
      accessories: { name: 'Accessoires', color: '#8b5cf6' }
    }

    const enrichedData = salesByCategory.map(item => ({
      ...item,
      ...categoryInfo[item.category]
    }))

    res.json({
      data: enrichedData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des ventes par catégorie:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération des ventes par catégorie',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * GET /api/analytics/top-products
 * Récupérer les produits les plus vendus
 */
router.get('/top-products', [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('La limite doit être entre 1 et 50'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Date de début invalide'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Date de fin invalide')
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

    const { limit = 10, startDate, endDate } = req.query

    // Construire le filtre de date
    const dateFilter = {}
    if (startDate || endDate) {
      dateFilter.createdAt = {}
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate)
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate)
    }

    const topProducts = await Order.aggregate([
      { $match: { status: { $in: ['paid', 'processing', 'shipped', 'delivered'] }, ...dateFilter } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          brand: { $first: '$items.brand' },
          category: { $first: '$items.category' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          totalQuantity: { $sum: '$items.quantity' },
          averagePrice: { $avg: '$items.price' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: parseInt(limit) }
    ])

    res.json({
      data: topProducts,
      limit: parseInt(limit),
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des produits les plus vendus:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération des produits les plus vendus',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * GET /api/analytics/customer-metrics
 * Récupérer les métriques clients
 */
router.get('/customer-metrics', [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Date de début invalide'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Date de fin invalide')
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

    const { startDate, endDate } = req.query

    // Construire le filtre de date
    const dateFilter = {}
    if (startDate || endDate) {
      dateFilter.createdAt = {}
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate)
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate)
    }

    // Nouveaux clients
    const newCustomers = await User.countDocuments({
      createdAt: dateFilter.createdAt || { $exists: true }
    })

    // Clients actifs (ayant passé au moins une commande)
    const activeCustomers = await User.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $match: {
          'orders.createdAt': dateFilter.createdAt || { $exists: true }
        }
      },
      { $count: 'activeCustomers' }
    ])

    // Valeur moyenne des paniers
    const averageCartValue = await Cart.aggregate([
      { $match: { total: { $gt: 0 } } },
      { $group: { _id: null, averageValue: { $avg: '$total' } } }
    ])

    // Taux de conversion (commandes / paniers)
    const conversionData = await Promise.all([
      Cart.countDocuments({ total: { $gt: 0 } }),
      Order.countDocuments({ ...dateFilter })
    ])

    const conversionRate = conversionData[0] > 0 ? (conversionData[1] / conversionData[0]) * 100 : 0

    res.json({
      newCustomers,
      activeCustomers: activeCustomers[0]?.activeCustomers || 0,
      averageCartValue: averageCartValue[0]?.averageValue || 0,
      conversionRate: Math.round(conversionRate * 100) / 100,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des métriques clients:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération des métriques clients',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * GET /api/analytics/orders-timeline
 * Récupérer la timeline des commandes
 */
router.get('/orders-timeline', [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Date de début invalide'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Date de fin invalide'),
  query('groupBy')
    .optional()
    .isIn(['hour', 'day', 'week', 'month'])
    .withMessage('Groupement invalide')
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

    const { startDate, endDate, groupBy = 'day' } = req.query

    // Construire le filtre de date
    const dateFilter = {}
    if (startDate || endDate) {
      dateFilter.createdAt = {}
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate)
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate)
    }

    // Construire le groupement
    let group
    switch (groupBy) {
      case 'hour':
        group = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' }
        }
        break
      case 'day':
        group = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        }
        break
      case 'week':
        group = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' }
        }
        break
      case 'month':
        group = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        }
        break
    }

    const timelineData = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: group,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' },
          statusBreakdown: {
            $push: {
              status: '$status',
              revenue: '$total'
            }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1, '_id.week': 1 } }
    ])

    res.json({
      data: timelineData,
      groupBy,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Erreur lors de la récupération de la timeline des commandes:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de la récupération de la timeline des commandes',
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * GET /api/analytics/export
 * Exporter les données analytics en CSV
 */
router.get('/export', [
  query('type')
    .isIn(['revenue', 'products', 'customers', 'orders'])
    .withMessage('Type d\'export invalide'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Date de début invalide'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Date de fin invalide')
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

    const { type, startDate, endDate } = req.query

    // Construire le filtre de date
    const dateFilter = {}
    if (startDate || endDate) {
      dateFilter.createdAt = {}
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate)
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate)
    }

    let csvData = ''
    let filename = ''

    switch (type) {
      case 'revenue':
        const revenueData = await Order.aggregate([
          { $match: { status: { $in: ['paid', 'processing', 'shipped', 'delivered'] }, ...dateFilter } },
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

        csvData = 'Mois,Revenus,Commandes\n'
        csvData += revenueData.map(item => 
          `${item._id.year}-${String(item._id.month).padStart(2, '0')},${item.revenue},${item.orders}`
        ).join('\n')
        filename = 'revenus.csv'
        break

      case 'products':
        const productsData = await Product.find({ isActive: true })
          .select('name brand category price stock sales.totalSold')
          .lean()

        csvData = 'Nom,Marque,Catégorie,Prix,Stock,Ventes\n'
        csvData += productsData.map(product => 
          `"${product.name}","${product.brand}","${product.category}",${product.price},${product.stock},${product.sales?.totalSold || 0}`
        ).join('\n')
        filename = 'produits.csv'
        break

      case 'customers':
        const customersData = await User.find()
          .select('firstName lastName email role isActive createdAt')
          .lean()

        csvData = 'Prénom,Nom,Email,Rôle,Actif,Date d\'inscription\n'
        csvData += customersData.map(user => 
          `"${user.firstName}","${user.lastName}","${user.email}","${user.role}",${user.isActive},"${user.createdAt.toISOString()}"`
        ).join('\n')
        filename = 'clients.csv'
        break

      case 'orders':
        const ordersData = await Order.find(dateFilter)
          .populate('user', 'firstName lastName email')
          .select('orderNumber user total status paymentStatus createdAt')
          .lean()

        csvData = 'Numéro,Client,Total,Statut,Paiement,Date\n'
        csvData += ordersData.map(order => 
          `"${order.orderNumber}","${order.user.firstName} ${order.user.lastName}","${order.total}","${order.status}","${order.paymentStatus}","${order.createdAt.toISOString()}"`
        ).join('\n')
        filename = 'commandes.csv'
        break
    }

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(csvData)

  } catch (error) {
    console.error('Erreur lors de l\'export des données:', error)
    res.status(500).json({
      error: 'Erreur serveur',
      message: 'Une erreur est survenue lors de l\'export des données',
      timestamp: new Date().toISOString()
    })
  }
})

module.exports = router
