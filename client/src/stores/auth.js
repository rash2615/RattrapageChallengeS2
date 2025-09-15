/**
 * Store Pinia pour l'authentification
 * Gestion de l'état d'authentification et des utilisateurs
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  // État
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const refreshToken = ref(localStorage.getItem('refreshToken'))
  const isLoading = ref(false)
  const error = ref(null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isEmailVerified = computed(() => user.value?.isEmailVerified)
  const isTokenExpired = computed(() => {
    if (!token.value) return true
    
    try {
      const payload = JSON.parse(atob(token.value.split('.')[1]))
      const now = Math.floor(Date.now() / 1000)
      return payload.exp < now
    } catch {
      return true
    }
  })

  // Actions
  const setUser = (userData) => {
    user.value = userData
  }

  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  const setRefreshToken = (newRefreshToken) => {
    refreshToken.value = newRefreshToken
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken)
    } else {
      localStorage.removeItem('refreshToken')
    }
  }

  const setError = (errorMessage) => {
    error.value = errorMessage
  }

  const clearError = () => {
    error.value = null
  }

  // Inscription
  const register = async (userData) => {
    try {
      isLoading.value = true
      clearError()

      const response = await api.post('/auth/register', userData)
      
      if (response.data.success) {
        showToast('Inscription réussie ! Vérifiez votre email.', 'success')
        return { success: true, data: response.data }
      }
      
      throw new Error(response.data.message || 'Erreur lors de l\'inscription')
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de l\'inscription'
      setError(errorMessage)
      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // Connexion
  const login = async (credentials) => {
    try {
      isLoading.value = true
      clearError()

      const response = await api.post('/auth/login', credentials)
      
      if (response.data.success) {
        const { user: userData, token: newToken, refreshToken: newRefreshToken } = response.data.data
        
        setUser(userData)
        setToken(newToken)
        setRefreshToken(newRefreshToken)
        
        showToast(`Bienvenue ${userData.firstName} !`, 'success')
        return { success: true, data: response.data }
      }
      
      throw new Error(response.data.message || 'Erreur lors de la connexion')
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la connexion'
      setError(errorMessage)
      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // Déconnexion
  const logout = async () => {
    try {
      if (token.value) {
        await api.post('/auth/logout')
      }
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err)
    } finally {
      // Nettoyer l'état local
      user.value = null
      setToken(null)
      setRefreshToken(null)
      clearError()
      
      showToast('Déconnexion réussie', 'info')
    }
  }

  // Vérification de l'authentification
  const checkAuth = async () => {
    if (!token.value || isTokenExpired.value) {
      // Essayer de rafraîchir le token
      if (refreshToken.value) {
        return await refreshAuth()
      }
      return false
    }

    try {
      const response = await api.get('/auth/me')
      
      if (response.data.success) {
        setUser(response.data.data)
        return true
      }
      
      throw new Error('Token invalide')
      
    } catch (err) {
      console.error('Erreur de vérification auth:', err)
      await logout()
      return false
    }
  }

  // Rafraîchissement du token
  const refreshAuth = async () => {
    if (!refreshToken.value) {
      return false
    }

    try {
      const response = await api.post('/auth/refresh', {
        refreshToken: refreshToken.value
      })
      
      if (response.data.success) {
        const { user: userData, token: newToken, refreshToken: newRefreshToken } = response.data.data
        
        setUser(userData)
        setToken(newToken)
        setRefreshToken(newRefreshToken)
        
        return true
      }
      
      throw new Error('Impossible de rafraîchir le token')
      
    } catch (err) {
      console.error('Erreur de rafraîchissement:', err)
      await logout()
      return false
    }
  }

  // Vérification de l'email
  const verifyEmail = async (token) => {
    try {
      isLoading.value = true
      clearError()

      const response = await api.post('/auth/verify-email', { token })
      
      if (response.data.success) {
        showToast('Email vérifié avec succès !', 'success')
        return { success: true, data: response.data }
      }
      
      throw new Error(response.data.message || 'Erreur lors de la vérification')
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la vérification'
      setError(errorMessage)
      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // Mot de passe oublié
  const forgotPassword = async (email) => {
    try {
      isLoading.value = true
      clearError()

      const response = await api.post('/auth/forgot-password', { email })
      
      if (response.data.success) {
        showToast('Email de réinitialisation envoyé !', 'success')
        return { success: true, data: response.data }
      }
      
      throw new Error(response.data.message || 'Erreur lors de l\'envoi')
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de l\'envoi'
      setError(errorMessage)
      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // Réinitialisation du mot de passe
  const resetPassword = async (resetData) => {
    try {
      isLoading.value = true
      clearError()

      const response = await api.post('/auth/reset-password', resetData)
      
      if (response.data.success) {
        showToast('Mot de passe réinitialisé avec succès !', 'success')
        return { success: true, data: response.data }
      }
      
      throw new Error(response.data.message || 'Erreur lors de la réinitialisation')
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la réinitialisation'
      setError(errorMessage)
      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // Mise à jour du profil
  const updateProfile = async (profileData) => {
    try {
      isLoading.value = true
      clearError()

      const response = await api.put('/auth/profile', profileData)
      
      if (response.data.success) {
        setUser(response.data.data)
        showToast('Profil mis à jour avec succès !', 'success')
        return { success: true, data: response.data }
      }
      
      throw new Error(response.data.message || 'Erreur lors de la mise à jour')
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour'
      setError(errorMessage)
      showToast(errorMessage, 'error')
      return { success: false, error: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // Changement de mot de passe
  const changePassword = async (passwordData) => {
    try {
      isLoading.value = true
      clearError()

      const response = await api.put('/auth/change-password', passwordData)
      
      if (response.data.success) {
        showToast('Mot de passe changé avec succès !', 'success')
        return { success: true, data: response.data }
      }
      
      throw new Error(response.data.message || 'Erreur lors du changement')
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du changement'
      setError(errorMessage)
      showToast(errorMessage, 'error')
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
    user,
    token,
    refreshToken,
    isLoading,
    error,
    
    // Getters
    isAuthenticated,
    isAdmin,
    isEmailVerified,
    isTokenExpired,
    
    // Actions
    register,
    login,
    logout,
    checkAuth,
    refreshAuth,
    verifyEmail,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    setUser,
    setToken,
    setRefreshToken,
    setError,
    clearError
  }
})
