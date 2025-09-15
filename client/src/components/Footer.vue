<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <!-- Informations principales -->
        <div class="footer-section">
          <div class="footer-brand">
            <div class="logo">
              <span class="logo-icon">⚡</span>
              <span class="logo-text">SPARK</span>
            </div>
            <p class="footer-description">
              Votre boutique en ligne spécialisée dans les produits téléphoniques. 
              Chargeurs, coques, câbles, écouteurs et accessoires de qualité.
            </p>
            <div class="social-links">
              <a href="#" class="social-link" aria-label="Facebook">
                <span class="social-icon">📘</span>
              </a>
              <a href="#" class="social-link" aria-label="Twitter">
                <span class="social-icon">🐦</span>
              </a>
              <a href="#" class="social-link" aria-label="Instagram">
                <span class="social-icon">📷</span>
              </a>
              <a href="#" class="social-link" aria-label="YouTube">
                <span class="social-icon">📺</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Liens rapides -->
        <div class="footer-section">
          <h3 class="footer-title">Liens rapides</h3>
          <ul class="footer-links">
            <li><router-link to="/" class="footer-link">Accueil</router-link></li>
            <li><router-link to="/products" class="footer-link">Produits</router-link></li>
            <li><router-link to="/products?category=chargers" class="footer-link">Chargeurs</router-link></li>
            <li><router-link to="/products?category=cases" class="footer-link">Coques</router-link></li>
            <li><router-link to="/products?category=cables" class="footer-link">Câbles</router-link></li>
            <li><router-link to="/products?category=headphones" class="footer-link">Écouteurs</router-link></li>
          </ul>
        </div>

        <!-- Mon compte -->
        <div class="footer-section">
          <h3 class="footer-title">Mon compte</h3>
          <ul class="footer-links">
            <li v-if="!authStore.isAuthenticated">
              <router-link to="/login" class="footer-link">Connexion</router-link>
            </li>
            <li v-if="!authStore.isAuthenticated">
              <router-link to="/register" class="footer-link">Inscription</router-link>
            </li>
            <li v-if="authStore.isAuthenticated">
              <router-link to="/profile" class="footer-link">Mon profil</router-link>
            </li>
            <li v-if="authStore.isAuthenticated">
              <router-link to="/orders" class="footer-link">Mes commandes</router-link>
            </li>
            <li v-if="authStore.isAuthenticated">
              <router-link to="/cart" class="footer-link">Mon panier</router-link>
            </li>
            <li v-if="authStore.isAdmin">
              <router-link to="/admin" class="footer-link">Administration</router-link>
            </li>
          </ul>
        </div>

        <!-- Support -->
        <div class="footer-section">
          <h3 class="footer-title">Support</h3>
          <ul class="footer-links">
            <li><a href="#" class="footer-link">Centre d'aide</a></li>
            <li><a href="#" class="footer-link">Contact</a></li>
            <li><a href="#" class="footer-link">Livraison</a></li>
            <li><a href="#" class="footer-link">Retours</a></li>
            <li><a href="#" class="footer-link">Garantie</a></li>
            <li><a href="#" class="footer-link">FAQ</a></li>
          </ul>
        </div>

        <!-- Informations légales -->
        <div class="footer-section">
          <h3 class="footer-title">Informations</h3>
          <ul class="footer-links">
            <li><a href="#" class="footer-link">À propos</a></li>
            <li><a href="#" class="footer-link">Mentions légales</a></li>
            <li><a href="#" class="footer-link">Politique de confidentialité</a></li>
            <li><a href="#" class="footer-link">CGV</a></li>
            <li><a href="#" class="footer-link">RGPD</a></li>
            <li><a href="#" class="footer-link">Cookies</a></li>
          </ul>
        </div>
      </div>

      <!-- Newsletter -->
      <div class="footer-newsletter">
        <div class="newsletter-content">
          <div class="newsletter-text">
            <h3 class="newsletter-title">Restez informé</h3>
            <p class="newsletter-description">
              Recevez nos dernières offres et nouveautés par email
            </p>
          </div>
          <form @submit.prevent="handleNewsletter" class="newsletter-form">
            <div class="newsletter-input-group">
              <input
                v-model="newsletterEmail"
                type="email"
                placeholder="Votre adresse email"
                class="newsletter-input"
                required
              />
              <button type="submit" class="newsletter-button" :disabled="isNewsletterLoading">
                <span v-if="isNewsletterLoading" class="spinner"></span>
                <span v-else>S'abonner</span>
              </button>
            </div>
            <div v-if="newsletterMessage" class="newsletter-message" :class="newsletterMessageType">
              {{ newsletterMessage }}
            </div>
          </form>
        </div>
      </div>

      <!-- Informations de contact -->
      <div class="footer-contact">
        <div class="contact-info">
          <div class="contact-item">
            <span class="contact-icon">📧</span>
            <span>contact@spark.com</span>
          </div>
          <div class="contact-item">
            <span class="contact-icon">📞</span>
            <span>01 23 45 67 89</span>
          </div>
          <div class="contact-item">
            <span class="contact-icon">📍</span>
            <span>123 Rue de la Paix, 75001 Paris</span>
          </div>
        </div>
      </div>

      <!-- Barre de séparation -->
      <div class="footer-divider"></div>

      <!-- Copyright et mentions légales -->
      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <div class="copyright">
            <p>&copy; {{ currentYear }} SPARK. Tous droits réservés.</p>
          </div>
          <div class="footer-bottom-links">
            <a href="#" class="footer-bottom-link">Mentions légales</a>
            <a href="#" class="footer-bottom-link">Politique de confidentialité</a>
            <a href="#" class="footer-bottom-link">CGV</a>
            <a href="#" class="footer-bottom-link">Cookies</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

// Store
const authStore = useAuthStore()

// État local
const newsletterEmail = ref('')
const isNewsletterLoading = ref(false)
const newsletterMessage = ref('')
const newsletterMessageType = ref('')

// Computed
const currentYear = computed(() => new Date().getFullYear())

// Fonctions
const handleNewsletter = async () => {
  if (!newsletterEmail.value) return

  try {
    isNewsletterLoading.value = true
    newsletterMessage.value = ''

    const response = await api.post('/newsletter/subscribe', {
      email: newsletterEmail.value
    })

    if (response.data.success) {
      newsletterMessage.value = 'Inscription réussie ! Merci de votre abonnement.'
      newsletterMessageType.value = 'success'
      newsletterEmail.value = ''
    } else {
      throw new Error(response.data.message || 'Erreur lors de l\'inscription')
    }

  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Erreur lors de l\'inscription'
    newsletterMessage.value = errorMessage
    newsletterMessageType.value = 'error'
  } finally {
    isNewsletterLoading.value = false
  }
}
</script>

<style scoped>
/* Styles du footer */
.footer {
  background-color: var(--gray-900);
  color: var(--gray-300);
  margin-top: auto;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  gap: var(--spacing-8);
  padding: var(--spacing-12) 0;
}

.footer-section {
  display: flex;
  flex-direction: column;
}

.footer-brand {
  max-width: 300px;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
}

.logo-icon {
  font-size: var(--font-size-2xl);
}

.logo-text {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--white);
}

.footer-description {
  color: var(--gray-400);
  line-height: 1.6;
  margin-bottom: var(--spacing-6);
}

.social-links {
  display: flex;
  gap: var(--spacing-3);
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--gray-800);
  color: var(--gray-400);
  border-radius: 50%;
  text-decoration: none;
  transition: all var(--transition-fast);
}

.social-link:hover {
  background-color: var(--primary-color);
  color: var(--white);
  transform: translateY(-2px);
}

.social-icon {
  font-size: var(--font-size-lg);
}

.footer-title {
  color: var(--white);
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--spacing-4);
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: var(--spacing-2);
}

.footer-link {
  color: var(--gray-400);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-link:hover {
  color: var(--white);
}

/* Newsletter */
.footer-newsletter {
  background-color: var(--gray-800);
  padding: var(--spacing-8) 0;
  margin: var(--spacing-8) 0;
  border-radius: var(--border-radius-lg);
}

.newsletter-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-6);
}

.newsletter-text {
  flex: 1;
}

.newsletter-title {
  color: var(--white);
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin-bottom: var(--spacing-2);
}

.newsletter-description {
  color: var(--gray-400);
  margin: 0;
}

.newsletter-form {
  flex: 1;
  max-width: 400px;
}

.newsletter-input-group {
  display: flex;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
}

.newsletter-input {
  flex: 1;
  padding: var(--spacing-3) var(--spacing-4);
  background-color: var(--gray-700);
  border: 1px solid var(--gray-600);
  border-radius: var(--border-radius);
  color: var(--white);
  font-size: var(--font-size-sm);
}

.newsletter-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.1);
}

.newsletter-input::placeholder {
  color: var(--gray-500);
}

.newsletter-button {
  padding: var(--spacing-3) var(--spacing-6);
  background-color: var(--primary-color);
  color: var(--white);
  border: none;
  border-radius: var(--border-radius);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  white-space: nowrap;
}

.newsletter-button:hover:not(:disabled) {
  background-color: var(--primary-dark);
}

.newsletter-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.newsletter-message {
  font-size: var(--font-size-sm);
  padding: var(--spacing-2);
  border-radius: var(--border-radius);
}

.newsletter-message.success {
  background-color: rgb(16 185 129 / 0.1);
  color: var(--success-color);
  border: 1px solid rgb(16 185 129 / 0.2);
}

.newsletter-message.error {
  background-color: rgb(239 68 68 / 0.1);
  color: var(--error-color);
  border: 1px solid rgb(239 68 68 / 0.2);
}

/* Contact */
.footer-contact {
  padding: var(--spacing-6) 0;
}

.contact-info {
  display: flex;
  gap: var(--spacing-8);
  flex-wrap: wrap;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  color: var(--gray-400);
}

.contact-icon {
  font-size: var(--font-size-lg);
}

/* Divider */
.footer-divider {
  height: 1px;
  background-color: var(--gray-700);
  margin: var(--spacing-6) 0;
}

/* Footer bottom */
.footer-bottom {
  padding: var(--spacing-6) 0;
}

.footer-bottom-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--spacing-4);
}

.copyright {
  color: var(--gray-400);
  font-size: var(--font-size-sm);
}

.footer-bottom-links {
  display: flex;
  gap: var(--spacing-4);
  flex-wrap: wrap;
}

.footer-bottom-link {
  color: var(--gray-400);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: color var(--transition-fast);
}

.footer-bottom-link:hover {
  color: var(--white);
}

/* Responsive */
@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--spacing-6);
  }
  
  .footer-brand {
    grid-column: 1 / -1;
    max-width: none;
  }
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-6);
  }
  
  .footer-brand {
    grid-column: 1 / -1;
  }
  
  .newsletter-content {
    flex-direction: column;
    text-align: center;
  }
  
  .newsletter-form {
    max-width: none;
  }
  
  .newsletter-input-group {
    flex-direction: column;
  }
  
  .contact-info {
    flex-direction: column;
    gap: var(--spacing-4);
  }
  
  .footer-bottom-content {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-4);
  }
  
  .footer-section {
    text-align: center;
  }
  
  .social-links {
    justify-content: center;
  }
  
  .footer-bottom-links {
    justify-content: center;
  }
}
</style>
