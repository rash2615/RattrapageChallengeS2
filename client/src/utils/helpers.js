/**
 * Fonctions utilitaires pour SPARK
 * Fonctions d'aide communes à l'application
 */

/**
 * Debounce une fonction
 * @param {Function} func - Fonction à debouncer
 * @param {number} wait - Délai d'attente en ms
 * @param {boolean} immediate - Exécuter immédiatement
 * @returns {Function} Fonction debouncée
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func(...args)
  }
}

/**
 * Throttle une fonction
 * @param {Function} func - Fonction à throttler
 * @param {number} limit - Limite en ms
 * @returns {Function} Fonction throttlée
 */
export const throttle = (func, limit) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Formater un prix en euros
 * @param {number} price - Prix à formater
 * @param {string} currency - Devise (défaut: EUR)
 * @returns {string} Prix formaté
 */
export const formatPrice = (price, currency = 'EUR') => {
  if (typeof price !== 'number' || isNaN(price)) {
    return '0,00 €'
  }
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(price)
}

/**
 * Formater une date
 * @param {Date|string} date - Date à formater
 * @param {string} locale - Locale (défaut: fr-FR)
 * @param {Object} options - Options de formatage
 * @returns {string} Date formatée
 */
export const formatDate = (date, locale = 'fr-FR', options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  
  const formatOptions = { ...defaultOptions, ...options }
  
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return 'Date invalide'
    }
    
    return dateObj.toLocaleDateString(locale, formatOptions)
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error)
    return 'Date invalide'
  }
}

/**
 * Formater une date relative (il y a X temps)
 * @param {Date|string} date - Date à formater
 * @returns {string} Date relative
 */
export const formatRelativeDate = (date) => {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInSeconds = Math.floor((now - targetDate) / 1000)
  
  if (diffInSeconds < 60) {
    return 'À l\'instant'
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`
  }
  
  const diffInWeeks = Math.floor(diffInDays / 7)
  if (diffInWeeks < 4) {
    return `Il y a ${diffInWeeks} semaine${diffInWeeks > 1 ? 's' : ''}`
  }
  
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `Il y a ${diffInMonths} mois`
  }
  
  const diffInYears = Math.floor(diffInDays / 365)
  return `Il y a ${diffInYears} an${diffInYears > 1 ? 's' : ''}`
}

/**
 * Générer un slug à partir d'une chaîne
 * @param {string} text - Texte à convertir
 * @returns {string} Slug généré
 */
export const slugify = (text) => {
  if (!text) return ''
  
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

/**
 * Tronquer un texte
 * @param {string} text - Texte à tronquer
 * @param {number} length - Longueur maximale
 * @param {string} suffix - Suffixe à ajouter
 * @returns {string} Texte tronqué
 */
export const truncate = (text, length = 100, suffix = '...') => {
  if (!text || text.length <= length) {
    return text
  }
  
  return text.substring(0, length).trim() + suffix
}

/**
 * Capitaliser la première lettre
 * @param {string} text - Texte à capitaliser
 * @returns {string} Texte capitalisé
 */
export const capitalize = (text) => {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Capitaliser chaque mot
 * @param {string} text - Texte à capitaliser
 * @returns {string} Texte capitalisé
 */
export const capitalizeWords = (text) => {
  if (!text) return ''
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

/**
 * Générer un ID unique
 * @param {number} length - Longueur de l'ID
 * @returns {string} ID unique
 */
export const generateId = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Valider une adresse email
 * @param {string} email - Email à valider
 * @returns {boolean} Email valide
 */
export const isValidEmail = (email) => {
  if (!email) return false
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valider un numéro de téléphone français
 * @param {string} phone - Téléphone à valider
 * @returns {boolean} Téléphone valide
 */
export const isValidPhone = (phone) => {
  if (!phone) return false
  
  // Supprimer tous les espaces et caractères non numériques
  const cleanPhone = phone.replace(/\D/g, '')
  
  // Vérifier les formats français
  const frenchPhoneRegex = /^(0[1-9]|33[1-9])[0-9]{8}$/
  return frenchPhoneRegex.test(cleanPhone)
}

/**
 * Formater un numéro de téléphone français
 * @param {string} phone - Téléphone à formater
 * @returns {string} Téléphone formaté
 */
export const formatPhone = (phone) => {
  if (!phone) return ''
  
  const cleanPhone = phone.replace(/\D/g, '')
  
  if (cleanPhone.length === 10 && cleanPhone.startsWith('0')) {
    return cleanPhone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')
  }
  
  if (cleanPhone.length === 11 && cleanPhone.startsWith('33')) {
    const withoutCountryCode = cleanPhone.substring(2)
    return `+33 ${withoutCountryCode.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5')}`
  }
  
  return phone
}

/**
 * Copier du texte dans le presse-papiers
 * @param {string} text - Texte à copier
 * @returns {Promise<boolean>} Succès de la copie
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // Fallback pour les navigateurs plus anciens
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const result = document.execCommand('copy')
      document.body.removeChild(textArea)
      return result
    }
  } catch (error) {
    console.error('Erreur lors de la copie:', error)
    return false
  }
}

/**
 * Télécharger un fichier
 * @param {string} url - URL du fichier
 * @param {string} filename - Nom du fichier
 */
export const downloadFile = (url, filename) => {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Obtenir la taille d'un fichier formatée
 * @param {number} bytes - Taille en bytes
 * @returns {string} Taille formatée
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Obtenir l'extension d'un fichier
 * @param {string} filename - Nom du fichier
 * @returns {string} Extension
 */
export const getFileExtension = (filename) => {
  if (!filename) return ''
  return filename.split('.').pop().toLowerCase()
}

/**
 * Vérifier si un fichier est une image
 * @param {string} filename - Nom du fichier
 * @returns {boolean} Est une image
 */
export const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
  const extension = getFileExtension(filename)
  return imageExtensions.includes(extension)
}

/**
 * Obtenir les paramètres de l'URL
 * @param {string} url - URL (optionnel, utilise window.location par défaut)
 * @returns {Object} Paramètres de l'URL
 */
export const getUrlParams = (url = window.location.href) => {
  const urlObj = new URL(url)
  const params = {}
  
  for (const [key, value] of urlObj.searchParams) {
    params[key] = value
  }
  
  return params
}

/**
 * Construire une URL avec des paramètres
 * @param {string} baseUrl - URL de base
 * @param {Object} params - Paramètres à ajouter
 * @returns {string} URL construite
 */
export const buildUrl = (baseUrl, params = {}) => {
  const url = new URL(baseUrl)
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      url.searchParams.set(key, value)
    }
  })
  
  return url.toString()
}

/**
 * Délai (sleep)
 * @param {number} ms - Millisecondes à attendre
 * @returns {Promise} Promise qui se résout après le délai
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry une fonction
 * @param {Function} fn - Fonction à retry
 * @param {number} retries - Nombre de tentatives
 * @param {number} delay - Délai entre les tentatives
 * @returns {Promise} Résultat de la fonction
 */
export const retry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0) {
      await sleep(delay)
      return retry(fn, retries - 1, delay)
    }
    throw error
  }
}

/**
 * Grouper un tableau par une propriété
 * @param {Array} array - Tableau à grouper
 * @param {string} key - Clé de groupement
 * @returns {Object} Objet groupé
 */
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key]
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {})
}

/**
 * Trier un tableau par une propriété
 * @param {Array} array - Tableau à trier
 * @param {string} key - Clé de tri
 * @param {string} direction - Direction (asc/desc)
 * @returns {Array} Tableau trié
 */
export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key]
    const bVal = b[key]
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * Supprimer les doublons d'un tableau
 * @param {Array} array - Tableau à dédupliquer
 * @param {string} key - Clé de déduplication (optionnel)
 * @returns {Array} Tableau sans doublons
 */
export const unique = (array, key = null) => {
  if (!key) {
    return [...new Set(array)]
  }
  
  const seen = new Set()
  return array.filter(item => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

/**
 * Obtenir une valeur aléatoire d'un tableau
 * @param {Array} array - Tableau
 * @returns {*} Valeur aléatoire
 */
export const randomChoice = (array) => {
  if (!array || array.length === 0) return null
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Mélanger un tableau
 * @param {Array} array - Tableau à mélanger
 * @returns {Array} Tableau mélangé
 */
export const shuffle = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Obtenir la différence entre deux dates en jours
 * @param {Date|string} date1 - Première date
 * @param {Date|string} date2 - Deuxième date
 * @returns {number} Différence en jours
 */
export const daysDifference = (date1, date2) => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2 - d1)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Vérifier si une date est aujourd'hui
 * @param {Date|string} date - Date à vérifier
 * @returns {boolean} Est aujourd'hui
 */
export const isToday = (date) => {
  const today = new Date()
  const targetDate = new Date(date)
  
  return today.getDate() === targetDate.getDate() &&
         today.getMonth() === targetDate.getMonth() &&
         today.getFullYear() === targetDate.getFullYear()
}

/**
 * Vérifier si une date est dans le passé
 * @param {Date|string} date - Date à vérifier
 * @returns {boolean} Est dans le passé
 */
export const isPast = (date) => {
  return new Date(date) < new Date()
}

/**
 * Vérifier si une date est dans le futur
 * @param {Date|string} date - Date à vérifier
 * @returns {boolean} Est dans le futur
 */
export const isFuture = (date) => {
  return new Date(date) > new Date()
}
