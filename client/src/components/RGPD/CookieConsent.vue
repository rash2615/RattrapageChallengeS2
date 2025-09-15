<template>
  <div v-if="showConsent" class="cookie-consent-overlay">
    <div class="cookie-consent-modal">
      <div class="cookie-header">
        <div class="cookie-icon">🍪</div>
        <h3 class="cookie-title">Gestion des cookies</h3>
      </div>
      
      <div class="cookie-content">
        <p class="cookie-description">
          Nous utilisons des cookies pour améliorer votre expérience sur notre site, 
          analyser le trafic et personnaliser le contenu. En continuant à naviguer, 
          vous acceptez notre utilisation des cookies.
        </p>
        
        <div class="cookie-details">
          <h4 class="details-title">Types de cookies utilisés :</h4>
          <ul class="cookie-types">
            <li class="cookie-type">
              <div class="type-info">
                <span class="type-name">Cookies essentiels</span>
                <span class="type-desc">Nécessaires au fonctionnement du site</span>
              </div>
              <div class="type-status required">Obligatoire</div>
            </li>
            <li class="cookie-type">
              <div class="type-info">
                <span class="type-name">Cookies analytiques</span>
                <span class="type-desc">Pour analyser l'utilisation du site</span>
              </div>
              <div class="cookie-toggle">
                <input 
                  id="analytics" 
                  v-model="consent.analytics" 
                  type="checkbox" 
                  class="toggle-input"
                />
                <label for="analytics" class="toggle-label">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </li>
            <li class="cookie-type">
              <div class="type-info">
                <span class="type-name">Cookies marketing</span>
                <span class="type-desc">Pour personnaliser les publicités</span>
              </div>
              <div class="cookie-toggle">
                <input 
                  id="marketing" 
                  v-model="consent.marketing" 
                  type="checkbox" 
                  class="toggle-input"
                />
                <label for="marketing" class="toggle-label">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </li>
            <li class="cookie-type">
              <div class="type-info">
                <span class="type-name">Cookies de préférences</span>
                <span class="type-desc">Pour mémoriser vos choix</span>
              </div>
              <div class="cookie-toggle">
                <input 
                  id="preferences" 
                  v-model="consent.preferences" 
                  type="checkbox" 
                  class="toggle-input"
                />
                <label for="preferences" class="toggle-label">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="cookie-actions">
        <button 
          class="cookie-btn secondary" 
          @click="showDetails = !showDetails"
        >
          {{ showDetails ? 'Masquer les détails' : 'Voir les détails' }}
        </button>
        
        <div class="cookie-buttons">
          <button 
            class="cookie-btn reject" 
            @click="rejectAll"
          >
            Refuser tout
          </button>
          <button 
            class="cookie-btn accept" 
            @click="acceptAll"
          >
            Accepter tout
          </button>
          <button 
            class="cookie-btn primary" 
            @click="savePreferences"
          >
            Enregistrer mes choix
          </button>
        </div>
      </div>
      
      <div v-if="showDetails" class="cookie-details-expanded">
        <h4 class="details-title">Informations détaillées</h4>
        <div class="details-content">
          <div class="detail-section">
            <h5>Cookies essentiels</h5>
            <p>Ces cookies sont nécessaires au fonctionnement de base du site web. Ils ne peuvent pas être désactivés.</p>
            <ul>
              <li>Session utilisateur</li>
              <li>Préférences de langue</li>
              <li>Panier d'achat</li>
            </ul>
          </div>
          
          <div class="detail-section">
            <h5>Cookies analytiques</h5>
            <p>Ces cookies nous aident à comprendre comment les visiteurs interagissent avec notre site web.</p>
            <ul>
              <li>Google Analytics</li>
              <li>Statistiques de navigation</li>
              <li>Métriques de performance</li>
            </ul>
          </div>
          
          <div class="detail-section">
            <h5>Cookies marketing</h5>
            <p>Ces cookies sont utilisés pour diffuser des publicités plus pertinentes pour vous.</p>
            <ul>
              <li>Publicités ciblées</li>
              <li>Réseaux sociaux</li>
              <li>Partenaires publicitaires</li>
            </ul>
          </div>
          
          <div class="detail-section">
            <h5>Cookies de préférences</h5>
            <p>Ces cookies permettent au site web de se souvenir de vos choix.</p>
            <ul>
              <li>Thème (clair/sombre)</li>
              <li>Préférences d'affichage</li>
              <li>Paramètres de notification</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

// État local
const showConsent = ref(false)
const showDetails = ref(false)
const consent = reactive({
  essential: true, // Toujours true
  analytics: false,
  marketing: false,
  preferences: false
})

// Vérifier si le consentement a déjà été donné
onMounted(() => {
  const savedConsent = localStorage.getItem('cookie-consent')
  if (!savedConsent) {
    showConsent.value = true
  } else {
    const parsedConsent = JSON.parse(savedConsent)
    Object.assign(consent, parsedConsent)
  }
  
  // Écouter l'événement pour afficher le consentement
  window.addEventListener('show-cookie-consent', () => {
    showConsent.value = true
  })
})

// Accepter tous les cookies
const acceptAll = () => {
  consent.analytics = true
  consent.marketing = true
  consent.preferences = true
  savePreferences()
}

// Refuser tous les cookies non essentiels
const rejectAll = () => {
  consent.analytics = false
  consent.marketing = false
  consent.preferences = false
  savePreferences()
}

// Sauvegarder les préférences
const savePreferences = () => {
  localStorage.setItem('cookie-consent', JSON.stringify(consent))
  localStorage.setItem('cookie-consent-date', new Date().toISOString())
  showConsent.value = false
  
  // Émettre un événement pour informer les autres composants
  window.dispatchEvent(new CustomEvent('cookie-consent-updated', {
    detail: consent
  }))
  
  // Initialiser les services selon le consentement
  initializeServices()
}

// Initialiser les services selon le consentement
const initializeServices = () => {
  if (consent.analytics) {
    // Initialiser Google Analytics ou autre service d'analyse
    console.log('Analytics activé')
  }
  
  if (consent.marketing) {
    // Initialiser les services marketing
    console.log('Marketing activé')
  }
  
  if (consent.preferences) {
    // Initialiser les préférences utilisateur
    console.log('Préférences activées')
  }
}
</script>

<style scoped>
/* Overlay */
.cookie-consent-overlay {
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

/* Modal */
.cookie-consent-modal {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
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

/* Header */
.cookie-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.cookie-icon {
  font-size: 2rem;
}

.cookie-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

/* Content */
.cookie-content {
  padding: 1.5rem;
}

.cookie-description {
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
}

.cookie-details {
  margin-top: 1rem;
}

.details-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
}

.cookie-types {
  list-style: none;
  padding: 0;
  margin: 0;
}

.cookie-type {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  background: #f9fafb;
}

.type-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.type-name {
  font-weight: 500;
  color: #374151;
}

.type-desc {
  font-size: 0.875rem;
  color: #6b7280;
}

.type-status {
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.type-status.required {
  background: #fef3c7;
  color: #92400e;
}

/* Toggle */
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

/* Actions */
.cookie-actions {
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cookie-buttons {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  flex-wrap: wrap;
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

.cookie-btn.primary {
  background: #3b82f6;
  color: white;
}

.cookie-btn.primary:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.cookie-btn.accept {
  background: #10b981;
  color: white;
}

.cookie-btn.accept:hover {
  background: #059669;
  transform: translateY(-1px);
}

.cookie-btn.reject {
  background: #ef4444;
  color: white;
}

.cookie-btn.reject:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.cookie-btn.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.cookie-btn.secondary:hover {
  background: #e5e7eb;
}

/* Détails étendus */
.cookie-details-expanded {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.details-content {
  display: grid;
  gap: 1.5rem;
}

.detail-section h5 {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.detail-section p {
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 0.75rem 0;
}

.detail-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.detail-section li {
  padding: 0.25rem 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.detail-section li::before {
  content: '•';
  color: #3b82f6;
  font-weight: bold;
  margin-right: 0.5rem;
}

/* Responsive */
@media (max-width: 640px) {
  .cookie-consent-modal {
    margin: 1rem;
    max-width: none;
  }
  
  .cookie-buttons {
    flex-direction: column;
  }
  
  .cookie-btn {
    width: 100%;
  }
  
  .cookie-type {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .cookie-toggle {
    align-self: flex-end;
  }
}
</style>
