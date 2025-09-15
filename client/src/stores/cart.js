/**
 * Store Pinia pour le panier
 * Gestion du panier avec persistance locale
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useCartStore = defineStore('cart', () => {
  // État
  const items = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const totalItems = computed(() => 
    items.value.reduce((total, item) => total + item.quantity, 0)
  )

  const totalPrice = computed(() => 
    items.value.reduce((total, item) => total + (item.price * item.quantity), 0)
  )

  const isEmpty = computed(() => items.value.length === 0)

  const itemCount = computed(() => items.value.length)

  // Actions
  const setError = (errorMessage) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  // Ajouter un produit au panier
  const addItem = async (product, quantity = 1) => {
    try {
      isLoading.value = true
      clearError()

      // Vérifier si le produit existe déjà dans le panier
      const existingItem = items.value.find(item => item.product._id === product._id)
      
      if (existingItem) {
        // Mettre à jour la quantité
        existingItem.quantity += quantity
      } else {
        // Ajouter un nouvel item
        const cartItem = {
          product: {
            _id: product._id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            images: product.images,
            stock: product.stock
          },
          quantity: quantity,
          addedAt: new Date().toISOString()
        }
        items.value.push(cartItem)
      }

      // Sauvegarder dans le localStorage
      saveCartToStorage()

      // Synchroniser avec le serveur si l'utilisateur est connecté
      if (await isUserAuthenticated()) {
        await syncCartToServer()
      }

      showToast(`${product.name} ajouté au panier !`, 'success')
      return { success: true }

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de l\'ajout au panier'
      setError(errorMessage)
      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // Mettre à jour la quantité d'un produit
  const updateQuantity = async (productId, quantity) => {
    try {
      isLoading.value = true
      clearError()

      const item = items.value.find(item => item.product._id === productId)
      
      if (!item) {
        throw new Error('Produit non trouvé dans le panier')
      }

      if (quantity <= 0) {
        // Supprimer l'item si la quantité est 0 ou négative
        await removeItem(productId)
        return { success: true }
      }

      // Vérifier le stock disponible
      if (quantity > item.product.stock) {
        throw new Error(`Stock insuffisant. Disponible: ${item.product.stock}`)
      }

      item.quantity = quantity

      // Sauvegarder dans le localStorage
      saveCartToStorage()

      // Synchroniser avec le serveur si l'utilisateur est connecté
      if (await isUserAuthenticated()) {
        await syncCartToServer()
      }

      return { success: true }

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour'
      setError(errorMessage)
      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // Supprimer un produit du panier
  const removeItem = async (productId) => {
    try {
      isLoading.value = true
      clearError()

      const itemIndex = items.value.findIndex(item => item.product._id === productId)
      
      if (itemIndex === -1) {
        throw new Error('Produit non trouvé dans le panier')
      }

      items.value.splice(itemIndex, 1)

      // Sauvegarder dans le localStorage
      saveCartToStorage()

      // Synchroniser avec le serveur si l'utilisateur est connecté
      if (await isUserAuthenticated()) {
        await syncCartToServer()
      }

      showToast('Produit supprimé du panier', 'info')
      return { success: true }

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la suppression'
      setError(errorMessage)
      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // Vider le panier
  const clearCart = async () => {
    try {
      isLoading.value = true
      clearError()

      items.value = []

      // Sauvegarder dans le localStorage
      saveCartToStorage()

      // Synchroniser avec le serveur si l'utilisateur est connecté
      if (await isUserAuthenticated()) {
        await syncCartToServer()
      }

      showToast('Panier vidé', 'info')
      return { success: true }

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du vidage'
      setError(errorMessage)
      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // Charger le panier depuis le localStorage
  const loadCartFromStorage = () => {
    try {
      const savedCart = localStorage.getItem('spark_cart')
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart)
        items.value = parsedCart.items || []
      }
    } catch (err) {
      console.error('Erreur lors du chargement du panier:', err)
      items.value = []
    }
  }

  // Sauvegarder le panier dans le localStorage
  const saveCartToStorage = () => {
    try {
      const cartData = {
        items: items.value,
        lastUpdated: new Date().toISOString()
      }
      localStorage.setItem('spark_cart', JSON.stringify(cartData))
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du panier:', err)
    }
  }

  // Synchroniser le panier avec le serveur
  const syncCartToServer = async () => {
    try {
      const cartData = {
        items: items.value.map(item => ({
          product: item.product._id,
          quantity: item.quantity
        }))
      }

      await api.put('/cart/sync', cartData)
    } catch (err) {
      console.error('Erreur lors de la synchronisation du panier:', err)
    }
  }

  // Charger le panier depuis le serveur
  const loadCartFromServer = async () => {
    try {
      isLoading.value = true
      clearError()

      const response = await api.get('/cart')
      
      if (response.data.success) {
        items.value = response.data.data.items || []
        saveCartToStorage()
        return { success: true, data: response.data }
      }
      
      throw new Error(response.data.message || 'Erreur lors du chargement du panier')
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // Vérifier si l'utilisateur est connecté
  const isUserAuthenticated = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return false

      // Vérifier si le token est expiré
      const payload = JSON.parse(atob(token.split('.')[1]))
      const now = Math.floor(Date.now() / 1000)
      
      return payload.exp > now
    } catch {
      return false
    }
  }

  // Appliquer un code promo
  const applyCoupon = async (couponCode) => {
    try {
      isLoading.value = true
      clearError()

      const response = await api.post('/cart/coupon', { code: couponCode })
      
      if (response.data.success) {
        showToast('Code promo appliqué !', 'success')
        return { success: true, data: response.data }
      }
      
      throw new Error(response.data.message || 'Code promo invalide')
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Code promo invalide'
      setError(errorMessage)
      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // Calculer les frais de livraison
  const calculateShipping = async (address) => {
    try {
      isLoading.value = true
      clearError()

      const response = await api.post('/cart/shipping', { address })
      
      if (response.data.success) {
        return { success: true, data: response.data }
      }
      
      throw new Error(response.data.message || 'Erreur lors du calcul')
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du calcul'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // Fonction utilitaire pour afficher les toasts
  const showToast = (message, type = 'info') => {
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast(message, type)
    }
  }

  return {
    // État
    items,
    isLoading,
    error,
    
    // Getters
    totalItems,
    totalPrice,
    isEmpty,
    itemCount,
    
    // Actions
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    loadCartFromStorage,
    saveCartToStorage,
    loadCartFromServer,
    syncCartToServer,
    applyCoupon,
    calculateShipping,
    setError,
    clearError
  }
})
