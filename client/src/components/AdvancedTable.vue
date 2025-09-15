<template>
  <div class="advanced-table">
    <!-- En-tête avec actions -->
    <div class="table-header">
      <div class="header-left">
        <h3 class="table-title">{{ title }}</h3>
        <p class="table-subtitle">{{ subtitle }}</p>
      </div>
      <div class="header-actions">
        <div class="search-container">
          <input
            v-model="globalSearch"
            type="text"
            class="search-input"
            placeholder="Rechercher..."
            @input="handleGlobalSearch"
          />
          <button class="search-button" @click="handleGlobalSearch">
            <span class="search-icon">🔍</span>
          </button>
        </div>
        <button 
          class="export-button"
          @click="handleExport"
          :disabled="selectedRows.length === 0"
        >
          <span class="export-icon">📊</span>
          Exporter CSV
        </button>
        <button 
          v-if="allowDelete"
          class="delete-button"
          @click="handleBulkDelete"
          :disabled="selectedRows.length === 0"
        >
          <span class="delete-icon">🗑️</span>
          Supprimer ({{ selectedRows.length }})
        </button>
      </div>
    </div>

    <!-- Tableau -->
    <div class="table-container">
      <table class="table">
        <!-- En-tête du tableau -->
        <thead class="table-header-row">
          <tr>
            <!-- Case à cocher pour sélection multiple -->
            <th v-if="allowSelection" class="checkbox-column">
              <input
                type="checkbox"
                :checked="isAllSelected"
                @change="handleSelectAll"
                class="select-all-checkbox"
              />
            </th>
            
            <!-- Colonnes -->
            <th 
              v-for="column in columns" 
              :key="column.key"
              class="table-header-cell"
              :class="{ 
                sortable: column.sortable,
                sorted: sortColumn === column.key,
                'sort-asc': sortColumn === column.key && sortOrder === 'asc',
                'sort-desc': sortColumn === column.key && sortOrder === 'desc'
              }"
              @click="column.sortable ? handleSort(column.key) : null"
            >
              <div class="header-content">
                <span class="header-text">{{ column.title }}</span>
                <div v-if="column.sortable" class="sort-indicators">
                  <span class="sort-arrow asc">↑</span>
                  <span class="sort-arrow desc">↓</span>
                </div>
              </div>
              
              <!-- Recherche dans la colonne -->
              <div v-if="column.searchable" class="column-search">
                <input
                  v-model="columnFilters[column.key]"
                  type="text"
                  class="column-search-input"
                  :placeholder="`Rechercher dans ${column.title.toLowerCase()}...`"
                  @input="handleColumnSearch(column.key)"
                />
              </div>
            </th>
            
            <!-- Colonne des actions -->
            <th v-if="actions.length > 0" class="actions-column">
              Actions
            </th>
          </tr>
        </thead>

        <!-- Corps du tableau -->
        <tbody class="table-body">
          <tr 
            v-for="(row, index) in paginatedData" 
            :key="getRowKey(row, index)"
            class="table-row"
            :class="{ 
              selected: selectedRows.includes(getRowKey(row, index)),
              'row-hover': true
            }"
          >
            <!-- Case à cocher pour sélection -->
            <td v-if="allowSelection" class="checkbox-cell">
              <input
                type="checkbox"
                :checked="selectedRows.includes(getRowKey(row, index))"
                @change="handleRowSelect(getRowKey(row, index))"
                class="row-checkbox"
              />
            </td>
            
            <!-- Cellules de données -->
            <td 
              v-for="column in columns" 
              :key="column.key"
              class="table-cell"
              :class="column.className"
            >
              <div class="cell-content">
                <!-- Rendu personnalisé -->
                <slot 
                  v-if="$slots[`cell-${column.key}`]"
                  :name="`cell-${column.key}`"
                  :row="row"
                  :value="getCellValue(row, column.key)"
                  :column="column"
                />
                <!-- Rendu par défaut -->
                <span v-else class="cell-text">
                  {{ formatCellValue(getCellValue(row, column.key), column) }}
                </span>
              </div>
            </td>
            
            <!-- Actions sur la ligne -->
            <td v-if="actions.length > 0" class="actions-cell">
              <div class="action-buttons">
                <button
                  v-for="action in actions"
                  :key="action.key"
                  class="action-button"
                  :class="action.className"
                  :disabled="action.disabled && action.disabled(row)"
                  @click="handleAction(action.key, row)"
                  :title="action.title"
                >
                  <span class="action-icon">{{ action.icon }}</span>
                  <span v-if="action.showLabel" class="action-label">{{ action.label }}</span>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Message si aucune donnée -->
    <div v-if="filteredData.length === 0" class="no-data">
      <div class="no-data-icon">📊</div>
      <h4 class="no-data-title">Aucune donnée trouvée</h4>
      <p class="no-data-text">
        {{ globalSearch || hasActiveFilters 
          ? 'Aucun résultat ne correspond à vos critères de recherche.' 
          : 'Aucune donnée disponible pour le moment.' 
        }}
      </p>
      <button v-if="globalSearch || hasActiveFilters" class="clear-filters-btn" @click="clearFilters">
        Effacer les filtres
      </button>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <div class="pagination-info">
        <span class="pagination-text">
          Affichage de {{ startItem }} à {{ endItem }} sur {{ filteredData.length }} éléments
        </span>
      </div>
      
      <div class="pagination-controls">
        <button 
          class="pagination-btn"
          :disabled="currentPage === 1"
          @click="goToPage(1)"
        >
          ⏮️
        </button>
        <button 
          class="pagination-btn"
          :disabled="currentPage === 1"
          @click="goToPage(currentPage - 1)"
        >
          ◀️
        </button>
        
        <div class="pagination-pages">
          <button
            v-for="page in visiblePages"
            :key="page"
            class="pagination-page"
            :class="{ 
              active: page === currentPage,
              ellipsis: page === '...'
            }"
            :disabled="page === '...'"
            @click="page !== '...' ? goToPage(page) : null"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          class="pagination-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(currentPage + 1)"
        >
          ▶️
        </button>
        <button 
          class="pagination-btn"
          :disabled="currentPage === totalPages"
          @click="goToPage(totalPages)"
        >
          ⏭️
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// Props
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  data: {
    type: Array,
    required: true
  },
  columns: {
    type: Array,
    required: true
  },
  actions: {
    type: Array,
    default: () => []
  },
  allowSelection: {
    type: Boolean,
    default: false
  },
  allowDelete: {
    type: Boolean,
    default: false
  },
  itemsPerPage: {
    type: Number,
    default: 10
  },
  rowKey: {
    type: String,
    default: 'id'
  }
})

// Emits
const emit = defineEmits([
  'action',
  'export',
  'delete',
  'bulk-delete',
  'sort',
  'search',
  'page-change'
])

// État local
const globalSearch = ref('')
const columnFilters = ref({})
const sortColumn = ref('')
const sortOrder = ref('asc')
const currentPage = ref(1)
const selectedRows = ref([])

// Computed
const filteredData = computed(() => {
  let filtered = [...props.data]

  // Recherche globale
  if (globalSearch.value) {
    const searchTerm = globalSearch.value.toLowerCase()
    filtered = filtered.filter(row => {
      return props.columns.some(column => {
        const value = getCellValue(row, column.key)
        return String(value).toLowerCase().includes(searchTerm)
      })
    })
  }

  // Filtres par colonne
  Object.entries(columnFilters.value).forEach(([columnKey, filterValue]) => {
    if (filterValue) {
      const searchTerm = filterValue.toLowerCase()
      filtered = filtered.filter(row => {
        const value = getCellValue(row, columnKey)
        return String(value).toLowerCase().includes(searchTerm)
      })
    }
  })

  // Tri
  if (sortColumn.value) {
    filtered.sort((a, b) => {
      const aValue = getCellValue(a, sortColumn.value)
      const bValue = getCellValue(b, sortColumn.value)
      
      let comparison = 0
      if (aValue < bValue) comparison = -1
      if (aValue > bValue) comparison = 1
      
      return sortOrder.value === 'desc' ? -comparison : comparison
    })
  }

  return filtered
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return filteredData.value.slice(start, end)
})

const totalPages = computed(() => 
  Math.ceil(filteredData.value.length / props.itemsPerPage)
)

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

const isAllSelected = computed(() => 
  paginatedData.value.length > 0 && 
  paginatedData.value.every(row => selectedRows.value.includes(getRowKey(row)))
)

const hasActiveFilters = computed(() => 
  globalSearch.value || Object.values(columnFilters.value).some(value => value)
)

const startItem = computed(() => 
  filteredData.value.length === 0 ? 0 : (currentPage.value - 1) * props.itemsPerPage + 1
)

const endItem = computed(() => 
  Math.min(currentPage.value * props.itemsPerPage, filteredData.value.length)
)

// Fonctions
const getRowKey = (row, index) => {
  return row[props.rowKey] || index
}

const getCellValue = (row, key) => {
  return key.split('.').reduce((obj, k) => obj?.[k], row)
}

const formatCellValue = (value, column) => {
  if (value === null || value === undefined) return '-'
  
  if (column.formatter) {
    return column.formatter(value)
  }
  
  if (column.type === 'date') {
    return new Date(value).toLocaleDateString('fr-FR')
  }
  
  if (column.type === 'currency') {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value)
  }
  
  if (column.type === 'boolean') {
    return value ? 'Oui' : 'Non'
  }
  
  return String(value)
}

const handleSort = (columnKey) => {
  if (sortColumn.value === columnKey) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = columnKey
    sortOrder.value = 'asc'
  }
  
  emit('sort', { column: columnKey, order: sortOrder.value })
}

const handleGlobalSearch = () => {
  currentPage.value = 1
  emit('search', { type: 'global', value: globalSearch.value })
}

const handleColumnSearch = (columnKey) => {
  currentPage.value = 1
  emit('search', { type: 'column', column: columnKey, value: columnFilters.value[columnKey] })
}

const handleSelectAll = () => {
  if (isAllSelected.value) {
    selectedRows.value = []
  } else {
    selectedRows.value = paginatedData.value.map(row => getRowKey(row))
  }
}

const handleRowSelect = (rowKey) => {
  const index = selectedRows.value.indexOf(rowKey)
  if (index > -1) {
    selectedRows.value.splice(index, 1)
  } else {
    selectedRows.value.push(rowKey)
  }
}

const handleAction = (actionKey, row) => {
  emit('action', { action: actionKey, row })
}

const handleExport = () => {
  const selectedData = selectedRows.value.length > 0 
    ? props.data.filter(row => selectedRows.value.includes(getRowKey(row)))
    : filteredData.value
    
  emit('export', selectedData)
}

const handleBulkDelete = () => {
  if (selectedRows.value.length === 0) return
  
  if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedRows.value.length} élément(s) ?`)) {
    emit('bulk-delete', selectedRows.value)
    selectedRows.value = []
  }
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    emit('page-change', page)
  }
}

const clearFilters = () => {
  globalSearch.value = ''
  columnFilters.value = {}
  currentPage.value = 1
}

// Watchers
watch(() => props.data, () => {
  currentPage.value = 1
  selectedRows.value = []
})

// Lifecycle
onMounted(() => {
  // Initialiser les filtres de colonnes
  props.columns.forEach(column => {
    if (column.searchable) {
      columnFilters.value[column.key] = ''
    }
  })
})
</script>

<style scoped>
/* Tableau avancé */
.advanced-table {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* En-tête du tableau */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  gap: 1rem;
}

.header-left {
  flex: 1;
}

.table-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.25rem 0;
}

.table-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-container {
  display: flex;
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #d1d5db;
}

.search-input {
  padding: 0.5rem 0.75rem;
  border: none;
  outline: none;
  font-size: 0.875rem;
  min-width: 200px;
}

.search-button {
  padding: 0.5rem 0.75rem;
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
  font-size: 0.875rem;
}

.export-button,
.delete-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.export-button:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.delete-button {
  border-color: #ef4444;
  color: #ef4444;
}

.delete-button:hover:not(:disabled) {
  background: #ef4444;
  color: white;
}

.export-button:disabled,
.delete-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Conteneur du tableau */
.table-container {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

/* En-tête du tableau */
.table-header-row {
  background: #f9fafb;
}

.table-header-cell {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
}

.table-header-cell.sortable {
  cursor: pointer;
  user-select: none;
}

.table-header-cell.sortable:hover {
  background: #f3f4f6;
}

.table-header-cell.sorted {
  background: #dbeafe;
  color: #1e40af;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.header-text {
  font-size: 0.875rem;
  font-weight: 600;
}

.sort-indicators {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.sort-arrow {
  font-size: 0.75rem;
  opacity: 0.5;
  transition: opacity 0.2s ease;
}

.table-header-cell.sort-asc .sort-arrow.asc,
.table-header-cell.sort-desc .sort-arrow.desc {
  opacity: 1;
  color: #1e40af;
}

.column-search {
  margin-top: 0.5rem;
}

.column-search-input {
  width: 100%;
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  outline: none;
}

.column-search-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

/* Colonnes spéciales */
.checkbox-column,
.actions-column {
  width: 1%;
  white-space: nowrap;
}

.checkbox-column {
  width: 3rem;
}

.actions-column {
  width: 8rem;
}

/* Corps du tableau */
.table-body {
  background: white;
}

.table-row {
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.2s ease;
}

.table-row:hover {
  background: #f9fafb;
}

.table-row.selected {
  background: #dbeafe;
}

.table-cell {
  padding: 1rem;
  font-size: 0.875rem;
  color: #374151;
  vertical-align: middle;
}

.cell-content {
  display: flex;
  align-items: center;
  min-height: 1.5rem;
}

.cell-text {
  word-break: break-word;
}

/* Cases à cocher */
.checkbox-cell {
  text-align: center;
}

.select-all-checkbox,
.row-checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: #3b82f6;
}

/* Actions */
.actions-cell {
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 0.25rem;
  justify-content: center;
  flex-wrap: wrap;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.2s ease;
}

.action-button:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-icon {
  font-size: 0.875rem;
}

.action-label {
  font-size: 0.75rem;
}

/* Aucune donnée */
.no-data {
  text-align: center;
  padding: 3rem 2rem;
  color: #6b7280;
}

.no-data-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.no-data-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.no-data-text {
  margin: 0 0 1.5rem 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.clear-filters-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s ease;
}

.clear-filters-btn:hover {
  background: #2563eb;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  gap: 1rem;
}

.pagination-info {
  flex: 1;
}

.pagination-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.pagination-btn {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  min-width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 0.25rem;
  margin: 0 0.5rem;
}

.pagination-page {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  background: white;
  color: #374151;
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
  min-width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-page:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-page.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.pagination-page.ellipsis {
  cursor: default;
  border: none;
  background: transparent;
}

.pagination-page.ellipsis:hover {
  background: transparent;
  border: none;
}

/* Responsive */
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .header-actions {
    justify-content: stretch;
  }
  
  .search-container {
    flex: 1;
  }
  
  .search-input {
    min-width: auto;
  }
  
  .pagination {
    flex-direction: column;
    gap: 1rem;
  }
  
  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-button {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .table-header {
    padding: 1rem;
  }
  
  .table-header-cell,
  .table-cell {
    padding: 0.75rem 0.5rem;
  }
  
  .pagination {
    padding: 1rem;
  }
  
  .pagination-btn,
  .pagination-page {
    min-width: 2rem;
    height: 2rem;
    font-size: 0.75rem;
  }
}
</style>
