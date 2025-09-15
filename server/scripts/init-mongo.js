// Script d'initialisation MongoDB pour Docker
db = db.getSiblingDB('spark');

// Créer un utilisateur pour l'application
db.createUser({
  user: 'spark_user',
  pwd: 'spark_password',
  roles: [
    {
      role: 'readWrite',
      db: 'spark'
    }
  ]
});

// Créer les collections de base
db.createCollection('users');
db.createCollection('products');
db.createCollection('orders');
db.createCollection('carts');

// Créer des index pour optimiser les performances
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ createdAt: 1 });

db.products.createIndex({ name: 'text', description: 'text' });
db.products.createIndex({ category: 1 });
db.products.createIndex({ brand: 1 });
db.products.createIndex({ price: 1 });
db.products.createIndex({ inStock: 1 });
db.products.createIndex({ createdAt: 1 });

db.orders.createIndex({ user: 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ createdAt: 1 });
db.orders.createIndex({ orderNumber: 1 }, { unique: true });

db.carts.createIndex({ user: 1 });
db.carts.createIndex({ sessionId: 1 });
db.carts.createIndex({ createdAt: 1 });

print('Base de données SPARK initialisée avec succès !');
