<template>
  <div class="payment-method-selector">
    <h3 class="selector-title">Choisissez votre méthode de paiement</h3>
    
    <div class="payment-methods">
      <!-- Stripe -->
      <div class="payment-method">
        <input
          id="stripe"
          v-model="selectedMethod"
          type="radio"
          value="stripe"
          class="method-radio"
        />
        <label for="stripe" class="method-label">
          <div class="method-icon">
            <span class="icon">💳</span>
          </div>
          <div class="method-info">
            <h4 class="method-name">Carte bancaire</h4>
            <p class="method-description">
              Visa, Mastercard, American Express
            </p>
            <div class="method-features">
              <span class="feature">Paiement instantané</span>
              <span class="feature">Sécurisé SSL</span>
              <span class="feature">Frais: 2.9% + 0.25€</span>
            </div>
          </div>
          <div class="method-arrow">
            <span class="arrow">→</span>
          </div>
        </label>
      </div>

      <!-- PayPal -->
      <div class="payment-method">
        <input
          id="paypal"
          v-model="selectedMethod"
          type="radio"
          value="paypal"
          class="method-radio"
        />
        <label for="paypal" class="method-label">
          <div class="method-icon paypal">
            <span class="icon">🅿️</span>
          </div>
          <div class="method-info">
            <h4 class="method-name">PayPal</h4>
            <p class="method-description">
              Paiement rapide et sécurisé
            </p>
            <div class="method-features">
              <span class="feature">Protection acheteur</span>
              <span class="feature">Remboursement garanti</span>
              <span class="feature">Frais: 3.4% + 0.35€</span>
            </div>
          </div>
          <div class="method-arrow">
            <span class="arrow">→</span>
          </div>
        </label>
      </div>

      <!-- Apple Pay (futur) -->
      <div class="payment-method disabled">
        <input
          id="apple-pay"
          type="radio"
          disabled
          class="method-radio"
        />
        <label for="apple-pay" class="method-label">
          <div class="method-icon apple">
            <span class="icon">🍎</span>
          </div>
          <div class="method-info">
            <h4 class="method-name">Apple Pay</h4>
            <p class="method-description">
              Bientôt disponible
            </p>
            <div class="method-features">
              <span class="feature coming-soon">Prochainement</span>
            </div>
          </div>
          <div class="method-arrow">
            <span class="arrow">→</span>
          </div>
        </label>
      </div>

      <!-- Google Pay (futur) -->
      <div class="payment-method disabled">
        <input
          id="google-pay"
          type="radio"
          disabled
          class="method-radio"
        />
        <label for="google-pay" class="method-label">
          <div class="method-icon google">
            <span class="icon">G</span>
          </div>
          <div class="method-info">
            <h4 class="method-name">Google Pay</h4>
            <p class="method-description">
              Bientôt disponible
            </p>
            <div class="method-features">
              <span class="feature coming-soon">Prochainement</span>
            </div>
          </div>
          <div class="method-arrow">
            <span class="arrow">→</span>
          </div>
        </label>
      </div>
    </div>

    <!-- Comparaison des frais -->
    <div class="fees-comparison">
      <h4 class="comparison-title">Comparaison des frais</h4>
      <div class="comparison-table">
        <div class="comparison-row header">
          <span class="comparison-method">Méthode</span>
          <span class="comparison-fee">Frais</span>
          <span class="comparison-total">Total pour {{ formatPrice(amount) }}</span>
        </div>
        <div class="comparison-row">
          <span class="comparison-method">
            <span class="method-icon-small">💳</span>
            Carte bancaire
          </span>
          <span class="comparison-fee">2.9% + 0.25€</span>
          <span class="comparison-total">{{ formatPrice(stripeTotal) }}</span>
        </div>
        <div class="comparison-row">
          <span class="comparison-method">
            <span class="method-icon-small">🅿️</span>
            PayPal
          </span>
          <span class="comparison-fee">3.4% + 0.35€</span>
          <span class="comparison-total">{{ formatPrice(paypalTotal) }}</span>
        </div>
      </div>
    </div>

    <!-- Informations de sécurité -->
    <div class="security-info">
      <h4 class="security-title">Sécurité et protection</h4>
      <div class="security-features">
        <div class="security-feature">
          <span class="security-icon">🔒</span>
          <div class="security-content">
            <h5 class="security-name">Chiffrement SSL</h5>
            <p class="security-description">Toutes vos données sont chiffrées</p>
          </div>
        </div>
        <div class="security-feature">
          <span class="security-icon">🛡️</span>
          <div class="security-content">
            <h5 class="security-name">Protection des données</h5>
            <p class="security-description">Conformité RGPD et PCI DSS</p>
          </div>
        </div>
        <div class="security-feature">
          <span class="security-icon">↩️</span>
          <div class="security-content">
            <h5 class="security-name">Remboursement</h5>
            <p class="security-description">Garantie de remboursement</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  amount: {
    type: Number,
    required: true
  }
})

// Emits
const emit = defineEmits(['method-selected'])

// État local
const selectedMethod = ref('stripe')

// Computed
const stripeFee = computed(() => props.amount * 0.029 + 0.25)
const paypalFee = computed(() => props.amount * 0.034 + 0.35)
const stripeTotal = computed(() => props.amount + stripeFee.value)
const paypalTotal = computed(() => props.amount + paypalFee.value)

// Fonctions
const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

// Watchers
watch(() => selectedMethod.value, (newMethod) => {
  emit('method-selected', newMethod)
})
</script>

<style scoped>
/* Sélecteur de méthode de paiement */
.payment-method-selector {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.selector-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 2rem 0;
  text-align: center;
}

/* Méthodes de paiement */
.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.payment-method {
  position: relative;
}

.method-radio {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.method-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.method-label:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.method-radio:checked + .method-label {
  border-color: #3b82f6;
  background: #dbeafe;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.payment-method.disabled .method-label {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f9fafb;
}

.payment-method.disabled .method-label:hover {
  border-color: #e5e7eb;
  background: #f9fafb;
}

.method-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: #f3f4f6;
  flex-shrink: 0;
}

.method-icon.paypal {
  background: #0070ba;
  color: white;
}

.method-icon.apple {
  background: #000000;
  color: white;
}

.method-icon.google {
  background: #4285f4;
  color: white;
}

.method-info {
  flex: 1;
  min-width: 0;
}

.method-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.25rem 0;
}

.method-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.75rem 0;
}

.method-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.feature {
  background: #f3f4f6;
  color: #374151;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.feature.coming-soon {
  background: #fef3c7;
  color: #d97706;
}

.method-arrow {
  color: #6b7280;
  font-size: 1.25rem;
  font-weight: 600;
  flex-shrink: 0;
}

/* Comparaison des frais */
.fees-comparison {
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.comparison-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
  text-align: center;
}

.comparison-table {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.comparison-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  align-items: center;
}

.comparison-row.header {
  background: #e5e7eb;
  font-weight: 600;
  color: #374151;
}

.comparison-row:not(.header) {
  background: white;
  border: 1px solid #e5e7eb;
}

.comparison-method {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.method-icon-small {
  font-size: 1rem;
}

.comparison-fee {
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
}

.comparison-total {
  font-weight: 600;
  color: #1f2937;
  text-align: right;
}

/* Informations de sécurité */
.security-info {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.security-title {
  font-size: 1rem;
  font-weight: 600;
  color: #166534;
  margin: 0 0 1rem 0;
  text-align: center;
}

.security-features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.security-feature {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.security-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.security-content {
  flex: 1;
}

.security-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #166534;
  margin: 0 0 0.25rem 0;
}

.security-description {
  font-size: 0.75rem;
  color: #15803d;
  margin: 0;
  line-height: 1.4;
}

/* Responsive */
@media (max-width: 768px) {
  .payment-method-selector {
    padding: 1.5rem;
  }
  
  .method-label {
    padding: 1rem;
  }
  
  .method-icon {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.25rem;
  }
  
  .method-name {
    font-size: 1rem;
  }
  
  .method-features {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .comparison-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    text-align: center;
  }
  
  .comparison-total {
    text-align: center;
  }
  
  .security-features {
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .payment-method-selector {
    padding: 1rem;
  }
  
  .selector-title {
    font-size: 1.125rem;
  }
  
  .method-label {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .method-arrow {
    display: none;
  }
  
  .fees-comparison,
  .security-info {
    padding: 1rem;
  }
}
</style>
