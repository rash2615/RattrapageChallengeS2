/**
 * Modèle Cart pour SPARK - Panier e-commerce
 * Gestion du panier avec persistance et synchronisation
 */

const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
  // Référence utilisateur (optionnelle pour les paniers anonymes)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Permet les paniers anonymes
  },
  
  // Identifiant de session pour les paniers anonymes
  sessionId: {
    type: String,
    required: false,
    trim: true
  },
  
  // Produits dans le panier
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    brand: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 100
    },
    size: {
      type: String,
      trim: true
    },
    color: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      trim: true
    },
    specifications: {
      type: mongoose.Schema.Types.Mixed
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Calculs du panier
  subtotal: {
    type: Number,
    default: 0,
    min: 0
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: 0
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Codes promotionnels
  couponCode: {
    type: String,
    trim: true,
    uppercase: true
  },
  discountReason: {
    type: String,
    trim: true
  },
  
  // Métadonnées
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function() {
      // Expiration après 30 jours d'inactivité
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  },
  
  // Conformité RGPD
  gdpr: {
    dataProcessingConsent: {
      type: Boolean,
      default: false
    },
    dataRetentionUntil: {
      type: Date,
      default: function() {
        // Conservation des données de panier pendant 1 an
        return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Index pour les performances
cartSchema.index({ user: 1 })
cartSchema.index({ sessionId: 1 })
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
cartSchema.index({ lastUpdated: -1 })

// Virtual pour le nombre total d'articles
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0)
})

// Virtual pour vérifier si le panier est vide
cartSchema.virtual('isEmpty').get(function() {
  return this.items.length === 0
})

// Virtual pour vérifier si le panier a expiré
cartSchema.virtual('isExpired').get(function() {
  return this.expiresAt < new Date()
})

// Middleware pour calculer les totaux avant sauvegarde
cartSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isModified('shippingCost') || this.isModified('tax') || this.isModified('discount')) {
    this.calculateTotals()
  }
  this.lastUpdated = new Date()
  next()
})

// Méthode pour calculer les totaux
cartSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0)
  this.calculateShipping()
  this.calculateTax()
  this.total = this.subtotal + this.shippingCost + this.tax - this.discount
}

// Méthode pour calculer les frais de port
cartSchema.methods.calculateShipping = function() {
  const freeShippingThreshold = 100 // 100€
  
  if (this.subtotal >= freeShippingThreshold) {
    this.shippingCost = 0
  } else {
    this.shippingCost = 10 // 10€ de frais de port
  }
  
  return this.shippingCost
}

// Méthode pour calculer la TVA
cartSchema.methods.calculateTax = function() {
  const taxRate = 0.20 // 20% de TVA
  this.tax = Math.round(this.subtotal * taxRate * 100) / 100
  return this.tax
}

// Méthode pour ajouter un produit au panier
cartSchema.methods.addItem = function(productData, quantity = 1, options = {}) {
  const existingItemIndex = this.items.findIndex(item => 
    item.product.toString() === productData._id.toString() &&
    item.size === (options.size || '') &&
    item.color === (options.color || '')
  )
  
  if (existingItemIndex >= 0) {
    // Mettre à jour la quantité de l'article existant
    this.items[existingItemIndex].quantity += quantity
  } else {
    // Ajouter un nouvel article
    this.items.push({
      product: productData._id,
      name: productData.name,
      brand: productData.brand,
      category: productData.category,
      price: productData.price,
      quantity: quantity,
      size: options.size || '',
      color: options.color || '',
      image: productData.primaryImage?.url || '',
      specifications: productData.specifications || {},
      addedAt: new Date()
    })
  }
  
  this.calculateTotals()
  return this.save()
}

// Méthode pour mettre à jour la quantité d'un article
cartSchema.methods.updateItemQuantity = function(itemIndex, quantity) {
  if (itemIndex >= 0 && itemIndex < this.items.length) {
    if (quantity <= 0) {
      this.items.splice(itemIndex, 1)
    } else {
      this.items[itemIndex].quantity = quantity
    }
    this.calculateTotals()
    return this.save()
  }
  throw new Error('Index d\'article invalide')
}

// Méthode pour supprimer un article du panier
cartSchema.methods.removeItem = function(itemIndex) {
  if (itemIndex >= 0 && itemIndex < this.items.length) {
    this.items.splice(itemIndex, 1)
    this.calculateTotals()
    return this.save()
  }
  throw new Error('Index d\'article invalide')
}

// Méthode pour vider le panier
cartSchema.methods.clear = function() {
  this.items = []
  this.calculateTotals()
  this.couponCode = undefined
  this.discountReason = undefined
  return this.save()
}

// Méthode pour appliquer un code promo
cartSchema.methods.applyCoupon = function(couponCode, discountAmount, reason = '') {
  this.couponCode = couponCode
  this.discount = discountAmount
  this.discountReason = reason
  this.calculateTotals()
  return this.save()
}

// Méthode pour supprimer le code promo
cartSchema.methods.removeCoupon = function() {
  this.couponCode = undefined
  this.discount = 0
  this.discountReason = undefined
  this.calculateTotals()
  return this.save()
}

// Méthode pour vérifier la disponibilité des produits
cartSchema.methods.checkAvailability = async function() {
  const Product = mongoose.model('Product')
  const unavailableItems = []
  
  for (let i = 0; i < this.items.length; i++) {
    const item = this.items[i]
    const product = await Product.findById(item.product)
    
    if (!product || !product.isActive) {
      unavailableItems.push({
        index: i,
        name: item.name,
        reason: 'Produit indisponible'
      })
    } else if (product.stock < item.quantity) {
      unavailableItems.push({
        index: i,
        name: item.name,
        reason: `Stock insuffisant (${product.stock} disponible(s))`
      })
    }
  }
  
  return unavailableItems
}

// Méthode pour synchroniser avec un panier utilisateur
cartSchema.methods.syncWithUser = function(userId) {
  this.user = userId
  this.sessionId = undefined
  return this.save()
}

// Méthode pour fusionner avec un autre panier
cartSchema.methods.mergeWith = function(otherCart) {
  otherCart.items.forEach(otherItem => {
    const existingItemIndex = this.items.findIndex(item => 
      item.product.toString() === otherItem.product.toString() &&
      item.size === otherItem.size &&
      item.color === otherItem.color
    )
    
    if (existingItemIndex >= 0) {
      this.items[existingItemIndex].quantity += otherItem.quantity
    } else {
      this.items.push(otherItem)
    }
  })
  
  this.calculateTotals()
  return this.save()
}

// Méthode pour anonymiser les données (conformité RGPD)
cartSchema.methods.anonymizeData = function() {
  this.items = []
  this.subtotal = 0
  this.shippingCost = 0
  this.tax = 0
  this.discount = 0
  this.total = 0
  this.couponCode = undefined
  this.discountReason = undefined
  this.gdpr.dataProcessingConsent = false
  
  return this
}

// Méthode statique pour trouver ou créer un panier
cartSchema.statics.findOrCreate = async function(userId = null, sessionId = null) {
  let cart = null
  
  if (userId) {
    cart = await this.findOne({ user: userId })
  } else if (sessionId) {
    cart = await this.findOne({ sessionId: sessionId })
  }
  
  if (!cart) {
    cart = new this({
      user: userId || null,
      sessionId: sessionId || null
    })
    await cart.save()
  }
  
  return cart
}

// Méthode statique pour nettoyer les paniers expirés
cartSchema.statics.cleanExpiredCarts = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  })
}

// Méthode statique pour obtenir les statistiques des paniers
cartSchema.statics.getCartStats = function(startDate, endDate) {
  const matchStage = {}
  
  if (startDate || endDate) {
    matchStage.createdAt = {}
    if (startDate) matchStage.createdAt.$gte = new Date(startDate)
    if (endDate) matchStage.createdAt.$lte = new Date(endDate)
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalCarts: { $sum: 1 },
        averageCartValue: { $avg: '$total' },
        totalItems: { $sum: '$totalItems' },
        abandonedCarts: {
          $sum: {
            $cond: [
              { $gt: ['$lastUpdated', new Date(Date.now() - 24 * 60 * 60 * 1000)] },
              0,
              1
            ]
          }
        }
      }
    }
  ])
}

module.exports = mongoose.model('Cart', cartSchema)
