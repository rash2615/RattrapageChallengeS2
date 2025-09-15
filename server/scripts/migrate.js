const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import des modèles
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Cart = require('../models/Cart');

// Données de test
const sampleProducts = [
  {
    name: 'T-shirt en coton bio',
    description: 'T-shirt confortable en coton biologique, coupe classique',
    price: 29.99,
    category: 'Vêtements',
    brand: 'EcoWear',
    size: 'M',
    color: 'Blanc',
    stock: 50,
    images: [
      { url: 'https://via.placeholder.com/300x300?text=T-shirt+Blanc', alt: 'T-shirt blanc' }
    ],
    tags: ['bio', 'coton', 'basique'],
    specifications: new Map([
      ['Matière', '100% coton biologique'],
      ['Entretien', 'Lavage machine 30°C'],
      ['Origine', 'France']
    ])
  },
  {
    name: 'Jean slim délavé',
    description: 'Jean slim moderne avec effet délavé, coupe ajustée',
    price: 79.99,
    category: 'Vêtements',
    brand: 'DenimCo',
    size: '32',
    color: 'Bleu',
    stock: 30,
    images: [
      { url: 'https://via.placeholder.com/300x300?text=Jean+Bleu', alt: 'Jean bleu' }
    ],
    tags: ['denim', 'slim', 'délavé'],
    specifications: new Map([
      ['Matière', '98% coton, 2% élasthanne'],
      ['Entretien', 'Lavage machine 40°C'],
      ['Coupe', 'Slim']
    ])
  },
  {
    name: 'Sneakers en cuir',
    description: 'Baskets confortables en cuir véritable, semelle amortissante',
    price: 129.99,
    category: 'Chaussures',
    brand: 'ShoeStyle',
    size: '42',
    color: 'Noir',
    stock: 25,
    images: [
      { url: 'https://via.placeholder.com/300x300?text=Sneakers+Noir', alt: 'Sneakers noir' }
    ],
    tags: ['cuir', 'sport', 'confort'],
    specifications: new Map([
      ['Matière', 'Cuir véritable'],
      ['Semelle', 'Caoutchouc amortissant'],
      ['Pointure', '42']
    ])
  },
  {
    name: 'Sac à dos urbain',
    description: 'Sac à dos moderne pour la ville, compartiments multiples',
    price: 59.99,
    category: 'Accessoires',
    brand: 'UrbanGear',
    size: 'One Size',
    color: 'Gris',
    stock: 40,
    images: [
      { url: 'https://via.placeholder.com/300x300?text=Sac+dos+Gris', alt: 'Sac à dos gris' }
    ],
    tags: ['urbain', 'pratique', 'moderne'],
    specifications: new Map([
      ['Matière', 'Polyester résistant'],
      ['Volume', '25L'],
      ['Fermeture', 'Zips']
    ])
  },
  {
    name: 'Montre connectée',
    description: 'Montre connectée avec suivi d\'activité et notifications',
    price: 199.99,
    category: 'Électronique',
    brand: 'TechWear',
    size: 'One Size',
    color: 'Noir',
    stock: 15,
    images: [
      { url: 'https://via.placeholder.com/300x300?text=Montre+Noir', alt: 'Montre connectée' }
    ],
    tags: ['connectée', 'sport', 'notifications'],
    specifications: new Map([
      ['Écran', 'OLED 1.4"'],
      ['Autonomie', '7 jours'],
      ['Résistance', 'IP68']
    ])
  },
  {
    name: 'Casque audio sans fil',
    description: 'Casque audio haute qualité avec réduction de bruit',
    price: 149.99,
    category: 'Électronique',
    brand: 'SoundMax',
    size: 'One Size',
    color: 'Blanc',
    stock: 20,
    images: [
      { url: 'https://via.placeholder.com/300x300?text=Casque+Blanc', alt: 'Casque blanc' }
    ],
    tags: ['sans fil', 'qualité', 'réduction bruit'],
    specifications: new Map([
      ['Connexion', 'Bluetooth 5.0'],
      ['Autonomie', '30h'],
      ['Réduction bruit', 'Active']
    ])
  }
];

const sampleUsers = [
  {
    email: 'admin@ecommerce.com',
    password: 'admin123456',
    firstName: 'Admin',
    lastName: 'System',
    role: 'admin',
    isEmailVerified: true
  },
  {
    email: 'user@ecommerce.com',
    password: 'user123456',
    firstName: 'Jean',
    lastName: 'Dupont',
    role: 'user',
    isEmailVerified: true
  }
];

async function migrate() {
  try {
    console.log('🚀 Début de la migration...');

    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connexion à MongoDB réussie');

    // Nettoyer la base de données
    console.log('🧹 Nettoyage de la base de données...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Cart.deleteMany({});
    console.log('✅ Base de données nettoyée');

    // Créer les utilisateurs
    console.log('👥 Création des utilisateurs...');
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Utilisateur créé: ${user.email}`);
    }

    // Créer les produits
    console.log('📦 Création des produits...');
    for (const productData of sampleProducts) {
      const product = new Product(productData);
      await product.save();
      console.log(`✅ Produit créé: ${product.name}`);
    }

    // Créer quelques commandes d'exemple
    console.log('📋 Création des commandes d\'exemple...');
    const adminUser = await User.findOne({ email: 'admin@ecommerce.com' });
    const regularUser = await User.findOne({ email: 'user@ecommerce.com' });
    const products = await Product.find({});

    if (adminUser && regularUser && products.length > 0) {
      // Commande 1
      const order1 = new Order({
        orderNumber: 'ORD-' + Date.now() + '-001',
        user: regularUser._id,
        items: [
          {
            product: products[0]._id,
            quantity: 2,
            price: products[0].price
          },
          {
            product: products[2]._id,
            quantity: 1,
            price: products[2].price
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
        subtotal: 189.97,
        shippingCost: 0,
        tax: 37.99,
        total: 227.96,
        status: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'stripe'
      });
      await order1.save();

      // Commande 2
      const order2 = new Order({
        orderNumber: 'ORD-' + Date.now() + '-002',
        user: regularUser._id,
        items: [
          {
            product: products[3]._id,
            quantity: 1,
            price: products[3].price
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
        subtotal: 59.99,
        shippingCost: 10,
        tax: 12,
        total: 81.99,
        status: 'shipped',
        paymentStatus: 'paid',
        paymentMethod: 'stripe'
      });
      await order2.save();

      console.log('✅ Commandes d\'exemple créées');
    }

    console.log('🎉 Migration terminée avec succès !');
    console.log('\n📊 Résumé:');
    console.log(`- ${await User.countDocuments()} utilisateurs créés`);
    console.log(`- ${await Product.countDocuments()} produits créés`);
    console.log(`- ${await Order.countDocuments()} commandes créées`);
    console.log('\n🔑 Comptes de test:');
    console.log('Admin: admin@ecommerce.com / admin123456');
    console.log('User: user@ecommerce.com / user123456');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Connexion fermée');
  }
}

// Exécuter la migration si le script est appelé directement
if (require.main === module) {
  migrate();
}

module.exports = migrate;
