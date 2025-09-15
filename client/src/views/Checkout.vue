<template>
  <div class="checkout-page">
    <div class="container">
      <h2 class="mb-4">Finaliser la commande</h2>
      
      <!-- Panier vide -->
      <div v-if="cartStore.isEmpty" class="empty-cart text-center py-5">
        <div class="empty-cart-icon mb-3">🛒</div>
        <h4>Votre panier est vide</h4>
        <p class="text-muted mb-4">Ajoutez des produits à votre panier avant de passer commande</p>
        <router-link to="/products" class="btn btn-primary">
          Voir nos produits
        </router-link>
      </div>
      
      <!-- Formulaire de commande -->
      <div v-else class="row">
        <div class="col-lg-8">
          <form @submit.prevent="handleSubmit">
            <!-- Adresses -->
            <div class="checkout-section">
              <h4>Adresses</h4>
              
              <!-- Adresse de facturation -->
              <div class="address-section">
                <h5>Adresse de facturation</h5>
                <div class="row">
                  <div class="col-md-6">
                    <div class="form-group mb-3">
                      <label class="form-label">Rue *</label>
                      <input
                        type="text"
                        v-model="billingAddress.street"
                        class="form-control"
                        :class="{ 'is-invalid': errors['billingAddress.street'] }"
                        required
                      />
                      <div v-if="errors['billingAddress.street']" class="invalid-feedback">
                        {{ errors['billingAddress.street'] }}
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group mb-3">
                      <label class="form-label">Ville *</label>
                      <input
                        type="text"
                        v-model="billingAddress.city"
                        class="form-control"
                        :class="{ 'is-invalid': errors['billingAddress.city'] }"
                        required
                      />
                      <div v-if="errors['billingAddress.city']" class="invalid-feedback">
                        {{ errors['billingAddress.city'] }}
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group mb-3">
                      <label class="form-label">Code postal *</label>
                      <input
                        type="text"
                        v-model="billingAddress.postalCode"
                        class="form-control"
                        :class="{ 'is-invalid': errors['billingAddress.postalCode'] }"
                        required
                      />
                      <div v-if="errors['billingAddress.postalCode']" class="invalid-feedback">
                        {{ errors['billingAddress.postalCode'] }}
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="form-group mb-3">
                      <label class="form-label">Pays *</label>
                      <input
                        type="text"
                        v-model="billingAddress.country"
                        class="form-control"
                        :class="{ 'is-invalid': errors['billingAddress.country'] }"
                        required
                      />
                      <div v-if="errors['billingAddress.country']" class="invalid-feedback">
                        {{ errors['billingAddress.country'] }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Adresse de livraison -->
              <div class="address-section">
                <div class="form-check mb-3">
                  <input
                    type="checkbox"
                    id="sameAddress"
                    v-model="sameAddress"
                    class="form-check-input"
                    @change="updateShippingAddress"
                  />
                  <label for="sameAddress" class="form-check-label">
                    Même adresse de livraison
                  </label>
                </div>
                
                <div v-if="!sameAddress">
                  <h5>Adresse de livraison</h5>
                  <div class="row">
                    <div class="col-md-6">
                      <div class="form-group mb-3">
                        <label class="form-label">Rue *</label>
                        <input
                          type="text"
                          v-model="shippingAddress.street"
                          class="form-control"
                          :class="{ 'is-invalid': errors['shippingAddress.street'] }"
                          required
                        />
                        <div v-if="errors['shippingAddress.street']" class="invalid-feedback">
                          {{ errors['shippingAddress.street'] }}
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group mb-3">
                        <label class="form-label">Ville *</label>
                        <input
                          type="text"
                          v-model="shippingAddress.city"
                          class="form-control"
                          :class="{ 'is-invalid': errors['shippingAddress.city'] }"
                          required
                        />
                        <div v-if="errors['shippingAddress.city']" class="invalid-feedback">
                          {{ errors['shippingAddress.city'] }}
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group mb-3">
                        <label class="form-label">Code postal *</label>
                        <input
                          type="text"
                          v-model="shippingAddress.postalCode"
                          class="form-control"
                          :class="{ 'is-invalid': errors['shippingAddress.postalCode'] }"
                          required
                        />
                        <div v-if="errors['shippingAddress.postalCode']" class="invalid-feedback">
                          {{ errors['shippingAddress.postalCode'] }}
                        </div>
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group mb-3">
                        <label class="form-label">Pays *</label>
                        <input
                          type="text"
                          v-model="shippingAddress.country"
                          class="form-control"
                          :class="{ 'is-invalid': errors['shippingAddress.country'] }"
                          required
                        />
                        <div v-if="errors['shippingAddress.country']" class="invalid-feedback">
                          {{ errors['shippingAddress.country'] }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Méthode de paiement -->
            <div class="checkout-section">
              <h4>Méthode de paiement</h4>
              <div class="payment-methods">
                <div class="form-check mb-3">
                  <input
                    type="radio"
                    id="stripe"
                    v-model="paymentMethod"
                    value="stripe"
                    class="form-check-input"
                  />
                  <label for="stripe" class="form-check-label">
                    <div class="payment-option">
                      <span class="payment-icon">💳</span>
                      <span>Paiement par carte bancaire (Stripe)</span>
                    </div>
                  </label>
                </div>
                <div class="form-check">
                  <input
                    type="radio"
                    id="paypal"
                    v-model="paymentMethod"
                    value="paypal"
                    class="form-check-input"
                  />
                  <label for="paypal" class="form-check-label">
                    <div class="payment-option">
                      <span class="payment-icon">🅿️</span>
                      <span>Paiement par PayPal</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            
            <!-- Erreurs -->
            <div v-if="error" class="alert alert-danger">
              {{ error }}
            </div>
            
            <!-- Boutons -->
            <div class="checkout-actions">
              <router-link to="/cart" class="btn btn-outline-secondary">
                Retour au panier
              </router-link>
              <button 
                type="submit" 
                class="btn btn-primary btn-lg"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                Créer la commande
              </button>
            </div>
          </form>
        </div>
        
        <!-- Résumé de commande -->
        <div class="col-lg-4">
          <div class="order-summary">
            <h5>Résumé de la commande</h5>
            
            <div class="cart-items-summary">
              <div 
                v-for="item in cartStore.items" 
                :key="item.product._id"
                class="summary-item"
              >
                <div class="item-info">
                  <div class="item-name">{{ item.product.name }}</div>
                  <div class="item-quantity">Quantité: {{ item.quantity }}</div>
                </div>
                <div class="item-price">{{ (item.product.price * item.quantity).toFixed(2) }}€</div>
              </div>
            </div>
            
            <hr>
            
            <div class="summary-line">
              <span>Sous-total ({{ cartStore.itemCount }} article(s))</span>
              <span>{{ cartStore.total.toFixed(2) }}€</span>
            </div>
            
            <div class="summary-line">
              <span>Livraison</span>
              <span>{{ shippingCost.toFixed(2) }}€</span>
            </div>
            
            <div class="summary-line">
              <span>TVA (20%)</span>
              <span>{{ tax.toFixed(2) }}€</span>
            </div>
            
            <hr>
            
            <div class="summary-line total">
              <span><strong>Total</strong></span>
              <span><strong>{{ totalWithTax.toFixed(2) }}€</strong></span>
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
import api from '../services/api'
import { z } from 'zod'

const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref('')
const sameAddress = ref(true)
const paymentMethod = ref('stripe')
const errors = ref({})

const billingAddress = reactive({
  street: '',
  city: '',
  postalCode: '',
  country: 'France'
})

const shippingAddress = reactive({
  street: '',
  city: '',
  postalCode: '',
  country: 'France'
})

// Calculs
const shippingCost = computed(() => {
  return cartStore.total > 100 ? 0 : 10
})

const tax = computed(() => {
  return cartStore.total * 0.2
})

const totalWithTax = computed(() => {
  return cartStore.total + shippingCost.value + tax.value
})

// Schéma de validation
const checkoutSchema = z.object({
  billingAddress: z.object({
    street: z.string().min(1, 'Rue requise'),
    city: z.string().min(1, 'Ville requise'),
    postalCode: z.string().min(1, 'Code postal requis'),
    country: z.string().min(1, 'Pays requis')
  }),
  shippingAddress: z.object({
    street: z.string().min(1, 'Rue requise'),
    city: z.string().min(1, 'Ville requise'),
    postalCode: z.string().min(1, 'Code postal requis'),
    country: z.string().min(1, 'Pays requis')
  }),
  paymentMethod: z.enum(['stripe', 'paypal'])
})

const validateForm = () => {
  try {
    const data = {
      billingAddress,
      shippingAddress: sameAddress.value ? billingAddress : shippingAddress,
      paymentMethod: paymentMethod.value
    }
    
    checkoutSchema.parse(data)
    errors.value = {}
    return true
  } catch (validationError) {
    const newErrors = {}
    validationError.errors.forEach(err => {
      const path = err.path.join('.')
      newErrors[path] = err.message
    })
    errors.value = newErrors
    return false
  }
}

const updateShippingAddress = () => {
  if (sameAddress.value) {
    Object.assign(shippingAddress, billingAddress)
  }
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  loading.value = true
  error.value = ''
  
  try {
    const orderData = {
      billingAddress,
      shippingAddress: sameAddress.value ? billingAddress : shippingAddress,
      paymentMethod: paymentMethod.value
    }
    
    const response = await api.post('/orders/create', orderData)
    
    if (response.data.paymentIntent) {
      // Rediriger vers le paiement Stripe
      // TODO: Implémenter l'intégration Stripe
      console.log('Payment Intent:', response.data.paymentIntent)
    }
    
    // Rediriger vers la page de commande
    router.push(`/order/${response.data.order._id}`)
    
  } catch (err) {
    error.value = err.response?.data?.message || 'Erreur lors de la création de la commande'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // Vérifier que l'utilisateur est connecté
  if (!authStore.isAuthenticated) {
    router.push('/login?redirect=/checkout')
    return
  }
  
  // Fusionner le panier de session avec le panier utilisateur
  cartStore.mergeCart()
  
  // Initialiser l'adresse de livraison
  updateShippingAddress()
})
</script>

<style scoped>
.checkout-page {
  padding: 2rem 0;
}

.empty-cart {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 3rem;
}

.empty-cart-icon {
  font-size: 4rem;
}

.checkout-section {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 2rem;
  margin-bottom: 2rem;
}

.address-section {
  margin-bottom: 2rem;
}

.address-section:last-child {
  margin-bottom: 0;
}

.payment-methods {
  margin-top: 1rem;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  transition: all 0.2s ease-in-out;
}

.payment-option:hover {
  background-color: #f8f9fa;
}

.payment-icon {
  font-size: 1.5rem;
}

.form-check-input:checked + .form-check-label .payment-option {
  border-color: var(--primary-color);
  background-color: #e3f2fd;
}

.checkout-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
}

.order-summary {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 1.5rem;
  position: sticky;
  top: 100px;
}

.cart-items-summary {
  margin-bottom: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f8f9fa;
}

.summary-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.item-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.item-quantity {
  font-size: 0.875rem;
  color: #666;
}

.item-price {
  font-weight: 600;
  color: var(--primary-color);
}

.summary-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.summary-line.total {
  font-size: 1.1rem;
  margin-top: 0.5rem;
}

.spinner-border {
  width: 1rem;
  height: 1rem;
  border-width: 0.125rem;
}

@keyframes spinner-border {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .checkout-actions {
    flex-direction: column;
  }
  
  .checkout-actions .btn {
    width: 100%;
  }
  
  .order-summary {
    position: static;
    margin-top: 2rem;
  }
}
</style>
