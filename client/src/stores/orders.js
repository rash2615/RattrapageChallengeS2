/**
 * Store Pinia pour la gestion des commandes
 * Gestion de l'état des commandes et des opérations liées
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'
import { showToast } from '../utils/modals'

export const useOrderStore = defineStore('orders', () => {
  // État
  const orders = ref([])
  const order = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const pagination = ref({
    totalDocs: 0,
    limit: 10,
    page: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null,
  })

  // Getters
  const getOrders = computed(() => orders.value)
  const getOrder = computed(() => order.value)
  const getIsLoading = computed(() => isLoading.value)
  const getError = computed(() => error.value)
  const getPagination = computed(() => pagination.value)

  // Actions
  const fetchOrders = async (params = {}) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.get('/orders', { params })
      orders.value = response.data.data.docs
      pagination.value = {
        totalDocs: response.data.data.totalDocs,
        limit: response.data.data.limit,
        page: response.data.data.page,
        totalPages: response.data.data.totalPages,
        hasNextPage: response.data.data.hasNextPage,
        hasPrevPage: response.data.data.hasPrevPage,
        nextPage: response.data.data.nextPage,
        prevPage: response.data.data.prevPage,
      }
      return { success: true }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des commandes'
      error.value = errorMessage
      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const getOrderById = async (id) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.get(`/orders/${id}`)
      order.value = response.data.data
      return { success: true, data: response.data.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement de la commande'
      error.value = errorMessage
      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const createOrder = async (orderData) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.post('/orders', orderData)
      order.value = response.data.data
      orders.value.unshift(response.data.data)
      showToast('Commande créée avec succès', 'success')
      return { success: true, data: response.data.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la création de la commande'
      error.value = errorMessage
      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const updateOrder = async (id, updateData) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.put(`/orders/${id}`, updateData)
      const updatedOrder = response.data.data
      
      // Mettre à jour dans la liste
      const index = orders.value.findIndex(o => o._id === id)
      if (index !== -1) {
        orders.value[index] = updatedOrder
      }
      
      // Mettre à jour l'ordre actuel si c'est le même
      if (order.value && order.value._id === id) {
        order.value = updatedOrder
      }
      
      showToast('Commande mise à jour avec succès', 'success')
      return { success: true, data: updatedOrder }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour de la commande'
      error.value = errorMessage
      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const cancelOrder = async (id) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.put(`/orders/${id}/cancel`)
      const updatedOrder = response.data.data
      
      // Mettre à jour dans la liste
      const index = orders.value.findIndex(o => o._id === id)
      if (index !== -1) {
        orders.value[index] = updatedOrder
      }
      
      // Mettre à jour l'ordre actuel si c'est le même
      if (order.value && order.value._id === id) {
        order.value = updatedOrder
      }
      
      showToast('Commande annulée avec succès', 'success')
      return { success: true, data: updatedOrder }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de l\'annulation de la commande'
      error.value = errorMessage
      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const downloadInvoice = async (id) => {
    try {
      const response = await api.get(`/orders/${id}/invoice`, {
        responseType: 'blob'
      })
      return { success: true, data: response.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du téléchargement de la facture'
      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    }
  }

  const getOrderStats = async () => {
    try {
      const response = await api.get('/orders/stats')
      return { success: true, data: response.data.data }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des statistiques'
      return { success: false, error: errorMessage }
    }
  }

  const clearError = () => {
    error.value = null
  }

  const clearOrder = () => {
    order.value = null
  }

  return {
    orders,
    order,
    isLoading,
    error,
    pagination,
    getOrders,
    getOrder,
    getIsLoading,
    getError,
    getPagination,
    fetchOrders,
    getOrderById,
    createOrder,
    updateOrder,
    cancelOrder,
    downloadInvoice,
    getOrderStats,
    clearError,
    clearOrder,
  }
})
