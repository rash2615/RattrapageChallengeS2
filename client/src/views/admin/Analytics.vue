<template>
  <div class="analytics-page">
    <div class="analytics-header">
      <h1 class="page-title">Analytics & Rapports</h1>
      <p class="page-subtitle">Analysez les performances de votre boutique SPARK</p>
    </div>

    <!-- Filtres de période -->
    <div class="filters-section">
      <div class="filters-row">
        <div class="filter-group">
          <label for="period" class="filter-label">Période</label>
          <select id="period" v-model="selectedPeriod" class="filter-select" @change="updateAnalytics">
            <option value="7d">7 derniers jours</option>
            <option value="30d">30 derniers jours</option>
            <option value="90d">3 derniers mois</option>
            <option value="1y">1 an</option>
            <option value="custom">Période personnalisée</option>
          </select>
        </div>

        <div v-if="selectedPeriod === 'custom'" class="filter-group">
          <label for="startDate" class="filter-label">Date de début</label>
          <input
            id="startDate"
            v-model="customStartDate"
            type="date"
            class="filter-input"
            @change="updateAnalytics"
          />
        </div>

        <div v-if="selectedPeriod === 'custom'" class="filter-group">
          <label for="endDate" class="filter-label">Date de fin</label>
          <input
            id="endDate"
            v-model="customEndDate"
            type="date"
            class="filter-input"
            @change="updateAnalytics"
          />
        </div>

        <div class="filter-group">
          <button class="export-btn" @click="exportAnalytics">
            <span class="btn-icon">📊</span>
            Exporter
          </button>
        </div>
      </div>
    </div>

    <!-- Métriques principales -->
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon">💰</div>
        <div class="metric-content">
          <h3 class="metric-value">{{ formatPrice(totalRevenue) }}</h3>
          <p class="metric-label">Chiffre d'affaires</p>
          <div class="metric-change" :class="revenueChange.type">
            <span class="change-icon">{{ revenueChange.icon }}</span>
            <span class="change-value">{{ revenueChange.value }}%</span>
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">📦</div>
        <div class="metric-content">
          <h3 class="metric-value">{{ totalOrders }}</h3>
          <p class="metric-label">Commandes</p>
          <div class="metric-change" :class="ordersChange.type">
            <span class="change-icon">{{ ordersChange.icon }}</span>
            <span class="change-value">{{ ordersChange.value }}%</span>
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">👥</div>
        <div class="metric-content">
          <h3 class="metric-value">{{ newCustomers }}</h3>
          <p class="metric-label">Nouveaux clients</p>
          <div class="metric-change" :class="customersChange.type">
            <span class="change-icon">{{ customersChange.icon }}</span>
            <span class="change-value">{{ customersChange.value }}%</span>
          </div>
        </div>
      </div>

      <div class="metric-card">
        <div class="metric-icon">🛒</div>
        <div class="metric-content">
          <h3 class="metric-value">{{ formatPrice(averageCartValue) }}</h3>
          <p class="metric-label">Panier moyen</p>
          <div class="metric-change" :class="cartValueChange.type">
            <span class="change-icon">{{ cartValueChange.icon }}</span>
            <span class="change-value">{{ cartValueChange.value }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Graphiques principaux -->
    <div class="charts-grid">
      <!-- Évolution des ventes -->
      <div class="chart-card large">
        <div class="chart-header">
          <h3 class="chart-title">Évolution des ventes</h3>
          <div class="chart-controls">
            <select v-model="salesChartType" class="chart-select" @change="updateSalesChart">
              <option value="line">Ligne</option>
              <option value="area">Aire</option>
              <option value="bar">Barres</option>
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
            <select v-model="topProductsLimit" class="chart-select" @change="updateTopProductsChart">
              <option value="5">Top 5</option>
              <option value="10">Top 10</option>
              <option value="15">Top 15</option>
            </select>
          </div>
        </div>
        <div class="chart-container">
          <canvas ref="topProductsChart" class="chart-canvas"></canvas>
        </div>
      </div>

      <!-- Répartition par catégories -->
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
        </div>
        <div class="chart-container">
          <canvas ref="cartValueChart" class="chart-canvas"></canvas>
        </div>
      </div>
    </div>

    <!-- Analyses avancées -->
    <div class="advanced-analytics">
      <h2 class="section-title">Analyses avancées</h2>
      
      <div class="analytics-grid">
        <!-- Conversion funnel -->
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">Entonnoir de conversion</h3>
          </div>
          <div class="funnel-container">
            <div class="funnel-step">
              <div class="step-bar" style="width: 100%">
                <span class="step-label">Visiteurs</span>
                <span class="step-value">{{ formatNumber(totalVisitors) }}</span>
              </div>
            </div>
            <div class="funnel-step">
              <div class="step-bar" style="width: 75%">
                <span class="step-label">Ajouts au panier</span>
                <span class="step-value">{{ formatNumber(cartAdditions) }}</span>
              </div>
            </div>
            <div class="funnel-step">
              <div class="step-bar" style="width: 50%">
                <span class="step-label">Checkout</span>
                <span class="step-value">{{ formatNumber(checkoutStarts) }}</span>
              </div>
            </div>
            <div class="funnel-step">
              <div class="step-bar" style="width: 25%">
                <span class="step-label">Commandes</span>
                <span class="step-value">{{ formatNumber(totalOrders) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Analyse géographique -->
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">Ventes par région</h3>
          </div>
          <div class="chart-container">
            <canvas ref="geographicChart" class="chart-canvas"></canvas>
          </div>
        </div>

        <!-- Analyse temporelle -->
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">Ventes par heure</h3>
          </div>
          <div class="chart-container">
            <canvas ref="hourlyChart" class="chart-canvas"></canvas>
          </div>
        </div>

        <!-- Analyse des méthodes de paiement -->
        <div class="chart-card">
          <div class="chart-header">
            <h3 class="chart-title">Méthodes de paiement</h3>
          </div>
          <div class="chart-container">
            <canvas ref="paymentChart" class="chart-canvas"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Tableaux de données détaillées -->
    <div class="data-tables">
      <h2 class="section-title">Données détaillées</h2>
      
      <div class="tables-grid">
        <!-- Top clients -->
        <div class="table-card">
          <div class="table-header">
            <h3 class="table-title">Top clients</h3>
            <button class="export-btn small" @click="exportTopCustomers">
              <span class="btn-icon">📊</span>
              Export
            </button>
          </div>
          <div class="table-content">
            <div 
              v-for="(customer, index) in topCustomers" 
              :key="customer.id"
              class="table-row"
            >
              <div class="row-rank">#{{ index + 1 }}</div>
              <div class="row-info">
                <span class="customer-name">{{ customer.name }}</span>
                <span class="customer-email">{{ customer.email }}</span>
              </div>
              <div class="row-value">{{ formatPrice(customer.totalSpent) }}</div>
            </div>
          </div>
        </div>

        <!-- Produits les plus rentables -->
        <div class="table-card">
          <div class="table-header">
            <h3 class="table-title">Produits les plus rentables</h3>
            <button class="export-btn small" @click="exportTopProducts">
              <span class="btn-icon">📊</span>
              Export
            </button>
          </div>
          <div class="table-content">
            <div 
              v-for="(product, index) in topProducts" 
              :key="product.id"
              class="table-row"
            >
              <div class="row-rank">#{{ index + 1 }}</div>
              <div class="row-info">
                <span class="product-name">{{ product.name }}</span>
                <span class="product-category">{{ product.category }}</span>
              </div>
              <div class="row-value">{{ formatPrice(product.revenue) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { createChart, formatChartData } from '../../utils/charts'

// Router et stores
const router = useRouter()
const authStore = useAuthStore()

// État local
const selectedPeriod = ref('30d')
const customStartDate = ref('')
const customEndDate = ref('')
const salesChartType = ref('line')
const topProductsLimit = ref('5')

// Refs pour les graphiques
const salesChart = ref(null)
const topProductsChart = ref(null)
const categoryChart = ref(null)
const cartValueChart = ref(null)
const geographicChart = ref(null)
const hourlyChart = ref(null)
const paymentChart = ref(null)

// Instances des graphiques
const chartInstances = reactive({})

// Données
const totalRevenue = ref(125430.50)
const totalOrders = ref(1247)
const newCustomers = ref(89)
const averageCartValue = ref(156.80)

const totalVisitors = ref(15420)
const cartAdditions = ref(11565)
const checkoutStarts = ref(6235)

// Données de changement
const revenueChange = ref({ value: 12.5, type: 'positive', icon: '↗️' })
const ordersChange = ref({ value: 8.2, type: 'positive', icon: '↗️' })
const customersChange = ref({ value: 15.3, type: 'positive', icon: '↗️' })
const cartValueChange = ref({ value: -2.1, type: 'negative', icon: '↘️' })

// Données des tableaux
const topCustomers = ref([])
const topProducts = ref([])

// Computed
const salesData = computed(() => {
  const periods = {
    '7d': Array.from({ length: 7 }, (_, i) => `J${i + 1}`),
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
    labels: periods[selectedPeriod.value] || periods['30d'],
    datasets: [{
      data: values[selectedPeriod.value] || values['30d'],
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: '#3b82f6',
      borderWidth: 2,
      fill: salesChartType.value === 'area'
    }]
  }
})

const topProductsData = computed(() => {
  const products = [
    'Chargeur Sans Fil',
    'Câble USB-C',
    'Coque iPhone',
    'Écouteurs Bluetooth',
    'Support Voiture',
    'Écran de Protection',
    'Batterie Externe',
    'Adaptateur USB',
    'Étui Cuir',
    'Support Bureau'
  ]
  
  const limit = parseInt(topProductsLimit.value)
  const values = Array.from({ length: limit }, () => Math.floor(Math.random() * 100) + 20)
  
  return {
    labels: products.slice(0, limit),
    datasets: [{
      data: values,
      backgroundColor: Array.from({ length: limit }, (_, i) => 
        `hsl(${i * 360 / limit}, 70%, 50%)`
      )
    }]
  }
})

const categoryData = computed(() => {
  return {
    labels: ['Chargeurs', 'Câbles', 'Coques', 'Écouteurs', 'Accessoires'],
    datasets: [{
      data: [35, 25, 20, 15, 5],
      backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']
    }]
  }
})

const cartValueData = computed(() => {
  const periods = {
    '7d': Array.from({ length: 7 }, (_, i) => `J${i + 1}`),
    '30d': Array.from({ length: 30 }, (_, i) => `J${i + 1}`),
    '90d': Array.from({ length: 12 }, (_, i) => `S${i + 1}`),
    '1y': ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  }
  
  const values = {
    '7d': [45, 52, 48, 55, 60, 58, 62],
    '30d': Array.from({ length: 30 }, () => Math.floor(Math.random() * 30) + 40),
    '90d': Array.from({ length: 12 }, () => Math.floor(Math.random() * 20) + 45),
    '1y': [50, 55, 60, 58, 65, 70, 68, 72, 75, 70, 65, 68]
  }
  
  return {
    labels: periods[selectedPeriod.value] || periods['30d'],
    datasets: [{
      data: values[selectedPeriod.value] || values['30d'],
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
      borderColor: '#f59e0b',
      borderWidth: 2,
      fill: true
    }]
  }
})

// Fonctions
const loadAnalyticsData = async () => {
  try {
    // TODO: Remplacer par les appels API réels
    // const response = await api.get('/admin/analytics', {
    //   params: { period: selectedPeriod.value }
    // })
    
    // Données de test
    loadMockData()
    
    // Initialiser les graphiques après le rendu
    await nextTick()
    initializeCharts()
    
  } catch (error) {
    console.error('Erreur lors du chargement des analytics:', error)
  }
}

const loadMockData = () => {
  // Top clients
  topCustomers.value = [
    { id: 1, name: 'Marie Dupont', email: 'marie.dupont@email.com', totalSpent: 1250.50 },
    { id: 2, name: 'Pierre Martin', email: 'pierre.martin@email.com', totalSpent: 980.25 },
    { id: 3, name: 'Sophie Bernard', email: 'sophie.bernard@email.com', totalSpent: 875.75 },
    { id: 4, name: 'Jean Thomas', email: 'jean.thomas@email.com', totalSpent: 750.00 },
    { id: 5, name: 'Claire Petit', email: 'claire.petit@email.com', totalSpent: 650.30 }
  ]

  // Top produits
  topProducts.value = [
    { id: 1, name: 'Chargeur Sans Fil iPhone', category: 'Chargeurs', revenue: 12500.50 },
    { id: 2, name: 'Câble USB-C Lightning', category: 'Câbles', revenue: 9800.25 },
    { id: 3, name: 'Coque iPhone 15 Pro Max', category: 'Coques', revenue: 8750.75 },
    { id: 4, name: 'Écouteurs Bluetooth Pro', category: 'Écouteurs', revenue: 7500.00 },
    { id: 5, name: 'Support Voiture Magnétique', category: 'Accessoires', revenue: 6500.30 }
  ]
}

const initializeCharts = () => {
  // Graphique des ventes
  if (salesChart.value) {
    chartInstances.sales = createChart(salesChart.value, salesChartType.value, salesData.value)
  }
  
  // Graphique des top produits
  if (topProductsChart.value) {
    chartInstances.topProducts = createChart(topProductsChart.value, 'bar', topProductsData.value)
  }
  
  // Graphique des catégories
  if (categoryChart.value) {
    chartInstances.category = createChart(categoryChart.value, 'pie', categoryData.value)
  }
  
  // Graphique de la valeur du panier
  if (cartValueChart.value) {
    chartInstances.cartValue = createChart(cartValueChart.value, 'line', cartValueData.value)
  }
  
  // Graphique géographique
  if (geographicChart.value) {
    const geoData = {
      labels: ['Île-de-France', 'Auvergne-Rhône-Alpes', 'Provence-Alpes-Côte d\'Azur', 'Nouvelle-Aquitaine', 'Occitanie'],
      datasets: [{
        data: [35, 20, 15, 12, 10],
        backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']
      }]
    }
    chartInstances.geographic = createChart(geographicChart.value, 'pie', geoData)
  }
  
  // Graphique horaire
  if (hourlyChart.value) {
    const hourlyData = {
      labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
      datasets: [{
        data: Array.from({ length: 24 }, (_, i) => {
          // Simulation de données avec pics aux heures de bureau
          const base = 20
          const peak = i >= 9 && i <= 17 ? 80 : 30
          const random = Math.random() * 20
          return Math.floor(base + peak + random)
        }),
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderColor: '#10b981',
        borderWidth: 2,
        fill: true
      }]
    }
    chartInstances.hourly = createChart(hourlyChart.value, 'area', hourlyData)
  }
  
  // Graphique des méthodes de paiement
  if (paymentChart.value) {
    const paymentData = {
      labels: ['Carte bancaire', 'PayPal', 'Virement', 'Espèces'],
      datasets: [{
        data: [60, 25, 10, 5],
        backgroundColor: ['#3b82f6', '#1e40af', '#10b981', '#6b7280']
      }]
    }
    chartInstances.payment = createChart(paymentChart.value, 'pie', paymentData)
  }
}

const updateAnalytics = () => {
  loadAnalyticsData()
}

const updateSalesChart = () => {
  if (chartInstances.sales) {
    chartInstances.sales.destroy()
  }
  if (salesChart.value) {
    chartInstances.sales = createChart(salesChart.value, salesChartType.value, salesData.value)
  }
}

const updateTopProductsChart = () => {
  if (chartInstances.topProducts) {
    chartInstances.topProducts.destroy()
  }
  if (topProductsChart.value) {
    chartInstances.topProducts = createChart(topProductsChart.value, 'bar', topProductsData.value)
  }
}

const exportAnalytics = () => {
  // TODO: Implémenter l'export des analytics
  console.log('Export des analytics')
  alert('Fonctionnalité d\'export en cours de développement')
}

const exportTopCustomers = () => {
  const csvContent = generateCustomersCSV()
  downloadCSV(csvContent, 'top-clients.csv')
}

const exportTopProducts = () => {
  const csvContent = generateProductsCSV()
  downloadCSV(csvContent, 'top-produits.csv')
}

const generateCustomersCSV = () => {
  const headers = ['Rang', 'Nom', 'Email', 'Total dépensé']
  const rows = topCustomers.value.map((customer, index) => [
    index + 1,
    customer.name,
    customer.email,
    formatPrice(customer.totalSpent)
  ])
  
  return [headers, ...rows].map(row => row.join(',')).join('\n')
}

const generateProductsCSV = () => {
  const headers = ['Rang', 'Produit', 'Catégorie', 'Chiffre d\'affaires']
  const rows = topProducts.value.map((product, index) => [
    index + 1,
    product.name,
    product.category,
    formatPrice(product.revenue)
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

// Fonctions utilitaires
const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const formatNumber = (number) => {
  return new Intl.NumberFormat('fr-FR').format(number)
}

// Watchers
watch(() => selectedPeriod.value, () => {
  updateAnalytics()
})

// Lifecycle
onMounted(() => {
  // Vérifier les permissions d'administration
  if (!authStore.isAuthenticated || authStore.user.role !== 'admin') {
    router.push('/')
    return
  }
  
  loadAnalyticsData()
})
</script>

<style scoped>
/* Page d'analytics */
.analytics-page {
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 2rem;
}

/* En-tête */
.analytics-header {
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

/* Filtres */
.filters-section {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.filters-row {
  display: flex;
  gap: 1rem;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.filter-select,
.filter-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  font-size: 0.875rem;
  min-width: 150px;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.export-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.export-btn.small {
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
}

.btn-icon {
  font-size: 1rem;
}

/* Grille des métriques */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.metric-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.metric-icon {
  font-size: 2.5rem;
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f9ff;
  border-radius: 0.75rem;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.metric-label {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
}

.metric-change {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
}

.metric-change.positive {
  background: #d1fae5;
  color: #059669;
}

.metric-change.negative {
  background: #fecaca;
  color: #dc2626;
}

.change-icon {
  font-size: 0.875rem;
}

/* Grille des graphiques */
.charts-grid {
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

.chart-card.large {
  grid-column: 1 / -1;
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

.chart-select {
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  font-size: 0.75rem;
  color: #374151;
}

.chart-select:focus {
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

/* Analyses avancées */
.advanced-analytics {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1.5rem 0;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

/* Entonnoir de conversion */
.funnel-container {
  padding: 1rem 0;
}

.funnel-step {
  margin-bottom: 1rem;
}

.step-bar {
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
}

.step-bar:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.step-label {
  font-size: 0.875rem;
}

.step-value {
  font-size: 1rem;
  font-weight: 700;
}

/* Tableaux de données */
.data-tables {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.table-card {
  background: #f9fafb;
  border-radius: 0.75rem;
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #e5e7eb;
  border-bottom: 1px solid #d1d5db;
}

.table-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.table-content {
  padding: 0;
}

.table-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background: white;
}

.table-row:last-child {
  border-bottom: none;
}

.row-rank {
  font-size: 1.25rem;
  font-weight: 700;
  color: #3b82f6;
  min-width: 2rem;
}

.row-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.customer-name,
.product-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.customer-email,
.product-category {
  font-size: 0.75rem;
  color: #6b7280;
}

.row-value {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
}

/* Responsive */
@media (max-width: 768px) {
  .analytics-page {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .analytics-grid {
    grid-template-columns: 1fr;
  }
  
  .tables-grid {
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
  
  .row-value {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .analytics-page {
    padding: 0.5rem;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .metric-card {
    padding: 1rem;
  }
  
  .metric-icon {
    font-size: 2rem;
    width: 3rem;
    height: 3rem;
  }
  
  .metric-value {
    font-size: 1.5rem;
  }
  
  .chart-container {
    height: 200px;
  }
}
</style>
