<template>
  <div class="card product-card">
    <div class="product-image">
      <img 
        :src="product.images?.[0]?.url || '/placeholder-product.jpg'" 
        :alt="product.images?.[0]?.alt || product.name"
        @error="handleImageError"
      />
      <div class="product-overlay">
        <router-link :to="`/product/${product._id}`" class="btn btn-primary">
          Voir détails
        </router-link>
      </div>
    </div>
    
    <div class="card-body">
      <h5 class="card-title">{{ product.name }}</h5>
      <p class="card-text">{{ product.description }}</p>
      
      <div class="product-meta">
        <span class="product-brand">{{ product.brand }}</span>
        <span class="product-category">{{ product.category }}</span>
      </div>
      
      <div class="product-price">
        <span class="price">{{ product.price.toFixed(2) }}€</span>
        <span v-if="product.stock < 10" class="stock-warning">
          Plus que {{ product.stock }} en stock !
        </span>
      </div>
      
      <div class="product-actions">
        <button 
          v-if="!cartStore.isInCart(product._id)"
          class="btn btn-primary btn-sm"
          @click="addToCart"
          :disabled="cartStore.loading || product.stock === 0"
        >
          <span v-if="cartStore.loading">...</span>
          <span v-else>Ajouter au panier</span>
        </button>
        
        <div v-else class="quantity-controls">
          <button 
            class="btn btn-outline-secondary btn-sm"
            @click="updateQuantity(-1)"
            :disabled="cartStore.loading"
          >
            -
          </button>
          <span class="quantity">
            {{ cartStore.getItemQuantity(product._id) }}
          </span>
          <button 
            class="btn btn-outline-secondary btn-sm"
            @click="updateQuantity(1)"
            :disabled="cartStore.loading || product.stock <= cartStore.getItemQuantity(product._id)"
          >
            +
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '../stores/cart'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const cartStore = useCartStore()

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/300x300?text=Image+non+disponible'
}

const addToCart = async () => {
  const result = await cartStore.addItem(props.product, 1)
  if (!result.success) {
    alert(result.error)
  }
}

const updateQuantity = async (change) => {
  const currentQuantity = cartStore.getItemQuantity(props.product._id)
  const newQuantity = currentQuantity + change
  
  if (newQuantity <= 0) {
    await cartStore.removeItem(props.product._id)
  } else {
    await cartStore.updateQuantity(props.product._id, newQuantity)
  }
}
</script>

<style scoped>
.product-card {
  height: 100%;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.product-image {
  position: relative;
  height: 200px;
  overflow: hidden;
  border-radius: var(--border-radius) var(--border-radius) 0 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease-in-out;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.card-body {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

.card-text {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  flex-grow: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.8rem;
  color: #666;
}

.product-brand {
  font-weight: 500;
  color: var(--primary-color);
}

.product-category {
  background-color: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.product-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.price {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--primary-color);
}

.stock-warning {
  font-size: 0.8rem;
  color: var(--danger-color);
  font-weight: 500;
}

.product-actions {
  margin-top: auto;
}

.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.quantity {
  min-width: 2rem;
  text-align: center;
  font-weight: 500;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
</style>
