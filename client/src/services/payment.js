/**
 * Service de paiement pour SPARK
 * Intégration Stripe et PayPal
 */

import api from './api'

class PaymentService {
  constructor() {
    this.stripe = null
    this.stripeElements = null
    this.paypal = null
    this.isStripeLoaded = false
    this.isPayPalLoaded = false
  }

  /**
   * Initialiser Stripe
   */
  async initializeStripe(publishableKey) {
    if (this.isStripeLoaded) return

    try {
      // Charger Stripe.js depuis le CDN
      if (!window.Stripe) {
        await this.loadScript('https://js.stripe.com/v3/')
      }

      this.stripe = window.Stripe(publishableKey)
      this.isStripeLoaded = true
      
      return { success: true }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de Stripe:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Initialiser PayPal
   */
  async initializePayPal(clientId) {
    if (this.isPayPalLoaded) return

    try {
      // Charger PayPal SDK depuis le CDN
      if (!window.paypal) {
        await this.loadScript(`https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR`)
      }

      this.paypal = window.paypal
      this.isPayPalLoaded = true
      
      return { success: true }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de PayPal:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Charger un script externe
   */
  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = src
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  /**
   * Créer un intent de paiement Stripe
   */
  async createStripePaymentIntent(orderData) {
    try {
      const response = await api.post('/payments/stripe/create-intent', orderData)
      
      if (response.data.success) {
        return { 
          success: true, 
          clientSecret: response.data.clientSecret,
          publishableKey: response.data.publishableKey
        }
      }
      
      throw new Error(response.data.message || 'Erreur lors de la création du paiement')
    } catch (error) {
      console.error('Erreur Stripe create intent:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      }
    }
  }

  /**
   * Confirmer un paiement Stripe
   */
  async confirmStripePayment(clientSecret, paymentMethod) {
    try {
      if (!this.stripe) {
        throw new Error('Stripe non initialisé')
      }

      const result = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod
      })

      if (result.error) {
        return { success: false, error: result.error.message }
      }

      return { success: true, paymentIntent: result.paymentIntent }
    } catch (error) {
      console.error('Erreur confirmation Stripe:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Créer un paiement PayPal
   */
  async createPayPalPayment(orderData) {
    try {
      const response = await api.post('/payments/paypal/create', orderData)
      
      if (response.data.success) {
        return { 
          success: true, 
          paymentId: response.data.paymentId,
          approvalUrl: response.data.approvalUrl
        }
      }
      
      throw new Error(response.data.message || 'Erreur lors de la création du paiement PayPal')
    } catch (error) {
      console.error('Erreur PayPal create:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      }
    }
  }

  /**
   * Exécuter un paiement PayPal
   */
  async executePayPalPayment(paymentId, payerId) {
    try {
      const response = await api.post('/payments/paypal/execute', {
        paymentId,
        payerId
      })
      
      if (response.data.success) {
        return { success: true, payment: response.data.payment }
      }
      
      throw new Error(response.data.message || 'Erreur lors de l\'exécution du paiement')
    } catch (error) {
      console.error('Erreur PayPal execute:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      }
    }
  }

  /**
   * Créer des éléments Stripe pour le formulaire de carte
   */
  createStripeElements(clientSecret) {
    if (!this.stripe) {
      throw new Error('Stripe non initialisé')
    }

    this.stripeElements = this.stripe.elements({
      clientSecret,
      appearance: {
        theme: 'stripe',
        variables: {
          colorPrimary: '#3b82f6',
          colorBackground: '#ffffff',
          colorText: '#1f2937',
          colorDanger: '#ef4444',
          fontFamily: 'Inter, system-ui, sans-serif',
          spacingUnit: '4px',
          borderRadius: '8px'
        }
      }
    })

    return this.stripeElements
  }

  /**
   * Créer un élément de carte Stripe
   */
  createCardElement() {
    if (!this.stripeElements) {
      throw new Error('Stripe Elements non initialisé')
    }

    return this.stripeElements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#1f2937',
          '::placeholder': {
            color: '#9ca3af'
          }
        },
        invalid: {
          color: '#ef4444'
        }
      }
    })
  }

  /**
   * Valider un élément de carte Stripe
   */
  validateCardElement(cardElement) {
    return new Promise((resolve) => {
      cardElement.on('change', (event) => {
        if (event.error) {
          resolve({ valid: false, error: event.error.message })
        } else {
          resolve({ valid: true })
        }
      })
    })
  }

  /**
   * Créer un bouton PayPal
   */
  createPayPalButton(containerId, onApprove, onError) {
    if (!this.paypal) {
      throw new Error('PayPal non initialisé')
    }

    return this.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'paypal'
      },
      createOrder: async (data, actions) => {
        try {
          const response = await api.post('/payments/paypal/create-order')
          if (response.data.success) {
            return response.data.orderId
          }
          throw new Error(response.data.message)
        } catch (error) {
          console.error('Erreur création commande PayPal:', error)
          throw error
        }
      },
      onApprove: async (data, actions) => {
        try {
          const response = await api.post('/payments/paypal/capture', {
            orderID: data.orderID
          })
          
          if (response.data.success) {
            onApprove(response.data)
          } else {
            onError(new Error(response.data.message))
          }
        } catch (error) {
          console.error('Erreur capture PayPal:', error)
          onError(error)
        }
      },
      onError: (error) => {
        console.error('Erreur PayPal:', error)
        onError(error)
      },
      onCancel: (data) => {
        console.log('Paiement PayPal annulé:', data)
      }
    }).render(`#${containerId}`)
  }

  /**
   * Vérifier le statut d'un paiement
   */
  async checkPaymentStatus(paymentId) {
    try {
      const response = await api.get(`/payments/status/${paymentId}`)
      
      if (response.data.success) {
        return { success: true, status: response.data.status }
      }
      
      throw new Error(response.data.message || 'Erreur lors de la vérification')
    } catch (error) {
      console.error('Erreur vérification statut:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      }
    }
  }

  /**
   * Rembourser un paiement
   */
  async refundPayment(paymentId, amount = null) {
    try {
      const response = await api.post('/payments/refund', {
        paymentId,
        amount
      })
      
      if (response.data.success) {
        return { success: true, refund: response.data.refund }
      }
      
      throw new Error(response.data.message || 'Erreur lors du remboursement')
    } catch (error) {
      console.error('Erreur remboursement:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      }
    }
  }

  /**
   * Obtenir les méthodes de paiement disponibles
   */
  async getAvailablePaymentMethods() {
    try {
      const response = await api.get('/payments/methods')
      
      if (response.data.success) {
        return { success: true, methods: response.data.methods }
      }
      
      throw new Error(response.data.message || 'Erreur lors du chargement')
    } catch (error) {
      console.error('Erreur méthodes de paiement:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      }
    }
  }

  /**
   * Valider les informations de carte
   */
  validateCardInfo(cardInfo) {
    const errors = {}

    // Numéro de carte
    if (!cardInfo.number || !/^\d{13,19}$/.test(cardInfo.number.replace(/\s/g, ''))) {
      errors.number = 'Numéro de carte invalide'
    }

    // Date d'expiration
    if (!cardInfo.expiry || !/^\d{2}\/\d{2}$/.test(cardInfo.expiry)) {
      errors.expiry = 'Date d\'expiration invalide (MM/AA)'
    } else {
      const [month, year] = cardInfo.expiry.split('/')
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear() % 100
      const currentMonth = currentDate.getMonth() + 1

      if (parseInt(month) < 1 || parseInt(month) > 12) {
        errors.expiry = 'Mois invalide'
      } else if (parseInt(year) < currentYear || 
                 (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        errors.expiry = 'Carte expirée'
      }
    }

    // CVC
    if (!cardInfo.cvc || !/^\d{3,4}$/.test(cardInfo.cvc)) {
      errors.cvc = 'CVC invalide'
    }

    // Nom du titulaire
    if (!cardInfo.name || cardInfo.name.trim().length < 2) {
      errors.name = 'Nom du titulaire requis'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  /**
   * Formater le numéro de carte
   */
  formatCardNumber(number) {
    return number.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim()
  }

  /**
   * Formater la date d'expiration
   */
  formatExpiryDate(expiry) {
    return expiry.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2')
  }

  /**
   * Nettoyer les données de paiement
   */
  cleanup() {
    if (this.stripeElements) {
      this.stripeElements = null
    }
    this.stripe = null
    this.paypal = null
    this.isStripeLoaded = false
    this.isPayPalLoaded = false
  }
}

// Instance singleton
const paymentService = new PaymentService()

export default paymentService
