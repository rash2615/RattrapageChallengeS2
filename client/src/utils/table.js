/**
 * Utilitaires pour créer des tableaux avancés sans librairies externes
 * Remplace les librairies de tableaux pour le tri, recherche, pagination, export CSV
 */

/**
 * Classe pour gérer les tableaux avancés
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
    this.currentPage = 1
    this.sortColumn = null
    this.sortDirection = 'asc'
    this.searchTerm = ''
    this.selectedItems = new Set()
    
    this.init()
  }
  
  init() {
    this.createTableHeader()
    this.createTableBody()
    this.createTableFooter()
    this.bindEvents()
  }
  
  createTableHeader() {
    const thead = this.table.querySelector('thead')
    if (!thead) return
    
    // Ajouter des classes CSS pour le style
    thead.style.cssText = `
      background-color: #f8f9fa;
      border-bottom: 2px solid #dee2e6;
    `
    
    const rows = thead.querySelectorAll('tr')
    rows.forEach(row => {
      const cells = row.querySelectorAll('th')
      cells.forEach((cell, index) => {
        if (this.options.sortable) {
          cell.style.cursor = 'pointer'
          cell.style.userSelect = 'none'
          cell.innerHTML += ' <span class="sort-indicator">↕</span>'
        }
      })
    })
  }
  
  createTableBody() {
    const tbody = this.table.querySelector('tbody')
    if (!tbody) return
    
    tbody.style.cssText = `
      background-color: white;
    `
  }
  
  createTableFooter() {
    if (!this.options.pagination && !this.options.exportable) return
    
    const tfoot = document.createElement('tfoot')
    tfoot.style.cssText = `
      background-color: #f8f9fa;
      border-top: 2px solid #dee2e6;
    `
    
    const row = document.createElement('tr')
    const cell = document.createElement('td')
    cell.colSpan = this.getColumnCount()
    cell.style.cssText = `
      padding: 16px;
      text-align: center;
    `
    
    // Contrôles de pagination
    if (this.options.pagination) {
      const paginationDiv = document.createElement('div')
      paginationDiv.className = 'table-pagination'
      paginationDiv.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
      `
      
      paginationDiv.innerHTML = `
        <button class="pagination-btn" data-action="first" disabled>«</button>
        <button class="pagination-btn" data-action="prev" disabled>‹</button>
        <span class="pagination-info">Page 1 sur 1</span>
        <button class="pagination-btn" data-action="next" disabled>›</button>
        <button class="pagination-btn" data-action="last" disabled>»</button>
      `
      
      cell.appendChild(paginationDiv)
    }
    
    // Contrôles d'export et sélection
    const controlsDiv = document.createElement('div')
    controlsDiv.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    `
    
    // Informations de sélection
    if (this.options.selectable) {
      const selectionInfo = document.createElement('div')
      selectionInfo.className = 'selection-info'
      selectionInfo.style.cssText = `
        color: #6b7280;
        font-size: 14px;
      `
      selectionInfo.textContent = '0 élément(s) sélectionné(s)'
      controlsDiv.appendChild(selectionInfo)
    }
    
    // Boutons d'action
    const actionsDiv = document.createElement('div')
    actionsDiv.style.cssText = `
      display: flex;
      gap: 8px;
    `
    
    if (this.options.exportable) {
      const exportBtn = document.createElement('button')
      exportBtn.className = 'btn btn-outline-primary'
      exportBtn.textContent = 'Exporter CSV'
      exportBtn.style.cssText = `
        background-color: transparent;
        border: 1px solid #3b82f6;
        color: #3b82f6;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      `
      exportBtn.addEventListener('click', () => this.exportToCSV())
      actionsDiv.appendChild(exportBtn)
    }
    
    if (this.options.selectable) {
      const deleteSelectedBtn = document.createElement('button')
      deleteSelectedBtn.className = 'btn btn-outline-danger'
      deleteSelectedBtn.textContent = 'Supprimer sélection'
      deleteSelectedBtn.style.cssText = `
        background-color: transparent;
        border: 1px solid #ef4444;
        color: #ef4444;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        opacity: 0.5;
        pointer-events: none;
      `
      deleteSelectedBtn.addEventListener('click', () => this.deleteSelected())
      actionsDiv.appendChild(deleteSelectedBtn)
    }
    
    controlsDiv.appendChild(actionsDiv)
    cell.appendChild(controlsDiv)
    row.appendChild(cell)
    tfoot.appendChild(row)
    this.table.appendChild(tfoot)
  }
  
  bindEvents() {
    // Tri des colonnes
    if (this.options.sortable) {
      const headers = this.table.querySelectorAll('thead th')
      headers.forEach((header, index) => {
        header.addEventListener('click', () => this.sortByColumn(index))
      })
    }
    
    // Pagination
    if (this.options.pagination) {
      const paginationBtns = this.table.querySelectorAll('.pagination-btn')
      paginationBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          const action = e.target.dataset.action
          this.handlePagination(action)
        })
      })
    }
    
    // Sélection
    if (this.options.selectable) {
      this.table.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox' && e.target.classList.contains('row-select')) {
          this.handleRowSelection(e.target)
        }
      })
    }
  }
  
  setData(data) {
    this.data = data
    this.filteredData = [...data]
    this.currentPage = 1
    this.render()
  }
  
  search(term) {
    this.searchTerm = term.toLowerCase()
    this.filteredData = this.data.filter(item => {
      return Object.values(item).some(value => 
        String(value).toLowerCase().includes(this.searchTerm)
      )
    })
    this.currentPage = 1
    this.render()
  }
  
  sortByColumn(columnIndex) {
    if (!this.options.sortable) return
    
    if (this.sortColumn === columnIndex) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
    } else {
      this.sortColumn = columnIndex
      this.sortDirection = 'asc'
    }
    
    this.filteredData.sort((a, b) => {
      const aValue = this.getCellValue(a, columnIndex)
      const bValue = this.getCellValue(b, columnIndex)
      
      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1
      return 0
    })
    
    this.updateSortIndicators()
    this.render()
  }
  
  getCellValue(item, columnIndex) {
    const keys = Object.keys(item)
    const value = item[keys[columnIndex]]
    return isNaN(value) ? String(value).toLowerCase() : Number(value)
  }
  
  updateSortIndicators() {
    const headers = this.table.querySelectorAll('thead th')
    headers.forEach((header, index) => {
      const indicator = header.querySelector('.sort-indicator')
      if (indicator) {
        if (index === this.sortColumn) {
          indicator.textContent = this.sortDirection === 'asc' ? '↑' : '↓'
        } else {
          indicator.textContent = '↕'
        }
      }
    })
  }
  
  handlePagination(action) {
    const totalPages = Math.ceil(this.filteredData.length / this.options.itemsPerPage)
    
    switch (action) {
      case 'first':
        this.currentPage = 1
        break
      case 'prev':
        if (this.currentPage > 1) this.currentPage--
        break
      case 'next':
        if (this.currentPage < totalPages) this.currentPage++
        break
      case 'last':
        this.currentPage = totalPages
        break
    }
    
    this.render()
  }
  
  handleRowSelection(checkbox) {
    const row = checkbox.closest('tr')
    const rowId = row.dataset.id
    
    if (checkbox.checked) {
      this.selectedItems.add(rowId)
    } else {
      this.selectedItems.delete(rowId)
    }
    
    this.updateSelectionInfo()
    this.updateDeleteButton()
  }
  
  updateSelectionInfo() {
    const selectionInfo = this.table.querySelector('.selection-info')
    if (selectionInfo) {
      selectionInfo.textContent = `${this.selectedItems.size} élément(s) sélectionné(s)`
    }
  }
  
  updateDeleteButton() {
    const deleteBtn = this.table.querySelector('.btn-outline-danger')
    if (deleteBtn) {
      if (this.selectedItems.size > 0) {
        deleteBtn.style.opacity = '1'
        deleteBtn.style.pointerEvents = 'auto'
      } else {
        deleteBtn.style.opacity = '0.5'
        deleteBtn.style.pointerEvents = 'none'
      }
    }
  }
  
  deleteSelected() {
    if (this.selectedItems.size === 0) return
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${this.selectedItems.size} élément(s) ?`)) {
      this.data = this.data.filter(item => !this.selectedItems.has(item.id))
      this.filteredData = this.filteredData.filter(item => !this.selectedItems.has(item.id))
      this.selectedItems.clear()
      this.render()
    }
  }
  
  exportToCSV() {
    const csvContent = this.generateCSV()
    this.downloadCSV(csvContent, 'export.csv')
  }
  
  generateCSV() {
    if (this.filteredData.length === 0) return ''
    
    const headers = Object.keys(this.filteredData[0])
    const csvRows = []
    
    // En-têtes
    csvRows.push(headers.join(','))
    
    // Données
    this.filteredData.forEach(row => {
      const values = headers.map(header => {
        const value = row[header]
        // Échapper les virgules et guillemets
        return `"${String(value).replace(/"/g, '""')}"`
      })
      csvRows.push(values.join(','))
    })
    
    return csvRows.join('\n')
  }
  
  downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  render() {
    const tbody = this.table.querySelector('tbody')
    if (!tbody) return
    
    tbody.innerHTML = ''
    
    const startIndex = (this.currentPage - 1) * this.options.itemsPerPage
    const endIndex = startIndex + this.options.itemsPerPage
    const pageData = this.filteredData.slice(startIndex, endIndex)
    
    pageData.forEach((item, index) => {
      const row = document.createElement('tr')
      row.dataset.id = item.id || index
      row.style.cssText = `
        border-bottom: 1px solid #dee2e6;
      `
      
      // Checkbox de sélection
      if (this.options.selectable) {
        const cell = document.createElement('td')
        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.className = 'row-select'
        checkbox.checked = this.selectedItems.has(item.id || index)
        cell.appendChild(checkbox)
        row.appendChild(cell)
      }
      
      // Données
      Object.values(item).forEach(value => {
        const cell = document.createElement('td')
        cell.textContent = value
        cell.style.cssText = `
          padding: 12px;
          vertical-align: middle;
        `
        row.appendChild(cell)
      })
      
      tbody.appendChild(row)
    })
    
    this.updatePagination()
    this.updateSelectionInfo()
    this.updateDeleteButton()
  }
  
  updatePagination() {
    if (!this.options.pagination) return
    
    const totalPages = Math.ceil(this.filteredData.length / this.options.itemsPerPage)
    const paginationInfo = this.table.querySelector('.pagination-info')
    const paginationBtns = this.table.querySelectorAll('.pagination-btn')
    
    if (paginationInfo) {
      paginationInfo.textContent = `Page ${this.currentPage} sur ${totalPages}`
    }
    
    paginationBtns.forEach(btn => {
      const action = btn.dataset.action
      let disabled = false
      
      switch (action) {
        case 'first':
        case 'prev':
          disabled = this.currentPage === 1
          break
        case 'next':
        case 'last':
          disabled = this.currentPage === totalPages
          break
      }
      
      btn.disabled = disabled
      btn.style.opacity = disabled ? '0.5' : '1'
      btn.style.pointerEvents = disabled ? 'none' : 'auto'
    })
  }
  
  getColumnCount() {
    const thead = this.table.querySelector('thead')
    if (!thead) return 0
    
    const firstRow = thead.querySelector('tr')
    if (!firstRow) return 0
    
    return firstRow.querySelectorAll('th').length
  }
}

/**
 * Fonction utilitaire pour créer un tableau simple
 * @param {HTMLElement} container - Conteneur du tableau
 * @param {Array} data - Données du tableau
 * @param {Object} options - Options du tableau
 */
export function createTable(container, data, options = {}) {
  const table = document.createElement('table')
  table.className = 'data-table'
  table.style.cssText = `
    width: 100%;
    border-collapse: collapse;
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  `
  
  // Créer l'en-tête
  const thead = document.createElement('thead')
  const headerRow = document.createElement('tr')
  
  if (data.length > 0) {
    Object.keys(data[0]).forEach(key => {
      const th = document.createElement('th')
      th.textContent = key.charAt(0).toUpperCase() + key.slice(1)
      th.style.cssText = `
        padding: 12px;
        text-align: left;
        font-weight: 600;
        color: #374151;
        border-bottom: 2px solid #e5e7eb;
      `
      headerRow.appendChild(th)
    })
  }
  
  thead.appendChild(headerRow)
  table.appendChild(thead)
  
  // Créer le corps
  const tbody = document.createElement('tbody')
  table.appendChild(tbody)
  
  container.appendChild(table)
  
  // Initialiser le gestionnaire de tableau
  const manager = new TableManager(table, options)
  manager.setData(data)
  
  return manager
}
