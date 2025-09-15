/**
 * Utilitaires pour les graphiques Canvas
 * Remplacement de Chart.js avec l'API Canvas native
 */

/**
 * Classe de base pour les graphiques
 */
export class Chart {
  constructor(canvas, options = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.options = {
      responsive: true,
      maintainAspectRatio: false,
      ...options
    }
    this.data = null
    this.animationFrame = null
    
    // Détecter la densité de pixels
    this.pixelRatio = window.devicePixelRatio || 1
    this.resize()
    
    // Gestion du redimensionnement
    window.addEventListener('resize', () => this.resize())
  }

  /**
   * Redimensionner le canvas
   */
  resize() {
    const rect = this.canvas.getBoundingClientRect()
    this.canvas.width = rect.width * this.pixelRatio
    this.canvas.height = rect.height * this.pixelRatio
    this.ctx.scale(this.pixelRatio, this.pixelRatio)
    this.canvas.style.width = rect.width + 'px'
    this.canvas.style.height = rect.height + 'px'
  }

  /**
   * Effacer le canvas
   */
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /**
   * Dessiner le graphique
   */
  draw() {
    this.clear()
    // À implémenter dans les classes filles
  }

  /**
   * Mettre à jour les données
   */
  update(data) {
    this.data = data
    this.draw()
  }

  /**
   * Détruire le graphique
   */
  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
    }
    window.removeEventListener('resize', () => this.resize())
  }
}

/**
 * Graphique en barres
 */
export class BarChart extends Chart {
  constructor(canvas, options = {}) {
    super(canvas, options)
    this.defaultOptions = {
      backgroundColor: '#3b82f6',
      borderColor: '#1d4ed8',
      borderWidth: 1,
      borderRadius: 4,
      spacing: 0.1, // 10% d'espace entre les barres
      showValues: true,
      valueColor: '#374151',
      valueFont: '12px Inter, sans-serif',
      ...options
    }
  }

  draw() {
    if (!this.data || !this.data.labels || !this.data.datasets) return

    const { labels, datasets } = this.data
    const dataset = datasets[0] // Premier dataset pour simplifier
    
    if (!dataset || !dataset.data) return

    const rect = this.canvas.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Calculer les dimensions
    const barCount = labels.length
    const barWidth = chartWidth / barCount
    const spacing = barWidth * this.defaultOptions.spacing
    const actualBarWidth = barWidth - spacing

    // Trouver la valeur maximale
    const maxValue = Math.max(...dataset.data)

    // Dessiner les axes
    this.drawAxes(padding, chartWidth, chartHeight)

    // Dessiner les barres
    dataset.data.forEach((value, index) => {
      const barHeight = (value / maxValue) * chartHeight
      const x = padding + index * barWidth + spacing / 2
      const y = padding + chartHeight - barHeight

      // Dessiner la barre
      this.ctx.fillStyle = dataset.backgroundColor || this.defaultOptions.backgroundColor
      this.ctx.fillRect(x, y, actualBarWidth, barHeight)

      // Dessiner la bordure
      if (this.defaultOptions.borderWidth > 0) {
        this.ctx.strokeStyle = dataset.borderColor || this.defaultOptions.borderColor
        this.ctx.lineWidth = this.defaultOptions.borderWidth
        this.ctx.strokeRect(x, y, actualBarWidth, barHeight)
      }

      // Dessiner la valeur
      if (this.defaultOptions.showValues) {
        this.ctx.fillStyle = this.defaultOptions.valueColor
        this.ctx.font = this.defaultOptions.valueFont
        this.ctx.textAlign = 'center'
        this.ctx.fillText(
          value.toString(),
          x + actualBarWidth / 2,
          y - 5
        )
      }

      // Dessiner le label
      this.ctx.fillStyle = '#374151'
      this.ctx.font = '11px Inter, sans-serif'
      this.ctx.textAlign = 'center'
      this.ctx.fillText(
        labels[index],
        x + actualBarWidth / 2,
        height - 10
      )
    })
  }

  drawAxes(padding, chartWidth, chartHeight) {
    this.ctx.strokeStyle = '#e5e7eb'
    this.ctx.lineWidth = 1

    // Axe X
    this.ctx.beginPath()
    this.ctx.moveTo(padding, padding + chartHeight)
    this.ctx.lineTo(padding + chartWidth, padding + chartHeight)
    this.ctx.stroke()

    // Axe Y
    this.ctx.beginPath()
    this.ctx.moveTo(padding, padding)
    this.ctx.lineTo(padding, padding + chartHeight)
    this.ctx.stroke()
  }
}

/**
 * Graphique en ligne
 */
export class LineChart extends Chart {
  constructor(canvas, options = {}) {
    super(canvas, options)
    this.defaultOptions = {
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderColor: '#3b82f6',
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      fill: true,
      tension: 0.4,
      showGrid: true,
      gridColor: '#f3f4f6',
      ...options
    }
  }

  draw() {
    if (!this.data || !this.data.labels || !this.data.datasets) return

    const { labels, datasets } = this.data
    const dataset = datasets[0]
    
    if (!dataset || !dataset.data) return

    const rect = this.canvas.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Trouver les valeurs min et max
    const minValue = Math.min(...dataset.data)
    const maxValue = Math.max(...dataset.data)
    const valueRange = maxValue - minValue

    // Dessiner la grille
    if (this.defaultOptions.showGrid) {
      this.drawGrid(padding, chartWidth, chartHeight, minValue, maxValue)
    }

    // Dessiner la ligne
    this.ctx.beginPath()
    this.ctx.strokeStyle = dataset.borderColor || this.defaultOptions.borderColor
    this.ctx.lineWidth = dataset.borderWidth || this.defaultOptions.borderWidth
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'

    dataset.data.forEach((value, index) => {
      const x = padding + (index / (labels.length - 1)) * chartWidth
      const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight

      if (index === 0) {
        this.ctx.moveTo(x, y)
      } else {
        this.ctx.lineTo(x, y)
      }
    })

    this.ctx.stroke()

    // Dessiner les points
    dataset.data.forEach((value, index) => {
      const x = padding + (index / (labels.length - 1)) * chartWidth
      const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight

      this.ctx.beginPath()
      this.ctx.arc(x, y, dataset.pointRadius || this.defaultOptions.pointRadius, 0, 2 * Math.PI)
      this.ctx.fillStyle = dataset.pointBackgroundColor || this.defaultOptions.pointBackgroundColor
      this.ctx.fill()

      if (dataset.pointBorderWidth > 0) {
        this.ctx.strokeStyle = dataset.pointBorderColor || this.defaultOptions.pointBorderColor
        this.ctx.lineWidth = dataset.pointBorderWidth
        this.ctx.stroke()
      }
    })

    // Dessiner les labels
    labels.forEach((label, index) => {
      const x = padding + (index / (labels.length - 1)) * chartWidth
      this.ctx.fillStyle = '#374151'
      this.ctx.font = '11px Inter, sans-serif'
      this.ctx.textAlign = 'center'
      this.ctx.fillText(label, x, height - 10)
    })
  }

  drawGrid(padding, chartWidth, chartHeight, minValue, maxValue) {
    this.ctx.strokeStyle = this.defaultOptions.gridColor
    this.ctx.lineWidth = 1

    // Lignes horizontales
    const gridLines = 5
    for (let i = 0; i <= gridLines; i++) {
      const y = padding + (i / gridLines) * chartHeight
      this.ctx.beginPath()
      this.ctx.moveTo(padding, y)
      this.ctx.lineTo(padding + chartWidth, y)
      this.ctx.stroke()

      // Valeur de la grille
      const value = minValue + (maxValue - minValue) * (1 - i / gridLines)
      this.ctx.fillStyle = '#6b7280'
      this.ctx.font = '10px Inter, sans-serif'
      this.ctx.textAlign = 'right'
      this.ctx.fillText(value.toFixed(0), padding - 10, y + 3)
    }
  }
}

/**
 * Graphique en secteurs (camembert)
 */
export class PieChart extends Chart {
  constructor(canvas, options = {}) {
    super(canvas, options)
    this.defaultOptions = {
      colors: [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
        '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1'
      ],
      borderWidth: 2,
      borderColor: '#ffffff',
      showLabels: true,
      showValues: true,
      labelFont: '12px Inter, sans-serif',
      valueFont: '11px Inter, sans-serif',
      labelColor: '#374151',
      valueColor: '#6b7280',
      ...options
    }
  }

  draw() {
    if (!this.data || !this.data.labels || !this.data.datasets) return

    const { labels, datasets } = this.data
    const dataset = datasets[0]
    
    if (!dataset || !dataset.data) return

    const rect = this.canvas.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const radius = Math.min(centerX, centerY) - 40

    // Calculer le total
    const total = dataset.data.reduce((sum, value) => sum + value, 0)
    if (total === 0) return

    let currentAngle = -Math.PI / 2 // Commencer en haut

    // Dessiner les secteurs
    dataset.data.forEach((value, index) => {
      const sliceAngle = (value / total) * 2 * Math.PI
      const color = dataset.backgroundColor?.[index] || this.defaultOptions.colors[index % this.defaultOptions.colors.length]

      // Dessiner le secteur
      this.ctx.beginPath()
      this.ctx.moveTo(centerX, centerY)
      this.ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      this.ctx.closePath()
      this.ctx.fillStyle = color
      this.ctx.fill()

      // Dessiner la bordure
      if (this.defaultOptions.borderWidth > 0) {
        this.ctx.strokeStyle = this.defaultOptions.borderColor
        this.ctx.lineWidth = this.defaultOptions.borderWidth
        this.ctx.stroke()
      }

      // Dessiner le label et la valeur
      if (this.defaultOptions.showLabels || this.defaultOptions.showValues) {
        const labelAngle = currentAngle + sliceAngle / 2
        const labelX = centerX + Math.cos(labelAngle) * (radius + 20)
        const labelY = centerY + Math.sin(labelAngle) * (radius + 20)

        this.ctx.fillStyle = this.defaultOptions.labelColor
        this.ctx.font = this.defaultOptions.labelFont
        this.ctx.textAlign = 'center'
        this.ctx.fillText(labels[index], labelX, labelY)

        if (this.defaultOptions.showValues) {
          const percentage = ((value / total) * 100).toFixed(1)
          this.ctx.fillStyle = this.defaultOptions.valueColor
          this.ctx.font = this.defaultOptions.valueFont
          this.ctx.fillText(`${percentage}%`, labelX, labelY + 15)
        }
      }

      currentAngle += sliceAngle
    })
  }
}

/**
 * Graphique en aires
 */
export class AreaChart extends Chart {
  constructor(canvas, options = {}) {
    super(canvas, options)
    this.defaultOptions = {
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: '#3b82f6',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      showGrid: true,
      gridColor: '#f3f4f6',
      ...options
    }
  }

  draw() {
    if (!this.data || !this.data.labels || !this.data.datasets) return

    const { labels, datasets } = this.data
    const dataset = datasets[0]
    
    if (!dataset || !dataset.data) return

    const rect = this.canvas.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    // Trouver les valeurs min et max
    const minValue = Math.min(...dataset.data)
    const maxValue = Math.max(...dataset.data)
    const valueRange = maxValue - minValue

    // Dessiner la grille
    if (this.defaultOptions.showGrid) {
      this.drawGrid(padding, chartWidth, chartHeight, minValue, maxValue)
    }

    // Dessiner l'aire
    this.ctx.beginPath()
    
    dataset.data.forEach((value, index) => {
      const x = padding + (index / (labels.length - 1)) * chartWidth
      const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight

      if (index === 0) {
        this.ctx.moveTo(x, padding + chartHeight) // Commencer en bas
        this.ctx.lineTo(x, y)
      } else {
        this.ctx.lineTo(x, y)
      }
    })

    // Fermer l'aire
    this.ctx.lineTo(padding + chartWidth, padding + chartHeight)
    this.ctx.closePath()

    // Remplir l'aire
    if (this.defaultOptions.fill) {
      this.ctx.fillStyle = dataset.backgroundColor || this.defaultOptions.backgroundColor
      this.ctx.fill()
    }

    // Dessiner la bordure
    this.ctx.strokeStyle = dataset.borderColor || this.defaultOptions.borderColor
    this.ctx.lineWidth = dataset.borderWidth || this.defaultOptions.borderWidth
    this.ctx.stroke()
  }

  drawGrid(padding, chartWidth, chartHeight, minValue, maxValue) {
    this.ctx.strokeStyle = this.defaultOptions.gridColor
    this.ctx.lineWidth = 1

    // Lignes horizontales
    const gridLines = 5
    for (let i = 0; i <= gridLines; i++) {
      const y = padding + (i / gridLines) * chartHeight
      this.ctx.beginPath()
      this.ctx.moveTo(padding, y)
      this.ctx.lineTo(padding + chartWidth, y)
      this.ctx.stroke()
    }
  }
}

/**
 * Fonction utilitaire pour créer un graphique
 * @param {HTMLCanvasElement} canvas - Élément canvas
 * @param {string} type - Type de graphique
 * @param {Object} data - Données du graphique
 * @param {Object} options - Options du graphique
 * @returns {Chart} Instance du graphique
 */
export const createChart = (canvas, type, data, options = {}) => {
  let chart

  switch (type) {
    case 'bar':
      chart = new BarChart(canvas, options)
      break
    case 'line':
      chart = new LineChart(canvas, options)
      break
    case 'pie':
      chart = new PieChart(canvas, options)
      break
    case 'area':
      chart = new AreaChart(canvas, options)
      break
    default:
      throw new Error(`Type de graphique non supporté: ${type}`)
  }

  chart.update(data)
  return chart
}

/**
 * Fonction utilitaire pour formater les données pour les graphiques
 * @param {Array} data - Données brutes
 * @param {Object} config - Configuration de formatage
 * @returns {Object} Données formatées
 */
export const formatChartData = (data, config = {}) => {
  const {
    labels = 'labels',
    values = 'values',
    labelKey = 'label',
    valueKey = 'value'
  } = config

  if (Array.isArray(data)) {
    return {
      labels: data.map(item => item[labelKey]),
      datasets: [{
        data: data.map(item => item[valueKey]),
        backgroundColor: data.map((_, index) => 
          config.colors?.[index] || `hsl(${index * 360 / data.length}, 70%, 50%)`
        )
      }]
    }
  }

  return data
}

export default {
  Chart,
  BarChart,
  LineChart,
  PieChart,
  AreaChart,
  createChart,
  formatChartData
}