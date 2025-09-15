<template>
  <div class="reset-password-page">
    <div class="container">
      <div class="reset-container">
        <!-- Logo et titre -->
        <div class="reset-header">
          <router-link to="/" class="reset-logo">
            <span class="logo-icon">⚡</span>
            <span class="logo-text">SPARK</span>
          </router-link>
          <h1 class="reset-title">Nouveau mot de passe</h1>
          <p class="reset-subtitle">
            Créez un nouveau mot de passe sécurisé pour votre compte
          </p>
        </div>

        <!-- Formulaire -->
        <form @submit.prevent="handleResetPassword" class="reset-form">
          <!-- Mot de passe -->
          <div class="form-group">
            <label for="password" class="form-label">Nouveau mot de passe</label>
            <div class="password-input-group">
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ 'error': errors.password }"
                placeholder="Votre nouveau mot de passe"
                required
                autocomplete="new-password"
                @blur="validateField('password')"
                @input="checkPasswordStrength"
              />
              <button
                type="button"
                class="password-toggle"
                @click="togglePassword"
                :title="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
              >
                <span class="toggle-icon">{{ showPassword ? '👁️' : '👁️‍🗨️' }}</span>
              </button>
            </div>
            
            <!-- Indicateur de force du mot de passe -->
            <div v-if="formData.password" class="password-strength">
              <div class="strength-bar">
                <div 
                  class="strength-fill" 
                  :class="passwordStrength.class"
                  :style="{ width: passwordStrength.width }"
                ></div>
              </div>
              <div class="strength-text" :class="passwordStrength.class">
                {{ passwordStrength.text }}
              </div>
            </div>
            
            <div v-if="errors.password" class="form-error">{{ errors.password }}</div>
          </div>

          <!-- Confirmation mot de passe -->
          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirmer le mot de passe</label>
            <div class="password-input-group">
              <input
                id="confirmPassword"
                v-model="formData.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ 'error': errors.confirmPassword }"
                placeholder="Confirmez votre nouveau mot de passe"
                required
                autocomplete="new-password"
                @blur="validateField('confirmPassword')"
              />
              <button
                type="button"
                class="password-toggle"
                @click="toggleConfirmPassword"
                :title="showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
              >
                <span class="toggle-icon">{{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}</span>
              </button>
            </div>
            <div v-if="errors.confirmPassword" class="form-error">{{ errors.confirmPassword }}</div>
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

          <!-- Bouton de réinitialisation -->
          <button
            type="submit"
            class="btn btn-primary btn-lg reset-button"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner"></span>
            <span v-else>Réinitialiser le mot de passe</span>
          </button>
        </form>

        <!-- Succès après réinitialisation -->
        <div v-if="passwordReset" class="reset-success">
          <div class="success-icon-large">✅</div>
          <h3 class="success-title">Mot de passe réinitialisé !</h3>
          <p class="success-text">
            Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </p>
          <router-link to="/login" class="btn btn-primary">
            Se connecter
          </router-link>
        </div>

        <!-- Actions -->
        <div class="reset-actions">
          <router-link to="/login" class="back-to-login">
            ← Retour à la connexion
          </router-link>
        </div>

        <!-- Aide -->
        <div class="reset-help">
          <h4 class="help-title">Conseils pour un mot de passe sécurisé</h4>
          <ul class="help-list">
            <li>Utilisez au moins 8 caractères</li>
            <li>Mélangez majuscules, minuscules et chiffres</li>
            <li>Ajoutez des caractères spéciaux (@, $, !, etc.)</li>
            <li>Évitez les informations personnelles</li>
            <li>Utilisez un mot de passe unique pour SPARK</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { createValidator, schemas } from '../utils/validation'

// Router et store
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// État local
const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const passwordReset = ref(false)
const error = ref('')
const success = ref('')

// Données du formulaire
const formData = reactive({
  password: '',
  confirmPassword: ''
})

// Validation
const validator = createValidator(schemas.passwordReset)
const errors = reactive({})

// Token de réinitialisation
const resetToken = ref('')

// Force du mot de passe
const passwordStrength = computed(() => {
  const password = formData.password
  if (!password) return { width: '0%', class: '', text: '' }

  let score = 0
  let feedback = []

  // Longueur
  if (password.length >= 8) score += 1
  else feedback.push('Au moins 8 caractères')

  // Majuscule
  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('Une majuscule')

  // Minuscule
  if (/[a-z]/.test(password)) score += 1
  else feedback.push('Une minuscule')

  // Chiffre
  if (/\d/.test(password)) score += 1
  else feedback.push('Un chiffre')

  // Caractère spécial
  if (/[@$!%*?&]/.test(password)) score += 1
  else feedback.push('Un caractère spécial')

  const percentage = (score / 5) * 100

  if (score <= 2) {
    return {
      width: `${percentage}%`,
      class: 'weak',
      text: 'Faible - ' + feedback.slice(0, 2).join(', ')
    }
  } else if (score <= 3) {
    return {
      width: `${percentage}%`,
      class: 'medium',
      text: 'Moyen - ' + feedback.slice(0, 1).join(', ')
    }
  } else {
    return {
      width: `${percentage}%`,
      class: 'strong',
      text: 'Fort'
    }
  }
})

// Fonctions
const validateField = (field) => {
  // Validation spéciale pour la confirmation du mot de passe
  if (field === 'confirmPassword') {
    if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas'
      return false
    }
  }

  const isValid = validator.validateField(field, formData[field])
  if (!isValid) {
    errors[field] = validator.getFieldError(field)
  } else {
    delete errors[field]
  }
  return isValid
}

const checkPasswordStrength = () => {
  // Déclencher la validation du mot de passe
  validateField('password')
  
  // Vérifier la confirmation si elle est remplie
  if (formData.confirmPassword) {
    validateField('confirmPassword')
  }
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const handleResetPassword = async () => {
  // Valider tous les champs
  const isValid = validator.validate(formData)
  if (!isValid) {
    Object.assign(errors, validator.getErrors())
    return
  }

  // Vérifier la confirmation du mot de passe
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas'
    return
  }

  try {
    isLoading.value = true
    error.value = ''
    success.value = ''

    const result = await authStore.resetPassword({
      token: resetToken.value,
      password: formData.password
    })

    if (result.success) {
      passwordReset.value = true
      success.value = 'Mot de passe réinitialisé avec succès !'
    } else {
      error.value = result.error || 'Erreur lors de la réinitialisation'
    }
  } catch (err) {
    console.error('Erreur de réinitialisation:', err)
    error.value = 'Une erreur inattendue s\'est produite'
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Récupérer le token depuis l'URL
  resetToken.value = route.query.token || ''
  
  if (!resetToken.value) {
    router.push('/forgot-password')
  }
  
  // Si l'utilisateur est déjà connecté, rediriger
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>

<style scoped>
/* Page de réinitialisation */
.reset-password-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.reset-container {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  padding: 3rem;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

/* En-tête */
.reset-header {
  text-align: center;
  margin-bottom: 2rem;
}

.reset-logo {
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

.reset-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.reset-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 1rem;
  line-height: 1.5;
}

/* Formulaire */
.reset-form {
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

/* Groupe mot de passe */
.password-input-group {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #6b7280;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: #374151;
}

.toggle-icon {
  font-size: 1.25rem;
}

/* Force du mot de passe */
.password-strength {
  margin-top: 0.5rem;
}

.strength-bar {
  width: 100%;
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-fill.weak {
  background-color: #ef4444;
}

.strength-fill.medium {
  background-color: #f59e0b;
}

.strength-fill.strong {
  background-color: #10b981;
}

.strength-text {
  font-size: 0.75rem;
  font-weight: 500;
}

.strength-text.weak {
  color: #ef4444;
}

.strength-text.medium {
  color: #f59e0b;
}

.strength-text.strong {
  color: #10b981;
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
.reset-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
}

/* Succès après réinitialisation */
.reset-success {
  text-align: center;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.75rem;
  padding: 2rem;
  margin-bottom: 2rem;
}

.success-icon-large {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.success-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #166534;
  margin: 0 0 1rem 0;
}

.success-text {
  color: #15803d;
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

/* Actions */
.reset-actions {
  text-align: center;
  margin-bottom: 2rem;
}

.back-to-login {
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.back-to-login:hover {
  color: #3b82f6;
  text-decoration: underline;
}

/* Aide */
.reset-help {
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
  .reset-container {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }
  
  .reset-title {
    font-size: 1.75rem;
  }
  
  .reset-success {
    padding: 1.5rem;
  }
  
  .success-icon-large {
    font-size: 2.5rem;
  }
  
  .success-title {
    font-size: 1.25rem;
  }
}

/* Animations */
.reset-container {
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
