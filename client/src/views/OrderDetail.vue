<template>
  <div class="order-detail-page">
    <div class="container mx-auto px-4 py-8">
      <!-- En-tête -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Détails de la commande</h1>
            <p class="text-gray-600">Commande #{{ order?.orderNumber }}</p>
          </div>
          <div class="flex space-x-4">
            <router-link
              to="/orders"
              class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              ← Retour aux commandes
            </router-link>
            <button
              v-if="order?.status === 'delivered'"
              @click="downloadInvoice"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              📄 Télécharger la facture
            </button>
          </div>
        </div>
      </div>

      <!-- Chargement -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <!-- Erreur -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <div class="flex">
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Erreur</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ error }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenu de la commande -->
      <div v-else-if="order" class="space-y-8">
        <!-- Informations générales -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">Informations de la commande</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <dt class="text-sm font-medium text-gray-500">Numéro de commande</dt>
              <dd class="mt-1 text-sm text-gray-900">{{ order.orderNumber }}</dd>
            </div>
            
            <div>
              <dt class="text-sm font-medium text-gray-500">Date de commande</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ formatDate(order.createdAt) }}
              </dd>
            </div>
            
            <div>
              <dt class="text-sm font-medium text-gray-500">Statut</dt>
              <dd class="mt-1">
                <span :class="getStatusClass(order.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ getStatusText(order.status) }}
                </span>
              </dd>
            </div>
            
            <div>
              <dt class="text-sm font-medium text-gray-500">Total</dt>
              <dd class="mt-1 text-sm font-semibold text-gray-900">
                {{ formatPrice(order.total) }}
              </dd>
            </div>
          </div>
        </div>

        <!-- Adresses -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Adresse de livraison -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Adresse de livraison</h3>
            <div class="text-sm text-gray-600">
              <p class="font-medium">{{ order.shippingAddress.name }}</p>
              <p>{{ order.shippingAddress.street }}</p>
              <p>{{ order.shippingAddress.city }}, {{ order.shippingAddress.postalCode }}</p>
              <p>{{ order.shippingAddress.country }}</p>
            </div>
          </div>

          <!-- Adresse de facturation -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Adresse de facturation</h3>
            <div class="text-sm text-gray-600">
              <p class="font-medium">{{ order.billingAddress.name }}</p>
              <p>{{ order.billingAddress.street }}</p>
              <p>{{ order.billingAddress.city }}, {{ order.billingAddress.postalCode }}</p>
              <p>{{ order.billingAddress.country }}</p>
            </div>
          </div>
        </div>

        <!-- Produits commandés -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Produits commandés</h3>
          
          <div class="space-y-4">
            <div
              v-for="item in order.items"
              :key="item.product._id"
              class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
            >
              <!-- Image du produit -->
              <div class="flex-shrink-0">
                <img
                  :src="item.product.images?.[0] || '/placeholder-product.jpg'"
                  :alt="item.product.name"
                  class="w-16 h-16 object-cover rounded-md"
                />
              </div>

              <!-- Informations du produit -->
              <div class="flex-1 min-w-0">
                <h4 class="text-sm font-medium text-gray-900 truncate">
                  {{ item.product.name }}
                </h4>
                <p class="text-sm text-gray-500">
                  {{ item.product.brand }} - {{ item.product.category }}
                </p>
                <p class="text-sm text-gray-500">
                  Quantité: {{ item.quantity }}
                </p>
              </div>

              <!-- Prix -->
              <div class="flex-shrink-0 text-right">
                <p class="text-sm font-medium text-gray-900">
                  {{ formatPrice(item.price) }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ formatPrice(item.price * item.quantity) }} total
                </p>
              </div>

              <!-- Actions -->
              <div class="flex-shrink-0">
                <router-link
                  :to="`/products/${item.product._id}`"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Voir le produit
                </router-link>
              </div>
            </div>
          </div>
        </div>

        <!-- Résumé de la commande -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Résumé de la commande</h3>
          
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Sous-total</span>
              <span class="text-gray-900">{{ formatPrice(order.subtotal) }}</span>
            </div>
            
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Frais de port</span>
              <span class="text-gray-900">{{ formatPrice(order.shippingCost) }}</span>
            </div>
            
            <div v-if="order.tax" class="flex justify-between text-sm">
              <span class="text-gray-600">TVA</span>
              <span class="text-gray-900">{{ formatPrice(order.tax) }}</span>
            </div>
            
            <div v-if="order.discount" class="flex justify-between text-sm text-green-600">
              <span>Remise</span>
              <span>-{{ formatPrice(order.discount) }}</span>
            </div>
            
            <div class="border-t border-gray-200 pt-2">
              <div class="flex justify-between text-base font-semibold">
                <span class="text-gray-900">Total</span>
                <span class="text-gray-900">{{ formatPrice(order.total) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Informations de paiement -->
        <div v-if="order.payment" class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Informations de paiement</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <dt class="text-sm font-medium text-gray-500">Méthode de paiement</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ getPaymentMethodText(order.payment.method) }}
              </dd>
            </div>
            
            <div>
              <dt class="text-sm font-medium text-gray-500">Statut du paiement</dt>
              <dd class="mt-1">
                <span :class="getPaymentStatusClass(order.payment.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                  {{ getPaymentStatusText(order.payment.status) }}
                </span>
              </dd>
            </div>
            
            <div v-if="order.payment.transactionId">
              <dt class="text-sm font-medium text-gray-500">ID de transaction</dt>
              <dd class="mt-1 text-sm text-gray-900 font-mono">
                {{ order.payment.transactionId }}
              </dd>
            </div>
            
            <div v-if="order.payment.paidAt">
              <dt class="text-sm font-medium text-gray-500">Date de paiement</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ formatDate(order.payment.paidAt) }}
              </dd>
            </div>
          </div>
        </div>

        <!-- Suivi de livraison -->
        <div v-if="order.tracking" class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Suivi de livraison</h3>
          
          <div class="space-y-4">
            <div>
              <dt class="text-sm font-medium text-gray-500">Numéro de suivi</dt>
              <dd class="mt-1 text-sm text-gray-900 font-mono">
                {{ order.tracking.trackingNumber }}
              </dd>
            </div>
            
            <div>
              <dt class="text-sm font-medium text-gray-500">Transporteur</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ order.tracking.carrier }}
              </dd>
            </div>
            
            <div v-if="order.tracking.estimatedDelivery">
              <dt class="text-sm font-medium text-gray-500">Livraison estimée</dt>
              <dd class="mt-1 text-sm text-gray-900">
                {{ formatDate(order.tracking.estimatedDelivery) }}
              </dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useOrderStore } from '../stores/orders'
import { showToast } from '../utils/modals'

// Props
const props = defineProps({
  id: {
    type: String,
    required: true
  }
})

// Store et route
const route = useRoute()
const orderStore = useOrderStore()

// État réactif
const order = ref(null)
const isLoading = ref(false)
const error = ref(null)

// Charger les détails de la commande
const loadOrder = async () => {
  isLoading.value = true
  error.value = null

  try {
    const orderId = props.id || route.params.id
    const result = await orderStore.getOrderById(orderId)
    
    if (result.success) {
      order.value = result.data
    } else {
      error.value = result.error || 'Erreur lors du chargement de la commande'
    }
  } catch (err) {
    error.value = 'Erreur lors du chargement de la commande'
  } finally {
    isLoading.value = false
  }
}

// Télécharger la facture
const downloadInvoice = async () => {
  try {
    const result = await orderStore.downloadInvoice(order.value._id)
    
    if (result.success) {
      // Créer un lien de téléchargement
      const blob = new Blob([result.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `facture-${order.value.orderNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      showToast('Facture téléchargée avec succès', 'success')
    } else {
      showToast(result.error || 'Erreur lors du téléchargement de la facture', 'error')
    }
  } catch (err) {
    showToast('Erreur lors du téléchargement de la facture', 'error')
  }
}

// Formater la date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Formater le prix
const formatPrice = (price) => {
  if (typeof price !== 'number') return '0,00 €'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

// Obtenir la classe CSS du statut
const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

// Obtenir le texte du statut
const getStatusText = (status) => {
  const texts = {
    pending: 'En attente de paiement',
    paid: 'Payée',
    processing: 'En cours de traitement',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée'
  }
  return texts[status] || status
}

// Obtenir le texte de la méthode de paiement
const getPaymentMethodText = (method) => {
  const methods = {
    stripe: 'Carte bancaire (Stripe)',
    paypal: 'PayPal',
    bank_transfer: 'Virement bancaire',
    cash: 'Paiement à la livraison'
  }
  return methods[method] || method
}

// Obtenir la classe CSS du statut de paiement
const getPaymentStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

// Obtenir le texte du statut de paiement
const getPaymentStatusText = (status) => {
  const texts = {
    pending: 'En attente',
    paid: 'Payé',
    failed: 'Échoué',
    refunded: 'Remboursé'
  }
  return texts[status] || status
}

// Charger la commande au montage
onMounted(() => {
  loadOrder()
})
</script>

<style scoped>
.order-detail-page {
  min-height: calc(100vh - 200px);
}
</style>
