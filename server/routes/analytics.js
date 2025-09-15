const express = require('express');
const { query, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Helper function pour obtenir les dates de début et fin selon la période
const getDateRange = (period) => {
  const now = new Date();
  let startDate;

  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { startDate, endDate: now };
};

// @route   GET /api/analytics/revenue
// @desc    Obtenir le chiffre d'affaires dans le temps
// @access  Private (Admin)
router.get('/revenue', adminAuth, [
  query('period').isIn(['day', 'week', 'month', 'year']).withMessage('Période invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period } = req.query;
    const { startDate, endDate } = getDateRange(period);

    // Agrégation pour obtenir le chiffre d'affaires par période
    const revenueData = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: period === 'day' ? '%Y-%m-%d' : 
                     period === 'week' ? '%Y-W%U' :
                     period === 'month' ? '%Y-%m' : '%Y',
              date: '$createdAt'
            }
          },
          totalRevenue: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Calculer le total général
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalOrders = revenueData.reduce((sum, item) => sum + item.orderCount, 0);

    res.json({
      period,
      data: revenueData,
      summary: {
        totalRevenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      }
    });

  } catch (error) {
    console.error('Erreur analytics revenue:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/analytics/sales-by-category
// @desc    Obtenir la répartition des ventes par catégorie
// @access  Private (Admin)
router.get('/sales-by-category', adminAuth, [
  query('period').optional().isIn(['day', 'week', 'month', 'year'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period } = req.query;
    let matchCondition = { paymentStatus: 'paid' };

    if (period) {
      const { startDate, endDate } = getDateRange(period);
      matchCondition.createdAt = { $gte: startDate, $lte: endDate };
    }

    const categoryData = await Order.aggregate([
      { $match: matchCondition },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          totalSales: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          totalQuantity: { $sum: '$items.quantity' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalSales: -1 }
      }
    ]);

    const totalSales = categoryData.reduce((sum, item) => sum + item.totalSales, 0);

    // Ajouter les pourcentages
    const dataWithPercentages = categoryData.map(item => ({
      ...item,
      percentage: totalSales > 0 ? (item.totalSales / totalSales) * 100 : 0
    }));

    res.json({
      data: dataWithPercentages,
      totalSales,
      categoryCount: categoryData.length
    });

  } catch (error) {
    console.error('Erreur analytics categories:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/analytics/top-products
// @desc    Obtenir les produits les plus vendus
// @access  Private (Admin)
router.get('/top-products', adminAuth, [
  query('period').optional().isIn(['day', 'week', 'month', 'year']),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period, limit = 10 } = req.query;
    let matchCondition = { paymentStatus: 'paid' };

    if (period) {
      const { startDate, endDate } = getDateRange(period);
      matchCondition.createdAt = { $gte: startDate, $lte: endDate };
    }

    const topProducts = await Order.aggregate([
      { $match: matchCondition },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$product.name' },
          productCategory: { $first: '$product.category' },
          productBrand: { $first: '$product.brand' },
          totalSales: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          totalQuantity: { $sum: '$items.quantity' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalSales: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.json({
      data: topProducts,
      limit: parseInt(limit)
    });

  } catch (error) {
    console.error('Erreur analytics top products:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/analytics/customer-metrics
// @desc    Obtenir les métriques clients
// @access  Private (Admin)
router.get('/customer-metrics', adminAuth, [
  query('period').optional().isIn(['day', 'week', 'month', 'year'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period } = req.query;
    let dateFilter = {};

    if (period) {
      const { startDate, endDate } = getDateRange(period);
      dateFilter = { $gte: startDate, $lte: endDate };
    }

    // Nouveaux clients
    const newCustomers = await User.countDocuments({
      createdAt: dateFilter
    });

    // Clients actifs (ayant passé au moins une commande)
    const activeCustomers = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        }
      },
      {
        $group: {
          _id: '$user'
        }
      },
      {
        $count: 'activeCustomers'
      }
    ]);

    // Valeur moyenne des paniers
    const averageOrderValue = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        }
      },
      {
        $group: {
          _id: null,
          averageValue: { $avg: '$total' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // Clients par statut de commande
    const customersByOrderStatus = await Order.aggregate([
      {
        $match: {
          ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
        }
      },
      {
        $group: {
          _id: '$paymentStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      newCustomers,
      activeCustomers: activeCustomers[0]?.activeCustomers || 0,
      averageOrderValue: averageOrderValue[0]?.averageValue || 0,
      totalOrders: averageOrderValue[0]?.totalOrders || 0,
      customersByOrderStatus
    });

  } catch (error) {
    console.error('Erreur analytics customers:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/analytics/dashboard
// @desc    Obtenir toutes les métriques du dashboard
// @access  Private (Admin)
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Chiffre d'affaires du mois actuel
    const currentMonthRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Chiffre d'affaires du mois dernier
    const lastMonthRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Nouveaux clients ce mois
    const newCustomersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Produits en stock faible
    const lowStockProducts = await Product.countDocuments({
      stock: { $lt: 10 },
      isActive: true
    });

    // Commandes en attente
    const pendingOrders = await Order.countDocuments({
      status: { $in: ['pending', 'processing'] }
    });

    const currentRevenue = currentMonthRevenue[0]?.total || 0;
    const lastRevenue = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

    res.json({
      revenue: {
        current: currentRevenue,
        lastMonth: lastRevenue,
        growth: revenueGrowth
      },
      orders: {
        currentMonth: currentMonthRevenue[0]?.count || 0,
        lastMonth: lastMonthRevenue[0]?.count || 0
      },
      customers: {
        newThisMonth: newCustomersThisMonth
      },
      alerts: {
        lowStockProducts,
        pendingOrders
      }
    });

  } catch (error) {
    console.error('Erreur analytics dashboard:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
