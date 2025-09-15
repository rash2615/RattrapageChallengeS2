<template>
  <div class="paypal-payment">
    <div class="payment-header">
      <h3 class="payment-title">Paiement avec PayPal</h3>
      <div class="paypal-logo">
        <span class="paypal-icon">🅿️</span>
        <span class="paypal-text">PayPal</span>
      </div>
    </div>

    <div class="payment-content">
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
                class="form-input"
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
                class="form-input"
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
              class="form-input"
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
                class="form-input"
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
                class="form-input"
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
          <span class="summary-label">Frais PayPal</span>
          <span class="summary-value">{{ formatPrice(paypalFee) }}</span>
        </div>
        <div class="summary-row total-row">
          <span class="summary-label">Total</span>
          <span class="summary-value">{{ formatPrice(totalAmount) }}</span>
        </div>
      </div>

      <!-- Bouton PayPal -->
      <div class="paypal-button-container">
        <div v-if="!isPayPalLoaded" class="paypal-loading">
          <div class="loading-spinner"></div>
          <span>Chargement de PayPal...</span>
        </div>
        <div v-else id="paypal-button-container" class="paypal-buttons"></div>
      </div>

      <!-- Informations de sécurité -->
      <div class="security-info">
        <div class="security-item">
          <span class="security-icon">🔒</span>
          <span class="security-text">Paiement sécurisé PayPal</span>
        </div>
        <div class="security-item">
          <span class="security-icon">🛡️</span>
          <span class="security-text">Protection acheteur</span>
        </div>
        <div class="security-item">
          <span class="security-icon">↩️</span>
          <span class="security-text">Remboursement garanti</span>
        </div>
      </div>

      <!-- Avantages PayPal -->
      <div class="paypal-benefits">
        <h4 class="benefits-title">Pourquoi choisir PayPal ?</h4>
        <ul class="benefits-list">
          <li>Paiement rapide et sécurisé</li>
          <li>Pas besoin de saisir vos données bancaires</li>
          <li>Protection acheteur incluse</li>
          <li>Remboursement en cas de problème</li>
        </ul>
      </div>
    </div>
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
const isPayPalLoaded = ref(false)
const sameAsShipping = ref(true)
const paypalButton = ref(null)

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
const paypalFee = computed(() => props.amount * 0.034 + 0.35) // 3.4% + 0.35€
const totalAmount = computed(() => props.amount + paypalFee.value)

// Fonctions
const validateField = (field) => {
  const billingField = field.replace('billing', '').toLowerCase()
  if (!billingInfo[billingField]) {
    errors[field] = 'Ce champ est requis'
  } else {
    delete errors[field]
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

const initializePayPal = async () => {
  try {
    // Initialiser PayPal
    const result = await paymentService.initializePayPal(process.env.VUE_APP_PAYPAL_CLIENT_ID)
    if (!result.success) {
      throw new Error(result.error)
    }

    isPayPalLoaded.value = true

    // Créer le bouton PayPal
    paypalButton.value = paymentService.createPayPalButton(
      'paypal-button-container',
      handlePayPalSuccess,
      handlePayPalError
    )

  } catch (error) {
    console.error('Erreur initialisation PayPal:', error)
    emit('payment-error', error.message)
  }
}

const handlePayPalSuccess = (paymentData) => {
  emit('payment-success', {
    paymentMethod: 'paypal',
    payment: paymentData,
    amount: totalAmount.value
  })
}

const handlePayPalError = (error) => {
  console.error('Erreur PayPal:', error)
  emit('payment-error', error.message || 'Erreur lors du paiement PayPal')
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
  
  // Initialiser PayPal
  initializePayPal()
})

onUnmounted(() => {
  // Nettoyer les ressources PayPal
  if (paypalButton.value) {
    paypalButton.value.close()
  }
  paymentService.cleanup()
})
</script>

<style scoped>
/* Composant de paiement PayPal */
.paypal-payment {
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

.paypal-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #0070ba;
  font-weight: 600;
}

.paypal-icon {
  font-size: 1.5rem;
}

.paypal-text {
  font-size: 1.125rem;
}

/* Contenu */
.payment-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Section facturation */
.billing-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
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

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #f9fafb;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: white;
}

.form-input.error {
  border-color: #ef4444;
  background: #fef2f2;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-error {
  font-size: 0.75rem;
  color: #ef4444;
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

/* Bouton PayPal */
.paypal-button-container {
  margin: 1rem 0;
}

.paypal-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  color: #6b7280;
}

.loading-spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #0070ba;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.paypal-buttons {
  display: flex;
  justify-content: center;
}

/* Informations de sécurité */
.security-info {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 1rem 0;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
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

/* Avantages PayPal */
.paypal-benefits {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.benefits-title {
  font-size: 1rem;
  font-weight: 600;
  color: #0369a1;
  margin: 0 0 1rem 0;
}

.benefits-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.benefits-list li {
  position: relative;
  padding-left: 1.5rem;
  color: #0369a1;
  font-size: 0.875rem;
}

.benefits-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #059669;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .paypal-payment {
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
  
  .benefits-list {
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .paypal-payment {
    padding: 1rem;
  }
  
  .payment-title {
    font-size: 1.125rem;
  }
  
  .paypal-logo {
    font-size: 0.875rem;
  }
  
  .paypal-icon {
    font-size: 1.25rem;
  }
}
</style>
