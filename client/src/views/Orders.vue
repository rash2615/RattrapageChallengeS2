<template>
  <div class="orders-page">
    <div class="container">
      <h2 class="mb-4">Mes commandes</h2>
      
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
      
      <!-- Liste des commandes -->
      <div v-else>
        <!-- Filtres -->
        <div class="filters mb-4">
          <div class="row">
            <div class="col-md-4">
              <select v-model="statusFilter" class="form-control" @change="loadOrders">
                <option value="">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="paid">Payée</option>
                <option value="processing">En cours</option>
                <option value="shipped">Expédiée</option>
                <option value="delivered">Livrée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </div>
            <div class="col-md-4">
              <input
                type="text"
                v-model="searchQuery"
                class="form-control"
                placeholder="Rechercher par numéro de commande..."
                @input="debouncedSearch"
              />
            </div>
            <div class="col-md-4">
              <select v-model="sortBy" class="form-control" @change="loadOrders">
                <option value="-createdAt">Plus récentes</option>
                <option value="createdAt">Plus anciennes</option>
                <option value="-total">Montant décroissant</option>
                <option value="total">Montant croissant</option>
              </select>
            </div>
          </div>
        </div>
        
        <!-- Commandes vides -->
        <div v-if="orders.length === 0" class="empty-orders text-center py-5">
          <div class="empty-orders-icon mb-3">📦</div>
          <h4>Aucune commande trouvée</h4>
          <p class="text-muted mb-4">Vous n'avez pas encore passé de commande</p>
          <router-link to="/products" class="btn btn-primary">
            Voir nos produits
          </router-link>
        </div>
        
        <!-- Liste des commandes -->
        <div v-else class="orders-list">
          <div 
            v-for="order in orders" 
            :key="order._id"
            class="order-card"
          >
            <div class="order-header">
              <div class="order-info">
                <h5 class="order-number">Commande #{{ order.orderNumber }}</h5>
                <p class="order-date">
                  Passée le {{ formatDate(order.createdAt) }}
                </p>
              </div>
              <div class="order-status">
                <span class="status-badge" :class="getStatusClass(order.status)">
                  {{ getStatusLabel(order.status) }}
                </span>
              </div>
            </div>
            
            <div class="order-content">
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
                    <h6 class="item-name">{{ item.product.name }}</h6>
                    <p class="item-brand">{{ item.product.brand }}</p>
                    <p class="item-quantity">Quantité: {{ item.quantity }}</p>
                  </div>
                  <div class="item-price">{{ item.price.toFixed(2) }}€</div>
                </div>
              </div>
              
              <div class="order-summary">
                <div class="summary-line">
                  <span>Sous-total</span>
                  <span>{{ order.subtotal.toFixed(2) }}€</span>
                </div>
                <div class="summary-line">
                  <span>Livraison</span>
                  <span>{{ order.shippingCost.toFixed(2) }}€</span>
                </div>
                <div class="summary-line">
                  <span>TVA</span>
                  <span>{{ order.tax.toFixed(2) }}€</span>
                </div>
                <hr>
                <div class="summary-line total">
                  <span><strong>Total</strong></span>
                  <span><strong>{{ order.total.toFixed(2) }}€</strong></span>
                </div>
              </div>
            </div>
            
            <div class="order-actions">
              <router-link 
                :to="`/order/${order._id}`" 
                class="btn btn-outline-primary"
              >
                Voir les détails
              </router-link>
              
              <button 
                v-if="order.status === 'pending'"
                class="btn btn-primary"
                @click="payOrder(order)"
              >
                Payer maintenant
              </button>
              
              <button 
                v-if="order.trackingNumber"
                class="btn btn-outline-secondary"
                @click="trackOrder(order.trackingNumber)"
              >
                Suivre la livraison
              </button>
            </div>
          </div>
        </div>
        
        <!-- Pagination -->
        <nav v-if="pagination.totalPages > 1" class="mt-4">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }">
              <button 
                class="page-link" 
                @click="changePage(pagination.currentPage - 1)"
                :disabled="pagination.currentPage === 1"
              >
                Précédent
              </button>
            </li>
            
            <li 
              v-for="page in visiblePages" 
              :key="page"
              class="page-item"
              :class="{ active: page === pagination.currentPage }"
            >
              <button class="page-link" @click="changePage(page)">
                {{ page }}
              </button>
            </li>
            
            <li class="page-item" :class="{ disabled: pagination.currentPage === pagination.totalPages }">
              <button 
                class="page-link" 
                @click="changePage(pagination.currentPage + 1)"
                :disabled="pagination.currentPage === pagination.totalPages"
              >
                Suivant
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'
import { debounce } from 'lodash-es'

const router = useRouter()
const authStore = useAuthStore()

const orders = ref([])
const loading = ref(true)
const error = ref('')
const statusFilter = ref('')
const searchQuery = ref('')
const sortBy = ref('-createdAt')

const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10
})

// Pages visibles pour la pagination
const visiblePages = computed(() => {
  const current = pagination.value.currentPage
  const total = pagination.value.totalPages
  const pages = []
  
  const start = Math.max(1, current - 2)
  const end = Math.min(total, current + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Charger les commandes
const loadOrders = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const params = new URLSearchParams()
    
    if (statusFilter.value) params.append('status', statusFilter.value)
    if (searchQuery.value) params.append('search', searchQuery.value)
    if (sortBy.value) params.append('sort', sortBy.value)
    params.append('page', pagination.value.currentPage)
    params.append('limit', pagination.value.itemsPerPage)
    
    const response = await api.get(`/orders?${params.toString()}`)
    
    orders.value = response.data.orders
    pagination.value = response.data.pagination
    
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur de chargement des commandes'
  } finally {
    loading.value = false
  }
}

// Recherche avec debounce
const debouncedSearch = debounce(() => {
  pagination.value.currentPage = 1
  loadOrders()
}, 500)

// Changer de page
const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.currentPage = page
    loadOrders()
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

// Gérer l'erreur d'image
const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/60x60?text=Image+non+disponible'
}

// Payer une commande
const payOrder = (order) => {
  // TODO: Implémenter le paiement
  console.log('Payer la commande:', order._id)
}

// Suivre une commande
const trackOrder = (trackingNumber) => {
  // TODO: Implémenter le suivi
  console.log('Suivre la commande:', trackingNumber)
}

// Watcher pour les changements de filtres
watch([statusFilter, sortBy], () => {
  pagination.value.currentPage = 1
  loadOrders()
})

onMounted(() => {
  // Vérifier que l'utilisateur est connecté
  if (!authStore.isAuthenticated) {
    router.push('/login?redirect=/orders')
    return
  }
  
  loadOrders()
})
</script>

<style scoped>
.orders-page {
  padding: 2rem 0;
}

.filters {
  background: white;
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
}

.empty-orders {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 3rem;
}

.empty-orders-icon {
  font-size: 4rem;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f8f9fa;
  border-bottom: 1px solid var(--border-color);
}

.order-number {
  margin-bottom: 0.25rem;
  color: #333;
}

.order-date {
  margin: 0;
  color: #666;
  font-size: 0.875rem;
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

.order-content {
  padding: 1.5rem;
}

.order-items {
  margin-bottom: 1.5rem;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: var(--border-radius);
}

.item-details {
  flex-grow: 1;
}

.item-name {
  margin-bottom: 0.25rem;
  color: #333;
}

.item-brand {
  color: var(--primary-color);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.item-quantity {
  color: #666;
  font-size: 0.875rem;
  margin: 0;
}

.item-price {
  font-weight: 600;
  color: var(--primary-color);
}

.order-summary {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: var(--border-radius);
}

.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.summary-line.total {
  font-size: 1.1rem;
  margin-top: 0.5rem;
}

.order-actions {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid var(--border-color);
  flex-wrap: wrap;
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
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .order-item {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  
  .item-image {
    align-self: center;
  }
  
  .order-actions {
    flex-direction: column;
  }
  
  .order-actions .btn {
    width: 100%;
  }
}
</style>
