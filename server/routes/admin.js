const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { adminAuth } = require('../middleware/auth');
const emailService = require('../services/emailService');

const router = express.Router();

// ========== GESTION DES UTILISATEURS ==========

// @route   GET /api/admin/users
// @desc    Obtenir tous les utilisateurs
// @access  Private (Admin)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    
    let filter = {};
    if (search) {
      filter.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-password -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Erreur get users:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Obtenir un utilisateur par ID
// @access  Private (Admin)
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -emailVerificationToken -passwordResetToken');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Erreur get user:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   POST /api/admin/users
// @desc    Créer un nouvel utilisateur
// @access  Private (Admin)
router.post('/users', adminAuth, [
  body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 8 }).withMessage('Le mot de passe doit contenir au moins 8 caractères'),
  body('firstName').notEmpty().trim().withMessage('Prénom requis'),
  body('lastName').notEmpty().trim().withMessage('Nom requis'),
  body('role').isIn(['user', 'admin']).withMessage('Rôle invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, role = 'user' } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Un utilisateur avec cet email existe déjà' });
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role,
      isEmailVerified: true // Les utilisateurs créés par admin sont automatiquement vérifiés
    });

    await user.save();

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création' });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Modifier un utilisateur
// @access  Private (Admin)
router.put('/users/:id', adminAuth, [
  body('firstName').optional().notEmpty().trim(),
  body('lastName').optional().notEmpty().trim(),
  body('role').optional().isIn(['user', 'admin']),
  body('isEmailVerified').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password -emailVerificationToken -passwordResetToken');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ message: 'Utilisateur mis à jour', user });

  } catch (error) {
    console.error('Erreur modification utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la modification' });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Supprimer un utilisateur
// @access  Private (Admin)
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.json({ message: 'Utilisateur supprimé avec succès' });

  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression' });
  }
});

// @route   POST /api/admin/users/:id/reset-password
// @desc    Réinitialiser le mot de passe d'un utilisateur
// @access  Private (Admin)
router.post('/users/:id/reset-password', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Générer un token de réinitialisation
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Envoyer l'email de réinitialisation
    try {
      await emailService.sendPasswordResetEmail(user.email, resetToken);
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
      return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email' });
    }

    res.json({ message: 'Email de réinitialisation envoyé à l\'utilisateur' });

  } catch (error) {
    console.error('Erreur reset password:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ========== GESTION DES COMMANDES ==========

// @route   POST /api/admin/orders
// @desc    Créer une commande pour un utilisateur
// @access  Private (Admin)
router.post('/orders', adminAuth, [
  body('userId').isMongoId().withMessage('ID utilisateur invalide'),
  body('items').isArray({ min: 1 }).withMessage('Au moins un produit requis'),
  body('items.*.productId').isMongoId().withMessage('ID produit invalide'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantité invalide'),
  body('billingAddress.street').notEmpty().withMessage('Adresse de facturation requise'),
  body('billingAddress.city').notEmpty().withMessage('Ville de facturation requise'),
  body('billingAddress.postalCode').notEmpty().withMessage('Code postal de facturation requis'),
  body('billingAddress.country').notEmpty().withMessage('Pays de facturation requis'),
  body('shippingAddress.street').notEmpty().withMessage('Adresse de livraison requise'),
  body('shippingAddress.city').notEmpty().withMessage('Ville de livraison requise'),
  body('shippingAddress.postalCode').notEmpty().withMessage('Code postal de livraison requis'),
  body('shippingAddress.country').notEmpty().withMessage('Pays de livraison requis')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, items, billingAddress, shippingAddress } = req.body;

    // Vérifier que l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Vérifier les produits et calculer les totaux
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        return res.status(404).json({ message: `Produit ${item.productId} non trouvé` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Stock insuffisant pour ${product.name}` 
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }

    const shippingCost = subtotal > 100 ? 0 : 10;
    const tax = subtotal * 0.2;
    const total = subtotal + shippingCost + tax;

    // Créer la commande
    const order = new Order({
      user: userId,
      items: orderItems,
      billingAddress,
      shippingAddress,
      subtotal,
      shippingCost,
      tax,
      total,
      paymentMethod: 'admin',
      paymentStatus: 'paid',
      status: 'paid'
    });

    await order.save();

    // Mettre à jour le stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } }
      );
    }

    res.status(201).json({
      message: 'Commande créée avec succès',
      order
    });

  } catch (error) {
    console.error('Erreur création commande admin:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création' });
  }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Modifier le statut d'une commande
// @access  Private (Admin)
router.put('/orders/:id/status', adminAuth, [
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

// @route   DELETE /api/admin/orders/:id
// @desc    Supprimer une commande
// @access  Private (Admin)
router.delete('/orders/:id', adminAuth, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    res.json({ message: 'Commande supprimée avec succès' });

  } catch (error) {
    console.error('Erreur suppression commande:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression' });
  }
});

module.exports = router;
