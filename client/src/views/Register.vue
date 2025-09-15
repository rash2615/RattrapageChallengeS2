<template>
  <div class="register-page">
    <div class="container">
      <div class="register-container">
        <!-- Logo et titre -->
        <div class="register-header">
          <router-link to="/" class="register-logo">
            <span class="logo-icon">⚡</span>
            <span class="logo-text">SPARK</span>
          </router-link>
          <h1 class="register-title">Créer un compte</h1>
          <p class="register-subtitle">Rejoignez la communauté SPARK</p>
        </div>

        <!-- Formulaire d'inscription -->
        <form @submit.prevent="handleRegister" class="register-form">
          <!-- Prénom et nom -->
          <div class="form-row">
            <div class="form-group">
              <label for="firstName" class="form-label">Prénom</label>
              <input
                id="firstName"
                v-model="formData.firstName"
                type="text"
                class="form-input"
                :class="{ 'error': errors.firstName }"
                placeholder="Votre prénom"
                required
                autocomplete="given-name"
                @blur="validateField('firstName')"
              />
              <div v-if="errors.firstName" class="form-error">{{ errors.firstName }}</div>
            </div>
            <div class="form-group">
              <label for="lastName" class="form-label">Nom</label>
              <input
                id="lastName"
                v-model="formData.lastName"
                type="text"
                class="form-input"
                :class="{ 'error': errors.lastName }"
                placeholder="Votre nom"
                required
                autocomplete="family-name"
                @blur="validateField('lastName')"
              />
              <div v-if="errors.lastName" class="form-error">{{ errors.lastName }}</div>
            </div>
          </div>

          <!-- Email -->
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

          <!-- Mot de passe -->
          <div class="form-group">
            <label for="password" class="form-label">Mot de passe</label>
            <div class="password-input-group">
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ 'error': errors.password }"
                placeholder="Votre mot de passe"
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
            <input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              type="password"
              class="form-input"
              :class="{ 'error': errors.confirmPassword }"
              placeholder="Confirmez votre mot de passe"
              required
              autocomplete="new-password"
              @blur="validateField('confirmPassword')"
            />
            <div v-if="errors.confirmPassword" class="form-error">{{ errors.confirmPassword }}</div>
          </div>

          <!-- Acceptation des conditions -->
          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="formData.acceptTerms"
                type="checkbox"
                class="checkbox-input"
                :class="{ 'error': errors.acceptTerms }"
                required
                @change="validateField('acceptTerms')"
              />
              <span class="checkbox-text">
                J'accepte les 
                <a href="#" class="terms-link" @click.prevent="showTerms">conditions d'utilisation</a>
                et la 
                <a href="#" class="terms-link" @click.prevent="showPrivacy">politique de confidentialité</a>
              </span>
            </label>
            <div v-if="errors.acceptTerms" class="form-error">{{ errors.acceptTerms }}</div>
          </div>

          <!-- Newsletter -->
          <div class="form-group">
            <label class="checkbox-label">
              <input
                v-model="formData.newsletter"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkbox-text">
                Je souhaite recevoir les offres et nouveautés par email
              </span>
            </label>
          </div>

          <!-- Erreur générale -->
          <div v-if="error" class="form-error-general">
            <span class="error-icon">⚠️</span>
            {{ error }}
          </div>

          <!-- Bouton d'inscription -->
          <button
            type="submit"
            class="btn btn-primary btn-lg register-button"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner"></span>
            <span v-else>Créer mon compte</span>
          </button>
        </form>

        <!-- Lien de connexion -->
        <div class="register-footer">
          <p class="register-footer-text">
            Déjà un compte ?
            <router-link to="/login" class="login-link">
              Se connecter
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { createValidator, schemas } from '../utils/validation'

// Router et store
const router = useRouter()
const authStore = useAuthStore()

// État local
const isLoading = ref(false)
const showPassword = ref(false)
const error = ref('')

// Données du formulaire
const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
  newsletter: false
})

// Validation
const validator = createValidator(schemas.userRegistration)
const errors = reactive({})

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

const showTerms = () => {
  // TODO: Ouvrir modal avec les conditions d'utilisation
  console.log('Afficher les conditions d\'utilisation')
}

const showPrivacy = () => {
  // TODO: Ouvrir modal avec la politique de confidentialité
  console.log('Afficher la politique de confidentialité')
}

const handleRegister = async () => {
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

    const result = await authStore.register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      gdpr: {
        dataProcessingConsent: true,
        marketingConsent: formData.newsletter,
        analyticsConsent: true,
        consentDate: new Date().toISOString()
      }
    })

    if (result.success) {
      // Rediriger vers la page de vérification email
      router.push('/verify-email?email=' + encodeURIComponent(formData.email))
    } else {
      error.value = result.error || 'Erreur lors de l\'inscription'
    }
  } catch (err) {
    console.error('Erreur d\'inscription:', err)
    error.value = 'Une erreur inattendue s\'est produite'
  } finally {
    isLoading.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Si l'utilisateur est déjà connecté, rediriger
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>

<style scoped>
/* Page d'inscription */
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.register-container {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  padding: 3rem;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

/* En-tête */
.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-logo {
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

.register-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.register-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 1rem;
}

/* Formulaire */
.register-form {
  margin-bottom: 2rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
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

/* Checkbox */
.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
  line-height: 1.5;
}

.checkbox-input {
  width: 1rem;
  height: 1rem;
  accent-color: #3b82f6;
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.checkbox-input.error {
  accent-color: #ef4444;
}

.checkbox-text {
  user-select: none;
}

.terms-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.terms-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

/* Erreurs */
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

.error-icon {
  font-size: 1rem;
}

/* Bouton d'inscription */
.register-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
}

/* Pied de page */
.register-footer {
  text-align: center;
}

.register-footer-text {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.login-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.login-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
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
  .register-container {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }
  
  .register-title {
    font-size: 1.75rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

@media (max-width: 480px) {
  .register-container {
    padding: 1.5rem;
  }
}

/* Animations */
.register-container {
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
