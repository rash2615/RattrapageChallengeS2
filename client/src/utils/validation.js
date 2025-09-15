/**
 * Fonctions de validation pour SPARK
 * Validation native des formulaires sans librairies externes
 */

/**
 * Classe de validation
 */
export class Validator {
  constructor() {
    this.errors = {}
    this.rules = {}
  }

  /**
   * Ajouter une règle de validation
   * @param {string} field - Nom du champ
   * @param {Function} rule - Fonction de validation
   * @param {string} message - Message d'erreur
   */
  addRule(field, rule, message) {
    if (!this.rules[field]) {
      this.rules[field] = []
    }
    this.rules[field].push({ rule, message })
  }

  /**
   * Valider un champ
   * @param {string} field - Nom du champ
   * @param {*} value - Valeur à valider
   * @returns {boolean} Champ valide
   */
  validateField(field, value) {
    if (!this.rules[field]) return true

    for (const { rule, message } of this.rules[field]) {
      if (!rule(value)) {
        this.errors[field] = message
        return false
      }
    }

    delete this.errors[field]
    return true
  }

  /**
   * Valider tous les champs
   * @param {Object} data - Données à valider
   * @returns {boolean} Toutes les validations passent
   */
  validate(data) {
    let isValid = true
    this.errors = {}

    for (const field in this.rules) {
      if (!this.validateField(field, data[field])) {
        isValid = false
      }
    }

    return isValid
  }

  /**
   * Obtenir les erreurs
   * @returns {Object} Erreurs de validation
   */
  getErrors() {
    return this.errors
  }

  /**
   * Obtenir l'erreur d'un champ
   * @param {string} field - Nom du champ
   * @returns {string|null} Message d'erreur
   */
  getFieldError(field) {
    return this.errors[field] || null
  }

  /**
   * Vérifier si un champ a une erreur
   * @param {string} field - Nom du champ
   * @returns {boolean} A une erreur
   */
  hasError(field) {
    return field in this.errors
  }

  /**
   * Effacer les erreurs
   */
  clearErrors() {
    this.errors = {}
  }
}

/**
 * Règles de validation communes
 */
export const rules = {
  // Requis
  required: (value) => {
    if (typeof value === 'string') {
      return value.trim().length > 0
    }
    return value !== null && value !== undefined && value !== ''
  },

  // Email
  email: (value) => {
    if (!value) return true // Laisser required gérer les valeurs vides
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  },

  // Téléphone français
  phone: (value) => {
    if (!value) return true
    const cleanPhone = value.replace(/\D/g, '')
    const frenchPhoneRegex = /^(0[1-9]|33[1-9])[0-9]{8}$/
    return frenchPhoneRegex.test(cleanPhone)
  },

  // Longueur minimale
  minLength: (min) => (value) => {
    if (!value) return true
    return value.length >= min
  },

  // Longueur maximale
  maxLength: (max) => (value) => {
    if (!value) return true
    return value.length <= max
  },

  // Longueur exacte
  exactLength: (length) => (value) => {
    if (!value) return true
    return value.length === length
  },

  // Mot de passe fort
  strongPassword: (value) => {
    if (!value) return true
    // Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    return strongPasswordRegex.test(value)
  },

  // Mot de passe avec exigences personnalisées
  password: (options = {}) => (value) => {
    if (!value) return true

    const {
      minLength = 8,
      requireUppercase = true,
      requireLowercase = true,
      requireNumbers = true,
      requireSpecialChars = true
    } = options

    if (value.length < minLength) return false
    if (requireUppercase && !/[A-Z]/.test(value)) return false
    if (requireLowercase && !/[a-z]/.test(value)) return false
    if (requireNumbers && !/\d/.test(value)) return false
    if (requireSpecialChars && !/[@$!%*?&]/.test(value)) return false

    return true
  },

  // Nombre
  number: (value) => {
    if (!value) return true
    return !isNaN(parseFloat(value)) && isFinite(value)
  },

  // Entier
  integer: (value) => {
    if (!value) return true
    return Number.isInteger(Number(value))
  },

  // Nombre positif
  positive: (value) => {
    if (!value) return true
    return Number(value) > 0
  },

  // Nombre négatif
  negative: (value) => {
    if (!value) return true
    return Number(value) < 0
  },

  // Valeur minimale
  min: (min) => (value) => {
    if (!value) return true
    return Number(value) >= min
  },

  // Valeur maximale
  max: (max) => (value) => {
    if (!value) return true
    return Number(value) <= max
  },

  // Plage de valeurs
  range: (min, max) => (value) => {
    if (!value) return true
    const num = Number(value)
    return num >= min && num <= max
  },

  // URL
  url: (value) => {
    if (!value) return true
    try {
      new URL(value)
      return true
    } catch {
      return false
    }
  },

  // Date
  date: (value) => {
    if (!value) return true
    const date = new Date(value)
    return !isNaN(date.getTime())
  },

  // Date future
  futureDate: (value) => {
    if (!value) return true
    const date = new Date(value)
    return date > new Date()
  },

  // Date passée
  pastDate: (value) => {
    if (!value) return true
    const date = new Date(value)
    return date < new Date()
  },

  // Format de date
  dateFormat: (format) => (value) => {
    if (!value) return true
    // Format simple pour les dates françaises (DD/MM/YYYY)
    if (format === 'DD/MM/YYYY') {
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/
      const match = value.match(dateRegex)
      if (!match) return false
      
      const [, day, month, year] = match
      const date = new Date(year, month - 1, day)
      return date.getDate() == day && date.getMonth() == month - 1 && date.getFullYear() == year
    }
    return true
  },

  // Code postal français
  frenchPostalCode: (value) => {
    if (!value) return true
    const postalCodeRegex = /^(0[1-9]|[1-8][0-9]|9[0-8])[0-9]{3}$/
    return postalCodeRegex.test(value.replace(/\s/g, ''))
  },

  // SIRET
  siret: (value) => {
    if (!value) return true
    const cleanSiret = value.replace(/\D/g, '')
    if (cleanSiret.length !== 14) return false
    
    // Algorithme de validation SIRET
    let sum = 0
    for (let i = 0; i < 13; i++) {
      let digit = parseInt(cleanSiret[i])
      if (i % 2 === 1) digit *= 2
      if (digit > 9) digit -= 9
      sum += digit
    }
    
    return (10 - (sum % 10)) % 10 === parseInt(cleanSiret[13])
  },

  // SIREN
  siren: (value) => {
    if (!value) return true
    const cleanSiren = value.replace(/\D/g, '')
    if (cleanSiren.length !== 9) return false
    
    // Algorithme de validation SIREN
    let sum = 0
    for (let i = 0; i < 8; i++) {
      let digit = parseInt(cleanSiren[i])
      if (i % 2 === 1) digit *= 2
      if (digit > 9) digit -= 9
      sum += digit
    }
    
    return (10 - (sum % 10)) % 10 === parseInt(cleanSiren[8])
  },

  // IBAN français
  frenchIban: (value) => {
    if (!value) return true
    const cleanIban = value.replace(/\s/g, '').toUpperCase()
    if (!cleanIban.startsWith('FR') || cleanIban.length !== 27) return false
    
    // Algorithme de validation IBAN
    const rearranged = cleanIban.slice(4) + cleanIban.slice(0, 4)
    const numeric = rearranged.replace(/[A-Z]/g, (char) => char.charCodeAt(0) - 55)
    
    let remainder = 0
    for (let i = 0; i < numeric.length; i++) {
      remainder = (remainder * 10 + parseInt(numeric[i])) % 97
    }
    
    return remainder === 1
  },

  // Confirmation de mot de passe
  confirmPassword: (password) => (value) => {
    if (!value) return true
    return value === password
  },

  // Acceptation des conditions
  accepted: (value) => {
    return value === true || value === 'true' || value === '1' || value === 1
  },

  // Valeur dans une liste
  in: (list) => (value) => {
    if (!value) return true
    return list.includes(value)
  },

  // Valeur pas dans une liste
  notIn: (list) => (value) => {
    if (!value) return true
    return !list.includes(value)
  },

  // Regex personnalisée
  regex: (pattern) => (value) => {
    if (!value) return true
    const regex = new RegExp(pattern)
    return regex.test(value)
  },

  // Fonction personnalisée
  custom: (fn) => (value) => {
    if (!value) return true
    return fn(value)
  }
}

/**
 * Messages d'erreur par défaut
 */
export const messages = {
  required: 'Ce champ est obligatoire',
  email: 'Veuillez saisir une adresse email valide',
  phone: 'Veuillez saisir un numéro de téléphone valide',
  minLength: (min) => `Ce champ doit contenir au moins ${min} caractères`,
  maxLength: (max) => `Ce champ ne peut pas dépasser ${max} caractères`,
  exactLength: (length) => `Ce champ doit contenir exactement ${length} caractères`,
  strongPassword: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial',
  password: 'Le mot de passe ne respecte pas les critères requis',
  number: 'Veuillez saisir un nombre valide',
  integer: 'Veuillez saisir un nombre entier',
  positive: 'Veuillez saisir un nombre positif',
  negative: 'Veuillez saisir un nombre négatif',
  min: (min) => `La valeur doit être supérieure ou égale à ${min}`,
  max: (max) => `La valeur doit être inférieure ou égale à ${max}`,
  range: (min, max) => `La valeur doit être comprise entre ${min} et ${max}`,
  url: 'Veuillez saisir une URL valide',
  date: 'Veuillez saisir une date valide',
  futureDate: 'La date doit être dans le futur',
  pastDate: 'La date doit être dans le passé',
  dateFormat: 'Le format de date n\'est pas valide',
  frenchPostalCode: 'Veuillez saisir un code postal français valide',
  siret: 'Veuillez saisir un SIRET valide',
  siren: 'Veuillez saisir un SIREN valide',
  frenchIban: 'Veuillez saisir un IBAN français valide',
  confirmPassword: 'Les mots de passe ne correspondent pas',
  accepted: 'Vous devez accepter les conditions',
  in: 'La valeur sélectionnée n\'est pas valide',
  notIn: 'Cette valeur n\'est pas autorisée',
  regex: 'Le format n\'est pas valide',
  custom: 'La valeur n\'est pas valide'
}

/**
 * Créer un validateur pour un formulaire
 * @param {Object} schema - Schéma de validation
 * @returns {Validator} Validateur configuré
 */
export const createValidator = (schema) => {
  const validator = new Validator()

  for (const field in schema) {
    const fieldRules = schema[field]
    
    for (const ruleName in fieldRules) {
      const ruleConfig = fieldRules[ruleName]
      
      if (typeof ruleConfig === 'function') {
        // Règle personnalisée
        validator.addRule(field, ruleConfig, messages[ruleName] || messages.custom)
      } else if (typeof ruleConfig === 'object') {
        // Règle avec paramètres
        const { rule, message } = ruleConfig
        validator.addRule(field, rule, message || messages[ruleName] || messages.custom)
      } else if (rules[ruleName]) {
        // Règle prédéfinie
        const rule = typeof rules[ruleName] === 'function' 
          ? rules[ruleName] 
          : rules[ruleName](ruleConfig)
        const message = typeof messages[ruleName] === 'function'
          ? messages[ruleName](ruleConfig)
          : messages[ruleName]
        validator.addRule(field, rule, message)
      }
    }
  }

  return validator
}

/**
 * Schémas de validation prédéfinis
 */
export const schemas = {
  // Inscription utilisateur
  userRegistration: {
    firstName: {
      required: true,
      minLength: 2,
      maxLength: 50
    },
    lastName: {
      required: true,
      minLength: 2,
      maxLength: 50
    },
    email: {
      required: true,
      email: true
    },
    password: {
      required: true,
      strongPassword: true
    },
    confirmPassword: {
      required: true,
      confirmPassword: (password) => password
    },
    acceptTerms: {
      required: true,
      accepted: true
    }
  },

  // Connexion utilisateur
  userLogin: {
    email: {
      required: true,
      email: true
    },
    password: {
      required: true,
      minLength: 1
    }
  },

  // Profil utilisateur
  userProfile: {
    firstName: {
      required: true,
      minLength: 2,
      maxLength: 50
    },
    lastName: {
      required: true,
      minLength: 2,
      maxLength: 50
    },
    email: {
      required: true,
      email: true
    },
    phone: {
      phone: true
    }
  },

  // Changement de mot de passe
  changePassword: {
    currentPassword: {
      required: true,
      minLength: 1
    },
    newPassword: {
      required: true,
      strongPassword: true
    },
    confirmPassword: {
      required: true,
      confirmPassword: (newPassword) => newPassword
    }
  },

  // Adresse
  address: {
    street: {
      required: true,
      minLength: 5,
      maxLength: 100
    },
    city: {
      required: true,
      minLength: 2,
      maxLength: 50
    },
    postalCode: {
      required: true,
      frenchPostalCode: true
    },
    country: {
      required: true,
      minLength: 2,
      maxLength: 50
    }
  },

  // Produit
  product: {
    name: {
      required: true,
      minLength: 3,
      maxLength: 100
    },
    description: {
      required: true,
      minLength: 10,
      maxLength: 1000
    },
    price: {
      required: true,
      number: true,
      positive: true,
      max: 10000
    },
    stock: {
      required: true,
      integer: true,
      min: 0
    },
    category: {
      required: true,
      in: ['chargers', 'cases', 'cables', 'headphones', 'accessories']
    }
  }
}

export default {
  Validator,
  rules,
  messages,
  createValidator,
  schemas
}