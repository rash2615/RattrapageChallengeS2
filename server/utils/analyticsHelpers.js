/**
 * Fonctions utilitaires pour les analytics
 * Logique métier pour l'analyse des données
 */

const Order = require('../models/Order')
const User = require('../models/User')
const Product = require('../models/Product')

/**
 * Calcule la plage de dates selon la période
 */
function calculateDateRange(period, startDate, endDate) {
  const now = new Date()
  let start, end

  if (startDate && endDate) {
    start = new Date(startDate)
    end = new Date(endDate)
  } else {
    switch (period) {
      case '7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        end = now
        break
      case '30d':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        end = now
        break
      case '90d':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        end = now
        break
      case '1y':
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        end = now
        break
      default:
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        end = now
    }
  }

  return { start, end }
}

/**
 * Récupère les métriques principales
 */
async function getMainMetrics(dateRange) {
  const { start, end } = dateRange

  // Chiffre d'affaires total
  const revenueResult = await Order.aggregate([
    {
      $match: {
        status: { $in: ['paid', 'shipped', 'delivered'] },
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' }
      }
    }
  ])

  // Nombre total de commandes
  const totalOrders = await Order.countDocuments({
    status: { $in: ['paid', 'shipped', 'delivered'] },
    createdAt: { $gte: start, $lte: end }
  })

  // Nouveaux clients
  const newCustomers = await User.countDocuments({
    createdAt: { $gte: start, $lte: end }
  })

  // Valeur moyenne du panier
  const cartValueResult = await Order.aggregate([
    {
      $match: {
        status: { $in: ['paid', 'shipped', 'delivered'] },
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: null,
        averageCartValue: { $avg: '$totalAmount' }
      }
    }
  ])

  // Taux de conversion (simulation)
  const totalVisitors = Math.floor(totalOrders * 20) // Estimation
  const conversionRate = totalOrders > 0 ? (totalOrders / totalVisitors) * 100 : 0

  return {
    totalRevenue: revenueResult[0]?.totalRevenue || 0,
    totalOrders,
    newCustomers,
    averageCartValue: cartValueResult[0]?.averageCartValue || 0,
    conversionRate: Math.round(conversionRate * 100) / 100,
    totalVisitors,
    cartAdditions: Math.floor(totalVisitors * 0.75),
    checkoutStarts: Math.floor(totalVisitors * 0.4)
  }
}

/**
 * Récupère les données de changement
 */
async function getChangesMetrics(dateRange) {
  const { start, end } = dateRange
  const previousStart = new Date(start.getTime() - (end.getTime() - start.getTime()))

  // Métriques actuelles
  const currentMetrics = await getMainMetrics(dateRange)
  
  // Métriques précédentes
  const previousMetrics = await getMainMetrics({
    start: previousStart,
    end: start
  })

  // Calculer les changements
  const calculateChange = (current, previous) => {
    if (previous === 0) return { value: 0, type: 'neutral' }
    const change = ((current - previous) / previous) * 100
    return {
      value: Math.round(change * 100) / 100,
      type: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral'
    }
  }

  return {
    revenue: calculateChange(currentMetrics.totalRevenue, previousMetrics.totalRevenue),
    orders: calculateChange(currentMetrics.totalOrders, previousMetrics.totalOrders),
    customers: calculateChange(currentMetrics.newCustomers, previousMetrics.newCustomers),
    cartValue: calculateChange(currentMetrics.averageCartValue, previousMetrics.averageCartValue)
  }
}

/**
 * Récupère les données des graphiques
 */
async function getChartsData(dateRange) {
  const sales = await getRevenueChartData(dateRange)
  const topProducts = await getTopProductsChartData(dateRange)
  const category = await getCategoryChartData(dateRange)
  const cartValue = await getCartValueChartData(dateRange)
  const geographic = await getGeographicChartData(dateRange)
  const hourly = await getHourlyChartData(dateRange)
  const payment = await getPaymentChartData(dateRange)

  return {
    sales,
    topProducts,
    category,
    cartValue,
    geographic,
    hourly,
    payment
  }
}

/**
 * Récupère les données des tableaux
 */
async function getTablesData(dateRange) {
  const topCustomers = await getTopCustomersData(dateRange)
  const topProducts = await getTopProductsData(dateRange)
  const recentOrders = await getRecentOrdersData(dateRange)

  return {
    topCustomers,
    topProducts,
    recentOrders
  }
}

/**
 * Récupère les données de revenus pour les graphiques
 */
async function getRevenueChartData(dateRange) {
  const { start, end } = dateRange
  const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  
  let groupBy, labels = []
  
  if (daysDiff <= 7) {
    // Par jour
    groupBy = {
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' },
      day: { $dayOfMonth: '$createdAt' }
    }
    labels = Array.from({ length: daysDiff }, (_, i) => `J${i + 1}`)
  } else if (daysDiff <= 90) {
    // Par semaine
    groupBy = {
      year: { $year: '$createdAt' },
      week: { $week: '$createdAt' }
    }
    labels = Array.from({ length: Math.ceil(daysDiff / 7) }, (_, i) => `S${i + 1}`)
  } else {
    // Par mois
    groupBy = {
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' }
    }
    labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  }

  const result = await Order.aggregate([
    {
      $match: {
        status: { $in: ['paid', 'shipped', 'delivered'] },
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: groupBy,
        totalRevenue: { $sum: '$totalAmount' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 }
    }
  ])

  const data = new Array(labels.length).fill(0)
  result.forEach(item => {
    let index = 0
    if (daysDiff <= 7) {
      index = item._id.day - new Date(start).getDate()
    } else if (daysDiff <= 90) {
      index = item._id.week - new Date(start).getWeek()
    } else {
      index = item._id.month - 1
    }
    if (index >= 0 && index < data.length) {
      data[index] = item.totalRevenue
    }
  })

  return {
    labels,
    datasets: [{
      data,
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: '#3b82f6',
      borderWidth: 2,
      fill: true
    }]
  }
}

/**
 * Récupère les données des top produits
 */
async function getTopProductsChartData(dateRange) {
  const { start, end } = dateRange

  const result = await Order.aggregate([
    {
      $match: {
        status: { $in: ['paid', 'shipped', 'delivered'] },
        createdAt: { $gte: start, $lte: end }
      }
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $project: {
        name: '$product.name',
        category: '$product.category',
        totalQuantity: 1,
        totalRevenue: 1
      }
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 10 }
  ])

  const labels = result.map(item => item.name)
  const data = result.map(item => item.totalRevenue)
  const colors = labels.map((_, index) => 
    `hsl(${index * 360 / labels.length}, 70%, 50%)`
  )

  return {
    labels,
    datasets: [{
      data,
      backgroundColor: colors
    }]
  }
}

/**
 * Récupère les données des catégories
 */
async function getCategoryChartData(dateRange) {
  const { start, end } = dateRange

  const result = await Order.aggregate([
    {
      $match: {
        status: { $in: ['paid', 'shipped', 'delivered'] },
        createdAt: { $gte: start, $lte: end }
      }
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.category',
        totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
      }
    },
    { $sort: { totalRevenue: -1 } }
  ])

  const labels = result.map(item => item._id)
  const data = result.map(item => item.totalRevenue)
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']

  return {
    labels,
    datasets: [{
      data,
      backgroundColor: colors.slice(0, labels.length)
    }]
  }
}

/**
 * Récupère les données de valeur du panier
 */
async function getCartValueChartData(dateRange) {
  const { start, end } = dateRange
  const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
  
  let groupBy, labels = []
  
  if (daysDiff <= 7) {
    groupBy = {
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' },
      day: { $dayOfMonth: '$createdAt' }
    }
    labels = Array.from({ length: daysDiff }, (_, i) => `J${i + 1}`)
  } else if (daysDiff <= 90) {
    groupBy = {
      year: { $year: '$createdAt' },
      week: { $week: '$createdAt' }
    }
    labels = Array.from({ length: Math.ceil(daysDiff / 7) }, (_, i) => `S${i + 1}`)
  } else {
    groupBy = {
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' }
    }
    labels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  }

  const result = await Order.aggregate([
    {
      $match: {
        status: { $in: ['paid', 'shipped', 'delivered'] },
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: groupBy,
        averageCartValue: { $avg: '$totalAmount' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 }
    }
  ])

  const data = new Array(labels.length).fill(0)
  result.forEach(item => {
    let index = 0
    if (daysDiff <= 7) {
      index = item._id.day - new Date(start).getDate()
    } else if (daysDiff <= 90) {
      index = item._id.week - new Date(start).getWeek()
    } else {
      index = item._id.month - 1
    }
    if (index >= 0 && index < data.length) {
      data[index] = Math.round(item.averageCartValue * 100) / 100
    }
  })

  return {
    labels,
    datasets: [{
      data,
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: '#f59e0b',
      borderWidth: 2,
      fill: true
    }]
  }
}

/**
 * Récupère les données géographiques
 */
async function getGeographicChartData(dateRange) {
  const { start, end } = dateRange

  const result = await Order.aggregate([
    {
      $match: {
        status: { $in: ['paid', 'shipped', 'delivered'] },
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: '$shippingAddress.region',
        totalRevenue: { $sum: '$totalAmount' }
      }
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 5 }
  ])

  const labels = result.map(item => item._id || 'Non spécifié')
  const data = result.map(item => item.totalRevenue)
  const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']

  return {
    labels,
    datasets: [{
      data,
      backgroundColor: colors.slice(0, labels.length)
    }]
  }
}

/**
 * Récupère les données horaires
 */
async function getHourlyChartData(dateRange) {
  const { start, end } = dateRange

  const result = await Order.aggregate([
    {
      $match: {
        status: { $in: ['paid', 'shipped', 'delivered'] },
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: { $hour: '$createdAt' },
        totalOrders: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ])

  const labels = Array.from({ length: 24 }, (_, i) => `${i}h`)
  const data = new Array(24).fill(0)
  
  result.forEach(item => {
    data[item._id] = item.totalOrders
  })

  return {
    labels,
    datasets: [{
      data,
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderColor: '#10b981',
      borderWidth: 2,
      fill: true
    }]
  }
}

/**
 * Récupère les données des méthodes de paiement
 */
async function getPaymentChartData(dateRange) {
  const { start, end } = dateRange

  const result = await Order.aggregate([
    {
      $match: {
        status: { $in: ['paid', 'shipped', 'delivered'] },
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: '$paymentMethod',
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' }
      }
    },
    { $sort: { totalRevenue: -1 } }
  ])

  const labels = result.map(item => item._id)
  const data = result.map(item => item.totalOrders)
  const colors = ['#3b82f6', '#1e40af', '#10b981', '#6b7280']

  return {
    labels,
    datasets: [{
      data,
      backgroundColor: colors.slice(0, labels.length)
    }]
  }
}

/**
 * Récupère les données des top clients
 */
async function getTopCustomersData(dateRange) {
  const { start, end } = dateRange

  const result = await Order.aggregate([
    {
      $match: {
        status: { $in: ['paid', 'shipped', 'delivered'] },
        createdAt: { $gte: start, $lte: end }
      }
    },
    {
      $group: {
        _id: '$user',
        totalSpent: { $sum: '$totalAmount' },
        totalOrders: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        id: '$_id',
        name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
        email: '$user.email',
        totalSpent: 1,
        totalOrders: 1
      }
    },
    { $sort: { totalSpent: -1 } },
    { $limit: 10 }
  ])

  return result
}

/**
 * Récupère les données des top produits
 */
async function getTopProductsData(dateRange) {
  const { start, end } = dateRange

  const result = await Order.aggregate([
    {
      $match: {
        status: { $in: ['paid', 'shipped', 'delivered'] },
        createdAt: { $gte: start, $lte: end }
      }
    },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        totalQuantity: { $sum: '$items.quantity' },
        totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $project: {
        id: '$_id',
        name: '$product.name',
        category: '$product.category',
        totalQuantity: 1,
        totalRevenue: 1
      }
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: 10 }
  ])

  return result
}

/**
 * Récupère les commandes récentes
 */
async function getRecentOrdersData(dateRange) {
  const { start, end } = dateRange

  const result = await Order.find({
    createdAt: { $gte: start, $lte: end }
  })
  .populate('user', 'firstName lastName email')
  .sort({ createdAt: -1 })
  .limit(10)

  return result
}

/**
 * Génère les données d'export
 */
async function generateExportData(dateRange) {
  const metrics = await getMainMetrics(dateRange)
  const changes = await getChangesMetrics(dateRange)
  const charts = await getChartsData(dateRange)
  const tables = await getTablesData(dateRange)

  return {
    period: dateRange,
    metrics,
    changes,
    charts,
    tables,
    exportedAt: new Date()
  }
}

/**
 * Génère un CSV à partir des données
 */
function generateCSV(data) {
  const headers = [
    'Période',
    'Chiffre d\'affaires',
    'Commandes',
    'Nouveaux clients',
    'Panier moyen',
    'Taux de conversion',
    'Visiteurs',
    'Ajouts au panier',
    'Débuts de checkout'
  ]

  const row = [
    `${data.period.start.toISOString().split('T')[0]} - ${data.period.end.toISOString().split('T')[0]}`,
    data.metrics.totalRevenue,
    data.metrics.totalOrders,
    data.metrics.newCustomers,
    data.metrics.averageCartValue,
    data.metrics.conversionRate,
    data.metrics.totalVisitors,
    data.metrics.cartAdditions,
    data.metrics.checkoutStarts
  ]

  return [headers, row].map(row => row.join(',')).join('\n')
}

/**
 * Génère un CSV pour les clients
 */
function generateCustomersCSV(customers) {
  const headers = ['Rang', 'Nom', 'Email', 'Total dépensé', 'Commandes']
  const rows = customers.map((customer, index) => [
    index + 1,
    customer.name,
    customer.email,
    customer.totalSpent,
    customer.totalOrders
  ])

  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

/**
 * Génère un CSV pour les produits
 */
function generateProductsCSV(products) {
  const headers = ['Rang', 'Produit', 'Catégorie', 'Quantité vendue', 'Chiffre d\'affaires']
  const rows = products.map((product, index) => [
    index + 1,
    product.name,
    product.category,
    product.totalQuantity,
    product.totalRevenue
  ])

  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

// Fonctions d'analytics spécialisées
async function getProductAnalytics(dateRange) {
  const topProducts = await getTopProductsChartData(dateRange)
  const categories = await getCategoryChartData(dateRange)
  const topProductsList = await getTopProductsData(dateRange)

  return {
    topProducts,
    categories,
    topProductsList
  }
}

async function getCustomerAnalytics(dateRange) {
  const topCustomers = await getTopCustomersData(dateRange)
  const geographic = await getGeographicChartData(dateRange)

  return {
    topCustomers,
    geographic
  }
}

async function getOrderAnalytics(dateRange) {
  const cartValue = await getCartValueChartData(dateRange)
  const hourly = await getHourlyChartData(dateRange)
  const paymentMethods = await getPaymentChartData(dateRange)
  const recentOrders = await getRecentOrdersData(dateRange)

  return {
    cartValue,
    hourly,
    paymentMethods,
    recentOrders
  }
}

module.exports = {
  calculateDateRange,
  getMainMetrics,
  getChangesMetrics,
  getChartsData,
  getTablesData,
  getRevenueChartData,
  getTopProductsChartData,
  getCategoryChartData,
  getCartValueChartData,
  getGeographicChartData,
  getHourlyChartData,
  getPaymentChartData,
  getTopCustomersData,
  getTopProductsData,
  getRecentOrdersData,
  generateExportData,
  generateCSV,
  generateCustomersCSV,
  generateProductsCSV,
  getProductAnalytics,
  getCustomerAnalytics,
  getOrderAnalytics
}
