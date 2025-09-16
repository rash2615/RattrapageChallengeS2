/**
 * Script de seed simple pour ajouter des produits de test
 */

const mongoose = require('mongoose')
const Product = require('../models/Product')
require('dotenv').config()

const simpleProducts = [
  {
    name: "Chargeur USB-C Rapide 20W",
    description: "Chargeur rapide USB-C 20W compatible avec tous les smartphones modernes.",
    price: 24.99,
    originalPrice: 29.99,
    category: "chargers",
    brand: "SPARK",
    slug: "chargeur-usb-c-rapide-20w",
    images: [{ url: "/images/charger-usb-c.svg", alt: "Chargeur USB-C" }],
    colors: [{ name: "noir", hex: "#000000" }, { name: "blanc", hex: "#FFFFFF" }],
    isActive: true,
    inStock: true,
    stockQuantity: 50,
    isActive: true,
    isFeatured: true,
    rating: 4.5,
    reviewCount: 128
  },
  {
    name: "Coque iPhone 15 Pro Max",
    description: "Coque de protection transparente pour iPhone 15 Pro Max.",
    price: 19.99,
    originalPrice: 24.99,
    category: "cases",
    brand: "SPARK",
    slug: "coque-iphone-15-pro-max",
    images: [{ url: "/images/coque-iphone-15.svg", alt: "Coque iPhone 15" }],
    colors: [{ name: "transparent", hex: "#FFFFFF" }, { name: "noir", hex: "#000000" }],
    isActive: true,
    inStock: true,
    stockQuantity: 30,
    isFeatured: true,
    rating: 4.2,
    reviewCount: 89
  },
  {
    name: "Câble Lightning 2m",
    description: "Câble Lightning 2 mètres pour iPhone et iPad.",
    price: 15.99,
    originalPrice: 19.99,
    category: "cables",
    brand: "SPARK",
    slug: "cable-lightning-2m",
    images: [{ url: "/images/cable-lightning.svg", alt: "Câble Lightning" }],
    colors: [{ name: "blanc", hex: "#FFFFFF" }, { name: "noir", hex: "#000000" }],
    isActive: true,
    inStock: true,
    stockQuantity: 75,
    isFeatured: true,
    rating: 4.3,
    reviewCount: 156
  },
  {
    name: "Écouteurs Bluetooth Pro",
    description: "Écouteurs Bluetooth avec réduction de bruit active.",
    price: 89.99,
    originalPrice: 119.99,
    category: "headphones",
    brand: "SPARK",
    slug: "ecouteurs-bluetooth-pro",
    images: [{ url: "/images/ecouteurs-bluetooth.svg", alt: "Écouteurs Bluetooth" }],
    colors: [{ name: "noir", hex: "#000000" }, { name: "blanc", hex: "#FFFFFF" }],
    isActive: true,
    inStock: true,
    stockQuantity: 25,
    isFeatured: true,
    rating: 4.7,
    reviewCount: 203
  },
  {
    name: "Support Voiture Magnétique",
    description: "Support magnétique pour voiture avec ventouse renforcée.",
    price: 29.99,
    originalPrice: 39.99,
    category: "accessories",
    brand: "SPARK",
    slug: "support-voiture-magnetique",
    images: [{ url: "/images/support-voiture.svg", alt: "Support Voiture" }],
    colors: [{ name: "noir", hex: "#000000" }, { name: "argent", hex: "#C0C0C0" }],
    isActive: true,
    inStock: true,
    stockQuantity: 40,
    isFeatured: false,
    rating: 4.1,
    reviewCount: 67
  }
]

async function seedProducts() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/spark')
    console.log('✅ Connexion à MongoDB réussie')

    // Supprimer les produits existants
    await Product.deleteMany({})
    console.log('🗑️  Anciens produits supprimés')

    // Ajouter les nouveaux produits
    const products = await Product.insertMany(simpleProducts)
    console.log(`✅ ${products.length} produits ajoutés avec succès`)

    // Afficher les produits ajoutés
    products.forEach(product => {
      console.log(`- ${product.name} (${product.price}€)`)
    })

    console.log('\n🎉 Seed terminé avec succès !')
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error)
  } finally {
    await mongoose.disconnect()
    console.log('📡 Connexion MongoDB fermée')
    process.exit(0)
  }
}

// Exécuter le seed
seedProducts()
