<template>
  <div class="admin-orders">
    <div class="admin-header">
      <h1 class="page-title">Gestion des commandes</h1>
      <p class="page-subtitle">Administrer les commandes et suivre les livraisons</p>
    </div>

    <!-- Actions principales -->
    <div class="admin-actions">
      <button class="btn btn-primary" @click="handleAddOrder">
        <span class="btn-icon">➕</span>
        Créer une commande
      </button>
      <button class="btn btn-outline" @click="handleRefresh">
        <span class="btn-icon">🔄</span>
        Actualiser
      </button>
      <div class="status-filters">
        <select v-model="statusFilter" class="filter-select" @change="applyFilters">
          <option value="">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="paid">Payée</option>
          <option value="shipped">Expédiée</option>
          <option value="delivered">Livrée</option>
          <option value="cancelled">Annulée</option>
        </select>
      </div>
    </div>

    <!-- Tableau des commandes -->
    <AdvancedTable
      title="Commandes"
      subtitle="Gérez les commandes et leur statut"
      :data="filteredOrders"
      :columns="orderColumns"
      :actions="orderActions"
      :allow-selection="true"
      :allow-delete="true"
      :items-per-page="15"
      row-key="_id"
      @action="handleOrderAction"
      @export="handleExportOrders"
      @bulk-delete="handleBulkDeleteOrders"
      @search="handleSearch"
      @sort="handleSort"
    >
      <!-- Colonne numéro de commande -->
      <template #cell-orderNumber="{ value }">
        <span class="order-number">{{ value }}</span>
      </template>

      <!-- Colonne client -->
      <template #cell-customer="{ row }">
        <div class="customer-info">
          <h4 class="customer-name">{{ row.customer.firstName }} {{ row.customer.lastName }}</h4>
          <p class="customer-email">{{ row.customer.email }}</p>
        </div>
      </template>

      <!-- Colonne statut -->
      <template #cell-status="{ value }">
        <span class="status-badge" :class="`status-${value}`">
          {{ getStatusLabel(value) }}
        </span>
      </template>

      <!-- Colonne montant -->
      <template #cell-total="{ value }">
        <span class="order-total">{{ formatPrice(value) }}</span>
      </template>

      <!-- Colonne articles -->
      <template #cell-items="{ row }">
        <div class="order-items-preview">
          <span class="items-count">{{ row.items.length }} article(s)</span>
          <div class="items-list">
            <span 
              v-for="(item, index) in row.items.slice(0, 2)" 
              :key="index"
              class="item-name"
            >
              {{ item.product.name }}
            </span>
            <span v-if="row.items.length > 2" class="more-items">
              +{{ row.items.length - 2 }} autre(s)
            </span>
          </div>
        </div>
      </template>

      <!-- Colonne paiement -->
      <template #cell-paymentMethod="{ value }">
        <span class="payment-method" :class="`payment-${value}`">
          {{ getPaymentMethodLabel(value) }}
        </span>
      </template>
    </AdvancedTable>

    <!-- Modal de création/modification de commande -->
    <div v-if="showOrderModal" class="modal-overlay" @click="closeOrderModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">
            {{ editingOrder ? 'Modifier la commande' : 'Créer une commande' }}
          </h3>
          <button class="modal-close" @click="closeOrderModal">✕</button>
        </div>

        <form @submit.prevent="handleSaveOrder" class="modal-form">
          <!-- Sélection du client -->
          <div class="form-group">
            <label for="customer" class="form-label">Client *</label>
            <select
              id="customer"
              v-model="orderForm.customerId"
              class="form-select"
              :class="{ 'error': errors.customerId }"
              required
              @change="validateField('customerId')"
            >
              <option value="">Sélectionner un client</option>
              <option 
                v-for="user in users" 
                :key="user._id"
                :value="user._id"
              >
                {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
              </option>
            </select>
            <div v-if="errors.customerId" class="form-error">{{ errors.customerId }}</div>
          </div>

          <!-- Articles de la commande -->
          <div class="form-group">
            <label class="form-label">Articles *</label>
            <div class="order-items-section">
              <div 
                v-for="(item, index) in orderForm.items" 
                :key="index"
                class="order-item-row"
              >
                <div class="item-select">
                  <select
                    v-model="item.productId"
                    class="form-select"
                    @change="handleProductChange(index)"
                  >
                    <option value="">Sélectionner un produit</option>
                    <option 
                      v-for="product in products" 
                      :key="product._id"
                      :value="product._id"
                    >
                      {{ product.name }} - {{ formatPrice(product.price) }}
                    </option>
                  </select>
                </div>
                <div class="item-quantity">
                  <input
                    v-model.number="item.quantity"
                    type="number"
                    class="form-input"
                    min="1"
                    @input="calculateTotal"
                  />
                </div>
                <div class="item-price">
                  {{ formatPrice(item.price * item.quantity) }}
                </div>
                <button 
                  type="button"
                  class="remove-item-btn"
                  @click="removeOrderItem(index)"
                >
                  ✕
                </button>
              </div>
              <button 
                type="button"
                class="add-item-btn"
                @click="addOrderItem"
              >
                + Ajouter un article
              </button>
            </div>
          </div>

          <!-- Adresse de livraison -->
          <div class="form-group">
            <label for="shippingAddress" class="form-label">Adresse de livraison *</label>
            <textarea
              id="shippingAddress"
              v-model="orderForm.shippingAddress"
              class="form-textarea"
              :class="{ 'error': errors.shippingAddress }"
              required
              rows="3"
              @blur="validateField('shippingAddress')"
            ></textarea>
            <div v-if="errors.shippingAddress" class="form-error">{{ errors.shippingAddress }}</div>
          </div>

          <!-- Statut et paiement -->
          <div class="form-row">
            <div class="form-group">
              <label for="status" class="form-label">Statut *</label>
              <select
                id="status"
                v-model="orderForm.status"
                class="form-select"
                :class="{ 'error': errors.status }"
                required
                @change="validateField('status')"
              >
                <option value="">Sélectionner un statut</option>
                <option value="pending">En attente</option>
                <option value="paid">Payée</option>
                <option value="shipped">Expédiée</option>
                <option value="delivered">Livrée</option>
                <option value="cancelled">Annulée</option>
              </select>
              <div v-if="errors.status" class="form-error">{{ errors.status }}</div>
            </div>
            <div class="form-group">
              <label for="paymentMethod" class="form-label">Méthode de paiement</label>
              <select
                id="paymentMethod"
                v-model="orderForm.paymentMethod"
                class="form-select"
              >
                <option value="">Non spécifié</option>
                <option value="stripe">Carte bancaire</option>
                <option value="paypal">PayPal</option>
                <option value="cash">Espèces</option>
                <option value="transfer">Virement</option>
              </select>
            </div>
          </div>

          <!-- Total de la commande -->
          <div class="order-total-section">
            <div class="total-row">
              <span class="total-label">Sous-total</span>
              <span class="total-value">{{ formatPrice(orderForm.subtotal) }}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Livraison</span>
              <span class="total-value">{{ formatPrice(orderForm.shippingCost) }}</span>
            </div>
            <div class="total-row">
              <span class="total-label">TVA</span>
              <span class="total-value">{{ formatPrice(orderForm.taxAmount) }}</span>
            </div>
            <div class="total-row total-final">
              <span class="total-label">Total</span>
              <span class="total-value">{{ formatPrice(orderForm.total) }}</span>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="closeOrderModal">
              Annuler
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSaving">
              <span v-if="isSaving" class="spinner"></span>
              <span v-else>{{ editingOrder ? 'Modifier' : 'Créer' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <ConfirmModal
      v-if="showDeleteModal"
      :title="'Supprimer la commande'"
      :message="`Êtes-vous sûr de vouloir supprimer la commande ${orderToDelete?.orderNumber} ?`"
      :confirm-text="'Supprimer'"
      :cancel-text="'Annuler'"
      @confirm="confirmDeleteOrder"
      @cancel="cancelDeleteOrder"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import AdvancedTable from '../../components/AdvancedTable.vue'
import ConfirmModal from '../../components/ConfirmModal.vue'
import { createValidator, schemas } from '../../utils/validation'

// Router et stores
const router = useRouter()
const authStore = useAuthStore()

// État local
const orders = ref([])
const users = ref([])
const products = ref([])
const isLoading = ref(false)
const showOrderModal = ref(false)
const showDeleteModal = ref(false)
const editingOrder = ref(null)
const orderToDelete = ref(null)
const isSaving = ref(false)
const statusFilter = ref('')

// Formulaire commande
const orderForm = reactive({
  customerId: '',
  items: [{ productId: '', quantity: 1, price: 0 }],
  shippingAddress: '',
  status: 'pending',
  paymentMethod: '',
  subtotal: 0,
  shippingCost: 0,
  taxAmount: 0,
  total: 0
})

// Validation
const validator = createValidator(schemas.order)
const errors = reactive({})

// Computed
const filteredOrders = computed(() => {
  if (!statusFilter.value) return orders.value
  return orders.value.filter(order => order.status === statusFilter.value)
})

// Colonnes du tableau
const orderColumns = [
  {
    key: 'orderNumber',
    title: 'N° Commande',
    sortable: true,
    searchable: true,
    className: 'order-number-column'
  },
  {
    key: 'customer',
    title: 'Client',
    sortable: true,
    searchable: true,
    className: 'customer-column'
  },
  {
    key: 'status',
    title: 'Statut',
    sortable: true,
    searchable: true,
    className: 'status-column'
  },
  {
    key: 'total',
    title: 'Montant',
    sortable: true,
    searchable: false,
    type: 'currency',
    className: 'total-column'
  },
  {
    key: 'items',
    title: 'Articles',
    sortable: false,
    searchable: false,
    className: 'items-column'
  },
  {
    key: 'paymentMethod',
    title: 'Paiement',
    sortable: true,
    searchable: true,
    className: 'payment-column'
  },
  {
    key: 'createdAt',
    title: 'Créée le',
    sortable: true,
    searchable: false,
    type: 'date',
    className: 'date-column'
  }
]

// Actions du tableau
const orderActions = [
  {
    key: 'view',
    label: 'Voir',
    icon: '👁️',
    className: 'action-view',
    showLabel: false
  },
  {
    key: 'edit',
    label: 'Modifier',
    icon: '✏️',
    className: 'action-edit',
    showLabel: false
  },
  {
    key: 'duplicate',
    label: 'Dupliquer',
    icon: '📋',
    className: 'action-duplicate',
    showLabel: false
  },
  {
    key: 'delete',
    label: 'Supprimer',
    icon: '🗑️',
    className: 'action-delete',
    showLabel: false
  }
]

// Fonctions
const loadOrders = async () => {
  try {
    isLoading.value = true
    
    // TODO: Remplacer par l'appel API réel
    // const response = await api.get('/admin/orders')
    // orders.value = response.data.data
    
    // Données de test
    orders.value = generateMockOrders()
    
  } catch (error) {
    console.error('Erreur lors du chargement des commandes:', error)
  } finally {
    isLoading.value = false
  }
}

const loadUsers = async () => {
  try {
    // TODO: Remplacer par l'appel API réel
    // const response = await api.get('/admin/users')
    // users.value = response.data.data
    
    // Données de test
    users.value = generateMockUsers()
    
  } catch (error) {
    console.error('Erreur lors du chargement des utilisateurs:', error)
  }
}

const loadProducts = async () => {
  try {
    // TODO: Remplacer par l'appel API réel
    // const response = await api.get('/products')
    // products.value = response.data.data
    
    // Données de test
    products.value = generateMockProducts()
    
  } catch (error) {
    console.error('Erreur lors du chargement des produits:', error)
  }
}

const generateMockOrders = () => {
  const mockOrders = []
  const statuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled']
  const paymentMethods = ['stripe', 'paypal', 'cash', 'transfer']
  const mockUsers = generateMockUsers()
  const mockProducts = generateMockProducts()
  
  for (let i = 1; i <= 20; i++) {
    const customer = mockUsers[Math.floor(Math.random() * mockUsers.length)]
    const itemCount = Math.floor(Math.random() * 3) + 1
    const items = []
    
    for (let j = 0; j < itemCount; j++) {
      const product = mockProducts[Math.floor(Math.random() * mockProducts.length)]
      items.push({
        product: product,
        quantity: Math.floor(Math.random() * 2) + 1,
        price: product.price
      })
    }
    
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const shippingCost = subtotal >= 50 ? 0 : 4.99
    const taxAmount = subtotal * 0.2
    const total = subtotal + shippingCost + taxAmount
    
    mockOrders.push({
      _id: `order_${i}`,
      orderNumber: `CMD-${Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000}`,
      customer: customer,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      items: items,
      subtotal: subtotal,
      shippingCost: shippingCost,
      taxAmount: taxAmount,
      total: total,
      shippingAddress: `${Math.floor(Math.random() * 100) + 1} Rue de la Paix, 75001 Paris`,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000)
    })
  }
  
  return mockOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

const generateMockUsers = () => {
  const firstNames = ['Marie', 'Pierre', 'Sophie', 'Jean', 'Claire', 'Paul', 'Julie', 'Marc']
  const lastNames = ['Dupont', 'Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand']
  
  return firstNames.map((firstName, index) => ({
    _id: `user_${index + 1}`,
    firstName,
    lastName: lastNames[index],
    email: `${firstName.toLowerCase()}.${lastNames[index].toLowerCase()}@example.com`
  }))
}

const generateMockProducts = () => {
  return [
    { _id: 'prod_1', name: 'Chargeur Sans Fil iPhone 15 Pro Max', price: 49.99 },
    { _id: 'prod_2', name: 'Câble USB-C Lightning', price: 19.99 },
    { _id: 'prod_3', name: 'Coque iPhone 15 Pro Max', price: 29.99 },
    { _id: 'prod_4', name: 'Écouteurs Bluetooth', price: 79.99 },
    { _id: 'prod_5', name: 'Support Voiture Magnétique', price: 24.99 }
  ]
}

const handleAddOrder = () => {
  editingOrder.value = null
  resetOrderForm()
  showOrderModal.value = true
}

const handleRefresh = () => {
  loadOrders()
}

const applyFilters = () => {
  // Les filtres sont appliqués via computed
}

const handleOrderAction = ({ action, row }) => {
  switch (action) {
    case 'view':
      handleViewOrder(row)
      break
    case 'edit':
      handleEditOrder(row)
      break
    case 'duplicate':
      handleDuplicateOrder(row)
      break
    case 'delete':
      handleDeleteOrder(row)
      break
  }
}

const handleViewOrder = (order) => {
  // TODO: Ouvrir modal de détails commande
  console.log('Voir commande:', order)
}

const handleEditOrder = (order) => {
  editingOrder.value = order
  orderForm.customerId = order.customer._id
  orderForm.items = order.items.map(item => ({
    productId: item.product._id,
    quantity: item.quantity,
    price: item.price
  }))
  orderForm.shippingAddress = order.shippingAddress
  orderForm.status = order.status
  orderForm.paymentMethod = order.paymentMethod
  orderForm.subtotal = order.subtotal
  orderForm.shippingCost = order.shippingCost
  orderForm.taxAmount = order.taxAmount
  orderForm.total = order.total
  showOrderModal.value = true
}

const handleDuplicateOrder = (order) => {
  editingOrder.value = null
  orderForm.customerId = order.customer._id
  orderForm.items = order.items.map(item => ({
    productId: item.product._id,
    quantity: item.quantity,
    price: item.price
  }))
  orderForm.shippingAddress = order.shippingAddress
  orderForm.status = 'pending'
  orderForm.paymentMethod = ''
  calculateTotal()
  showOrderModal.value = true
}

const handleDeleteOrder = (order) => {
  orderToDelete.value = order
  showDeleteModal.value = true
}

const confirmDeleteOrder = async () => {
  if (!orderToDelete.value) return
  
  try {
    // TODO: Appel API pour supprimer la commande
    // await api.delete(`/admin/orders/${orderToDelete.value._id}`)
    
    // Supprimer de la liste locale
    const index = orders.value.findIndex(o => o._id === orderToDelete.value._id)
    if (index > -1) {
      orders.value.splice(index, 1)
    }
    
    showDeleteModal.value = false
    orderToDelete.value = null
  } catch (error) {
    console.error('Erreur suppression commande:', error)
    alert('Erreur lors de la suppression')
  }
}

const cancelDeleteOrder = () => {
  showDeleteModal.value = false
  orderToDelete.value = null
}

const handleBulkDeleteOrders = async (orderIds) => {
  if (confirm(`Supprimer ${orderIds.length} commande(s) ?`)) {
    try {
      // TODO: Appel API pour suppression en masse
      // await api.post('/admin/orders/bulk-delete', { orderIds })
      
      // Supprimer de la liste locale
      orders.value = orders.value.filter(o => !orderIds.includes(o._id))
      
      console.log('Commandes supprimées:', orderIds.length)
    } catch (error) {
      console.error('Erreur suppression en masse:', error)
      alert('Erreur lors de la suppression')
    }
  }
}

const handleExportOrders = (selectedOrders) => {
  const csvContent = generateCSV(selectedOrders)
  downloadCSV(csvContent, 'commandes.csv')
}

const generateCSV = (orders) => {
  const headers = ['N° Commande', 'Client', 'Email', 'Statut', 'Montant', 'Articles', 'Créée le']
  const rows = orders.map(order => [
    order.orderNumber,
    `${order.customer.firstName} ${order.customer.lastName}`,
    order.customer.email,
    getStatusLabel(order.status),
    formatPrice(order.total),
    order.items.length,
    formatDate(order.createdAt)
  ])
  
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

const downloadCSV = (content, filename) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const handleSaveOrder = async () => {
  const isValid = validator.validate(orderForm)
  if (!isValid) {
    Object.assign(errors, validator.getErrors())
    return
  }

  try {
    isSaving.value = true
    
    if (editingOrder.value) {
      // TODO: Appel API pour modifier la commande
      // await api.put(`/admin/orders/${editingOrder.value._id}`, orderForm)
      
      // Mettre à jour localement
      const index = orders.value.findIndex(o => o._id === editingOrder.value._id)
      if (index > -1) {
        orders.value[index] = { ...orders.value[index], ...orderForm }
      }
    } else {
      // TODO: Appel API pour créer la commande
      // const response = await api.post('/admin/orders', orderForm)
      
      // Ajouter localement
      const newOrder = {
        _id: `order_${Date.now()}`,
        orderNumber: `CMD-${Date.now()}`,
        customer: users.value.find(u => u._id === orderForm.customerId),
        ...orderForm,
        createdAt: new Date()
      }
      orders.value.unshift(newOrder)
    }
    
    closeOrderModal()
  } catch (error) {
    console.error('Erreur sauvegarde commande:', error)
    alert('Erreur lors de la sauvegarde')
  } finally {
    isSaving.value = false
  }
}

const closeOrderModal = () => {
  showOrderModal.value = false
  editingOrder.value = null
  resetOrderForm()
}

const resetOrderForm = () => {
  orderForm.customerId = ''
  orderForm.items = [{ productId: '', quantity: 1, price: 0 }]
  orderForm.shippingAddress = ''
  orderForm.status = 'pending'
  orderForm.paymentMethod = ''
  orderForm.subtotal = 0
  orderForm.shippingCost = 0
  orderForm.taxAmount = 0
  orderForm.total = 0
  Object.keys(errors).forEach(key => delete errors[key])
}

const handleProductChange = (index) => {
  const productId = orderForm.items[index].productId
  const product = products.value.find(p => p._id === productId)
  if (product) {
    orderForm.items[index].price = product.price
    calculateTotal()
  }
}

const addOrderItem = () => {
  orderForm.items.push({ productId: '', quantity: 1, price: 0 })
}

const removeOrderItem = (index) => {
  if (orderForm.items.length > 1) {
    orderForm.items.splice(index, 1)
    calculateTotal()
  }
}

const calculateTotal = () => {
  orderForm.subtotal = orderForm.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  orderForm.shippingCost = orderForm.subtotal >= 50 ? 0 : 4.99
  orderForm.taxAmount = orderForm.subtotal * 0.2
  orderForm.total = orderForm.subtotal + orderForm.shippingCost + orderForm.taxAmount
}

const validateField = (field) => {
  const isValid = validator.validateField(field, orderForm[field])
  if (!isValid) {
    errors[field] = validator.getFieldError(field)
  } else {
    delete errors[field]
  }
}

const handleSearch = ({ type, value, column }) => {
  console.log('Recherche:', { type, value, column })
}

const handleSort = ({ column, order }) => {
  console.log('Tri:', { column, order })
}

// Fonctions utilitaires
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

const getPaymentMethodLabel = (method) => {
  const methodMap = {
    stripe: 'Carte bancaire',
    paypal: 'PayPal',
    cash: 'Espèces',
    transfer: 'Virement'
  }
  return methodMap[method] || method
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
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  // Vérifier les permissions d'administration
  if (!authStore.isAuthenticated || authStore.user.role !== 'admin') {
    router.push('/')
    return
  }
  
  loadOrders()
  loadUsers()
  loadProducts()
})
</script>

<style scoped>
/* Page d'administration des commandes */
.admin-orders {
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 2rem;
}

/* En-tête */
.admin-header {
  margin-bottom: 2rem;
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

/* Actions principales */
.admin-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  align-items: center;
}

.status-filters {
  margin-left: auto;
}

.filter-select {
  padding: 0.5rem 1rem;
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

/* Colonnes spéciales */
.order-number-column {
  width: 8rem;
}

.customer-column {
  min-width: 200px;
}

.status-column {
  width: 8rem;
}

.total-column {
  width: 8rem;
}

.items-column {
  min-width: 200px;
}

.payment-column {
  width: 8rem;
}

.date-column {
  width: 10rem;
}

/* Numéro de commande */
.order-number {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #3b82f6;
}

/* Informations client */
.customer-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.customer-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.customer-email {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

/* Badges de statut */
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
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

/* Montant de la commande */
.order-total {
  font-weight: 600;
  color: #1f2937;
}

/* Articles de la commande */
.order-items-preview {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.items-count {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.item-name {
  font-size: 0.75rem;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.more-items {
  font-size: 0.75rem;
  color: #9ca3af;
  font-style: italic;
}

/* Méthode de paiement */
.payment-method {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.payment-stripe {
  background: #e0e7ff;
  color: #3730a3;
}

.payment-paypal {
  background: #dbeafe;
  color: #1e40af;
}

.payment-cash {
  background: #f3f4f6;
  color: #6b7280;
}

.payment-transfer {
  background: #d1fae5;
  color: #059669;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.large {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.modal-close {
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
  font-size: 1rem;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-form {
  padding: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error,
.form-select.error,
.form-textarea.error {
  border-color: #ef4444;
}

.form-error {
  font-size: 0.75rem;
  color: #ef4444;
}

/* Section articles de commande */
.order-items-section {
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  background: #f9fafb;
}

.order-item-row {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.order-item-row:last-child {
  border-bottom: none;
}

.item-select {
  min-width: 200px;
}

.item-quantity {
  width: 5rem;
}

.item-quantity input {
  text-align: center;
}

.item-price {
  font-weight: 600;
  color: #374151;
  min-width: 6rem;
  text-align: right;
}

.remove-item-btn {
  width: 2rem;
  height: 2rem;
  border: 1px solid #ef4444;
  background: white;
  color: #ef4444;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.remove-item-btn:hover {
  background: #ef4444;
  color: white;
}

.add-item-btn {
  width: 100%;
  padding: 0.75rem;
  border: 2px dashed #d1d5db;
  background: white;
  color: #6b7280;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
}

.add-item-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: #f0f9ff;
}

/* Section total de la commande */
.order-total-section {
  background: #f9fafb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.total-row:last-child {
  margin-bottom: 0;
}

.total-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.total-value {
  font-weight: 600;
  color: #374151;
}

.total-final {
  padding-top: 0.5rem;
  border-top: 1px solid #d1d5db;
  font-size: 1.125rem;
}

.total-final .total-label {
  font-weight: 600;
  color: #374151;
}

.total-final .total-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

/* Actions */
.action-buttons {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
  flex-wrap: wrap;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.action-button:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-view {
  color: #3b82f6;
  border-color: #3b82f6;
}

.action-edit {
  color: #059669;
  border-color: #059669;
}

.action-duplicate {
  color: #d97706;
  border-color: #d97706;
}

.action-delete {
  color: #dc2626;
  border-color: #dc2626;
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
@media (max-width: 768px) {
  .admin-orders {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .admin-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .status-filters {
    margin-left: 0;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .order-item-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .item-select {
    min-width: auto;
  }
  
  .item-price {
    text-align: left;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .admin-orders {
    padding: 0.5rem;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .modal-content {
    margin: 0.5rem;
  }
  
  .modal-header,
  .modal-form {
    padding: 1rem;
  }
}
</style>
