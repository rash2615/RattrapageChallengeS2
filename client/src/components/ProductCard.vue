<template>
  <div class="product-card" :class="`view-${viewMode}`">
    <!-- Image du produit -->
    <div class="product-image">
      <router-link :to="`/products/${product._id}`" class="image-link">
        <img 
          :src="primaryImage" 
          :alt="product.name"
          class="product-img"
          @error="handleImageError"
        />
        <!-- Badges -->
        <div class="product-badges">
          <span v-if="product.isNew" class="badge badge-new">Nouveau</span>
          <span v-if="product.isOnSale" class="badge badge-sale">Promo</span>
          <span v-if="product.isFeatured" class="badge badge-featured">Vedette</span>
        </div>
      </router-link>
      
      <!-- Actions rapides -->
      <div class="product-actions">
        <button 
          class="action-button wishlist-button"
          :class="{ active: isInWishlist }"
          @click="toggleWishlist"
          :title="isInWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'"
        >
          <span class="action-icon">{{ isInWishlist ? '❤️' : '🤍' }}</span>
        </button>
        <button 
          class="action-button quick-view-button"
          @click="quickView"
          title="Aperçu rapide"
        >
          <span class="action-icon">👁️</span>
        </button>
      </div>
    </div>

    <!-- Informations du produit -->
    <div class="product-info">
      <!-- Marque -->
      <div class="product-brand">{{ product.brand }}</div>
      
      <!-- Nom du produit -->
      <h3 class="product-name">
        <router-link :to="`/products/${product._id}`" class="product-link">
          {{ product.name }}
        </router-link>
      </h3>
      
      <!-- Description courte -->
      <p class="product-description">{{ product.shortDescription }}</p>
      
      <!-- Spécifications -->
      <div class="product-specs">
        <div v-if="product.specifications?.power" class="spec">
          <span class="spec-label">Puissance:</span>
          <span class="spec-value">{{ product.specifications.power }}</span>
        </div>
        <div v-if="product.specifications?.connectivity" class="spec">
          <span class="spec-label">Connectivité:</span>
          <span class="spec-value">{{ product.specifications.connectivity }}</span>
        </div>
        <div v-if="product.specifications?.material" class="spec">
          <span class="spec-label">Matériau:</span>
          <span class="spec-value">{{ product.specifications.material }}</span>
        </div>
      </div>
      
      <!-- Compatibilité -->
      <div v-if="product.deviceCompatibility?.phones?.length" class="product-compatibility">
        <span class="compatibility-label">Compatible avec:</span>
        <div class="compatibility-devices">
          <span 
            v-for="device in compatibleDevices" 
            :key="device"
            class="device-tag"
          >
            {{ device }}
          </span>
          <span v-if="hasMoreDevices" class="device-tag more">
            +{{ product.deviceCompatibility.phones.length - 3 }}
          </span>
        </div>
      </div>
      
      <!-- Couleurs disponibles -->
      <div v-if="product.colors?.length" class="product-colors">
        <span class="colors-label">Couleurs:</span>
        <div class="colors-list">
          <span 
            v-for="color in product.colors.slice(0, 4)" 
            :key="color.name"
            class="color-option"
            :style="{ backgroundColor: color.hex }"
            :title="color.name"
          ></span>
          <span v-if="product.colors.length > 4" class="color-more">
            +{{ product.colors.length - 4 }}
          </span>
        </div>
      </div>
      
      <!-- Prix -->
      <div class="product-pricing">
        <div class="price-container">
          <span class="current-price">{{ formatPrice(product.price) }}</span>
          <span v-if="product.originalPrice && product.originalPrice > product.price" class="original-price">
            {{ formatPrice(product.originalPrice) }}
          </span>
        </div>
        <div v-if="product.originalPrice && product.originalPrice > product.price" class="discount">
          -{{ Math.round((1 - product.price / product.originalPrice) * 100) }}%
        </div>
      </div>
      
      <!-- Stock -->
      <div class="product-stock">
        <div v-if="product.stock > 10" class="stock-available">
          <span class="stock-icon">✅</span>
          <span>En stock</span>
        </div>
        <div v-else-if="product.stock > 0" class="stock-low">
          <span class="stock-icon">⚠️</span>
          <span>Plus que {{ product.stock }} en stock</span>
        </div>
        <div v-else class="stock-out">
          <span class="stock-icon">❌</span>
          <span>Rupture de stock</span>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="product-actions-bottom">
        <button 
          class="btn btn-primary add-to-cart-btn"
          :disabled="product.stock === 0 || isAddingToCart"
          @click="handleAddToCart"
        >
          <span v-if="isAddingToCart" class="spinner"></span>
          <span v-else-if="product.stock === 0">Rupture de stock</span>
          <span v-else>Ajouter au panier</span>
        </button>
        <router-link 
          :to="`/products/${product._id}`"
          class="btn btn-outline view-details-btn"
        >
          Voir détails
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCartStore } from '../stores/cart'
import { formatPrice } from '../utils/helpers'

// Props
const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  viewMode: {
    type: String,
    default: 'grid',
    validator: (value) => ['grid', 'list'].includes(value)
  }
})

// Emits
const emit = defineEmits(['add-to-cart'])

// Store
const cartStore = useCartStore()

// État local
const isAddingToCart = ref(false)
const isInWishlist = ref(false)

// Computed
const primaryImage = computed(() => {
  if (props.product.images?.length > 0) {
    const primaryImg = props.product.images.find(img => img.isPrimary)
    return primaryImg?.url || props.product.images[0].url
  }
  return '/images/placeholder-product.jpg'
})

const compatibleDevices = computed(() => {
  if (!props.product.deviceCompatibility?.phones) return []
  return props.product.deviceCompatibility.phones
    .slice(0, 3)
    .map(device => `${device.brand} ${device.model}`)
})

const hasMoreDevices = computed(() => {
  return props.product.deviceCompatibility?.phones?.length > 3
})

// Fonctions
const handleImageError = (event) => {
  event.target.src = '/images/placeholder-product.jpg'
}

const handleAddToCart = async () => {
  if (props.product.stock === 0 || isAddingToCart.value) return

  try {
    isAddingToCart.value = true
    
    const result = await cartStore.addItem(props.product, 1)
    
    if (result.success) {
      emit('add-to-cart', props.product)
    }
  } catch (error) {
    console.error('Erreur lors de l\'ajout au panier:', error)
  } finally {
    isAddingToCart.value = false
  }
}

const toggleWishlist = () => {
  isInWishlist.value = !isInWishlist.value
  // TODO: Implémenter la gestion des favoris
}

const quickView = () => {
  // TODO: Implémenter l'aperçu rapide
  console.log('Aperçu rapide:', props.product.name)
}
</script>

<style scoped>
/* Carte produit */
.product-card {
  background: white;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
}

/* Image du produit */
.product-image {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.image-link {
  display: block;
  width: 100%;
  height: 100%;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-img {
  transform: scale(1.05);
}

/* Badges */
.product-badges {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-new {
  background-color: #10b981;
  color: white;
}

.badge-sale {
  background-color: #ef4444;
  color: white;
}

.badge-featured {
  background-color: #f59e0b;
  color: white;
}

/* Actions rapides */
.product-actions {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .product-actions {
  opacity: 1;
}

.action-button {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: none;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-button:hover {
  background-color: white;
  transform: scale(1.1);
}

.action-button.active {
  background-color: #ef4444;
  color: white;
}

.action-icon {
  font-size: 1rem;
}

/* Informations du produit */
.product-info {
  padding: 1.5rem;
}

.product-brand {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.product-name {
  margin: 0 0 0.75rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.4;
}

.product-link {
  color: #1f2937;
  text-decoration: none;
  transition: color 0.3s ease;
}

.product-link:hover {
  color: #3b82f6;
}

.product-description {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Spécifications */
.product-specs {
  margin-bottom: 1rem;
}

.spec {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  font-size: 0.875rem;
}

.spec-label {
  color: #6b7280;
  font-weight: 500;
}

.spec-value {
  color: #1f2937;
  font-weight: 600;
}

/* Compatibilité */
.product-compatibility {
  margin-bottom: 1rem;
}

.compatibility-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  display: block;
  margin-bottom: 0.5rem;
}

.compatibility-devices {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.device-tag {
  background-color: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.device-tag.more {
  background-color: #e5e7eb;
  color: #6b7280;
}

/* Couleurs */
.product-colors {
  margin-bottom: 1rem;
}

.colors-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  display: block;
  margin-bottom: 0.5rem;
}

.colors-list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-option {
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-more {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

/* Prix */
.product-pricing {
  margin-bottom: 1rem;
}

.price-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.current-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.original-price {
  font-size: 1rem;
  color: #9ca3af;
  text-decoration: line-through;
}

.discount {
  background-color: #fef3c7;
  color: #92400e;
  padding: 0.125rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-block;
}

/* Stock */
.product-stock {
  margin-bottom: 1rem;
}

.stock-available,
.stock-low,
.stock-out {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.stock-available {
  color: #059669;
}

.stock-low {
  color: #d97706;
}

.stock-out {
  color: #dc2626;
}

.stock-icon {
  font-size: 1rem;
}

/* Actions du bas */
.product-actions-bottom {
  display: flex;
  gap: 0.75rem;
}

.add-to-cart-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.view-details-btn {
  flex: 1;
  text-align: center;
}

/* Responsive */
@media (max-width: 640px) {
  .product-info {
    padding: 1rem;
  }
  
  .product-actions-bottom {
    flex-direction: column;
  }
  
  .add-to-cart-btn,
  .view-details-btn {
    flex: none;
  }
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

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

/* Vue liste */
.product-card.view-list {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.product-card.view-list:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.product-card.view-list .product-image {
  width: 200px;
  height: 200px;
  flex-shrink: 0;
}

.product-card.view-list .product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0;
}

.product-card.view-list .product-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.product-card.view-list .product-brand {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.product-card.view-list .product-name {
  font-size: 1.25rem;
  margin: 0;
  flex: 1;
}

.product-card.view-list .product-description {
  margin: 0.75rem 0;
  color: #6b7280;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-card.view-list .product-pricing {
  margin: 1rem 0;
}

.product-card.view-list .product-actions {
  position: static;
  opacity: 1;
  transform: none;
  background: none;
  padding: 0;
  margin-left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.product-card.view-list .action-button {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
}

.product-card.view-list .add-to-cart-btn {
  margin-top: 1rem;
  align-self: flex-start;
}

/* Responsive pour vue liste */
@media (max-width: 768px) {
  .product-card.view-list {
    flex-direction: column;
    gap: 1rem;
  }
  
  .product-card.view-list .product-image {
    width: 100%;
    height: 250px;
  }
  
  .product-card.view-list .product-actions {
    flex-direction: row;
    margin-left: 0;
    margin-top: 1rem;
  }
}
</style>
