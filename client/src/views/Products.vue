<template>
  <div class="products-page">
    <div class="container">
      <div class="row">
        <!-- Filtres -->
        <div class="col-md-3">
          <div class="filters-card">
            <h5>Filtres</h5>
            
            <!-- Recherche -->
            <div class="filter-group">
              <label class="form-label">Recherche</label>
              <input
                type="text"
                v-model="filters.search"
                class="form-control"
                placeholder="Nom du produit..."
                @input="debouncedSearch"
              />
            </div>
            
            <!-- Catégorie -->
            <div class="filter-group">
              <label class="form-label">Catégorie</label>
              <select v-model="filters.category" class="form-control" @change="applyFilters">
                <option value="">Toutes les catégories</option>
                <option v-for="category in availableFilters.categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
            
            <!-- Marque -->
            <div class="filter-group">
              <label class="form-label">Marque</label>
              <select v-model="filters.brand" class="form-control" @change="applyFilters">
                <option value="">Toutes les marques</option>
                <option v-for="brand in availableFilters.brands" :key="brand" :value="brand">
                  {{ brand }}
                </option>
              </select>
            </div>
            
            <!-- Prix -->
            <div class="filter-group">
              <label class="form-label">Prix</label>
              <div class="price-range">
                <input
                  type="number"
                  v-model="filters.minPrice"
                  class="form-control mb-2"
                  placeholder="Prix min"
                  @change="applyFilters"
                />
                <input
                  type="number"
                  v-model="filters.maxPrice"
                  class="form-control"
                  placeholder="Prix max"
                  @change="applyFilters"
                />
              </div>
            </div>
            
            <!-- Taille -->
            <div class="filter-group">
              <label class="form-label">Taille</label>
              <select v-model="filters.size" class="form-control" @change="applyFilters">
                <option value="">Toutes les tailles</option>
                <option v-for="size in availableFilters.sizes" :key="size" :value="size">
                  {{ size }}
                </option>
              </select>
            </div>
            
            <!-- Couleur -->
            <div class="filter-group">
              <label class="form-label">Couleur</label>
              <select v-model="filters.color" class="form-control" @change="applyFilters">
                <option value="">Toutes les couleurs</option>
                <option v-for="color in availableFilters.colors" :key="color" :value="color">
                  {{ color }}
                </option>
              </select>
            </div>
            
            <!-- Bouton reset -->
            <button @click="resetFilters" class="btn btn-outline-secondary w-100">
              Réinitialiser les filtres
            </button>
          </div>
        </div>
        
        <!-- Produits -->
        <div class="col-md-9">
          <!-- En-tête -->
          <div class="products-header">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4>Produits</h4>
              <div class="d-flex align-items-center gap-3">
                <span class="text-muted">{{ pagination.totalItems }} produit(s) trouvé(s)</span>
                <select v-model="filters.sort" class="form-control" @change="applyFilters" style="width: auto;">
                  <option value="-createdAt">Plus récents</option>
                  <option value="createdAt">Plus anciens</option>
                  <option value="price">Prix croissant</option>
                  <option value="-price">Prix décroissant</option>
                  <option value="name">Nom A-Z</option>
                  <option value="-name">Nom Z-A</option>
                </select>
              </div>
            </div>
          </div>
          
          <!-- Loading -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Chargement...</span>
            </div>
          </div>
          
          <!-- Erreur -->
          <div v-else-if="error" class="alert alert-danger">
            {{ error }}
          </div>
          
          <!-- Produits -->
          <div v-else>
            <div v-if="products.length === 0" class="text-center py-5">
              <h5>Aucun produit trouvé</h5>
              <p>Essayez de modifier vos critères de recherche</p>
              <button @click="resetFilters" class="btn btn-primary">
                Réinitialiser les filtres
              </button>
            </div>
            
            <div v-else class="row">
              <div 
                v-for="product in products" 
                :key="product._id"
                class="col-lg-4 col-md-6 mb-4"
              >
                <ProductCard :product="product" />
              </div>
            </div>
            
            <!-- Pagination -->
            <nav v-if="pagination.totalPages > 1" class="mt-4">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: pagination.currentPage === 1 }">
                  <button 
                    class="page-link" 
                    @click="changePage(pagination.currentPage - 1)"
                    :disabled="pagination.currentPage === 1"
                  >
                    Précédent
                  </button>
                </li>
                
                <li 
                  v-for="page in visiblePages" 
                  :key="page"
                  class="page-item"
                  :class="{ active: page === pagination.currentPage }"
                >
                  <button class="page-link" @click="changePage(page)">
                    {{ page }}
                  </button>
                </li>
                
                <li class="page-item" :class="{ disabled: pagination.currentPage === pagination.totalPages }">
                  <button 
                    class="page-link" 
                    @click="changePage(pagination.currentPage + 1)"
                    :disabled="pagination.currentPage === pagination.totalPages"
                  >
                    Suivant
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductCard from '../components/ProductCard.vue'
import api from '../services/api'
import { debounce } from 'lodash-es'

const route = useRoute()
const router = useRouter()

const products = ref([])
const loading = ref(false)
const error = ref(null)
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 12
})

const availableFilters = ref({
  categories: [],
  brands: [],
  sizes: [],
  colors: [],
  priceRange: { min: 0, max: 1000 }
})

const filters = reactive({
  search: '',
  category: '',
  brand: '',
  minPrice: '',
  maxPrice: '',
  size: '',
  color: '',
  sort: '-createdAt'
})

// Pages visibles pour la pagination
const visiblePages = computed(() => {
  const current = pagination.value.currentPage
  const total = pagination.value.totalPages
  const pages = []
  
  const start = Math.max(1, current - 2)
  const end = Math.min(total, current + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Recherche avec debounce
const debouncedSearch = debounce(() => {
  applyFilters()
}, 500)

// Charger les produits
const loadProducts = async () => {
  try {
    loading.value = true
    error.value = null
    
    const params = new URLSearchParams()
    
    // Ajouter les filtres
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key])
      }
    })
    
    // Ajouter la pagination
    params.append('page', pagination.value.currentPage)
    params.append('limit', pagination.value.itemsPerPage)
    
    const response = await api.get(`/products?${params.toString()}`)
    
    products.value = response.data.products
    pagination.value = response.data.pagination
    availableFilters.value = response.data.filters
    
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur de chargement des produits'
  } finally {
    loading.value = false
  }
}

// Appliquer les filtres
const applyFilters = () => {
  pagination.value.currentPage = 1
  loadProducts()
  updateURL()
}

// Réinitialiser les filtres
const resetFilters = () => {
  Object.keys(filters).forEach(key => {
    filters[key] = ''
  })
  filters.sort = '-createdAt'
  applyFilters()
}

// Changer de page
const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.currentPage = page
    loadProducts()
    updateURL()
  }
}

// Mettre à jour l'URL
const updateURL = () => {
  const query = { ...filters }
  Object.keys(query).forEach(key => {
    if (!query[key]) delete query[key]
  })
  query.page = pagination.value.currentPage
  
  router.push({ query })
}

// Charger les filtres depuis l'URL
const loadFiltersFromURL = () => {
  const query = route.query
  Object.keys(filters).forEach(key => {
    if (query[key]) {
      filters[key] = query[key]
    }
  })
  if (query.page) {
    pagination.value.currentPage = parseInt(query.page)
  }
}

// Watcher pour les changements de route
watch(() => route.query, () => {
  loadFiltersFromURL()
  loadProducts()
}, { deep: true })

onMounted(() => {
  loadFiltersFromURL()
  loadProducts()
})
</script>

<style scoped>
.products-page {
  padding: 2rem 0;
}

.filters-card {
  background: white;
  padding: 1.5rem;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  position: sticky;
  top: 100px;
}

.filter-group {
  margin-bottom: 1.5rem;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.price-range input {
  width: 100%;
}

.products-header {
  margin-bottom: 2rem;
}

.spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.3rem;
}

@keyframes spinner-border {
  to {
    transform: rotate(360deg);
  }
}

.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

@media (max-width: 768px) {
  .filters-card {
    position: static;
    margin-bottom: 2rem;
  }
  
  .products-header .d-flex {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>
