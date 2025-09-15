<template>
  <div class="stripe-payment">
    <div class="payment-header">
      <h3 class="payment-title">Paiement par carte bancaire</h3>
      <div class="payment-icons">
        <span class="payment-icon visa">💳</span>
        <span class="payment-icon mastercard">💳</span>
        <span class="payment-icon amex">💳</span>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="payment-form">
      <!-- Informations de la carte -->
      <div class="card-section">
        <div class="form-group">
          <label for="card-number" class="form-label">Numéro de carte *</label>
          <div class="card-input-container">
            <input
              id="card-number"
              v-model="cardInfo.number"
              type="text"
              class="card-input"
              :class="{ 'error': errors.number }"
              placeholder="1234 5678 9012 3456"
              maxlength="19"
              @input="formatCardNumber"
              @blur="validateField('number')"
            />
            <div class="card-brand">
              <span v-if="cardBrand" class="brand-icon">{{ getBrandIcon(cardBrand) }}</span>
            </div>
          </div>
          <div v-if="errors.number" class="form-error">{{ errors.number }}</div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="card-expiry" class="form-label">Date d'expiration *</label>
            <input
              id="card-expiry"
              v-model="cardInfo.expiry"
              type="text"
              class="card-input"
              :class="{ 'error': errors.expiry }"
              placeholder="MM/AA"
              maxlength="5"
              @input="formatExpiryDate"
              @blur="validateField('expiry')"
            />
            <div v-if="errors.expiry" class="form-error">{{ errors.expiry }}</div>
          </div>

          <div class="form-group">
            <label for="card-cvc" class="form-label">CVC *</label>
            <input
              id="card-cvc"
              v-model="cardInfo.cvc"
              type="text"
              class="card-input"
              :class="{ 'error': errors.cvc }"
              placeholder="123"
              maxlength="4"
              @input="formatCvc"
              @blur="validateField('cvc')"
            />
            <div v-if="errors.cvc" class="form-error">{{ errors.cvc }}</div>
          </div>
        </div>

        <div class="form-group">
          <label for="card-name" class="form-label">Nom du titulaire *</label>
          <input
            id="card-name"
            v-model="cardInfo.name"
            type="text"
            class="card-input"
            :class="{ 'error': errors.name }"
            placeholder="Nom tel qu'il apparaît sur la carte"
            @blur="validateField('name')"
          />
          <div v-if="errors.name" class="form-error">{{ errors.name }}</div>
        </div>
      </div>

      <!-- Informations de facturation -->
      <div class="billing-section">
        <h4 class="section-title">Adresse de facturation</h4>
        
        <div class="form-group">
          <label class="checkbox-label">
            <input
              v-model="sameAsShipping"
              type="checkbox"
              class="checkbox-input"
              @change="handleSameAsShipping"
            />
            <span class="checkbox-text">Identique à l'adresse de livraison</span>
          </label>
        </div>

        <div v-if="!sameAsShipping" class="billing-form">
          <div class="form-row">
            <div class="form-group">
              <label for="billing-first-name" class="form-label">Prénom *</label>
              <input
                id="billing-first-name"
                v-model="billingInfo.firstName"
                type="text"
                class="card-input"
                :class="{ 'error': errors.billingFirstName }"
                required
                @blur="validateField('billingFirstName')"
              />
              <div v-if="errors.billingFirstName" class="form-error">{{ errors.billingFirstName }}</div>
            </div>
            <div class="form-group">
              <label for="billing-last-name" class="form-label">Nom *</label>
              <input
                id="billing-last-name"
                v-model="billingInfo.lastName"
                type="text"
                class="card-input"
                :class="{ 'error': errors.billingLastName }"
                required
                @blur="validateField('billingLastName')"
              />
              <div v-if="errors.billingLastName" class="form-error">{{ errors.billingLastName }}</div>
            </div>
          </div>

          <div class="form-group">
            <label for="billing-address" class="form-label">Adresse *</label>
            <input
              id="billing-address"
              v-model="billingInfo.address"
              type="text"
              class="card-input"
              :class="{ 'error': errors.billingAddress }"
              required
              @blur="validateField('billingAddress')"
            />
            <div v-if="errors.billingAddress" class="form-error">{{ errors.billingAddress }}</div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="billing-city" class="form-label">Ville *</label>
              <input
                id="billing-city"
                v-model="billingInfo.city"
                type="text"
                class="card-input"
                :class="{ 'error': errors.billingCity }"
                required
                @blur="validateField('billingCity')"
              />
              <div v-if="errors.billingCity" class="form-error">{{ errors.billingCity }}</div>
            </div>
            <div class="form-group">
              <label for="billing-postal-code" class="form-label">Code postal *</label>
              <input
                id="billing-postal-code"
                v-model="billingInfo.postalCode"
                type="text"
                class="card-input"
                :class="{ 'error': errors.billingPostalCode }"
                required
                @blur="validateField('billingPostalCode')"
              />
              <div v-if="errors.billingPostalCode" class="form-error">{{ errors.billingPostalCode }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Résumé du paiement -->
      <div class="payment-summary">
        <div class="summary-row">
          <span class="summary-label">Montant à payer</span>
          <span class="summary-value">{{ formatPrice(amount) }}</span>
        </div>
        <div class="summary-row">
          <span class="summary-label">Frais de traitement</span>
          <span class="summary-value">{{ formatPrice(processingFee) }}</span>
        </div>
        <div class="summary-row total-row">
          <span class="summary-label">Total</span>
          <span class="summary-value">{{ formatPrice(totalAmount) }}</span>
        </div>
      </div>

      <!-- Bouton de paiement -->
      <button
        type="submit"
        class="payment-button"
        :disabled="isProcessing || !isFormValid"
      >
        <span v-if="isProcessing" class="spinner"></span>
        <span v-else>Payer {{ formatPrice(totalAmount) }}</span>
      </button>

      <!-- Informations de sécurité -->
      <div class="security-info">
        <div class="security-item">
          <span class="security-icon">🔒</span>
          <span class="security-text">Paiement sécurisé SSL</span>
        </div>
        <div class="security-item">
          <span class="security-icon">🛡️</span>
          <span class="security-text">Protection des données</span>
        </div>
        <div class="security-item">
          <span class="security-icon">✅</span>
          <span class="security-text">Conformité PCI DSS</span>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import paymentService from '../services/payment'

// Props
const props = defineProps({
  amount: {
    type: Number,
    required: true
  },
  shippingAddress: {
    type: Object,
    required: true
  },
  orderData: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['payment-success', 'payment-error'])

// État local
const isProcessing = ref(false)
const sameAsShipping = ref(true)
const cardBrand = ref('')

// Informations de la carte
const cardInfo = reactive({
  number: '',
  expiry: '',
  cvc: '',
  name: ''
})

// Informations de facturation
const billingInfo = reactive({
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  postalCode: ''
})

// Erreurs de validation
const errors = reactive({})

// Computed
const processingFee = computed(() => props.amount * 0.029 + 0.25) // 2.9% + 0.25€
const totalAmount = computed(() => props.amount + processingFee.value)

const isFormValid = computed(() => {
  const cardValid = cardInfo.number && cardInfo.expiry && cardInfo.cvc && cardInfo.name
  const billingValid = sameAsShipping.value || (
    billingInfo.firstName && 
    billingInfo.lastName && 
    billingInfo.address && 
    billingInfo.city && 
    billingInfo.postalCode
  )
  
  return cardValid && billingValid && Object.keys(errors).length === 0
})

// Fonctions
const formatCardNumber = (event) => {
  let value = event.target.value.replace(/\D/g, '')
  value = value.replace(/(\d{4})(?=\d)/g, '$1 ')
  cardInfo.number = value
  
  // Détecter la marque de la carte
  detectCardBrand(value.replace(/\s/g, ''))
}

const formatExpiryDate = (event) => {
  let value = event.target.value.replace(/\D/g, '')
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4)
  }
  cardInfo.expiry = value
}

const formatCvc = (event) => {
  cardInfo.cvc = event.target.value.replace(/\D/g, '')
}

const detectCardBrand = (number) => {
  if (/^4/.test(number)) {
    cardBrand.value = 'visa'
  } else if (/^5[1-5]/.test(number)) {
    cardBrand.value = 'mastercard'
  } else if (/^3[47]/.test(number)) {
    cardBrand.value = 'amex'
  } else {
    cardBrand.value = ''
  }
}

const getBrandIcon = (brand) => {
  const icons = {
    visa: '💳',
    mastercard: '💳',
    amex: '💳'
  }
  return icons[brand] || '💳'
}

const validateField = (field) => {
  const validation = paymentService.validateCardInfo(cardInfo)
  
  if (field.startsWith('billing')) {
    const billingField = field.replace('billing', '').toLowerCase()
    if (!billingInfo[billingField]) {
      errors[field] = 'Ce champ est requis'
    } else {
      delete errors[field]
    }
  } else {
    if (validation.errors[field]) {
      errors[field] = validation.errors[field]
    } else {
      delete errors[field]
    }
  }
}

const handleSameAsShipping = () => {
  if (sameAsShipping.value) {
    billingInfo.firstName = props.shippingAddress.firstName
    billingInfo.lastName = props.shippingAddress.lastName
    billingInfo.address = props.shippingAddress.address
    billingInfo.city = props.shippingAddress.city
    billingInfo.postalCode = props.shippingAddress.postalCode
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  try {
    isProcessing.value = true

    // Valider toutes les informations
    const validation = paymentService.validateCardInfo(cardInfo)
    if (!validation.isValid) {
      Object.assign(errors, validation.errors)
      return
    }

    // Créer l'intent de paiement Stripe
    const paymentData = {
      amount: Math.round(totalAmount.value * 100), // Convertir en centimes
      currency: 'eur',
      orderData: props.orderData,
      billingAddress: sameAsShipping.value ? props.shippingAddress : billingInfo
    }

    const intentResult = await paymentService.createStripePaymentIntent(paymentData)
    if (!intentResult.success) {
      throw new Error(intentResult.error)
    }

    // Initialiser Stripe
    const stripeResult = await paymentService.initializeStripe(intentResult.publishableKey)
    if (!stripeResult.success) {
      throw new Error(stripeResult.error)
    }

    // Créer les éléments Stripe
    const elements = paymentService.createStripeElements(intentResult.clientSecret)
    const cardElement = paymentService.createCardElement()

    // Créer le payment method
    const { error, paymentMethod } = await paymentService.stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name: cardInfo.name,
        address: sameAsShipping.value ? props.shippingAddress : billingInfo
      }
    })

    if (error) {
      throw new Error(error.message)
    }

    // Confirmer le paiement
    const confirmResult = await paymentService.confirmStripePayment(
      intentResult.clientSecret,
      paymentMethod
    )

    if (!confirmResult.success) {
      throw new Error(confirmResult.error)
    }

    // Succès du paiement
    emit('payment-success', {
      paymentMethod: 'stripe',
      paymentIntent: confirmResult.paymentIntent,
      amount: totalAmount.value
    })

  } catch (error) {
    console.error('Erreur de paiement Stripe:', error)
    emit('payment-error', error.message)
  } finally {
    isProcessing.value = false
  }
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

// Lifecycle
onMounted(() => {
  // Pré-remplir les informations de facturation
  handleSameAsShipping()
})

onUnmounted(() => {
  // Nettoyer les ressources Stripe
  paymentService.cleanup()
})
</script>

<style scoped>
/* Composant de paiement Stripe */
.stripe-payment {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* En-tête */
.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.payment-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.payment-icons {
  display: flex;
  gap: 0.5rem;
}

.payment-icon {
  font-size: 1.5rem;
  opacity: 0.7;
}

/* Formulaire */
.payment-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Section carte */
.card-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.card-input-container {
  position: relative;
}

.card-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #f9fafb;
}

.card-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: white;
}

.card-input.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.card-brand {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.25rem;
}

.brand-icon {
  opacity: 0.7;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-error {
  font-size: 0.75rem;
  color: #ef4444;
}

/* Section facturation */
.billing-section {
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
}

.checkbox-input {
  width: 1rem;
  height: 1rem;
  accent-color: #3b82f6;
}

.checkbox-text {
  user-select: none;
}

.billing-form {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Résumé du paiement */
.payment-summary {
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin: 1rem 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.summary-row:last-child {
  margin-bottom: 0;
}

.summary-label {
  color: #6b7280;
  font-size: 0.875rem;
}

.summary-value {
  font-weight: 600;
  color: #374151;
}

.total-row {
  padding-top: 0.75rem;
  border-top: 1px solid #d1d5db;
  font-size: 1.125rem;
}

.total-row .summary-label {
  font-weight: 600;
  color: #374151;
}

.total-row .summary-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
}

/* Bouton de paiement */
.payment-button {
  width: 100%;
  padding: 1rem 2rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.payment-button:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.payment-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Informations de sécurité */
.security-info {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.security-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.security-icon {
  font-size: 1rem;
}

.security-text {
  font-weight: 500;
}

/* Spinner */
.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-radius: 50%;
  border-top-color: currentColor;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .stripe-payment {
    padding: 1.5rem;
  }
  
  .payment-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .security-info {
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .stripe-payment {
    padding: 1rem;
  }
  
  .payment-title {
    font-size: 1.125rem;
  }
  
  .payment-button {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
}
</style>
