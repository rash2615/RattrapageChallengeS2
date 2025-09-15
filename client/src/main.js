/**
 * Point d'entrée principal de l'application SPARK
 * Configuration Vue.js avec Pinia et Vue Router
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'

// Créer l'application Vue
const app = createApp(App)

// Configuration Pinia pour la gestion d'état
const pinia = createPinia()
app.use(pinia)

// Configuration du routeur
app.use(router)

// Montage de l'application
app.mount('#app')

// Configuration globale des erreurs
app.config.errorHandler = (err, vm, info) => {
  console.error('Erreur Vue:', err)
  console.error('Info:', info)
  
  // Ici on pourrait envoyer l'erreur à un service de monitoring
  if (process.env.NODE_ENV === 'production') {
    // En production, on pourrait envoyer l'erreur à Sentry ou autre
    console.error('Erreur en production:', err.message)
  }
}

// Configuration globale des warnings
app.config.warnHandler = (msg, vm, trace) => {
  console.warn('Warning Vue:', msg)
  console.warn('Trace:', trace)
}

// Configuration des performances en développement
if (process.env.NODE_ENV === 'development') {
  app.config.performance = true
}

console.log('🚀 Application SPARK démarrée')
console.log('📱 E-commerce de produits téléphoniques')
console.log('🌍 Environnement:', process.env.NODE_ENV || 'development')
