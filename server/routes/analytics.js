/**
 * Routes pour les analytics et rapports
 * Endpoints pour l'analyse des données de l'e-commerce
 */

const express = require('express')
const router = express.Router()
const { authenticate: auth, authorize } = require('../middleware/auth')
const {
  calculateDateRange,
  getMainMetrics,
  getChangesMetrics,
  getChartsData,
  getTablesData,
  getRevenueChartData,
  getProductAnalytics,
  getCustomerAnalytics,
  getOrderAnalytics,
  getTopCustomersData,
  getTopProductsData,
  generateExportData,
  generateCSV,
  generateCustomersCSV,
  generateProductsCSV
} = require('../utils/analyticsHelpers')

// Middleware d'authentification et d'autorisation admin
router.use(auth)
router.use(authorize(['admin']))

/**
 * GET /api/analytics
 * Récupère toutes les données d'analytics pour une période donnée
 */
router.get('/', async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query
    
    // Calculer les dates selon la période
    const dateRange = calculateDateRange(period, startDate, endDate)
    
    // Récupérer les métriques principales
    const metrics = await getMainMetrics(dateRange)
    
    // Récupérer les données de changement
    const changes = await getChangesMetrics(dateRange)
    
    // Récupérer les données des graphiques
    const charts = await getChartsData(dateRange)
    
    // Récupérer les données des tableaux
    const tables = await getTablesData(dateRange)
    
    res.json({
      success: true,
      data: {
        metrics,
        changes,
        charts,
        tables
      }
    })
  } catch (error) {
    console.error('Erreur analytics:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des analytics',
      error: error.message
    })
  }
})

/**
 * GET /api/analytics/revenue
 * Récupère les données de revenus pour les graphiques
 */
router.get('/revenue', async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query
    const dateRange = calculateDateRange(period, startDate, endDate)
    
    const revenueData = await getRevenueChartData(dateRange)
    
    res.json({
      success: true,
      data: revenueData
    })
  } catch (error) {
    console.error('Erreur revenue analytics:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des données de revenus',
      error: error.message
    })
  }
})

/**
 * GET /api/analytics/products
 * Récupère les analytics des produits
 */
router.get('/products', async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query
    const dateRange = calculateDateRange(period, startDate, endDate)
    
    const productData = await getProductAnalytics(dateRange)
    
    res.json({
      success: true,
      data: productData
    })
  } catch (error) {
    console.error('Erreur product analytics:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des analytics produits',
      error: error.message
    })
  }
})

/**
 * GET /api/analytics/customers
 * Récupère les analytics des clients
 */
router.get('/customers', async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query
    const dateRange = calculateDateRange(period, startDate, endDate)
    
    const customerData = await getCustomerAnalytics(dateRange)
    
    res.json({
      success: true,
      data: customerData
    })
  } catch (error) {
    console.error('Erreur customer analytics:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des analytics clients',
      error: error.message
    })
  }
})

/**
 * GET /api/analytics/orders
 * Récupère les analytics des commandes
 */
router.get('/orders', async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query
    const dateRange = calculateDateRange(period, startDate, endDate)
    
    const orderData = await getOrderAnalytics(dateRange)
    
    res.json({
      success: true,
      data: orderData
    })
  } catch (error) {
    console.error('Erreur order analytics:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors du chargement des analytics commandes',
      error: error.message
    })
  }
})

/**
 * GET /api/analytics/export
 * Exporte les données d'analytics
 */
router.get('/export', async (req, res) => {
  try {
    const { format = 'csv', period, startDate, endDate } = req.query
    const dateRange = calculateDateRange(period, startDate, endDate)
    
    const exportData = await generateExportData(dateRange)
    
    if (format === 'csv') {
      const csv = generateCSV(exportData)
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${period}-${new Date().toISOString().split('T')[0]}.csv"`)
      res.send(csv)
    } else {
      res.json({
        success: true,
        data: exportData
      })
    }
  } catch (error) {
    console.error('Erreur export analytics:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'export des analytics',
      error: error.message
    })
  }
})

/**
 * GET /api/analytics/export/customers
 * Exporte les données des clients
 */
router.get('/export/customers', async (req, res) => {
  try {
    const { format = 'csv', period, startDate, endDate } = req.query
    const dateRange = calculateDateRange(period, startDate, endDate)
    
    const customers = await getTopCustomersData(dateRange)
    
    if (format === 'csv') {
      const csv = generateCustomersCSV(customers)
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="top-clients-${period}-${new Date().toISOString().split('T')[0]}.csv"`)
      res.send(csv)
    } else {
      res.json({
        success: true,
        data: customers
      })
    }
  } catch (error) {
    console.error('Erreur export customers:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'export des clients',
      error: error.message
    })
  }
})

/**
 * GET /api/analytics/export/products
 * Exporte les données des produits
 */
router.get('/export/products', async (req, res) => {
  try {
    const { format = 'csv', period, startDate, endDate } = req.query
    const dateRange = calculateDateRange(period, startDate, endDate)
    
    const products = await getTopProductsData(dateRange)
    
    if (format === 'csv') {
      const csv = generateProductsCSV(products)
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="top-produits-${period}-${new Date().toISOString().split('T')[0]}.csv"`)
      res.send(csv)
    } else {
      res.json({
        success: true,
        data: products
      })
    }
  } catch (error) {
    console.error('Erreur export products:', error)
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'export des produits',
      error: error.message
    })
  }
})

module.exports = router