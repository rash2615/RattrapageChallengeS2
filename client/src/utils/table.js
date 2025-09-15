/**
 * Utilitaires pour les tableaux
 * Fonctionnalités avancées sans librairies externes
 */

/**
 * Classe de gestion des tableaux
 */
export class TableManager {
  constructor(tableElement, options = {}) {
    this.table = tableElement
    this.options = {
      sortable: true,
      searchable: true,
      pagination: true,
      exportable: true,
      selectable: true,
      itemsPerPage: 10,
      ...options
    }
    
    this.data = []
    this.filteredData = []
    this.sortedData = []
    this.currentPage = 1
    this.sortColumn = null
    this.sortDirection = 'asc'
    this.searchQuery = ''
    this.selectedItems = new Set()
    
    this.init()
  }

  /**
   * Initialiser le tableau
   */
  init() {
    this.createTableStructure()
    this.bindEvents()
    this.render()
  }

  /**
   * Créer la structure du tableau
   */
  createTableStructure() {
    // Créer le conteneur
    const container = document.createElement('div')
    container.className = 'table-container'
    
    // Créer la barre d'outils
    if (this.options.searchable || this.options.exportable) {
      const toolbar = this.createToolbar()
      container.appendChild(toolbar)
    }
    
    // Créer le tableau
    const tableWrapper = document.createElement('div')
    tableWrapper.className = 'table-wrapper'
    
    this.table.className = 'table'
    tableWrapper.appendChild(this.table)
    container.appendChild(tableWrapper)
    
    // Créer la pagination
    if (this.options.pagination) {
      const pagination = this.createPagination()
      container.appendChild(pagination)
    }
    
    // Remplacer le tableau original
    this.table.parentNode.replaceChild(container, this.table)
    this.container = container
  }

  /**
   * Créer la barre d'outils
   */
  createToolbar() {
    const toolbar = document.createElement('div')
    toolbar.className = 'table-toolbar'
    
    if (this.options.searchable) {
      const searchContainer = document.createElement('div')
      searchContainer.className = 'table-search'
      
      const searchInput = document.createElement('input')
      searchInput.type = 'text'
      searchInput.className = 'form-input'
      searchInput.placeholder = 'Rechercher...'
      searchInput.addEventListener('input', (e) => {
        this.setSearchQuery(e.target.value)
      })
      
      searchContainer.appendChild(searchInput)
      toolbar.appendChild(searchContainer)
    }
    
    if (this.options.exportable) {
      const exportContainer = document.createElement('div')
      exportContainer.className = 'table-export'
      
      const exportButton = document.createElement('button')
      exportButton.className = 'btn btn-outline btn-sm'
      exportButton.textContent = 'Exporter CSV'
      exportButton.addEventListener('click', () => {
        this.exportToCSV()
      })
      
      exportContainer.appendChild(exportButton)
      toolbar.appendChild(exportContainer)
    }
    
    return toolbar
  }

  /**
   * Créer la pagination
   */
  createPagination() {
    const pagination = document.createElement('div')
    pagination.className = 'table-pagination'
    
    const info = document.createElement('div')
    info.className = 'pagination-info'
    
    const controls = document.createElement('div')
    controls.className = 'pagination-controls'
    
    const prevButton = document.createElement('button')
    prevButton.className = 'btn btn-sm btn-outline'
    prevButton.textContent = 'Précédent'
    prevButton.addEventListener('click', () => {
      this.previousPage()
    })
    
    const nextButton = document.createElement('button')
    nextButton.className = 'btn btn-sm btn-outline'
    nextButton.textContent = 'Suivant'
    nextButton.addEventListener('click', () => {
      this.nextPage()
    })
    
    controls.appendChild(prevButton)
    controls.appendChild(nextButton)
    
    pagination.appendChild(info)
    pagination.appendChild(controls)
    
    this.pagination = pagination
    this.paginationInfo = info
    this.prevButton = prevButton
    this.nextButton = nextButton
    
    return pagination
  }

  /**
   * Lier les événements
   */
  bindEvents() {
    // Tri des colonnes
    if (this.options.sortable) {
      this.table.addEventListener('click', (e) => {
        const th = e.target.closest('th[data-sortable]')
        if (th) {
          const column = th.dataset.sortable
          this.sort(column)
        }
      })
    }
    
    // Sélection multiple
    if (this.options.selectable) {
      this.table.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox') {
          if (e.target.classList.contains('select-all')) {
            this.toggleSelectAll(e.target.checked)
          } else {
            this.toggleSelectItem(e.target.dataset.itemId, e.target.checked)
          }
        }
      })
    }
  }

  /**
   * Définir les données
   * @param {Array} data - Données du tableau
   * @param {Array} columns - Configuration des colonnes
   */
  setData(data, columns) {
    this.data = data
    this.columns = columns
    this.filteredData = [...data]
    this.sortedData = [...data]
    this.currentPage = 1
    this.render()
  }

  /**
   * Rendre le tableau
   */
  render() {
    // Créer l'en-tête
    this.renderHeader()
    
    // Créer le corps
    this.renderBody()
    
    // Mettre à jour la pagination
    if (this.options.pagination) {
      this.updatePagination()
    }
  }

  /**
   * Rendre l'en-tête
   */
  renderHeader() {
    const thead = this.table.querySelector('thead') || document.createElement('thead')
    thead.innerHTML = ''
    
    const row = document.createElement('tr')
    
    // Checkbox de sélection multiple
    if (this.options.selectable) {
      const th = document.createElement('th')
      th.className = 'select-column'
      th.innerHTML = '<input type="checkbox" class="select-all">'
      row.appendChild(th)
    }
    
    // Colonnes
    this.columns.forEach(column => {
      const th = document.createElement('th')
      th.textContent = column.label
      
      if (this.options.sortable && column.sortable !== false) {
        th.className = 'sortable'
        th.dataset.sortable = column.key
        th.innerHTML = `
          ${column.label}
          <span class="sort-indicator">
            ${this.sortColumn === column.key ? (this.sortDirection === 'asc' ? '↑' : '↓') : '↕'}
          </span>
        `
      }
      
      row.appendChild(th)
    })
    
    thead.appendChild(row)
    this.table.appendChild(thead)
  }

  /**
   * Rendre le corps
   */
  renderBody() {
    const tbody = this.table.querySelector('tbody') || document.createElement('tbody')
    tbody.innerHTML = ''
    
    const startIndex = (this.currentPage - 1) * this.options.itemsPerPage
    const endIndex = startIndex + this.options.itemsPerPage
    const pageData = this.sortedData.slice(startIndex, endIndex)
    
    pageData.forEach((item, index) => {
      const row = document.createElement('tr')
      row.dataset.itemId = item.id || index
      
      // Checkbox de sélection
      if (this.options.selectable) {
        const td = document.createElement('td')
        td.className = 'select-column'
        td.innerHTML = `
          <input type="checkbox" class="select-item" data-item-id="${item.id || index}">
        `
        row.appendChild(td)
      }
      
      // Cellules de données
      this.columns.forEach(column => {
        const td = document.createElement('td')
        td.textContent = this.getCellValue(item, column)
        row.appendChild(td)
      })
      
      tbody.appendChild(row)
    })
    
    this.table.appendChild(tbody)
  }

  /**
   * Obtenir la valeur d'une cellule
   * @param {Object} item - Élément de données
   * @param {Object} column - Configuration de la colonne
   * @returns {string} Valeur formatée
   */
  getCellValue(item, column) {
    let value = item[column.key]
    
    if (column.formatter) {
      value = column.formatter(value, item)
    }
    
    return value || ''
  }

  /**
   * Trier le tableau
   * @param {string} column - Colonne à trier
   */
  sort(column) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
    } else {
      this.sortColumn = column
      this.sortDirection = 'asc'
    }
    
    this.sortedData.sort((a, b) => {
      const aVal = a[column]
      const bVal = b[column]
      
      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1
      return 0
    })
    
    this.render()
  }

  /**
   * Définir la requête de recherche
   * @param {string} query - Requête de recherche
   */
  setSearchQuery(query) {
    this.searchQuery = query.toLowerCase()
    this.filteredData = this.data.filter(item => {
      return this.columns.some(column => {
        const value = this.getCellValue(item, column).toString().toLowerCase()
        return value.includes(this.searchQuery)
      })
    })
    
    this.sortedData = [...this.filteredData]
    this.currentPage = 1
    this.render()
  }

  /**
   * Page précédente
   */
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--
      this.render()
    }
  }

  /**
   * Page suivante
   */
  nextPage() {
    const totalPages = Math.ceil(this.sortedData.length / this.options.itemsPerPage)
    if (this.currentPage < totalPages) {
      this.currentPage++
      this.render()
    }
  }

  /**
   * Mettre à jour la pagination
   */
  updatePagination() {
    const totalItems = this.sortedData.length
    const totalPages = Math.ceil(totalItems / this.options.itemsPerPage)
    const startItem = (this.currentPage - 1) * this.options.itemsPerPage + 1
    const endItem = Math.min(this.currentPage * this.options.itemsPerPage, totalItems)
    
    this.paginationInfo.textContent = `${startItem}-${endItem} sur ${totalItems} éléments`
    
    this.prevButton.disabled = this.currentPage === 1
    this.nextButton.disabled = this.currentPage === totalPages
  }

  /**
   * Basculer la sélection de tous les éléments
   * @param {boolean} selected - Sélectionner ou désélectionner
   */
  toggleSelectAll(selected) {
    this.selectedItems.clear()
    
    if (selected) {
      const startIndex = (this.currentPage - 1) * this.options.itemsPerPage
      const endIndex = startIndex + this.options.itemsPerPage
      const pageData = this.sortedData.slice(startIndex, endIndex)
      
      pageData.forEach(item => {
        this.selectedItems.add(item.id || item)
      })
    }
    
    this.updateSelectAllCheckbox()
    this.render()
  }

  /**
   * Basculer la sélection d'un élément
   * @param {string} itemId - ID de l'élément
   * @param {boolean} selected - Sélectionner ou désélectionner
   */
  toggleSelectItem(itemId, selected) {
    if (selected) {
      this.selectedItems.add(itemId)
    } else {
      this.selectedItems.delete(itemId)
    }
    
    this.updateSelectAllCheckbox()
  }

  /**
   * Mettre à jour la checkbox "Tout sélectionner"
   */
  updateSelectAllCheckbox() {
    const selectAllCheckbox = this.table.querySelector('.select-all')
    if (selectAllCheckbox) {
      const startIndex = (this.currentPage - 1) * this.options.itemsPerPage
      const endIndex = startIndex + this.options.itemsPerPage
      const pageData = this.sortedData.slice(startIndex, endIndex)
      
      const allSelected = pageData.every(item => 
        this.selectedItems.has(item.id || item)
      )
      
      selectAllCheckbox.checked = allSelected
    }
  }

  /**
   * Obtenir les éléments sélectionnés
   * @returns {Array} Éléments sélectionnés
   */
  getSelectedItems() {
    return Array.from(this.selectedItems)
  }

  /**
   * Exporter en CSV
   */
  exportToCSV() {
    const csvData = this.sortedData.map(item => {
      return this.columns.map(column => {
        const value = this.getCellValue(item, column)
        return `"${value.toString().replace(/"/g, '""')}"`
      }).join(',')
    })
    
    const csvContent = [
      this.columns.map(col => `"${col.label}"`).join(','),
      ...csvData
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `export-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  /**
   * Détruire le tableau
   */
  destroy() {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.replaceChild(this.table, this.container)
    }
  }
}

/**
 * Créer un tableau avancé
 * @param {HTMLTableElement} tableElement - Élément table
 * @param {Object} options - Options du tableau
 * @returns {TableManager} Gestionnaire du tableau
 */
export const createTable = (tableElement, options = {}) => {
  return new TableManager(tableElement, options)
}

/**
 * Formateurs de cellules prédéfinis
 */
export const formatters = {
  // Formatage de prix
  price: (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value || 0)
  },
  
  // Formatage de date
  date: (value) => {
    if (!value) return ''
    return new Date(value).toLocaleDateString('fr-FR')
  },
  
  // Formatage de date et heure
  datetime: (value) => {
    if (!value) return ''
    return new Date(value).toLocaleString('fr-FR')
  },
  
  // Formatage de pourcentage
  percentage: (value) => {
    return `${(value || 0).toFixed(1)}%`
  },
  
  // Formatage de nombre
  number: (value) => {
    return new Intl.NumberFormat('fr-FR').format(value || 0)
  },
  
  // Formatage de statut avec couleur
  status: (value, item) => {
    const statusMap = {
      active: { text: 'Actif', class: 'status-active' },
      inactive: { text: 'Inactif', class: 'status-inactive' },
      pending: { text: 'En attente', class: 'status-pending' },
      completed: { text: 'Terminé', class: 'status-completed' },
      cancelled: { text: 'Annulé', class: 'status-cancelled' }
    }
    
    const status = statusMap[value] || { text: value, class: 'status-default' }
    return `<span class="status ${status.class}">${status.text}</span>`
  },
  
  // Formatage de booléen
  boolean: (value) => {
    return value ? 'Oui' : 'Non'
  },
  
  // Formatage de texte tronqué
  truncate: (maxLength = 50) => (value) => {
    if (!value) return ''
    return value.length > maxLength 
      ? value.substring(0, maxLength) + '...'
      : value
  }
}

export default {
  TableManager,
  createTable,
  formatters
}