<template>
  <div class="product-detail-page">
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Chargement du produit...</p>
    </div>

    <div v-else-if="!product" class="error-container">
      <div class="error-icon">❌</div>
      <h2>Produit non trouvé</h2>
      <p>Le produit que vous recherchez n'existe pas ou a été supprimé.</p>
      <router-link to="/products" class="btn btn-primary">
        Retour au catalogue
      </router-link>
    </div>

    <div v-else class="container">
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <router-link to="/" class="breadcrumb-link">Accueil</router-link>
        <span class="breadcrumb-separator">›</span>
        <router-link to="/products" class="breadcrumb-link">Produits</router-link>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">{{ product.name }}</span>
      </nav>

      <div class="product-detail-layout">
        <!-- Galerie d'images -->
        <div class="product-gallery">
          <div class="main-image">
            <img 
              :src="selectedImage" 
              :alt="product.name"
              class="product-image"
              @error="handleImageError"
            />
            <div v-if="product.isOnSale" class="sale-badge">
              -{{ product.discountPercentage || 20 }}%
            </div>
            <div v-if="product.isNew" class="new-badge">Nouveau</div>
          </div>
          
          <div v-if="product.images.length > 1" class="image-thumbnails">
            <button
              v-for="(image, index) in product.images"
              :key="index"
              class="thumbnail"
              :class="{ active: selectedImage === image }"
              @click="selectedImage = image"
            >
              <img :src="image" :alt="`${product.name} ${index + 1}`" />
            </button>
          </div>
        </div>

        <!-- Informations du produit -->
        <div class="product-info">
          <!-- En-tête -->
          <div class="product-header">
            <h1 class="product-title">{{ product.name }}</h1>
            <div class="product-badges">
              <span v-if="product.isNew" class="badge badge-new">Nouveau</span>
              <span v-if="product.isOnSale" class="badge badge-sale">Promo</span>
              <span v-if="product.isFeatured" class="badge badge-featured">Vedette</span>
            </div>
          </div>

          <!-- Note et avis -->
          <div class="product-rating">
            <div class="stars">
              <span 
                v-for="star in 5" 
                :key="star"
                class="star"
                :class="{ filled: star <= Math.floor(product.rating) }"
              >★</span>
            </div>
            <span class="rating-value">{{ product.rating }}/5</span>
            <span class="rating-count">({{ product.reviewCount || 0 }} avis)</span>
            <button class="reviews-link" @click="scrollToReviews">
              Voir les avis
            </button>
          </div>

          <!-- Prix -->
          <div class="product-pricing">
            <div class="price-container">
              <span class="current-price">{{ formatPrice(product.price) }}</span>
              <span v-if="product.originalPrice" class="original-price">
                {{ formatPrice(product.originalPrice) }}
              </span>
              <span v-if="product.isOnSale" class="savings">
                Économisez {{ formatPrice(product.originalPrice - product.price) }}
              </span>
            </div>
            <div v-if="product.taxInfo" class="tax-info">
              {{ product.taxInfo }}
            </div>
          </div>

          <!-- Description -->
          <div class="product-description">
            <h3>Description</h3>
            <p>{{ product.description }}</p>
          </div>

          <!-- Caractéristiques -->
          <div v-if="product.features" class="product-features">
            <h3>Caractéristiques</h3>
            <ul class="features-list">
              <li v-for="feature in product.features" :key="feature">
                {{ feature }}
              </li>
            </ul>
          </div>

          <!-- Options de personnalisation -->
          <div class="product-options">
            <!-- Couleur -->
            <div v-if="product.colors && product.colors.length > 1" class="option-group">
              <h4 class="option-title">Couleur</h4>
              <div class="color-options">
                <button
                  v-for="color in product.colors"
                  :key="color"
                  class="color-option"
                  :class="{ active: selectedColor === color }"
                  :style="{ backgroundColor: getColorHex(color) }"
                  :title="getColorName(color)"
                  @click="selectedColor = color"
                >
                  <span class="color-check">✓</span>
                </button>
              </div>
            </div>

            <!-- Taille -->
            <div v-if="product.sizes && product.sizes.length > 1" class="option-group">
              <h4 class="option-title">Taille</h4>
              <div class="size-options">
                <button
                  v-for="size in product.sizes"
                  :key="size"
                  class="size-option"
                  :class="{ active: selectedSize === size }"
                  @click="selectedSize = size"
                >
                  {{ size }}
                </button>
              </div>
            </div>

            <!-- Quantité -->
            <div class="option-group">
              <h4 class="option-title">Quantité</h4>
              <div class="quantity-controls">
                <button 
                  class="quantity-btn"
                  :disabled="quantity <= 1"
                  @click="decreaseQuantity"
                >
                  -
                </button>
                <input 
                  v-model.number="quantity"
                  type="number"
                  class="quantity-input"
                  min="1"
                  :max="product.stock"
                />
                <button 
                  class="quantity-btn"
                  :disabled="quantity >= product.stock"
                  @click="increaseQuantity"
                >
                  +
                </button>
              </div>
              <div class="stock-info">
                {{ product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock' }}
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="product-actions">
            <button 
              class="btn btn-primary btn-lg add-to-cart-btn"
              :disabled="product.stock === 0 || isAddingToCart"
              @click="handleAddToCart"
            >
              <span v-if="isAddingToCart" class="spinner"></span>
              <span v-else-if="product.stock === 0">Rupture de stock</span>
              <span v-else>Ajouter au panier</span>
            </button>
            
            <button 
              class="btn btn-outline wishlist-btn"
              @click="handleAddToWishlist"
            >
              <span class="btn-icon">♡</span>
              Liste de souhaits
            </button>
          </div>

          <!-- Informations supplémentaires -->
          <div class="product-meta">
            <div class="meta-item">
              <span class="meta-label">Marque:</span>
              <span class="meta-value">{{ product.brand }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Catégorie:</span>
              <span class="meta-value">{{ getCategoryName(product.category) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">SKU:</span>
              <span class="meta-value">{{ product.sku || product._id }}</span>
            </div>
            <div v-if="product.weight" class="meta-item">
              <span class="meta-label">Poids:</span>
              <span class="meta-value">{{ product.weight }}g</span>
            </div>
            <div v-if="product.dimensions" class="meta-item">
              <span class="meta-label">Dimensions:</span>
              <span class="meta-value">{{ product.dimensions }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Onglets d'informations -->
      <div class="product-tabs">
        <div class="tabs-header">
          <button 
            v-for="tab in tabs"
            :key="tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <div class="tabs-content">
          <!-- Description détaillée -->
          <div v-if="activeTab === 'description'" class="tab-panel">
            <div v-html="product.detailedDescription || product.description"></div>
          </div>

          <!-- Spécifications -->
          <div v-if="activeTab === 'specifications'" class="tab-panel">
            <div v-if="product.specifications" class="specifications">
              <div 
                v-for="(value, key) in product.specifications" 
                :key="key"
                class="spec-item"
              >
                <span class="spec-label">{{ key }}:</span>
                <span class="spec-value">{{ value }}</span>
              </div>
            </div>
            <p v-else class="no-specs">Aucune spécification disponible</p>
          </div>

          <!-- Avis -->
          <div v-if="activeTab === 'reviews'" class="tab-panel" ref="reviewsSection">
            <div class="reviews-summary">
              <div class="rating-overview">
                <div class="rating-score">{{ product.rating }}</div>
                <div class="rating-stars">
                  <span 
                    v-for="star in 5" 
                    :key="star"
                    class="star"
                    :class="{ filled: star <= Math.floor(product.rating) }"
                  >★</span>
                </div>
                <div class="rating-text">Basé sur {{ product.reviewCount || 0 }} avis</div>
              </div>
            </div>

            <div class="reviews-list">
              <div 
                v-for="review in product.reviews || []" 
                :key="review.id"
                class="review-item"
              >
                <div class="review-header">
                  <div class="reviewer-info">
                    <div class="reviewer-name">{{ review.userName }}</div>
                    <div class="review-date">{{ formatDate(review.date) }}</div>
                  </div>
                  <div class="review-rating">
                    <span 
                      v-for="star in 5" 
                      :key="star"
                      class="star"
                      :class="{ filled: star <= review.rating }"
                    >★</span>
                  </div>
                </div>
                <div class="review-content">
                  <h4 class="review-title">{{ review.title }}</h4>
                  <p class="review-text">{{ review.comment }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Livraison et retours -->
          <div v-if="activeTab === 'shipping'" class="tab-panel">
            <div class="shipping-info">
              <h3>Livraison</h3>
              <ul>
                <li>Livraison gratuite à partir de 50€</li>
                <li>Livraison standard: 2-3 jours ouvrés</li>
                <li>Livraison express: 24h (frais supplémentaires)</li>
                <li>Suivi de commande en temps réel</li>
              </ul>

              <h3>Retours</h3>
              <ul>
                <li>Retour gratuit sous 30 jours</li>
                <li>Produit neuf et dans son emballage d'origine</li>
                <li>Remboursement ou échange</li>
                <li>Service client disponible 7j/7</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Produits similaires -->
      <div v-if="relatedProducts.length > 0" class="related-products">
        <h2 class="section-title">Produits similaires</h2>
        <div class="related-grid">
          <ProductCard
            v-for="relatedProduct in relatedProducts"
            :key="relatedProduct._id"
            :product="relatedProduct"
            view-mode="grid"
            @add-to-cart="handleAddToCart"
            @add-to-wishlist="handleAddToWishlist"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductCard from '../components/ProductCard.vue'
import { useCartStore } from '../stores/cart'

// Props
const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

// Router et store
const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

// État local
const product = ref(null)
const isLoading = ref(true)
const selectedImage = ref('')
const selectedColor = ref('')
const selectedSize = ref('')
const quantity = ref(1)
const isAddingToCart = ref(false)
const activeTab = ref('description')
const relatedProducts = ref([])

// Onglets
const tabs = [
  { id: 'description', label: 'Description' },
  { id: 'specifications', label: 'Spécifications' },
  { id: 'reviews', label: 'Avis' },
  { id: 'shipping', label: 'Livraison & Retours' }
]

// Computed
const productId = computed(() => props.id || route.params.id)

// Fonctions
const loadProduct = async () => {
  try {
    isLoading.value = true
    
    // TODO: Remplacer par l'appel API réel
    // const response = await api.get(`/products/${productId.value}`)
    // product.value = response.data.data
    
    // Données de test
    product.value = generateMockProduct()
    selectedImage.value = product.value.images[0]
    selectedColor.value = product.value.colors[0]
    selectedSize.value = product.value.sizes?.[0]
    
    // Charger les produits similaires
    loadRelatedProducts()
    
  } catch (error) {
    console.error('Erreur lors du chargement du produit:', error)
    product.value = null
  } finally {
    isLoading.value = false
  }
}

const generateMockProduct = () => {
  return {
    _id: productId.value,
    name: 'Chargeur Sans Fil iPhone 15 Pro Max',
    description: 'Chargeur sans fil ultra-rapide compatible avec tous les modèles iPhone. Design élégant et compact.',
    detailedDescription: `
      <p>Découvrez notre chargeur sans fil dernière génération, spécialement conçu pour les iPhone 15 Pro Max. 
      Avec une puissance de 15W, il charge votre téléphone rapidement et efficacement.</p>
      
      <h4>Caractéristiques principales :</h4>
      <ul>
        <li>Chargement sans fil jusqu'à 15W</li>
        <li>Compatible avec tous les modèles iPhone</li>
        <li>Design compact et portable</li>
        <li>Protection contre la surchauffe</li>
        <li>LED de statut de chargement</li>
      </ul>
    `,
    price: 49.99,
    originalPrice: 69.99,
    isOnSale: true,
    discountPercentage: 29,
    isNew: true,
    isFeatured: false,
    category: 'chargers',
    brand: 'apple',
    colors: ['black', 'white', 'blue'],
    sizes: ['Standard', 'Plus'],
    stock: 25,
    rating: 4.5,
    reviewCount: 128,
    images: [
      'https://via.placeholder.com/600x600?text=Chargeur+1',
      'https://via.placeholder.com/600x600?text=Chargeur+2',
      'https://via.placeholder.com/600x600?text=Chargeur+3',
      'https://via.placeholder.com/600x600?text=Chargeur+4'
    ],
    features: [
      'Chargement sans fil 15W',
      'Compatible iPhone 12/13/14/15',
      'Protection surchauffe',
      'LED de statut',
      'Design compact'
    ],
    specifications: {
      'Puissance': '15W',
      'Compatibilité': 'iPhone 12/13/14/15',
      'Tension': '5V/9V/12V',
      'Courant': '2A max',
      'Matériau': 'Plastique ABS',
      'Dimensions': '10 x 10 x 2 cm',
      'Poids': '150g'
    },
    weight: '150g',
    dimensions: '10 x 10 x 2 cm',
    sku: 'CHG-WL-15W-001',
    taxInfo: 'TVA incluse',
    reviews: [
      {
        id: 1,
        userName: 'Marie L.',
        rating: 5,
        title: 'Excellent chargeur',
        comment: 'Très satisfaite de cet achat. Le chargeur fonctionne parfaitement et charge rapidement mon iPhone.',
        date: '2024-01-15'
      },
      {
        id: 2,
        userName: 'Pierre M.',
        rating: 4,
        title: 'Bon rapport qualité-prix',
        comment: 'Bon produit, charge bien. Seul bémol : la LED est un peu trop brillante la nuit.',
        date: '2024-01-10'
      }
    ]
  }
}

const loadRelatedProducts = async () => {
  try {
    // TODO: Remplacer par l'appel API réel
    // const response = await api.get(`/products/${productId.value}/related`)
    // relatedProducts.value = response.data.data
    
    // Données de test
    relatedProducts.value = [
      {
        _id: 'related_1',
        name: 'Câble USB-C Lightning',
        price: 19.99,
        category: 'cables',
        brand: 'apple',
        images: ['https://via.placeholder.com/300x300?text=Cable+1'],
        rating: 4.2,
        isNew: false
      },
      {
        _id: 'related_2',
        name: 'Coque iPhone 15 Pro Max',
        price: 29.99,
        category: 'cases',
        brand: 'apple',
        images: ['https://via.placeholder.com/300x300?text=Coque+1'],
        rating: 4.7,
        isNew: true
      }
    ]
  } catch (error) {
    console.error('Erreur lors du chargement des produits similaires:', error)
  }
}

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/600x600?text=Image+Non+Disponible'
}

const increaseQuantity = () => {
  if (quantity.value < product.value.stock) {
    quantity.value++
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const handleAddToCart = async () => {
  try {
    isAddingToCart.value = true
    
    const cartItem = {
      ...product.value,
      selectedColor,
      selectedSize,
      quantity: quantity.value
    }
    
    cartStore.addToCart(cartItem)
    
    // Animation de succès
    setTimeout(() => {
      isAddingToCart.value = false
    }, 1000)
    
  } catch (error) {
    console.error('Erreur lors de l\'ajout au panier:', error)
    isAddingToCart.value = false
  }
}

const handleAddToWishlist = () => {
  // TODO: Implémenter la wishlist
  console.log('Ajouter à la wishlist:', product.value)
}

const scrollToReviews = () => {
  activeTab.value = 'reviews'
  setTimeout(() => {
    const reviewsSection = document.querySelector('.reviews-summary')
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }, 100)
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const getColorHex = (color) => {
  const colorMap = {
    black: '#000000',
    white: '#ffffff',
    blue: '#3b82f6',
    red: '#ef4444',
    green: '#10b981',
    pink: '#ec4899',
    purple: '#8b5cf6',
    gold: '#f59e0b'
  }
  return colorMap[color] || '#6b7280'
}

const getColorName = (color) => {
  const colorMap = {
    black: 'Noir',
    white: 'Blanc',
    blue: 'Bleu',
    red: 'Rouge',
    green: 'Vert',
    pink: 'Rose',
    purple: 'Violet',
    gold: 'Or'
  }
  return colorMap[color] || color
}

const getCategoryName = (category) => {
  const categoryMap = {
    chargers: 'Chargeurs',
    cases: 'Coques',
    cables: 'Câbles',
    earphones: 'Écouteurs',
    'screen-protectors': 'Protège-écrans',
    holders: 'Supports',
    'power-banks': 'Batteries externes'
  }
  return categoryMap[category] || category
}

// Watchers
watch(() => route.params.id, loadProduct, { immediate: true })

// Lifecycle
onMounted(() => {
  loadProduct()
})
</script>

<style scoped>
/* Page de détail du produit */
.product-detail-page {
  min-height: 100vh;
  background-color: #f8fafc;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: #6b7280;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;
  color: #6b7280;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 2rem 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.breadcrumb-link {
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.2s ease;
}

.breadcrumb-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.breadcrumb-separator {
  color: #d1d5db;
}

.breadcrumb-current {
  color: #374151;
  font-weight: 500;
}

/* Layout principal */
.product-detail-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

/* Galerie d'images */
.product-gallery {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.main-image {
  position: relative;
  aspect-ratio: 1;
  border-radius: 1rem;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sale-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: #ef4444;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.new-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #10b981;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.image-thumbnails {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding: 0.5rem 0;
}

.thumbnail {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border: 2px solid transparent;
  border-radius: 0.5rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.thumbnail:hover {
  border-color: #3b82f6;
}

.thumbnail.active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Informations du produit */
.product-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.product-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.2;
}

.product-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-new {
  background: #dbeafe;
  color: #1e40af;
}

.badge-sale {
  background: #fecaca;
  color: #dc2626;
}

.badge-featured {
  background: #fef3c7;
  color: #d97706;
}

/* Note et avis */
.product-rating {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.stars {
  display: flex;
  gap: 0.125rem;
}

.star {
  color: #d1d5db;
  font-size: 1.25rem;
}

.star.filled {
  color: #fbbf24;
}

.rating-value {
  font-weight: 600;
  color: #374151;
}

.rating-count {
  color: #6b7280;
  font-size: 0.875rem;
}

.reviews-link {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: underline;
}

/* Prix */
.product-pricing {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.price-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.current-price {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.original-price {
  font-size: 1.25rem;
  color: #9ca3af;
  text-decoration: line-through;
}

.savings {
  background: #fef3c7;
  color: #d97706;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
}

.tax-info {
  color: #6b7280;
  font-size: 0.875rem;
}

/* Description */
.product-description h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: #374151;
}

.product-description p {
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

/* Caractéristiques */
.product-features h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  color: #374151;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.features-list li {
  position: relative;
  padding-left: 1.5rem;
  color: #6b7280;
}

.features-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #10b981;
  font-weight: 600;
}

/* Options de personnalisation */
.product-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 1rem;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #374151;
}

.color-options {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.color-option {
  position: relative;
  width: 3rem;
  height: 3rem;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-option:hover {
  border-color: #3b82f6;
  transform: scale(1.1);
}

.color-option.active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.color-check {
  color: white;
  font-weight: 600;
  font-size: 1rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.color-option.active .color-check {
  opacity: 1;
}

.size-options {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.size-option {
  padding: 0.75rem 1.5rem;
  border: 2px solid #d1d5db;
  background: white;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.size-option:hover {
  border-color: #3b82f6;
}

.size-option.active {
  border-color: #3b82f6;
  background: #dbeafe;
  color: #1e40af;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 150px;
}

.quantity-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 0.375rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.quantity-btn:hover:not(:disabled) {
  background: #f3f4f6;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-input {
  flex: 1;
  height: 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  text-align: center;
  font-weight: 600;
}

.stock-info {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Actions */
.product-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.add-to-cart-btn {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
}

.wishlist-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  font-weight: 500;
}

.btn-icon {
  font-size: 1.25rem;
}

/* Informations supplémentaires */
.product-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 1rem;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.meta-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.meta-value {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 600;
}

/* Onglets */
.product-tabs {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 3rem;
}

.tabs-header {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
}

.tab-button {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.tab-button:hover {
  color: #374151;
  background: #f9fafb;
}

.tab-button.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  background: #f8fafc;
}

.tabs-content {
  padding: 2rem;
}

.tab-panel {
  min-height: 200px;
}

/* Spécifications */
.specifications {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.spec-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
}

.spec-label {
  font-weight: 500;
  color: #374151;
}

.spec-value {
  color: #6b7280;
}

.no-specs {
  color: #6b7280;
  font-style: italic;
  text-align: center;
  padding: 2rem;
}

/* Avis */
.reviews-summary {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 1rem;
}

.rating-overview {
  text-align: center;
}

.rating-score {
  font-size: 3rem;
  font-weight: 700;
  color: #1f2937;
}

.rating-stars {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  margin: 0.5rem 0;
}

.rating-text {
  color: #6b7280;
  font-size: 0.875rem;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.review-item {
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  background: white;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.reviewer-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.reviewer-name {
  font-weight: 600;
  color: #374151;
}

.review-date {
  font-size: 0.875rem;
  color: #6b7280;
}

.review-rating {
  display: flex;
  gap: 0.125rem;
}

.review-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.review-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.review-text {
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

/* Livraison */
.shipping-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #374151;
}

.shipping-info ul {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
}

.shipping-info li {
  position: relative;
  padding-left: 1.5rem;
  margin-bottom: 0.5rem;
  color: #6b7280;
}

.shipping-info li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #10b981;
  font-weight: 600;
}

/* Produits similaires */
.related-products {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 2rem 0;
  color: #1f2937;
  text-align: center;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .product-detail-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .product-gallery {
    max-width: 500px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .product-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .product-title {
    font-size: 1.75rem;
  }
  
  .product-actions {
    flex-direction: column;
  }
  
  .add-to-cart-btn {
    min-width: auto;
  }
  
  .tabs-header {
    flex-wrap: wrap;
  }
  
  .tab-button {
    flex: none;
    min-width: 120px;
  }
  
  .reviews-summary {
    flex-direction: column;
    text-align: center;
  }
  
  .related-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

@media (max-width: 480px) {
  .product-title {
    font-size: 1.5rem;
  }
  
  .current-price {
    font-size: 1.75rem;
  }
  
  .quantity-controls {
    max-width: 120px;
  }
  
  .tabs-content {
    padding: 1rem;
  }
  
  .related-grid {
    grid-template-columns: 1fr;
  }
}
</style>
