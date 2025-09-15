import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import api from '../services/api'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Session ID pour les utilisateurs non connectés
  const sessionId = ref(localStorage.getItem('cartSessionId') || uuidv4())

  const itemCount = computed(() => 
    items.value.reduce((total, item) => total + item.quantity, 0)
  )

  const total = computed(() => 
    items.value.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  )

  const isEmpty = computed(() => items.value.length === 0)

  // Initialiser le panier
  const initializeCart = async () => {
    if (!sessionId.value) {
      sessionId.value = uuidv4()
      localStorage.setItem('cartSessionId', sessionId.value)
    }

    try {
      const response = await api.get('/cart', {
        headers: { 'x-session-id': sessionId.value }
      })
      items.value = response.data.cart.items || []
    } catch (err) {
      console.error('Erreur initialisation panier:', err)
    }
  }

  // Ajouter un produit au panier
  const addItem = async (product, quantity = 1) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/cart/add', {
        productId: product._id,
        quantity
      }, {
        headers: { 'x-session-id': sessionId.value }
      })

      items.value = response.data.cart.items
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur d\'ajout au panier'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Mettre à jour la quantité d'un produit
  const updateQuantity = async (productId, quantity) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.put('/cart/update', {
        productId,
        quantity
      }, {
        headers: { 'x-session-id': sessionId.value }
      })

      items.value = response.data.cart.items
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur de mise à jour'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Supprimer un produit du panier
  const removeItem = async (productId) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.delete('/cart/remove', {
        data: { productId },
        headers: { 'x-session-id': sessionId.value }
      })

      items.value = response.data.cart.items
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur de suppression'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Vider le panier
  const clearCart = async () => {
    loading.value = true
    error.value = null

    try {
      await api.delete('/cart/clear', {
        headers: { 'x-session-id': sessionId.value }
      })

      items.value = []
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur de vidage'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Fusionner le panier de session avec le panier utilisateur
  const mergeCart = async () => {
    try {
      const response = await api.post('/cart/merge', {}, {
        headers: { 'x-session-id': sessionId.value }
      })

      items.value = response.data.cart.items
      return { success: true }
    } catch (err) {
      console.error('Erreur fusion panier:', err)
      return { success: false }
    }
  }

  // Obtenir les détails complets du panier
  const getCartDetails = async () => {
    try {
      const response = await api.get('/cart', {
        headers: { 'x-session-id': sessionId.value }
      })

      items.value = response.data.cart.items
      return {
        success: true,
        cart: response.data.cart,
        total: response.data.total,
        itemCount: response.data.itemCount
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur de récupération'
      return { success: false, error: error.value }
    }
  }

  // Vérifier si un produit est dans le panier
  const isInCart = (productId) => {
    return items.value.some(item => item.product._id === productId)
  }

  // Obtenir la quantité d'un produit dans le panier
  const getItemQuantity = (productId) => {
    const item = items.value.find(item => item.product._id === productId)
    return item ? item.quantity : 0
  }

  // Effacer les erreurs
  const clearError = () => {
    error.value = null
  }

  return {
    items,
    loading,
    error,
    sessionId,
    itemCount,
    total,
    isEmpty,
    initializeCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    mergeCart,
    getCartDetails,
    isInCart,
    getItemQuantity,
    clearError
  }
})
