<template>
  <div class="admin-dashboard">
    <div class="admin-header">
      <h1 class="page-title">Tableau de bord</h1>
      <p class="page-subtitle">Vue d'ensemble de votre boutique SPARK</p>
    </div>

    <!-- Statistiques principales -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">💰</div>
        <div class="stat-content">
          <h3 class="stat-value">{{ formatPrice(totalRevenue) }}</h3>
          <p class="stat-label">Chiffre d'affaires</p>
          <span class="stat-change positive">+12.5%</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-content">
          <h3 class="stat-value">{{ totalOrders }}</h3>
          <p class="stat-label">Commandes</p>
          <span class="stat-change positive">+8.2%</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <h3 class="stat-value">{{ totalUsers }}</h3>
          <p class="stat-label">Utilisateurs</p>
          <span class="stat-change positive">+15.3%</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🛍️</div>
        <div class="stat-content">
          <h3 class="stat-value">{{ totalProducts }}</h3>
          <p class="stat-label">Produits</p>
          <span class="stat-change neutral">+2.1%</span>
        </div>
      </div>
    </div>

    <!-- Graphiques et analyses -->
    <div class="analytics-grid">
      <!-- Graphique des ventes -->
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Évolution des ventes</h3>
          <div class="chart-controls">
            <select v-model="salesPeriod" class="period-select" @change="updateSalesChart">
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">3 derniers mois</option>
              <option value="1y">1 an</option>
            </select>
          </div>
        </div>
        <div class="chart-container">
          <canvas ref="salesChart" class="chart-canvas"></canvas>
        </div>
      </div>

      <!-- Top produits -->
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Top produits</h3>
          <div class="chart-controls">
            <select v-model="topProductsPeriod" class="period-select" @change="updateTopProducts">
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">3 derniers mois</option>
            </select>
          </div>
        </div>
        <div class="chart-container">
          <canvas ref="topProductsChart" class="chart-canvas"></canvas>
        </div>
      </div>

      <!-- Répartition des ventes par catégorie -->
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Ventes par catégorie</h3>
        </div>
        <div class="chart-container">
          <canvas ref="categoryChart" class="chart-canvas"></canvas>
        </div>
      </div>

      <!-- Valeur moyenne du panier -->
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">Valeur moyenne du panier</h3>
          <div class="chart-controls">
            <select v-model="cartValuePeriod" class="period-select" @change="updateCartValueChart">
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">3 derniers mois</option>
            </select>
          </div>
        </div>
        <div class="chart-container">
          <canvas ref="cartValueChart" class="chart-canvas"></canvas>
        </div>
      </div>
    </div>

    <!-- Tableaux de données -->
    <div class="tables-grid">
      <!-- Dernières commandes -->
      <div class="table-card">
        <div class="table-header">
          <h3 class="table-title">Dernières commandes</h3>
          <router-link to="/admin/orders" class="view-all-link">
            Voir toutes →
          </router-link>
        </div>
        <div class="table-content">
          <div 
            v-for="order in recentOrders" 
            :key="order._id"
            class="table-row"
          >
            <div class="row-info">
              <span class="order-number">{{ order.orderNumber }}</span>
              <span class="customer-name">{{ order.customer.firstName }} {{ order.customer.lastName }}</span>
            </div>
            <div class="row-status">
              <span class="status-badge" :class="`status-${order.status}`">
                {{ getStatusLabel(order.status) }}
              </span>
            </div>
            <div class="row-amount">
              {{ formatPrice(order.total) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Nouveaux utilisateurs -->
      <div class="table-card">
        <div class="table-header">
          <h3 class="table-title">Nouveaux utilisateurs</h3>
          <router-link to="/admin/users" class="view-all-link">
            Voir tous →
          </router-link>
        </div>
        <div class="table-content">
          <div 
            v-for="user in recentUsers" 
            :key="user._id"
            class="table-row"
          >
            <div class="row-info">
              <div class="user-avatar">
                <img 
                  v-if="user.avatar" 
                  :src="user.avatar" 
                  :alt="user.firstName"
                  class="avatar-image"
                />
                <div v-else class="avatar-placeholder">
                  {{ getInitials(user.firstName, user.lastName) }}
                </div>
              </div>
              <div class="user-details">
                <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
                <span class="user-email">{{ user.email }}</span>
              </div>
            </div>
            <div class="row-date">
              {{ formatDate(user.createdAt) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions rapides -->
    <div class="quick-actions">
      <h3 class="actions-title">Actions rapides</h3>
      <div class="actions-grid">
        <router-link to="/admin/users" class="action-card">
          <div class="action-icon">👥</div>
          <div class="action-content">
            <h4 class="action-title">Gérer les utilisateurs</h4>
            <p class="action-description">Ajouter, modifier ou supprimer des comptes</p>
          </div>
        </router-link>

        <router-link to="/admin/orders" class="action-card">
          <div class="action-icon">📦</div>
          <div class="action-content">
            <h4 class="action-title">Gérer les commandes</h4>
            <p class="action-description">Suivre et traiter les commandes</p>
          </div>
        </router-link>

        <router-link to="/products" class="action-card">
          <div class="action-icon">🛍️</div>
          <div class="action-content">
            <h4 class="action-title">Gérer les produits</h4>
            <p class="action-description">Ajouter ou modifier des produits</p>
          </div>
        </router-link>

        <router-link to="/admin/analytics" class="action-card">
          <div class="action-icon">📊</div>
          <div class="action-content">
            <h4 class="action-title">Analytics & Rapports</h4>
            <p class="action-description">Analyser les performances et générer des rapports</p>
          </div>
        </router-link>

        <div class="action-card" @click="handleExportData">
          <div class="action-icon">💾</div>
          <div class="action-content">
            <h4 class="action-title">Exporter les données</h4>
            <p class="action-description">Télécharger les rapports</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { createChart, formatChartData } from '../../utils/charts'

// Router et stores
const router = useRouter()
const authStore = useAuthStore()

// État local
const salesPeriod = ref('30d')
const topProductsPeriod = ref('30d')
const cartValuePeriod = ref('30d')

// Refs pour les graphiques
const salesChart = ref(null)
const topProductsChart = ref(null)
const categoryChart = ref(null)
const cartValueChart = ref(null)

// Données
const totalRevenue = ref(125430.50)
const totalOrders = ref(1247)
const totalUsers = ref(892)
const totalProducts = ref(156)

const recentOrders = ref([])
const recentUsers = ref([])

// Computed
const salesData = computed(() => {
  // Données simulées pour les ventes
  const periods = {
    '7d': ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    '30d': Array.from({ length: 30 }, (_, i) => `J${i + 1}`),
    '90d': Array.from({ length: 12 }, (_, i) => `S${i + 1}`),
    '1y': ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  }
  
  const values = {
    '7d': [1200, 1500, 1800, 1600, 2000, 2200, 1900],
    '30d': Array.from({ length: 30 }, () => Math.floor(Math.random() * 2000) + 1000),
    '90d': Array.from({ length: 12 }, () => Math.floor(Math.random() * 5000) + 2000),
    '1y': [15000, 18000, 22000, 19000, 25000, 28000, 30000, 32000, 29000, 26000, 24000, 27000]
  }
  
  return {
    labels: periods[salesPeriod.value],
    data: values[salesPeriod.value]
  }
})

const topProductsData = computed(() => {
  const products = [
    'Chargeur Sans Fil',
    'Câble USB-C',
    'Coque iPhone',
    'Écouteurs Bluetooth',
    'Support Voiture'
  ]
  
  const values = Array.from({ length: 5 }, () => Math.floor(Math.random() * 100) + 20)
  
  return {
    labels: products,
    data: values
  }
})

const categoryData = computed(() => {
  return {
    labels: ['Chargeurs', 'Câbles', 'Coques', 'Écouteurs', 'Accessoires'],
    data: [35, 25, 20, 15, 5]
  }
})

const cartValueData = computed(() => {
  const periods = {
    '7d': ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
    '30d': Array.from({ length: 30 }, (_, i) => `J${i + 1}`),
    '90d': Array.from({ length: 12 }, (_, i) => `S${i + 1}`)
  }
  
  const values = {
    '7d': [45, 52, 48, 55, 60, 58, 62],
    '30d': Array.from({ length: 30 }, () => Math.floor(Math.random() * 30) + 40),
    '90d': Array.from({ length: 12 }, () => Math.floor(Math.random() * 20) + 45)
  }
  
  return {
    labels: periods[cartValuePeriod.value],
    data: values[cartValuePeriod.value]
  }
})

// Fonctions
const loadDashboardData = async () => {
  try {
    // TODO: Remplacer par les appels API réels
    // const [ordersResponse, usersResponse] = await Promise.all([
    //   api.get('/admin/orders?limit=5'),
    //   api.get('/admin/users?limit=5')
    // ])
    
    // Données de test
    recentOrders.value = generateMockOrders()
    recentUsers.value = generateMockUsers()
    
    // Initialiser les graphiques après le rendu
    await nextTick()
    initializeCharts()
    
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  }
}

const generateMockOrders = () => {
  const statuses = ['pending', 'paid', 'shipped', 'delivered']
  const firstNames = ['Marie', 'Pierre', 'Sophie', 'Jean', 'Claire']
  const lastNames = ['Dupont', 'Martin', 'Bernard', 'Thomas', 'Petit']
  
  return Array.from({ length: 5 }, (_, i) => ({
    _id: `order_${i + 1}`,
    orderNumber: `CMD-${Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000}`,
    customer: {
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)]
    },
    status: statuses[Math.floor(Math.random() * statuses.length)],
    total: Math.floor(Math.random() * 200) + 50
  }))
}

const generateMockUsers = () => {
  const firstNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve']
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Davis']
  
  return Array.from({ length: 5 }, (_, i) => ({
    _id: `user_${i + 1}`,
    firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
    lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
    email: `user${i + 1}@example.com`,
    avatar: Math.random() > 0.5 ? `https://via.placeholder.com/40x40?text=U${i + 1}` : null,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
  }))
}

const initializeCharts = () => {
  // Graphique des ventes
  if (salesChart.value) {
    drawLineChart(salesChart.value, {
      data: salesData.value.data,
      labels: salesData.value.labels,
      title: 'Ventes (€)',
      color: '#3b82f6'
    })
  }
  
  // Graphique des top produits
  if (topProductsChart.value) {
    drawBarChart(topProductsChart.value, {
      data: topProductsData.value.data,
      labels: topProductsData.value.labels,
      title: 'Ventes par produit',
      color: '#10b981'
    })
  }
  
  // Graphique des catégories
  if (categoryChart.value) {
    drawDoughnutChart(categoryChart.value, {
      data: categoryData.value.data,
      labels: categoryData.value.labels,
      title: 'Répartition des ventes',
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
    })
  }
  
  // Graphique de la valeur du panier
  if (cartValueChart.value) {
    drawLineChart(cartValueChart.value, {
      data: cartValueData.value.data,
      labels: cartValueData.value.labels,
      title: 'Valeur moyenne (€)',
      color: '#f59e0b'
    })
  }
}

const updateSalesChart = () => {
  if (salesChart.value) {
    drawLineChart(salesChart.value, {
      data: salesData.value.data,
      labels: salesData.value.labels,
      title: 'Ventes (€)',
      color: '#3b82f6'
    })
  }
}

const updateTopProducts = () => {
  if (topProductsChart.value) {
    drawBarChart(topProductsChart.value, {
      data: topProductsData.value.data,
      labels: topProductsData.value.labels,
      title: 'Ventes par produit',
      color: '#10b981'
    })
  }
}

const updateCartValueChart = () => {
  if (cartValueChart.value) {
    drawLineChart(cartValueChart.value, {
      data: cartValueData.value.data,
      labels: cartValueData.value.labels,
      title: 'Valeur moyenne (€)',
      color: '#f59e0b'
    })
  }
}

const handleExportData = () => {
  // TODO: Implémenter l'export des données
  console.log('Export des données')
  alert('Fonctionnalité d\'export en cours de développement')
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

const getInitials = (firstName, lastName) => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    month: 'short',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  // Vérifier les permissions d'administration
  if (!authStore.isAuthenticated || authStore.user.role !== 'admin') {
    router.push('/')
    return
  }
  
  loadDashboardData()
})
</script>

<style scoped>
/* Tableau de bord d'administration */
.admin-dashboard {
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

/* Grille des statistiques */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2.5rem;
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f9ff;
  border-radius: 0.75rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

.stat-change.positive {
  background: #d1fae5;
  color: #059669;
}

.stat-change.negative {
  background: #fecaca;
  color: #dc2626;
}

.stat-change.neutral {
  background: #f3f4f6;
  color: #6b7280;
}

/* Grille des analyses */
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.chart-controls {
  display: flex;
  gap: 0.5rem;
}

.period-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  font-size: 0.875rem;
  color: #374151;
}

.period-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.chart-container {
  position: relative;
  height: 300px;
}

.chart-canvas {
  width: 100%;
  height: 100%;
}

/* Grille des tableaux */
.tables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.table-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.table-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.view-all-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.view-all-link:hover {
  color: #1d4ed8;
}

.table-content {
  padding: 0;
}

.table-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background: #f9fafb;
}

.table-row:last-child {
  border-bottom: none;
}

.row-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.order-number {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #3b82f6;
  font-size: 0.875rem;
}

.customer-name {
  font-size: 0.875rem;
  color: #374151;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  margin-right: 0.75rem;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.user-email {
  font-size: 0.75rem;
  color: #6b7280;
}

.row-status {
  margin: 0 1rem;
}

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

.row-amount {
  font-weight: 600;
  color: #1f2937;
  font-size: 0.875rem;
}

.row-date {
  font-size: 0.75rem;
  color: #6b7280;
}

/* Actions rapides */
.quick-actions {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.actions-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1.5rem 0;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  cursor: pointer;
}

.action-card:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
}

.action-icon {
  font-size: 2rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f9ff;
  border-radius: 0.5rem;
}

.action-content {
  flex: 1;
}

.action-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.25rem 0;
}

.action-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-dashboard {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .analytics-grid {
    grid-template-columns: 1fr;
  }
  
  .tables-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-container {
    height: 250px;
  }
  
  .table-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .row-status {
    margin: 0;
  }
}

@media (max-width: 480px) {
  .admin-dashboard {
    padding: 0.5rem;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-icon {
    font-size: 2rem;
    width: 3rem;
    height: 3rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .chart-container {
    height: 200px;
  }
  
  .action-card {
    padding: 0.75rem;
  }
  
  .action-icon {
    font-size: 1.5rem;
    width: 2.5rem;
    height: 2.5rem;
  }
}
</style>
