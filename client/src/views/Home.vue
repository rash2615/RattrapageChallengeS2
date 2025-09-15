<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              Bienvenue chez <span class="brand">SPARK</span>
            </h1>
            <p class="hero-subtitle">
              Votre boutique en ligne spécialisée dans les produits téléphoniques. 
              Chargeurs, coques, câbles, écouteurs et accessoires de qualité.
            </p>
            <div class="hero-actions">
              <router-link to="/products" class="btn btn-primary btn-lg">
                Découvrir nos produits
              </router-link>
              <router-link to="/products?category=chargers" class="btn btn-outline btn-lg">
                Voir les chargeurs
              </router-link>
            </div>
          </div>
          <div class="hero-image">
            <div class="hero-phone">
              <div class="phone-screen">
                <div class="phone-content">
                  <div class="phone-app">
                    <div class="app-icon">⚡</div>
                    <div class="app-name">SPARK</div>
                  </div>
                  <div class="phone-features">
                    <div class="feature">🔋 Chargeurs rapides</div>
                    <div class="feature">📱 Coques protectrices</div>
                    <div class="feature">🎧 Écouteurs qualité</div>
                    <div class="feature">🔌 Câbles durables</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Catégories Section -->
    <section class="categories">
      <div class="container">
        <h2 class="section-title">Nos catégories</h2>
        <div class="categories-grid">
          <router-link 
            v-for="category in categories" 
            :key="category.key"
            :to="`/products?category=${category.key}`"
            class="category-card"
          >
            <div class="category-icon">{{ category.icon }}</div>
            <h3 class="category-name">{{ category.name }}</h3>
            <p class="category-description">{{ category.description }}</p>
            <div class="category-arrow">→</div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Produits vedettes -->
    <section class="featured-products">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Produits vedettes</h2>
          <router-link to="/products" class="section-link">
            Voir tous les produits
          </router-link>
        </div>
        
        <div v-if="isLoading" class="loading-container">
          <div class="spinner"></div>
          <p>Chargement des produits...</p>
        </div>
        
        <div v-else-if="featuredProducts.length === 0" class="empty-state">
          <div class="empty-icon">📱</div>
          <h3>Aucun produit disponible</h3>
          <p>Nous travaillons pour vous proposer les meilleurs produits.</p>
        </div>
        
        <div v-else class="products-grid">
          <ProductCard 
            v-for="product in featuredProducts" 
            :key="product._id"
            :product="product"
            @add-to-cart="handleAddToCart"
          />
        </div>
      </div>
    </section>

    <!-- Avantages Section -->
    <section class="advantages">
      <div class="container">
        <h2 class="section-title">Pourquoi choisir SPARK ?</h2>
        <div class="advantages-grid">
          <div class="advantage-card">
            <div class="advantage-icon">🚚</div>
            <h3 class="advantage-title">Livraison rapide</h3>
            <p class="advantage-description">
              Livraison gratuite en 24h pour toute commande supérieure à 50€
            </p>
          </div>
          <div class="advantage-card">
            <div class="advantage-icon">🔒</div>
            <h3 class="advantage-title">Paiement sécurisé</h3>
            <p class="advantage-description">
              Paiement 100% sécurisé avec Stripe et PayPal
            </p>
          </div>
          <div class="advantage-card">
            <div class="advantage-icon">🛡️</div>
            <h3 class="advantage-title">Garantie 2 ans</h3>
            <p class="advantage-description">
              Tous nos produits sont garantis 2 ans
            </p>
          </div>
          <div class="advantage-card">
            <div class="advantage-icon">📞</div>
            <h3 class="advantage-title">Support client</h3>
            <p class="advantage-description">
              Service client disponible 7j/7 pour vous aider
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter Section -->
    <section class="newsletter">
      <div class="container">
        <div class="newsletter-content">
          <div class="newsletter-text">
            <h2 class="newsletter-title">Restez informé</h2>
            <p class="newsletter-description">
              Recevez nos dernières offres et nouveautés par email
            </p>
          </div>
          <form @submit.prevent="handleNewsletter" class="newsletter-form">
            <div class="newsletter-input-group">
              <input
                v-model="newsletterEmail"
                type="email"
                placeholder="Votre adresse email"
                class="newsletter-input"
                required
              />
              <button 
                type="submit" 
                class="newsletter-button"
                :disabled="isNewsletterLoading"
              >
                <span v-if="isNewsletterLoading" class="spinner"></span>
                <span v-else>S'abonner</span>
              </button>
            </div>
            <div v-if="newsletterMessage" class="newsletter-message" :class="newsletterMessageType">
              {{ newsletterMessage }}
            </div>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCartStore } from '../stores/cart'
import ProductCard from '../components/ProductCard.vue'
import api from '../services/api'

// Store
const cartStore = useCartStore()

// État local
const isLoading = ref(false)
const featuredProducts = ref([])
const newsletterEmail = ref('')
const isNewsletterLoading = ref(false)
const newsletterMessage = ref('')
const newsletterMessageType = ref('')

// Catégories
const categories = [
  {
    key: 'chargers',
    name: 'Chargeurs',
    icon: '🔋',
    description: 'Chargeurs rapides et sans fil pour tous vos appareils'
  },
  {
    key: 'cases',
    name: 'Coques',
    icon: '📱',
    description: 'Coques protectrices et élégantes pour votre smartphone'
  },
  {
    key: 'cables',
    name: 'Câbles',
    icon: '🔌',
    description: 'Câbles de qualité pour la charge et le transfert de données'
  },
  {
    key: 'headphones',
    name: 'Écouteurs',
    icon: '🎧',
    description: 'Écouteurs et casques audio de haute qualité'
  },
  {
    key: 'accessories',
    name: 'Accessoires',
    icon: '📱',
    description: 'Accessoires et supports pour optimiser votre expérience'
  }
]

// Fonctions
const loadFeaturedProducts = async () => {
  try {
    isLoading.value = true
    
    const response = await api.get('/products/featured')
    
    if (response.data.success) {
      featuredProducts.value = response.data.data.products || []
    }
  } catch (error) {
    console.error('Erreur lors du chargement des produits vedettes:', error)
    featuredProducts.value = []
  } finally {
    isLoading.value = false
  }
}

const handleAddToCart = async (product) => {
  try {
    const result = await cartStore.addItem(product, 1)
    
    if (result.success) {
      showToast(`${product.name} ajouté au panier !`, 'success')
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout au panier:', error)
    showToast('Erreur lors de l\'ajout au panier', 'error')
  }
}

const handleNewsletter = async () => {
  if (!newsletterEmail.value) return

  try {
    isNewsletterLoading.value = true
    newsletterMessage.value = ''

    const response = await api.post('/newsletter/subscribe', {
      email: newsletterEmail.value
    })

    if (response.data.success) {
      newsletterMessage.value = 'Inscription réussie ! Merci de votre abonnement.'
      newsletterMessageType.value = 'success'
      newsletterEmail.value = ''
    } else {
      throw new Error(response.data.message || 'Erreur lors de l\'inscription')
    }

  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de l\'inscription'
    newsletterMessage.value = errorMessage
    newsletterMessageType.value = 'error'
  } finally {
    isNewsletterLoading.value = false
  }
}

const showToast = (message, type = 'info') => {
  if (typeof window !== 'undefined' && window.showToast) {
    window.showToast(message, type)
  }
}

// Lifecycle
onMounted(() => {
  loadFeaturedProducts()
})
</script>

<style scoped>
/* Hero Section */
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 0;
  min-height: 70vh;
  display: flex;
  align-items: center;
}

.hero-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  line-height: 1.2;
}

.brand {
  color: #fbbf24;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-phone {
  width: 200px;
  height: 400px;
  background: #1f2937;
  border-radius: 2rem;
  padding: 1rem;
  position: relative;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
}

.phone-screen {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 1.5rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.phone-app {
  margin-bottom: 2rem;
}

.app-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.app-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.phone-features {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feature {
  font-size: 0.875rem;
  opacity: 0.9;
}

/* Catégories Section */
.categories {
  padding: 4rem 0;
  background-color: #f8fafc;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  color: #1f2937;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.category-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
}

.category-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.category-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.category-description {
  color: #6b7280;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.category-arrow {
  font-size: 1.5rem;
  color: #3b82f6;
  transition: transform 0.3s ease;
}

.category-card:hover .category-arrow {
  transform: translateX(5px);
}

/* Produits vedettes */
.featured-products {
  padding: 4rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
}

.section-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.section-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.loading-container {
  text-align: center;
  padding: 3rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

/* Avantages Section */
.advantages {
  padding: 4rem 0;
  background-color: #f8fafc;
}

.advantages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.advantage-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.advantage-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.advantage-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #1f2937;
}

.advantage-description {
  color: #6b7280;
  line-height: 1.5;
}

/* Newsletter Section */
.newsletter {
  padding: 4rem 0;
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  color: white;
}

.newsletter-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.newsletter-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.newsletter-description {
  font-size: 1.125rem;
  opacity: 0.9;
  line-height: 1.6;
}

.newsletter-form {
  max-width: 400px;
}

.newsletter-input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.newsletter-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #4b5563;
  border-radius: 0.5rem;
  background-color: #374151;
  color: white;
  font-size: 1rem;
}

.newsletter-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.newsletter-input::placeholder {
  color: #9ca3af;
}

.newsletter-button {
  padding: 0.75rem 1.5rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  white-space: nowrap;
}

.newsletter-button:hover:not(:disabled) {
  background-color: #2563eb;
}

.newsletter-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.newsletter-message {
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.newsletter-message.success {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.newsletter-message.error {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .newsletter-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .newsletter-input-group {
    flex-direction: column;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .hero {
    padding: 2rem 0;
  }
  
  .hero-title {
    font-size: 1.75rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .categories-grid,
  .products-grid,
  .advantages-grid {
    grid-template-columns: 1fr;
  }
}
</style>
