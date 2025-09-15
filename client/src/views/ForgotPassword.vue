<template>
  <div class="forgot-password-page">
    <div class="container">
      <div class="forgot-container">
        <!-- Logo et titre -->
        <div class="forgot-header">
          <router-link to="/" class="forgot-logo">
            <span class="logo-icon">⚡</span>
            <span class="logo-text">SPARK</span>
          </router-link>
          <h1 class="forgot-title">Mot de passe oublié</h1>
          <p class="forgot-subtitle">
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
        </div>

        <!-- Formulaire -->
        <form @submit.prevent="handleForgotPassword" class="forgot-form">
          <div class="form-group">
            <label for="email" class="form-label">Adresse email</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              class="form-input"
              :class="{ 'error': errors.email }"
              placeholder="votre@email.com"
              required
              autocomplete="email"
              @blur="validateField('email')"
            />
            <div v-if="errors.email" class="form-error">{{ errors.email }}</div>
          </div>

          <!-- Erreur générale -->
          <div v-if="error" class="form-error-general">
            <span class="error-icon">⚠️</span>
            {{ error }}
          </div>

          <!-- Succès -->
          <div v-if="success" class="form-success-general">
            <span class="success-icon">✅</span>
            {{ success }}
          </div>

          <!-- Bouton d'envoi -->
          <button
            type="submit"
            class="btn btn-primary btn-lg forgot-button"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner"></span>
            <span v-else>Envoyer le lien de réinitialisation</span>
          </button>
        </form>

        <!-- Instructions après envoi -->
        <div v-if="emailSent" class="email-sent-info">
          <div class="info-icon">📧</div>
          <div class="info-content">
            <h3 class="info-title">Email envoyé !</h3>
            <p class="info-text">
              Nous avons envoyé un lien de réinitialisation à 
              <strong>{{ formData.email }}</strong>
            </p>
            <p class="info-subtext">
              Vérifiez votre boîte email et cliquez sur le lien pour créer un nouveau mot de passe.
              Le lien est valide pendant 1 heure.
            </p>
          </div>
        </div>

        <!-- Actions -->
        <div class="forgot-actions">
          <router-link to="/login" class="back-to-login">
            ← Retour à la connexion
          </router-link>
          
          <div class="resend-section">
            <p class="resend-text">Vous n'avez pas reçu l'email ?</p>
            <button
              @click="resendEmail"
              class="btn btn-outline resend-button"
              :disabled="isResending || resendCooldown > 0"
            >
              <span v-if="isResending" class="spinner"></span>
              <span v-else-if="resendCooldown > 0">
                Renvoyer dans {{ resendCooldown }}s
              </span>
              <span v-else>Renvoyer l'email</span>
            </button>
          </div>
        </div>

        <!-- Aide -->
        <div class="forgot-help">
          <h4 class="help-title">Besoin d'aide ?</h4>
          <ul class="help-list">
            <li>Vérifiez votre dossier spam ou courrier indésirable</li>
            <li>Assurez-vous que l'adresse email est correcte</li>
            <li>Attendez quelques minutes, l'email peut prendre du temps à arriver</li>
            <li>Contactez notre support si le problème persiste</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { createValidator, schemas } from '../utils/validation'

// Router et store
const router = useRouter()
const authStore = useAuthStore()

// État local
const isLoading = ref(false)
const isResending = ref(false)
const resendCooldown = ref(0)
const emailSent = ref(false)
const error = ref('')
const success = ref('')

// Données du formulaire
const formData = reactive({
  email: ''
})

// Validation
const validator = createValidator({
  email: {
    required: true,
    email: true
  }
})
const errors = reactive({})

// Timer pour le cooldown
let cooldownTimer = null

// Fonctions
const validateField = (field) => {
  const isValid = validator.validateField(field, formData[field])
  if (!isValid) {
    errors[field] = validator.getFieldError(field)
  } else {
    delete errors[field]
  }
}

const handleForgotPassword = async () => {
  // Valider le formulaire
  const isValid = validator.validate(formData)
  if (!isValid) {
    Object.assign(errors, validator.getErrors())
    return
  }

  try {
    isLoading.value = true
    error.value = ''
    success.value = ''

    const result = await authStore.forgotPassword(formData.email)

    if (result.success) {
      emailSent.value = true
      success.value = 'Email de réinitialisation envoyé !'
      startResendCooldown()
    } else {
      error.value = result.error || 'Erreur lors de l\'envoi de l\'email'
    }
  } catch (err) {
    console.error('Erreur mot de passe oublié:', err)
    error.value = 'Une erreur inattendue s\'est produite'
  } finally {
    isLoading.value = false
  }
}

const resendEmail = async () => {
  if (!formData.email) return

  try {
    isResending.value = true
    error.value = ''

    const result = await authStore.forgotPassword(formData.email)

    if (result.success) {
      success.value = 'Email de réinitialisation renvoyé !'
      startResendCooldown()
    } else {
      error.value = result.error || 'Erreur lors du renvoi de l\'email'
    }
  } catch (err) {
    console.error('Erreur lors du renvoi:', err)
    error.value = 'Erreur lors du renvoi de l\'email'
  } finally {
    isResending.value = false
  }
}

const startResendCooldown = () => {
  resendCooldown.value = 60 // 60 secondes
  
  cooldownTimer = setInterval(() => {
    resendCooldown.value--
    if (resendCooldown.value <= 0) {
      clearInterval(cooldownTimer)
      cooldownTimer = null
    }
  }, 1000)
}

// Lifecycle
onMounted(() => {
  // Si l'utilisateur est déjà connecté, rediriger
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})

onUnmounted(() => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer)
  }
})
</script>

<style scoped>
/* Page mot de passe oublié */
.forgot-password-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.forgot-container {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  padding: 3rem;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

/* En-tête */
.forgot-header {
  text-align: center;
  margin-bottom: 2rem;
}

.forgot-logo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #3b82f6;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.logo-icon {
  font-size: 2rem;
}

.logo-text {
  font-size: 1.5rem;
}

.forgot-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.forgot-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
}

/* Formulaire */
.forgot-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: #f9fafb;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background-color: white;
}

.form-input.error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.form-input.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* Messages */
.form-error {
  display: block;
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 0.25rem;
}

.form-error-general {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.form-success-general {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.5rem;
  color: #166534;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.error-icon,
.success-icon {
  font-size: 1rem;
}

/* Bouton */
.forgot-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
}

/* Info après envoi */
.email-sent-info {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.info-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
}

.info-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #166534;
  margin: 0 0 0.5rem 0;
}

.info-text {
  color: #15803d;
  margin: 0 0 0.5rem 0;
  font-weight: 500;
}

.info-subtext {
  color: #16a34a;
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Actions */
.forgot-actions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.back-to-login {
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s ease;
  text-align: center;
}

.back-to-login:hover {
  color: #3b82f6;
  text-decoration: underline;
}

.resend-section {
  text-align: center;
}

.resend-text {
  color: #6b7280;
  margin: 0 0 0.75rem 0;
  font-size: 0.875rem;
}

.resend-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
  margin: 0 auto;
}

/* Aide */
.forgot-help {
  text-align: left;
  background-color: #f9fafb;
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.help-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
}

.help-list {
  margin: 0;
  padding-left: 1.25rem;
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.6;
}

.help-list li {
  margin-bottom: 0.5rem;
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
@media (max-width: 640px) {
  .forgot-container {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }
  
  .forgot-title {
    font-size: 1.75rem;
  }
  
  .email-sent-info {
    flex-direction: column;
    text-align: center;
  }
}

/* Animations */
.forgot-container {
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
