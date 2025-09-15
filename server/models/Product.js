/**
 * Modèle Product pour SPARK - Produits téléphoniques
 * Chargeurs, coques, câbles, écouteurs, accessoires
 */

const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  // Informations de base
  name: {
    type: String,
    required: [true, 'Le nom du produit est obligatoire'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  description: {
    type: String,
    required: [true, 'La description est obligatoire'],
    trim: true,
    maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [200, 'La description courte ne peut pas dépasser 200 caractères']
  },
  
  // Catégorie et classification
  category: {
    type: String,
    required: [true, 'La catégorie est obligatoire'],
    enum: {
      values: ['chargers', 'cases', 'cables', 'headphones', 'accessories'],
      message: 'Catégorie invalide. Valeurs autorisées: chargers, cases, cables, headphones, accessories'
    }
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: [50, 'La sous-catégorie ne peut pas dépasser 50 caractères']
  },
  brand: {
    type: String,
    required: [true, 'La marque est obligatoire'],
    trim: true,
    maxlength: [50, 'La marque ne peut pas dépasser 50 caractères']
  },
  
  // Prix et stock
  price: {
    type: Number,
    required: [true, 'Le prix est obligatoire'],
    min: [0, 'Le prix ne peut pas être négatif'],
    max: [10000, 'Le prix ne peut pas dépasser 10000€']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Le prix original ne peut pas être négatif']
  },
  stock: {
    type: Number,
    required: [true, 'Le stock est obligatoire'],
    min: [0, 'Le stock ne peut pas être négatif'],
    default: 0
  },
  minStock: {
    type: Number,
    default: 5,
    min: [0, 'Le stock minimum ne peut pas être négatif']
  },
  
  // Images et médias
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      trim: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  
  // Spécifications techniques (spécifiques aux produits téléphoniques)
  specifications: {
    // Pour les chargeurs
    power: {
      type: String, // "20W", "65W", "100W"
      trim: true
    },
    connector: {
      type: String, // "USB-C", "Lightning", "Micro-USB"
      trim: true
    },
    wireless: {
      type: Boolean,
      default: false
    },
    fastCharge: {
      type: Boolean,
      default: false
    },
    
    // Pour les coques
    material: {
      type: String, // "Silicone", "Plastique", "Cuir", "Métal"
      trim: true
    },
    protection: {
      type: String, // "Anti-choc", "Anti-rayures", "Étanche"
      trim: true
    },
    transparency: {
      type: Boolean,
      default: false
    },
    
    // Pour les câbles
    length: {
      type: String, // "1m", "2m", "3m"
      trim: true
    },
    dataTransfer: {
      type: Boolean,
      default: false
    },
    chargingSpeed: {
      type: String, // "Rapide", "Standard"
      trim: true
    },
    
    // Pour les écouteurs
    connectivity: {
      type: String, // "Bluetooth", "Filaire", "USB-C", "Lightning"
      trim: true
    },
    batteryLife: {
      type: String, // "8h", "24h", "30h"
      trim: true
    },
    noiseCancellation: {
      type: Boolean,
      default: false
    },
    waterproof: {
      type: Boolean,
      default: false
    },
    
    // Pour les accessoires
    compatibility: {
      type: [String], // ["iPhone 14", "Samsung Galaxy S23", "Google Pixel 7"]
      default: []
    },
    features: {
      type: [String], // ["Support magnétique", "Rotation 360°", "LED"]
      default: []
    }
  },
  
  // Compatibilité avec les appareils
  deviceCompatibility: {
    phones: [{
      brand: {
        type: String,
        trim: true
      },
      model: {
        type: String,
        trim: true
      },
      year: {
        type: Number,
        min: 2015,
        max: new Date().getFullYear() + 2
      }
    }],
    universal: {
      type: Boolean,
      default: false
    }
  },
  
  // Dimensions et poids
  dimensions: {
    length: {
      type: Number,
      min: 0
    },
    width: {
      type: Number,
      min: 0
    },
    height: {
      type: Number,
      min: 0
    },
    weight: {
      type: Number,
      min: 0
    },
    unit: {
      type: String,
      enum: ['mm', 'cm', 'g', 'kg'],
      default: 'mm'
    }
  },
  
  // Couleurs et variantes
  colors: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    hex: {
      type: String,
      match: [/^#[0-9A-F]{6}$/i, 'Code couleur hex invalide']
    },
    image: {
      type: String
    }
  }],
  
  // Tailles et variantes
  sizes: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    priceModifier: {
      type: Number,
      default: 0 // Modificateur de prix pour cette taille
    }
  }],
  
  // SEO et marketing
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  metaTitle: {
    type: String,
    trim: true,
    maxlength: [60, 'Le titre meta ne peut pas dépasser 60 caractères']
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [160, 'La description meta ne peut pas dépasser 160 caractères']
  },
  keywords: [{
    type: String,
    trim: true
  }],
  
  // Statut et visibilité
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: false
  },
  isOnSale: {
    type: Boolean,
    default: false
  },
  
  // Dates de promotion
  saleStartDate: Date,
  saleEndDate: Date,
  
  // Évaluations et avis
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  // Statistiques de vente
  sales: {
    totalSold: {
      type: Number,
      default: 0,
      min: 0
    },
    totalRevenue: {
      type: Number,
      default: 0,
      min: 0
    },
    lastSold: Date
  },
  
  // Tags pour la recherche
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Index pour les performances de recherche
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' })
productSchema.index({ category: 1, subcategory: 1 })
productSchema.index({ brand: 1 })
productSchema.index({ price: 1 })
productSchema.index({ isActive: 1, isFeatured: 1 })
productSchema.index({ 'ratings.average': -1 })
productSchema.index({ createdAt: -1 })
productSchema.index({ 'sales.totalSold': -1 })

// Virtual pour le prix avec remise
productSchema.virtual('discountedPrice').get(function() {
  if (this.isOnSale && this.originalPrice) {
    return this.originalPrice
  }
  return this.price
})

// Virtual pour le pourcentage de remise
productSchema.virtual('discountPercentage').get(function() {
  if (this.isOnSale && this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100)
  }
  return 0
})

// Virtual pour l'image principale
productSchema.virtual('primaryImage').get(function() {
  const primary = this.images.find(img => img.isPrimary)
  return primary || this.images[0] || null
})

// Virtual pour le statut de stock
productSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out_of_stock'
  if (this.stock <= this.minStock) return 'low_stock'
  return 'in_stock'
})

// Middleware pour générer le slug avant sauvegarde
productSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
  }
  next()
})

// Méthode pour vérifier la compatibilité avec un appareil
productSchema.methods.isCompatibleWith = function(brand, model) {
  if (this.deviceCompatibility.universal) return true
  
  return this.deviceCompatibility.phones.some(device => 
    device.brand.toLowerCase() === brand.toLowerCase() && 
    device.model.toLowerCase() === model.toLowerCase()
  )
}

// Méthode pour mettre à jour les statistiques de vente
productSchema.methods.updateSalesStats = function(quantity, price) {
  this.sales.totalSold += quantity
  this.sales.totalRevenue += quantity * price
  this.sales.lastSold = new Date()
  this.stock -= quantity
  
  return this.save()
}

// Méthode pour calculer le prix final avec les variantes
productSchema.methods.getFinalPrice = function(sizeName = null) {
  let finalPrice = this.price
  
  if (sizeName) {
    const size = this.sizes.find(s => s.name === sizeName)
    if (size) {
      finalPrice += size.priceModifier
    }
  }
  
  return Math.max(0, finalPrice)
}

// Méthode statique pour rechercher des produits
productSchema.statics.searchProducts = function(query, filters = {}) {
  const searchQuery = {}
  
  // Recherche textuelle
  if (query) {
    searchQuery.$text = { $search: query }
  }
  
  // Filtres
  if (filters.category) {
    searchQuery.category = filters.category
  }
  
  if (filters.brand) {
    searchQuery.brand = { $in: filters.brand }
  }
  
  if (filters.minPrice || filters.maxPrice) {
    searchQuery.price = {}
    if (filters.minPrice) searchQuery.price.$gte = filters.minPrice
    if (filters.maxPrice) searchQuery.price.$lte = filters.maxPrice
  }
  
  if (filters.inStock) {
    searchQuery.stock = { $gt: 0 }
  }
  
  if (filters.isActive !== undefined) {
    searchQuery.isActive = filters.isActive
  }
  
  if (filters.isFeatured) {
    searchQuery.isFeatured = true
  }
  
  if (filters.isOnSale) {
    searchQuery.isOnSale = true
  }
  
  return this.find(searchQuery)
}

// Méthode statique pour obtenir les produits populaires
productSchema.statics.getPopularProducts = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ 'sales.totalSold': -1, 'ratings.average': -1 })
    .limit(limit)
}

// Méthode statique pour obtenir les produits en rupture de stock
productSchema.statics.getOutOfStockProducts = function() {
  return this.find({ stock: 0, isActive: true })
}

module.exports = mongoose.model('Product', productSchema)
