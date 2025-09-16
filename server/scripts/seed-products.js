/**
 * Script de seed pour ajouter des produits de test
 */

const mongoose = require('mongoose')
const Product = require('../models/Product')
require('dotenv').config()

const sampleProducts = [
  {
    name: "Chargeur USB-C Rapide 20W",
    description: "Chargeur rapide USB-C 20W compatible avec tous les smartphones modernes. Charge votre téléphone jusqu'à 50% en 30 minutes.",
    price: 24.99,
    originalPrice: 29.99,
    category: "chargers",
    brand: "SPARK",
    images: [{ url: "/images/charger-usb-c.jpg", alt: "Chargeur USB-C" }],
    specifications: {
      puissance: "20W",
      connecteur: "USB-C",
      compatibilite: "iPhone, Samsung, Google Pixel",
      garantie: "2 ans"
    },
    inStock: true,
    stockQuantity: 50,
    sku: "CHG-USB-C-20W",
    weight: 0.1,
    dimensions: {
      length: 10,
      width: 5,
      height: 2
    },
    colors: [{ name: "noir", hex: "#000000" }, { name: "blanc", hex: "#FFFFFF" }],
    tags: ["rapide", "usb-c", "chargeur", "officiel"],
    rating: 4.5,
    reviewCount: 128,
    featured: true
  },
  {
    name: "Coque iPhone 15 Pro Max Transparente",
    description: "Coque de protection transparente pour iPhone 15 Pro Max. Protection renforcée avec design élégant.",
    price: 19.99,
    originalPrice: 24.99,
    category: "cases",
    brand: "SPARK",
    images: [{ url: "/images/coque-iphone-15.jpg", alt: "coque-iphone-15" }],
    specifications: {
      modele: "iPhone 15 Pro Max",
      materiau: "Silicone TPU",
      protection: "Choc, rayures",
      compatibilite: "iPhone 15 Pro Max uniquement"
    },
    inStock: true,
    stockQuantity: 30,
    sku: "COQ-IPH15-PM-TRANS",
    weight: 0.05,
    dimensions: {
      length: 16,
      width: 8,
      height: 1
    },
    colors: [{ name: "transparent", hex: "#000000" }, { name: "noir", hex: "#FFFFFF" }, { name: "bleu", hex: "#0000FF" }],
    tags: ["iphone", "protection", "transparent", "pro"],
    rating: 4.2,
    reviewCount: 89,
    featured: true
  },
  {
    name: "Câble Lightning 2m",
    description: "Câble Lightning 2 mètres pour iPhone et iPad. Compatible avec tous les appareils Apple.",
    price: 15.99,
    originalPrice: 19.99,
    category: "cables",
    brand: "SPARK",
    images: [{ url: "/images/cable-lightning.jpg", alt: "cable-lightning" }],
    specifications: {
      longueur: "2 mètres",
      connecteurs: "Lightning vers USB-A",
      compatibilite: "iPhone, iPad",
      garantie: "1 an"
    },
    inStock: true,
    stockQuantity: 75,
    sku: "CAB-LIGHTNING-2M",
    weight: 0.08,
    dimensions: {
      length: 200,
      width: 1,
      height: 1
    },
    colors: [{ name: "blanc", hex: "#000000" }, { name: "noir", hex: "#FFFFFF" }],
    tags: ["lightning", "iphone", "cable", "2m"],
    rating: 4.3,
    reviewCount: 156,
    featured: true
  },
  {
    name: "Écouteurs Bluetooth Pro",
    description: "Écouteurs Bluetooth avec réduction de bruit active. Son haute qualité et autonomie de 8h.",
    price: 89.99,
    originalPrice: 119.99,
    category: "headphones",
    brand: "SPARK",
    images: [{ url: "/images/ecouteurs-bluetooth.jpg", alt: "ecouteurs-bluetooth" }],
    specifications: {
      connectivite: "Bluetooth 5.0",
      autonomie: "8h + 24h avec étui",
      reduction_bruit: "Active",
      resistance: "IPX5"
    },
    inStock: true,
    stockQuantity: 25,
    sku: "EC-BT-PRO",
    weight: 0.2,
    dimensions: {
      length: 6,
      width: 4,
      height: 3
    },
    colors: [{ name: "noir", hex: "#000000" }, { name: "blanc", hex: "#FFFFFF" }, { name: "bleu", hex: "#0000FF" }],
    tags: ["bluetooth", "pro", "reduction-bruit", "hautes-qualite"],
    rating: 4.7,
    reviewCount: 203,
    featured: true
  },
  {
    name: "Support Voiture Magnétique",
    description: "Support magnétique pour voiture avec ventouse renforcée. Compatible avec tous les smartphones.",
    price: 29.99,
    originalPrice: 39.99,
    category: "accessories",
    brand: "SPARK",
    images: [{ url: "/images/support-voiture.jpg", alt: "support-voiture" }],
    specifications: {
      fixation: "Ventouse + aimant",
      compatibilite: "Tous smartphones",
      rotation: "360°",
      materiau: "Aluminium"
    },
    inStock: true,
    stockQuantity: 40,
    sku: "SUP-VOIT-MAG",
    weight: 0.15,
    dimensions: {
      length: 8,
      width: 6,
      height: 4
    },
    colors: [{ name: "noir", hex: "#000000" }, { name: "argent", hex: "#FFFFFF" }],
    tags: ["voiture", "magnetique", "support", "universel"],
    rating: 4.1,
    reviewCount: 67,
    featured: false
  },
  {
    name: "Batterie Externe 10000mAh",
    description: "Batterie externe 10000mAh avec charge rapide. Rechargez votre téléphone plusieurs fois.",
    price: 39.99,
    originalPrice: 49.99,
    category: "chargers",
    brand: "SPARK",
    images: [{ url: "/images/batterie-externe.jpg", alt: "batterie-externe" }],
    specifications: {
      capacite: "10000mAh",
      sorties: "2x USB-A + 1x USB-C",
      charge_rapide: "18W",
      garantie: "2 ans"
    },
    inStock: true,
    stockQuantity: 20,
    sku: "BAT-EXT-10K",
    weight: 0.25,
    dimensions: {
      length: 12,
      width: 7,
      height: 2
    },
    colors: [{ name: "noir", hex: "#000000" }, { name: "blanc", hex: "#FFFFFF" }, { name: "bleu", hex: "#0000FF" }],
    tags: ["batterie", "externe", "10000mah", "charge-rapide"],
    rating: 4.4,
    reviewCount: 142,
    featured: true
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
    const products = await Product.insertMany(sampleProducts)
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
