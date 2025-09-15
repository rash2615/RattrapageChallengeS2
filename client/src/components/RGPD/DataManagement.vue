<template>
  <div class="data-management">
    <div class="data-header">
      <h1 class="data-title">Gestion de vos données personnelles</h1>
      <p class="data-subtitle">Contrôlez vos données conformément au RGPD</p>
    </div>

    <div class="data-content">
      <!-- Vue d'ensemble des données -->
      <section class="data-section">
        <h2 class="section-title">Vos données personnelles</h2>
        
        <div class="data-overview">
          <div class="data-card">
            <div class="card-icon">👤</div>
            <div class="card-content">
              <h3 class="card-title">Informations de compte</h3>
              <p class="card-description">Nom, e-mail, adresse, téléphone</p>
              <div class="card-status">
                <span class="status-indicator active"></span>
                <span class="status-text">Collectées</span>
              </div>
            </div>
          </div>
          
          <div class="data-card">
            <div class="card-icon">🛒</div>
            <div class="card-content">
              <h3 class="card-title">Historique des commandes</h3>
              <p class="card-description">Commandes, produits achetés, montants</p>
              <div class="card-status">
                <span class="status-indicator active"></span>
                <span class="status-text">Collectées</span>
              </div>
            </div>
          </div>
          
          <div class="data-card">
            <div class="card-icon">📊</div>
            <div class="card-content">
              <h3 class="card-title">Données de navigation</h3>
              <p class="card-description">Pages visitées, durée de session</p>
              <div class="card-status">
                <span class="status-indicator active"></span>
                <span class="status-text">Collectées</span>
              </div>
            </div>
          </div>
          
          <div class="data-card">
            <div class="card-icon">📧</div>
            <div class="card-content">
              <h3 class="card-title">Communications</h3>
              <p class="card-description">E-mails, messages de support</p>
              <div class="card-status">
                <span class="status-indicator active"></span>
                <span class="status-text">Collectées</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Actions sur les données -->
      <section class="data-section">
        <h2 class="section-title">Actions sur vos données</h2>
        
        <div class="actions-grid">
          <div class="action-card">
            <div class="action-icon">👁️</div>
            <div class="action-content">
              <h3 class="action-title">Consulter mes données</h3>
              <p class="action-description">Téléchargez un rapport complet de vos données personnelles</p>
              <button class="action-btn primary" @click="downloadData">
                Télécharger
              </button>
            </div>
          </div>
          
          <div class="action-card">
            <div class="action-icon">✏️</div>
            <div class="action-content">
              <h3 class="action-title">Modifier mes données</h3>
              <p class="action-description">Mettez à jour vos informations personnelles</p>
              <button class="action-btn secondary" @click="editData">
                Modifier
              </button>
            </div>
          </div>
          
          <div class="action-card">
            <div class="action-icon">⏸️</div>
            <div class="action-content">
              <h3 class="action-title">Limiter le traitement</h3>
              <p class="action-description">Restreignez l'utilisation de certaines données</p>
              <button class="action-btn warning" @click="limitProcessing">
                Limiter
              </button>
            </div>
          </div>
          
          <div class="action-card">
            <div class="action-icon">🗑️</div>
            <div class="action-content">
              <h3 class="action-title">Supprimer mes données</h3>
              <p class="action-description">Demandez la suppression complète de votre compte</p>
              <button class="action-btn danger" @click="deleteData">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Préférences de communication -->
      <section class="data-section">
        <h2 class="section-title">Préférences de communication</h2>
        
        <div class="preferences-grid">
          <div class="preference-item">
            <div class="preference-info">
              <h4 class="preference-title">E-mails marketing</h4>
              <p class="preference-description">Recevoir des offres et promotions personnalisées</p>
            </div>
            <div class="preference-toggle">
              <input 
                id="marketing" 
                v-model="preferences.marketing" 
                type="checkbox" 
                class="toggle-input"
                @change="updatePreference('marketing', $event.target.checked)"
              />
              <label for="marketing" class="toggle-label">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <div class="preference-item">
            <div class="preference-info">
              <h4 class="preference-title">Notifications push</h4>
              <p class="preference-description">Recevoir des notifications sur votre navigateur</p>
            </div>
            <div class="preference-toggle">
              <input 
                id="notifications" 
                v-model="preferences.notifications" 
                type="checkbox" 
                class="toggle-input"
                @change="updatePreference('notifications', $event.target.checked)"
              />
              <label for="notifications" class="toggle-label">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <div class="preference-item">
            <div class="preference-info">
              <h4 class="preference-title">SMS promotionnels</h4>
              <p class="preference-description">Recevoir des offres par SMS</p>
            </div>
            <div class="preference-toggle">
              <input 
                id="sms" 
                v-model="preferences.sms" 
                type="checkbox" 
                class="toggle-input"
                @change="updatePreference('sms', $event.target.checked)"
              />
              <label for="sms" class="toggle-label">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <div class="preference-item">
            <div class="preference-info">
              <h4 class="preference-title">E-mails transactionnels</h4>
              <p class="preference-description">Recevoir les confirmations de commande et factures</p>
            </div>
            <div class="preference-toggle">
              <input 
                id="transactional" 
                v-model="preferences.transactional" 
                type="checkbox" 
                class="toggle-input"
                disabled
              />
              <label for="transactional" class="toggle-label disabled">
                <span class="toggle-slider"></span>
              </label>
            </div>
            <span class="preference-note">Obligatoire pour le traitement des commandes</span>
          </div>
        </div>
      </section>

      <!-- Cookies et tracking -->
      <section class="data-section">
        <h2 class="section-title">Cookies et suivi</h2>
        
        <div class="cookies-overview">
          <div class="cookie-category">
            <h4 class="category-title">Cookies essentiels</h4>
            <p class="category-description">Nécessaires au fonctionnement du site</p>
            <div class="cookie-status required">Toujours actifs</div>
          </div>
          
          <div class="cookie-category">
            <h4 class="category-title">Cookies analytiques</h4>
            <p class="category-description">Pour analyser l'utilisation du site</p>
            <div class="cookie-toggle">
              <input 
                id="analytics" 
                v-model="cookieConsent.analytics" 
                type="checkbox" 
                class="toggle-input"
                @change="updateCookieConsent('analytics', $event.target.checked)"
              />
              <label for="analytics" class="toggle-label">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
          
          <div class="cookie-category">
            <h4 class="category-title">Cookies marketing</h4>
            <p class="category-description">Pour personnaliser les publicités</p>
            <div class="cookie-toggle">
              <input 
                id="marketing" 
                v-model="cookieConsent.marketing" 
                type="checkbox" 
                class="toggle-input"
                @change="updateCookieConsent('marketing', $event.target.checked)"
              />
              <label for="marketing" class="toggle-label">
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        
        <div class="cookie-actions">
          <button class="cookie-btn" @click="saveCookiePreferences">
            Enregistrer les préférences
          </button>
          <button class="cookie-btn secondary" @click="resetCookiePreferences">
            Réinitialiser
          </button>
        </div>
      </section>

      <!-- Historique des demandes -->
      <section class="data-section">
        <h2 class="section-title">Historique des demandes</h2>
        
        <div class="requests-list">
          <div 
            v-for="request in dataRequests" 
            :key="request.id"
            class="request-item"
          >
            <div class="request-info">
              <h4 class="request-title">{{ request.title }}</h4>
              <p class="request-description">{{ request.description }}</p>
              <span class="request-date">{{ formatDate(request.date) }}</span>
            </div>
            <div class="request-status" :class="request.status">
              {{ getStatusText(request.status) }}
            </div>
          </div>
        </div>
      </section>

      <!-- Informations légales -->
      <section class="data-section">
        <h2 class="section-title">Informations légales</h2>
        
        <div class="legal-info">
          <div class="legal-item">
            <h4 class="legal-title">Délégué à la protection des données (DPO)</h4>
            <p class="legal-content">
              Email : <a href="mailto:dpo@spark-ecommerce.com">dpo@spark-ecommerce.com</a><br>
              Téléphone : +33 1 23 45 67 89
            </p>
          </div>
          
          <div class="legal-item">
            <h4 class="legal-title">Autorité de contrôle</h4>
            <p class="legal-content">
              CNIL (Commission Nationale de l'Informatique et des Libertés)<br>
              <a href="https://www.cnil.fr" target="_blank" rel="noopener">www.cnil.fr</a>
            </p>
          </div>
          
          <div class="legal-item">
            <h4 class="legal-title">Délai de réponse</h4>
            <p class="legal-content">
              Nous nous engageons à répondre à vos demandes dans un délai maximum de 30 jours.
            </p>
          </div>
        </div>
      </section>
    </div>

    <!-- Modales de confirmation -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Confirmer la suppression</h3>
          <button class="modal-close" @click="closeDeleteModal">×</button>
        </div>
        <div class="modal-body">
          <p>Êtes-vous sûr de vouloir supprimer définitivement votre compte et toutes vos données ?</p>
          <p class="warning-text">Cette action est irréversible.</p>
        </div>
        <div class="modal-actions">
          <button class="modal-btn secondary" @click="closeDeleteModal">
            Annuler
          </button>
          <button class="modal-btn danger" @click="confirmDelete">
            Supprimer définitivement
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

// État local
const preferences = reactive({
  marketing: true,
  notifications: false,
  sms: false,
  transactional: true
})

const cookieConsent = reactive({
  analytics: false,
  marketing: false
})

const dataRequests = ref([
  {
    id: 1,
    title: 'Demande d\'accès aux données',
    description: 'Téléchargement du rapport de données personnelles',
    date: new Date('2024-12-01'),
    status: 'completed'
  },
  {
    id: 2,
    title: 'Modification des préférences',
    description: 'Mise à jour des préférences de communication',
    date: new Date('2024-11-28'),
    status: 'completed'
  },
  {
    id: 3,
    title: 'Demande de suppression',
    description: 'Demande de suppression des données marketing',
    date: new Date('2024-11-15'),
    status: 'pending'
  }
])

const showDeleteModal = ref(false)

// Actions
const downloadData = async () => {
  try {
    // TODO: Implémenter l'API de téléchargement des données
    console.log('Téléchargement des données...')
    
    // Simulation d'un téléchargement
    const data = {
      user: 'Données utilisateur',
      orders: 'Historique des commandes',
      preferences: 'Préférences de communication'
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `mes-donnees-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    alert('Téléchargement des données réussi')
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error)
    alert('Erreur lors du téléchargement des données')
  }
}

const editData = () => {
  // TODO: Rediriger vers la page de modification du profil
  console.log('Modification des données')
  alert('Redirection vers la page de modification du profil')
}

const limitProcessing = () => {
  // TODO: Implémenter la limitation du traitement
  console.log('Limitation du traitement')
  alert('Fonctionnalité en cours de développement')
}

const deleteData = () => {
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
}

const confirmDelete = async () => {
  try {
    // TODO: Implémenter l'API de suppression des données
    console.log('Suppression des données...')
    
    showDeleteModal.value = false
    alert('Demande de suppression enregistrée. Vous recevrez une confirmation par e-mail.')
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    alert('Erreur lors de la suppression des données')
  }
}

const updatePreference = async (key, value) => {
  try {
    // TODO: Implémenter l'API de mise à jour des préférences
    console.log(`Mise à jour de la préférence ${key}:`, value)
    
    // Simulation d'une sauvegarde
    localStorage.setItem(`preference-${key}`, value.toString())
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
  }
}

const updateCookieConsent = async (key, value) => {
  try {
    // TODO: Implémenter l'API de mise à jour du consentement cookies
    console.log(`Mise à jour du consentement cookie ${key}:`, value)
    
    // Simulation d'une sauvegarde
    localStorage.setItem(`cookie-${key}`, value.toString())
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
  }
}

const saveCookiePreferences = () => {
  // TODO: Sauvegarder toutes les préférences de cookies
  console.log('Sauvegarde des préférences de cookies')
  alert('Préférences de cookies sauvegardées')
}

const resetCookiePreferences = () => {
  cookieConsent.analytics = false
  cookieConsent.marketing = false
  console.log('Réinitialisation des préférences de cookies')
}

const formatDate = (date) => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

const getStatusText = (status) => {
  const statusMap = {
    completed: 'Terminé',
    pending: 'En cours',
    rejected: 'Rejeté'
  }
  return statusMap[status] || status
}

// Charger les préférences au montage
onMounted(() => {
  // Charger les préférences depuis le localStorage
  Object.keys(preferences).forEach(key => {
    const saved = localStorage.getItem(`preference-${key}`)
    if (saved !== null) {
      preferences[key] = saved === 'true'
    }
  })
  
  // Charger les préférences de cookies
  Object.keys(cookieConsent).forEach(key => {
    const saved = localStorage.getItem(`cookie-${key}`)
    if (saved !== null) {
      cookieConsent[key] = saved === 'true'
    }
  })
})
</script>

<style scoped>
/* Container principal */
.data-management {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  line-height: 1.6;
  color: #374151;
}

/* Header */
.data-header {
  text-align: center;
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 2px solid #e5e7eb;
}

.data-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.data-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
  margin: 0;
}

/* Sections */
.data-section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

/* Vue d'ensemble des données */
.data-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.data-card {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card-icon {
  font-size: 2rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  border-radius: 0.5rem;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.card-description {
  color: #6b7280;
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
}

.card-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
}

.status-indicator.active {
  background: #10b981;
}

.status-text {
  font-size: 0.875rem;
  color: #6b7280;
}

/* Actions sur les données */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.action-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.action-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.action-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.75rem 0;
}

.action-description {
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  font-size: 0.875rem;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 0.875rem;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn.primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: #6b7280;
  color: white;
}

.action-btn.secondary:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

.action-btn.warning {
  background: #f59e0b;
  color: white;
}

.action-btn.warning:hover {
  background: #d97706;
  transform: translateY(-1px);
}

.action-btn.danger {
  background: #ef4444;
  color: white;
}

.action-btn.danger:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

/* Préférences */
.preferences-grid {
  display: grid;
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.preference-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.preference-info {
  flex: 1;
}

.preference-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.preference-description {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.preference-note {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.5rem;
  display: block;
}

/* Toggle */
.preference-toggle,
.cookie-toggle {
  position: relative;
}

.toggle-input {
  display: none;
}

.toggle-label {
  display: block;
  width: 3rem;
  height: 1.5rem;
  background: #d1d5db;
  border-radius: 1rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  position: relative;
}

.toggle-label.disabled {
  background: #e5e7eb;
  cursor: not-allowed;
}

.toggle-slider {
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 1.25rem;
  height: 1.25rem;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.toggle-input:checked + .toggle-label {
  background: #3b82f6;
}

.toggle-input:checked + .toggle-label .toggle-slider {
  transform: translateX(1.5rem);
}

/* Cookies */
.cookies-overview {
  display: grid;
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.cookie-category {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.category-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.category-description {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.cookie-status {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.cookie-status.required {
  background: #fef3c7;
  color: #92400e;
}

.cookie-actions {
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0;
  justify-content: center;
}

.cookie-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 0.875rem;
}

.cookie-btn:not(.secondary) {
  background: #3b82f6;
  color: white;
}

.cookie-btn:not(.secondary):hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.cookie-btn.secondary {
  background: #6b7280;
  color: white;
}

.cookie-btn.secondary:hover {
  background: #4b5563;
  transform: translateY(-1px);
}

/* Historique des demandes */
.requests-list {
  display: grid;
  gap: 1rem;
  margin: 1.5rem 0;
}

.request-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
}

.request-info {
  flex: 1;
}

.request-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.request-description {
  color: #6b7280;
  margin: 0 0 0.5rem 0;
  font-size: 0.875rem;
}

.request-date {
  color: #9ca3af;
  font-size: 0.75rem;
}

.request-status {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.request-status.completed {
  background: #d1fae5;
  color: #059669;
}

.request-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.request-status.rejected {
  background: #fecaca;
  color: #dc2626;
}

/* Informations légales */
.legal-info {
  display: grid;
  gap: 1.5rem;
  margin: 1.5rem 0;
}

.legal-item {
  background: #f0f9ff;
  padding: 1.5rem;
  border-radius: 0.75rem;
  border-left: 4px solid #0ea5e9;
}

.legal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #0c4a6e;
  margin: 0 0 0.75rem 0;
}

.legal-content {
  color: #075985;
  margin: 0;
  line-height: 1.6;
}

.legal-content a {
  color: #0284c7;
  text-decoration: none;
}

.legal-content a:hover {
  text-decoration: underline;
}

/* Modales */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  color: #6b7280;
  margin: 0 0 1rem 0;
  line-height: 1.6;
}

.warning-text {
  color: #dc2626 !important;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  justify-content: flex-end;
}

.modal-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 0.875rem;
}

.modal-btn.secondary {
  background: #6b7280;
  color: white;
}

.modal-btn.secondary:hover {
  background: #4b5563;
}

.modal-btn.danger {
  background: #ef4444;
  color: white;
}

.modal-btn.danger:hover {
  background: #dc2626;
}

/* Responsive */
@media (max-width: 768px) {
  .data-management {
    padding: 1rem;
  }
  
  .data-title {
    font-size: 2rem;
  }
  
  .data-overview,
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .preference-item,
  .cookie-category,
  .request-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .cookie-actions {
    flex-direction: column;
  }
  
  .cookie-btn {
    width: 100%;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .modal-btn {
    width: 100%;
  }
}
</style>
