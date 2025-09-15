/**
 * Script de migration et de peuplement de la base de données SPARK
 * Création des données initiales pour les produits téléphoniques
 */

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
require('dotenv').config()

// Import des modèles
const User = require('../models/User')
const Product = require('../models/Product')
const Order = require('../models/Order')
const Cart = require('../models/Cart')

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/spark', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connexion à MongoDB réussie')
})
.catch((error) => {
  console.error('❌ Erreur de connexion à MongoDB:', error)
  process.exit(1)
})

// Données de produits téléphoniques
const productsData = [
  // CHARGEURS
  {
    name: 'Chargeur Rapide USB-C 20W',
    description: 'Chargeur rapide USB-C 20W compatible avec tous les appareils USB-C. Charge ultra-rapide et sécurisée.',
    shortDescription: 'Chargeur rapide 20W USB-C',
    category: 'chargers',
    subcategory: 'rapide',
    brand: 'TechPower',
    price: 24.99,
    originalPrice: 29.99,
    stock: 50,
    minStock: 5,
    images: [
      {
        url: '/uploads/charger-20w-1.jpg',
        alt: 'Chargeur rapide 20W USB-C',
        isPrimary: true,
        order: 0
      },
      {
        url: '/uploads/charger-20w-2.jpg',
        alt: 'Chargeur rapide 20W USB-C - Vue de côté',
        isPrimary: false,
        order: 1
      }
    ],
    specifications: {
      power: '20W',
      connector: 'USB-C',
      wireless: false,
      fastCharge: true
    },
    deviceCompatibility: {
      phones: [
        { brand: 'Apple', model: 'iPhone 15', year: 2023 },
        { brand: 'Samsung', model: 'Galaxy S24', year: 2024 },
        { brand: 'Google', model: 'Pixel 8', year: 2023 }
      ],
      universal: true
    },
    dimensions: {
      length: 65,
      width: 45,
      height: 25,
      weight: 85,
      unit: 'mm'
    },
    colors: [
      { name: 'Blanc', hex: '#FFFFFF' },
      { name: 'Noir', hex: '#000000' }
    ],
    isActive: true,
    isFeatured: true,
    isNew: true,
    tags: ['chargeur', 'rapide', 'usb-c', '20w', 'compatible']
  },
  {
    name: 'Chargeur Sans Fil MagSafe',
    description: 'Chargeur sans fil MagSafe 15W pour iPhone. Compatible avec tous les iPhone 12 et plus récents.',
    shortDescription: 'Chargeur sans fil MagSafe 15W',
    category: 'chargers',
    subcategory: 'sans-fil',
    brand: 'Apple',
    price: 39.99,
    stock: 30,
    minStock: 3,
    images: [
      {
        url: '/uploads/magsafe-charger.jpg',
        alt: 'Chargeur sans fil MagSafe',
        isPrimary: true,
        order: 0
      }
    ],
    specifications: {
      power: '15W',
      connector: 'MagSafe',
      wireless: true,
      fastCharge: true
    },
    deviceCompatibility: {
      phones: [
        { brand: 'Apple', model: 'iPhone 12', year: 2020 },
        { brand: 'Apple', model: 'iPhone 13', year: 2021 },
        { brand: 'Apple', model: 'iPhone 14', year: 2022 },
        { brand: 'Apple', model: 'iPhone 15', year: 2023 }
      ],
      universal: false
    },
    dimensions: {
      length: 60,
      width: 60,
      height: 10,
      weight: 95,
      unit: 'mm'
    },
    colors: [
      { name: 'Blanc', hex: '#FFFFFF' }
    ],
    isActive: true,
    isFeatured: true,
    tags: ['chargeur', 'sans-fil', 'magsafe', 'iphone', '15w']
  },
  {
    name: 'Chargeur Voiture USB-C 30W',
    description: 'Chargeur voiture USB-C 30W avec double port. Charge rapide pour votre smartphone en voiture.',
    shortDescription: 'Chargeur voiture USB-C 30W',
    category: 'chargers',
    subcategory: 'voiture',
    brand: 'AutoCharge',
    price: 19.99,
    stock: 25,
    minStock: 5,
    images: [
      {
        url: '/uploads/car-charger-30w.jpg',
        alt: 'Chargeur voiture USB-C 30W',
        isPrimary: true,
        order: 0
      }
    ],
    specifications: {
      power: '30W',
      connector: 'USB-C',
      wireless: false,
      fastCharge: true
    },
    deviceCompatibility: {
      universal: true
    },
    dimensions: {
      length: 45,
      width: 25,
      height: 15,
      weight: 45,
      unit: 'mm'
    },
    colors: [
      { name: 'Noir', hex: '#000000' }
    ],
    isActive: true,
    tags: ['chargeur', 'voiture', 'usb-c', '30w', 'double-port']
  },

  // COQUES
  {
    name: 'Coque Silicone iPhone 15',
    description: 'Coque silicone premium pour iPhone 15. Protection complète avec finition douce au toucher.',
    shortDescription: 'Coque silicone iPhone 15',
    category: 'cases',
    subcategory: 'silicone',
    brand: 'ProtectCase',
    price: 29.99,
    stock: 100,
    minStock: 10,
    images: [
      {
        url: '/uploads/iphone15-silicone-case.jpg',
        alt: 'Coque silicone iPhone 15',
        isPrimary: true,
        order: 0
      }
    ],
    specifications: {
      material: 'Silicone',
      protection: 'Anti-choc',
      transparency: false
    },
    deviceCompatibility: {
      phones: [
        { brand: 'Apple', model: 'iPhone 15', year: 2023 },
        { brand: 'Apple', model: 'iPhone 15 Plus', year: 2023 }
      ],
      universal: false
    },
    dimensions: {
      length: 150,
      width: 75,
      height: 10,
      weight: 25,
      unit: 'mm'
    },
    colors: [
      { name: 'Bleu', hex: '#007AFF' },
      { name: 'Rouge', hex: '#FF3B30' },
      { name: 'Vert', hex: '#34C759' },
      { name: 'Noir', hex: '#000000' }
    ],
    isActive: true,
    isFeatured: true,
    tags: ['coque', 'silicone', 'iphone15', 'protection', 'anti-choc']
  },
  {
    name: 'Coque Transparente Universelle',
    description: 'Coque transparente universelle pour smartphones. Protection claire qui préserve le design original.',
    shortDescription: 'Coque transparente universelle',
    category: 'cases',
    subcategory: 'transparente',
    brand: 'ClearShield',
    price: 15.99,
    stock: 75,
    minStock: 10,
    images: [
      {
        url: '/uploads/clear-case-universal.jpg',
        alt: 'Coque transparente universelle',
        isPrimary: true,
        order: 0
      }
    ],
    specifications: {
      material: 'Plastique',
      protection: 'Anti-rayures',
      transparency: true
    },
    deviceCompatibility: {
      universal: true
    },
    dimensions: {
      length: 160,
      width: 80,
      height: 12,
      weight: 20,
      unit: 'mm'
    },
    colors: [
      { name: 'Transparent', hex: '#FFFFFF' }
    ],
    isActive: true,
    tags: ['coque', 'transparente', 'universelle', 'protection', 'claire']
  },

  // CÂBLES
  {
    name: 'Câble USB-C vers Lightning 2m',
    description: 'Câble USB-C vers Lightning 2mètres. Compatible avec tous les appareils Apple et charge rapide.',
    shortDescription: 'Câble USB-C vers Lightning 2m',
    category: 'cables',
    subcategory: 'lightning',
    brand: 'CablePro',
    price: 19.99,
    stock: 60,
    minStock: 10,
    images: [
      {
        url: '/uploads/usb-c-lightning-cable-2m.jpg',
        alt: 'Câble USB-C vers Lightning 2m',
        isPrimary: true,
        order: 0
      }
    ],
    specifications: {
      length: '2m',
      dataTransfer: true,
      chargingSpeed: 'Rapide'
    },
    deviceCompatibility: {
      phones: [
        { brand: 'Apple', model: 'iPhone 8', year: 2017 },
        { brand: 'Apple', model: 'iPhone X', year: 2017 },
        { brand: 'Apple', model: 'iPhone 11', year: 2019 },
        { brand: 'Apple', model: 'iPhone 12', year: 2020 },
        { brand: 'Apple', model: 'iPhone 13', year: 2021 },
        { brand: 'Apple', model: 'iPhone 14', year: 2022 },
        { brand: 'Apple', model: 'iPhone 15', year: 2023 }
      ],
      universal: false
    },
    dimensions: {
      length: 2000,
      width: 5,
      height: 3,
      weight: 45,
      unit: 'mm'
    },
    colors: [
      { name: 'Blanc', hex: '#FFFFFF' },
      { name: 'Noir', hex: '#000000' }
    ],
    isActive: true,
    isFeatured: true,
    tags: ['cable', 'usb-c', 'lightning', '2m', 'apple', 'charge-rapide']
  },
  {
    name: 'Câble USB-C vers USB-C 1m',
    description: 'Câble USB-C vers USB-C 1mètre. Transfert de données et charge rapide pour appareils modernes.',
    shortDescription: 'Câble USB-C vers USB-C 1m',
    category: 'cables',
    subcategory: 'usb-c',
    brand: 'DataLink',
    price: 12.99,
    stock: 80,
    minStock: 15,
    images: [
      {
        url: '/uploads/usb-c-cable-1m.jpg',
        alt: 'Câble USB-C vers USB-C 1m',
        isPrimary: true,
        order: 0
      }
    ],
    specifications: {
      length: '1m',
      dataTransfer: true,
      chargingSpeed: 'Rapide'
    },
    deviceCompatibility: {
      universal: true
    },
    dimensions: {
      length: 1000,
      width: 5,
      height: 3,
      weight: 25,
      unit: 'mm'
    },
    colors: [
      { name: 'Noir', hex: '#000000' },
      { name: 'Blanc', hex: '#FFFFFF' }
    ],
    isActive: true,
    tags: ['cable', 'usb-c', '1m', 'universel', 'charge-rapide', 'donnees']
  },

  // ÉCOUTEURS
  {
    name: 'Écouteurs Bluetooth Pro',
    description: 'Écouteurs Bluetooth professionnels avec réduction de bruit active. Son haute qualité et autonomie 8h.',
    shortDescription: 'Écouteurs Bluetooth Pro avec ANC',
    category: 'headphones',
    subcategory: 'bluetooth',
    brand: 'SoundMax',
    price: 149.99,
    originalPrice: 199.99,
    stock: 40,
    minStock: 5,
    images: [
      {
        url: '/uploads/bluetooth-headphones-pro.jpg',
        alt: 'Écouteurs Bluetooth Pro',
        isPrimary: true,
        order: 0
      }
    ],
    specifications: {
      connectivity: 'Bluetooth',
      batteryLife: '8h',
      noiseCancellation: true,
      waterproof: true
    },
    deviceCompatibility: {
      universal: true
    },
    dimensions: {
      length: 180,
      width: 60,
      height: 30,
      weight: 250,
      unit: 'mm'
    },
    colors: [
      { name: 'Noir', hex: '#000000' },
      { name: 'Blanc', hex: '#FFFFFF' },
      { name: 'Bleu', hex: '#007AFF' }
    ],
    isActive: true,
    isFeatured: true,
    isOnSale: true,
    saleStartDate: new Date(),
    saleEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
    tags: ['ecouteurs', 'bluetooth', 'pro', 'anc', 'reduction-bruit', '8h']
  },
  {
    name: 'Écouteurs Filaire USB-C',
    description: 'Écouteurs filaires USB-C avec micro intégré. Son cristallin et confort d\'écoute optimal.',
    shortDescription: 'Écouteurs filaires USB-C',
    category: 'headphones',
    subcategory: 'filaire',
    brand: 'AudioLink',
    price: 29.99,
    stock: 50,
    minStock: 10,
    images: [
      {
        url: '/uploads/wired-usb-c-headphones.jpg',
        alt: 'Écouteurs filaires USB-C',
        isPrimary: true,
        order: 0
      }
    ],
    specifications: {
      connectivity: 'USB-C',
      batteryLife: 'N/A',
      noiseCancellation: false,
      waterproof: false
    },
    deviceCompatibility: {
      phones: [
        { brand: 'Samsung', model: 'Galaxy S24', year: 2024 },
        { brand: 'Google', model: 'Pixel 8', year: 2023 },
        { brand: 'OnePlus', model: '11', year: 2023 }
      ],
      universal: true
    },
    dimensions: {
      length: 1200,
      width: 15,
      height: 8,
      weight: 35,
      unit: 'mm'
    },
    colors: [
      { name: 'Noir', hex: '#000000' },
      { name: 'Blanc', hex: '#FFFFFF' }
    ],
    isActive: true,
    tags: ['ecouteurs', 'filaire', 'usb-c', 'micro', 'son-cristallin']
  },

  // ACCESSOIRES
  {
    name: 'Support Magnétique Voiture',
    description: 'Support magnétique universel pour voiture. Fixation solide et rotation 360° pour un positionnement optimal.',
    shortDescription: 'Support magnétique voiture universel',
    category: 'accessories',
    subcategory: 'support',
    brand: 'CarMount',
    price: 24.99,
    stock: 35,
    minStock: 5,
    images: [
      {
        url: '/uploads/magnetic-car-mount.jpg',
        alt: 'Support magnétique voiture',
        isPrimary: true,
        order: 0
      }
    ],
    specifications: {
      compatibility: ['iPhone 12', 'iPhone 13', 'iPhone 14', 'iPhone 15', 'Samsung Galaxy S23', 'Google Pixel 7'],
      features: ['Support magnétique', 'Rotation 360°', 'Fixation solide']
    },
    deviceCompatibility: {
      phones: [
        { brand: 'Apple', model: 'iPhone 12', year: 2020 },
        { brand: 'Apple', model: 'iPhone 13', year: 2021 },
        { brand: 'Apple', model: 'iPhone 14', year: 2022 },
        { brand: 'Apple', model: 'iPhone 15', year: 2023 },
        { brand: 'Samsung', model: 'Galaxy S23', year: 2023 },
        { brand: 'Google', model: 'Pixel 7', year: 2022 }
      ],
      universal: true
    },
    dimensions: {
      length: 80,
      width: 60,
      height: 40,
      weight: 120,
      unit: 'mm'
    },
    colors: [
      { name: 'Noir', hex: '#000000' }
    ],
    isActive: true,
    isFeatured: true,
    tags: ['support', 'voiture', 'magnetique', 'universel', '360degres']
  },
  {
    name: 'Batterie Externe 10000mAh',
    description: 'Batterie externe 10000mAh avec charge rapide USB-C et USB-A. Autonomie pour plusieurs recharges.',
    shortDescription: 'Batterie externe 10000mAh',
    category: 'accessories',
    subcategory: 'batterie',
    brand: 'PowerBank',
    price: 39.99,
    stock: 25,
    minStock: 5,
    images: [
      {
        url: '/uploads/powerbank-10000mah.jpg',
        alt: 'Batterie externe 10000mAh',
        isPrimary: true,
        order: 0
      }
    ],
    specifications: {
      compatibility: ['Tous smartphones', 'Tablettes', 'Appareils USB-C'],
      features: ['Charge rapide', 'Double port', 'LED indicateur']
    },
    deviceCompatibility: {
      universal: true
    },
    dimensions: {
      length: 100,
      width: 60,
      height: 20,
      weight: 200,
      unit: 'mm'
    },
    colors: [
      { name: 'Noir', hex: '#000000' },
      { name: 'Blanc', hex: '#FFFFFF' }
    ],
    isActive: true,
    tags: ['batterie', 'externe', '10000mah', 'charge-rapide', 'usb-c', 'usb-a']
  }
]

// Données d'utilisateurs
const usersData = [
  {
    firstName: 'Admin',
    lastName: 'SPARK',
    email: 'admin@spark.com',
    password: 'Admin123!',
    role: 'admin',
    isActive: true,
    isEmailVerified: true,
    gdpr: {
      dataProcessingConsent: true,
      marketingConsent: true,
      analyticsConsent: true,
      consentDate: new Date()
    }
  },
  {
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.com',
    password: 'Password123!',
    role: 'user',
    isActive: true,
    isEmailVerified: true,
    gdpr: {
      dataProcessingConsent: true,
      marketingConsent: false,
      analyticsConsent: true,
      consentDate: new Date()
    }
  },
  {
    firstName: 'Marie',
    lastName: 'Martin',
    email: 'marie.martin@example.com',
    password: 'Password123!',
    role: 'user',
    isActive: true,
    isEmailVerified: true,
    gdpr: {
      dataProcessingConsent: true,
      marketingConsent: true,
      analyticsConsent: true,
      consentDate: new Date()
    }
  }
]

// Fonction pour vider la base de données
async function clearDatabase() {
  console.log('🧹 Nettoyage de la base de données...')
  
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Cart.deleteMany({})
  ])
  
  console.log('✅ Base de données nettoyée')
}

// Fonction pour créer les utilisateurs
async function createUsers() {
  console.log('👥 Création des utilisateurs...')
  
  for (const userData of usersData) {
    const user = new User(userData)
    await user.save()
    console.log(`✅ Utilisateur créé: ${user.email}`)
  }
  
  console.log('✅ Utilisateurs créés')
}

// Fonction pour créer les produits
async function createProducts() {
  console.log('📱 Création des produits...')
  
  for (const productData of productsData) {
    const product = new Product(productData)
    await product.save()
    console.log(`✅ Produit créé: ${product.name}`)
  }
  
  console.log('✅ Produits créés')
}

// Fonction pour créer des commandes d'exemple
async function createSampleOrders() {
  console.log('📦 Création des commandes d\'exemple...')
  
  const users = await User.find({ role: 'user' })
  const products = await Product.find({ isActive: true }).limit(5)
  
  if (users.length === 0 || products.length === 0) {
    console.log('⚠️ Pas assez d\'utilisateurs ou de produits pour créer des commandes')
    return
  }
  
  const sampleOrders = [
    {
      user: users[0]._id,
      items: [
        {
          product: products[0]._id,
          name: products[0].name,
          brand: products[0].brand,
          category: products[0].category,
          price: products[0].price,
          quantity: 2
        },
        {
          product: products[1]._id,
          name: products[1].name,
          brand: products[1].brand,
          category: products[1].category,
          price: products[1].price,
          quantity: 1
        }
      ],
      billingAddress: {
        street: '123 Rue de la Paix',
        city: 'Paris',
        postalCode: '75001',
        country: 'France'
      },
      shippingAddress: {
        street: '123 Rue de la Paix',
        city: 'Paris',
        postalCode: '75001',
        country: 'France'
      },
      paymentMethod: 'stripe',
      paymentStatus: 'paid',
      status: 'delivered',
      subtotal: products[0].price * 2 + products[1].price,
      shippingCost: 0,
      tax: (products[0].price * 2 + products[1].price) * 0.2,
      total: (products[0].price * 2 + products[1].price) * 1.2,
      gdpr: {
        dataProcessingConsent: true,
        marketingConsent: true
      }
    }
  ]
  
  for (const orderData of sampleOrders) {
    const order = new Order(orderData)
    await order.save()
    console.log(`✅ Commande créée: ${order.orderNumber}`)
  }
  
  console.log('✅ Commandes d\'exemple créées')
}

// Fonction principale de migration
async function migrate() {
  try {
    console.log('🚀 Début de la migration SPARK...')
    
    // Vider la base de données
    await clearDatabase()
    
    // Créer les utilisateurs
    await createUsers()
    
    // Créer les produits
    await createProducts()
    
    // Créer des commandes d'exemple
    await createSampleOrders()
    
    console.log('✅ Migration terminée avec succès!')
    console.log('\n📊 Résumé:')
    console.log(`- ${await User.countDocuments()} utilisateur(s)`)
    console.log(`- ${await Product.countDocuments()} produit(s)`)
    console.log(`- ${await Order.countDocuments()} commande(s)`)
    console.log('\n🔑 Comptes créés:')
    console.log('- admin@spark.com / Admin123!')
    console.log('- jean.dupont@example.com / Password123!')
    console.log('- marie.martin@example.com / Password123!')
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
  } finally {
    // Fermer la connexion
    await mongoose.connection.close()
    console.log('🔌 Connexion fermée')
    process.exit(0)
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  migrate()
}

module.exports = { migrate, clearDatabase, createUsers, createProducts, createSampleOrders }
