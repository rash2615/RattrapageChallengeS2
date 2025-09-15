<template>
  <div class="login-page">
    <div class="container">
      <div class="login-container">
        <!-- Logo et titre -->
        <div class="login-header">
          <router-link to="/" class="login-logo">
            <span class="logo-icon">⚡</span>
            <span class="logo-text">SPARK</span>
          </router-link>
          <h1 class="login-title">Connexion</h1>
          <p class="login-subtitle">Accédez à votre compte SPARK</p>
        </div>

        <!-- Formulaire de connexion -->
        <form @submit.prevent="handleLogin" class="login-form">
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
                autocomplete="current-password"
                @blur="validateField('password')"
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
            <div v-if="errors.password" class="form-error">{{ errors.password }}</div>
          </div>

          <!-- Options -->
          <div class="form-options">
            <label class="checkbox-label">
              <input
                v-model="formData.rememberMe"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkbox-text">Se souvenir de moi</span>
            </label>
            <router-link to="/forgot-password" class="forgot-password-link">
              Mot de passe oublié ?
            </router-link>
          </div>

          <!-- Erreur générale -->
          <div v-if="error" class="form-error-general">
            <span class="error-icon">⚠️</span>
            {{ error }}
          </div>

          <!-- Bouton de connexion -->
          <button
            type="submit"
            class="btn btn-primary btn-lg login-button"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner"></span>
            <span v-else>Se connecter</span>
          </button>
        </form>

        <!-- Séparateur -->
        <div class="login-divider">
          <span class="divider-text">ou</span>
        </div>

        <!-- Connexion sociale (placeholder) -->
        <div class="social-login">
          <button class="btn btn-outline social-button" disabled>
            <span class="social-icon">📧</span>
            Connexion avec Google
          </button>
          <button class="btn btn-outline social-button" disabled>
            <span class="social-icon">📘</span>
            Connexion avec Facebook
          </button>
        </div>

        <!-- Lien d'inscription -->
        <div class="login-footer">
          <p class="login-footer-text">
            Pas encore de compte ?
            <router-link to="/register" class="register-link">
              Créer un compte
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
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
const error = ref('')

// Données du formulaire
const formData = reactive({
  email: '',
  password: '',
  rememberMe: false
})

// Validation
const validator = createValidator(schemas.userLogin)
const errors = reactive({})

// Fonctions
const validateField = (field) => {
  const isValid = validator.validateField(field, formData[field])
  if (!isValid) {
    errors[field] = validator.getFieldError(field)
  } else {
    delete errors[field]
  }
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  // Valider tous les champs
  const isValid = validator.validate(formData)
  if (!isValid) {
    Object.assign(errors, validator.getErrors())
    return
  }

  try {
    isLoading.value = true
    error.value = ''

    const result = await authStore.login({
      email: formData.email,
      password: formData.password
    })

    if (result.success) {
      // Rediriger vers la page demandée ou l'accueil
      const redirectTo = route.query.redirect || '/'
      router.push(redirectTo)
    } else {
      error.value = result.error || 'Erreur lors de la connexion'
    }
  } catch (err) {
    console.error('Erreur de connexion:', err)
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
/* Page de connexion */
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.login-container {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  padding: 3rem;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

/* En-tête */
.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-logo {
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

.login-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.login-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 1rem;
}

/* Formulaire */
.login-form {
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

/* Options du formulaire */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: #374151;
}

.checkbox-input {
  width: 1rem;
  height: 1rem;
  accent-color: #3b82f6;
}

.checkbox-text {
  user-select: none;
}

.forgot-password-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.forgot-password-link:hover {
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

/* Bouton de connexion */
.login-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
}

/* Séparateur */
.login-divider {
  position: relative;
  text-align: center;
  margin: 2rem 0;
}

.login-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #e5e7eb;
}

.divider-text {
  background-color: white;
  color: #6b7280;
  padding: 0 1rem;
  font-size: 0.875rem;
}

/* Connexion sociale */
.social-login {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.social-button {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  opacity: 0.6;
  cursor: not-allowed;
}

.social-icon {
  font-size: 1.25rem;
}

/* Pied de page */
.login-footer {
  text-align: center;
}

.login-footer-text {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.register-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.register-link:hover {
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
@media (max-width: 480px) {
  .login-container {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }
  
  .login-title {
    font-size: 1.75rem;
  }
  
  .form-options {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .social-login {
    gap: 0.5rem;
  }
}

/* Animations */
.login-container {
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
