<template>
  <div class="profile-page">
    <div class="container">
      <h2 class="mb-4">Mon profil</h2>
      
      <div class="row">
        <div class="col-lg-8">
          <!-- Informations personnelles -->
          <div class="profile-card">
            <h4>Informations personnelles</h4>
            
            <form @submit.prevent="updateProfile">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group mb-3">
                    <label class="form-label">Prénom</label>
                    <input
                      type="text"
                      v-model="profileForm.firstName"
                      class="form-control"
                      :class="{ 'is-invalid': errors.firstName }"
                    />
                    <div v-if="errors.firstName" class="invalid-feedback">
                      {{ errors.firstName }}
                    </div>
                  </div>
                </div>
                
                <div class="col-md-6">
                  <div class="form-group mb-3">
                    <label class="form-label">Nom</label>
                    <input
                      type="text"
                      v-model="profileForm.lastName"
                      class="form-control"
                      :class="{ 'is-invalid': errors.lastName }"
                    />
                    <div v-if="errors.lastName" class="invalid-feedback">
                      {{ errors.lastName }}
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="form-group mb-3">
                <label class="form-label">Email</label>
                <input
                  type="email"
                  v-model="profileForm.email"
                  class="form-control"
                  :class="{ 'is-invalid': errors.email }"
                  disabled
                />
                <small class="form-text text-muted">
                  L'email ne peut pas être modifié
                </small>
              </div>
              
              <div v-if="authStore.error" class="alert alert-danger">
                {{ authStore.error }}
              </div>
              
              <div v-if="successMessage" class="alert alert-success">
                {{ successMessage }}
              </div>
              
              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="authStore.loading"
              >
                <span v-if="authStore.loading" class="spinner-border spinner-border-sm me-2"></span>
                Mettre à jour
              </button>
            </form>
          </div>
          
          <!-- Adresses -->
          <div class="addresses-card">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4>Mes adresses</h4>
              <button class="btn btn-outline-primary" @click="showAddAddressModal = true">
                Ajouter une adresse
              </button>
            </div>
            
            <div v-if="addresses.length === 0" class="text-center py-4">
              <p class="text-muted">Aucune adresse enregistrée</p>
            </div>
            
            <div v-else class="addresses-list">
              <div 
                v-for="(address, index) in addresses" 
                :key="index"
                class="address-item"
              >
                <div class="address-info">
                  <h6>{{ getAddressTypeLabel(address.type) }}</h6>
                  <address>
                    {{ address.street }}<br>
                    {{ address.postalCode }} {{ address.city }}<br>
                    {{ address.country }}
                  </address>
                  <div v-if="address.isDefault" class="default-badge">
                    Adresse par défaut
                  </div>
                </div>
                <div class="address-actions">
                  <button 
                    class="btn btn-sm btn-outline-primary"
                    @click="editAddress(index)"
                  >
                    Modifier
                  </button>
                  <button 
                    class="btn btn-sm btn-outline-danger"
                    @click="deleteAddress(index)"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-4">
          <!-- Statistiques -->
          <div class="stats-card">
            <h5>Mes statistiques</h5>
            
            <div class="stat-item">
              <div class="stat-icon">📦</div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalOrders }}</div>
                <div class="stat-label">Commandes</div>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">💰</div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.totalSpent.toFixed(2) }}€</div>
                <div class="stat-label">Total dépensé</div>
              </div>
            </div>
            
            <div class="stat-item">
              <div class="stat-icon">⭐</div>
              <div class="stat-info">
                <div class="stat-value">{{ stats.averageOrder }}</div>
                <div class="stat-label">Panier moyen</div>
              </div>
            </div>
          </div>
          
          <!-- Actions rapides -->
          <div class="quick-actions-card">
            <h5>Actions rapides</h5>
            
            <div class="action-list">
              <router-link to="/orders" class="action-item">
                <span class="action-icon">📋</span>
                <span>Mes commandes</span>
              </router-link>
              
              <router-link to="/cart" class="action-item">
                <span class="action-icon">🛒</span>
                <span>Mon panier</span>
              </router-link>
              
              <a href="#" class="action-item" @click.prevent="changePassword">
                <span class="action-icon">🔒</span>
                <span>Changer le mot de passe</span>
              </a>
              
              <a href="#" class="action-item" @click.prevent="logout">
                <span class="action-icon">🚪</span>
                <span>Se déconnecter</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modale d'ajout/modification d'adresse -->
    <div v-if="showAddAddressModal" class="modal" @click.self="closeAddressModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ editingAddressIndex !== null ? 'Modifier l\'adresse' : 'Ajouter une adresse' }}
            </h5>
            <button type="button" class="btn-close" @click="closeAddressModal">×</button>
          </div>
          
          <div class="modal-body">
            <form @submit.prevent="saveAddress">
              <div class="form-group mb-3">
                <label class="form-label">Type d'adresse</label>
                <select v-model="addressForm.type" class="form-control">
                  <option value="billing">Facturation</option>
                  <option value="shipping">Livraison</option>
                </select>
              </div>
              
              <div class="form-group mb-3">
                <label class="form-label">Rue</label>
                <input
                  type="text"
                  v-model="addressForm.street"
                  class="form-control"
                  required
                />
              </div>
              
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group mb-3">
                    <label class="form-label">Ville</label>
                    <input
                      type="text"
                      v-model="addressForm.city"
                      class="form-control"
                      required
                    />
                  </div>
                </div>
                
                <div class="col-md-6">
                  <div class="form-group mb-3">
                    <label class="form-label">Code postal</label>
                    <input
                      type="text"
                      v-model="addressForm.postalCode"
                      class="form-control"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div class="form-group mb-3">
                <label class="form-label">Pays</label>
                <input
                  type="text"
                  v-model="addressForm.country"
                  class="form-control"
                  required
                />
              </div>
              
              <div class="form-check mb-3">
                <input
                  type="checkbox"
                  id="isDefault"
                  v-model="addressForm.isDefault"
                  class="form-check-input"
                />
                <label for="isDefault" class="form-check-label">
                  Définir comme adresse par défaut
                </label>
              </div>
            </form>
          </div>
          
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeAddressModal">
              Annuler
            </button>
            <button type="button" class="btn btn-primary" @click="saveAddress">
              {{ editingAddressIndex !== null ? 'Modifier' : 'Ajouter' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { z } from 'zod'

const router = useRouter()
const authStore = useAuthStore()

const profileForm = reactive({
  firstName: '',
  lastName: '',
  email: ''
})

const addresses = ref([])
const stats = ref({
  totalOrders: 0,
  totalSpent: 0,
  averageOrder: 0
})

const errors = ref({})
const successMessage = ref('')
const showAddAddressModal = ref(false)
const editingAddressIndex = ref(null)

const addressForm = reactive({
  type: 'billing',
  street: '',
  city: '',
  postalCode: '',
  country: 'France',
  isDefault: false
})

// Schéma de validation
const profileSchema = z.object({
  firstName: z.string().min(1, 'Prénom requis'),
  lastName: z.string().min(1, 'Nom requis'),
  email: z.string().email('Email invalide')
})

const validateProfile = () => {
  try {
    profileSchema.parse(profileForm)
    errors.value = {}
    return true
  } catch (validationError) {
    const newErrors = {}
    validationError.errors.forEach(err => {
      newErrors[err.path[0]] = err.message
    })
    errors.value = newErrors
    return false
  }
}

const updateProfile = async () => {
  if (!validateProfile()) return
  
  authStore.clearError()
  successMessage.value = ''
  
  const result = await authStore.updateProfile({
    firstName: profileForm.firstName,
    lastName: profileForm.lastName
  })
  
  if (result.success) {
    successMessage.value = 'Profil mis à jour avec succès'
  }
}

const getAddressTypeLabel = (type) => {
  return type === 'billing' ? 'Facturation' : 'Livraison'
}

const editAddress = (index) => {
  editingAddressIndex.value = index
  const address = addresses.value[index]
  Object.assign(addressForm, address)
  showAddAddressModal.value = true
}

const deleteAddress = (index) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) {
    addresses.value.splice(index, 1)
  }
}

const saveAddress = () => {
  if (editingAddressIndex.value !== null) {
    // Modifier l'adresse existante
    addresses.value[editingAddressIndex.value] = { ...addressForm }
  } else {
    // Ajouter une nouvelle adresse
    addresses.value.push({ ...addressForm })
  }
  
  closeAddressModal()
}

const closeAddressModal = () => {
  showAddAddressModal.value = false
  editingAddressIndex.value = null
  Object.assign(addressForm, {
    type: 'billing',
    street: '',
    city: '',
    postalCode: '',
    country: 'France',
    isDefault: false
  })
}

const changePassword = () => {
  // TODO: Implémenter le changement de mot de passe
  alert('Fonctionnalité de changement de mot de passe à implémenter')
}

const logout = () => {
  authStore.logout()
}

onMounted(() => {
  // Vérifier que l'utilisateur est connecté
  if (!authStore.isAuthenticated) {
    router.push('/login?redirect=/profile')
    return
  }
  
  // Initialiser le formulaire avec les données de l'utilisateur
  if (authStore.user) {
    profileForm.firstName = authStore.user.firstName || ''
    profileForm.lastName = authStore.user.lastName || ''
    profileForm.email = authStore.user.email || ''
    
    // Charger les adresses de l'utilisateur
    addresses.value = authStore.user.addresses || []
  }
  
  // TODO: Charger les statistiques de l'utilisateur
  // stats.value = await loadUserStats()
})
</script>

<style scoped>
.profile-page {
  padding: 2rem 0;
}

.profile-card,
.addresses-card,
.stats-card,
.quick-actions-card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  padding: 2rem;
  margin-bottom: 2rem;
}

.addresses-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.address-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
}

.address-info {
  flex-grow: 1;
}

.address-info h6 {
  margin-bottom: 0.5rem;
  color: #333;
}

address {
  font-style: normal;
  line-height: 1.6;
  color: #666;
  margin-bottom: 0.5rem;
}

.default-badge {
  background: #d4edda;
  color: #155724;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.address-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-icon {
  font-size: 2rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.stat-label {
  color: #666;
  font-size: 0.875rem;
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  color: #333;
  text-decoration: none;
  border-radius: var(--border-radius);
  transition: background-color 0.2s ease-in-out;
}

.action-item:hover {
  background-color: #f8f9fa;
  color: var(--primary-color);
}

.action-icon {
  font-size: 1.2rem;
}

.modal {
  display: block;
  background-color: rgba(0, 0, 0, 0.5);
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #aaa;
}

.btn-close:hover {
  color: #000;
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
  .address-item {
    flex-direction: column;
    gap: 1rem;
  }
  
  .address-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
