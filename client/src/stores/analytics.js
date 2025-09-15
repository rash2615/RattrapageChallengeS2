/**
 * Store Pinia pour les analytics et rapports
 * Gestion des données d'analyse et de reporting
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'
import { showToast } from '../utils/modals'

export const useAnalyticsStore = defineStore('analytics', () => {
  // État
  const isLoading = ref(false)
  const error = ref(null)
  const selectedPeriod = ref('30d')
  const customDateRange = ref({
    startDate: null,
    endDate: null
  })

  // Données des métriques
  const metrics = ref({
    totalRevenue: 0,
    totalOrders: 0,
    newCustomers: 0,
    averageCartValue: 0,
    conversionRate: 0,
    totalVisitors: 0,
    cartAdditions: 0,
    checkoutStarts: 0
  })

  // Données des changements
  const changes = ref({
    revenue: { value: 0, type: 'neutral' },
    orders: { value: 0, type: 'neutral' },
    customers: { value: 0, type: 'neutral' },
    cartValue: { value: 0, type: 'neutral' }
  })

  // Données des graphiques
  const salesData = ref({
    labels: [],
    datasets: []
  })

  const topProductsData = ref({
    labels: [],
    datasets: []
  })

  const categoryData = ref({
    labels: [],
    datasets: []
  })

  const cartValueData = ref({
    labels: [],
    datasets: []
  })

  const geographicData = ref({
    labels: [],
    datasets: []
  })

  const hourlyData = ref({
    labels: [],
    datasets: []
  })

  const paymentData = ref({
    labels: [],
    datasets: []
  })

  // Données des tableaux
  const topCustomers = ref([])
  const topProducts = ref([])
  const recentOrders = ref([])

  // Getters
  const getIsLoading = computed(() => isLoading.value)
  const getError = computed(() => error.value)
  const getMetrics = computed(() => metrics.value)
  const getChanges = computed(() => changes.value)
  const getSelectedPeriod = computed(() => selectedPeriod.value)
  const getCustomDateRange = computed(() => customDateRange.value)

  const getSalesData = computed(() => salesData.value)
  const getTopProductsData = computed(() => topProductsData.value)
  const getCategoryData = computed(() => categoryData.value)
  const getCartValueData = computed(() => cartValueData.value)
  const getGeographicData = computed(() => geographicData.value)
  const getHourlyData = computed(() => hourlyData.value)
  const getPaymentData = computed(() => paymentData.value)

  const getTopCustomers = computed(() => topCustomers.value)
  const getTopProducts = computed(() => topProducts.value)
  const getRecentOrders = computed(() => recentOrders.value)

  // Actions
  const setPeriod = (period) => {
    selectedPeriod.value = period
  }

  const setCustomDateRange = (startDate, endDate) => {
    customDateRange.value = { startDate, endDate }
  }

  const fetchAnalytics = async (period = null) => {
    isLoading.value = true
    error.value = null

    try {
      const params = {
        period: period || selectedPeriod.value,
        ...(customDateRange.value.startDate && customDateRange.value.endDate && {
          startDate: customDateRange.value.startDate,
          endDate: customDateRange.value.endDate
        })
      }

      const response = await api.get('/admin/analytics', { params })
      const data = response.data.data

      // Mettre à jour les métriques
      metrics.value = {
        totalRevenue: data.metrics.totalRevenue || 0,
        totalOrders: data.metrics.totalOrders || 0,
        newCustomers: data.metrics.newCustomers || 0,
        averageCartValue: data.metrics.averageCartValue || 0,
        conversionRate: data.metrics.conversionRate || 0,
        totalVisitors: data.metrics.totalVisitors || 0,
        cartAdditions: data.metrics.cartAdditions || 0,
        checkoutStarts: data.metrics.checkoutStarts || 0
      }

      // Mettre à jour les changements
      changes.value = {
        revenue: data.changes.revenue || { value: 0, type: 'neutral' },
        orders: data.changes.orders || { value: 0, type: 'neutral' },
        customers: data.changes.customers || { value: 0, type: 'neutral' },
        cartValue: data.changes.cartValue || { value: 0, type: 'neutral' }
      }

      // Mettre à jour les données des graphiques
      salesData.value = data.charts.sales || { labels: [], datasets: [] }
      topProductsData.value = data.charts.topProducts || { labels: [], datasets: [] }
      categoryData.value = data.charts.category || { labels: [], datasets: [] }
      cartValueData.value = data.charts.cartValue || { labels: [], datasets: [] }
      geographicData.value = data.charts.geographic || { labels: [], datasets: [] }
      hourlyData.value = data.charts.hourly || { labels: [], datasets: [] }
      paymentData.value = data.charts.payment || { labels: [], datasets: [] }

      // Mettre à jour les données des tableaux
      topCustomers.value = data.tables.topCustomers || []
      topProducts.value = data.tables.topProducts || []
      recentOrders.value = data.tables.recentOrders || []

      return { success: true }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des analytics'
      error.value = errorMessage
      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const fetchRevenueData = async (period = null) => {
    try {
      const params = {
        period: period || selectedPeriod.value,
        ...(customDateRange.value.startDate && customDateRange.value.endDate && {
          startDate: customDateRange.value.startDate,
          endDate: customDateRange.value.endDate
        })
      }

      const response = await api.get('/admin/analytics/revenue', { params })
      salesData.value = response.data.data
      return { success: true }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des données de revenus'
      error.value = errorMessage
      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    }
  }

  const fetchProductAnalytics = async (period = null) => {
    try {
      const params = {
        period: period || selectedPeriod.value,
        ...(customDateRange.value.startDate && customDateRange.value.endDate && {
          startDate: customDateRange.value.startDate,
          endDate: customDateRange.value.endDate
        })
      }

      const response = await api.get('/admin/analytics/products', { params })
      const data = response.data.data

      topProductsData.value = data.topProducts || { labels: [], datasets: [] }
      categoryData.value = data.categories || { labels: [], datasets: [] }
      topProducts.value = data.topProductsList || []

      return { success: true }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des analytics produits'
      error.value = errorMessage
      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    }
  }

  const fetchCustomerAnalytics = async (period = null) => {
    try {
      const params = {
        period: period || selectedPeriod.value,
        ...(customDateRange.value.startDate && customDateRange.value.endDate && {
          startDate: customDateRange.value.startDate,
          endDate: customDateRange.value.endDate
        })
      }

      const response = await api.get('/admin/analytics/customers', { params })
      const data = response.data.data

      topCustomers.value = data.topCustomers || []
      geographicData.value = data.geographic || { labels: [], datasets: [] }

      return { success: true }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des analytics clients'
      error.value = errorMessage
      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    }
  }

  const fetchOrderAnalytics = async (period = null) => {
    try {
      const params = {
        period: period || selectedPeriod.value,
        ...(customDateRange.value.startDate && customDateRange.value.endDate && {
          startDate: customDateRange.value.startDate,
          endDate: customDateRange.value.endDate
        })
      }

      const response = await api.get('/admin/analytics/orders', { params })
      const data = response.data.data

      cartValueData.value = data.cartValue || { labels: [], datasets: [] }
      hourlyData.value = data.hourly || { labels: [], datasets: [] }
      paymentData.value = data.paymentMethods || { labels: [], datasets: [] }
      recentOrders.value = data.recentOrders || []

      return { success: true }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des analytics commandes'
      error.value = errorMessage
      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    }
  }

  const exportAnalytics = async (format = 'csv', period = null) => {
    try {
      const params = {
        format,
        period: period || selectedPeriod.value,
        ...(customDateRange.value.startDate && customDateRange.value.endDate && {
          startDate: customDateRange.value.startDate,
          endDate: customDateRange.value.endDate
        })
      }

      const response = await api.get('/admin/analytics/export', { 
        params,
        responseType: 'blob'
      })

      // Créer un lien de téléchargement
      const blob = new Blob([response.data], { 
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `analytics-${period || selectedPeriod.value}-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      showToast('Export téléchargé avec succès', 'success')
      return { success: true }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de l\'export des analytics'
      error.value = errorMessage
      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    }
  }

  const exportTopCustomers = async (format = 'csv') => {
    try {
      const params = {
        format,
        period: selectedPeriod.value,
        ...(customDateRange.value.startDate && customDateRange.value.endDate && {
          startDate: customDateRange.value.startDate,
          endDate: customDateRange.value.endDate
        })
      }

      const response = await api.get('/admin/analytics/export/customers', { 
        params,
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { 
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `top-clients-${selectedPeriod.value}-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      showToast('Export des clients téléchargé', 'success')
      return { success: true }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de l\'export des clients'
      error.value = errorMessage
      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    }
  }

  const exportTopProducts = async (format = 'csv') => {
    try {
      const params = {
        format,
        period: selectedPeriod.value,
        ...(customDateRange.value.startDate && customDateRange.value.endDate && {
          startDate: customDateRange.value.startDate,
          endDate: customDateRange.value.endDate
        })
      }

      const response = await api.get('/admin/analytics/export/products', { 
        params,
        responseType: 'blob'
      })

      const blob = new Blob([response.data], { 
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `top-produits-${selectedPeriod.value}-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      showToast('Export des produits téléchargé', 'success')
      return { success: true }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de l\'export des produits'
      error.value = errorMessage
      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    }
  }

  const clearError = () => {
    error.value = null
  }

  const reset = () => {
    isLoading.value = false
    error.value = null
    selectedPeriod.value = '30d'
    customDateRange.value = { startDate: null, endDate: null }
    metrics.value = {
      totalRevenue: 0,
      totalOrders: 0,
      newCustomers: 0,
      averageCartValue: 0,
      conversionRate: 0,
      totalVisitors: 0,
      cartAdditions: 0,
      checkoutStarts: 0
    }
    changes.value = {
      revenue: { value: 0, type: 'neutral' },
      orders: { value: 0, type: 'neutral' },
      customers: { value: 0, type: 'neutral' },
      cartValue: { value: 0, type: 'neutral' }
    }
    salesData.value = { labels: [], datasets: [] }
    topProductsData.value = { labels: [], datasets: [] }
    categoryData.value = { labels: [], datasets: [] }
    cartValueData.value = { labels: [], datasets: [] }
    geographicData.value = { labels: [], datasets: [] }
    hourlyData.value = { labels: [], datasets: [] }
    paymentData.value = { labels: [], datasets: [] }
    topCustomers.value = []
    topProducts.value = []
    recentOrders.value = []
  }

  return {
    // État
    isLoading,
    error,
    selectedPeriod,
    customDateRange,
    metrics,
    changes,
    salesData,
    topProductsData,
    categoryData,
    cartValueData,
    geographicData,
    hourlyData,
    paymentData,
    topCustomers,
    topProducts,
    recentOrders,

    // Getters
    getIsLoading,
    getError,
    getMetrics,
    getChanges,
    getSelectedPeriod,
    getCustomDateRange,
    getSalesData,
    getTopProductsData,
    getCategoryData,
    getCartValueData,
    getGeographicData,
    getHourlyData,
    getPaymentData,
    getTopCustomers,
    getTopProducts,
    getRecentOrders,

    // Actions
    setPeriod,
    setCustomDateRange,
    fetchAnalytics,
    fetchRevenueData,
    fetchProductAnalytics,
    fetchCustomerAnalytics,
    fetchOrderAnalytics,
    exportAnalytics,
    exportTopCustomers,
    exportTopProducts,
    clearError,
    reset
  }
})
