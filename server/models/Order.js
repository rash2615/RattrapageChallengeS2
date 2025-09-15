/**
 * Modèle Order pour SPARK - Commandes e-commerce
 * Gestion complète des commandes avec suivi et conformité RGPD
 */

const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  // Numéro de commande unique
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  
  // Référence utilisateur
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'utilisateur est obligatoire']
  },
  
  // Produits commandés
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    brand: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
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
      type: String
    },
    specifications: {
      type: mongoose.Schema.Types.Mixed
    }
  }],
  
  // Calculs financiers
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shippingCost: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  discount: {
    type: Number,
    min: 0,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Adresses (conformité RGPD - données structurées)
  billingAddress: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    postalCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'France'
    }
  },
  shippingAddress: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    postalCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: 'France'
    }
  },
  
  // Méthode de paiement
  paymentMethod: {
    type: String,
    required: true,
    enum: ['stripe', 'paypal', 'bank_transfer', 'admin']
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  paymentIntentId: {
    type: String,
    trim: true
  },
  paymentDate: Date,
  
  // Statut de la commande
  status: {
    type: String,
    required: true,
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  
  // Suivi de livraison
  trackingNumber: {
    type: String,
    trim: true
  },
  carrier: {
    type: String,
    trim: true
  },
  trackingUrl: {
    type: String,
    trim: true
  },
  estimatedDelivery: Date,
  actualDelivery: Date,
  
  // Notes et commentaires
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Les notes ne peuvent pas dépasser 500 caractères']
  },
  internalNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Les notes internes ne peuvent pas dépasser 500 caractères']
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
  
  // Métadonnées de commande
  source: {
    type: String,
    enum: ['website', 'mobile', 'admin', 'api'],
    default: 'website'
  },
  userAgent: {
    type: String,
    trim: true
  },
  ipAddress: {
    type: String,
    trim: true
  },
  
  // Dates importantes
  orderDate: {
    type: Date,
    default: Date.now
  },
  paymentDate: Date,
  shippedDate: Date,
  deliveredDate: Date,
  cancelledDate: Date,
  
  // Conformité RGPD
  gdpr: {
    dataProcessingConsent: {
      type: Boolean,
      default: false
    },
    marketingConsent: {
      type: Boolean,
      default: false
    },
    dataRetentionUntil: {
      type: Date,
      default: function() {
        // Conservation des données de commande pendant 5 ans
        return new Date(Date.now() + 5 * 365 * 24 * 60 * 60 * 1000)
      }
    }
  },
  
  // Statistiques et analytics
  analytics: {
    conversionValue: {
      type: Number,
      min: 0
    },
    utmSource: {
      type: String,
      trim: true
    },
    utmMedium: {
      type: String,
      trim: true
    },
    utmCampaign: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Index pour les performances
orderSchema.index({ orderNumber: 1 })
orderSchema.index({ user: 1 })
orderSchema.index({ status: 1 })
orderSchema.index({ paymentStatus: 1 })
orderSchema.index({ createdAt: -1 })
orderSchema.index({ 'gdpr.dataRetentionUntil': 1 })

// Virtual pour le nombre total d'articles
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0)
})

// Virtual pour le statut de livraison
orderSchema.virtual('deliveryStatus').get(function() {
  if (this.status === 'delivered') return 'delivered'
  if (this.status === 'shipped') return 'in_transit'
  if (this.status === 'processing') return 'preparing'
  if (this.status === 'cancelled') return 'cancelled'
  return 'pending'
})

// Virtual pour le temps de traitement
orderSchema.virtual('processingTime').get(function() {
  if (this.shippedDate && this.orderDate) {
    return Math.ceil((this.shippedDate - this.orderDate) / (1000 * 60 * 60 * 24))
  }
  return null
})

// Middleware pour générer le numéro de commande avant sauvegarde
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const year = new Date().getFullYear()
    const month = String(new Date().getMonth() + 1).padStart(2, '0')
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, new Date().getMonth(), 1),
        $lt: new Date(year, new Date().getMonth() + 1, 1)
      }
    })
    this.orderNumber = `SPK${year}${month}${String(count + 1).padStart(4, '0')}`
  }
  next()
})

// Middleware pour calculer les totaux avant sauvegarde
orderSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isModified('shippingCost') || this.isModified('tax') || this.isModified('discount')) {
    this.subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0)
    this.total = this.subtotal + this.shippingCost + this.tax - this.discount
  }
  next()
})

// Méthode pour mettre à jour le statut
orderSchema.methods.updateStatus = function(newStatus, notes = null) {
  const oldStatus = this.status
  this.status = newStatus
  
  // Mettre à jour les dates selon le statut
  const now = new Date()
  switch (newStatus) {
    case 'paid':
      this.paymentDate = now
      this.paymentStatus = 'paid'
      break
    case 'shipped':
      this.shippedDate = now
      break
    case 'delivered':
      this.deliveredDate = now
      break
    case 'cancelled':
      this.cancelledDate = now
      break
  }
  
  // Ajouter une note si fournie
  if (notes) {
    this.internalNotes = (this.internalNotes || '') + `\n[${now.toISOString()}] ${oldStatus} → ${newStatus}: ${notes}`
  }
  
  return this.save()
}

// Méthode pour ajouter un numéro de suivi
orderSchema.methods.addTracking = function(trackingNumber, carrier, trackingUrl = null) {
  this.trackingNumber = trackingNumber
  this.carrier = carrier
  if (trackingUrl) this.trackingUrl = trackingUrl
  this.status = 'shipped'
  this.shippedDate = new Date()
  
  return this.save()
}

// Méthode pour calculer les frais de port
orderSchema.methods.calculateShipping = function() {
  const freeShippingThreshold = 100 // 100€
  
  if (this.subtotal >= freeShippingThreshold) {
    this.shippingCost = 0
  } else {
    this.shippingCost = 10 // 10€ de frais de port
  }
  
  return this.shippingCost
}

// Méthode pour calculer la TVA
orderSchema.methods.calculateTax = function() {
  const taxRate = 0.20 // 20% de TVA
  this.tax = Math.round(this.subtotal * taxRate * 100) / 100
  return this.tax
}

// Méthode pour annuler une commande
orderSchema.methods.cancel = function(reason = null) {
  if (this.status === 'delivered') {
    throw new Error('Impossible d\'annuler une commande déjà livrée')
  }
  
  this.status = 'cancelled'
  this.cancelledDate = new Date()
  
  if (reason) {
    this.internalNotes = (this.internalNotes || '') + `\n[${new Date().toISOString()}] Annulation: ${reason}`
  }
  
  return this.save()
}

// Méthode pour anonymiser les données (conformité RGPD)
orderSchema.methods.anonymizeData = function() {
  this.billingAddress = {
    street: 'Adresse supprimée',
    city: 'Ville supprimée',
    postalCode: '00000',
    country: 'France'
  }
  this.shippingAddress = {
    street: 'Adresse supprimée',
    city: 'Ville supprimée',
    postalCode: '00000',
    country: 'France'
  }
  this.notes = 'Données anonymisées'
  this.internalNotes = 'Données anonymisées'
  this.userAgent = 'Anonymisé'
  this.ipAddress = '0.0.0.0'
  this.gdpr.dataProcessingConsent = false
  this.gdpr.marketingConsent = false
  
  return this
}

// Méthode statique pour obtenir les commandes d'un utilisateur
orderSchema.statics.getUserOrders = function(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit
  
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'firstName lastName email')
}

// Méthode statique pour obtenir les statistiques de commandes
orderSchema.statics.getOrderStats = function(startDate, endDate) {
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
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        averageOrderValue: { $avg: '$total' },
        totalItems: { $sum: '$totalItems' }
      }
    }
  ])
}

// Méthode statique pour obtenir les commandes en attente de traitement
orderSchema.statics.getPendingOrders = function() {
  return this.find({
    status: { $in: ['pending', 'paid'] },
    paymentStatus: 'paid'
  }).populate('user', 'firstName lastName email')
}

// Méthode statique pour obtenir les commandes expirées (nettoyage RGPD)
orderSchema.statics.getExpiredOrders = function() {
  return this.find({
    'gdpr.dataRetentionUntil': { $lt: new Date() }
  })
}

module.exports = mongoose.model('Order', orderSchema)
