<template>
  <nav class="navbar">
    <div class="container">
      <div class="navbar-content">
        <!-- Logo -->
        <router-link to="/" class="navbar-brand">
          <div class="logo">
            <span class="logo-icon">⚡</span>
            <span class="logo-text">SPARK</span>
          </div>
        </router-link>

        <!-- Navigation principale -->
        <div class="navbar-nav">
          <router-link to="/" class="nav-link">Accueil</router-link>
          <router-link to="/products" class="nav-link">Produits</router-link>
          
          <!-- Menu catégories -->
          <div class="nav-dropdown">
            <button class="nav-link dropdown-toggle" @click="toggleCategories">
              Catégories
              <span class="dropdown-arrow" :class="{ 'open': showCategories }">▼</span>
            </button>
            <div class="dropdown-menu" :class="{ 'show': showCategories }">
              <router-link 
                v-for="category in categories" 
                :key="category.value"
                :to="`/products?category=${category.value}`"
                class="dropdown-item"
                @click="closeCategories"
              >
                {{ category.label }}
              </router-link>
            </div>
          </div>
        </div>

        <!-- Barre de recherche -->
        <div class="navbar-search">
          <form @submit.prevent="handleSearch" class="search-form">
            <div class="search-input-group">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Rechercher un produit..."
                class="search-input"
                @focus="showSearchSuggestions = true"
                @blur="hideSearchSuggestions"
              />
              <button type="submit" class="search-button">
                <span class="search-icon">🔍</span>
              </button>
            </div>
            
            <!-- Suggestions de recherche -->
            <div v-if="showSearchSuggestions && searchSuggestions.length > 0" class="search-suggestions">
              <div
                v-for="suggestion in searchSuggestions"
                :key="suggestion._id"
                class="suggestion-item"
                @click="selectSuggestion(suggestion)"
              >
                <img :src="suggestion.images[0]?.url" :alt="suggestion.name" class="suggestion-image" />
                <div class="suggestion-content">
                  <div class="suggestion-name">{{ suggestion.name }}</div>
                  <div class="suggestion-brand">{{ suggestion.brand }}</div>
                  <div class="suggestion-price">{{ formatPrice(suggestion.price) }}</div>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Actions utilisateur -->
        <div class="navbar-actions">
          <!-- Panier -->
          <router-link to="/cart" class="action-button cart-button">
            <span class="cart-icon">🛒</span>
            <span v-if="cartStore.totalItems > 0" class="cart-badge">
              {{ cartStore.totalItems }}
            </span>
          </router-link>

          <!-- Menu utilisateur -->
          <div v-if="authStore.isAuthenticated" class="nav-dropdown">
            <button class="action-button user-button" @click="toggleUserMenu">
              <span class="user-avatar">
                {{ authStore.user?.firstName?.charAt(0) }}
              </span>
              <span class="user-name">{{ authStore.user?.firstName }}</span>
              <span class="dropdown-arrow" :class="{ 'open': showUserMenu }">▼</span>
            </button>
            <div class="dropdown-menu user-menu" :class="{ 'show': showUserMenu }">
              <router-link to="/profile" class="dropdown-item" @click="closeUserMenu">
                <span class="menu-icon">👤</span>
                Mon profil
              </router-link>
              <router-link to="/orders" class="dropdown-item" @click="closeUserMenu">
                <span class="menu-icon">📦</span>
                Mes commandes
              </router-link>
              <router-link 
                v-if="authStore.user?.role === 'admin'"
                to="/admin" 
                class="dropdown-item" 
                @click="closeUserMenu"
              >
                <span class="menu-icon">⚙️</span>
                Administration
              </router-link>
              <div class="dropdown-divider"></div>
              <button @click="handleLogout" class="dropdown-item logout-item">
                <span class="menu-icon">🚪</span>
                Déconnexion
              </button>
            </div>
          </div>

          <!-- Boutons de connexion/inscription -->
          <div v-else class="auth-buttons">
            <router-link to="/login" class="btn btn-outline btn-sm">
              Connexion
            </router-link>
            <router-link to="/register" class="btn btn-primary btn-sm">
              Inscription
            </router-link>
          </div>

          <!-- Menu mobile -->
          <button class="mobile-menu-button" @click="toggleMobileMenu">
            <span class="hamburger" :class="{ 'open': showMobileMenu }">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      <!-- Menu mobile -->
      <div class="mobile-menu" :class="{ 'show': showMobileMenu }">
        <div class="mobile-menu-content">
          <router-link to="/" class="mobile-nav-link" @click="closeMobileMenu">
            Accueil
          </router-link>
          <router-link to="/products" class="mobile-nav-link" @click="closeMobileMenu">
            Produits
          </router-link>
          
          <!-- Catégories mobile -->
          <div class="mobile-categories">
            <div class="mobile-category-header" @click="toggleMobileCategories">
              Catégories
              <span class="mobile-arrow" :class="{ 'open': showMobileCategories }">▼</span>
            </div>
            <div class="mobile-category-list" :class="{ 'show': showMobileCategories }">
              <router-link 
                v-for="category in categories" 
                :key="category.value"
                :to="`/products?category=${category.value}`"
                class="mobile-category-item"
                @click="closeMobileMenu"
              >
                {{ category.label }}
              </router-link>
            </div>
          </div>

          <!-- Actions mobile -->
          <div class="mobile-actions">
            <router-link to="/cart" class="mobile-action-button" @click="closeMobileMenu">
              <span class="action-icon">🛒</span>
              Panier
              <span v-if="cartStore.totalItems > 0" class="action-badge">
                {{ cartStore.totalItems }}
              </span>
            </router-link>

            <div v-if="authStore.isAuthenticated" class="mobile-user-actions">
              <router-link to="/profile" class="mobile-action-button" @click="closeMobileMenu">
                <span class="action-icon">👤</span>
                Mon profil
              </router-link>
              <router-link to="/orders" class="mobile-action-button" @click="closeMobileMenu">
                <span class="action-icon">📦</span>
                Mes commandes
              </router-link>
              <button @click="handleLogout" class="mobile-action-button logout">
                <span class="action-icon">🚪</span>
                Déconnexion
              </button>
            </div>

            <div v-else class="mobile-auth-buttons">
              <router-link to="/login" class="mobile-action-button" @click="closeMobileMenu">
                Connexion
              </router-link>
              <router-link to="/register" class="mobile-action-button primary" @click="closeMobileMenu">
                Inscription
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'
import { debounce } from '../utils/helpers'

// Stores
const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()

// État local
const showCategories = ref(false)
const showUserMenu = ref(false)
const showMobileMenu = ref(false)
const showMobileCategories = ref(false)
const showSearchSuggestions = ref(false)
const searchQuery = ref('')
const searchSuggestions = ref([])

// Catégories de produits
const categories = [
  { value: 'chargers', label: 'Chargeurs' },
  { value: 'cases', label: 'Coques' },
  { value: 'cables', label: 'Câbles' },
  { value: 'headphones', label: 'Écouteurs' },
  { value: 'accessories', label: 'Accessoires' }
]

// Fonctions de recherche
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      name: 'Products',
      query: { search: searchQuery.value.trim() }
    })
    hideSearchSuggestions()
  }
}

const searchProducts = debounce(async (query) => {
  if (query.length < 2) {
    searchSuggestions.value = []
    return
  }

  try {
    const response = await api.get('/products/search', {
      params: { q: query, limit: 5 }
    })
    
    if (response.data.success) {
      searchSuggestions.value = response.data.data.products || []
    }
  } catch (error) {
    console.error('Erreur lors de la recherche:', error)
    searchSuggestions.value = []
  }
}, 300)

const selectSuggestion = (product) => {
  router.push({
    name: 'ProductDetail',
    params: { id: product._id }
  })
  hideSearchSuggestions()
}

const hideSearchSuggestions = () => {
  setTimeout(() => {
    showSearchSuggestions.value = false
  }, 200)
}

// Fonctions de menu
const toggleCategories = () => {
  showCategories.value = !showCategories.value
  if (showCategories.value) {
    showUserMenu.value = false
  }
}

const closeCategories = () => {
  showCategories.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  if (showUserMenu.value) {
    showCategories.value = false
  }
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

const toggleMobileCategories = () => {
  showMobileCategories.value = !showMobileCategories.value
}

// Déconnexion
const handleLogout = async () => {
  await authStore.logout()
  closeUserMenu()
  closeMobileMenu()
  router.push('/')
}

// Formatage des prix
const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

// Gestion des clics extérieurs
const handleClickOutside = (event) => {
  if (!event.target.closest('.nav-dropdown')) {
    showCategories.value = false
    showUserMenu.value = false
  }
  
  if (!event.target.closest('.navbar-search')) {
    showSearchSuggestions.value = false
  }
}

// Watchers
watch(searchQuery, (newQuery) => {
  searchProducts(newQuery)
})

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Styles de la navbar */
.navbar {
  background-color: var(--white);
  border-bottom: 1px solid var(--gray-200);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4) 0;
  gap: var(--spacing-4);
}

/* Logo */
.navbar-brand {
  text-decoration: none;
  color: var(--primary-color);
  font-weight: 700;
  font-size: var(--font-size-xl);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.logo-icon {
  font-size: var(--font-size-2xl);
}

.logo-text {
  font-size: var(--font-size-xl);
  font-weight: 700;
}

/* Navigation principale */
.navbar-nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-6);
}

.nav-link {
  color: var(--gray-700);
  text-decoration: none;
  font-weight: 500;
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--border-radius);
  transition: all var(--transition-fast);
}

.nav-link:hover {
  color: var(--primary-color);
  background-color: var(--gray-100);
}

.nav-link.router-link-active {
  color: var(--primary-color);
  background-color: var(--gray-100);
}

/* Dropdown */
.nav-dropdown {
  position: relative;
}

.dropdown-toggle {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.dropdown-arrow {
  font-size: var(--font-size-xs);
  transition: transform var(--transition-fast);
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all var(--transition-fast);
  z-index: var(--z-dropdown);
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  color: var(--gray-700);
  text-decoration: none;
  transition: background-color var(--transition-fast);
}

.dropdown-item:hover {
  background-color: var(--gray-100);
}

.dropdown-divider {
  height: 1px;
  background-color: var(--gray-200);
  margin: var(--spacing-2) 0;
}

.logout-item {
  color: var(--error-color);
}

/* Barre de recherche */
.navbar-search {
  flex: 1;
  max-width: 400px;
  position: relative;
}

.search-form {
  position: relative;
  width: 100%;
}

.search-input-group {
  display: flex;
  align-items: center;
  background-color: var(--gray-100);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
}

.search-input {
  flex: 1;
  padding: var(--spacing-2) var(--spacing-3);
  border: none;
  background: none;
  outline: none;
  font-size: var(--font-size-sm);
}

.search-button {
  padding: var(--spacing-2) var(--spacing-3);
  border: none;
  background: none;
  cursor: pointer;
  color: var(--gray-500);
  transition: color var(--transition-fast);
}

.search-button:hover {
  color: var(--primary-color);
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  max-height: 300px;
  overflow-y: auto;
  z-index: var(--z-dropdown);
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  cursor: pointer;
  transition: background-color var(--transition-fast);
}

.suggestion-item:hover {
  background-color: var(--gray-100);
}

.suggestion-image {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: var(--border-radius);
}

.suggestion-content {
  flex: 1;
}

.suggestion-name {
  font-weight: 500;
  color: var(--gray-900);
}

.suggestion-brand {
  font-size: var(--font-size-xs);
  color: var(--gray-500);
}

.suggestion-price {
  font-weight: 600;
  color: var(--primary-color);
}

/* Actions utilisateur */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.action-button {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--gray-700);
  text-decoration: none;
  border-radius: var(--border-radius);
  transition: all var(--transition-fast);
}

.action-button:hover {
  background-color: var(--gray-100);
  color: var(--primary-color);
}

.cart-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: var(--error-color);
  color: var(--white);
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background-color: var(--primary-color);
  color: var(--white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: var(--font-size-sm);
}

.user-menu {
  right: 0;
  left: auto;
}

.menu-icon {
  font-size: var(--font-size-sm);
}

/* Boutons d'authentification */
.auth-buttons {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

/* Menu mobile */
.mobile-menu-button {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-2);
}

.hamburger {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 20px;
  height: 16px;
}

.hamburger span {
  width: 100%;
  height: 2px;
  background-color: var(--gray-700);
  transition: all var(--transition-fast);
}

.hamburger.open span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger.open span:nth-child(2) {
  opacity: 0;
}

.hamburger.open span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

.mobile-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: var(--white);
  border-top: 1px solid var(--gray-200);
  box-shadow: var(--shadow-lg);
  z-index: var(--z-dropdown);
}

.mobile-menu.show {
  display: block;
}

.mobile-menu-content {
  padding: var(--spacing-4);
}

.mobile-nav-link {
  display: block;
  padding: var(--spacing-3) 0;
  color: var(--gray-700);
  text-decoration: none;
  border-bottom: 1px solid var(--gray-200);
}

.mobile-nav-link:hover {
  color: var(--primary-color);
}

.mobile-categories {
  margin: var(--spacing-4) 0;
}

.mobile-category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) 0;
  color: var(--gray-700);
  cursor: pointer;
  border-bottom: 1px solid var(--gray-200);
}

.mobile-arrow {
  font-size: var(--font-size-xs);
  transition: transform var(--transition-fast);
}

.mobile-arrow.open {
  transform: rotate(180deg);
}

.mobile-category-list {
  max-height: 0;
  overflow: hidden;
  transition: max-height var(--transition-fast);
}

.mobile-category-list.show {
  max-height: 200px;
}

.mobile-category-item {
  display: block;
  padding: var(--spacing-2) var(--spacing-4);
  color: var(--gray-600);
  text-decoration: none;
  font-size: var(--font-size-sm);
}

.mobile-category-item:hover {
  color: var(--primary-color);
}

.mobile-actions {
  margin-top: var(--spacing-4);
  padding-top: var(--spacing-4);
  border-top: 1px solid var(--gray-200);
}

.mobile-action-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) 0;
  color: var(--gray-700);
  text-decoration: none;
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  border-bottom: 1px solid var(--gray-200);
}

.mobile-action-button:hover {
  color: var(--primary-color);
}

.mobile-action-button.primary {
  color: var(--primary-color);
  font-weight: 600;
}

.mobile-action-button.logout {
  color: var(--error-color);
}

.action-icon {
  font-size: var(--font-size-sm);
}

.action-badge {
  background-color: var(--error-color);
  color: var(--white);
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: auto;
}

.mobile-auth-buttons {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  margin-top: var(--spacing-4);
}

/* Responsive */
@media (max-width: 768px) {
  .navbar-nav,
  .navbar-search,
  .auth-buttons {
    display: none;
  }
  
  .mobile-menu-button {
    display: block;
  }
  
  .mobile-menu {
    display: block;
  }
  
  .navbar-content {
    padding: var(--spacing-3) 0;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 var(--spacing-2);
  }
  
  .logo-text {
    font-size: var(--font-size-lg);
  }
}
</style>
