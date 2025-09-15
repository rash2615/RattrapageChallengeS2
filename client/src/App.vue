<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Navigation principale -->
    <Navbar />
    
    <!-- Contenu principal -->
    <main class="flex-1">
      <router-view />
    </main>
    
    <!-- Footer -->
    <Footer />
    
    <!-- Modales globales -->
    <ConfirmModal />
    
    <!-- Consentement cookies RGPD -->
    <CookieConsent />
    
    <!-- Notifications toast -->
    <div id="toast-container" class="fixed top-4 right-4 z-50 space-y-2">
      <!-- Les notifications toast seront ajoutées ici dynamiquement -->
    </div>
    
    <!-- Loading global -->
    <div v-if="isLoading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 flex items-center space-x-3">
        <div class="spinner"></div>
        <span>Chargement...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'
import { useCartStore } from './stores/cart'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import ConfirmModal from './components/ConfirmModal.vue'
import CookieConsent from './components/RGPD/CookieConsent.vue'

// Stores
const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()

// État local
const isLoading = ref(false)

// Vérifier l'authentification au démarrage
onMounted(async () => {
  try {
    isLoading.value = true
    
    // Vérifier si l'utilisateur est connecté
    await authStore.checkAuth()
    
    // Charger le panier depuis le localStorage
    await cartStore.loadCartFromStorage()
    
    // Vérifier les tokens expirés
    if (authStore.isAuthenticated && authStore.isTokenExpired) {
      await authStore.logout()
      router.push('/login')
    }
    
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error)
  } finally {
    isLoading.value = false
  }
})

// Gestion des erreurs globales
onMounted(() => {
  // Intercepter les erreurs non gérées
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesse rejetée non gérée:', event.reason)
    showToast('Une erreur inattendue s\'est produite', 'error')
  })
  
  // Intercepter les erreurs JavaScript
  window.addEventListener('error', (event) => {
    console.error('Erreur JavaScript:', event.error)
    showToast('Une erreur s\'est produite', 'error')
  })
})

// Fonction pour afficher des notifications toast
const showToast = (message, type = 'info') => {
  const toastContainer = document.getElementById('toast-container')
  if (!toastContainer) return
  
  const toast = document.createElement('div')
  toast.className = `toast toast-${type} bg-white border rounded-lg shadow-lg p-4 max-w-sm`
  
  const colors = {
    success: 'border-green-500 text-green-700',
    error: 'border-red-500 text-red-700',
    warning: 'border-yellow-500 text-yellow-700',
    info: 'border-blue-500 text-blue-700'
  }
  
  toast.className += ` ${colors[type] || colors.info}`
  
  toast.innerHTML = `
    <div class="flex items-center justify-between">
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-gray-400 hover:text-gray-600">
        ×
      </button>
    </div>
  `
  
  toastContainer.appendChild(toast)
  
  // Auto-supprimer après 5 secondes
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove()
    }
  }, 5000)
}

// Exposer la fonction globalement pour les composants
window.showToast = showToast

// Nettoyage
onUnmounted(() => {
  window.removeEventListener('unhandledrejection', () => {})
  window.removeEventListener('error', () => {})
  delete window.showToast
})
</script>

<style scoped>
/* Styles spécifiques à l'App */
.min-h-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.flex-1 {
  flex: 1;
}

/* Styles pour les toasts */
.toast {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Styles pour le loading global */
.fixed {
  position: fixed;
}

.inset-0 {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}

.bg-black {
  background-color: #000;
}

.bg-opacity-50 {
  background-color: rgba(0, 0, 0, 0.5);
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.z-50 {
  z-index: 50;
}

.bg-white {
  background-color: #fff;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.p-6 {
  padding: 1.5rem;
}

.space-x-3 > * + * {
  margin-left: 0.75rem;
}

/* Responsive */
@media (max-width: 768px) {
  #toast-container {
    top: 1rem;
    right: 1rem;
    left: 1rem;
  }
  
  .toast {
    max-width: none;
  }
}
</style>
