<template>
  <div class="cart-page">
    <div class="container">
      <!-- En-tête -->
      <div class="cart-header">
        <h1 class="page-title">Mon Panier</h1>
        <p class="page-subtitle">
          {{ cartStore.totalItems }} article{{ cartStore.totalItems > 1 ? 's' : '' }} dans votre panier
        </p>
      </div>

      <!-- Panier vide -->
      <div v-if="cartStore.isEmpty" class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h2 class="empty-cart-title">Votre panier est vide</h2>
        <p class="empty-cart-text">
          Découvrez notre sélection d'accessoires téléphoniques et ajoutez vos produits favoris.
        </p>
        <router-link to="/products" class="btn btn-primary btn-lg">
          Découvrir les produits
        </router-link>
      </div>

      <!-- Contenu du panier -->
      <div v-else class="cart-content">
        <div class="cart-layout">
          <!-- Liste des articles -->
          <div class="cart-items">
            <div class="items-header">
              <h2 class="items-title">Articles</h2>
              <button 
                class="clear-cart-btn"
                @click="handleClearCart"
                :disabled="cartStore.isLoading"
              >
                Vider le panier
              </button>
            </div>

            <div class="items-list">
              <div 
                v-for="item in cartStore.items" 
                :key="item.product._id"
                class="cart-item"
              >
                <!-- Image du produit -->
                <div class="item-image">
                  <router-link :to="`/products/${item.product._id}`">
                    <img 
                      :src="item.product.images[0] || '/placeholder-product.jpg'" 
                      :alt="item.product.name"
                      class="product-image"
                      @error="handleImageError"
                    />
                  </router-link>
                </div>

                <!-- Informations du produit -->
                <div class="item-info">
                  <div class="item-header">
                    <h3 class="item-name">
                      <router-link :to="`/products/${item.product._id}`">
                        {{ item.product.name }}
                      </router-link>
                    </h3>
                    <button 
                      class="remove-item-btn"
                      @click="handleRemoveItem(item.product._id)"
                      :disabled="cartStore.isLoading"
                      title="Supprimer du panier"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div class="item-details">
                    <span class="item-brand">{{ item.product.brand }}</span>
                    <span v-if="item.selectedColor" class="item-option">
                      Couleur: {{ getColorName(item.selectedColor) }}
                    </span>
                    <span v-if="item.selectedSize" class="item-option">
                      Taille: {{ item.selectedSize }}
                    </span>
                  </div>

                  <div class="item-pricing">
                    <span class="item-price">{{ formatPrice(item.product.price) }}</span>
                    <span v-if="item.product.originalPrice" class="item-original-price">
                      {{ formatPrice(item.product.originalPrice) }}
                    </span>
                  </div>
                </div>

                <!-- Contrôles de quantité -->
                <div class="item-controls">
                  <div class="quantity-controls">
                    <button 
                      class="quantity-btn"
                      :disabled="item.quantity <= 1 || cartStore.isLoading"
                      @click="handleDecreaseQuantity(item.product._id)"
                    >
                      -
                    </button>
                    <input 
                      :value="item.quantity"
                      type="number"
                      class="quantity-input"
                      min="1"
                      :max="item.product.stock"
                      @change="handleQuantityChange(item.product._id, $event.target.value)"
                    />
                    <button 
                      class="quantity-btn"
                      :disabled="item.quantity >= item.product.stock || cartStore.isLoading"
                      @click="handleIncreaseQuantity(item.product._id)"
                    >
                      +
                    </button>
                  </div>
                  
                  <div class="stock-info">
                    {{ item.product.stock > 0 ? `${item.product.stock} en stock` : 'Rupture de stock' }}
                  </div>
                </div>

                <!-- Prix total de l'article -->
                <div class="item-total">
                  <span class="total-label">Total</span>
                  <span class="total-price">{{ formatPrice(item.product.price * item.quantity) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Résumé de la commande -->
          <div class="cart-summary">
            <div class="summary-card">
              <h3 class="summary-title">Résumé de la commande</h3>
              
              <!-- Sous-total -->
              <div class="summary-row">
                <span class="summary-label">Sous-total</span>
                <span class="summary-value">{{ formatPrice(cartStore.totalPrice) }}</span>
              </div>

              <!-- Code promo -->
              <div class="coupon-section">
                <div class="coupon-input-group">
                  <input
                    v-model="couponCode"
                    type="text"
                    class="coupon-input"
                    placeholder="Code promo"
                    @keyup.enter="handleApplyCoupon"
                  />
                  <button 
                    class="coupon-btn"
                    @click="handleApplyCoupon"
                    :disabled="!couponCode.trim() || cartStore.isLoading"
                  >
                    Appliquer
                  </button>
                </div>
                <div v-if="appliedCoupon" class="coupon-applied">
                  <span class="coupon-name">{{ appliedCoupon.code }}</span>
                  <button 
                    class="remove-coupon-btn"
                    @click="handleRemoveCoupon"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <!-- Frais de livraison -->
              <div class="summary-row">
                <span class="summary-label">Livraison</span>
                <span class="summary-value">
                  <span v-if="shippingCost === null" class="shipping-tbd">À calculer</span>
                  <span v-else-if="shippingCost === 0" class="shipping-free">Gratuite</span>
                  <span v-else>{{ formatPrice(shippingCost) }}</span>
                </span>
              </div>

              <!-- Taxes -->
              <div class="summary-row">
                <span class="summary-label">TVA</span>
                <span class="summary-value">{{ formatPrice(taxAmount) }}</span>
              </div>

              <!-- Total -->
              <div class="summary-row total-row">
                <span class="summary-label">Total</span>
                <span class="summary-value">{{ formatPrice(finalTotal) }}</span>
              </div>

              <!-- Bouton de commande -->
              <button 
                class="checkout-btn"
                @click="handleCheckout"
                :disabled="cartStore.isLoading"
              >
                <span v-if="cartStore.isLoading" class="spinner"></span>
                <span v-else>Passer la commande</span>
              </button>

              <!-- Informations de sécurité -->
              <div class="security-info">
                <div class="security-item">
                  <span class="security-icon">🔒</span>
                  <span class="security-text">Paiement sécurisé</span>
                </div>
                <div class="security-item">
                  <span class="security-icon">🚚</span>
                  <span class="security-text">Livraison rapide</span>
                </div>
                <div class="security-item">
                  <span class="security-icon">↩️</span>
                  <span class="security-text">Retour gratuit</span>
                </div>
              </div>
            </div>

            <!-- Recommandations -->
            <div v-if="recommendedProducts.length > 0" class="recommendations">
              <h4 class="recommendations-title">Vous pourriez aussi aimer</h4>
              <div class="recommendations-list">
                <div 
                  v-for="product in recommendedProducts" 
                  :key="product._id"
                  class="recommendation-item"
                >
                  <img 
                    :src="product.images[0] || '/placeholder-product.jpg'" 
                    :alt="product.name"
                    class="recommendation-image"
                  />
                  <div class="recommendation-info">
                    <h5 class="recommendation-name">{{ product.name }}</h5>
                    <span class="recommendation-price">{{ formatPrice(product.price) }}</span>
                  </div>
                  <button 
                    class="add-recommendation-btn"
                    @click="handleAddRecommendation(product)"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'

// Router et stores
const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

// État local
const couponCode = ref('')
const appliedCoupon = ref(null)
const shippingCost = ref(null)
const recommendedProducts = ref([])

// Computed
const taxRate = 0.2 // 20% TVA
const taxAmount = computed(() => cartStore.totalPrice * taxRate)
const finalTotal = computed(() => {
  const subtotal = cartStore.totalPrice
  const tax = taxAmount.value
  const shipping = shippingCost.value || 0
  const discount = appliedCoupon.value?.discount || 0
  
  return subtotal + tax + shipping - discount
})

// Fonctions
const handleRemoveItem = async (productId) => {
  await cartStore.removeItem(productId)
}

const handleIncreaseQuantity = async (productId) => {
  const item = cartStore.items.find(item => item.product._id === productId)
  if (item) {
    await cartStore.updateQuantity(productId, item.quantity + 1)
  }
}

const handleDecreaseQuantity = async (productId) => {
  const item = cartStore.items.find(item => item.product._id === productId)
  if (item && item.quantity > 1) {
    await cartStore.updateQuantity(productId, item.quantity - 1)
  }
}

const handleQuantityChange = async (productId, newQuantity) => {
  const quantity = parseInt(newQuantity)
  if (quantity > 0) {
    await cartStore.updateQuantity(productId, quantity)
  }
}

const handleClearCart = async () => {
  if (confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
    await cartStore.clearCart()
  }
}

const handleApplyCoupon = async () => {
  if (!couponCode.value.trim()) return
  
  const result = await cartStore.applyCoupon(couponCode.value.trim())
  if (result.success) {
    appliedCoupon.value = result.data.coupon
    couponCode.value = ''
  }
}

const handleRemoveCoupon = () => {
  appliedCoupon.value = null
}

const handleCheckout = () => {
  if (!authStore.isAuthenticated) {
    router.push('/login?redirect=/checkout')
    return
  }
  
  router.push('/checkout')
}

const handleAddRecommendation = async (product) => {
  await cartStore.addItem(product, 1)
}

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/150x150?text=Image+Non+Disponible'
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

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const loadRecommendedProducts = async () => {
  try {
    // TODO: Remplacer par l'appel API réel
    // const response = await api.get('/products/recommended')
    // recommendedProducts.value = response.data.data
    
    // Données de test
    recommendedProducts.value = [
      {
        _id: 'rec_1',
        name: 'Câble USB-C Lightning',
        price: 19.99,
        images: ['https://via.placeholder.com/150x150?text=Cable+1'],
        brand: 'Apple'
      },
      {
        _id: 'rec_2',
        name: 'Coque iPhone 15 Pro Max',
        price: 29.99,
        images: ['https://via.placeholder.com/150x150?text=Coque+1'],
        brand: 'Apple'
      }
    ]
  } catch (error) {
    console.error('Erreur lors du chargement des recommandations:', error)
  }
}

const calculateShipping = async () => {
  try {
    // TODO: Implémenter le calcul des frais de livraison
    // const result = await cartStore.calculateShipping(address)
    // shippingCost.value = result.data.shippingCost
    
    // Simulation
    if (cartStore.totalPrice >= 50) {
      shippingCost.value = 0 // Livraison gratuite
    } else {
      shippingCost.value = 4.99 // Frais de livraison standard
    }
  } catch (error) {
    console.error('Erreur lors du calcul des frais de livraison:', error)
  }
}

// Lifecycle
onMounted(() => {
  // Charger le panier depuis le localStorage
  cartStore.loadCartFromStorage()
  
  // Charger les recommandations
  loadRecommendedProducts()
  
  // Calculer les frais de livraison
  calculateShipping()
})
</script>

<style scoped>
/* Page du panier */
.cart-page {
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 2rem 0;
}

/* En-tête */
.cart-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
}

/* Panier vide */
.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-cart-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.empty-cart-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
}

.empty-cart-text {
  color: #6b7280;
  margin: 0 0 2rem 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

/* Contenu du panier */
.cart-content {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  padding: 2rem;
}

/* Liste des articles */
.cart-items {
  display: flex;
  flex-direction: column;
}

.items-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.items-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.clear-cart-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.clear-cart-btn:hover:not(:disabled) {
  color: #dc2626;
}

.clear-cart-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Article du panier */
.cart-item {
  display: grid;
  grid-template-columns: 120px 1fr auto auto;
  gap: 1.5rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background: #f9fafb;
  transition: all 0.2s ease;
}

.cart-item:hover {
  border-color: #d1d5db;
  background: white;
}

.item-image {
  width: 120px;
  height: 120px;
  border-radius: 0.5rem;
  overflow: hidden;
  background: white;
}

.item-image a {
  display: block;
  width: 100%;
  height: 100%;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.product-image:hover {
  transform: scale(1.05);
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.item-name {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.item-name a {
  color: #1f2937;
  text-decoration: none;
  transition: color 0.2s ease;
}

.item-name a:hover {
  color: #3b82f6;
}

.remove-item-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.remove-item-btn:hover:not(:disabled) {
  background: #ef4444;
  color: white;
}

.remove-item-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-brand {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.item-option {
  font-size: 0.875rem;
  color: #6b7280;
}

.item-pricing {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.item-price {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
}

.item-original-price {
  font-size: 1rem;
  color: #9ca3af;
  text-decoration: line-through;
}

/* Contrôles de quantité */
.item-controls {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
  min-width: 120px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  padding: 0.25rem;
}

.quantity-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  background: #f3f4f6;
  color: #374151;
  border-radius: 0.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.2s ease;
}

.quantity-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-input {
  width: 3rem;
  height: 2rem;
  border: none;
  text-align: center;
  font-weight: 600;
  background: transparent;
}

.quantity-input:focus {
  outline: none;
}

.stock-info {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;
}

/* Prix total de l'article */
.item-total {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  min-width: 100px;
}

.total-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 500;
}

.total-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

/* Résumé de la commande */
.cart-summary {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.summary-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.summary-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1.5rem 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.summary-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.summary-value {
  font-weight: 600;
  color: #374151;
}

.total-row {
  padding-top: 1rem;
  border-top: 1px solid #d1d5db;
  font-size: 1.125rem;
}

.total-row .summary-label {
  font-weight: 600;
  color: #374151;
}

.total-row .summary-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

/* Code promo */
.coupon-section {
  margin: 1rem 0;
  padding: 1rem 0;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.coupon-input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.coupon-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
}

.coupon-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.coupon-btn {
  padding: 0.75rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.coupon-btn:hover:not(:disabled) {
  background: #2563eb;
}

.coupon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.coupon-applied {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #d1fae5;
  border: 1px solid #a7f3d0;
  border-radius: 0.5rem;
  color: #065f46;
}

.coupon-name {
  font-weight: 500;
  flex: 1;
}

.remove-coupon-btn {
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  background: #a7f3d0;
  color: #065f46;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

.shipping-tbd {
  color: #6b7280;
  font-style: italic;
}

.shipping-free {
  color: #059669;
  font-weight: 600;
}

/* Bouton de commande */
.checkout-btn {
  width: 100%;
  padding: 1rem 2rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 1.5rem 0;
}

.checkout-btn:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.checkout-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Informations de sécurité */
.security-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.security-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.security-icon {
  font-size: 1rem;
}

.security-text {
  font-weight: 500;
}

/* Recommandations */
.recommendations {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.recommendations-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.recommendation-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.recommendation-item:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.recommendation-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 0.375rem;
}

.recommendation-info {
  flex: 1;
  min-width: 0;
}

.recommendation-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recommendation-price {
  font-size: 0.875rem;
  font-weight: 600;
  color: #3b82f6;
}

.add-recommendation-btn {
  width: 2rem;
  height: 2rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #6b7280;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  transition: all 0.2s ease;
}

.add-recommendation-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #dbeafe;
}

/* Spinner */
.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-radius: 50%;
  border-top-color: currentColor;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .cart-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .cart-summary {
    order: -1;
  }
}

@media (max-width: 768px) {
  .cart-item {
    grid-template-columns: 100px 1fr;
    gap: 1rem;
  }
  
  .item-controls,
  .item-total {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 1rem;
  }
  
  .item-controls {
    align-items: center;
  }
  
  .item-total {
    align-items: center;
  }
  
  .coupon-input-group {
    flex-direction: column;
  }
  
  .security-info {
    flex-direction: row;
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .cart-page {
    padding: 1rem 0;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .cart-layout {
    padding: 1rem;
  }
  
  .cart-item {
    padding: 1rem;
  }
  
  .item-image {
    width: 80px;
    height: 80px;
  }
  
  .item-name {
    font-size: 1rem;
  }
}
</style>
