/**
 * Service API pour SPARK
 * Configuration Axios et gestion des requêtes HTTP
 */

import axios from 'axios'

// Configuration de base d'Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Intercepteur de requête
api.interceptors.request.use(
  (config) => {
    // Ajouter le token d'authentification si disponible
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Ajouter un timestamp pour éviter le cache
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      }
    }

    // Log des requêtes en développement
    if (import.meta.env.DEV) {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data || config.params)
    }

    return config
  },
  (error) => {
    console.error('Erreur de requête:', error)
    return Promise.reject(error)
  }
)

// Intercepteur de réponse
api.interceptors.response.use(
  (response) => {
    // Log des réponses en développement
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data)
    }

    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Log des erreurs
    if (import.meta.env.DEV) {
      console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, error.response?.data || error.message)
    }

    // Gestion des erreurs 401 (non autorisé)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Essayer de rafraîchir le token
        const refreshToken = localStorage.getItem('refreshToken')
        if (refreshToken) {
          const response = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
            refreshToken
          })

          if (response.data.success) {
            const { token: newToken, refreshToken: newRefreshToken } = response.data.data
            
            // Sauvegarder les nouveaux tokens
            localStorage.setItem('token', newToken)
            localStorage.setItem('refreshToken', newRefreshToken)
            
            // Mettre à jour l'en-tête d'autorisation
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            
            // Relancer la requête originale
            return api(originalRequest)
          }
        }
      } catch (refreshError) {
        console.error('Erreur lors du rafraîchissement du token:', refreshError)
        
        // Supprimer les tokens et rediriger vers la connexion
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        
        // Rediriger vers la page de connexion
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }

    // Gestion des erreurs 403 (interdit)
    if (error.response?.status === 403) {
      console.error('Accès interdit:', error.response.data)
      
      // Rediriger vers la page d'accueil
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/'
      }
    }

    // Gestion des erreurs 404 (non trouvé)
    if (error.response?.status === 404) {
      console.error('Ressource non trouvée:', error.response.data)
    }

    // Gestion des erreurs 500 (erreur serveur)
    if (error.response?.status >= 500) {
      console.error('Erreur serveur:', error.response.data)
    }

    // Gestion des erreurs de réseau
    if (!error.response) {
      console.error('Erreur de réseau:', error.message)
    }

    return Promise.reject(error)
  }
)

// Fonctions utilitaires pour les requêtes
export const apiUtils = {
  // GET
  get: (url, config = {}) => api.get(url, config),
  
  // POST
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  
  // PUT
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  
  // DELETE
  delete: (url, config = {}) => api.delete(url, config),
  
  // PATCH
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
  
  // Upload de fichier
  upload: (url, formData, onProgress = null) => {
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: onProgress
    })
  },
  
  // Download de fichier
  download: (url, filename) => {
    return api.get(url, {
      responseType: 'blob'
    }).then(response => {
      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    })
  }
}

// Configuration des endpoints
export const endpoints = {
  // Authentification
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
    verifyEmail: '/auth/verify-email',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    changePassword: '/auth/change-password',
    updateProfile: '/auth/profile'
  },
  
  // Produits
  products: {
    list: '/products',
    detail: (id) => `/products/${id}`,
    search: '/products/search',
    categories: '/products/categories',
    featured: '/products/featured',
    new: '/products/new',
    onSale: '/products/on-sale'
  },
  
  // Panier
  cart: {
    get: '/cart',
    add: '/cart/add',
    update: '/cart/update',
    remove: '/cart/remove',
    clear: '/cart/clear',
    sync: '/cart/sync',
    coupon: '/cart/coupon',
    shipping: '/cart/shipping'
  },
  
  // Commandes
  orders: {
    list: '/orders',
    detail: (id) => `/orders/${id}`,
    create: '/orders',
    update: (id) => `/orders/${id}`,
    cancel: (id) => `/orders/${id}/cancel`
  },
  
  // Administration
  admin: {
    dashboard: '/admin/dashboard',
    users: '/admin/users',
    userDetail: (id) => `/admin/users/${id}`,
    products: '/admin/products',
    productDetail: (id) => `/admin/products/${id}`,
    orders: '/admin/orders',
    orderDetail: (id) => `/admin/orders/${id}`,
    analytics: '/admin/analytics'
  },
  
  // Analytics
  analytics: {
    revenue: '/analytics/revenue',
    salesByCategory: '/analytics/sales-by-category',
    topProducts: '/analytics/top-products',
    customerMetrics: '/analytics/customer-metrics',
    ordersTimeline: '/analytics/orders-timeline',
    export: '/analytics/export'
  },
  
  // Upload
  upload: {
    images: '/upload/images',
    single: '/upload/single',
    delete: (filename) => `/upload/${filename}`,
    list: '/upload/list'
  }
}

// Fonctions de validation des réponses
export const validateResponse = (response) => {
  if (!response || !response.data) {
    throw new Error('Réponse invalide du serveur')
  }
  
  if (response.data.success === false) {
    throw new Error(response.data.message || 'Erreur inconnue')
  }
  
  return response.data
}

// Fonctions de gestion d'erreurs
export const handleError = (error) => {
  if (error.response) {
    // Erreur de réponse du serveur
    const { status, data } = error.response
    
    switch (status) {
      case 400:
        return data.message || 'Données invalides'
      case 401:
        return 'Non autorisé'
      case 403:
        return 'Accès interdit'
      case 404:
        return 'Ressource non trouvée'
      case 422:
        return data.message || 'Erreur de validation'
      case 500:
        return 'Erreur interne du serveur'
      default:
        return data.message || 'Erreur inconnue'
    }
  } else if (error.request) {
    // Erreur de réseau
    return 'Erreur de connexion au serveur'
  } else {
    // Autre erreur
    return error.message || 'Erreur inconnue'
  }
}

// Configuration des timeouts
export const timeouts = {
  short: 5000,    // 5 secondes
  normal: 10000,  // 10 secondes
  long: 30000     // 30 secondes
}

// Configuration des retry
export const retryConfig = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error) => {
    return error.response?.status >= 500 || !error.response
  }
}

export default api
