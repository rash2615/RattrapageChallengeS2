<template>
  <div class="verify-email-page">
    <div class="container">
      <div class="verify-container">
        <!-- Logo et titre -->
        <div class="verify-header">
          <router-link to="/" class="verify-logo">
            <span class="logo-icon">⚡</span>
            <span class="logo-text">SPARK</span>
          </router-link>
          <h1 class="verify-title">Vérification de l'email</h1>
          <p class="verify-subtitle">
            Nous avons envoyé un lien de vérification à
            <strong class="email-address">{{ email }}</strong>
          </p>
        </div>

        <!-- Instructions -->
        <div class="verify-instructions">
          <div class="instruction-icon">📧</div>
          <div class="instruction-content">
            <h3 class="instruction-title">Vérifiez votre boîte email</h3>
            <p class="instruction-text">
              Cliquez sur le lien dans l'email que nous venons d'envoyer pour activer votre compte.
              Le lien est valide pendant 24 heures.
            </p>
          </div>
        </div>

        <!-- Vérification manuelle -->
        <div class="verify-manual">
          <h3 class="manual-title">Code de vérification</h3>
          <p class="manual-subtitle">
            Si vous avez reçu un code de vérification, saisissez-le ci-dessous :
          </p>
          
          <form @submit.prevent="handleVerifyCode" class="verify-form">
            <div class="code-input-group">
              <input
                v-model="verificationCode"
                type="text"
                class="code-input"
                :class="{ 'error': codeError }"
                placeholder="Code de vérification"
                maxlength="6"
                @input="formatCode"
              />
              <button
                type="submit"
                class="btn btn-primary verify-button"
                :disabled="isVerifying || verificationCode.length !== 6"
              >
                <span v-if="isVerifying" class="spinner"></span>
                <span v-else>Vérifier</span>
              </button>
            </div>
            <div v-if="codeError" class="form-error">{{ codeError }}</div>
          </form>
        </div>

        <!-- Actions -->
        <div class="verify-actions">
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
          
          <router-link to="/login" class="back-to-login">
            Retour à la connexion
          </router-link>
        </div>

        <!-- Aide -->
        <div class="verify-help">
          <h4 class="help-title">Vous ne recevez pas l'email ?</h4>
          <ul class="help-list">
            <li>Vérifiez votre dossier spam ou courrier indésirable</li>
            <li>Assurez-vous que l'adresse email est correcte</li>
            <li>Attendez quelques minutes, l'email peut prendre du temps à arriver</li>
            <li>Contactez notre support si le problème persiste</li>
          </ul>
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Router et store
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// État local
const email = ref('')
const verificationCode = ref('')
const isVerifying = ref(false)
const isResending = ref(false)
const resendCooldown = ref(0)
const error = ref('')
const success = ref('')
const codeError = ref('')

// Timer pour le cooldown
let cooldownTimer = null

// Fonctions
const formatCode = (event) => {
  // Garder seulement les chiffres
  verificationCode.value = event.target.value.replace(/\D/g, '')
  
  // Auto-soumettre si 6 chiffres
  if (verificationCode.value.length === 6) {
    handleVerifyCode()
  }
}

const handleVerifyCode = async () => {
  if (verificationCode.value.length !== 6) {
    codeError.value = 'Le code doit contenir 6 chiffres'
    return
  }

  try {
    isVerifying.value = true
    codeError.value = ''
    error.value = ''

    const result = await authStore.verifyEmail(verificationCode.value)

    if (result.success) {
      success.value = 'Email vérifié avec succès ! Redirection...'
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } else {
      codeError.value = result.error || 'Code de vérification invalide'
    }
  } catch (err) {
    console.error('Erreur de vérification:', err)
    codeError.value = 'Une erreur est survenue lors de la vérification'
  } finally {
    isVerifying.value = false
  }
}

const resendEmail = async () => {
  if (!email.value) return

  try {
    isResending.value = true
    error.value = ''

    // Simuler l'envoi d'email (à remplacer par l'appel API réel)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    success.value = 'Email de vérification renvoyé !'
    
    // Démarrer le cooldown
    startResendCooldown()
    
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
  // Récupérer l'email depuis l'URL
  email.value = route.query.email || ''
  
  if (!email.value) {
    router.push('/register')
  }
})

onUnmounted(() => {
  if (cooldownTimer) {
    clearInterval(cooldownTimer)
  }
})
</script>

<style scoped>
/* Page de vérification */
.verify-email-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.verify-container {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  padding: 3rem;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
}

/* En-tête */
.verify-header {
  margin-bottom: 2rem;
}

.verify-logo {
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

.verify-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.verify-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
}

.email-address {
  color: #3b82f6;
  font-weight: 600;
}

/* Instructions */
.verify-instructions {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
}

.instruction-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.instruction-content {
  flex: 1;
}

.instruction-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.instruction-text {
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

/* Vérification manuelle */
.verify-manual {
  background-color: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.manual-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #92400e;
  margin: 0 0 0.5rem 0;
}

.manual-subtitle {
  color: #a16207;
  margin: 0 0 1rem 0;
  font-size: 0.875rem;
}

.verify-form {
  max-width: 300px;
  margin: 0 auto;
}

.code-input-group {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.code-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
  letter-spacing: 0.1em;
  transition: all 0.2s ease;
  background-color: white;
}

.code-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.code-input.error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

.verify-button {
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  white-space: nowrap;
}

/* Actions */
.verify-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.resend-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-weight: 500;
}

.back-to-login {
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.back-to-login:hover {
  color: #3b82f6;
  text-decoration: underline;
}

/* Aide */
.verify-help {
  text-align: left;
  background-color: #f9fafb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1rem;
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

/* Messages */
.form-error {
  display: block;
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 0.25rem;
  text-align: left;
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
  .verify-container {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }
  
  .verify-title {
    font-size: 1.75rem;
  }
  
  .verify-instructions {
    flex-direction: column;
    text-align: center;
  }
  
  .code-input-group {
    flex-direction: column;
  }
  
  .verify-button {
    width: 100%;
  }
}

/* Animations */
.verify-container {
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
