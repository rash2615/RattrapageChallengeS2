const express = require('express');
const { body, validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Middleware pour obtenir ou créer un panier
const getOrCreateCart = async (req, res, next) => {
  try {
    let sessionId = req.headers['x-session-id'];
    
    // Si l'utilisateur est connecté, utiliser son ID, sinon utiliser sessionId
    const cartIdentifier = req.user ? req.user.userId : sessionId;
    
    if (!cartIdentifier) {
      return res.status(400).json({ message: 'Session ID requis' });
    }

    let cart = await Cart.findOne({
      $or: [
        { sessionId: cartIdentifier },
        { user: cartIdentifier }
      ]
    }).populate('items.product');

    if (!cart) {
      cart = new Cart({
        sessionId: sessionId,
        user: req.user ? req.user.userId : null
      });
      await cart.save();
    }

    req.cart = cart;
    next();
  } catch (error) {
    console.error('Erreur getOrCreateCart:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// @route   GET /api/cart
// @desc    Obtenir le contenu du panier
// @access  Public
router.get('/', getOrCreateCart, async (req, res) => {
  try {
    await req.cart.populate('items.product');
    
    const total = req.cart.calculateTotal();
    
    res.json({
      cart: req.cart,
      total: total,
      itemCount: req.cart.items.length
    });
  } catch (error) {
    console.error('Erreur get cart:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   POST /api/cart/add
// @desc    Ajouter un produit au panier
// @access  Public
router.post('/add', [
  body('productId').isMongoId().withMessage('ID produit invalide'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantité invalide')
], getOrCreateCart, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity } = req.body;

    // Vérifier que le produit existe et est actif
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // Vérifier le stock
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Stock insuffisant' });
    }

    // Ajouter le produit au panier
    await req.cart.addItem(productId, quantity);
    await req.cart.populate('items.product');

    const total = req.cart.calculateTotal();

    res.json({
      message: 'Produit ajouté au panier',
      cart: req.cart,
      total: total,
      itemCount: req.cart.items.length
    });

  } catch (error) {
    console.error('Erreur add to cart:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   PUT /api/cart/update
// @desc    Modifier la quantité d'un produit dans le panier
// @access  Public
router.put('/update', [
  body('productId').isMongoId().withMessage('ID produit invalide'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantité invalide')
], getOrCreateCart, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity } = req.body;

    if (quantity === 0) {
      // Supprimer le produit du panier
      await req.cart.removeItem(productId);
    } else {
      // Vérifier le stock
      const product = await Product.findById(productId);
      if (product && product.stock < quantity) {
        return res.status(400).json({ message: 'Stock insuffisant' });
      }

      // Mettre à jour la quantité
      const item = req.cart.items.find(item => 
        item.product.toString() === productId
      );
      
      if (item) {
        item.quantity = quantity;
        req.cart.updatedAt = new Date();
        await req.cart.save();
      }
    }

    await req.cart.populate('items.product');
    const total = req.cart.calculateTotal();

    res.json({
      message: 'Panier mis à jour',
      cart: req.cart,
      total: total,
      itemCount: req.cart.items.length
    });

  } catch (error) {
    console.error('Erreur update cart:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   DELETE /api/cart/remove
// @desc    Supprimer un produit du panier
// @access  Public
router.delete('/remove', [
  body('productId').isMongoId().withMessage('ID produit invalide')
], getOrCreateCart, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId } = req.body;

    await req.cart.removeItem(productId);
    await req.cart.populate('items.product');
    const total = req.cart.calculateTotal();

    res.json({
      message: 'Produit supprimé du panier',
      cart: req.cart,
      total: total,
      itemCount: req.cart.items.length
    });

  } catch (error) {
    console.error('Erreur remove from cart:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   DELETE /api/cart/clear
// @desc    Vider le panier
// @access  Public
router.delete('/clear', getOrCreateCart, async (req, res) => {
  try {
    await req.cart.clear();

    res.json({
      message: 'Panier vidé',
      cart: req.cart
    });

  } catch (error) {
    console.error('Erreur clear cart:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   POST /api/cart/merge
// @desc    Fusionner le panier de session avec le panier utilisateur
// @access  Private
router.post('/merge', auth, async (req, res) => {
  try {
    const sessionId = req.headers['x-session-id'];
    
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID requis' });
    }

    // Trouver le panier de session
    const sessionCart = await Cart.findOne({ sessionId }).populate('items.product');
    
    // Trouver ou créer le panier utilisateur
    let userCart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
    
    if (!userCart) {
      userCart = new Cart({ user: req.user.userId });
    }

    if (sessionCart && sessionCart.items.length > 0) {
      // Fusionner les articles
      for (const sessionItem of sessionCart.items) {
        const existingItem = userCart.items.find(item => 
          item.product.toString() === sessionItem.product._id.toString()
        );
        
        if (existingItem) {
          existingItem.quantity += sessionItem.quantity;
        } else {
          userCart.items.push({
            product: sessionItem.product._id,
            quantity: sessionItem.quantity
          });
        }
      }
      
      await userCart.save();
      
      // Supprimer le panier de session
      await Cart.findByIdAndDelete(sessionCart._id);
    }

    await userCart.populate('items.product');
    const total = userCart.calculateTotal();

    res.json({
      message: 'Paniers fusionnés',
      cart: userCart,
      total: total,
      itemCount: userCart.items.length
    });

  } catch (error) {
    console.error('Erreur merge cart:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
