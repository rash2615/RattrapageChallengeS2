<template>
  <div class="checkout-page">
    <div class="container">
      <!-- En-tête -->
      <div class="checkout-header">
        <h1 class="page-title">Finaliser la commande</h1>
        <p class="page-subtitle">Vérifiez vos informations et confirmez votre commande</p>
      </div>

      <!-- Panier vide -->
      <div v-if="cartStore.isEmpty" class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h2 class="empty-cart-title">Votre panier est vide</h2>
        <p class="empty-cart-text">
          Ajoutez des produits à votre panier avant de passer commande.
        </p>
        <router-link to="/products" class="btn btn-primary btn-lg">
          Découvrir les produits
        </router-link>
      </div>

      <!-- Contenu du checkout -->
      <div v-else class="checkout-content">
        <div class="checkout-layout">
          <!-- Formulaire de commande -->
          <div class="checkout-form">
            <!-- Étapes de commande -->
            <div class="checkout-steps">
              <div 
                v-for="(step, index) in steps" 
                :key="step.id"
                class="step"
                :class="{ 
                  active: currentStep === step.id, 
                  completed: completedSteps.includes(step.id) 
                }"
              >
                <div class="step-number">
                  <span v-if="completedSteps.includes(step.id)">✓</span>
                  <span v-else>{{ index + 1 }}</span>
                </div>
                <div class="step-content">
                  <h3 class="step-title">{{ step.title }}</h3>
                  <p class="step-description">{{ step.description }}</p>
                </div>
              </div>
            </div>

            <!-- Étape 1: Informations de livraison -->
            <div v-if="currentStep === 'shipping'" class="step-content">
              <h2 class="section-title">Informations de livraison</h2>
              
              <form @submit.prevent="handleShippingSubmit" class="shipping-form">
                <div class="form-row">
                  <div class="form-group">
                    <label for="firstName" class="form-label">Prénom *</label>
                    <input
                      id="firstName"
                      v-model="shippingForm.firstName"
                      type="text"
                      class="form-input"
                      :class="{ 'error': errors.firstName }"
                      required
                      @blur="validateField('firstName')"
                    />
                    <div v-if="errors.firstName" class="form-error">{{ errors.firstName }}</div>
                  </div>
                  <div class="form-group">
                    <label for="lastName" class="form-label">Nom *</label>
                    <input
                      id="lastName"
                      v-model="shippingForm.lastName"
                      type="text"
                      class="form-input"
                      :class="{ 'error': errors.lastName }"
                      required
                      @blur="validateField('lastName')"
                    />
                    <div v-if="errors.lastName" class="form-error">{{ errors.lastName }}</div>
                  </div>
                </div>

                <div class="form-group">
                  <label for="email" class="form-label">Email *</label>
                  <input
                    id="email"
                    v-model="shippingForm.email"
                    type="email"
                    class="form-input"
                    :class="{ 'error': errors.email }"
                    required
                    @blur="validateField('email')"
                  />
                  <div v-if="errors.email" class="form-error">{{ errors.email }}</div>
                </div>

                <div class="form-group">
                  <label for="phone" class="form-label">Téléphone *</label>
                  <input
                    id="phone"
                    v-model="shippingForm.phone"
                    type="tel"
                    class="form-input"
                    :class="{ 'error': errors.phone }"
                    required
                    @blur="validateField('phone')"
                  />
                  <div v-if="errors.phone" class="form-error">{{ errors.phone }}</div>
                </div>

                <div class="form-group">
                  <label for="address" class="form-label">Adresse *</label>
                  <input
                    id="address"
                    v-model="shippingForm.address"
                    type="text"
                    class="form-input"
                    :class="{ 'error': errors.address }"
                    required
                    @blur="validateField('address')"
                  />
                  <div v-if="errors.address" class="form-error">{{ errors.address }}</div>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label for="city" class="form-label">Ville *</label>
                    <input
                      id="city"
                      v-model="shippingForm.city"
                      type="text"
                      class="form-input"
                      :class="{ 'error': errors.city }"
                      required
                      @blur="validateField('city')"
                    />
                    <div v-if="errors.city" class="form-error">{{ errors.city }}</div>
                  </div>
                  <div class="form-group">
                    <label for="postalCode" class="form-label">Code postal *</label>
                    <input
                      id="postalCode"
                      v-model="shippingForm.postalCode"
                      type="text"
                      class="form-input"
                      :class="{ 'error': errors.postalCode }"
                      required
                      @blur="validateField('postalCode')"
                    />
                    <div v-if="errors.postalCode" class="form-error">{{ errors.postalCode }}</div>
                  </div>
                </div>

                <div class="form-group">
                  <label for="country" class="form-label">Pays *</label>
                  <select
                    id="country"
                    v-model="shippingForm.country"
                    class="form-select"
                    :class="{ 'error': errors.country }"
                    required
                    @change="validateField('country')"
                  >
                    <option value="">Sélectionner un pays</option>
                    <option value="FR">France</option>
                    <option value="BE">Belgique</option>
                    <option value="CH">Suisse</option>
                    <option value="LU">Luxembourg</option>
                  </select>
                  <div v-if="errors.country" class="form-error">{{ errors.country }}</div>
                </div>

                <div class="form-group">
                  <label class="checkbox-label">
                    <input
                      v-model="shippingForm.saveAddress"
                      type="checkbox"
                      class="checkbox-input"
                    />
                    <span class="checkbox-text">Sauvegarder cette adresse pour mes prochaines commandes</span>
                  </label>
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn btn-primary btn-lg">
                    Continuer vers le paiement
                  </button>
                </div>
              </form>
            </div>

            <!-- Étape 2: Paiement -->
            <div v-if="currentStep === 'payment'" class="step-content">
              <h2 class="section-title">Méthode de paiement</h2>
              
              <form @submit.prevent="handlePaymentSubmit" class="payment-form">
                <!-- Méthodes de paiement -->
                <div class="payment-methods">
                  <div class="payment-method">
                    <input
                      id="stripe"
                      v-model="paymentForm.method"
                      type="radio"
                      value="stripe"
                      class="payment-radio"
                    />
                    <label for="stripe" class="payment-label">
                      <div class="payment-icon">💳</div>
                      <div class="payment-info">
                        <span class="payment-name">Carte bancaire</span>
                        <span class="payment-description">Visa, Mastercard, American Express</span>
                      </div>
                    </label>
                  </div>

                  <div class="payment-method">
                    <input
                      id="paypal"
                      v-model="paymentForm.method"
                      type="radio"
                      value="paypal"
                      class="payment-radio"
                    />
                    <label for="paypal" class="payment-label">
                      <div class="payment-icon">🅿️</div>
                      <div class="payment-info">
                        <span class="payment-name">PayPal</span>
                        <span class="payment-description">Paiement sécurisé avec PayPal</span>
                      </div>
                    </label>
                  </div>
                </div>

                <!-- Informations de facturation -->
                <div class="billing-section">
                  <h3 class="subsection-title">Informations de facturation</h3>
                  
                  <div class="form-group">
                    <label class="checkbox-label">
                      <input
                        v-model="billingForm.sameAsShipping"
                        type="checkbox"
                        class="checkbox-input"
                        @change="handleBillingSameAsShipping"
                      />
                      <span class="checkbox-text">Même adresse que la livraison</span>
                    </label>
                  </div>

                  <div v-if="!billingForm.sameAsShipping" class="billing-form">
                    <div class="form-row">
                      <div class="form-group">
                        <label for="billingFirstName" class="form-label">Prénom *</label>
                        <input
                          id="billingFirstName"
                          v-model="billingForm.firstName"
                          type="text"
                          class="form-input"
                          :class="{ 'error': errors.billingFirstName }"
                          required
                          @blur="validateField('billingFirstName')"
                        />
                        <div v-if="errors.billingFirstName" class="form-error">{{ errors.billingFirstName }}</div>
                      </div>
                      <div class="form-group">
                        <label for="billingLastName" class="form-label">Nom *</label>
                        <input
                          id="billingLastName"
                          v-model="billingForm.lastName"
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
                      <label for="billingAddress" class="form-label">Adresse *</label>
                      <input
                        id="billingAddress"
                        v-model="billingForm.address"
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
                        <label for="billingCity" class="form-label">Ville *</label>
                        <input
                          id="billingCity"
                          v-model="billingForm.city"
                          type="text"
                          class="form-input"
                          :class="{ 'error': errors.billingCity }"
                          required
                          @blur="validateField('billingCity')"
                        />
                        <div v-if="errors.billingCity" class="form-error">{{ errors.billingCity }}</div>
                      </div>
                      <div class="form-group">
                        <label for="billingPostalCode" class="form-label">Code postal *</label>
                        <input
                          id="billingPostalCode"
                          v-model="billingForm.postalCode"
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

                <div class="form-actions">
                  <button type="button" class="btn btn-outline" @click="goToStep('shipping')">
                    Retour
                  </button>
                  <button type="submit" class="btn btn-primary btn-lg">
                    <span v-if="isProcessing" class="spinner"></span>
                    <span v-else>Confirmer la commande</span>
                  </button>
                </div>
              </form>
            </div>

            <!-- Étape 3: Confirmation -->
            <div v-if="currentStep === 'confirmation'" class="step-content">
              <div class="confirmation-success">
                <div class="success-icon">✅</div>
                <h2 class="success-title">Commande confirmée !</h2>
                <p class="success-text">
                  Votre commande a été traitée avec succès. Vous recevrez un email de confirmation sous peu.
                </p>
                <div class="order-details">
                  <p><strong>Numéro de commande :</strong> {{ orderNumber }}</p>
                  <p><strong>Total :</strong> {{ formatPrice(finalTotal) }}</p>
                  <p><strong>Date :</strong> {{ formatDate(new Date()) }}</p>
                </div>
                <div class="confirmation-actions">
                  <router-link to="/orders" class="btn btn-primary">
                    Voir mes commandes
                  </router-link>
                  <router-link to="/products" class="btn btn-outline">
                    Continuer mes achats
                  </router-link>
                </div>
              </div>
            </div>
          </div>

          <!-- Résumé de la commande -->
          <div class="checkout-summary">
            <div class="summary-card">
              <h3 class="summary-title">Résumé de la commande</h3>
              
              <!-- Articles -->
              <div class="summary-items">
                <div 
                  v-for="item in cartStore.items" 
                  :key="item.product._id"
                  class="summary-item"
                >
                  <img 
                    :src="item.product.images[0] || '/placeholder-product.jpg'" 
                    :alt="item.product.name"
                    class="item-image"
                  />
                  <div class="item-details">
                    <h4 class="item-name">{{ item.product.name }}</h4>
                    <div class="item-meta">
                      <span class="item-quantity">Quantité: {{ item.quantity }}</span>
                      <span v-if="item.selectedColor" class="item-option">
                        Couleur: {{ getColorName(item.selectedColor) }}
                      </span>
                    </div>
                  </div>
                  <span class="item-price">{{ formatPrice(item.product.price * item.quantity) }}</span>
                </div>
              </div>

              <!-- Totaux -->
              <div class="summary-totals">
                <div class="summary-row">
                  <span class="summary-label">Sous-total</span>
                  <span class="summary-value">{{ formatPrice(cartStore.totalPrice) }}</span>
                </div>
                
                <div class="summary-row">
                  <span class="summary-label">Livraison</span>
                  <span class="summary-value">
                    <span v-if="shippingCost === null" class="shipping-tbd">À calculer</span>
                    <span v-else-if="shippingCost === 0" class="shipping-free">Gratuite</span>
                    <span v-else>{{ formatPrice(shippingCost) }}</span>
                  </span>
                </div>
                
                <div class="summary-row">
                  <span class="summary-label">TVA</span>
                  <span class="summary-value">{{ formatPrice(taxAmount) }}</span>
                </div>
                
                <div class="summary-row total-row">
                  <span class="summary-label">Total</span>
                  <span class="summary-value">{{ formatPrice(finalTotal) }}</span>
                </div>
              </div>

              <!-- Informations de livraison -->
              <div v-if="shippingForm.firstName" class="shipping-info">
                <h4 class="info-title">Livraison</h4>
                <div class="info-content">
                  <p>{{ shippingForm.firstName }} {{ shippingForm.lastName }}</p>
                  <p>{{ shippingForm.address }}</p>
                  <p>{{ shippingForm.postalCode }} {{ shippingForm.city }}</p>
                  <p>{{ getCountryName(shippingForm.country) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import { createValidator, schemas } from '../utils/validation'

// Router et stores
const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

// État local
const currentStep = ref('shipping')
const completedSteps = ref([])
const isProcessing = ref(false)
const orderNumber = ref('')
const shippingCost = ref(null)

// Étapes de commande
const steps = [
  {
    id: 'shipping',
    title: 'Livraison',
    description: 'Informations de livraison'
  },
  {
    id: 'payment',
    title: 'Paiement',
    description: 'Méthode de paiement'
  },
  {
    id: 'confirmation',
    title: 'Confirmation',
    description: 'Récapitulatif'
  }
]

// Formulaire de livraison
const shippingForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
  saveAddress: false
})

// Formulaire de facturation
const billingForm = reactive({
  sameAsShipping: true,
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  postalCode: ''
})

// Formulaire de paiement
const paymentForm = reactive({
  method: 'stripe'
})

// Validation
const validator = createValidator(schemas.checkout)
const errors = reactive({})

// Computed
const taxRate = 0.2 // 20% TVA
const taxAmount = computed(() => cartStore.totalPrice * taxRate)
const finalTotal = computed(() => {
  const subtotal = cartStore.totalPrice
  const tax = taxAmount.value
  const shipping = shippingCost.value || 0
  
  return subtotal + tax + shipping
})

// Fonctions
const validateField = (field) => {
  const isValid = validator.validateField(field, getFieldValue(field))
  if (!isValid) {
    errors[field] = validator.getFieldError(field)
  } else {
    delete errors[field]
  }
}

const getFieldValue = (field) => {
  if (field.startsWith('billing')) {
    return billingForm[field.replace('billing', '').toLowerCase()]
  }
  return shippingForm[field]
}

const handleShippingSubmit = () => {
  const isValid = validator.validate(shippingForm)
  if (!isValid) {
    Object.assign(errors, validator.getErrors())
    return
  }

  completedSteps.value.push('shipping')
  currentStep.value = 'payment'
  calculateShipping()
}

const handlePaymentSubmit = async () => {
  if (!billingForm.sameAsShipping) {
    const billingFields = ['billingFirstName', 'billingLastName', 'billingAddress', 'billingCity', 'billingPostalCode']
    const billingFormData = {
      firstName: billingForm.firstName,
      lastName: billingForm.lastName,
      address: billingForm.address,
      city: billingForm.city,
      postalCode: billingForm.postalCode
    }
    
    const isValid = validator.validate(billingFormData)
    if (!isValid) {
      Object.assign(errors, validator.getErrors())
      return
    }
  }

  try {
    isProcessing.value = true
    
    // TODO: Implémenter le traitement du paiement
    // const result = await processPayment()
    
    // Simulation du traitement
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    orderNumber.value = 'CMD-' + Date.now()
    completedSteps.value.push('payment')
    currentStep.value = 'confirmation'
    
    // Vider le panier après commande réussie
    await cartStore.clearCart()
    
  } catch (error) {
    console.error('Erreur lors du paiement:', error)
    // Gérer l'erreur de paiement
  } finally {
    isProcessing.value = false
  }
}

const handleBillingSameAsShipping = () => {
  if (billingForm.sameAsShipping) {
    billingForm.firstName = shippingForm.firstName
    billingForm.lastName = shippingForm.lastName
    billingForm.address = shippingForm.address
    billingForm.city = shippingForm.city
    billingForm.postalCode = shippingForm.postalCode
  }
}

const goToStep = (step) => {
  currentStep.value = step
}

const calculateShipping = async () => {
  try {
    // TODO: Implémenter le calcul des frais de livraison
    // const result = await cartStore.calculateShipping(shippingForm)
    // shippingCost.value = result.data.shippingCost
    
    // Simulation
    if (cartStore.totalPrice >= 50) {
      shippingCost.value = 0 // Livraison gratuite
    } else {
      shippingCost.value = 4.99 // Frais de livraison standard
    }
  } catch (error) {
    console.error('Erreur lors du calcul des frais de livraison:', error)
  }
}

const getColorName = (color) => {
  const colorMap = {
    black: 'Noir',
    white: 'Blanc',
    blue: 'Bleu',
    red: 'Rouge',
    green: 'Vert',
    pink: 'Rose',
    purple: 'Violet',
    gold: 'Or'
  }
  return colorMap[color] || color
}

const getCountryName = (code) => {
  const countryMap = {
    FR: 'France',
    BE: 'Belgique',
    CH: 'Suisse',
    LU: 'Luxembourg'
  }
  return countryMap[code] || code
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Lifecycle
onMounted(() => {
  // Vérifier l'authentification
  if (!authStore.isAuthenticated) {
    router.push('/login?redirect=/checkout')
    return
  }

  // Charger le panier
  cartStore.loadCartFromStorage()
  
  // Pré-remplir le formulaire avec les données utilisateur
  if (authStore.user) {
    shippingForm.firstName = authStore.user.firstName || ''
    shippingForm.lastName = authStore.user.lastName || ''
    shippingForm.email = authStore.user.email || ''
  }
})
</script>

<style scoped>
/* Page de checkout */
.checkout-page {
  min-height: 100vh;
  background-color: #f8fafc;
  padding: 2rem 0;
}

/* En-tête */
.checkout-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
}

/* Panier vide */
.empty-cart {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-cart-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.empty-cart-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
}

.empty-cart-text {
  color: #6b7280;
  margin: 0 0 2rem 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

/* Contenu du checkout */
.checkout-content {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  padding: 2rem;
}

/* Étapes de commande */
.checkout-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.step {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.75rem;
  transition: all 0.2s ease;
}

.step.active {
  background: #dbeafe;
  border: 1px solid #3b82f6;
}

.step.completed {
  background: #d1fae5;
  border: 1px solid #10b981;
}

.step-number {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: #e5e7eb;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.step.active .step-number {
  background: #3b82f6;
  color: white;
}

.step.completed .step-number {
  background: #10b981;
  color: white;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.25rem 0;
}

.step-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

/* Contenu des étapes */
.step-content {
  padding: 2rem 0;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1.5rem 0;
}

.subsection-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
}

/* Formulaires */
.shipping-form,
.payment-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

.form-input,
.form-select {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error,
.form-select.error {
  border-color: #ef4444;
}

.form-error {
  font-size: 0.75rem;
  color: #ef4444;
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

.payment-radio {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.payment-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.payment-label:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.payment-radio:checked + .payment-label {
  border-color: #3b82f6;
  background: #dbeafe;
}

.payment-icon {
  font-size: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 0.5rem;
}

.payment-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.payment-name {
  font-weight: 600;
  color: #374151;
}

.payment-description {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Section de facturation */
.billing-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.billing-form {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Actions des formulaires */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

/* Confirmation */
.confirmation-success {
  text-align: center;
  padding: 3rem 2rem;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.success-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.success-text {
  color: #6b7280;
  margin: 0 0 2rem 0;
  font-size: 1.125rem;
}

.order-details {
  background: #f9fafb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.order-details p {
  margin: 0 0 0.5rem 0;
  color: #374151;
}

.order-details p:last-child {
  margin-bottom: 0;
}

.confirmation-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Résumé de la commande */
.checkout-summary {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.summary-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.summary-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1.5rem 0;
}

/* Articles du résumé */
.summary-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

.item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 0.375rem;
}

.item-details {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.item-quantity,
.item-option {
  font-size: 0.75rem;
  color: #6b7280;
}

.item-price {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

/* Totaux du résumé */
.summary-totals {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.shipping-tbd {
  color: #6b7280;
  font-style: italic;
}

.shipping-free {
  color: #059669;
  font-weight: 600;
}

/* Informations de livraison */
.shipping-info {
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.info-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem 0;
}

.info-content {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.5;
}

.info-content p {
  margin: 0 0 0.25rem 0;
}

.info-content p:last-child {
  margin-bottom: 0;
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
@media (max-width: 1024px) {
  .checkout-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .checkout-summary {
    order: -1;
  }
}

@media (max-width: 768px) {
  .checkout-page {
    padding: 1rem 0;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .checkout-layout {
    padding: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .confirmation-actions {
    flex-direction: column;
  }
  
  .summary-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .item-details {
    width: 100%;
  }
  
  .item-price {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .checkout-steps {
    gap: 0.75rem;
  }
  
  .step {
    padding: 0.75rem;
  }
  
  .step-number {
    width: 2rem;
    height: 2rem;
    font-size: 0.875rem;
  }
  
  .step-title {
    font-size: 0.875rem;
  }
  
  .step-description {
    font-size: 0.75rem;
  }
}
</style>
