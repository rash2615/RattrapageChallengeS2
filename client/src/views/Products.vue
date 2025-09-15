<template>
  <div class="products-page">
    <!-- En-tête de la page -->
    <div class="products-header">
      <div class="container">
        <div class="header-content">
          <h1 class="page-title">Catalogue Produits</h1>
          <p class="page-subtitle">Découvrez notre gamme complète d'accessoires téléphoniques</p>
          
          <!-- Barre de recherche -->
          <div class="search-section">
            <div class="search-bar">
              <input
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="Rechercher un produit..."
                @input="handleSearch"
              />
              <button class="search-button" @click="handleSearch">
                <span class="search-icon">🔍</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="products-layout">
        <!-- Sidebar des filtres -->
        <aside class="filters-sidebar">
          <div class="filters-header">
            <h3 class="filters-title">Filtres</h3>
            <button 
              v-if="hasActiveFilters" 
              class="clear-filters-btn"
              @click="clearAllFilters"
            >
              Effacer tout
            </button>
          </div>

          <!-- Filtre par catégorie -->
          <div class="filter-group">
            <h4 class="filter-title">Catégorie</h4>
            <div class="filter-options">
              <label 
                v-for="category in categories" 
                :key="category.value"
                class="filter-option"
              >
                <input
                  v-model="filters.category"
                  :value="category.value"
                  type="checkbox"
                  class="filter-checkbox"
                  @change="applyFilters"
                />
                <span class="filter-label">
                  {{ category.label }}
                  <span class="filter-count">({{ category.count }})</span>
                </span>
              </label>
            </div>
          </div>

          <!-- Filtre par marque -->
          <div class="filter-group">
            <h4 class="filter-title">Marque</h4>
            <div class="filter-options">
              <label 
                v-for="brand in brands" 
                :key="brand.value"
                class="filter-option"
              >
                <input
                  v-model="filters.brand"
                  :value="brand.value"
                  type="checkbox"
                  class="filter-checkbox"
                  @change="applyFilters"
                />
                <span class="filter-label">
                  {{ brand.label }}
                  <span class="filter-count">({{ brand.count }})</span>
                </span>
              </label>
            </div>
          </div>

          <!-- Filtre par couleur -->
          <div class="filter-group">
            <h4 class="filter-title">Couleur</h4>
            <div class="filter-options">
              <label 
                v-for="color in colors" 
                :key="color.value"
                class="filter-option"
              >
                <input
                  v-model="filters.color"
                  :value="color.value"
                  type="checkbox"
                  class="filter-checkbox"
                  @change="applyFilters"
                />
                <span class="filter-label">
                  <span 
                    class="color-swatch" 
                    :style="{ backgroundColor: color.hex }"
                  ></span>
                  {{ color.label }}
                  <span class="filter-count">({{ color.count }})</span>
                </span>
              </label>
            </div>
          </div>

          <!-- Filtre par prix -->
          <div class="filter-group">
            <h4 class="filter-title">Prix</h4>
            <div class="price-range">
              <div class="price-inputs">
                <input
                  v-model.number="filters.minPrice"
                  type="number"
                  class="price-input"
                  placeholder="Min"
                  min="0"
                  @change="applyFilters"
                />
                <span class="price-separator">-</span>
                <input
                  v-model.number="filters.maxPrice"
                  type="number"
                  class="price-input"
                  placeholder="Max"
                  min="0"
                  @change="applyFilters"
                />
              </div>
              <div class="price-display">
                {{ formatPrice(filters.minPrice || 0) }} - {{ formatPrice(filters.maxPrice || 1000) }}
              </div>
            </div>
          </div>

          <!-- Filtre par disponibilité -->
          <div class="filter-group">
            <h4 class="filter-title">Disponibilité</h4>
            <div class="filter-options">
              <label class="filter-option">
                <input
                  v-model="filters.inStock"
                  type="checkbox"
                  class="filter-checkbox"
                  @change="applyFilters"
                />
                <span class="filter-label">En stock uniquement</span>
              </label>
            </div>
          </div>

          <!-- Filtre par note -->
          <div class="filter-group">
            <h4 class="filter-title">Note minimum</h4>
            <div class="rating-filter">
              <div 
                v-for="rating in [5, 4, 3, 2, 1]" 
                :key="rating"
                class="rating-option"
                :class="{ active: filters.minRating >= rating }"
                @click="setMinRating(rating)"
              >
                <div class="stars">
                  <span 
                    v-for="star in 5" 
                    :key="star"
                    class="star"
                    :class="{ filled: star <= rating }"
                  >★</span>
                </div>
                <span class="rating-text">{{ rating }}+</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- Contenu principal -->
        <main class="products-main">
          <!-- Barre d'outils -->
          <div class="products-toolbar">
            <div class="results-info">
              <span class="results-count">
                {{ filteredProducts.length }} produit{{ filteredProducts.length > 1 ? 's' : '' }}
              </span>
              <span v-if="searchQuery" class="search-results">
                pour "{{ searchQuery }}"
              </span>
            </div>

            <div class="toolbar-controls">
              <!-- Tri -->
              <div class="sort-control">
                <label for="sort-select" class="sort-label">Trier par :</label>
                <select 
                  id="sort-select"
                  v-model="sortBy"
                  class="sort-select"
                  @change="applySorting"
                >
                  <option value="relevance">Pertinence</option>
                  <option value="name-asc">Nom A-Z</option>
                  <option value="name-desc">Nom Z-A</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="rating">Note</option>
                  <option value="newest">Plus récent</option>
                </select>
              </div>

              <!-- Vue -->
              <div class="view-controls">
                <button 
                  class="view-btn"
                  :class="{ active: viewMode === 'grid' }"
                  @click="setViewMode('grid')"
                  title="Vue grille"
                >
                  <span class="view-icon">⊞</span>
                </button>
                <button 
                  class="view-btn"
                  :class="{ active: viewMode === 'list' }"
                  @click="setViewMode('list')"
                  title="Vue liste"
                >
                  <span class="view-icon">☰</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Liste des produits -->
          <div class="products-grid" :class="`view-${viewMode}`">
            <ProductCard
              v-for="product in paginatedProducts"
              :key="product._id"
              :product="product"
              :view-mode="viewMode"
              @add-to-cart="handleAddToCart"
              @add-to-wishlist="handleAddToWishlist"
            />
          </div>

          <!-- Message si aucun produit -->
          <div v-if="filteredProducts.length === 0" class="no-products">
            <div class="no-products-icon">📱</div>
            <h3 class="no-products-title">Aucun produit trouvé</h3>
            <p class="no-products-text">
              Essayez de modifier vos critères de recherche ou de filtres
            </p>
            <button class="clear-filters-btn" @click="clearAllFilters">
              Effacer tous les filtres
            </button>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="pagination">
            <button 
              class="pagination-btn"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              ← Précédent
            </button>
            
            <div class="pagination-pages">
              <button
                v-for="page in visiblePages"
                :key="page"
                class="pagination-page"
                :class="{ active: page === currentPage }"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
            </div>
            
            <button 
              class="pagination-btn"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              Suivant →
            </button>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductCard from '../components/ProductCard.vue'
import { useCartStore } from '../stores/cart'

// Router et store
const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()

// État local
const products = ref([])
const isLoading = ref(false)
const searchQuery = ref('')
const viewMode = ref('grid')
const sortBy = ref('relevance')
const currentPage = ref(1)
const itemsPerPage = 12

// Filtres
const filters = reactive({
  category: [],
  brand: [],
  color: [],
  minPrice: null,
  maxPrice: null,
  inStock: false,
  minRating: 0
})

// Données de filtres
const categories = ref([
  { value: 'chargers', label: 'Chargeurs', count: 0 },
  { value: 'cases', label: 'Coques', count: 0 },
  { value: 'cables', label: 'Câbles', count: 0 },
  { value: 'earphones', label: 'Écouteurs', count: 0 },
  { value: 'screen-protectors', label: 'Protège-écrans', count: 0 },
  { value: 'holders', label: 'Supports', count: 0 },
  { value: 'power-banks', label: 'Batteries externes', count: 0 }
])

const brands = ref([
  { value: 'apple', label: 'Apple', count: 0 },
  { value: 'samsung', label: 'Samsung', count: 0 },
  { value: 'xiaomi', label: 'Xiaomi', count: 0 },
  { value: 'huawei', label: 'Huawei', count: 0 },
  { value: 'oneplus', label: 'OnePlus', count: 0 },
  { value: 'generic', label: 'Générique', count: 0 }
])

const colors = ref([
  { value: 'black', label: 'Noir', hex: '#000000', count: 0 },
  { value: 'white', label: 'Blanc', hex: '#ffffff', count: 0 },
  { value: 'blue', label: 'Bleu', hex: '#3b82f6', count: 0 },
  { value: 'red', label: 'Rouge', hex: '#ef4444', count: 0 },
  { value: 'green', label: 'Vert', hex: '#10b981', count: 0 },
  { value: 'pink', label: 'Rose', hex: '#ec4899', count: 0 },
  { value: 'purple', label: 'Violet', hex: '#8b5cf6', count: 0 },
  { value: 'gold', label: 'Or', hex: '#f59e0b', count: 0 }
])

// Computed
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
  if (filters.category.length > 0) {
    filtered = filtered.filter(product => 
      filters.category.includes(product.category)
    )
  }

  if (filters.brand.length > 0) {
    filtered = filtered.filter(product => 
      filters.brand.includes(product.brand)
    )
  }

  if (filters.color.length > 0) {
    filtered = filtered.filter(product => 
      filters.color.some(color => product.colors.includes(color))
    )
  }

  if (filters.minPrice !== null) {
    filtered = filtered.filter(product => product.price >= filters.minPrice)
  }

  if (filters.maxPrice !== null) {
    filtered = filtered.filter(product => product.price <= filters.maxPrice)
  }

  if (filters.inStock) {
    filtered = filtered.filter(product => product.stock > 0)
  }

  if (filters.minRating > 0) {
    filtered = filtered.filter(product => product.rating >= filters.minRating)
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

const totalPages = computed(() => 
  Math.ceil(sortedProducts.value.length / itemsPerPage)
)

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return sortedProducts.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

const hasActiveFilters = computed(() => {
  return filters.category.length > 0 ||
         filters.brand.length > 0 ||
         filters.color.length > 0 ||
         filters.minPrice !== null ||
         filters.maxPrice !== null ||
         filters.inStock ||
         filters.minRating > 0
})

// Fonctions
const loadProducts = async () => {
  try {
    isLoading.value = true
    // TODO: Remplacer par l'appel API réel
    // const response = await api.get('/products')
    // products.value = response.data.data
    
    // Données de test
    products.value = generateMockProducts()
    updateFilterCounts()
  } catch (error) {
    console.error('Erreur lors du chargement des produits:', error)
  } finally {
    isLoading.value = false
  }
}

const generateMockProducts = () => {
  const mockProducts = []
  const categories = ['chargers', 'cases', 'cables', 'earphones', 'screen-protectors', 'holders', 'power-banks']
  const brands = ['apple', 'samsung', 'xiaomi', 'huawei', 'oneplus', 'generic']
  const colors = ['black', 'white', 'blue', 'red', 'green', 'pink', 'purple', 'gold']
  
  for (let i = 1; i <= 50; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)]
    const brand = brands[Math.floor(Math.random() * brands.length)]
    const productColors = colors.slice(0, Math.floor(Math.random() * 3) + 1)
    
    mockProducts.push({
      _id: `product_${i}`,
      name: `Produit ${i} ${brand}`,
      description: `Description du produit ${i} de marque ${brand}`,
      price: Math.floor(Math.random() * 200) + 10,
      category,
      brand,
      colors: productColors,
      stock: Math.floor(Math.random() * 100),
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
      images: [`https://via.placeholder.com/300x300?text=Product+${i}`],
      isNew: Math.random() > 0.7,
      isOnSale: Math.random() > 0.8,
      isFeatured: Math.random() > 0.9,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
    })
  }
  
  return mockProducts
}

const updateFilterCounts = () => {
  // Mettre à jour les compteurs des filtres
  categories.value.forEach(category => {
    category.count = products.value.filter(p => p.category === category.value).length
  })
  
  brands.value.forEach(brand => {
    brand.count = products.value.filter(p => p.brand === brand.value).length
  })
  
  colors.value.forEach(color => {
    color.count = products.value.filter(p => p.colors.includes(color.value)).length
  })
}

const handleSearch = () => {
  currentPage.value = 1
  updateURL()
}

const applyFilters = () => {
  currentPage.value = 1
  updateURL()
}

const applySorting = () => {
  currentPage.value = 1
  updateURL()
}

const setViewMode = (mode) => {
  viewMode.value = mode
}

const setMinRating = (rating) => {
  filters.minRating = filters.minRating === rating ? 0 : rating
  applyFilters()
}

const clearAllFilters = () => {
  filters.category = []
  filters.brand = []
  filters.color = []
  filters.minPrice = null
  filters.maxPrice = null
  filters.inStock = false
  filters.minRating = 0
  searchQuery.value = ''
  currentPage.value = 1
  updateURL()
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    updateURL()
  }
}

const updateURL = () => {
  const query = {}
  
  if (searchQuery.value) query.search = searchQuery.value
  if (filters.category.length > 0) query.category = filters.category.join(',')
  if (filters.brand.length > 0) query.brand = filters.brand.join(',')
  if (filters.color.length > 0) query.color = filters.color.join(',')
  if (filters.minPrice !== null) query.minPrice = filters.minPrice
  if (filters.maxPrice !== null) query.maxPrice = filters.maxPrice
  if (filters.inStock) query.inStock = 'true'
  if (filters.minRating > 0) query.minRating = filters.minRating
  if (sortBy.value !== 'relevance') query.sort = sortBy.value
  if (viewMode.value !== 'grid') query.view = viewMode.value
  if (currentPage.value > 1) query.page = currentPage.value
  
  router.replace({ query })
}

const loadFromURL = () => {
  const query = route.query
  
  if (query.search) searchQuery.value = query.search
  if (query.category) filters.category = query.category.split(',')
  if (query.brand) filters.brand = query.brand.split(',')
  if (query.color) filters.color = query.color.split(',')
  if (query.minPrice) filters.minPrice = parseInt(query.minPrice)
  if (query.maxPrice) filters.maxPrice = parseInt(query.maxPrice)
  if (query.inStock === 'true') filters.inStock = true
  if (query.minRating) filters.minRating = parseInt(query.minRating)
  if (query.sort) sortBy.value = query.sort
  if (query.view) viewMode.value = query.view
  if (query.page) currentPage.value = parseInt(query.page)
}

const handleAddToCart = (product) => {
  cartStore.addToCart(product)
}

const handleAddToWishlist = (product) => {
  // TODO: Implémenter la wishlist
  console.log('Ajouter à la wishlist:', product)
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

// Watchers
watch(() => route.query, loadFromURL, { immediate: true })

// Lifecycle
onMounted(() => {
  loadProducts()
})
</script>

<style scoped>
/* Page des produits */
.products-page {
  min-height: 100vh;
  background-color: #f8fafc;
}

/* En-tête */
.products-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 3rem 0;
  margin-bottom: 2rem;
}

.header-content {
  text-align: center;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
}

.page-subtitle {
  font-size: 1.125rem;
  opacity: 0.9;
  margin: 0 0 2rem 0;
}

.search-section {
  max-width: 600px;
  margin: 0 auto;
}

.search-bar {
  display: flex;
  background: white;
  border-radius: 2rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.search-input {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  font-size: 1rem;
  outline: none;
}

.search-button {
  padding: 1rem 1.5rem;
  background: #3b82f6;
  border: none;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.search-button:hover {
  background: #2563eb;
}

.search-icon {
  font-size: 1.25rem;
}

/* Layout principal */
.products-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
}

/* Sidebar des filtres */
.filters-sidebar {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.filters-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.clear-filters-btn {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
}

.clear-filters-btn:hover {
  color: #dc2626;
}

.filter-group {
  margin-bottom: 2rem;
}

.filter-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: #374151;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.filter-checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: #3b82f6;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.filter-count {
  color: #6b7280;
  font-size: 0.75rem;
}

.color-swatch {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 1px solid #d1d5db;
}

/* Filtre de prix */
.price-range {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.price-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.price-separator {
  color: #6b7280;
  font-weight: 500;
}

.price-display {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
}

/* Filtre de note */
.rating-filter {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rating-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.rating-option:hover {
  background-color: #f3f4f6;
}

.rating-option.active {
  background-color: #dbeafe;
}

.stars {
  display: flex;
  gap: 0.125rem;
}

.star {
  color: #d1d5db;
  font-size: 1rem;
}

.star.filled {
  color: #fbbf24;
}

.rating-text {
  font-size: 0.875rem;
  font-weight: 500;
}

/* Contenu principal */
.products-main {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.products-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.results-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.results-count {
  font-weight: 600;
  color: #374151;
}

.search-results {
  color: #6b7280;
  font-size: 0.875rem;
}

.toolbar-controls {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.sort-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-label {
  font-size: 0.875rem;
  color: #374151;
}

.sort-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
}

.view-controls {
  display: flex;
  gap: 0.25rem;
}

.view-btn {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-btn:first-child {
  border-radius: 0.375rem 0 0 0.375rem;
}

.view-btn:last-child {
  border-radius: 0 0.375rem 0.375rem 0;
}

.view-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.view-icon {
  font-size: 1rem;
}

/* Grille des produits */
.products-grid {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.products-grid.view-grid {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
}

.products-grid.view-list {
  grid-template-columns: 1fr;
}

/* Aucun produit */
.no-products {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.no-products-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.no-products-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #374151;
}

.no-products-text {
  margin: 0 0 2rem 0;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 0.25rem;
}

.pagination-page {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  cursor: pointer;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
  min-width: 2.5rem;
  text-align: center;
}

.pagination-page:hover {
  background: #f3f4f6;
}

.pagination-page.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

/* Responsive */
@media (max-width: 1024px) {
  .products-layout {
    grid-template-columns: 250px 1fr;
  }
}

@media (max-width: 768px) {
  .products-layout {
    grid-template-columns: 1fr;
  }
  
  .filters-sidebar {
    position: static;
    order: 2;
  }
  
  .products-main {
    order: 1;
  }
  
  .products-toolbar {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .toolbar-controls {
    justify-content: space-between;
  }
  
  .products-grid.view-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 480px) {
  .products-header {
    padding: 2rem 0;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .search-bar {
    flex-direction: column;
  }
  
  .search-button {
    border-radius: 0 0 2rem 2rem;
  }
  
  .products-grid.view-grid {
    grid-template-columns: 1fr;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
}
</style>
