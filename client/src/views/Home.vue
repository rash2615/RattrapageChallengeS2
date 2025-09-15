<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1>Bienvenue sur notre boutique en ligne</h1>
          <p>Découvrez notre sélection de produits de qualité à des prix imbattables</p>
          <router-link to="/products" class="btn btn-primary btn-lg">
            Voir nos produits
          </router-link>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="featured-products">
      <div class="container">
        <h2 class="text-center mb-5">Produits en vedette</h2>
        
        <div v-if="loading" class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
        </div>
        
        <div v-else-if="error" class="alert alert-danger">
          {{ error }}
        </div>
        
        <div v-else class="row">
          <div 
            v-for="product in featuredProducts" 
            :key="product._id"
            class="col-md-4 col-sm-6 mb-4"
          >
            <ProductCard :product="product" />
          </div>
        </div>
        
        <div class="text-center mt-4">
          <router-link to="/products" class="btn btn-outline-primary">
            Voir tous les produits
          </router-link>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <div class="row">
          <div class="col-md-4 text-center mb-4">
            <div class="feature-icon">🚚</div>
            <h4>Livraison rapide</h4>
            <p>Livraison gratuite pour les commandes de plus de 100€</p>
          </div>
          <div class="col-md-4 text-center mb-4">
            <div class="feature-icon">🔒</div>
            <h4>Paiement sécurisé</h4>
            <p>Vos données sont protégées avec un cryptage SSL</p>
          </div>
          <div class="col-md-4 text-center mb-4">
            <div class="feature-icon">💬</div>
            <h4>Support client</h4>
            <p>Notre équipe est là pour vous aider 7j/7</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ProductCard from '../components/ProductCard.vue'
import api from '../services/api'

const featuredProducts = ref([])
const loading = ref(true)
const error = ref(null)

const loadFeaturedProducts = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await api.get('/products?limit=6&sort=-createdAt')
    featuredProducts.value = response.data.products
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur de chargement des produits'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadFeaturedProducts()
})
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 0;
  text-align: center;
}

.hero-content h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

.hero-content p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.featured-products {
  padding: 4rem 0;
  background-color: #f8f9fa;
}

.features {
  padding: 4rem 0;
  background-color: white;
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-icon h4 {
  margin-bottom: 1rem;
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2rem;
  }
  
  .hero-content p {
    font-size: 1rem;
  }
}
</style>
