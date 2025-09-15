import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  const router = useRouter()

  // Initialiser l'authentification au démarrage
  const initializeAuth = async () => {
    if (token.value) {
      try {
        const response = await api.get('/auth/me')
        user.value = response.data.user
      } catch (error) {
        console.error('Erreur initialisation auth:', error)
        logout()
      }
    }
  }

  // Connexion
  const login = async (credentials) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/auth/login', credentials)
      const { token: newToken, user: userData } = response.data

      token.value = newToken
      user.value = userData
      localStorage.setItem('token', newToken)

      // Rediriger vers la page demandée ou l'accueil
      const redirect = router.currentRoute.value.query.redirect || '/'
      router.push(redirect)

      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur de connexion'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Inscription
  const register = async (userData) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/auth/register', userData)
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur d\'inscription'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Vérification email
  const verifyEmail = async (token) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get(`/auth/verify-email/${token}`)
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur de vérification'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Mot de passe oublié
  const forgotPassword = async (email) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/auth/forgot-password', { email })
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur d\'envoi'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Réinitialisation mot de passe
  const resetPassword = async (token, password) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/auth/reset-password', { token, password })
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur de réinitialisation'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Déconnexion
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    router.push('/')
  }

  // Mettre à jour le profil
  const updateProfile = async (profileData) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.put('/auth/me', profileData)
      user.value = response.data.user
      return { success: true, data: response.data }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur de mise à jour'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Effacer les erreurs
  const clearError = () => {
    error.value = null
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    initializeAuth,
    login,
    register,
    verifyEmail,
    forgotPassword,
    resetPassword,
    logout,
    updateProfile,
    clearError
  }
})
