<template>
  <div class="cart-page">
    <div class="container">
      <h2 class="mb-4">Mon panier</h2>
      
      <!-- Panier vide -->
      <div v-if="cartStore.isEmpty" class="empty-cart text-center py-5">
        <div class="empty-cart-icon mb-3">🛒</div>
        <h4>Votre panier est vide</h4>
        <p class="text-muted mb-4">Découvrez nos produits et ajoutez-les à votre panier</p>
        <router-link to="/products" class="btn btn-primary">
          Voir nos produits
        </router-link>
      </div>
      
      <!-- Panier avec articles -->
      <div v-else class="row">
        <div class="col-lg-8">
          <div class="cart-items">
            <div 
              v-for="item in cartStore.items" 
              :key="item.product._id"
              class="cart-item"
            >
              <div class="item-image">
                <img 
                  :src="item.product.images?.[0]?.url || '/placeholder-product.jpg'" 
                  :alt="item.product.name"
                  @error="handleImageError"
                />
              </div>
              
              <div class="item-details">
                <h5 class="item-name">
                  <router-link :to="`/product/${item.product._id}`">
                    {{ item.product.name }}
                  </router-link>
                </h5>
                <p class="item-brand">{{ item.product.brand }}</p>
                <p class="item-category">{{ item.product.category }}</p>
                <div class="item-price">{{ item.product.price.toFixed(2) }}€</div>
              </div>
              
              <div class="item-quantity">
                <label class="form-label">Quantité</label>
                <div class="quantity-controls">
                  <button 
                    class="btn btn-outline-secondary btn-sm"
                    @click="updateQuantity(item.product._id, item.quantity - 1)"
                    :disabled="cartStore.loading"
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    :value="item.quantity"
                    @change="updateQuantityFromInput(item.product._id, $event.target.value)"
                    class="form-control quantity-input"
                    min="1"
                    :max="item.product.stock"
                    :disabled="cartStore.loading"
                  />
                  <button 
                    class="btn btn-outline-secondary btn-sm"
                    @click="updateQuantity(item.product._id, item.quantity + 1)"
                    :disabled="cartStore.loading || item.quantity >= item.product.stock"
                  >
                    +
                  </button>
                </div>
                <small class="text-muted">
                  Stock: {{ item.product.stock }} disponible(s)
                </small>
              </div>
              
              <div class="item-total">
                <div class="total-price">
                  {{ (item.product.price * item.quantity).toFixed(2) }}€
                </div>
                <button 
                  class="btn btn-danger btn-sm"
                  @click="removeItem(item.product._id)"
                  :disabled="cartStore.loading"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
          
          <!-- Actions du panier -->
          <div class="cart-actions mt-4">
            <button 
              class="btn btn-outline-danger"
              @click="clearCart"
              :disabled="cartStore.loading"
            >
              Vider le panier
            </button>
            <router-link to="/products" class="btn btn-outline-primary">
              Continuer mes achats
            </router-link>
          </div>
        </div>
        
        <!-- Résumé de commande -->
        <div class="col-lg-4">
          <div class="order-summary">
            <h5>Résumé de la commande</h5>
            
            <div class="summary-line">
              <span>Sous-total ({{ cartStore.itemCount }} article(s))</span>
              <span>{{ cartStore.total.toFixed(2) }}€</span>
            </div>
            
            <div class="summary-line">
              <span>Livraison</span>
              <span>{{ shippingCost.toFixed(2) }}€</span>
            </div>
            
            <div class="summary-line">
              <span>TVA (20%)</span>
              <span>{{ tax.toFixed(2) }}€</span>
            </div>
            
            <hr>
            
            <div class="summary-line total">
              <span><strong>Total</strong></span>
              <span><strong>{{ totalWithTax.toFixed(2) }}€</strong></span>
            </div>
            
            <div v-if="shippingCost === 0" class="alert alert-success mt-3">
              <small>🎉 Livraison gratuite !</small>
            </div>
            
            <div v-else class="alert alert-info mt-3">
              <small>Ajoutez {{ (100 - cartStore.total).toFixed(2) }}€ pour la livraison gratuite</small>
            </div>
            
            <button 
              class="btn btn-primary btn-lg w-100 mt-3"
              @click="proceedToCheckout"
              :disabled="cartStore.loading"
            >
              Passer la commande
            </button>
            
            <div class="payment-methods mt-3">
              <small class="text-muted">Paiement sécurisé avec :</small>
              <div class="payment-icons">
                <span>💳</span>
                <span>🔒</span>
                <span>✅</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useConfirmModalStore } from '../stores/confirmModal'

const router = useRouter()
const cartStore = useCartStore()
const confirmModal = useConfirmModalStore()

// Calculs
const shippingCost = computed(() => {
  return cartStore.total > 100 ? 0 : 10
})

const tax = computed(() => {
  return cartStore.total * 0.2
})

const totalWithTax = computed(() => {
  return cartStore.total + shippingCost.value + tax.value
})

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/100x100?text=Image+non+disponible'
}

const updateQuantity = async (productId, newQuantity) => {
  if (newQuantity <= 0) {
    await cartStore.removeItem(productId)
  } else {
    await cartStore.updateQuantity(productId, newQuantity)
  }
}

const updateQuantityFromInput = async (productId, value) => {
  const newQuantity = parseInt(value)
  if (isNaN(newQuantity) || newQuantity < 1) return
  
  await updateQuantity(productId, newQuantity)
}

const removeItem = async (productId) => {
  await cartStore.removeItem(productId)
}

const clearCart = () => {
  confirmModal.open({
    title: 'Vider le panier',
    message: 'Êtes-vous sûr de vouloir vider votre panier ? Cette action est irréversible.',
    onConfirm: async () => {
      await cartStore.clearCart()
    }
  })
}

const proceedToCheckout = () => {
  if (!cartStore.isEmpty) {
    router.push('/checkout')
  }
}
</script>

<style scoped>
.cart-page {
  padding: 2rem 0;
}

.empty-cart {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 3rem;
}

.empty-cart-icon {
  font-size: 4rem;
}

.cart-items {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  gap: 1rem;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  flex-shrink: 0;
}

.item-image img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--border-radius);
}

.item-details {
  flex-grow: 1;
  min-width: 0;
}

.item-name {
  margin-bottom: 0.5rem;
}

.item-name a {
  color: #333;
  text-decoration: none;
}

.item-name a:hover {
  color: var(--primary-color);
  text-decoration: underline;
}

.item-brand {
  color: var(--primary-color);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.item-category {
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.item-price {
  font-weight: 600;
  color: var(--primary-color);
}

.item-quantity {
  min-width: 120px;
  text-align: center;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.quantity-input {
  width: 60px;
  text-align: center;
}

.item-total {
  min-width: 100px;
  text-align: right;
}

.total-price {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.cart-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.order-summary {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 1.5rem;
  position: sticky;
  top: 100px;
}

.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.summary-line.total {
  font-size: 1.1rem;
  margin-top: 0.5rem;
}

.payment-methods {
  text-align: center;
}

.payment-icons {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 1.2rem;
}

.w-100 {
  width: 100%;
}

@media (max-width: 768px) {
  .cart-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .item-details {
    width: 100%;
  }
  
  .item-quantity,
  .item-total {
    width: 100%;
    text-align: left;
  }
  
  .item-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .order-summary {
    position: static;
    margin-top: 2rem;
  }
  
  .cart-actions {
    flex-direction: column;
  }
  
  .cart-actions .btn {
    width: 100%;
  }
}
</style>
