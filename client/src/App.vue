<template>
  <div id="app">
    <Navbar />
    <main>
      <router-view />
    </main>
    <Footer />
    
    <!-- Modales globales -->
    <ConfirmModal 
      v-if="confirmModal.show"
      :title="confirmModal.title"
      :message="confirmModal.message"
      :loading="confirmModal.loading"
      :error="confirmModal.error"
      @confirm="confirmModal.onConfirm"
      @cancel="confirmModal.onCancel"
    />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useCartStore } from './stores/cart'
import { useConfirmModalStore } from './stores/confirmModal'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
import ConfirmModal from './components/ConfirmModal.vue'

const authStore = useAuthStore()
const cartStore = useCartStore()
const confirmModal = useConfirmModalStore()

onMounted(async () => {
  // Initialiser l'authentification
  await authStore.initializeAuth()
  
  // Initialiser le panier
  await cartStore.initializeCart()
})
</script>

<style scoped>
main {
  min-height: calc(100vh - 200px);
  padding-top: 80px; /* Espace pour la navbar fixe */
}
</style>
