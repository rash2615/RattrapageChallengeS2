/**
 * Store Pinia pour les produits
 * Gestion de l'état des produits et des filtres
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useProductsStore = defineStore('products', () => {
  // État
  const products = ref([])
  const categories = ref([])
  const brands = ref([])
  const colors = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const searchQuery = ref('')
  const filters = ref({
    category: [],
    brand: [],
    color: [],
    minPrice: null,
    maxPrice: null,
    inStock: false,
    minRating: 0
  })
  const sortBy = ref('relevance')
  const currentPage = ref(1)
  const itemsPerPage = ref(12)

  // Getters
  const filteredProducts = computed(() => {
    let filtered = [...products.value]

    // Recherche textuelle
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      )
    }

    // Filtres
    if (filters.value.category.length > 0) {
      filtered = filtered.filter(product => 
        filters.value.category.includes(product.category)
      )
    }

    if (filters.value.brand.length > 0) {
      filtered = filtered.filter(product => 
        filters.value.brand.includes(product.brand)
      )
    }

    if (filters.value.color.length > 0) {
      filtered = filtered.filter(product => 
        filters.value.color.some(color => product.colors.includes(color))
      )
    }

    if (filters.value.minPrice !== null) {
      filtered = filtered.filter(product => product.price >= filters.value.minPrice)
    }

    if (filters.value.maxPrice !== null) {
      filtered = filtered.filter(product => product.price <= filters.value.maxPrice)
    }

    if (filters.value.inStock) {
      filtered = filtered.filter(product => product.stock > 0)
    }

    if (filters.value.minRating > 0) {
      filtered = filtered.filter(product => product.rating >= filters.value.minRating)
    }

    return filtered
  })

  const sortedProducts = computed(() => {
    const sorted = [...filteredProducts.value]

    switch (sortBy.value) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name))
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name))
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price)
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price)
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating)
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      default:
        return sorted
    }
  })

  const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return sortedProducts.value.slice(start, end)
  })

  const totalPages = computed(() => 
    Math.ceil(sortedProducts.value.length / itemsPerPage.value)
  )

  const hasActiveFilters = computed(() => {
    return filters.value.category.length > 0 ||
           filters.value.brand.length > 0 ||
           filters.value.color.length > 0 ||
           filters.value.minPrice !== null ||
           filters.value.maxPrice !== null ||
           filters.value.inStock ||
           filters.value.minRating > 0
  })

  // Actions
  const setError = (errorMessage) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  // Charger tous les produits
  const loadProducts = async (params = {}) => {
    try {
      isLoading.value = true
      clearError()

      const response = await api.get('/products', { params })
      
      if (response.data.success) {
        products.value = response.data.data.products || response.data.data
        return { success: true, data: response.data }
      }
      
      throw new Error(response.data.message || 'Erreur lors du chargement des produits')
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des produits'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // Charger un produit par ID
  const loadProduct = async (productId) => {
    try {
      isLoading.value = true
      clearError()

      const response = await api.get(`/products/${productId}`)
      
      if (response.data.success) {
        return { success: true, data: response.data.data }
      }
      
      throw new Error(response.data.message || 'Produit non trouvé')
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Produit non trouvé'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // Charger les produits similaires
  const loadRelatedProducts = async (productId) => {
    try {
      const response = await api.get(`/products/${productId}/related`)
      
      if (response.data.success) {
        return { success: true, data: response.data.data }
      }
      
      throw new Error(response.data.message || 'Erreur lors du chargement des produits similaires')
      
    } catch (err) {
      console.error('Erreur lors du chargement des produits similaires:', err)
      return { success: false, error: err.message }
    }
  }

  // Rechercher des produits
  const searchProducts = async (query, filters = {}) => {
    try {
      isLoading.value = true
      clearError()

      const params = {
        search: query,
        ...filters
      }

      const response = await api.get('/products/search', { params })
      
      if (response.data.success) {
        products.value = response.data.data.products || response.data.data
        return { success: true, data: response.data }
      }
      
      throw new Error(response.data.message || 'Erreur lors de la recherche')
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la recherche'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // Charger les catégories
  const loadCategories = async () => {
    try {
      const response = await api.get('/products/categories')
      
      if (response.data.success) {
        categories.value = response.data.data
        return { success: true, data: response.data }
      }
      
      throw new Error(response.data.message || 'Erreur lors du chargement des catégories')
      
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err)
      return { success: false, error: err.message }
    }
  }

  // Charger les marques
  const loadBrands = async () => {
    try {
      const response = await api.get('/products/brands')
      
      if (response.data.success) {
        brands.value = response.data.data
        return { success: true, data: response.data }
      }
      
      throw new Error(response.data.message || 'Erreur lors du chargement des marques')
      
    } catch (err) {
      console.error('Erreur lors du chargement des marques:', err)
      return { success: false, error: err.message }
    }
  }

  // Charger les couleurs
  const loadColors = async () => {
    try {
      const response = await api.get('/products/colors')
      
      if (response.data.success) {
        colors.value = response.data.data
        return { success: true, data: response.data }
      }
      
      throw new Error(response.data.message || 'Erreur lors du chargement des couleurs')
      
    } catch (err) {
      console.error('Erreur lors du chargement des couleurs:', err)
      return { success: false, error: err.message }
    }
  }

  // Mettre à jour les filtres
  const updateFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
    currentPage.value = 1
  }

  // Mettre à jour la recherche
  const updateSearch = (query) => {
    searchQuery.value = query
    currentPage.value = 1
  }

  // Mettre à jour le tri
  const updateSort = (sort) => {
    sortBy.value = sort
    currentPage.value = 1
  }

  // Mettre à jour la page
  const updatePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  // Effacer tous les filtres
  const clearFilters = () => {
    filters.value = {
      category: [],
      brand: [],
      color: [],
      minPrice: null,
      maxPrice: null,
      inStock: false,
      minRating: 0
    }
    searchQuery.value = ''
    currentPage.value = 1
  }

  // Obtenir les produits en vedette
  const getFeaturedProducts = async (limit = 8) => {
    try {
      const response = await api.get('/products/featured', { 
        params: { limit } 
      })
      
      if (response.data.success) {
        return { success: true, data: response.data.data }
      }
      
      throw new Error(response.data.message || 'Erreur lors du chargement des produits vedettes')
      
    } catch (err) {
      console.error('Erreur lors du chargement des produits vedettes:', err)
      return { success: false, error: err.message }
    }
  }

  // Obtenir les nouveaux produits
  const getNewProducts = async (limit = 8) => {
    try {
      const response = await api.get('/products/new', { 
        params: { limit } 
      })
      
      if (response.data.success) {
        return { success: true, data: response.data.data }
      }
      
      throw new Error(response.data.message || 'Erreur lors du chargement des nouveaux produits')
      
    } catch (err) {
      console.error('Erreur lors du chargement des nouveaux produits:', err)
      return { success: false, error: err.message }
    }
  }

  // Obtenir les produits en promotion
  const getSaleProducts = async (limit = 8) => {
    try {
      const response = await api.get('/products/sale', { 
        params: { limit } 
      })
      
      if (response.data.success) {
        return { success: true, data: response.data.data }
      }
      
      throw new Error(response.data.message || 'Erreur lors du chargement des produits en promotion')
      
    } catch (err) {
      console.error('Erreur lors du chargement des produits en promotion:', err)
      return { success: false, error: err.message }
    }
  }

  // Obtenir les statistiques des produits
  const getProductStats = async () => {
    try {
      const response = await api.get('/products/stats')
      
      if (response.data.success) {
        return { success: true, data: response.data.data }
      }
      
      throw new Error(response.data.message || 'Erreur lors du chargement des statistiques')
      
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err)
      return { success: false, error: err.message }
    }
  }

  return {
    // État
    products,
    categories,
    brands,
    colors,
    isLoading,
    error,
    searchQuery,
    filters,
    sortBy,
    currentPage,
    itemsPerPage,
    
    // Getters
    filteredProducts,
    sortedProducts,
    paginatedProducts,
    totalPages,
    hasActiveFilters,
    
    // Actions
    loadProducts,
    loadProduct,
    loadRelatedProducts,
    searchProducts,
    loadCategories,
    loadBrands,
    loadColors,
    updateFilters,
    updateSearch,
    updateSort,
    updatePage,
    clearFilters,
    getFeaturedProducts,
    getNewProducts,
    getSaleProducts,
    getProductStats,
    setError,
    clearError
  }
})
