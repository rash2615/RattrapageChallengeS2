const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const emailService = require('../services/emailService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// @route   POST /api/orders/create
// @desc    Créer une commande
// @access  Private
router.post('/create', auth, [
  body('billingAddress.street').notEmpty().withMessage('Adresse de facturation requise'),
  body('billingAddress.city').notEmpty().withMessage('Ville de facturation requise'),
  body('billingAddress.postalCode').notEmpty().withMessage('Code postal de facturation requis'),
  body('billingAddress.country').notEmpty().withMessage('Pays de facturation requis'),
  body('shippingAddress.street').notEmpty().withMessage('Adresse de livraison requise'),
  body('shippingAddress.city').notEmpty().withMessage('Ville de livraison requise'),
  body('shippingAddress.postalCode').notEmpty().withMessage('Code postal de livraison requis'),
  body('shippingAddress.country').notEmpty().withMessage('Pays de livraison requis'),
  body('paymentMethod').isIn(['stripe', 'paypal']).withMessage('Méthode de paiement invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { billingAddress, shippingAddress, paymentMethod } = req.body;

    // Récupérer le panier de l'utilisateur
    const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Panier vide' });
    }

    // Vérifier le stock et calculer les totaux
    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Stock insuffisant pour ${item.product.name}` 
        });
      }

      const itemTotal = item.product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      });
    }

    const shippingCost = subtotal > 100 ? 0 : 10; // Livraison gratuite au-dessus de 100€
    const tax = subtotal * 0.2; // TVA 20%
    const total = subtotal + shippingCost + tax;

    // Créer la commande
    const order = new Order({
      user: req.user.userId,
      items: orderItems,
      billingAddress,
      shippingAddress,
      subtotal,
      shippingCost,
      tax,
      total,
      paymentMethod
    });

    await order.save();

    // Créer le PaymentIntent Stripe
    let paymentIntent;
    if (paymentMethod === 'stripe') {
      try {
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(total * 100), // Stripe utilise les centimes
          currency: 'eur',
          metadata: {
            orderId: order._id.toString(),
            userId: req.user.userId
          }
        });

        order.paymentIntentId = paymentIntent.id;
        await order.save();
      } catch (stripeError) {
        console.error('Erreur Stripe:', stripeError);
        return res.status(400).json({ message: 'Erreur de paiement' });
      }
    }

    // Vider le panier
    await cart.clear();

    res.status(201).json({
      message: 'Commande créée avec succès',
      order,
      paymentIntent: paymentIntent ? {
        id: paymentIntent.id,
        client_secret: paymentIntent.client_secret
      } : null
    });

  } catch (error) {
    console.error('Erreur création commande:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de la commande' });
  }
});

// @route   POST /api/orders/:id/confirm-payment
// @desc    Confirmer le paiement d'une commande
// @access  Private
router.post('/:id/confirm-payment', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    if (order.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Commande déjà payée' });
    }

    // Vérifier le paiement avec Stripe
    if (order.paymentMethod === 'stripe' && order.paymentIntentId) {
      const paymentIntent = await stripe.paymentIntents.retrieve(order.paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        order.paymentStatus = 'paid';
        order.status = 'paid';
        await order.save();

        // Mettre à jour le stock des produits
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.product,
            { $inc: { stock: -item.quantity } }
          );
        }

        // Envoyer l'email de confirmation
        const user = await User.findById(order.user);
        if (user) {
          try {
            await emailService.sendInvoiceEmail(user.email, order);
          } catch (emailError) {
            console.error('Erreur envoi email facture:', emailError);
          }
        }

        res.json({ message: 'Paiement confirmé avec succès', order });
      } else {
        res.status(400).json({ message: 'Paiement non confirmé' });
      }
    } else {
      res.status(400).json({ message: 'Méthode de paiement non supportée' });
    }

  } catch (error) {
    console.error('Erreur confirmation paiement:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/orders
// @desc    Obtenir les commandes de l'utilisateur
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    let filter = { user: req.user.userId };
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Erreur get orders:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/orders/:id
// @desc    Obtenir une commande par ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('user', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Vérifier que l'utilisateur peut accéder à cette commande
    if (order.user._id.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    res.json({ order });

  } catch (error) {
    console.error('Erreur get order:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Modifier le statut d'une commande (admin)
// @access  Private (Admin)
router.put('/:id/status', adminAuth, [
  body('status').isIn(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Statut invalide'),
  body('trackingNumber').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, trackingNumber } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        status, 
        trackingNumber,
        updatedAt: new Date() 
      },
      { new: true }
    ).populate('user', 'email firstName lastName');

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    res.json({ message: 'Statut mis à jour', order });

  } catch (error) {
    console.error('Erreur update order status:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/orders/admin/all
// @desc    Obtenir toutes les commandes (admin)
// @access  Private (Admin)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, paymentStatus } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      orders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Erreur get all orders:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
