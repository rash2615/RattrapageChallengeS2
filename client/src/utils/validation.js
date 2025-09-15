/**
 * Utilitaires de validation sans librairies externes
 * Remplace Zod pour la validation des formulaires
 */

// Types de validation
export const ValidationTypes = {
  REQUIRED: 'required',
  EMAIL: 'email',
  MIN_LENGTH: 'minLength',
  MAX_LENGTH: 'maxLength',
  PASSWORD: 'password',
  PHONE: 'phone',
  URL: 'url',
  NUMBER: 'number',
  POSITIVE_NUMBER: 'positiveNumber'
}

// Messages d'erreur par défaut
export const ErrorMessages = {
  [ValidationTypes.REQUIRED]: 'Ce champ est obligatoire',
  [ValidationTypes.EMAIL]: 'Veuillez saisir une adresse email valide',
  [ValidationTypes.MIN_LENGTH]: 'Ce champ doit contenir au moins {min} caractères',
  [ValidationTypes.MAX_LENGTH]: 'Ce champ ne peut pas dépasser {max} caractères',
  [ValidationTypes.PASSWORD]: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre',
  [ValidationTypes.PHONE]: 'Veuillez saisir un numéro de téléphone valide',
  [ValidationTypes.URL]: 'Veuillez saisir une URL valide',
  [ValidationTypes.NUMBER]: 'Veuillez saisir un nombre valide',
  [ValidationTypes.POSITIVE_NUMBER]: 'Veuillez saisir un nombre positif'
}

/**
 * Valide une valeur selon les règles données
 * @param {any} value - Valeur à valider
 * @param {Array} rules - Règles de validation
 * @returns {Object} - { isValid: boolean, errors: Array }
 */
export function validate(value, rules = []) {
  const errors = []
  
  for (const rule of rules) {
    const error = validateRule(value, rule)
    if (error) {
      errors.push(error)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valide une règle spécifique
 * @param {any} value - Valeur à valider
 * @param {Object} rule - Règle de validation
 * @returns {string|null} - Message d'erreur ou null
 */
function validateRule(value, rule) {
  const { type, message, ...params } = rule
  
  // Vérifier si la valeur est vide pour les champs requis
  if (type === ValidationTypes.REQUIRED && (!value || value.toString().trim() === '')) {
    return message || ErrorMessages[ValidationTypes.REQUIRED]
  }
  
  // Si la valeur est vide et que ce n'est pas un champ requis, on skip
  if (!value || value.toString().trim() === '') {
    return null
  }
  
  switch (type) {
    case ValidationTypes.EMAIL:
      if (!isValidEmail(value)) {
        return message || ErrorMessages[ValidationTypes.EMAIL]
      }
      break
      
    case ValidationTypes.MIN_LENGTH:
      if (value.toString().length < params.min) {
        return message || ErrorMessages[ValidationTypes.MIN_LENGTH].replace('{min}', params.min)
      }
      break
      
    case ValidationTypes.MAX_LENGTH:
      if (value.toString().length > params.max) {
        return message || ErrorMessages[ValidationTypes.MAX_LENGTH].replace('{max}', params.max)
      }
      break
      
    case ValidationTypes.PASSWORD:
      if (!isValidPassword(value)) {
        return message || ErrorMessages[ValidationTypes.PASSWORD]
      }
      break
      
    case ValidationTypes.PHONE:
      if (!isValidPhone(value)) {
        return message || ErrorMessages[ValidationTypes.PHONE]
      }
      break
      
    case ValidationTypes.URL:
      if (!isValidUrl(value)) {
        return message || ErrorMessages[ValidationTypes.URL]
      }
      break
      
    case ValidationTypes.NUMBER:
      if (isNaN(value)) {
        return message || ErrorMessages[ValidationTypes.NUMBER]
      }
      break
      
    case ValidationTypes.POSITIVE_NUMBER:
      if (isNaN(value) || parseFloat(value) <= 0) {
        return message || ErrorMessages[ValidationTypes.POSITIVE_NUMBER]
      }
      break
  }
  
  return null
}

/**
 * Valide un email
 * @param {string} email - Email à valider
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valide un mot de passe fort
 * @param {string} password - Mot de passe à valider
 * @returns {boolean}
 */
function isValidPassword(password) {
  // Au moins 8 caractères, une majuscule, une minuscule et un chiffre
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
  return passwordRegex.test(password)
}

/**
 * Valide un numéro de téléphone français
 * @param {string} phone - Numéro de téléphone à valider
 * @returns {boolean}
 */
function isValidPhone(phone) {
  // Supprimer tous les espaces et caractères spéciaux
  const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '')
  // Vérifier si c'est un numéro français (10 chiffres commençant par 0)
  const phoneRegex = /^0[1-9][0-9]{8}$/
  return phoneRegex.test(cleanPhone)
}

/**
 * Valide une URL
 * @param {string} url - URL à valider
 * @returns {boolean}
 */
function isValidUrl(url) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Valide un formulaire complet
 * @param {Object} formData - Données du formulaire
 * @param {Object} schema - Schéma de validation
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export function validateForm(formData, schema) {
  const errors = {}
  let isValid = true
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = formData[field]
    const validation = validate(value, rules)
    
    if (!validation.isValid) {
      errors[field] = validation.errors[0] // Prendre seulement la première erreur
      isValid = false
    }
  }
  
  return { isValid, errors }
}

/**
 * Schémas de validation prédéfinis
 */
export const ValidationSchemas = {
  // Inscription utilisateur
  register: {
    firstName: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.MIN_LENGTH, min: 2 },
      { type: ValidationTypes.MAX_LENGTH, max: 50 }
    ],
    lastName: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.MIN_LENGTH, min: 2 },
      { type: ValidationTypes.MAX_LENGTH, max: 50 }
    ],
    email: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.EMAIL }
    ],
    password: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.PASSWORD }
    ],
    confirmPassword: [
      { type: ValidationTypes.REQUIRED }
    ]
  },
  
  // Connexion
  login: {
    email: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.EMAIL }
    ],
    password: [
      { type: ValidationTypes.REQUIRED }
    ]
  },
  
  // Produit
  product: {
    name: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.MIN_LENGTH, min: 3 },
      { type: ValidationTypes.MAX_LENGTH, max: 100 }
    ],
    description: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.MIN_LENGTH, min: 10 },
      { type: ValidationTypes.MAX_LENGTH, max: 1000 }
    ],
    price: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.POSITIVE_NUMBER }
    ],
    stock: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.NUMBER }
    ],
    category: [
      { type: ValidationTypes.REQUIRED }
    ],
    brand: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.MIN_LENGTH, min: 2 },
      { type: ValidationTypes.MAX_LENGTH, max: 50 }
    ]
  },
  
  // Adresse
  address: {
    street: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.MIN_LENGTH, min: 5 },
      { type: ValidationTypes.MAX_LENGTH, max: 100 }
    ],
    city: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.MIN_LENGTH, min: 2 },
      { type: ValidationTypes.MAX_LENGTH, max: 50 }
    ],
    postalCode: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.MIN_LENGTH, min: 5 },
      { type: ValidationTypes.MAX_LENGTH, max: 10 }
    ],
    country: [
      { type: ValidationTypes.REQUIRED },
      { type: ValidationTypes.MIN_LENGTH, min: 2 },
      { type: ValidationTypes.MAX_LENGTH, max: 50 }
    ]
  }
}

/**
 * Fonction utilitaire pour valider la confirmation de mot de passe
 * @param {string} password - Mot de passe
 * @param {string} confirmPassword - Confirmation du mot de passe
 * @returns {string|null} - Message d'erreur ou null
 */
export function validatePasswordConfirmation(password, confirmPassword) {
  if (password !== confirmPassword) {
    return 'Les mots de passe ne correspondent pas'
  }
  return null
}
