<template>
  <nav class="navbar">
    <div class="container">
      <router-link to="/" class="navbar-brand">
        🛍️ E-commerce
      </router-link>
      
      <div class="navbar-nav">
        <router-link to="/products" class="nav-link">
          Produits
        </router-link>
        
        <router-link to="/cart" class="nav-link">
          Panier ({{ cartStore.itemCount }})
        </router-link>
        
        <template v-if="authStore.isAuthenticated">
          <router-link to="/orders" class="nav-link">
            Mes commandes
          </router-link>
          
          <router-link v-if="authStore.isAdmin" to="/admin" class="nav-link">
            Administration
          </router-link>
          
          <div class="nav-item dropdown">
            <a href="#" class="nav-link dropdown-toggle" @click.prevent="toggleDropdown">
              {{ authStore.user?.firstName }} {{ authStore.user?.lastName }}
            </a>
            <div v-if="showDropdown" class="dropdown-menu">
              <router-link to="/profile" class="dropdown-item" @click="closeDropdown">
                Mon profil
              </router-link>
              <a href="#" class="dropdown-item" @click.prevent="logout">
                Déconnexion
              </a>
            </div>
          </div>
        </template>
        
        <template v-else>
          <router-link to="/login" class="nav-link">
            Connexion
          </router-link>
          <router-link to="/register" class="nav-link">
            Inscription
          </router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'

const authStore = useAuthStore()
const cartStore = useCartStore()

const showDropdown = ref(false)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const closeDropdown = () => {
  showDropdown.value = false
}

const logout = () => {
  authStore.logout()
  closeDropdown()
}

// Fermer le dropdown en cliquant à l'extérieur
const handleClickOutside = (event) => {
  if (!event.target.closest('.dropdown')) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: #fff;
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--box-shadow);
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
  color: var(--primary-color);
}

.navbar-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  text-decoration: none;
  color: #495057;
  padding: 0.5rem 0.75rem;
  border-radius: var(--border-radius);
  transition: all 0.15s ease-in-out;
}

.nav-link:hover {
  color: var(--primary-color);
  background-color: #f8f9fa;
}

.nav-link.router-link-active {
  color: var(--primary-color);
  font-weight: 500;
}

.dropdown {
  position: relative;
}

.dropdown-toggle {
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: #fff;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow-lg);
  min-width: 150px;
  z-index: 1001;
}

.dropdown-item {
  display: block;
  padding: 0.5rem 1rem;
  color: #495057;
  text-decoration: none;
  transition: background-color 0.15s ease-in-out;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .navbar .container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .navbar-nav {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
