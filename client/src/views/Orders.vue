<template>
  <div class="orders-page">
    <div class="container">
      <!-- En-tête -->
      <div class="orders-header">
        <h1 class="page-title">Mes commandes</h1>
        <p class="page-subtitle">Suivez l'état de vos commandes et consultez l'historique</p>
      </div>

      <!-- Filtres et recherche -->
      <div class="orders-filters">
        <div class="filters-row">
          <div class="search-section">
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="Rechercher une commande..."
              @input="handleSearch"
            />
            <button class="search-button" @click="handleSearch">
              <span class="search-icon">🔍</span>
            </button>
          </div>

          <div class="filter-controls">
            <select v-model="statusFilter" class="filter-select" @change="applyFilters">
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="paid">Payée</option>
              <option value="shipped">Expédiée</option>
              <option value="delivered">Livrée</option>
              <option value="cancelled">Annulée</option>
            </select>

            <select v-model="dateFilter" class="filter-select" @change="applyFilters">
              <option value="">Toutes les dates</option>
              <option value="last-week">Cette semaine</option>
              <option value="last-month">Ce mois</option>
              <option value="last-3-months">3 derniers mois</option>
              <option value="last-year">Cette année</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Chargement de vos commandes...</p>
      </div>

      <!-- Aucune commande -->
      <div v-else-if="filteredOrders.length === 0" class="no-orders">
        <div class="no-orders-icon">📦</div>
        <h2 class="no-orders-title">Aucune commande trouvée</h2>
        <p class="no-orders-text">
          {{ searchQuery || statusFilter || dateFilter 
            ? 'Aucune commande ne correspond à vos critères de recherche.' 
            : 'Vous n\'avez pas encore passé de commande.' 
          }}
        </p>
        <router-link to="/products" class="btn btn-primary btn-lg">
          Découvrir les produits
        </router-link>
      </div>

      <!-- Liste des commandes -->
      <div v-else class="orders-list">
        <div 
          v-for="order in paginatedOrders" 
          :key="order._id"
          class="order-card"
        >
          <!-- En-tête de la commande -->
          <div class="order-header">
            <div class="order-info">
              <h3 class="order-number">Commande #{{ order.orderNumber }}</h3>
              <p class="order-date">{{ formatDate(order.createdAt) }}</p>
            </div>
            <div class="order-status">
              <span class="status-badge" :class="`status-${order.status}`">
                {{ getStatusLabel(order.status) }}
              </span>
            </div>
          </div>

          <!-- Articles de la commande -->
          <div class="order-items">
            <div 
              v-for="item in order.items.slice(0, 3)" 
              :key="item._id"
              class="order-item"
            >
              <img 
                :src="item.product.images[0] || '/placeholder-product.jpg'" 
                :alt="item.product.name"
                class="item-image"
              />
              <div class="item-details">
                <h4 class="item-name">{{ item.product.name }}</h4>
                <div class="item-meta">
                  <span class="item-quantity">Quantité: {{ item.quantity }}</span>
                  <span v-if="item.selectedColor" class="item-option">
                    Couleur: {{ getColorName(item.selectedColor) }}
                  </span>
                  <span v-if="item.selectedSize" class="item-option">
                    Taille: {{ item.selectedSize }}
                  </span>
                </div>
              </div>
              <span class="item-price">{{ formatPrice(item.product.price * item.quantity) }}</span>
            </div>

            <!-- Plus d'articles -->
            <div v-if="order.items.length > 3" class="more-items">
              <button class="more-items-btn" @click="toggleOrderDetails(order._id)">
                <span v-if="expandedOrders.includes(order._id)">Voir moins</span>
                <span v-else>Voir {{ order.items.length - 3 }} article(s) de plus</span>
              </button>
            </div>
          </div>

          <!-- Articles supplémentaires (développés) -->
          <div v-if="expandedOrders.includes(order._id) && order.items.length > 3" class="additional-items">
            <div 
              v-for="item in order.items.slice(3)" 
              :key="item._id"
              class="order-item"
            >
              <img 
                :src="item.product.images[0] || '/placeholder-product.jpg'" 
                :alt="item.product.name"
                class="item-image"
              />
              <div class="item-details">
                <h4 class="item-name">{{ item.product.name }}</h4>
                <div class="item-meta">
                  <span class="item-quantity">Quantité: {{ item.quantity }}</span>
                  <span v-if="item.selectedColor" class="item-option">
                    Couleur: {{ getColorName(item.selectedColor) }}
                  </span>
                  <span v-if="item.selectedSize" class="item-option">
                    Taille: {{ item.selectedSize }}
                  </span>
                </div>
              </div>
              <span class="item-price">{{ formatPrice(item.product.price * item.quantity) }}</span>
            </div>
          </div>

          <!-- Résumé de la commande -->
          <div class="order-summary">
            <div class="summary-row">
              <span class="summary-label">Sous-total</span>
              <span class="summary-value">{{ formatPrice(order.subtotal) }}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Livraison</span>
              <span class="summary-value">
                <span v-if="order.shippingCost === 0" class="shipping-free">Gratuite</span>
                <span v-else>{{ formatPrice(order.shippingCost) }}</span>
              </span>
            </div>
            <div class="summary-row">
              <span class="summary-label">TVA</span>
              <span class="summary-value">{{ formatPrice(order.taxAmount) }}</span>
            </div>
            <div v-if="order.discountAmount > 0" class="summary-row">
              <span class="summary-label">Remise</span>
              <span class="summary-value discount">-{{ formatPrice(order.discountAmount) }}</span>
            </div>
            <div class="summary-row total-row">
              <span class="summary-label">Total</span>
              <span class="summary-value">{{ formatPrice(order.total) }}</span>
            </div>
          </div>

          <!-- Informations de livraison -->
          <div class="shipping-info">
            <h4 class="info-title">Livraison</h4>
            <div class="info-content">
              <p><strong>{{ order.shippingAddress.firstName }} {{ order.shippingAddress.lastName }}</strong></p>
              <p>{{ order.shippingAddress.address }}</p>
              <p>{{ order.shippingAddress.postalCode }} {{ order.shippingAddress.city }}</p>
              <p>{{ getCountryName(order.shippingAddress.country) }}</p>
            </div>
          </div>

          <!-- Suivi de livraison -->
          <div v-if="order.trackingNumber" class="tracking-info">
            <h4 class="info-title">Suivi de livraison</h4>
            <div class="tracking-content">
              <p><strong>Numéro de suivi:</strong> {{ order.trackingNumber }}</p>
              <p><strong>Transporteur:</strong> {{ order.carrier || 'Colissimo' }}</p>
              <a 
                :href="getTrackingUrl(order.trackingNumber, order.carrier)" 
                target="_blank"
                class="tracking-link"
              >
                Suivre ma commande →
              </a>
            </div>
          </div>

          <!-- Actions -->
          <div class="order-actions">
            <router-link 
              :to="`/orders/${order._id}`" 
              class="btn btn-outline"
            >
              Voir les détails
            </router-link>
            
            <button 
              v-if="order.status === 'delivered'"
              class="btn btn-primary"
              @click="handleReorder(order)"
            >
              Commander à nouveau
            </button>
            
            <button 
              v-if="order.status === 'pending' || order.status === 'paid'"
              class="btn btn-danger"
              @click="handleCancelOrder(order)"
            >
              Annuler la commande
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          class="pagination-btn"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          ← Précédent
        </button>
        
        <div class="pagination-pages">
          <button
            v-for="page in visiblePages"
            :key="page"
            class="pagination-page"
            :class="{ active: page === currentPage }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          class="pagination-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          Suivant →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'

// Router et stores
const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

// État local
const orders = ref([])
const isLoading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const dateFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const expandedOrders = ref([])

// Computed
const filteredOrders = computed(() => {
  let filtered = [...orders.value]

  // Recherche textuelle
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(order => 
      order.orderNumber.toLowerCase().includes(query) ||
      order.items.some(item => 
        item.product.name.toLowerCase().includes(query)
      )
    )
  }

  // Filtre par statut
  if (statusFilter.value) {
    filtered = filtered.filter(order => order.status === statusFilter.value)
  }

  // Filtre par date
  if (dateFilter.value) {
    const now = new Date()
    const filterDate = new Date()
    
    switch (dateFilter.value) {
      case 'last-week':
        filterDate.setDate(now.getDate() - 7)
        break
      case 'last-month':
        filterDate.setMonth(now.getMonth() - 1)
        break
      case 'last-3-months':
        filterDate.setMonth(now.getMonth() - 3)
        break
      case 'last-year':
        filterDate.setFullYear(now.getFullYear() - 1)
        break
    }
    
    filtered = filtered.filter(order => new Date(order.createdAt) >= filterDate)
  }

  return filtered
})

const totalPages = computed(() => 
  Math.ceil(filteredOrders.value.length / itemsPerPage)
)

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredOrders.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

// Fonctions
const loadOrders = async () => {
  try {
    isLoading.value = true
    
    // TODO: Remplacer par l'appel API réel
    // const response = await api.get('/orders')
    // orders.value = response.data.data
    
    // Données de test
    orders.value = generateMockOrders()
    
  } catch (error) {
    console.error('Erreur lors du chargement des commandes:', error)
  } finally {
    isLoading.value = false
  }
}

const generateMockOrders = () => {
  const mockOrders = []
  const statuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']
  const products = [
    { name: 'Chargeur Sans Fil iPhone 15 Pro Max', price: 49.99, images: ['https://via.placeholder.com/150x150?text=Chargeur+1'] },
    { name: 'Câble USB-C Lightning', price: 19.99, images: ['https://via.placeholder.com/150x150?text=Cable+1'] },
    { name: 'Coque iPhone 15 Pro Max', price: 29.99, images: ['https://via.placeholder.com/150x150?text=Coque+1'] },
    { name: 'Écouteurs Bluetooth', price: 79.99, images: ['https://via.placeholder.com/150x150?text=Ecouteurs+1'] }
  ]
  
  for (let i = 1; i <= 15; i++) {
    const itemCount = Math.floor(Math.random() * 3) + 1
    const orderItems = []
    
    for (let j = 0; j < itemCount; j++) {
      const product = products[Math.floor(Math.random() * products.length)]
      orderItems.push({
        _id: `item_${i}_${j}`,
        product: {
          ...product,
          _id: `product_${j}`
        },
        quantity: Math.floor(Math.random() * 2) + 1,
        selectedColor: Math.random() > 0.5 ? 'black' : null,
        selectedSize: Math.random() > 0.5 ? 'Standard' : null
      })
    }
    
    const subtotal = orderItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
    const shippingCost = subtotal >= 50 ? 0 : 4.99
    const taxAmount = subtotal * 0.2
    const total = subtotal + shippingCost + taxAmount
    
    mockOrders.push({
      _id: `order_${i}`,
      orderNumber: `CMD-${Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      items: orderItems,
      subtotal,
      shippingCost,
      taxAmount,
      discountAmount: Math.random() > 0.8 ? subtotal * 0.1 : 0,
      total,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      shippingAddress: {
        firstName: 'Marie',
        lastName: 'Dupont',
        address: '123 Rue de la Paix',
        city: 'Paris',
        postalCode: '75001',
        country: 'FR'
      },
      trackingNumber: Math.random() > 0.5 ? `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}` : null,
      carrier: 'Colissimo'
    })
  }
  
  return mockOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

const handleSearch = () => {
  currentPage.value = 1
}

const applyFilters = () => {
  currentPage.value = 1
}

const toggleOrderDetails = (orderId) => {
  const index = expandedOrders.value.indexOf(orderId)
  if (index > -1) {
    expandedOrders.value.splice(index, 1)
  } else {
    expandedOrders.value.push(orderId)
  }
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const handleReorder = async (order) => {
  try {
    // Ajouter tous les articles de la commande au panier
    for (const item of order.items) {
      await cartStore.addItem(item.product, item.quantity)
    }
    
    // Rediriger vers le panier
    router.push('/cart')
  } catch (error) {
    console.error('Erreur lors de la recommande:', error)
  }
}

const handleCancelOrder = async (order) => {
  if (confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
    try {
      // TODO: Implémenter l'annulation de commande
      // await api.put(`/orders/${order._id}/cancel`)
      
      // Mettre à jour le statut localement
      order.status = 'cancelled'
      
      console.log('Commande annulée:', order.orderNumber)
    } catch (error) {
      console.error('Erreur lors de l\'annulation:', error)
    }
  }
}

const getStatusLabel = (status) => {
  const statusMap = {
    pending: 'En attente',
    paid: 'Payée',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée'
  }
  return statusMap[status] || status
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

const getCountryName = (code) => {
  const countryMap = {
    FR: 'France',
    BE: 'Belgique',
    CH: 'Suisse',
    LU: 'Luxembourg'
  }
  return countryMap[code] || code
}

const getTrackingUrl = (trackingNumber, carrier) => {
  const carrierUrls = {
    'Colissimo': `https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}`,
    'Chronopost': `https://www.chronopost.fr/tracking-colis?listeNumerosLT=${trackingNumber}`,
    'DHL': `https://www.dhl.com/fr-fr/home/tracking.html?trackingNumber=${trackingNumber}`
  }
  return carrierUrls[carrier] || `https://www.laposte.fr/outils/suivre-vos-envois?code=${trackingNumber}`
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  // Vérifier l'authentification
  if (!authStore.isAuthenticated) {
    router.push('/login?redirect=/orders')
    return
  }
  
  loadOrders()
})
</script>

<style scoped>
/* Page des commandes */
.orders-page {
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 2rem 0;
}

/* En-tête */
.orders-header {
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

/* Filtres */
.orders-filters {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.filters-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-section {
  display: flex;
  flex: 1;
  min-width: 300px;
  background: #f9fafb;
  border-radius: 0.75rem;
  overflow: hidden;
}

.search-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  font-size: 1rem;
  outline: none;
}

.search-button {
  padding: 0.75rem 1rem;
  background: #3b82f6;
  border: none;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-button:hover {
  background: #2563eb;
}

.search-icon {
  font-size: 1.25rem;
}

.filter-controls {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  font-size: 0.875rem;
  min-width: 150px;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
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

/* Aucune commande */
.no-orders {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.no-orders-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.no-orders-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
}

.no-orders-text {
  color: #6b7280;
  margin: 0 0 2rem 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

/* Liste des commandes */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Carte de commande */
.order-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.2s ease;
}

.order-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

/* En-tête de la commande */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.order-number {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.order-date {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.order-status {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-pending {
  background: #fef3c7;
  color: #d97706;
}

.status-paid {
  background: #dbeafe;
  color: #1e40af;
}

.status-shipped {
  background: #e0e7ff;
  color: #5b21b6;
}

.status-delivered {
  background: #d1fae5;
  color: #059669;
}

.status-cancelled {
  background: #fecaca;
  color: #dc2626;
}

/* Articles de la commande */
.order-items {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f3f4f6;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 0.375rem;
  background: #f9fafb;
}

.item-details {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.item-quantity,
.item-option {
  font-size: 0.875rem;
  color: #6b7280;
}

.item-price {
  font-weight: 600;
  color: #374151;
  font-size: 1rem;
}

/* Plus d'articles */
.more-items {
  padding: 1rem 0;
  text-align: center;
  border-top: 1px solid #f3f4f6;
}

.more-items-btn {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.more-items-btn:hover {
  color: #1d4ed8;
}

/* Articles supplémentaires */
.additional-items {
  padding: 0 1.5rem 1.5rem 1.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

/* Résumé de la commande */
.order-summary {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
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
  padding-top: 0.75rem;
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

.shipping-free {
  color: #059669;
  font-weight: 600;
}

.discount {
  color: #059669;
}

/* Informations de livraison */
.shipping-info {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.info-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem 0;
}

.info-content {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
}

.info-content p {
  margin: 0 0 0.25rem 0;
}

.info-content p:last-child {
  margin-bottom: 0;
}

/* Suivi de livraison */
.tracking-info {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.tracking-content {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
}

.tracking-content p {
  margin: 0 0 0.5rem 0;
}

.tracking-content p:last-child {
  margin-bottom: 0;
}

.tracking-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.tracking-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

/* Actions */
.order-actions {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 0.25rem;
}

.pagination-page {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  min-width: 2.5rem;
  text-align: center;
}

.pagination-page:hover {
  background: #f3f4f6;
}

.pagination-page.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

/* Responsive */
@media (max-width: 768px) {
  .orders-page {
    padding: 1rem 0;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-section {
    min-width: auto;
  }
  
  .filter-controls {
    flex-direction: column;
  }
  
  .order-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .order-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .item-details {
    width: 100%;
  }
  
  .item-price {
    align-self: flex-end;
  }
  
  .order-actions {
    flex-direction: column;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .order-card {
    margin: 0 -0.5rem;
    border-radius: 0;
  }
  
  .order-header,
  .order-items,
  .order-summary,
  .shipping-info,
  .tracking-info,
  .order-actions {
    padding: 1rem;
  }
  
  .order-number {
    font-size: 1.125rem;
  }
  
  .item-image {
    width: 50px;
    height: 50px;
  }
}
</style>
