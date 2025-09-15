<template>
  <div class="product-detail-page">
    <div class="container">
      <!-- Breadcrumb -->
      <nav class="breadcrumb-nav mb-4">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <router-link to="/">Accueil</router-link>
          </li>
          <li class="breadcrumb-item">
            <router-link to="/products">Produits</router-link>
          </li>
          <li class="breadcrumb-item active">{{ product?.name }}</li>
        </ol>
      </nav>
      
      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Chargement...</span>
        </div>
      </div>
      
      <!-- Erreur -->
      <div v-else-if="error" class="alert alert-danger">
        {{ error }}
      </div>
      
      <!-- Produit -->
      <div v-else-if="product" class="row">
        <!-- Images -->
        <div class="col-md-6">
          <div class="product-images">
            <div class="main-image">
              <img 
                :src="selectedImage || product.images?.[0]?.url || '/placeholder-product.jpg'" 
                :alt="product.name"
                @error="handleImageError"
              />
            </div>
            
            <div v-if="product.images && product.images.length > 1" class="thumbnail-images">
              <img 
                v-for="(image, index) in product.images" 
                :key="index"
                :src="image.url" 
                :alt="image.alt || product.name"
                class="thumbnail"
                :class="{ active: selectedImage === image.url }"
                @click="selectedImage = image.url"
                @error="handleImageError"
              />
            </div>
          </div>
        </div>
        
        <!-- Informations -->
        <div class="col-md-6">
          <div class="product-info">
            <h1 class="product-title">{{ product.name }}</h1>
            
            <div class="product-meta mb-3">
              <span class="product-brand">{{ product.brand }}</span>
              <span class="product-category">{{ product.category }}</span>
            </div>
            
            <div class="product-price mb-3">
              <span class="price">{{ product.price.toFixed(2) }}€</span>
              <span v-if="product.stock < 10" class="stock-warning">
                Plus que {{ product.stock }} en stock !
              </span>
            </div>
            
            <div class="product-description mb-4">
              <h5>Description</h5>
              <p>{{ product.description }}</p>
            </div>
            
            <!-- Spécifications -->
            <div v-if="product.specifications && Object.keys(product.specifications).length > 0" class="product-specifications mb-4">
              <h5>Spécifications</h5>
              <table class="table table-sm">
                <tbody>
                  <tr v-for="(value, key) in product.specifications" :key="key">
                    <td><strong>{{ key }}</strong></td>
                    <td>{{ value }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- Tags -->
            <div v-if="product.tags && product.tags.length > 0" class="product-tags mb-4">
              <h5>Tags</h5>
              <div class="tags">
                <span v-for="tag in product.tags" :key="tag" class="tag">
                  {{ tag }}
                </span>
              </div>
            </div>
            
            <!-- Actions -->
            <div class="product-actions">
              <div v-if="!cartStore.isInCart(product._id)" class="add-to-cart">
                <div class="quantity-selector mb-3">
                  <label class="form-label">Quantité :</label>
                  <div class="quantity-controls">
                    <button 
                      class="btn btn-outline-secondary"
                      @click="decreaseQuantity"
                      :disabled="quantity <= 1"
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      v-model.number="quantity"
                      class="form-control quantity-input"
                      min="1"
                      :max="product.stock"
                    />
                    <button 
                      class="btn btn-outline-secondary"
                      @click="increaseQuantity"
                      :disabled="quantity >= product.stock"
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <button 
                  class="btn btn-primary btn-lg w-100"
                  @click="addToCart"
                  :disabled="cartStore.loading || product.stock === 0"
                >
                  <span v-if="cartStore.loading" class="spinner-border spinner-border-sm me-2"></span>
                  <span v-else-if="product.stock === 0">Rupture de stock</span>
                  <span v-else>Ajouter au panier</span>
                </button>
              </div>
              
              <div v-else class="cart-controls">
                <p class="text-success mb-3">
                  ✅ Ce produit est dans votre panier ({{ cartStore.getItemQuantity(product._id) }})
                </p>
                <div class="quantity-controls">
                  <button 
                    class="btn btn-outline-secondary"
                    @click="updateQuantity(-1)"
                    :disabled="cartStore.loading"
                  >
                    -
                  </button>
                  <span class="quantity">
                    {{ cartStore.getItemQuantity(product._id) }}
                  </span>
                  <button 
                    class="btn btn-outline-secondary"
                    @click="updateQuantity(1)"
                    :disabled="cartStore.loading || product.stock <= cartStore.getItemQuantity(product._id)"
                  >
                    +
                  </button>
                </div>
                <button 
                  class="btn btn-danger btn-sm mt-2"
                  @click="removeFromCart"
                  :disabled="cartStore.loading"
                >
                  Retirer du panier
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '../stores/cart'
import api from '../services/api'

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const route = useRoute()
const cartStore = useCartStore()

const product = ref(null)
const loading = ref(true)
const error = ref(null)
const selectedImage = ref(null)
const quantity = ref(1)

const loadProduct = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await api.get(`/products/${props.id}`)
    product.value = response.data.product
    
    // Sélectionner la première image
    if (product.value.images && product.value.images.length > 0) {
      selectedImage.value = product.value.images[0].url
    }
    
  } catch (err) {
    error.value = err.response?.data?.message || 'Produit non trouvé'
  } finally {
    loading.value = false
  }
}

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/500x500?text=Image+non+disponible'
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

const addToCart = async () => {
  const result = await cartStore.addItem(product.value, quantity.value)
  if (!result.success) {
    alert(result.error)
  }
}

const updateQuantity = async (change) => {
  const currentQuantity = cartStore.getItemQuantity(product.value._id)
  const newQuantity = currentQuantity + change
  
  if (newQuantity <= 0) {
    await cartStore.removeItem(product.value._id)
  } else {
    await cartStore.updateQuantity(product.value._id, newQuantity)
  }
}

const removeFromCart = async () => {
  await cartStore.removeItem(product.value._id)
}

onMounted(() => {
  loadProduct()
})
</script>

<style scoped>
.product-detail-page {
  padding: 2rem 0;
}

.breadcrumb-nav {
  background: #f8f9fa;
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius);
}

.breadcrumb {
  margin: 0;
  background: none;
  padding: 0;
}

.breadcrumb-item a {
  color: var(--primary-color);
  text-decoration: none;
}

.breadcrumb-item a:hover {
  text-decoration: underline;
}

.product-images {
  position: sticky;
  top: 100px;
}

.main-image {
  margin-bottom: 1rem;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--box-shadow);
}

.main-image img {
  width: 100%;
  height: 400px;
  object-fit: cover;
}

.thumbnail-images {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.thumbnail {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--border-radius);
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease-in-out;
}

.thumbnail:hover,
.thumbnail.active {
  border-color: var(--primary-color);
}

.product-info {
  padding-left: 2rem;
}

.product-title {
  color: #333;
  margin-bottom: 1rem;
}

.product-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.product-brand {
  font-weight: 500;
  color: var(--primary-color);
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.product-category {
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  color: #666;
}

.product-price {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.price {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color);
}

.stock-warning {
  color: var(--danger-color);
  font-weight: 500;
  font-size: 0.9rem;
}

.product-description h5,
.product-specifications h5,
.product-tags h5 {
  color: #333;
  margin-bottom: 0.5rem;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: #f8f9fa;
  color: #666;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
}

.quantity-selector {
  max-width: 200px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-input {
  width: 60px;
  text-align: center;
}

.quantity {
  min-width: 2rem;
  text-align: center;
  font-weight: 500;
}

.spinner-border {
  width: 1rem;
  height: 1rem;
  border-width: 0.125rem;
}

@keyframes spinner-border {
  to {
    transform: rotate(360deg);
  }
}

.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

@media (max-width: 768px) {
  .product-info {
    padding-left: 0;
    margin-top: 2rem;
  }
  
  .product-images {
    position: static;
  }
  
  .main-image img {
    height: 300px;
  }
}
</style>
