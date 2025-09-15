<template>
  <div class="order-detail-page">
    <div class="container">
      <!-- Breadcrumb -->
      <nav class="breadcrumb-nav mb-4">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <router-link to="/">Accueil</router-link>
          </li>
          <li class="breadcrumb-item">
            <router-link to="/orders">Mes commandes</router-link>
          </li>
          <li class="breadcrumb-item active">Commande #{{ order?.orderNumber }}</li>
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
      
      <!-- Détail de la commande -->
      <div v-else-if="order" class="row">
        <div class="col-lg-8">
          <!-- Informations de la commande -->
          <div class="order-info-card">
            <div class="card-header">
              <h4>Commande #{{ order.orderNumber }}</h4>
              <span class="status-badge" :class="getStatusClass(order.status)">
                {{ getStatusLabel(order.status) }}
              </span>
            </div>
            
            <div class="card-body">
              <div class="row">
                <div class="col-md-6">
                  <h6>Date de commande</h6>
                  <p>{{ formatDate(order.createdAt) }}</p>
                  
                  <h6>Méthode de paiement</h6>
                  <p>{{ getPaymentMethodLabel(order.paymentMethod) }}</p>
                  
                  <h6>Statut du paiement</h6>
                  <p>
                    <span class="payment-status" :class="getPaymentStatusClass(order.paymentStatus)">
                      {{ getPaymentStatusLabel(order.paymentStatus) }}
                    </span>
                  </p>
                </div>
                
                <div class="col-md-6">
                  <h6>Numéro de suivi</h6>
                  <p v-if="order.trackingNumber" class="tracking-number">
                    {{ order.trackingNumber }}
                    <button 
                      class="btn btn-sm btn-outline-primary ms-2"
                      @click="trackOrder(order.trackingNumber)"
                    >
                      Suivre
                    </button>
                  </p>
                  <p v-else class="text-muted">Non disponible</p>
                  
                  <h6>Notes</h6>
                  <p v-if="order.notes">{{ order.notes }}</p>
                  <p v-else class="text-muted">Aucune note</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Articles de la commande -->
          <div class="order-items-card">
            <h5>Articles commandés</h5>
            <div class="order-items">
              <div 
                v-for="item in order.items" 
                :key="item.product._id"
                class="order-item"
              >
                <img 
                  :src="item.product.images?.[0]?.url || '/placeholder-product.jpg'" 
                  :alt="item.product.name"
                  class="item-image"
                  @error="handleImageError"
                />
                <div class="item-details">
                  <h6 class="item-name">
                    <router-link :to="`/product/${item.product._id}`">
                      {{ item.product.name }}
                    </router-link>
                  </h6>
                  <p class="item-brand">{{ item.product.brand }}</p>
                  <p class="item-category">{{ item.product.category }}</p>
                </div>
                <div class="item-quantity">
                  <span class="quantity">{{ item.quantity }}</span>
                </div>
                <div class="item-price">
                  {{ item.price.toFixed(2) }}€
                </div>
                <div class="item-total">
                  {{ (item.price * item.quantity).toFixed(2) }}€
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-4">
          <!-- Adresses -->
          <div class="addresses-card">
            <h5>Adresses</h5>
            
            <div class="address-section">
              <h6>Facturation</h6>
              <address>
                {{ order.billingAddress.street }}<br>
                {{ order.billingAddress.postalCode }} {{ order.billingAddress.city }}<br>
                {{ order.billingAddress.country }}
              </address>
            </div>
            
            <div class="address-section">
              <h6>Livraison</h6>
              <address>
                {{ order.shippingAddress.street }}<br>
                {{ order.shippingAddress.postalCode }} {{ order.shippingAddress.city }}<br>
                {{ order.shippingAddress.country }}
              </address>
            </div>
          </div>
          
          <!-- Résumé financier -->
          <div class="summary-card">
            <h5>Résumé</h5>
            
            <div class="summary-line">
              <span>Sous-total</span>
              <span>{{ order.subtotal.toFixed(2) }}€</span>
            </div>
            
            <div class="summary-line">
              <span>Livraison</span>
              <span>{{ order.shippingCost.toFixed(2) }}€</span>
            </div>
            
            <div class="summary-line">
              <span>TVA (20%)</span>
              <span>{{ order.tax.toFixed(2) }}€</span>
            </div>
            
            <hr>
            
            <div class="summary-line total">
              <span><strong>Total</strong></span>
              <span><strong>{{ order.total.toFixed(2) }}€</strong></span>
            </div>
            
            <!-- Actions -->
            <div class="order-actions mt-4">
              <button 
                v-if="order.status === 'pending'"
                class="btn btn-primary w-100"
                @click="payOrder"
              >
                Payer maintenant
              </button>
              
              <button 
                v-if="order.trackingNumber"
                class="btn btn-outline-primary w-100"
                @click="trackOrder(order.trackingNumber)"
              >
                Suivre la livraison
              </button>
              
              <router-link 
                to="/orders" 
                class="btn btn-outline-secondary w-100"
              >
                Retour aux commandes
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const order = ref(null)
const loading = ref(true)
const error = ref('')

const loadOrder = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const response = await api.get(`/orders/${props.id}`)
    order.value = response.data.order
    
  } catch (err) {
    error.value = err.response?.data?.message || 'Commande non trouvée'
  } finally {
    loading.value = false
  }
}

// Formater la date
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Obtenir la classe CSS du statut
const getStatusClass = (status) => {
  const classes = {
    pending: 'status-pending',
    paid: 'status-paid',
    processing: 'status-processing',
    shipped: 'status-shipped',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled'
  }
  return classes[status] || 'status-pending'
}

// Obtenir le label du statut
const getStatusLabel = (status) => {
  const labels = {
    pending: 'En attente',
    paid: 'Payée',
    processing: 'En cours',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée'
  }
  return labels[status] || status
}

// Obtenir le label de la méthode de paiement
const getPaymentMethodLabel = (method) => {
  const labels = {
    stripe: 'Carte bancaire (Stripe)',
    paypal: 'PayPal',
    admin: 'Administrateur'
  }
  return labels[method] || method
}

// Obtenir la classe CSS du statut de paiement
const getPaymentStatusClass = (status) => {
  const classes = {
    pending: 'payment-pending',
    paid: 'payment-paid',
    failed: 'payment-failed',
    refunded: 'payment-refunded'
  }
  return classes[status] || 'payment-pending'
}

// Obtenir le label du statut de paiement
const getPaymentStatusLabel = (status) => {
  const labels = {
    pending: 'En attente',
    paid: 'Payé',
    failed: 'Échoué',
    refunded: 'Remboursé'
  }
  return labels[status] || status
}

// Gérer l'erreur d'image
const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/80x80?text=Image+non+disponible'
}

// Payer une commande
const payOrder = () => {
  // TODO: Implémenter le paiement
  console.log('Payer la commande:', order.value._id)
}

// Suivre une commande
const trackOrder = (trackingNumber) => {
  // TODO: Implémenter le suivi
  console.log('Suivre la commande:', trackingNumber)
}

onMounted(() => {
  // Vérifier que l'utilisateur est connecté
  if (!authStore.isAuthenticated) {
    router.push('/login?redirect=' + route.fullPath)
    return
  }
  
  loadOrder()
})
</script>

<style scoped>
.order-detail-page {
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

.order-info-card,
.order-items-card,
.addresses-card,
.summary-card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  margin-bottom: 2rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: #f8f9fa;
}

.card-body {
  padding: 1.5rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-paid {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-processing {
  background-color: #d4edda;
  color: #155724;
}

.status-shipped {
  background-color: #cce5ff;
  color: #004085;
}

.status-delivered {
  background-color: #d4edda;
  color: #155724;
}

.status-cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.payment-status {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.payment-pending {
  background-color: #fff3cd;
  color: #856404;
}

.payment-paid {
  background-color: #d4edda;
  color: #155724;
}

.payment-failed {
  background-color: #f8d7da;
  color: #721c24;
}

.payment-refunded {
  background-color: #e2e3e5;
  color: #383d41;
}

.tracking-number {
  font-family: monospace;
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  display: inline-block;
}

.order-items {
  margin-top: 1rem;
}

.order-item {
  display: grid;
  grid-template-columns: 80px 1fr auto auto auto;
  gap: 1rem;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--border-radius);
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
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.item-category {
  color: #666;
  font-size: 0.875rem;
  margin: 0;
}

.quantity {
  background: #f8f9fa;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-weight: 500;
}

.item-price {
  font-weight: 600;
  color: var(--primary-color);
}

.item-total {
  font-weight: 600;
  color: #333;
}

.address-section {
  margin-bottom: 1.5rem;
}

.address-section:last-child {
  margin-bottom: 0;
}

.address-section h6 {
  color: #333;
  margin-bottom: 0.5rem;
}

address {
  font-style: normal;
  line-height: 1.6;
  color: #666;
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

.order-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.w-100 {
  width: 100%;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3rem;
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
  .order-item {
    grid-template-columns: 60px 1fr;
    gap: 0.75rem;
  }
  
  .item-image {
    width: 60px;
    height: 60px;
  }
  
  .quantity,
  .item-price,
  .item-total {
    grid-column: 1 / -1;
    text-align: right;
    margin-top: 0.5rem;
  }
}
</style>
