/**
 * Utilitaires pour créer des graphiques avec Canvas API
 * Remplace Chart.js pour les analytics
 */

/**
 * Classe pour créer des graphiques en barres
 */
export class BarChart {
  constructor(canvas, data, options = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.data = data
    this.options = {
      width: options.width || 400,
      height: options.height || 300,
      padding: options.padding || 40,
      barColor: options.barColor || '#3b82f6',
      textColor: options.textColor || '#374151',
      fontSize: options.fontSize || 12,
      ...options
    }
    
    this.setupCanvas()
  }
  
  setupCanvas() {
    this.canvas.width = this.options.width
    this.canvas.height = this.options.height
    this.ctx.font = `${this.options.fontSize}px Arial`
    this.ctx.fillStyle = this.options.textColor
  }
  
  draw() {
    this.clear()
    this.drawAxes()
    this.drawBars()
    this.drawLabels()
  }
  
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
  
  drawAxes() {
    const { padding } = this.options
    const chartWidth = this.canvas.width - 2 * padding
    const chartHeight = this.canvas.height - 2 * padding
    
    // Axe Y
    this.ctx.beginPath()
    this.ctx.moveTo(padding, padding)
    this.ctx.lineTo(padding, this.canvas.height - padding)
    this.ctx.stroke()
    
    // Axe X
    this.ctx.beginPath()
    this.ctx.moveTo(padding, this.canvas.height - padding)
    this.ctx.lineTo(this.canvas.width - padding, this.canvas.height - padding)
    this.ctx.stroke()
  }
  
  drawBars() {
    const { padding } = this.options
    const chartWidth = this.canvas.width - 2 * padding
    const chartHeight = this.canvas.height - 2 * padding
    const maxValue = Math.max(...this.data.map(d => d.value))
    const barWidth = chartWidth / this.data.length * 0.8
    const barSpacing = chartWidth / this.data.length * 0.2
    
    this.data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight
      const x = padding + index * (barWidth + barSpacing) + barSpacing / 2
      const y = this.canvas.height - padding - barHeight
      
      this.ctx.fillStyle = this.options.barColor
      this.ctx.fillRect(x, y, barWidth, barHeight)
      
      // Valeur au-dessus de la barre
      this.ctx.fillStyle = this.options.textColor
      this.ctx.textAlign = 'center'
      this.ctx.fillText(item.value.toString(), x + barWidth / 2, y - 5)
    })
  }
  
  drawLabels() {
    const { padding } = this.options
    const chartWidth = this.canvas.width - 2 * padding
    const barWidth = chartWidth / this.data.length * 0.8
    const barSpacing = chartWidth / this.data.length * 0.2
    
    this.ctx.textAlign = 'center'
    this.ctx.fillStyle = this.options.textColor
    
    this.data.forEach((item, index) => {
      const x = padding + index * (barWidth + barSpacing) + barWidth / 2
      const y = this.canvas.height - padding + 20
      
      this.ctx.fillText(item.label, x, y)
    })
  }
}

/**
 * Classe pour créer des graphiques en ligne
 */
export class LineChart {
  constructor(canvas, data, options = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.data = data
    this.options = {
      width: options.width || 400,
      height: options.height || 300,
      padding: options.padding || 40,
      lineColor: options.lineColor || '#3b82f6',
      pointColor: options.pointColor || '#1d4ed8',
      textColor: options.textColor || '#374151',
      fontSize: options.fontSize || 12,
      ...options
    }
    
    this.setupCanvas()
  }
  
  setupCanvas() {
    this.canvas.width = this.options.width
    this.canvas.height = this.options.height
    this.ctx.font = `${this.options.fontSize}px Arial`
    this.ctx.fillStyle = this.options.textColor
  }
  
  draw() {
    this.clear()
    this.drawAxes()
    this.drawLine()
    this.drawPoints()
    this.drawLabels()
  }
  
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
  
  drawAxes() {
    const { padding } = this.options
    const chartWidth = this.canvas.width - 2 * padding
    const chartHeight = this.canvas.height - 2 * padding
    
    // Axe Y
    this.ctx.beginPath()
    this.ctx.moveTo(padding, padding)
    this.ctx.lineTo(padding, this.canvas.height - padding)
    this.ctx.stroke()
    
    // Axe X
    this.ctx.beginPath()
    this.ctx.moveTo(padding, this.canvas.height - padding)
    this.ctx.lineTo(this.canvas.width - padding, this.canvas.height - padding)
    this.ctx.stroke()
  }
  
  drawLine() {
    const { padding } = this.options
    const chartWidth = this.canvas.width - 2 * padding
    const chartHeight = this.canvas.height - 2 * padding
    const maxValue = Math.max(...this.data.map(d => d.value))
    const minValue = Math.min(...this.data.map(d => d.value))
    const valueRange = maxValue - minValue || 1
    
    this.ctx.strokeStyle = this.options.lineColor
    this.ctx.lineWidth = 2
    this.ctx.beginPath()
    
    this.data.forEach((item, index) => {
      const x = padding + (index / (this.data.length - 1)) * chartWidth
      const y = this.canvas.height - padding - ((item.value - minValue) / valueRange) * chartHeight
      
      if (index === 0) {
        this.ctx.moveTo(x, y)
      } else {
        this.ctx.lineTo(x, y)
      }
    })
    
    this.ctx.stroke()
  }
  
  drawPoints() {
    const { padding } = this.options
    const chartWidth = this.canvas.width - 2 * padding
    const chartHeight = this.canvas.height - 2 * padding
    const maxValue = Math.max(...this.data.map(d => d.value))
    const minValue = Math.min(...this.data.map(d => d.value))
    const valueRange = maxValue - minValue || 1
    
    this.ctx.fillStyle = this.options.pointColor
    
    this.data.forEach((item, index) => {
      const x = padding + (index / (this.data.length - 1)) * chartWidth
      const y = this.canvas.height - padding - ((item.value - minValue) / valueRange) * chartHeight
      
      this.ctx.beginPath()
      this.ctx.arc(x, y, 4, 0, 2 * Math.PI)
      this.ctx.fill()
    })
  }
  
  drawLabels() {
    const { padding } = this.options
    const chartWidth = this.canvas.width - 2 * padding
    
    this.ctx.textAlign = 'center'
    this.ctx.fillStyle = this.options.textColor
    
    this.data.forEach((item, index) => {
      const x = padding + (index / (this.data.length - 1)) * chartWidth
      const y = this.canvas.height - padding + 20
      
      this.ctx.fillText(item.label, x, y)
    })
  }
}

/**
 * Classe pour créer des graphiques en secteurs (camembert)
 */
export class PieChart {
  constructor(canvas, data, options = {}) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.data = data
    this.options = {
      width: options.width || 400,
      height: options.height || 400,
      colors: options.colors || [
        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
        '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
      ],
      textColor: options.textColor || '#374151',
      fontSize: options.fontSize || 12,
      ...options
    }
    
    this.setupCanvas()
  }
  
  setupCanvas() {
    this.canvas.width = this.options.width
    this.canvas.height = this.options.height
    this.ctx.font = `${this.options.fontSize}px Arial`
    this.ctx.fillStyle = this.options.textColor
  }
  
  draw() {
    this.clear()
    this.drawPie()
    this.drawLegend()
  }
  
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
  
  drawPie() {
    const centerX = this.canvas.width / 2
    const centerY = this.canvas.height / 2 - 20
    const radius = Math.min(centerX, centerY) - 20
    
    const total = this.data.reduce((sum, item) => sum + item.value, 0)
    let currentAngle = -Math.PI / 2
    
    this.data.forEach((item, index) => {
      const sliceAngle = (item.value / total) * 2 * Math.PI
      
      // Dessiner le secteur
      this.ctx.beginPath()
      this.ctx.moveTo(centerX, centerY)
      this.ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle)
      this.ctx.closePath()
      this.ctx.fillStyle = this.options.colors[index % this.options.colors.length]
      this.ctx.fill()
      
      // Dessiner le pourcentage au centre du secteur
      const labelAngle = currentAngle + sliceAngle / 2
      const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7)
      const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7)
      
      this.ctx.fillStyle = '#ffffff'
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      this.ctx.fillText(`${Math.round((item.value / total) * 100)}%`, labelX, labelY)
      
      currentAngle += sliceAngle
    })
  }
  
  drawLegend() {
    const legendY = this.canvas.height - 20
    const legendItemWidth = this.canvas.width / this.data.length
    
    this.ctx.textAlign = 'center'
    this.ctx.fillStyle = this.options.textColor
    
    this.data.forEach((item, index) => {
      const x = index * legendItemWidth + legendItemWidth / 2
      
      // Carré de couleur
      this.ctx.fillStyle = this.options.colors[index % this.options.colors.length]
      this.ctx.fillRect(x - 20, legendY - 10, 10, 10)
      
      // Label
      this.ctx.fillStyle = this.options.textColor
      this.ctx.fillText(item.label, x, legendY)
    })
  }
}

/**
 * Fonction utilitaire pour créer un graphique de revenus
 * @param {HTMLCanvasElement} canvas - Canvas HTML
 * @param {Array} data - Données de revenus par période
 * @param {Object} options - Options du graphique
 */
export function createRevenueChart(canvas, data, options = {}) {
  const chart = new LineChart(canvas, data, {
    lineColor: '#10b981',
    pointColor: '#059669',
    ...options
  })
  chart.draw()
  return chart
}

/**
 * Fonction utilitaire pour créer un graphique de ventes par catégorie
 * @param {HTMLCanvasElement} canvas - Canvas HTML
 * @param {Array} data - Données de ventes par catégorie
 * @param {Object} options - Options du graphique
 */
export function createCategoryChart(canvas, data, options = {}) {
  const chart = new BarChart(canvas, data, {
    barColor: '#3b82f6',
    ...options
  })
  chart.draw()
  return chart
}

/**
 * Fonction utilitaire pour créer un graphique de répartition des ventes
 * @param {HTMLCanvasElement} canvas - Canvas HTML
 * @param {Array} data - Données de répartition
 * @param {Object} options - Options du graphique
 */
export function createSalesDistributionChart(canvas, data, options = {}) {
  const chart = new PieChart(canvas, data, options)
  chart.draw()
  return chart
}
