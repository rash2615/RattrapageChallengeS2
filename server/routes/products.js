const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Product = require('../models/Product');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/products
// @desc    Rechercher des produits avec filtres
// @access  Public
router.get('/', [
  query('search').optional().trim(),
  query('category').optional().trim(),
  query('brand').optional().trim(),
  query('minPrice').optional().isNumeric(),
  query('maxPrice').optional().isNumeric(),
  query('size').optional().trim(),
  query('color').optional().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort').optional().isIn(['name', 'price', 'createdAt', '-name', '-price', '-createdAt'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      size,
      color,
      page = 1,
      limit = 20,
      sort = '-createdAt'
    } = req.query;

    // Construction de la requête de filtrage
    let filter = { isActive: true };

    // Recherche textuelle
    if (search) {
      filter.$text = { $search: search };
    }

    // Filtres spécifiques
    if (category) filter.category = new RegExp(category, 'i');
    if (brand) filter.brand = new RegExp(brand, 'i');
    if (size) filter.size = new RegExp(size, 'i');
    if (color) filter.color = new RegExp(color, 'i');

    // Filtre par prix
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    // Options de tri
    const sortOptions = {};
    if (sort.startsWith('-')) {
      sortOptions[sort.substring(1)] = -1;
    } else {
      sortOptions[sort] = 1;
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Exécution de la requête
    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('category', 'name')
      .lean();

    // Compter le total pour la pagination
    const total = await Product.countDocuments(filter);

    // Obtenir les valeurs uniques pour les filtres
    const categories = await Product.distinct('category', { isActive: true });
    const brands = await Product.distinct('brand', { isActive: true });
    const sizes = await Product.distinct('size', { isActive: true, size: { $exists: true, $ne: null } });
    const colors = await Product.distinct('color', { isActive: true, color: { $exists: true, $ne: null } });

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      },
      filters: {
        categories,
        brands,
        sizes,
        colors,
        priceRange: {
          min: await Product.findOne({ isActive: true }).sort({ price: 1 }).select('price').lean().then(p => p?.price || 0),
          max: await Product.findOne({ isActive: true }).sort({ price: -1 }).select('price').lean().then(p => p?.price || 0)
        }
      }
    });

  } catch (error) {
    console.error('Erreur recherche produits:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la recherche' });
  }
});

// @route   GET /api/products/:id
// @desc    Obtenir un produit par ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product || !product.isActive) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    res.json({ product });

  } catch (error) {
    console.error('Erreur get product:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   POST /api/products
// @desc    Créer un nouveau produit (admin)
// @access  Private (Admin)
router.post('/', adminAuth, [
  body('name').notEmpty().trim().withMessage('Nom requis'),
  body('description').notEmpty().withMessage('Description requise'),
  body('price').isNumeric().withMessage('Prix invalide'),
  body('category').notEmpty().trim().withMessage('Catégorie requise'),
  body('brand').notEmpty().trim().withMessage('Marque requise'),
  body('stock').isInt({ min: 0 }).withMessage('Stock invalide')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = new Product(req.body);
    await product.save();

    res.status(201).json({ product });

  } catch (error) {
    console.error('Erreur création produit:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création' });
  }
});

// @route   PUT /api/products/:id
// @desc    Modifier un produit (admin)
// @access  Private (Admin)
router.put('/:id', adminAuth, [
  body('name').optional().notEmpty().trim(),
  body('description').optional().notEmpty(),
  body('price').optional().isNumeric(),
  body('category').optional().notEmpty().trim(),
  body('brand').optional().notEmpty().trim(),
  body('stock').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    res.json({ product });

  } catch (error) {
    console.error('Erreur modification produit:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la modification' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Supprimer un produit (admin)
// @access  Private (Admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false, updatedAt: new Date() },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    res.json({ message: 'Produit supprimé avec succès' });

  } catch (error) {
    console.error('Erreur suppression produit:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression' });
  }
});

// @route   GET /api/products/categories/list
// @desc    Obtenir la liste des catégories
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { isActive: true });
    res.json({ categories });
  } catch (error) {
    console.error('Erreur get categories:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
