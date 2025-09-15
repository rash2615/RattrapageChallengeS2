const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nom du produit requis'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description requise']
  },
  price: {
    type: Number,
    required: [true, 'Prix requis'],
    min: [0, 'Le prix doit être positif']
  },
  category: {
    type: String,
    required: [true, 'Catégorie requise'],
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Marque requise'],
    trim: true
  },
  size: {
    type: String,
    trim: true
  },
  color: {
    type: String,
    trim: true
  },
  images: [{
    url: { type: String, required: true },
    alt: String
  }],
  stock: {
    type: Number,
    required: [true, 'Stock requis'],
    min: [0, 'Le stock ne peut pas être négatif'],
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  specifications: {
    type: Map,
    of: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour la recherche
productSchema.index({ name: 'text', description: 'text', category: 'text', brand: 'text' });
productSchema.index({ category: 1, brand: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);
